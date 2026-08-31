import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const program = JSON.parse(readFileSync(join(root, "data", "running", "training-program.json"), "utf8"));

export function escapeICalText(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export function foldICalLine(line, maxOctets = 75) {
  const chunks = [];
  let current = "";
  let currentBytes = 0;
  let limit = maxOctets;

  for (const character of String(line)) {
    const characterBytes = Buffer.byteLength(character, "utf8");
    if (current && currentBytes + characterBytes > limit) {
      chunks.push(current);
      current = character;
      currentBytes = characterBytes;
      limit = maxOctets - 1;
    } else {
      current += character;
      currentBytes += characterBytes;
    }
  }
  chunks.push(current);
  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join("\r\n");
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function compactDateTime(date, time, extraMinutes = 0) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute + extraMinutes));
  return value.toISOString().replaceAll("-", "").replaceAll(":", "").slice(0, 15);
}

function localDateTime(date, time, extraMinutes = 0) {
  const compact = compactDateTime(date, time, extraMinutes);
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T${compact.slice(9, 11)}:${compact.slice(11, 13)}:${compact.slice(13, 15)}`;
}

function listLines(label, values) {
  return values?.length ? `${label}: ${values.join(" | ")}` : undefined;
}

function supportNotes(session) {
  if (session.type === "race") {
    return "Use only rehearsed carbohydrate, fluid, equipment, and caffeine choices; drink to thirst and follow event medical guidance. / 只使用已经演练过的碳水、补水、装备与咖啡因方案；按口渴补水并遵从赛事医疗指引。";
  }
  if (session.type === "long_run") {
    return "Recover with normal meals, carbohydrate, protein, fluid to thirst, and sleep; rehearse race fuel if the run exceeds 90 minutes. / 用正常饮食、碳水、蛋白质、按口渴补水和睡眠恢复；超过 90 分钟时演练比赛补给。";
  }
  if (session.type === "rest") {
    return "Prioritize sleep and sufficient energy availability; gentle mobility is optional only if it leaves you fresher. / 优先保证睡眠与充足能量供给；轻柔活动度仅在做完更清爽时可选。";
  }
  return "Resume normal meals and hydration; protect the next easy/recovery window and do not add hidden intensity. / 正常进食与补水；保护下一次轻松或恢复窗口，不额外叠加强度。";
}

export function calendarEventsForWeek(week, { calendarName = "Marathon Training" } = {}) {
  return week.sessions.map((session) => {
    const startTime = session.type === "rest" ? program.calendar.rest_start_time : program.calendar.default_start_time;
    const durationMinutes = Math.max(15, Math.round(session.duration_minutes ?? 30));
    const marker = `awesome-sports-ai-marathon:${session.date}`;
    const titleDistance = session.distance_km > 0 ? ` · ${session.distance_km} km` : "";
    const description = [
      marker,
      `Week ${week.week} · ${week.phase.label_en} / ${week.phase.label_zh}`,
      `Training goal / 训练目标: ${session.training_goal}`,
      `Intensity / 强度: ${session.intensity}`,
      listLines("Warm-up / 热身", session.warmup),
      listLines("Main set / 主训练", session.main),
      listLines("Cooldown / 放松", session.cooldown),
      `Completion standard / 完成标准: ${session.completion_standard}`,
      `Recovery and fuelling / 恢复与补给: ${session.recovery_and_fuelling ?? supportNotes(session)}`,
      listLines("Strength / 力量", session.strength),
      `Source anchors / 来源: ${session.source_ids.join(", ")}`
    ].filter(Boolean).join("\n");
    const identity = marker;
    return {
      uid: `marathon-${stableHash(identity)}@awesome-sports-ai`,
      marker,
      summary: `${session.title}${titleDistance}`,
      description,
      start_local: localDateTime(session.date, startTime),
      end_local: localDateTime(session.date, startTime, durationMinutes)
    };
  });
}

export function renderWeekIcs(week, options = {}) {
  const calendarName = options.calendarName ?? "Marathon Training";
  const events = calendarEventsForWeek(week, { calendarName });
  const stamp = `${program.meta.last_verified.replaceAll("-", "")}T000000Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${program.calendar.product_id}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICalText(calendarName)}`
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${event.start_local.replaceAll("-", "").replaceAll(":", "")}`,
      `DTEND:${event.end_local.replaceAll("-", "").replaceAll(":", "")}`,
      `SUMMARY:${escapeICalText(event.summary)}`,
      `DESCRIPTION:${escapeICalText(event.description)}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map((line) => foldICalLine(line)).join("\r\n")}\r\n`;
}

export function buildCalendarInstallPayload(week, { calendarName = "Marathon Training" } = {}) {
  return {
    calendar_name: calendarName,
    plan_week: week.week,
    events: calendarEventsForWeek(week, { calendarName })
  };
}

export const macOSInstallScript = `
function run(argv) {
  const calendarName = argv[0];
  const payload = JSON.parse(argv[1]);
  const app = Application("Calendar");
  app.activate();

  let matches = app.calendars.whose({ name: calendarName })();
  let calendar;
  if (matches.length > 0) {
    calendar = matches[0];
  } else {
    calendar = app.Calendar({ name: calendarName });
    app.calendars.push(calendar);
  }

  let created = 0;
  let updated = 0;
  payload.events.forEach((item) => {
    const existing = calendar.events().find((event) => {
      try {
        return String(event.description()).includes(item.marker);
      } catch (_) {
        return false;
      }
    });
    if (existing) {
      existing.summary = item.summary;
      existing.startDate = new Date(item.start_local);
      existing.endDate = new Date(item.end_local);
      existing.description = item.description;
      updated += 1;
    } else {
      calendar.events.push(app.Event({
        summary: item.summary,
        startDate: new Date(item.start_local),
        endDate: new Date(item.end_local),
        description: item.description
      }));
      created += 1;
    }
  });
  return JSON.stringify({ created: created, updated: updated });
}
`;

export function installWeekToMacCalendar(week, calendarName, {
  platform = process.platform,
  runner = spawnSync
} = {}) {
  if (platform !== "darwin") {
    throw new Error("Direct Calendar installation is available only on macOS; export an .ics file instead.");
  }
  if (!calendarName?.trim()) {
    throw new Error("Calendar name is required for installation.");
  }
  const payload = buildCalendarInstallPayload(week, { calendarName: calendarName.trim() });
  const result = runner(
    "osascript",
    ["-l", "JavaScript", "-e", macOSInstallScript, "--", calendarName.trim(), JSON.stringify(payload)],
    { encoding: "utf8" }
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Calendar installation failed: ${(result.stderr ?? "unknown error").trim()}`);
  }
  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    throw new Error(`Calendar installation returned an unexpected response: ${result.stdout.trim()}`);
  }
}
