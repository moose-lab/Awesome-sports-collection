const raceDistancesKm = {
  "5k": 5,
  "10k": 10,
  half: 21.0975,
  marathon: 42.195
};

const pick = (source, snake, camel) => source[snake] ?? source[camel];

export function parseDuration(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid duration: ${value}`);
  }

  const parts = value.trim().split(":").map(Number);
  if ((parts.length !== 2 && parts.length !== 3) || parts.some((part) => !Number.isInteger(part) || part < 0)) {
    throw new Error(`Invalid duration: ${value}. Use MM:SS or H:MM:SS.`);
  }

  const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, ...parts];
  if (minutes >= 60 || seconds >= 60 || (hours === 0 && minutes === 0 && seconds === 0)) {
    throw new Error(`Invalid duration: ${value}. Use MM:SS or H:MM:SS.`);
  }
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatDuration(totalSeconds) {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  if (hours === 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatPace(secondsPerKm) {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return undefined;
  }
  const rounded = Math.round(secondsPerKm);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}/km`;
}

export function projectRaceSeconds(sourceSeconds, sourceDistanceKm, targetDistanceKm = 42.195, exponent = 1.06) {
  if (![sourceSeconds, sourceDistanceKm, targetDistanceKm, exponent].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error("Race projection requires positive time, distance, target distance, and exponent values.");
  }
  return sourceSeconds * (targetDistanceKm / sourceDistanceKm) ** exponent;
}

export function buildPerformanceContext(input = {}) {
  const recentRace = pick(input, "recent_race", "recentRace")?.toLowerCase();
  const recentTimeValue = pick(input, "recent_time", "recentTime");
  const goalTimeValue = pick(input, "goal_time", "goalTime");

  if ((recentRace && !recentTimeValue) || (!recentRace && recentTimeValue)) {
    throw new Error("recent race and recent time must be provided together");
  }
  if (recentRace && !raceDistancesKm[recentRace]) {
    throw new Error(`Unknown recent race: ${recentRace}. Use one of: ${Object.keys(raceDistancesKm).join(", ")}`);
  }

  const recentSeconds = recentTimeValue ? parseDuration(recentTimeValue) : undefined;
  const goalSeconds = goalTimeValue ? parseDuration(goalTimeValue) : undefined;
  const estimatedMarathonSeconds = recentRace
    ? projectRaceSeconds(recentSeconds, raceDistancesKm[recentRace], 42.195)
    : undefined;

  let goalAssessment = goalSeconds ? "unverified" : "not-set";
  let goalGapPercent;
  if (goalSeconds && estimatedMarathonSeconds) {
    goalGapPercent = ((estimatedMarathonSeconds - goalSeconds) / estimatedMarathonSeconds) * 100;
    if (goalGapPercent <= 2) {
      goalAssessment = "aligned";
    } else if (goalGapPercent <= 6) {
      goalAssessment = "ambitious";
    } else {
      goalAssessment = "aggressive";
    }
  }

  const targetSeconds = goalSeconds ?? estimatedMarathonSeconds;
  return {
    recent_race: recentRace,
    recent_time_seconds: recentSeconds,
    recent_time_label: recentSeconds ? formatDuration(recentSeconds) : undefined,
    estimated_marathon_seconds: estimatedMarathonSeconds,
    estimated_marathon_label: estimatedMarathonSeconds ? formatDuration(estimatedMarathonSeconds) : undefined,
    estimate_method: estimatedMarathonSeconds ? "Riegel 1.06 planning estimate" : undefined,
    goal_time_seconds: goalSeconds,
    goal_time_label: goalSeconds ? formatDuration(goalSeconds) : undefined,
    goal_assessment: goalAssessment,
    goal_gap_percent: goalGapPercent === undefined ? undefined : Number(goalGapPercent.toFixed(1)),
    target_time_seconds: targetSeconds,
    target_pace_seconds_per_km: targetSeconds ? targetSeconds / 42.195 : undefined,
    target_pace_label: targetSeconds ? formatPace(targetSeconds / 42.195) : undefined,
    disclaimer: "Race projections are planning estimates, not a guarantee; marathon durability, course, weather, fuelling, and recent training can materially change the outcome.",
    source_id: "riegel-endurance-1981"
  };
}
