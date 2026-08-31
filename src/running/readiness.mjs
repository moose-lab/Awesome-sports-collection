import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const program = JSON.parse(readFileSync(join(root, "data", "running", "training-program.json"), "utf8"));

const booleanValue = (value) => value === true || value === "true" || value === "yes" || value === "1";

function boundedNumber(value, label, min, max) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be a number between ${min} and ${max}`);
  }
  return parsed;
}

export function assessReadiness(input = {}) {
  const sleepHours = boundedNumber(input.sleepHours ?? input.sleep_hours, "sleep hours", 0, 24);
  const soreness = boundedNumber(input.soreness, "soreness", 0, 10);
  const pain = boundedNumber(input.pain, "pain", 0, 10);
  const priorCompletion = boundedNumber(input.priorCompletion ?? input.prior_completion, "prior completion", 0, 100);
  const illness = booleanValue(input.illness);
  const redFlag = booleanValue(input.redFlag ?? input.red_flag);
  const painChangesGait = booleanValue(input.painChangesGait ?? input.pain_changes_gait);
  const assessed = [sleepHours, soreness, pain, priorCompletion].some((value) => value !== undefined)
    || illness
    || redFlag
    || painChangesGait;

  const redReasons = [];
  if (redFlag) redReasons.push("medical warning symptom reported");
  if (illness) redReasons.push("systemic illness or fever reported");
  if (painChangesGait) redReasons.push("pain changes gait");
  if (pain !== undefined && pain >= 4) redReasons.push(`pain ${pain}/10`);

  if (redReasons.length > 0) {
    return {
      status: "red",
      assessed,
      reasons: redReasons,
      ...program.readiness.red
    };
  }

  const yellowReasons = [];
  if (sleepHours !== undefined && sleepHours < 6.5) yellowReasons.push(`sleep ${sleepHours} h`);
  if (soreness !== undefined && soreness >= 5) yellowReasons.push(`soreness ${soreness}/10`);
  if (pain !== undefined && pain >= 1) yellowReasons.push(`pain ${pain}/10`);
  if (priorCompletion !== undefined && priorCompletion < 80) yellowReasons.push(`prior completion ${priorCompletion}%`);

  if (yellowReasons.length > 0) {
    return {
      status: "yellow",
      assessed,
      reasons: yellowReasons,
      ...program.readiness.yellow
    };
  }

  return {
    status: "green",
    assessed,
    reasons: assessed ? ["readiness inputs support the planned session"] : ["readiness not supplied; confirm before training"],
    ...program.readiness.green
  };
}
