# Marathon Coach Architecture

The marathon coach is a dependency-free Node.js pipeline that separates evidence, runner inputs, plan heuristics, readiness decisions, presentation, and external calendar mutation.

## Data Flow

```text
runner inputs
    ↓
profile normalization ──→ assumptions and warnings
    ↓
pace context ───────────→ labelled recent-race estimate and goal confidence
    ↓
phase + load planner ───→ complete 8–30 week plan
    ↓
selected week + readiness gate
    ├──→ bilingual Markdown
    ├──→ JSON
    └──→ RFC 5545 calendar preview
              ↓ explicit user confirmation only
        native connector, macOS Calendar, or portable .ics
```

## Components

| Path | Responsibility |
| --- | --- |
| `data/running/training-assets.json` | Auditable evidence registry with decision use and limitations |
| `data/running/athlete-taxonomy.json` | Runner levels, provisional defaults, race distances, age bands, weekdays |
| `data/running/training-program.json` | Plan limits, phase purpose, intensity anchors, readiness gates, safety, nutrition, pacing, calendar defaults |
| `src/running/pace.mjs` | Duration parsing, pace formatting, Riegel estimate, and goal-confidence label |
| `src/running/profile.mjs` | Input validation, conservative inference, availability, race-date resolution, assumptions, and warnings |
| `src/running/planner.mjs` | Phase allocation, weekly load curve, long-run gate, day roles, detailed prescriptions, race strategy, and readiness adaptation |
| `src/running/readiness.mjs` | Bounded green/yellow/red classification from sleep, soreness, pain, illness, gait, and completion |
| `src/running/assets.mjs` | Registry lookup, category summary, and source anchors |
| `src/running/renderer.mjs` | Complete-plan overview and detailed selected-week Markdown |
| `src/running/calendar.mjs` | RFC 5545 rendering, stable event markers, and duplicate-aware macOS install payload |
| `scripts/marathon-plan.mjs` | Thin command interface and output routing |

## Planner Invariants

- The plan contains 8–30 weeks and each week contains exactly seven dated sessions.
- Running occurs only on available days.
- A race replaces the long run in the final week; no running is scheduled after a midweek race.
- Hard sessions are separated by at least one non-hard day.
- Rest days remain explicit so both the athlete and Calendar see recovery as scheduled work.
- Weekly training distance reconciles with session distances; the marathon itself is labelled separately from training volume.
- The longest planned run is gated against the longest run in the previous four planned weeks, seeded by the athlete's recent 30-day longest run.
- Missing history creates visible assumptions rather than invented exactness.
- Race projections carry a method label, confidence category, and non-guarantee disclaimer.

## Readiness State

The base plan remains immutable. The selected week is cloned and adapted:

- Green keeps the prescription.
- Yellow applies the configured volume factor, converts hard running to easy running, and removes added strength.
- Red converts all running and racing to rest and retains the escalation message.

This is an operational coaching gate, not a medical or injury-prediction model. Numeric readiness inputs are bounded so malformed data cannot silently become a green result.

## Calendar Safety

The calendar path is preview-first:

1. Generate the detailed selected week.
2. Render the same week to `.ics` or show the seven-event install payload.
3. Obtain explicit approval for the exact week and calendar name.
4. Perform the live write.

The portable export uses RFC 5545 text escaping, UTF-8-aware 75-octet line folding, floating local times, stable UIDs, and seven VEVENT records. The macOS path uses a stable marker in each event description. A repeated install updates matching generated events and does not intentionally duplicate them.

Automated tests never call the live Calendar application. They use a fake process runner to verify the command, payload, and response parsing. A native calendar connector can replace the platform-specific installer when available and authorized, without changing plan generation.

## Extension Points

- Wearable imports can feed completed load and readiness without changing the planning contract.
- Threshold, critical-speed, or lab data can add pace anchors while retaining RPE fallback.
- Weather, course elevation, and aid-station data can refine race execution after live source verification.
- A persistent history store can re-plan future weeks from completed sessions; it must preserve the immutable audit trail for earlier weeks.
- Calendar backends can implement the same seven-event payload for other platforms.
