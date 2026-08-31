import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPerformanceContext } from "./pace.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const taxonomy = JSON.parse(readFileSync(join(root, "data", "running", "athlete-taxonomy.json"), "utf8"));
const program = JSON.parse(readFileSync(join(root, "data", "running", "training-program.json"), "utf8"));
const daySet = new Set(taxonomy.weekdays);

const defaultDays = {
  3: ["tuesday", "thursday", "sunday"],
  4: ["tuesday", "thursday", "saturday", "sunday"],
  5: ["monday", "tuesday", "thursday", "saturday", "sunday"],
  6: ["monday", "tuesday", "wednesday", "thursday", "saturday", "sunday"],
  7: [...taxonomy.weekdays]
};

const provisionalLongestRunKm = {
  beginner: 10,
  intermediate: 14,
  advanced: 18,
  competitive: 22
};

const pick = (source, ...keys) => keys.map((key) => source[key]).find((value) => value !== undefined);

function numberValue(value, label, { min = 0, max = Infinity, integer = false } = {}) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) {
    throw new Error(`${label} must be ${integer ? "an integer" : "a number"} between ${min} and ${max}`);
  }
  return parsed;
}

function parseDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    throw new Error(`${label} must use YYYY-MM-DD`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function parseAvailableDays(value) {
  if (!value) return undefined;
  const days = Array.isArray(value)
    ? value.map((day) => String(day).toLowerCase())
    : String(value).split(",").map((day) => day.trim().toLowerCase()).filter(Boolean);
  if (days.length === 0 || new Set(days).size !== days.length || days.some((day) => !daySet.has(day))) {
    throw new Error(`available days must be unique weekdays: ${taxonomy.weekdays.join(", ")}`);
  }
  return taxonomy.weekdays.filter((day) => days.includes(day));
}

function inferLevel(input, currentWeeklyKm, runDays) {
  const explicit = pick(input, "level");
  if (explicit) return String(explicit).toLowerCase();
  if (currentWeeklyKm >= 65 && runDays >= 5) return "competitive";
  if (currentWeeklyKm >= 45 && runDays >= 5) return "advanced";
  if (currentWeeklyKm >= 30 && runDays >= 4) return "intermediate";
  return "beginner";
}

function resolveAgeBand(age) {
  return age === undefined
    ? undefined
    : taxonomy.age_bands.find((band) => age >= band.min_age && age <= band.max_age);
}

export function resolveRunnerProfile(input = {}) {
  const assumptions = [];
  const warnings = [];
  const suppliedAvailableDays = parseAvailableDays(pick(input, "availableDays", "available_days"));
  const suppliedRunDays = numberValue(pick(input, "runDays", "run_days"), "run days", {
    min: program.plan_limits.run_days.min,
    max: program.plan_limits.run_days.max,
    integer: true
  });
  if (suppliedAvailableDays && suppliedRunDays && suppliedAvailableDays.length !== suppliedRunDays) {
    throw new Error("run days must match the number of available days");
  }

  const currentWeeklyInput = numberValue(pick(input, "currentWeeklyKm", "current_weekly_km"), "current weekly km", { min: 0, max: 300 });
  const preliminaryRunDays = suppliedAvailableDays?.length ?? suppliedRunDays ?? 5;
  const preliminaryLevel = inferLevel(input, currentWeeklyInput ?? 0, preliminaryRunDays);
  if (!taxonomy.levels[preliminaryLevel]) {
    throw new Error(`Unknown level: ${preliminaryLevel}. Use one of: ${Object.keys(taxonomy.levels).join(", ")}`);
  }
  const level = taxonomy.levels[preliminaryLevel];

  const startDateValue = pick(input, "startDate", "start_date") ?? formatDate(addDays(new Date(), (8 - new Date().getDay()) % 7 || 7));
  const startDate = parseDate(startDateValue, "start date");
  if (!pick(input, "startDate", "start_date")) assumptions.push(`start date defaults to ${formatDate(startDate)}`);

  const explicitWeeks = numberValue(pick(input, "weeks"), "weeks", {
    min: program.plan_limits.weeks.min,
    max: program.plan_limits.weeks.max,
    integer: true
  });
  const suppliedRaceDate = pick(input, "raceDate", "race_date");
  const raceDate = suppliedRaceDate ? parseDate(suppliedRaceDate, "race date") : undefined;
  let weeks = explicitWeeks;
  if (!weeks && raceDate) {
    const diffDays = Math.floor((raceDate - startDate) / 86400000);
    weeks = Math.ceil((diffDays + 1) / 7);
  }
  if (!weeks) {
    weeks = level.default_weeks;
    assumptions.push(`plan length defaults to ${weeks} weeks for ${preliminaryLevel}`);
  }
  if (weeks < program.plan_limits.weeks.min || weeks > program.plan_limits.weeks.max) {
    throw new Error(`weeks must be between ${program.plan_limits.weeks.min} and ${program.plan_limits.weeks.max}`);
  }

  const resolvedRaceDate = raceDate ?? addDays(startDate, weeks * 7 - 1);
  const raceWeekStart = addDays(startDate, (weeks - 1) * 7);
  const raceWeekEnd = addDays(raceWeekStart, 6);
  if (resolvedRaceDate < raceWeekStart || resolvedRaceDate > raceWeekEnd) {
    throw new Error("race date must fall inside the final plan week");
  }

  const runDays = suppliedAvailableDays?.length ?? suppliedRunDays ?? level.default_run_days;
  const availableDays = suppliedAvailableDays ?? defaultDays[runDays];
  if (!suppliedAvailableDays && !suppliedRunDays) assumptions.push(`running days default to ${runDays} days per week`);

  const longRunDayValue = String(pick(input, "longRunDay", "long_run_day") ?? (availableDays.includes("sunday") ? "sunday" : availableDays.at(-1))).toLowerCase();
  if (!daySet.has(longRunDayValue) || !availableDays.includes(longRunDayValue)) {
    throw new Error("long run day must be one of the available days");
  }

  const currentWeeklyKm = currentWeeklyInput ?? level.provisional_weekly_km;
  if (currentWeeklyInput === undefined) assumptions.push(`current weekly distance defaults to a provisional ${currentWeeklyKm} km`);
  const minimumWeeklyKm = runDays * 3 + 3;
  if (currentWeeklyKm < minimumWeeklyKm) {
    throw new Error(`current weekly km must be at least ${minimumWeeklyKm} km for ${runDays} running days; reduce frequency or complete a base-building block first`);
  }
  const longestRunInput = numberValue(pick(input, "longestRunKm", "longest_run_km"), "longest run km", { min: 5, max: 80 });
  const longestRunKm = longestRunInput ?? provisionalLongestRunKm[preliminaryLevel];
  if (longestRunInput === undefined) assumptions.push(`longest run defaults to a provisional ${longestRunKm} km`);
  if (longestRunKm > currentWeeklyKm) {
    throw new Error("longest run km cannot exceed current weekly km");
  }

  const peakWeeklyInput = numberValue(pick(input, "peakWeeklyKm", "peak_weekly_km"), "peak weekly km", { min: 0, max: 300 });
  const [levelPeakMin, levelPeakMax] = level.peak_weekly_km_range;
  const derivedPeak = currentWeeklyKm * (1 + Math.min(0.45, weeks * 0.025));
  const peakWeeklyKm = peakWeeklyInput ?? Math.max(currentWeeklyKm, Math.min(levelPeakMax, Math.max(levelPeakMin, derivedPeak)));
  if (peakWeeklyKm < minimumWeeklyKm) {
    throw new Error(`peak weekly km must be at least ${minimumWeeklyKm} km for ${runDays} running days`);
  }
  if (peakWeeklyKm < currentWeeklyKm) warnings.push("peak weekly distance is below current training; treat this as a consolidation or return-to-running plan");

  const age = numberValue(pick(input, "age"), "age", { min: 0, max: 120, integer: true });
  const ageBand = resolveAgeBand(age);
  if (age !== undefined && age < 18) warnings.push("athletes under 18 require qualified youth coaching and medical safeguards");
  if (weeks < 12) warnings.push("an 8-11 week plan assumes an established running base and leaves little time to correct missing durability");

  const performance = buildPerformanceContext({
    recentRace: pick(input, "recentRace", "recent_race"),
    recentTime: pick(input, "recentTime", "recent_time"),
    goalTime: pick(input, "goalTime", "goal_time")
  });
  if (performance.goal_assessment === "aggressive") warnings.push("goal pace is materially faster than the recent-race projection; use it as an aspiration, not the default prescription");

  return {
    level_key: preliminaryLevel,
    level,
    weeks,
    start_date: formatDate(startDate),
    race_date: formatDate(resolvedRaceDate),
    run_days: runDays,
    available_days: availableDays,
    long_run_day: longRunDayValue,
    current_weekly_km: currentWeeklyKm,
    longest_run_km: longestRunKm,
    peak_weekly_km: Number(peakWeeklyKm.toFixed(1)),
    peak_long_run_km: level.peak_long_run_km,
    age,
    age_band: ageBand?.label,
    age_coaching: ageBand?.coaching,
    performance,
    assumptions,
    warnings
  };
}

export function taxonomySummary() {
  return {
    levels: Object.keys(taxonomy.levels),
    recent_races: Object.keys(taxonomy.recent_race_distances_km),
    weekdays: taxonomy.weekdays
  };
}
