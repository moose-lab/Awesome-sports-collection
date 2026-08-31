---
name: marathon-coach
description: Build source-backed marathon training plans, daily and weekly running prescriptions, readiness adaptations, race pacing and fuelling strategies, and calendar-ready schedules for beginner through competitive amateur runners. Use for 马拉松训练计划, 跑步课表, marathon preparation, race pacing, taper, long-run progression, running recovery, or writing a running week to Calendar.
---

# Marathon Coach

Use this skill for adult road runners preparing for a marathon, from first-marathon pathways through high-level amateur performance. Generate an executable plan without presenting population evidence, pace estimates, or operational defaults as guarantees.

## Local Assets

Read these before changing the program or making evidence claims:

- `data/running/training-assets.json`: auditable professional source registry.
- `data/running/athlete-taxonomy.json`: level, age-band, race-distance, and weekday definitions.
- `data/running/training-program.json`: phases, intensity anchors, readiness rules, safety gates, race nutrition, and calendar defaults.
- `docs/marathon-professional-training-assets.md`: evidence-to-decision translation.
- `docs/marathon-coach-architecture.md`: data flow and calendar safety boundary.
- `scripts/marathon-plan.mjs`: tested plan, week, JSON, and calendar interface.

Refresh the public web when the user asks about current governing-body guidance, event rules, course details, weather, aid stations, or any source newer than the registry's `last_verified` date. Prefer governing bodies and peer-reviewed primary sources. Do not silently replace stored evidence with a blog or proprietary plan.

## Intake

Collect enough history to avoid invented precision. Make a clearly labelled provisional plan when non-critical inputs are missing.

High-value fields:

- Marathon date, plan start date, or requested number of weeks.
- Current weekly distance based on recently completed weeks, not aspiration.
- Longest run completed in the previous 30 days.
- Available running days and preferred long-run day.
- Recent 5K, 10K, half-marathon, or marathon result and date.
- Goal time, if any.
- Current pain, illness, warning symptoms, sleep, soreness, and prior-week completion.
- Relevant disease, pregnancy/postpartum status, major injury/surgery return, recurrent bone stress injury, or low-energy-availability concern.

Default only when needed:

- Infer level conservatively from completed weekly volume and frequency.
- Use the next Monday as the start date.
- Use the level's default duration and frequency.
- Label default current volume and longest run as provisional.
- Use RPE and talk test when no trustworthy pace anchor exists.

## Generate a Plan

Run from the repository root:

```bash
node scripts/marathon-plan.mjs \
  --level <beginner|intermediate|advanced|competitive> \
  --start-date <YYYY-MM-DD> \
  --weeks <8-30> \
  --current-weekly-km <km> \
  --longest-run-km <km> \
  --run-days <3-7> \
  --week <selected-week>
```

Add availability and performance when known:

```bash
node scripts/marathon-plan.mjs \
  --level advanced \
  --start-date 2026-09-07 \
  --weeks 16 \
  --current-weekly-km 55 \
  --longest-run-km 24 \
  --available-days monday,tuesday,thursday,saturday,sunday \
  --long-run-day sunday \
  --recent-race half \
  --recent-time 1:36:00 \
  --goal-time 3:20:00 \
  --week 6
```

The output must retain:

- The complete phase and weekly-volume overview.
- Seven dated days for the selected week, including rest days.
- Training goal, warm-up, main set, cooldown, RPE/talk-test anchor, completion standard, recovery/fuelling note, and source IDs.
- Assumptions, warnings, and the evidence boundary.
- A non-guaranteed race-time estimate and race strategy when performance data exist.

## Daily and Weekly Adaptation

Re-run the selected week with current inputs before prescribing hard work:

```bash
node scripts/marathon-plan.mjs \
  --start-date <YYYY-MM-DD> \
  --weeks <weeks> \
  --week <week> \
  --sleep-hours <hours> \
  --soreness <0-10> \
  --pain <0-10> \
  --prior-completion <0-100>
```

Use `--illness`, `--pain-changes-gait`, or `--red-flag` when reported.

- Green: retain the planned week.
- Yellow: reduce running by about 25%, replace hard sessions with easy running, remove strength additions, and reassess after recovery.
- Red: cancel planned running and racing. Recommend rest and qualified help when symptoms warrant it.

For the next week, use actual completed distance, longest recent run, session completion, and current readiness. Do not make up missed kilometres, stack hard days, or compensate for a failed session with a longer long run.

## Race Execution

- Use even effort and low pace variability as the default; do not bank time early.
- Treat Riegel output as a labelled estimate, not a prediction guarantee.
- Adjust pace for hills, wind, heat, congestion, and aid-station execution while protecting effort.
- Start fuelling early with products and doses rehearsed in long runs.
- Progress toward the stated carbohydrate range only as tolerated.
- Use thirst and individualized context for fluid intake; warn against drinking beyond losses.
- Make the 30-35 km decision from breathing, mechanics, fuelling, and control rather than emotion.

## Calendar Workflow

Preview the week before any Calendar write. Calendar writes are preview-first and opt-in.

1. Generate and show the selected week in Markdown.
2. If useful, create a portable preview:

```bash
node scripts/marathon-plan.mjs <profile arguments> --week <week> --format ics --output <path>.ics
```

3. Ask the user to confirm the named calendar and exact week.
4. Only after explicit confirmation, write directly on macOS:

```bash
node scripts/marathon-plan.mjs <profile arguments> --week <week> --install-calendar "Marathon Training"
```

Prefer a native calendar connector when one is available and authorized. Otherwise use the tested macOS path or deliver `.ics`. Stable markers update matching generated events instead of intentionally creating duplicates. Never install during automated tests.

## Evidence Boundaries

- Most work stays low intensity, but do not claim a universal 80/20 distribution.
- The default volume curve and level bands are operational heuristics, not biological laws.
- Do not claim a universal weekly 10% injury-prevention rule. The implementation separately gates the longest single run against the recent 30-day longest run and labels that threshold as observational.
- Strength may improve running economy, but preserve running quality and reduce strength fatigue near key sessions and taper.
- Use a roughly two-week taper by default for shorter plans and three weeks for longer plans; individual response can differ.
- Do not copy proprietary training plans.

## Safety

This skill is not medical advice. Stop training and recommend qualified assessment for chest pain, fainting, severe or unusual shortness of breath, neurological symptoms, acute swelling or suspected fracture, fever/systemic illness, or pain that changes gait.

Require appropriate professional supervision for athletes under 18; pregnancy/postpartum return; known cardiovascular, metabolic, or renal disease; return after major injury or surgery; recurrent bone stress injury; or persistent low-energy-availability/eating-disorder concerns.
