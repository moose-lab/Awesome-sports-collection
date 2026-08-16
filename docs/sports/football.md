# Football AI Scenario Guide

Football is already well represented in the catalog, but builders still need a scenario-first map from coaching, analysis, scouting, and media problems to usable tools.

## Guide Metadata

| Field | Value |
|-------|-------|
| Slug | football |
| Sport scope | Association football / soccer |
| Primary readers | Analysts, coaches, scouts, editors, match-report builders |
| Catalog tags to inspect | Soccer, data-ingestion, tracking, analytics-modeling, computer-vision, llm-nlp |
| Sports AI Hub route hint | `/sports/football` |

## Match Intelligence and Tactical Reporting

The problem: analysts need to turn match events and tracking concepts into readable tactical reports, not just raw tables.

Useful catalog resources:

- [football-match-intelligence](https://github.com/DataKnight1/football-match-intelligence) for pitch control, sprint efficiency, and tactical sequencing references.
- [StatsBomb Open Data](https://github.com/statsbomb/open-data) for public event data that can seed reproducible reports.
- [Kloppy](https://github.com/PySport/kloppy) for vendor-independent football event and tracking normalization.
- [socceraction](https://github.com/ML-KULeuven/socceraction) for SPADL conversion and action valuation.
- [mplsoccer](https://github.com/andrewRowlinson/mplsoccer) for pitch diagrams and football analytics plots.

Starter build:

- Input: event data, team names, match context, analyst prompt.
- Output: tactical brief, pitch map, key sequence table, and coach-ready summary.
- Prototype direction: `football-match-intelligence-report` in `/prototypes`.

## Scouting Board and Player Reports

The problem: scouts need repeatable player profiles that combine data, notes, comparable players, and clips without rebuilding the workflow each week.

Useful catalog resources:

- [football_scout_rag](https://github.com/yotambraun/football_scout_rag) for retrieval-augmented scouting report patterns.
- [soccerplots](https://github.com/slothfulwave/soccerplots) for radar and pizza charts.
- [socceraction](https://github.com/ML-KULeuven/socceraction) for action-value features.
- [OpenAI Whisper](https://github.com/openai/whisper) *(Cross-domain)* for transcribing scout voice notes, interviews, or analyst commentary.
- [Model Card Toolkit](https://github.com/tensorflow/model-card-toolkit) for documenting model scope and scouting-risk limitations.

Starter build:

- Input: player event rows, role filters, scout notes, optional clip transcript.
- Output: player card, similarity radar, strengths/risks summary, and report markdown.
- Prototype direction: `football-scouting-board` in `/prototypes`.

## Video Review and Event Alignment

The problem: coaches and analysts need to align video clips, possession events, and tactical notes into a review workflow.

Useful catalog resources:

- [SoccerNet](https://www.soccer-net.org/data) for soccer video understanding benchmarks.
- [SportsMOT](https://deeperaction.github.io/datasets/sportsmot.html) for multi-object tracking benchmark ideas across sports.
- [OpenCV](https://github.com/opencv/opencv) for frame extraction, overlays, and video preprocessing.
- [Roboflow Sports](https://github.com/roboflow/sports) for runnable player and ball tracking, team classification, and pitch-view projection workflows.
  - [Watch the 43-second product explainer](../media/roboflow-sports-explainer/roboflow-sports-explainer-zh.mp4) with Mandarin narration and Chinese captions.
- [ffmpeg-python](https://github.com/kkroening/ffmpeg-python) for clip generation and filtering.
- [Video Tagging Events](https://github.com/napo/videotaggingevents) for sports video tagging workflows.
- [FastF1](https://github.com/theOehrly/Fast-F1) *(Cross-domain)* for treating time windows and event timelines as inspectable session objects.

Starter build:

- Input: match video, event timestamps, possession labels, analyst tags.
- Output: clip index, possession timeline, review notes, and exportable coach packet.
- Prototype direction: `football-video-event-aligner` in `/prototypes`.

## Shot Quality and Decision Support

The problem: teams and creators need explainable shot-quality context, not only a black-box expected-goals score.

Useful catalog resources:

- [soccer_xg](https://github.com/ML-KULeuven/soccer_xg) for baseline expected-goals modeling.
- [StatsBomb Open Data](https://github.com/statsbomb/open-data) for public shot events.
- [mplsoccer](https://github.com/andrewRowlinson/mplsoccer) for shot maps.
- [TacticAI](https://www.nature.com/articles/s41467-024-45965-x) for a professional reference point around football tactical recommendations.
- [Google Research Football](https://github.com/google-research/football) for simulation and reinforcement-learning experiments.

Starter build:

- Input: shot event data, body part, situation, location, defensive context when available.
- Output: shot map, baseline xG estimate, feature explanation, and model card.
- Prototype direction: `football-shot-quality-explainer` in `/prototypes`.

## Cross-Domain Patterns to Study

- FastF1's session model can inspire football timeline tooling, even though the original sport is motorsport.
- OpenAI Whisper is not football-specific, but transcribed notes are useful for scouting, match review, and media workflows.
- SportsMOT spans multiple sports, so its tracking assumptions should be checked before applying them to football-specific spacing or possession analysis.

## Gaps: Tools Yet to be Built

- Football event-to-report generator: event feed plus match context -> tactical report with diagrams.
- Football scouting board: player rows plus notes -> role-aware scouting cards and similarity views.
- Football video-event aligner: match video plus event timestamps -> searchable coach-review clips.
- Football xG model card generator: shot data plus trained baseline -> explainable model card and caveats.
