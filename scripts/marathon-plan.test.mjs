import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { assessReadiness } from "../src/running/readiness.mjs";
import { buildPerformanceContext, formatDuration, parseDuration, projectRaceSeconds } from "../src/running/pace.mjs";
import { adaptWeekForReadiness, allocatePhases, buildMarathonPlan } from "../src/running/planner.mjs";
import { resolveRunnerProfile } from "../src/running/profile.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const readJson = (...parts) => JSON.parse(readFileSync(join(root, ...parts), "utf8"));

test("running evidence registry is auditable and decision-oriented", () => {
  const registry = readJson("data", "running", "training-assets.json");
  const assets = Object.values(registry.categories).flat();

  assert.equal(registry.meta.last_verified, "2026-08-31");
  assert.ok(assets.length >= 16);
  assert.equal(new Set(assets.map((asset) => asset.id)).size, assets.length);

  for (const asset of assets) {
    assert.ok(asset.id);
    assert.ok(asset.title);
    assert.match(asset.url, /^https:\/\//);
    assert.ok(asset.year >= 1980 && asset.year <= 2026);
    assert.ok(asset.evidence_type);
    assert.ok(asset.decision_use.length >= 1);
    assert.ok(asset.limitations.length >= 1);
    assert.equal(asset.last_verified, "2026-08-31");
  }
});

test("running program contract exposes plan, readiness, and safety limits", () => {
  const program = readJson("data", "running", "training-program.json");
  const taxonomy = readJson("data", "running", "athlete-taxonomy.json");

  assert.deepEqual(program.plan_limits.weeks, { min: 8, max: 30 });
  assert.deepEqual(program.plan_limits.run_days, { min: 3, max: 7 });
  assert.deepEqual(Object.keys(program.phases), ["foundation", "build", "specific", "taper"]);
  assert.deepEqual(Object.keys(taxonomy.levels), ["beginner", "intermediate", "advanced", "competitive"]);
  assert.ok(program.readiness.red.stop_training);
  assert.ok(program.safety.red_flags.includes("chest pain"));
  assert.equal(program.calendar.default_start_time, "06:30");
});

test("parses race times and produces a labelled marathon estimate", () => {
  assert.equal(parseDuration("42:30"), 2550);
  assert.equal(parseDuration("1:36:00"), 5760);
  assert.equal(formatDuration(5760), "1:36:00");

  const projected = projectRaceSeconds(5760, 21.0975, 42.195);
  assert.ok(projected > 11900 && projected < 12100);

  const context = buildPerformanceContext({
    recent_race: "half",
    recent_time: "1:36:00",
    goal_time: "3:15:00"
  });

  assert.equal(context.estimate_method, "Riegel 1.06 planning estimate");
  assert.equal(context.goal_assessment, "ambitious");
  assert.match(context.disclaimer, /not a guarantee/i);
});

test("normalizes an advanced runner without inventing missing availability", () => {
  const profile = resolveRunnerProfile({
    level: "advanced",
    weeks: 16,
    startDate: "2026-09-07",
    currentWeeklyKm: 55,
    longestRunKm: 24,
    availableDays: "monday,tuesday,thursday,saturday,sunday",
    longRunDay: "sunday",
    recentRace: "half",
    recentTime: "1:36:00",
    goalTime: "3:20:00"
  });

  assert.equal(profile.level_key, "advanced");
  assert.equal(profile.run_days, 5);
  assert.deepEqual(profile.available_days, ["monday", "tuesday", "thursday", "saturday", "sunday"]);
  assert.equal(profile.long_run_day, "sunday");
  assert.equal(profile.assumptions.length, 0);
  assert.equal(profile.performance.goal_assessment, "aligned");
});

test("labels provisional defaults when the runner omits load history", () => {
  const profile = resolveRunnerProfile({
    level: "intermediate",
    startDate: "2026-09-07"
  });

  assert.equal(profile.weeks, 16);
  assert.equal(profile.current_weekly_km, 40);
  assert.ok(profile.assumptions.some((item) => item.includes("current weekly distance")));
  assert.ok(profile.assumptions.some((item) => item.includes("longest run")));
});

test("classifies readiness into green, yellow, and red actions", () => {
  assert.equal(assessReadiness({ sleepHours: 8, soreness: 2, pain: 0, priorCompletion: 100 }).status, "green");

  const yellow = assessReadiness({ sleepHours: 5.5, soreness: 6, pain: 1, priorCompletion: 70 });
  assert.equal(yellow.status, "yellow");
  assert.equal(yellow.volume_factor, 0.75);
  assert.equal(yellow.intensity_allowed, false);

  const red = assessReadiness({ pain: 5, painChangesGait: true });
  assert.equal(red.status, "red");
  assert.equal(red.volume_factor, 0);
  assert.equal(red.stop_training, true);
});

test("rejects readiness values outside the supported scales", () => {
  assert.throws(() => assessReadiness({ sleepHours: "not-a-number" }), /sleep hours/i);
  assert.throws(() => assessReadiness({ soreness: 11 }), /soreness/i);
  assert.throws(() => assessReadiness({ pain: -1 }), /pain/i);
  assert.throws(() => assessReadiness({ priorCompletion: 101 }), /prior completion/i);
});

test("allocates a complete foundation-build-specific-taper sequence", () => {
  const phases = allocatePhases(16);

  assert.equal(phases.length, 16);
  assert.deepEqual(phases.slice(0, 4), Array(4).fill("foundation"));
  assert.deepEqual(phases.slice(4, 10), Array(6).fill("build"));
  assert.deepEqual(phases.slice(10, 14), Array(4).fill("specific"));
  assert.deepEqual(phases.slice(14), Array(2).fill("taper"));
});

test("builds a source-aware 16-week plan that respects schedule and load gates", () => {
  const profile = resolveRunnerProfile({
    level: "advanced",
    weeks: 16,
    startDate: "2026-09-07",
    currentWeeklyKm: 55,
    longestRunKm: 24,
    availableDays: "monday,tuesday,thursday,saturday,sunday",
    longRunDay: "sunday",
    recentRace: "half",
    recentTime: "1:36:00",
    goalTime: "3:20:00"
  });
  const plan = buildMarathonPlan(profile);

  assert.equal(plan.weeks.length, 16);
  assert.equal(plan.weeks[0].sessions.length, 7);
  assert.ok(plan.weeks[0].long_run_km <= 26.4);
  assert.ok(plan.weeks.at(-1).weekly_training_km < plan.peak_weekly_km);
  assert.equal(plan.weeks.at(-1).phase_key, "taper");
  assert.ok(plan.weeks.at(-1).sessions.some((session) => session.type === "race" && session.distance_km === 42.195));

  for (const week of plan.weeks.slice(0, -1)) {
    const runSessions = week.sessions.filter((session) => session.distance_km > 0 && session.type !== "race");
    const runDays = runSessions.map((session) => session.day);
    assert.ok(runDays.every((day) => profile.available_days.includes(day)));
    assert.ok(Math.abs(runSessions.reduce((sum, session) => sum + session.distance_km, 0) - week.weekly_training_km) <= 0.6);

    const hardIndexes = week.sessions
      .map((session, index) => (session.load_class === "hard" ? index : -10))
      .filter((index) => index >= 0);
    assert.ok(hardIndexes.every((index, position) => position === 0 || index - hardIndexes[position - 1] > 1));
  }
});

test("adapts the selected week without rewriting the source plan", () => {
  const profile = resolveRunnerProfile({
    level: "advanced",
    weeks: 16,
    startDate: "2026-09-07",
    currentWeeklyKm: 55,
    longestRunKm: 24,
    availableDays: "monday,tuesday,thursday,saturday,sunday",
    longRunDay: "sunday"
  });
  const plan = buildMarathonPlan(profile);
  const sourceWeek = structuredClone(plan.weeks[6]);

  const yellow = adaptWeekForReadiness(sourceWeek, assessReadiness({ sleepHours: 5.5, soreness: 6 }));
  assert.ok(yellow.weekly_training_km < sourceWeek.weekly_training_km);
  assert.equal(yellow.sessions.some((session) => session.load_class === "hard"), false);
  assert.deepEqual(plan.weeks[6], sourceWeek);

  const redRaceWeek = adaptWeekForReadiness(plan.weeks.at(-1), assessReadiness({ redFlag: true }));
  assert.equal(redRaceWeek.sessions.some((session) => session.type === "race"), false);
  assert.equal(redRaceWeek.weekly_training_km, 0);
  assert.ok(redRaceWeek.sessions.every((session) => session.type === "rest"));
});

test("does not prescribe running after a midweek marathon", () => {
  const profile = resolveRunnerProfile({
    level: "intermediate",
    weeks: 16,
    startDate: "2026-09-07",
    raceDate: "2026-12-23",
    currentWeeklyKm: 40,
    longestRunKm: 18,
    runDays: 5
  });
  const raceWeek = buildMarathonPlan(profile).weeks.at(-1);
  const raceIndex = raceWeek.sessions.findIndex((session) => session.type === "race");
  assert.ok(raceIndex >= 0);
  assert.ok(raceWeek.sessions.slice(raceIndex + 1).every((session) => session.type === "rest"));
});
