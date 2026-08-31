# Spec: Marathon Coach Skill

## Objective

Build a source-backed AI road-running coach beside `skills/hyrox` and `skills/crossfit`. It must turn an adult runner's current training history, availability, recent performances, readiness, and marathon date into a configurable 8-30 week plan, a detailed daily prescription, an adaptive next-week revision, a race pacing/fuelling plan, and calendar-ready events.

The primary user is a recreational runner who wants to progress toward a high amateur marathon standard. The system must also provide conservative beginner and advanced/competitive pathways without presenting medical advice or guaranteeing a finish time.

## Assumptions

- The first release is a dependency-free Node.js CLI plus an agent-facing `SKILL.md`, matching the repository's HYROX/CrossFit pattern.
- The plan is for adults. Athletes under 18, pregnant/postpartum athletes, runners returning from a major injury, or athletes with relevant disease/symptoms require qualified professional supervision.
- Missing performance or load history produces a clearly labelled provisional plan, not invented precision.
- Calendar mutation is opt-in. The CLI can always generate RFC 5545 `.ics`; on macOS it can write events to a named Calendar only after the user explicitly requests installation.

## Commands

```bash
# Full plan or one selected week
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --current-weekly-km 45 --longest-run-km 18 --run-days 5
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --current-weekly-km 45 --longest-run-km 18 --run-days 5

# Performance-aware plan and race strategy
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --recent-race half --recent-time 1:36:00 --goal-time 3:20:00 --current-weekly-km 55 --longest-run-km 24 --level advanced

# Readiness adjustment
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --sleep-hours 5.5 --soreness 7 --pain 2 --prior-completion 70

# Calendar preview and export
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --format ics --output /tmp/marathon-week-6.ics

# Explicit macOS Calendar write after preview/approval
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --install-calendar "Marathon Training"

# Verification
node --test scripts/*.test.mjs
```

## Project Structure

```text
data/running/                 Structured source registry, taxonomy, and program rules
src/running/                  Profile, pace, planning, readiness, asset, and calendar logic
scripts/marathon-plan.mjs     CLI and output routing
scripts/marathon-plan.test.mjs
skills/marathon-coach/SKILL.md
docs/marathon-*.md            Evidence translation, architecture, and operating notes
```

## Code Style

Use dependency-free ES modules, pure functions for plan logic, snake_case keys in JSON, and explicit units in names.

```js
const weeklyKm = roundToHalf(profile.current_weekly_km * progressionFactor);
return { week, phase, weekly_km: weeklyKm, sessions };
```

## Testing Strategy

- Unit-test duration/pace parsing, race projection, phase allocation, readiness classification, long-run spike protection, and calendar escaping.
- Integration-test CLI output for beginner, intermediate, advanced, and competitive profiles.
- Verify a seven-day week respects available days, has no adjacent hard sessions, and includes recovery/rest.
- Verify the taper reduces volume while retaining a short intensity exposure.
- Verify aggressive goals and missing inputs are labelled rather than silently accepted.
- Verify `.ics` output contains seven dated events with stable UIDs and detailed prescriptions.
- Do not mutate the user's Calendar in automated tests; test the generated install payload and require an explicit runtime flag for the live write.

## Evidence and Decision Boundaries

- Prefer governing-body consensus statements, peer-reviewed systematic reviews/meta-analyses, and primary studies. Store title, URL/DOI, year, evidence type, decision use, limitations, and verification date.
- Do not encode a universal 80/20 split, universal 10% weekly progression rule, fixed heart-rate zone formula, or guaranteed race-time prediction.
- Use RPE/talk-test anchors by default. Use goal pace only when supplied; compare it with a recent-race projection when available and label the estimate.
- Treat single-session distance spikes, pain that changes gait, illness, and medical warning symptoms as load gates.
- Nutrition/hydration guidance must be rehearsed in training, individualized for tolerance/environment, and must warn against overdrinking.

## Boundaries

- Always: show assumptions, keep hard days separated, include recovery, explain phase/weekly intent, expose sources, and preserve user-unavailable days.
- Ask first: live Calendar installation, overwriting/replacing existing calendar events, or planning around a diagnosed condition/injury.
- Never: diagnose, prescribe medication, recommend racing through red-flag symptoms, guarantee outcomes, or copy proprietary training plans.

## Success Criteria

- `skills/marathon-coach/SKILL.md` routes intake, plan generation, daily coaching, adaptation, race strategy, and calendar actions.
- A structured asset registry contains professional training, nutrition, recovery, injury, pacing, and safety sources with explicit limitations.
- The CLI generates a coherent configurable 8-30 week plan and a detailed selected week for 3-7 running days.
- The plan respects current volume, longest recent run, availability, level, target date, and recent performance; it flags missing or aggressive inputs.
- Readiness inputs can keep, reduce, replace, or stop the day's work and can downshift the next week.
- The output contains training purpose, warm-up, main set, cooldown, intensity anchor, completion standard, recovery/fuelling note, and source anchors.
- Race output includes a non-guaranteed pacing strategy, checkpoint table, carbohydrate plan, and individualized hydration warning.
- The same selected week can be rendered to valid `.ics`; explicit macOS installation has a preview-first safety contract.
- Tests cover meaningful behavior and the full repository suite passes.

## Open Questions

- Live calendar connectors differ by Codex installation. The skill will prefer a native calendar connector when available and use the tested `.ics`/macOS path otherwise.
- Lab-derived thresholds, critical speed, and wearable history can improve precision later; the first release must remain useful without them and must not fabricate them.
