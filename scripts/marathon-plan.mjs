import { writeFileSync } from "node:fs";
import { renderAssetSummaryLines } from "../src/running/assets.mjs";
import { installWeekToMacCalendar, renderWeekIcs } from "../src/running/calendar.mjs";
import { adaptWeekForReadiness, buildMarathonPlan } from "../src/running/planner.mjs";
import { resolveRunnerProfile, taxonomySummary } from "../src/running/profile.mjs";
import { assessReadiness } from "../src/running/readiness.mjs";
import { renderMarathonPlanMarkdown } from "../src/running/renderer.mjs";

const booleanKeys = new Set([
  "help",
  "json",
  "list-assets",
  "list-levels",
  "illness",
  "pain-changes-gait",
  "red-flag"
]);

const valueKeys = new Set([
  "start-date",
  "race-date",
  "weeks",
  "week",
  "level",
  "current-weekly-km",
  "longest-run-km",
  "peak-weekly-km",
  "run-days",
  "available-days",
  "long-run-day",
  "recent-race",
  "recent-time",
  "goal-time",
  "age",
  "sleep-hours",
  "soreness",
  "pain",
  "prior-completion",
  "format",
  "output",
  "install-calendar"
]);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) throw new Error(`Unexpected argument: ${value}`);
    const key = value.slice(2);
    if (booleanKeys.has(key)) {
      args[key] = true;
      continue;
    }
    if (!valueKeys.has(key)) throw new Error(`Unknown option: --${key}`);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) throw new Error(`Missing value for --${key}`);
    args[key] = next;
    index += 1;
  }
  return args;
}

function profileInput(args) {
  return {
    startDate: args["start-date"],
    raceDate: args["race-date"],
    weeks: args.weeks,
    level: args.level,
    currentWeeklyKm: args["current-weekly-km"],
    longestRunKm: args["longest-run-km"],
    peakWeeklyKm: args["peak-weekly-km"],
    runDays: args["run-days"],
    availableDays: args["available-days"],
    longRunDay: args["long-run-day"],
    recentRace: args["recent-race"],
    recentTime: args["recent-time"],
    goalTime: args["goal-time"],
    age: args.age
  };
}

function readinessInput(args) {
  return {
    sleepHours: args["sleep-hours"],
    soreness: args.soreness,
    pain: args.pain,
    priorCompletion: args["prior-completion"],
    illness: args.illness,
    painChangesGait: args["pain-changes-gait"],
    redFlag: args["red-flag"]
  };
}

function selectedWeekNumber(args, plan) {
  if (args.week === undefined) return 1;
  const week = Number(args.week);
  if (!Number.isInteger(week) || week < 1 || week > plan.weeks.length) {
    throw new Error(`week must be an integer between 1 and ${plan.weeks.length}`);
  }
  return week;
}

function listLevels() {
  const taxonomy = taxonomySummary();
  return [
    "Marathon runner levels / 马拉松跑者等级",
    ...taxonomy.levels.map((level) => `- ${level}`),
    `Recent race inputs / 近期比赛: ${taxonomy.recent_races.join(", ")}`,
    `Weekdays / 星期: ${taxonomy.weekdays.join(", ")}`
  ].join("\n");
}

function usage() {
  return `Usage:
  node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --current-weekly-km 45 --longest-run-km 18 --run-days 5
  node scripts/marathon-plan.mjs --level advanced --start-date 2026-09-07 --weeks 16 --week 6 --recent-race half --recent-time 1:36:00 --goal-time 3:20:00
  node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --sleep-hours 5.5 --soreness 7 --pain 2 --prior-completion 70
  node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --format ics --output /tmp/marathon-week-6.ics
  node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --install-calendar "Marathon Training"
  node scripts/marathon-plan.mjs --list-assets
  node scripts/marathon-plan.mjs --list-levels

Formats: markdown, json, ics
Plan limits: 8-30 weeks, 3-7 running days per week
Calendar installation: macOS only; preview first, then use --install-calendar for an explicit write.
`;
}

function writeOrPrint(rendered, outputPath) {
  if (outputPath) {
    writeFileSync(outputPath, rendered);
    process.stdout.write(`Wrote ${outputPath}\n`);
  } else {
    process.stdout.write(rendered.endsWith("\n") ? rendered : `${rendered}\n`);
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(usage());
  } else if (args["list-assets"]) {
    process.stdout.write(`${renderAssetSummaryLines().join("\n")}\n`);
  } else if (args["list-levels"]) {
    process.stdout.write(`${listLevels()}\n`);
  } else {
    const profile = resolveRunnerProfile(profileInput(args));
    const plan = buildMarathonPlan(profile);
    const weekNumber = selectedWeekNumber(args, plan);
    const readiness = assessReadiness(readinessInput(args));
    const selectedWeek = adaptWeekForReadiness(plan.weeks[weekNumber - 1], readiness);
    const format = args.json ? "json" : (args.format ?? "markdown").toLowerCase();
    if (!["markdown", "json", "ics"].includes(format)) {
      throw new Error(`Unknown format: ${format}. Use markdown, json, or ics.`);
    }

    const rendered = format === "json"
      ? `${JSON.stringify({ plan, selected_week: selectedWeek }, null, 2)}\n`
      : format === "ics"
        ? renderWeekIcs(selectedWeek, { calendarName: args["install-calendar"] ?? "Marathon Training" })
        : renderMarathonPlanMarkdown(plan, selectedWeek);
    writeOrPrint(rendered, args.output);

    if (args["install-calendar"]) {
      const result = installWeekToMacCalendar(selectedWeek, args["install-calendar"]);
      process.stdout.write(`Calendar installed: ${result.created} created, ${result.updated} updated.\n`);
    }
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
