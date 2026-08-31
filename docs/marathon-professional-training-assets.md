# Marathon Coach Professional Training Assets

This asset set supports an AI coach for adult recreational runners progressing toward high amateur marathon performance. It covers training structure, intensity distribution, long-run progression, strength, taper, recovery, screening, nutrition, hydration, pacing, race estimation, and calendar interoperability.

The machine-readable registry is `data/running/training-assets.json`. It records each source's stable ID, title, direct URL, year, evidence type, decision use, limitations, and verification date. The registry was last verified on 2026-08-31.

## Evidence Policy

The source order is deliberate:

1. Governing-body and international consensus statements constrain safety, nutrition, hydration, and health decisions.
2. Systematic reviews and meta-analyses shape training structure while preserving uncertainty and population limits.
3. Primary observational studies and practice audits provide useful context but do not become universal causal laws.
4. Technical standards define export behavior rather than sport science.

The program does not encode a universal 80/20 split, universal weekly 10% progression rule, fixed heart-rate formula, guaranteed race prediction, or a copied proprietary plan.

## Governing-Body and Consensus Sources

| Source | Used for | Boundary |
| --- | --- | --- |
| [World Athletics: Nutrition for Athletics, 2019](https://worldathletics.org/download/download?filename=23fb9de0-6699-4d5b-b075-42f5da5518f5.pdf&urlslug=Nutrition+for+Athletics+-+2019+IAAF+Consensus+Statement) | Periodized nutrition and referral for persistent low-energy-availability concerns | Principles require individual translation; this is not a meal plan |
| [World Athletics: Contemporary Nutrition Strategies for Distance Runners, 2019](https://worldathletics.org/download/download?filename=6babe10a-9969-407e-b0cd-f7d96df50f51.pdf&urlslug=Contemporary%2BNutrition%2BStrategies%2Bto%2BOptimize%2BPerformance%2Bin%2BDistance%2BRunners%2Band%2BRace%2BWalkers) | Long-run gut training; rehearsed race carbohydrate and fluid strategy; 75–90 g/hour only as an upper range for the longest events | Not a starting dose; tolerance must be built progressively |
| [IOC REDs Consensus, 2023](https://bjsm.bmj.com/content/57/17/1073) | Prevent pairing rising training load with chronic under-fuelling; escalate persistent fatigue, bone injury, menstrual disruption, low libido, or deteriorating performance | The skill can flag concerns but cannot diagnose REDs |
| [ACSM Preparticipation Health Screening Update, 2015](https://pubmed.ncbi.nlm.nih.gov/26473759/) | Screen current activity, known disease, warning symptoms, and intended intensity before hard training | Screening guides clearance decisions; it does not prove marathon readiness |
| [Exercise-Associated Hyponatremia Consensus, 2015](https://bjsm.bmj.com/content/49/22/1432) | Default to thirst and warn against drinking beyond losses; sodium does not cancel overdrinking risk | Needs individual environmental, sweat, body-size, medication, and duration context |
| [Sleep and the Athlete Consensus, 2021](https://bjsm.bmj.com/content/55/7/356) | Use recent sleep disruption as one readiness signal and reduce stress when it coexists with fatigue or illness | Athlete sleep evidence has limitations; there is no single perfect threshold |
| [Recovery and Performance in Sport Consensus, 2018](https://pubmed.ncbi.nlm.nih.gov/29345524/) | Combine subjective and objective recovery signals and adjust to individual response | No single readiness metric predicts recovery or injury reliably |

## Systematic Reviews and Meta-Analyses

| Source | Used for | Boundary |
| --- | --- | --- |
| [Training Intensity Distribution Network Meta-Analysis, 2025](https://link.springer.com/article/10.1007/s40279-024-02149-3) | Keep most work low intensity; allow pyramidal or polarized emphasis by level and response | Small evidence base, women underrepresented, and outcomes were not marathon performance |
| [Strength Training and Running Economy Meta-Analysis, 2024](https://link.springer.com/article/10.1007/s40279-023-01978-y) | Add technically appropriate heavy, plyometric, or combined strength and reduce strength fatigue near key sessions/taper | Programs and athletes were heterogeneous; certainty ranged from moderate to low |
| [Effects of Tapering on Performance Meta-Analysis, 2007](https://pubmed.ncbi.nlm.nih.gov/17762369/) | Default to roughly two weeks with a substantial volume reduction while retaining short intensity and familiar frequency | Multi-sport competitive evidence; individuals and longer plans can require different tapers |
| [Training Determinants of Marathon Performance, 2020](https://pubmed.ncbi.nlm.nih.gov/31704026/) | Treat completed weekly volume, frequency, long-run preparation, and history as relevant inputs | Associations do not prove that increasing each input benefits every runner |
| [Running Injuries and Training Parameters Review, 2022](https://pubmed.ncbi.nlm.nih.gov/34478518/) | Reject one-factor injury claims; combine pain, recovery, lifestyle, and training history | Evidence was conflicting and injury definitions varied |
| [Pacing Strategies in Marathons Review, 2024](https://pubmed.ncbi.nlm.nih.gov/39281580/) | Prefer controlled, low-variability pacing adjusted for athlete, course, and environment | Mostly observational evidence; the optimal pattern is contextual |

## Primary and Practice Evidence

| Source | Used for | Boundary |
| --- | --- | --- |
| [Single-Session Running Spike Cohort, 2025](https://pubmed.ncbi.nlm.nih.gov/40623829/) | Flag a single planned run more than 10% longer than the longest run in the previous 30 days | Observational, self-reported overuse injury; the threshold is not a universal causal law |
| [Audit of 92 Sub-Elite Marathon Plans, 2024](https://pubmed.ncbi.nlm.nih.gov/38695978/) | Use volume bands and pyramidal practice as context | The audit explicitly does not prove plan effectiveness |
| [Large Marathon Pacing Analysis, 2026](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0352808) | Default to even effort, low variability, and a controlled first half | Boston data are observational and course-specific |
| [Marathon Pacing Ability and Experience, 2020](https://pubmed.ncbi.nlm.nih.gov/31671022/) | Use prior races and accumulated training to qualify goal-pace confidence | Small questionnaire-based and correlational cohort |
| [Riegel: Athletic Records and Human Endurance, 1981](https://pubmed.ncbi.nlm.nih.gov/7235349/) | Convert a recent race into a labelled time-distance planning estimate | Cannot represent individual marathon durability, weather, course, or fuelling |

## Technical Standard

| Source | Used for | Boundary |
| --- | --- | --- |
| [RFC 5545: iCalendar](https://www.rfc-editor.org/rfc/rfc5545) | Generate escaped, folded VEVENT records with stable UIDs, DTSTART, DTEND, SUMMARY, and DESCRIPTION | Calendar applications vary; live installation remains platform-specific and opt-in |

## Evidence-to-Program Translation

| Program decision | Implementation | Evidence status |
| --- | --- | --- |
| 8–30 week plan, 3–7 run days, four phases | `training-program.json`, `profile.mjs`, `planner.mjs` | Operational product limits; not physiological thresholds |
| Foundation → build → marathon-specific → taper | Phase allocator and phase-specific sessions | Evidence-informed periodization translated into a transparent heuristic |
| Mostly easy running with one or two separated quality sessions | Role scheduler and RPE/talk-test anchors | Supported directionally; no universal distribution claim |
| Long-run progression gated to recent history | Long-run curve compares with the previous 30-day longest run | Uses the 2025 observational signal conservatively and labels its limit |
| Cutback weeks and taper | Every fourth week is reduced; final two or three weeks taper | Operational structure plus taper evidence; individual response still governs |
| Strength one or two times weekly outside taper | Attached to easy/recovery days, never to hard days | Supported for economy; frequency and exercise selection remain coaching choices |
| Green/yellow/red readiness | Sleep, soreness, pain, illness, gait, and prior completion | Multi-signal operational gate; not a diagnosis or injury-prediction model |
| Race estimate and pacing | Riegel 1.06 estimate, confidence label, even-effort checkpoints | Estimate is explicitly non-guaranteed; race context can override pace |
| Carbohydrate and hydration | Duration-aware range, rehearsal rule, thirst/overdrinking warning | Consensus-backed boundaries, not an individualized medical prescription |
| Calendar output | Seven stable RFC 5545 events and duplicate-aware macOS payload | Standards-backed export; user confirmation required for live writes |

## Maintenance

- Check source reachability and material updates before changing a rule.
- Preserve `last_verified`, evidence type, decision use, and limitations for every source.
- Add new evidence only when it changes a decision or clarifies a boundary.
- Treat event-specific rules, weather, aid stations, and course profiles as live research rather than stable registry facts.
- Never interpret an inaccessible full text beyond the verified abstract, official summary, or accessible paper content.
