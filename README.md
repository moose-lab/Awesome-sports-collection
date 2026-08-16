# Awesome Sports AI

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: CC0-1.0](https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/moose-lab/awesome-sports-ai?style=social)](https://github.com/moose-lab/awesome-sports-ai/stargazers)
[![Sports AI Hub](https://img.shields.io/badge/Sports%20AI%20Hub-Official%20Web%20App-00FF87?style=flat&labelColor=0D0F14)](https://sports-ai-hub.pages.dev/)

**A curated list of open-source sports AI tools, datasets, and models, alongside a factory of runnable prototypes.**

Enterprise sports AI is powerful, but most of it sits behind expensive data rights and vendor contracts. This repository serves as both a knowledge base to discover accessible tools, and an open-source incubator to decompose enterprise capabilities into smaller, runnable building blocks.

[`data/catalog.json`](data/catalog.json) remains the canonical source for categories, sport tags, AI capabilities, openness labels, tool records, and builder recipes.

Awesome Sports AI is a resource-type-first awesome list for Sports & AI builders who need high-signal tools, datasets, libraries, models, benchmarks, and runnable prototypes.

## Who This Is For

- Developers building sports AI apps, prototypes, datasets, and automation workflows.
- Analysts, coaches, editors, and operators looking for usable tools they can run or adapt.
- Tool users who want to find a working project, understand the inputs and outputs, and decide whether it fits their sport workflow.
- Contributors who want small, concrete issues that improve the catalog, prototypes, or docs.

## Quick Start for Builders

- Need runnable code? Start with [Open-Source Projects](#open-source-projects), especially [`llm-match-commentator`](prototypes/llm-match-commentator/), [`wnba-gravity-mapper`](prototypes/wnba-gravity-mapper/), and [`pickleball-court-mapper`](prototypes/pickleball-court-mapper/).
- Need a tool you can use or adapt today? Start with [Apps & Products](#apps--products), then check the matching open-source project or SDK category.
- Need raw material? Start with [Datasets/APIs/Feeds](#datasetsapisfeeds).
- Need implementation building blocks? Start with [Developer Libraries/SDKs](#developer-librariessdks) and [AI Models/Components](#ai-modelscomponents).
- Need evaluation references? Start with [Research Benchmarks](#research-benchmarks).
- Need event or demo context? Start with [Event Toolkits](#event-toolkits) and [Builder Paths & Scenarios](#builder-paths--scenarios).
- **Contribute:** [CONTRIBUTING.md](CONTRIBUTING.md) or pick a [`good first issue`](https://github.com/moose-lab/awesome-sports-ai/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## Vibe-Coding Lookup Paths

Use these paths when you want to move from idea to working prototype quickly:

- Match commentary app: [`llm-match-commentator`](prototypes/llm-match-commentator/) + [OpenAI Whisper](#ai-modelscomponents) + [StatsBomb Open Data](#datasetsapisfeeds).
- Basketball spacing tool: [`wnba-gravity-mapper`](prototypes/wnba-gravity-mapper/) + [Metrica Sports Sample Data](#datasetsapisfeeds) + [sportypy](#developer-librariessdks).
- Court vision prototype: [`pickleball-court-mapper`](prototypes/pickleball-court-mapper/) + [OpenCV](#developer-librariessdks) + [Roboflow Sports](#ai-modelscomponents).
- Soccer analytics report: [StatsBomb Open Data](#datasetsapisfeeds) + [socceraction](#developer-librariessdks) + [mplsoccer](#developer-librariessdks).
- World Cup knockout tracker: [Competition Factory](#open-source-projects) + [Challonge API](#datasetsapisfeeds) + [World Cup 2026 assistant toolkit](docs/world-cup-2026-toolkit.md).

## Sports & AI Relevance Rule

Every entry should connect a sport-specific workflow to AI, data, automation, video, modeling, benchmarking, or developer infrastructure. Generic tools belong here only when they unlock a clear sports AI use case.

Open-source projects, open datasets, open APIs, reproducible research, and free developer paths should lead each category. Commercial systems can stay when they help builders understand the professional reference point, but they should be labeled `commercial-reference`.

## Table of Contents

- [The Catalog](#the-catalog)
  - [Apps & Products](#apps--products)
  - [Open-Source Projects](#open-source-projects)
  - [Datasets/APIs/Feeds](#datasetsapisfeeds)
  - [Developer Libraries/SDKs](#developer-librariessdks)
  - [AI Models/Components](#ai-modelscomponents)
  - [Research Benchmarks](#research-benchmarks)
  - [Event Toolkits](#event-toolkits)
  - [Learning Collections](#learning-collections)
- [The Prototype Factory](#the-prototype-factory)
- [Builder Paths & Scenarios](#builder-paths--scenarios)
- [HYROX Zone](#hyrox-zone)
- [Contribute](#contribute)
- [License](#license)

## The Catalog

### Apps & Products

*User-facing apps, hosted products, and commercial references that help builders understand complete sports AI workflows.*

- **[fantasy-manager](https://github.com/lukasdotcom/fantasy-manager)** - Provides an open-source self-hosted fantasy manager. *(Sports: Multi-sport; AI: operations, analytics-modeling)*
- **[Second Spectrum](https://www.geniussports.com/newsroom/genius-sports-second-spectrum-tracking-technology-approved-by-fifa-quality-programme-for-epts/)** - Provides optical tracking, tactical analytics, and augmented broadcast tools for professional leagues and teams. *(Sports: Basketball, Soccer; AI: tracking, analytics-modeling, media-generation)*
- **[Sports AI Hub](https://sports-ai-hub.pages.dev/)** - Provides the public web app companion for this directory, including builder navigation, prototypes, and project paths. *(Sports: Multi-sport; AI: operations, data-ingestion)*
- **[SportsEngine Tourney](https://www.sportsengine.com/tourney/)** - Manages tournament scheduling, brackets, standings, score updates, registration, and team communication. *(Sports: Multi-sport; AI: operations)*
- **[Stonk Striker](https://stonk-striker.vercel.app/)** - Turns stock and crypto price charts into a browser football striking game with market-shaped terrain. *(Sports: Soccer; AI: media-generation, analytics-modeling)*


### Open-Source Projects

*Runnable repositories and prototypes that implement a sports AI workflow end to end.*

- **[AthleteLoadMonitor](https://github.com/SaxionAMI/AthleteLoadMonitor)** - Monitors and predicts athlete load for team-sport coaches. *(Sports: Multi-sport; AI: training-load, analytics-modeling)*
- **[bracket](https://github.com/evroon/bracket)** - Provides a self-hosted tournament system for creating and managing brackets. *(Sports: Multi-sport; AI: operations)*
- **[Competition Factory](https://github.com/CourtHive/competition-factory)** - Manipulates tournament and league documents, including draws and competition structures. *(Sports: Tennis/Racquet, Multi-sport; AI: operations, data-ingestion)*
- **[Coroebus](https://github.com/prakashsellathurai/Coroebus)** - Tracks training load, fitness, fatigue, and readiness for athletes. *(Sports: Multi-sport; AI: training-load, analytics-modeling)*
- **[fantasy-football-wrapped](https://github.com/kt474/fantasy-football-wrapped)** - Generates fantasy league insights and charts for Sleeper and ESPN leagues. *(Sports: American Football; AI: analytics-modeling, media-generation)*
- **[football-match-intelligence](https://github.com/DataKnight1/football-match-intelligence)** - Builds football match intelligence dashboards with pitch control, sprint efficiency, and tactical sequencing. *(Sports: Soccer; AI: analytics-modeling, tracking)*
- **[football_scout_rag](https://github.com/yotambraun/football_scout_rag)** - Generates repeatable football player scouting reports with retrieval-augmented workflows. *(Sports: Soccer; AI: llm-nlp, analytics-modeling)*
- **[HYROX Gym Finder](https://github.com/moose-lab/hyrox-gym-finder)** - Finds nearby HYROXCN certified gyms from coordinates, region keywords, browser location, or imported JSON exports. *(Sports: Running/Track, Multi-sport; AI: data-ingestion, operations)*
- **[HYROX Training Plan Skill](https://github.com/moose-lab/hyrox-training-plan-skill)** - Generates science-based HYROX training plans for coding agents with periodization references and validation scripts. *(Sports: Running/Track, Multi-sport; AI: llm-nlp, training-load)*
- **[hyrox-split-parser](./prototypes/hyrox-split-parser/)** - Parses exported HYROX result tables into run/station deltas, rank movement, and coach-ready notes. *(Sports: Running/Track, Multi-sport; AI: data-ingestion, analytics-modeling)*
- **[llm-match-commentator](./prototypes/llm-match-commentator/)** - Generates localized match commentary from structured event streams. *(Sports: Soccer, Multi-sport; AI: llm-nlp, media-generation)*
- **[pickleball-court-mapper](./prototypes/pickleball-court-mapper/)** - Detects pickleball court lines and generates annotated court diagrams. *(Sports: Tennis/Racquet; AI: computer-vision, tracking)*
- **[Ready2Race](https://github.com/lambda9-gmbh/ready2race)** - Plans and executes competition events such as coastal rowing races. *(Sports: Multi-sport; AI: operations)*
- **[soccer-video-analytics](https://github.com/tryolabs/soccer-video-analytics)** - Demonstrates automatic soccer ball possession analysis from video. *(Sports: Soccer; AI: computer-vision, tracking)*
- **[Video Tagging Events](https://github.com/napo/videotaggingevents)** - Tags specific segments of a video for sports review and analysis. *(Sports: Multi-sport; AI: operations, media-generation)*
- **[wnba-gravity-mapper](./prototypes/wnba-gravity-mapper/)** - Calculates player gravity from basketball tracking coordinates and renders a heatmap. *(Sports: Basketball; AI: tracking, analytics-modeling)*


### Datasets/APIs/Feeds

*Public data, sports APIs, live feeds, and reference datasets for building sports AI products.*

- **[balldontlie](https://www.balldontlie.io/)** - Provides API access to basketball teams, players, games, and box-score data. *(Sports: Basketball; AI: data-ingestion)*
- **[Challonge API](https://api.challonge.com/)** - Lets developers create tournaments, update brackets, and report scores programmatically. *(Sports: Multi-sport; AI: operations, data-ingestion)*
- **[CollegeFootballData](https://collegefootballdata.com/)** - Provides college football API endpoints for games, drives, plays, rankings, ratings, and recruiting data. *(Sports: American Football; AI: data-ingestion, analytics-modeling)*
- **[dynastyprocess/data](https://github.com/dynastyprocess/data)** - Provides open fantasy football data maintained by DynastyProcess. *(Sports: American Football; AI: data-ingestion, analytics-modeling)*
- **[football.json](https://github.com/openfootball/football.json)** - Provides public-domain football match data in JSON for schedules, leagues, clubs, and results. *(Sports: Soccer; AI: data-ingestion)*
- **[Metrica Sports Sample Data](https://github.com/metrica-sports/sample-data)** - Provides sample soccer tracking and event data for analytics tutorials and reproducible analysis. *(Sports: Soccer; AI: data-ingestion, tracking)*
- **[nba_api](https://github.com/swar/nba_api)** - Provides a Python client for NBA.com stats endpoints and basketball data workflows. *(Sports: Basketball; AI: data-ingestion)*
- **[StatsBomb Open Data](https://github.com/statsbomb/open-data)** - Provides free soccer event data for public analysis and modeling. *(Sports: Soccer; AI: data-ingestion, benchmarking)*
- **[Toornament API](https://developer.toornament.com/)** - Provides APIs for building tournament, match, calendar, ranking, and registration workflows. *(Sports: Esports, Multi-sport; AI: operations, data-ingestion)*


### Developer Libraries/SDKs

*Packages, SDKs, and infrastructure libraries that help developers parse, normalize, visualize, and process sports data.*

- **[databallpy](https://github.com/Alek050/databallpy)** - Reads, preprocesses, visualizes, and synchronizes soccer event and tracking data. *(Sports: Soccer; AI: data-ingestion, tracking, training-load)*
- **[FastF1](https://github.com/theOehrly/Fast-F1)** - Loads Formula 1 timing, telemetry, session, schedule, and weather data in Python. *(Sports: Motorsport; AI: data-ingestion, analytics-modeling)*
- **[ffmpeg-python](https://github.com/kkroening/ffmpeg-python)** - Provides Python bindings for FFmpeg video processing and filtering. *(Sports: Multi-sport; AI: media-generation)*
- **[floodlight](https://github.com/floodlight-sports/floodlight)** - Provides Python data structures, parsers, and analysis models for team-sport event and tracking data. *(Sports: Multi-sport; AI: data-ingestion, tracking, analytics-modeling)*
- **[Kloppy](https://github.com/PySport/kloppy)** - Standardizes soccer tracking and event data into vendor-independent Python objects. *(Sports: Soccer; AI: data-ingestion, tracking)*
- **[mplsoccer](https://github.com/andrewRowlinson/mplsoccer)** - Draws soccer pitches and common football analytics plots with Matplotlib. *(Sports: Soccer; AI: analytics-modeling, media-generation)*
- **[OpenCV](https://github.com/opencv/opencv)** - Provides open-source computer vision infrastructure for tracking, detection, and video analysis. *(Sports: Multi-sport; AI: computer-vision, tracking)*
- **[socceraction](https://github.com/ML-KULeuven/socceraction)** - Converts soccer event streams to SPADL and values actions with VAEP or xT. *(Sports: Soccer; AI: data-ingestion, analytics-modeling)*
- **[soccerplots](https://github.com/slothfulwave/soccerplots)** - Creates radar and pizza charts for football player analysis. *(Sports: Soccer; AI: analytics-modeling, media-generation)*
- **[sportsdataverse-py](https://github.com/sportsdataverse/sportsdataverse-py)** - Provides a Python package for loading and tidying data from several SportsDataverse ecosystems. *(Sports: Multi-sport; AI: data-ingestion, analytics-modeling)*
- **[sportypy](https://github.com/sportsdataverse/sportypy)** - Draws regulation playing surfaces for several sports in Python. *(Sports: Multi-sport; AI: analytics-modeling, media-generation)*
- **[statsbombpy](https://github.com/statsbomb/statsbombpy)** - Streams StatsBomb soccer data into Python for analysis and modeling. *(Sports: Soccer; AI: data-ingestion, analytics-modeling)*
- **[yahoo-fantasy-sports-api-go](https://github.com/n-ae/yahoo-fantasy-sports-api-go)** - Provides Go bindings for Yahoo Fantasy Sports APIs. *(Sports: Multi-sport; AI: data-ingestion)*


### AI Models/Components

*Reusable AI components for computer vision, modeling, LLM/NLP, media, and training-load workflows.*

- **[Acute_Chronic_Workload_Ratio](https://github.com/ale-uy/Acute_Chronic_Workload_Ratio)** - Calculates acute-to-chronic workload ratios in Python. *(Sports: Multi-sport; AI: training-load, analytics-modeling)*
- **[MMPose](https://github.com/open-mmlab/mmpose)** - Provides an open-source pose estimation toolbox for biomechanics and movement analysis. *(Sports: Multi-sport; AI: computer-vision, tracking, training-load)*
- **[Model Card Toolkit](https://github.com/tensorflow/model-card-toolkit)** - Documents training data, assumptions, limitations, and evaluation results for machine learning models. *(Sports: Multi-sport; AI: benchmarking, analytics-modeling)*
- **[OpenAI Whisper](https://github.com/openai/whisper)** - Transcribes commentary, interviews, and review audio for sports media workflows. *(Sports: Multi-sport; AI: llm-nlp, media-generation)*
- **[OpenPose](https://github.com/CMU-Perceptual-Computing-Lab/openpose)** - Detects real-time multi-person body, hand, face, and foot keypoints. *(Sports: Multi-sport; AI: computer-vision, tracking)*
- **[Roboflow Sports](https://github.com/roboflow/sports)** - Provides reusable sports computer-vision workflows for player and ball tracking, team classification, and pitch-view projection. *(Sports: Multi-sport; AI: computer-vision, tracking)*
  - [Watch the 43-second product explainer (Mandarin narration and Chinese captions)](docs/media/roboflow-sports-explainer/roboflow-sports-explainer-zh.mp4).
- **[soccer_xg](https://github.com/ML-KULeuven/soccer_xg)** - Trains and analyzes expected-goals models for soccer. *(Sports: Soccer; AI: analytics-modeling)*
- **[sports-betting](https://github.com/georgedouzas/sports-betting)** - Collects sports betting AI tools and prediction experiments. *(Sports: Multi-sport; AI: analytics-modeling)*


### Research Benchmarks

*Papers, benchmark datasets, simulation environments, and reproducible research references.*

- **[Google Research Football](https://github.com/google-research/football)** - Provides a reinforcement-learning football environment for AI research. *(Sports: Soccer; AI: simulation-rl, benchmarking)*
- **[SoccerNet](https://www.soccer-net.org/data)** - Provides datasets and benchmarks for soccer video understanding, action spotting, tracking, and game-state reconstruction. *(Sports: Soccer; AI: computer-vision, tracking, benchmarking)*
- **[SportsMOT](https://deeperaction.github.io/datasets/sportsmot.html)** - Provides a multi-object tracking dataset across basketball, football, and volleyball scenes. *(Sports: Basketball, Soccer, Volleyball; AI: tracking, computer-vision, benchmarking)*
- **[TacticAI](https://www.nature.com/articles/s41467-024-45965-x)** - Describes a football tactics assistant for predicting and generating corner-kick tactical recommendations. *(Sports: Soccer; AI: analytics-modeling, benchmarking)*


### Event Toolkits

*Event-specific builder kits, live data contracts, generated visuals, and matchday workflows.*

- **[World Cup 2026 assistant toolkit](./docs/world-cup-2026-toolkit.md)** - Classifies tools for Round of 32-to-Final workflows: data normalization, bracket scenarios, reports, xG, video, scouting, and localization. *(Sports: Soccer; AI: data-ingestion, analytics-modeling, llm-nlp)*
- **[World Cup 2026 knockout-stage tool map](./docs/world-cup-2026-toolkit.md)** - Maps single tools to practical knockout use cases, including bracket state, match briefs, shot-quality context, video review, and multilingual media. *(Sports: Soccer; AI: operations, data-ingestion, analytics-modeling, llm-nlp)*
- **[World Cup 2026 zone plan](./docs/world-cup-2026-zone.md)** - Defines the knockout-stage data contract, Match Center handoff, toolkit lanes, and operations checklist. *(Sports: Soccer; AI: operations, data-ingestion)*


### Learning Collections

*Awesome lists, handbooks, tutorials, and curated reference collections for sports AI builders.*

- **[analytics-handbook](https://github.com/devinpleuler/analytics-handbook)** - Introduces practical soccer analytics concepts and workflows. *(Sports: Soccer; AI: analytics-modeling)*
- **[awesome-football-analytics](https://github.com/diegopastor/awesome-football-analytics)** - Curates football analytics resources, datasets, software, and learning material. *(Sports: Soccer; AI: analytics-modeling, data-ingestion)*
- **[awesome-soccer-analytics](https://github.com/matiasmascioto/awesome-soccer-analytics)** - Collects soccer analytics resources in English and Spanish. *(Sports: Soccer; AI: analytics-modeling, data-ingestion)*
- **[awesome-sports-analytics](https://github.com/AtomScott/awesome-sports-analytics)** - Collects sports analytics datasets, tools, papers, and learning resources. *(Sports: Multi-sport; AI: analytics-modeling, data-ingestion)*
- **[football_analytics](https://github.com/eddwebster/football_analytics)** - Curates football analytics projects, data, and public resources. *(Sports: Soccer; AI: analytics-modeling, data-ingestion)*


## The Prototype Factory

The catalog is the shop window. [`/prototypes`](prototypes/) is the factory floor. These examples decompose professional sports AI capabilities into runnable mono-tools with local input and visible output.

| Prototype | Capability Replaced | Input -> Output |
|-----------|---------------------|-----------------|
| **[llm-match-commentator](prototypes/llm-match-commentator/)** | Automated recap/commentary systems (e.g., Stats Perform) | Event stream -> Bilingual markdown commentary |
| **[wnba-gravity-mapper](prototypes/wnba-gravity-mapper/)** | Proprietary spacing and gravity metrics | Player positions -> Tactical attention heatmap |
| **[pickleball-court-mapper](prototypes/pickleball-court-mapper/)** | Proprietary court-calibration systems | Court image -> Mapped court geometry diagram |
| **[HYROX Gym Finder](https://github.com/moose-lab/hyrox-gym-finder)** | Official venue discovery and local gym filtering | Location or JSON export -> Ranked certified gym list and map |
| **[hyrox-split-parser](prototypes/hyrox-split-parser/)** | Paid split-analysis dashboards on results platforms | Result table CSV -> Run/station deltas and coach report |


**Start here:** run a prototype, inspect the output, then fork the smallest piece you want to improve.

## Builder Paths & Scenarios

If you are focused on a specific sport, check out our **[Browse by Sport Guides](docs/sports/)** (e.g., [Football](docs/sports/football.md), [Basketball](docs/sports/basketball.md), [Running](docs/sports/running.md), [HYROX](docs/sports/hyrox.md)) to see how tools can be combined for specific scenarios.

These paths show how catalog entries become prototype ideas:

- **Build your own xG model:** public shot data, event schema, shot-map renderer, baseline model, model card.

- **Build your own coaching video tagger:** clip cutter, event tagger, possession timeline, coach notes exporter, highlight captioner.

- **Build your own scouting board:** player profile schema, public data loader, similarity radar, searchable clip index, scouting report template.

- **Build your own athlete load dashboard:** wearable CSV parser, team ID resolver, workload ratio, risk flags, weekly dashboard.

- **Build your own match intelligence report:** fixture normalizer, match-event schema, win-probability lite, stat-card generator, match-report markdown.


See [Enterprise-to-Open-Source Decomposition](docs/enterprise-to-open-source-decomposition.md) for the broader stack map and [2026 Strategic Roadmap](docs/roadmap-2026-strategy.md) for the next prototype lanes.

## HYROX Zone

*The first specialty sport zone: build, list, and use tools for hybrid fitness racing. Scene data lives in [`data/catalog.json`](data/catalog.json); the full scenario guide is [docs/sports/hyrox.md](docs/sports/hyrox.md).*

HYROX is a fixed-format race — 8 × 1 km runs alternating with 8 standardized stations — so every athlete produces the same structured splits, and almost no open-source tooling exists yet. Small, single-workflow tools win here. The full tool opportunity map — 7 lanes and 25 build targets with status, effort, and target search phrases — lives in the [HYROX guide](docs/sports/hyrox.md) and in machine-readable form under `scenes[].buildTargets` in [`data/catalog.json`](data/catalog.json). A visual blueprint of the zone — map, funnel, and growth playbook — is live at [sports-ai-hub.pages.dev/hyrox/blueprint](https://sports-ai-hub.pages.dev/hyrox/blueprint/).

- **[HYROX Gym Finder](https://github.com/moose-lab/hyrox-gym-finder)** - Finds HYROXCN certified gyms from coordinates, region keywords, browser location, or imported JSON exports. Live at [hyrox-gym-finder.vercel.app](https://hyrox-gym-finder.vercel.app/). *(Sports: Running/Track, Multi-sport; AI: data-ingestion, operations)*
- **[HYROX Training Plan Skill](https://github.com/moose-lab/hyrox-training-plan-skill)** - Generates periodized HYROX plans for coding agents from athlete constraints, race-division standards, and training-principle reference files. *(Sports: Running/Track, Multi-sport; AI: llm-nlp, training-load)*
- **[hyrox-split-parser](./prototypes/hyrox-split-parser/)** - Parses exported HYROX result tables into run/station deltas, rank movement, and coach-ready notes. First shipped zone gap. *(Sports: Running/Track, Multi-sport; AI: data-ingestion, analytics-modeling)*

**Claimable gaps** — open a [claim issue](https://github.com/moose-lab/awesome-sports-ai/issues/new?template=claim-hyrox-gap.yml) to build one. You keep the repository; the zone lists it:

- `hyrox-movement-standard-checker` - Athlete-owned station video -> annotated review timeline with explicit uncertainty.
- `hyrox-heat-station-load-planner` - Roster plus venue constraints -> heat plan and staffing risk report.
- `hyrox-venue-readiness-checklist` - Station inventory plus floor plan -> setup gaps and volunteer task list.

Already built something HYROX-adjacent? Use the [Submit a Tool](https://github.com/moose-lab/awesome-sports-ai/issues/new?template=submit-tool.yml) form, and add the optional zone badge (snippet in [CONTRIBUTING.md](CONTRIBUTING.md)) to your README. The end-to-end contribution and listing flow is documented in [docs/hyrox-zone-workflow.md](docs/hyrox-zone-workflow.md).

## Contribute

**[Start contributing](CONTRIBUTING.md)** or pick a [`good first issue`](https://github.com/moose-lab/awesome-sports-ai/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

Three ways in, by time budget: suggest a tool with the [Submit a Tool form](https://github.com/moose-lab/awesome-sports-ai/issues/new?template=submit-tool.yml) (2 minutes, no repo editing), open a listing PR yourself ([entry format](CONTRIBUTING.md#catalog-source-of-truth), 15–30 minutes), or [claim an open HYROX gap](https://github.com/moose-lab/awesome-sports-ai/issues/new?template=claim-hyrox-gap.yml) and build it over a weekend.

Good contributions either sharpen the catalog, make a prototype easier to run, or turn a professional sports AI workflow into a smaller open-source tool that another developer can ship.

## License

This list is released under [CC0 1.0 Universal](LICENSE).
