import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { renderAssetSummaryLines } from "../src/running/assets.mjs";
import {
  buildCalendarInstallPayload,
  calendarEventsForWeek,
  escapeICalText,
  foldICalLine,
  installWeekToMacCalendar,
  macOSInstallScript,
  renderWeekIcs
} from "../src/running/calendar.mjs";
import { buildMarathonPlan } from "../src/running/planner.mjs";
import { resolveRunnerProfile } from "../src/running/profile.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const script = join(root, "scripts", "marathon-plan.mjs");

const advancedArgs = [
  "--level", "advanced",
  "--start-date", "2026-09-07",
  "--weeks", "16",
  "--current-weekly-km", "55",
  "--longest-run-km", "24",
  "--available-days", "monday,tuesday,thursday,saturday,sunday",
  "--long-run-day", "sunday",
  "--recent-race", "half",
  "--recent-time", "1:36:00",
  "--goal-time", "3:20:00"
];

function runCli(args) {
  return execFileSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

function fixtureWeek() {
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
  return buildMarathonPlan(profile).weeks[5];
}

test("lists an auditable marathon training asset registry", () => {
  const lines = renderAssetSummaryLines();
  assert.match(lines.join("\n"), /Marathon coach professional asset registry/);
  assert.match(lines.join("\n"), /Governing body and consensus: 7/);
  assert.match(lines.join("\n"), /Technical standards: 1/);
});

test("escapes and folds iCalendar text without breaking UTF-8 limits", () => {
  assert.equal(escapeICalText("A, B; C\\D\nE"), "A\\, B\\; C\\\\D\\nE");
  const folded = foldICalLine(`DESCRIPTION:${"马拉松训练".repeat(20)}`);
  assert.ok(folded.split("\r\n").every((line) => Buffer.byteLength(line, "utf8") <= 75));
  assert.match(folded, /\r\n /);
});

test("renders one stable RFC 5545 event for every day of a selected week", () => {
  const week = fixtureWeek();
  const first = renderWeekIcs(week, { calendarName: "Marathon Training" });
  const second = renderWeekIcs(week, { calendarName: "Marathon Training" });

  assert.equal(first, second);
  assert.match(first, /BEGIN:VCALENDAR\r\nVERSION:2\.0/);
  assert.equal((first.match(/BEGIN:VEVENT/g) ?? []).length, 7);
  assert.equal((first.match(/UID:/g) ?? []).length, 7);
  assert.match(first, /DTSTART:20261012T063000/);
  assert.match(first, /Training goal \/ 训练目标/);
  assert.match(first, /Source anchors \/ 来源/);
  assert.match(first, /END:VCALENDAR\r\n$/);
});

test("builds a deterministic duplicate-aware macOS Calendar install payload", () => {
  const week = fixtureWeek();
  const payload = buildCalendarInstallPayload(week, { calendarName: "Marathon Training" });
  assert.equal(payload.events.length, 7);
  assert.ok(payload.events.every((event) => event.marker.startsWith("awesome-sports-ai-marathon:")));

  const calls = [];
  const result = installWeekToMacCalendar(week, "Marathon Training", {
    platform: "darwin",
    runner(command, args, options) {
      calls.push({ command, args, options });
      return { status: 0, stdout: '{"created":7,"updated":0}', stderr: "" };
    }
  });
  assert.deepEqual(result, { created: 7, updated: 0 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, "osascript");
  assert.ok(calls[0].args.includes("Marathon Training"));
  assert.throws(() => installWeekToMacCalendar(week, "Marathon Training", { platform: "linux" }), /macOS/i);

  const revised = structuredClone(week);
  revised.sessions[0].role = "easy";
  revised.sessions[0].title = "Revised session / 调整课";
  const originalEvent = calendarEventsForWeek(week)[0];
  const revisedEvent = calendarEventsForWeek(revised)[0];
  assert.equal(revisedEvent.uid, originalEvent.uid);
  assert.equal(revisedEvent.marker, originalEvent.marker);
});

test("compiles the macOS Calendar automation without executing it", { skip: process.platform !== "darwin" }, () => {
  const directory = mkdtempSync(join(tmpdir(), "marathon-calendar-compile-"));
  const outputPath = join(directory, "installer.scpt");
  try {
    execFileSync("osacompile", ["-l", "JavaScript", "-e", macOSInstallScript, "-o", outputPath]);
    assert.ok(readFileSync(outputPath).length > 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("renders a detailed bilingual selected week and race strategy", () => {
  const output = runCli([...advancedArgs, "--week", "6"]);
  assert.match(output, /Marathon Training Plan \/ 马拉松训练计划/);
  assert.match(output, /Week 6 \/ 第 6 周/);
  assert.match(output, /Training goal \/ 训练目标/);
  assert.match(output, /Warm-up \/ 热身/);
  assert.match(output, /Completion standard \/ 完成标准/);
  assert.match(output, /Recovery and fuelling \/ 恢复与补给/);
  assert.match(output, /Race strategy \/ 比赛策略/);
  assert.match(output, /Source anchors \/ 来源/);
});

test("returns machine-readable plans and readiness-adjusted selected weeks", () => {
  const output = runCli([
    ...advancedArgs,
    "--week", "6",
    "--sleep-hours", "5.5",
    "--soreness", "6",
    "--json"
  ]);
  const parsed = JSON.parse(output);
  assert.equal(parsed.plan.generated_for.level, "advanced");
  assert.equal(parsed.selected_week.week, 6);
  assert.equal(parsed.selected_week.readiness.status, "yellow");
  assert.equal(parsed.selected_week.sessions.some((session) => session.load_class === "hard"), false);
});

test("produces materially different beginner and competitive pathways", () => {
  const beginner = JSON.parse(runCli([
    "--level", "beginner", "--start-date", "2026-09-07", "--weeks", "20",
    "--current-weekly-km", "25", "--longest-run-km", "10", "--run-days", "4", "--json"
  ]));
  const competitive = JSON.parse(runCli([
    "--level", "competitive", "--start-date", "2026-09-07", "--weeks", "20",
    "--current-weekly-km", "80", "--longest-run-km", "24", "--run-days", "6", "--json"
  ]));
  assert.equal(beginner.plan.generated_for.run_days, 4);
  assert.equal(competitive.plan.generated_for.run_days, 6);
  assert.ok(competitive.plan.peak_weekly_km > beginner.plan.peak_weekly_km + 30);
});

test("writes calendar previews without installing them", () => {
  const directory = mkdtempSync(join(tmpdir(), "marathon-calendar-test-"));
  const outputPath = join(directory, "week-6.ics");
  try {
    const output = runCli([...advancedArgs, "--week", "6", "--format", "ics", "--output", outputPath]);
    assert.match(output, /Wrote .*week-6\.ics/);
    const calendar = readFileSync(outputPath, "utf8");
    assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 7);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("rejects unsupported plan weeks and formats", () => {
  assert.throws(
    () => runCli(["--start-date", "2026-09-07", "--weeks", "4"]),
    /weeks must be/i
  );
  assert.throws(
    () => runCli(["--start-date", "2026-09-07", "--format", "html"]),
    /Unknown format/i
  );
});

test("documents and exposes the marathon coach as an agent skill", () => {
  const read = (path) => readFileSync(join(root, path), "utf8");
  const skill = read("skills/marathon-coach/SKILL.md");
  const readme = read("README.md");
  const evidence = read("docs/marathon-professional-training-assets.md");
  const architecture = read("docs/marathon-coach-architecture.md");

  assert.match(skill, /^---\nname: marathon-coach\ndescription:/);
  assert.match(skill, /preview.*Calendar/i);
  assert.match(skill, /readiness/i);
  assert.match(readme, /Marathon Training Agent/);
  assert.match(readme, /scripts\/marathon-plan\.mjs/);
  assert.match(evidence, /World Athletics/);
  assert.match(evidence, /RFC 5545/);
  assert.match(architecture, /preview-first/i);
});
