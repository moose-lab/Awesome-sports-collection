# Awesome Sports AI

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: CC0-1.0](https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/moose-lab/awesome-sports-ai?style=social)](https://github.com/moose-lab/awesome-sports-ai/stargazers)

A curated collection of sports tools, platforms, datasets, APIs, and resources for people building, analyzing, coaching, operating, and covering sports.

This repository follows the [Awesome List](https://github.com/sindresorhus/awesome) style: entries should be useful, specific, actively reachable, and grouped into clear categories.

## Contents

- [Featured Now](#featured-now)
- [Sport Tags](#sport-tags)
- [Enterprise-to-Open-Source Decomposition](#enterprise-to-open-source-decomposition)
- [The Builder's Path](#the-builders-path)
- [HYROX Training Agent](#hyrox-training-agent)
- [CrossFit Training Agent](#crossfit-training-agent)
- [Marathon Training Agent](#marathon-training-agent)
- [Data, APIs, and Feeds](#data-apis-and-feeds)
- [Analytics and Visualization](#analytics-and-visualization)
- [Training and Performance](#training-and-performance)
- [Team and League Operations](#team-and-league-operations)
- [Fan Experience and Community](#fan-experience-and-community)
- [Media, Highlights, and Content](#media-highlights-and-content)
- [Developer Tools](#developer-tools)
- [Datasets and Research](#datasets-and-research)
- [Other Sports Collections](#other-sports-collections)
- [Contributing](#contributing)
- [License](#license)

## Featured Now

Generated event visuals live in [visualizations/](visualizations/). Regenerate them with `node scripts/generate-visualizations.mjs`.

Direct visualization tags: [NBA Finals 2026](visualizations/nba-finals-2026.svg) · [FIFA World Cup 2026](visualizations/fifa-world-cup-2026.svg)

[![NBA Finals 2026 schedule and stats visualization](visualizations/nba-finals-2026.svg)](visualizations/nba-finals-2026.svg)

[![FIFA World Cup 2026 visualization](visualizations/fifa-world-cup-2026.svg)](visualizations/fifa-world-cup-2026.svg)

## Sport Tags

Entries are grouped by use case and tagged by sport so contributors can keep one canonical placement while still making sport-specific tools easy to find.

V1 sport tags: `Soccer`, `Basketball`, `American Football`, `Baseball/Softball`, `Tennis/Racquet`, `Running/Track`, `Cycling`, `Swimming`, `Ice Hockey`, `Rugby`, `Cricket`, `Volleyball`, `Golf`, `Combat Sports`, `Motorsport`, `Esports`, `Multi-sport`.

Use `Multi-sport` for tools designed to work across many sports, generic APIs, infrastructure, visualization libraries, video tooling, and datasets not tied to one sport.

Example entry tags:

- [Example Basketball Tool](https://example.com) - Clear one-sentence description. _Sports: Basketball._
- [Example Match Analytics Tool](https://example.com) - Clear one-sentence description. _Sports: Soccer, Basketball._
- [Example Sports API](https://example.com) - Clear one-sentence description. _Sports: Multi-sport._

## Enterprise-to-Open-Source Decomposition

Professional sports teams use expensive AI, video, tracking, scouting, and athlete-performance systems that are hard for individual builders to access. This repository decomposes those enterprise capabilities into small mono-tools the open-source community can build.

See the [Enterprise-to-Open-Source Decomposition roadmap](docs/enterprise-to-open-source-decomposition.md) for the stack map and development roadmap.

## The Builder's Path

The magic is in the framing: this is not only a list of sports tools. It is a map for building the smaller pieces behind the tools professional teams use.

### Build Your Own xG Model

Want to build your own expected-goals model? Here are the mono-tools you need.

- [`public-data-loader`](https://github.com/statsbomb/open-data) - Load public shot event data into local files. _Sports: Soccer._
- [`match-event-schema`](https://github.com/PySport/kloppy) - Normalize shots, assists, body part, period, and game-state fields. _Sports: Soccer._
- [`shot-map-renderer`](https://github.com/andrewRowlinson/mplsoccer) - Visualize shot locations and outcomes. _Sports: Soccer._
- [`xg-baseline`](https://github.com/ML-KULeuven/soccer_xg) - Train a simple xG model from distance, angle, body part, and situation. _Sports: Soccer._
- [`model-card-md`](https://github.com/tensorflow/model-card-toolkit) - Document training data, assumptions, limitations, and evaluation results. _Sports: Multi-sport._

### Build Your Own Coaching Video Tagger

Want to build your own Sportscode-style review workflow? Here are the mono-tools you need.

- [`clip-cutter`](https://github.com/kkroening/ffmpeg-python) - Cut timestamp ranges from user-owned game footage. _Sports: Multi-sport._
- [`event-tagger`](https://github.com/napo/videotaggingevents) - Add keyboard-driven event labels to video timestamps. _Sports: Multi-sport._
- [`possession-timeline`](https://github.com/tryolabs/soccer-video-analytics) - Render tagged possessions and phases of play. _Sports: Soccer._
- [`coach-notes-exporter`](https://github.com/devinpleuler/analytics-handbook) - Export clips, tags, and notes to Markdown or CSV. _Sports: Soccer._
- [`highlight-captioner`](https://github.com/openai/whisper) - Draft short labels for review clips. _Sports: Multi-sport._

### Build Your Own Player Scouting Board

Want to build your own lightweight scouting platform? Here are the mono-tools you need.

- [`player-profile-schema`](https://github.com/ML-KULeuven/socceraction) - Store player bio, role, position, club, and competition context. _Sports: Soccer._
- [`public-data-loader`](https://github.com/swar/nba_api) - Load open player and match data into a shared format. _Sports: Basketball._
- [`player-similarity-radar`](https://github.com/slothfulwave/soccerplots) - Compare players with normalized role metrics. _Sports: Soccer._
- [`searchable-clip-index`](https://github.com/roboflow/sports) - Connect player notes to tagged video moments. _Sports: Multi-sport._
- [`scouting-report-template`](https://github.com/yotambraun/football_scout_rag) - Generate repeatable player reports for review. _Sports: Soccer._

### Build Your Own Athlete Load Dashboard

Want to build your own training-load monitor? Here are the mono-tools you need.

- [`wearable-csv-parser`](https://github.com/Alek050/databallpy) - Read athlete-owned GPS, heart-rate, or session-load files. _Sports: Soccer._
- [`team-id-resolver`](https://github.com/PySport/kloppy) - Normalize athlete, team, and session identifiers. _Sports: Soccer._
- [`acute-chronic-workload`](https://github.com/ale-uy/Acute_Chronic_Workload_Ratio) - Calculate short-window vs long-window load ratios. _Sports: Multi-sport._
- [`load-risk-flags`](https://github.com/SaxionAMI/AthleteLoadMonitor) - Highlight spikes, drops, and unusual workload patterns. _Sports: Multi-sport._
- [`training-load-dashboard`](https://github.com/prakashsellathurai/Coroebus) - Render weekly load, recovery, and trend charts. _Sports: Multi-sport._

### Build Your Own Match Intelligence Report

Want to build your own automated match report? Here are the mono-tools you need.

- [`fixture-normalizer`](https://github.com/eddwebster/football_analytics) - Convert schedule data into a shared match schema. _Sports: Soccer._
- [`match-event-schema`](https://github.com/ML-KULeuven/socceraction) - Normalize goals, shots, cards, substitutions, and possessions. _Sports: Soccer._
- [`win-probability-lite`](https://github.com/georgedouzas/sports-betting) - Estimate match-state pressure from score, time, and venue. _Sports: Multi-sport._
- [`stat-card-generator`](https://github.com/andrewRowlinson/mplsoccer) - Generate SVG cards for key moments and player stats. _Sports: Soccer._
- [`match-report-md`](https://github.com/DataKnight1/football-match-intelligence) - Generate a readable Markdown report from events and summary metrics. _Sports: Soccer._

## HYROX Training Agent

The `app/hyrox` workstream turns HYROX race research into a practical AI-agent skill for daily training plans, safety checks, movement-standard reminders, and race-prep notes.

- [HYROX professional training assets](docs/hyrox-professional-training-assets.md) - Official race references, rulebooks, training partners, science, videos, blogs, and podcasts. _Sports: Multi-sport, Running/Track._
- [HYROX agent skill plan](docs/hyrox-agent-skill-plan.md) - Implementation roadmap for a daily training-plan agent from casual starter to elite pathway. _Sports: Multi-sport, Running/Track._
- [HYROX skill architecture](docs/hyrox-skill-architecture.md) - File organization for profile-aware planning, HYROX divisions, and HTML visualization output. _Sports: Multi-sport, Running/Track._
- [`skills/hyrox/SKILL.md`](skills/hyrox/SKILL.md) - Agent workflow for level-aware HYROX training guidance. _Sports: Multi-sport, Running/Track._
- [`hyrox-day-plan`](scripts/hyrox-day-plan.mjs) - Local CLI that renders a daily HYROX plan by level/week/day or by start date, and lists the professional training asset registry. _Sports: Multi-sport, Running/Track._

Try it locally:

```bash
node scripts/hyrox-day-plan.mjs --level recreational --week 6 --day tuesday
```

Personalized HTML output:

```bash
node scripts/hyrox-day-plan.mjs --division pro --sex men --age-group 30-34 --experience veteran --start-date 2026-06-10 --date 2026-06-10 --format html --output /tmp/hyrox-plan.html
```

Asset registry summary:

```bash
node scripts/hyrox-day-plan.mjs --list-assets
```

## CrossFit Training Agent

The `app/crossfit` workstream turns CrossFit methodology, Chinese creator-note themes, and public coach/athlete references into a practical AI-agent skill for daily class-style training plans, scaling paths, limiter checks, and Open-prep notes.

- [CrossFit professional training assets](docs/crossfit-professional-training-assets.md) - Official CrossFit methodology, the user-supplied Xiaohongshu source map, professional/athlete video sources, and safety references. _Sports: Multi-sport, Running/Track._
- [CrossFit Xiaohongshu analysis](docs/crossfit-xiaohongshu-analysis.md) - Reproducible profile/search evidence, creator-note themes, and current extraction limits for the Chinese source layer. _Sports: Multi-sport._
- [CrossFit overseas source analysis](docs/crossfit-overseas-source-analysis.md) - How official CrossFit, YouTube, professional coach, athlete, and safety sources translate into agent programming rules. _Sports: Multi-sport._
- [CrossFit agent skill plan](docs/crossfit-agent-skill-plan.md) - Implementation roadmap for a daily CrossFit training-plan agent from beginner to competitive pathway. _Sports: Multi-sport._
- [CrossFit skill architecture](docs/crossfit-skill-architecture.md) - File organization for profile-aware planning, scaling paths, and HTML visualization output. _Sports: Multi-sport._
- [`skills/crossfit/SKILL.md`](skills/crossfit/SKILL.md) - Agent workflow for level-aware CrossFit training guidance. _Sports: Multi-sport._
- [`crossfit-day-plan`](scripts/crossfit-day-plan.mjs) - Local CLI that renders a daily CrossFit plan by level/week/day or by start date, and lists the training asset registry. _Sports: Multi-sport._

Try it locally:

```bash
node scripts/crossfit-day-plan.mjs --level recreational --week 1 --day wednesday
```

Personalized HTML output:

```bash
node scripts/crossfit-day-plan.mjs --goal open_prep --equipment affiliate --experience veteran --limiter gymnastics --start-date 2026-06-10 --date 2026-06-10 --format html --output /tmp/crossfit-plan.html
```

Asset registry summary:

```bash
node scripts/crossfit-day-plan.mjs --list-assets
```

## Marathon Training Agent

The marathon workstream turns professional running evidence into a configurable 8–30 week AI-coach skill for beginner through competitive amateur runners. It generates a complete phase plan, detailed daily and weekly prescriptions, readiness-based adaptations, a non-guaranteed pacing/fuelling strategy, portable `.ics`, and an explicit macOS Calendar write path.

- [Marathon professional training assets](docs/marathon-professional-training-assets.md) - Governing-body guidance, systematic reviews, primary studies, practice evidence, limitations, and evidence-to-program decisions. _Sports: Running/Track._
- [Marathon coach specification](docs/marathon-coach-spec.md) - Product contract, inputs, safety boundaries, commands, tests, and success criteria. _Sports: Running/Track._
- [Marathon coach architecture](docs/marathon-coach-architecture.md) - Profile, pace, plan, readiness, rendering, and preview-first calendar data flow. _Sports: Running/Track._
- [`skills/marathon-coach/SKILL.md`](skills/marathon-coach/SKILL.md) - Agent workflow for intake, multi-week planning, daily adaptation, race execution, and calendar actions. _Sports: Running/Track._
- [`marathon-plan`](scripts/marathon-plan.mjs) - Local CLI for Markdown/JSON training plans, detailed selected weeks, `.ics` previews, and explicit macOS Calendar installation. _Sports: Running/Track._

Generate a detailed selected week:

```bash
node scripts/marathon-plan.mjs --level advanced --start-date 2026-09-07 --weeks 16 --current-weekly-km 55 --longest-run-km 24 --recent-race half --recent-time 1:36:00 --goal-time 3:20:00 --week 6
```

Apply a readiness adjustment:

```bash
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --sleep-hours 5.5 --soreness 7 --pain 2 --prior-completion 70
```

Preview a calendar week:

```bash
node scripts/marathon-plan.mjs --start-date 2026-09-07 --weeks 16 --week 6 --format ics --output /tmp/marathon-week-6.ics
```

Inspect the evidence registry:

```bash
node scripts/marathon-plan.mjs --list-assets
```

## Data, APIs, and Feeds

Tools and services for sports schedules, scores, fixtures, rosters, odds, play-by-play data, stats, and live feeds.

- [balldontlie](https://www.balldontlie.io/) - Provides API access to basketball teams, players, games, and box-score data. _Sports: Basketball._
- [CollegeFootballData](https://collegefootballdata.com/) - Provides college football API endpoints for games, drives, plays, rankings, ratings, and recruiting data. _Sports: American Football._
- [FastF1](https://github.com/theOehrly/Fast-F1) - Loads Formula 1 timing, telemetry, session, schedule, and weather data in Python. _Sports: Motorsport._
- [football.json](https://github.com/openfootball/football.json) - Provides public-domain football match data in JSON for schedules, leagues, clubs, and results. _Sports: Soccer._
- [Kloppy](https://github.com/PySport/kloppy) - Standardizes soccer tracking and event data into vendor-independent Python objects. _Sports: Soccer._
- [nba_api](https://github.com/swar/nba_api) - Provides a Python client for NBA.com stats endpoints and basketball data workflows. _Sports: Basketball._
- [statsbombpy](https://github.com/statsbomb/statsbombpy) - Streams StatsBomb soccer data into Python for analysis and modeling. _Sports: Soccer._

## Analytics and Visualization

Tools for scouting, performance analysis, dashboards, data visualization, modeling, and sports intelligence workflows.

- [football-match-intelligence](https://github.com/DataKnight1/football-match-intelligence) - Builds football match intelligence dashboards with pitch control, sprint efficiency, and tactical sequencing. _Sports: Soccer._
- [mplsoccer](https://github.com/andrewRowlinson/mplsoccer) - Draws soccer pitches and common football analytics plots with Matplotlib. _Sports: Soccer._
- [Roboflow Sports](https://github.com/roboflow/sports) - Provides computer-vision examples, models, and workflows for sports detection, tracking, and analytics. _Sports: Multi-sport._
- [Second Spectrum](https://www.geniussports.com/newsroom/genius-sports-second-spectrum-tracking-technology-approved-by-fifa-quality-programme-for-epts/) - Provides optical tracking, tactical analytics, and augmented broadcast tools for professional leagues and teams. _Sports: Basketball, Soccer._
- [soccer_xg](https://github.com/ML-KULeuven/soccer_xg) - Trains and analyzes expected-goals models for soccer. _Sports: Soccer._
- [socceraction](https://github.com/ML-KULeuven/socceraction) - Converts soccer event streams to SPADL and values actions with VAEP or xT. _Sports: Soccer._
- [soccerplots](https://github.com/slothfulwave/soccerplots) - Creates radar and pizza charts for football player analysis. _Sports: Soccer._
- [sportypy](https://github.com/sportsdataverse/sportypy) - Draws regulation playing surfaces for several sports in Python. _Sports: Multi-sport._
- [TacticAI](https://www.nature.com/articles/s41467-024-45965-x) - Describes a football tactics assistant for predicting and generating corner-kick tactical recommendations. _Sports: Soccer._

## Training and Performance

Tools for coaching, athlete development, strength and conditioning, recovery, wellness, biomechanics, and wearable data.

- [Acute_Chronic_Workload_Ratio](https://github.com/ale-uy/Acute_Chronic_Workload_Ratio) - Calculates acute-to-chronic workload ratios in Python. _Sports: Multi-sport._
- [AthleteLoadMonitor](https://github.com/SaxionAMI/AthleteLoadMonitor) - Monitors and predicts athlete load for team-sport coaches. _Sports: Multi-sport._
- [Coroebus](https://github.com/prakashsellathurai/Coroebus) - Tracks training load, fitness, fatigue, and readiness for athletes. _Sports: Multi-sport._
- [databallpy](https://github.com/Alek050/databallpy) - Reads, preprocesses, visualizes, and synchronizes soccer event and tracking data. _Sports: Soccer._
- [CrossFit Daily Plan CLI](scripts/crossfit-day-plan.mjs) - Renders level-aware class-style CrossFit sessions with intended stimulus and scaling paths. _Sports: Multi-sport._
- [HYROX Training Agent assets](docs/hyrox-professional-training-assets.md) - Curates official HYROX rules, training partners, science, videos, blogs, and podcasts for AI-agent training plans. _Sports: Multi-sport, Running/Track._
- [HYROX Daily Plan CLI](scripts/hyrox-day-plan.mjs) - Renders level-aware daily HYROX sessions from structured program data. _Sports: Multi-sport, Running/Track._
- [Marathon Coach Skill](skills/marathon-coach/SKILL.md) - Generates source-backed multi-week marathon plans, readiness adaptations, race strategy, and calendar-ready weeks. _Sports: Running/Track._
- [Marathon Plan CLI](scripts/marathon-plan.mjs) - Renders configurable marathon plans and exports selected weeks to JSON or RFC 5545 calendar events. _Sports: Running/Track._
- [MMPose](https://github.com/open-mmlab/mmpose) - Provides an open-source pose estimation toolbox for biomechanics and movement analysis. _Sports: Multi-sport._
- [OpenPose](https://github.com/CMU-Perceptual-Computing-Lab/openpose) - Detects real-time multi-person body, hand, face, and foot keypoints. _Sports: Multi-sport._

## Team and League Operations

Tools for scheduling, registration, payments, tournament management, club administration, facilities, ticketing, and operations.

- [bracket](https://github.com/evroon/bracket) - Provides a self-hosted tournament system for creating and managing brackets. _Sports: Multi-sport._
- [Challonge API](https://api.challonge.com/) - Lets developers create tournaments, update brackets, and report scores programmatically. _Sports: Multi-sport._
- [Competition Factory](https://github.com/CourtHive/competition-factory) - Manipulates tournament and league documents, including draws and competition structures. _Sports: Tennis/Racquet, Multi-sport._
- [Ready2Race](https://github.com/lambda9-gmbh/ready2race) - Plans and executes competition events such as coastal rowing races. _Sports: Multi-sport._
- [SportsEngine Tourney](https://www.sportsengine.com/tourney/) - Manages tournament scheduling, brackets, standings, score updates, registration, and team communication. _Sports: Multi-sport._
- [Toornament API](https://developer.toornament.com/) - Provides APIs for building tournament, match, calendar, ranking, and registration workflows. _Sports: Esports, Multi-sport._

## Fan Experience and Community

Tools for communities, fantasy sports, fan engagement, memberships, loyalty, live events, and interactive experiences.

- [dynastyprocess/data](https://github.com/dynastyprocess/data) - Provides open fantasy football data maintained by DynastyProcess. _Sports: American Football._
- [fantasy-football-wrapped](https://github.com/kt474/fantasy-football-wrapped) - Generates fantasy league insights and charts for Sleeper and ESPN leagues. _Sports: American Football._
- [fantasy-manager](https://github.com/lukasdotcom/fantasy-manager) - Provides an open-source self-hosted fantasy manager. _Sports: Multi-sport._
- [yahoo-fantasy-sports-api-go](https://github.com/n-ae/yahoo-fantasy-sports-api-go) - Provides Go bindings for Yahoo Fantasy Sports APIs. _Sports: Multi-sport._

## Media, Highlights, and Content

Tools for sports video, clips, highlights, live production, graphics, social publishing, newsletters, podcasts, and editorial workflows.

- [OpenAI Whisper](https://github.com/openai/whisper) - Transcribes commentary, interviews, and review audio for sports media workflows. _Sports: Multi-sport._
- [soccer-video-analytics](https://github.com/tryolabs/soccer-video-analytics) - Demonstrates automatic soccer ball possession analysis from video. _Sports: Soccer._
- [Video Tagging Events](https://github.com/napo/videotaggingevents) - Tags specific segments of a video for sports review and analysis. _Sports: Multi-sport._

## Developer Tools

Libraries, SDKs, open-source projects, frameworks, and infrastructure useful for sports technology builders.

- [ffmpeg-python](https://github.com/kkroening/ffmpeg-python) - Provides Python bindings for FFmpeg video processing and filtering. _Sports: Multi-sport._
- [floodlight](https://github.com/floodlight-sports/floodlight) - Provides Python data structures, parsers, and analysis models for team-sport event and tracking data. _Sports: Multi-sport._
- [OpenCV](https://github.com/opencv/opencv) - Provides open-source computer vision infrastructure for tracking, detection, and video analysis. _Sports: Multi-sport._
- [sports-betting](https://github.com/georgedouzas/sports-betting) - Collects sports betting AI tools and prediction experiments. _Sports: Multi-sport._
- [sportsdataverse-py](https://github.com/sportsdataverse/sportsdataverse-py) - Provides a Python package for loading and tidying data from several SportsDataverse ecosystems. _Sports: Multi-sport._

## Datasets and Research

Open datasets, research projects, papers, benchmarks, and public reference material for sports analysis and product development.

- [Google Research Football](https://github.com/google-research/football) - Provides a reinforcement-learning football environment for AI research. _Sports: Soccer._
- [Metrica Sports Sample Data](https://github.com/metrica-sports/sample-data) - Provides sample soccer tracking and event data for analytics tutorials and reproducible analysis. _Sports: Soccer._
- [SoccerNet](https://www.soccer-net.org/data) - Provides datasets and benchmarks for soccer video understanding, action spotting, tracking, and game-state reconstruction. _Sports: Soccer._
- [SportsMOT](https://deeperaction.github.io/datasets/sportsmot.html) - Provides a multi-object tracking dataset across basketball, football, and volleyball scenes. _Sports: Basketball, Soccer, Volleyball._
- [StatsBomb Open Data](https://github.com/statsbomb/open-data) - Provides free soccer event data for public analysis and modeling. _Sports: Soccer._

## Other Sports Collections

Related Awesome Lists, directories, indexes, and curated sports technology resources.

- [analytics-handbook](https://github.com/devinpleuler/analytics-handbook) - Introduces practical soccer analytics concepts and workflows. _Sports: Soccer._
- [awesome-football-analytics](https://github.com/diegopastor/awesome-football-analytics) - Curates football analytics resources, datasets, software, and learning material. _Sports: Soccer._
- [awesome-soccer-analytics](https://github.com/matiasmascioto/awesome-soccer-analytics) - Collects soccer analytics resources in English and Spanish. _Sports: Soccer._
- [awesome-sports-analytics](https://github.com/AtomScott/awesome-sports-analytics) - Collects sports analytics datasets, tools, papers, and learning resources. _Sports: Multi-sport._
- [football_analytics](https://github.com/eddwebster/football_analytics) - Curates football analytics projects, data, and public resources. _Sports: Soccer._

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

This list is released under [CC0 1.0 Universal](LICENSE).
