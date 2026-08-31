# Implementation Plan: Marathon Coach Skill

## Architecture Decisions

- Keep professional sources and programming rules in JSON so future agents can audit or refresh them without rewriting the CLI.
- Keep calculations in small ES modules and the CLI thin.
- Generate all seven days, including rest/recovery, so calendar output is executable rather than a list of run days only.
- Use pace/RPE confidence labels and a conservative readiness gate instead of false precision.
- Produce RFC 5545 `.ics` everywhere; expose macOS Calendar installation only through an explicit flag.

## Task List

### Phase 1: Evidence and contracts

- [ ] Add the professional source registry and evidence translation notes.
  - Acceptance: every planning rule used by the skill has a source or is labelled an operational heuristic.
  - Verify: JSON parses; source URLs and metadata are present.
- [ ] Add taxonomy/program contracts for levels, phases, intensity anchors, readiness, and safety.
  - Acceptance: beginner through competitive profiles and 8-30 week plans are representable.
  - Verify: contract tests reject unsupported ranges and unknown enum values.

### Phase 2: Profile, pace, and plan generation

- [ ] Implement duration/pace parsing, recent-race projection, goal comparison, and profile normalization test-first.
  - Acceptance: common time formats and 5K/10K/half/marathon inputs produce labelled estimates.
  - Verify: focused Node tests pass.
- [ ] Implement phase allocation, volume curve, seven-day scheduling, session prescriptions, and race strategy test-first.
  - Acceptance: available days are respected, hard days are separated, long-run progression is gated, and taper volume falls.
  - Verify: beginner and advanced fixture tests pass; weekly distance reconciles.
- [ ] Implement readiness adaptation test-first.
  - Acceptance: green retains, yellow reduces/replaces, red stops and escalates.
  - Verify: readiness matrix tests pass.

### Phase 3: Calendar and agent skill

- [ ] Implement Markdown, JSON, and RFC 5545 calendar output test-first.
  - Acceptance: a selected week yields seven detailed dated events with stable UIDs.
  - Verify: ICS parser-level invariants and escaping tests pass.
- [ ] Implement preview-first macOS Calendar installation.
  - Acceptance: no calendar write occurs without `--install-calendar`; install payload is deterministic and duplicate-aware.
  - Verify: unit tests use a fake runner; live Calendar is not mutated by tests.
- [ ] Add `skills/marathon-coach/SKILL.md`, architecture/evidence docs, and README discovery links.
  - Acceptance: an agent can perform intake, plan, adapt, race-plan, and calendar workflows from the skill instructions.
  - Verify: skill quick validation and repository link/guide tests pass.

### Phase 4: Forward verification

- [ ] Exercise realistic novice, intermediate, advanced, and low-readiness cases.
  - Acceptance: outputs are coherent, source-aware, and materially different where profiles differ.
  - Verify: CLI snapshots inspected; no red-flag plan prescribes hard running.
- [ ] Review correctness, readability, architecture, security, and performance.
  - Acceptance: no unresolved required findings; no secrets or unrelated changes.
  - Verify: full test suite, JSON parse, skill validator, diff audit, and git status.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| False precision in pace or load | High | Confidence labels, RPE fallback, explicit assumptions, source limitations |
| Injury/medical misuse | High | Intake screening, red flags, pain/gait gate, professional referral |
| Calendar duplication | Medium | Stable event IDs, plan marker, preview-first install, duplicate-aware updates |
| Source drift | Medium | `last_verified`, direct URLs/DOIs, refresh rules in `SKILL.md` |
| Overbuilt first release | Medium | Dependency-free modules and only the requested training/calendar paths |

## Checkpoints

- Evidence checkpoint: every encoded claim maps to the source registry or an explicit heuristic label.
- Core checkpoint: profile-to-week plan works for all four levels.
- Calendar checkpoint: seven events render without live mutation.
- Completion checkpoint: full tests and skill validation pass; target requirement audit has evidence for every item.
