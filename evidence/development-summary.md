# Development Summary

Date: 2026-10-04. This report records observed local checks only; no historical development duration, user feedback, learning-quality score, or AI accuracy claim is included.

## Changes Made

- Added a startup database status state and an actual MongoDB admin ping. The backend reports `verified` only after the ping and seed operation; missing configuration is `demo`, and a failed configured connection is `unavailable`.
- Sanitized Mongo connection failure logs so they do not print a URI or raw driver error.
- Fixed malformed JSON from returning generic HTTP 500; malformed JSON now returns HTTP 400 and oversized request bodies return HTTP 413.
- Added tests for blank tutor input, invalid progress fields, parser/size errors, and a localhost-only mock AI-provider failure.
- Added UI provenance labels: OpenAI model replies include provider/model; fallback text is marked “Guided fallback · not model-generated.” Deterministic learning recommendations are labeled “Assessment rules.”
- Updated README with local commands, environment-variable names, actual connection semantics, provider/fallback behavior, and limitations.

## Verified Features

- Vite frontend and Express backend ran independently at `http://localhost:5173/` and `http://localhost:4000/`; Vite `/api` proxy reached the live backend.
- Dashboard rendered; course search matched Research writing studio; the lesson handler changed demo progress from 68% to 76%; assessment form submitted a clearly named synthetic Probability score; GET `/api/assessments` retrieved it before restart.
- Assessment results changed the aggregate average and Probability gap; deterministic recommendation analysis returned a Probability focus recommendation.
- Tutor fallback returned HTTP 200 and exposed `source=guided-fallback`; a controlled mock 503 produced safe API HTTP 502 and a frontend error/Retry message.
- A controlled Mongo connection failure produced `database=unavailable` and a demo dashboard without leaking the test URI.
- Desktop 1929px and mobile 390px layouts had document widths of 1914px and 375px respectively. The embedded browser pointer automation intermittently hit the fixed top bar; where noted in the test matrix, rendered button handlers were invoked directly to verify API/state behavior.
- Secret checks found no real `.env` tracked, confirmed `backend/.env` is ignored, and found no Mongo/OpenAI credential references in frontend source.

## Pending / Blocked

- No `backend/.env`, root `.env`, process `MONGODB_URI`, or process `OPENAI_API_KEY` was present. No local MongoDB service or `mongod` binary was found.
- Real MongoDB ping/persistence is not verified. The named synthetic assessment disappeared after backend restart, proving the current store was in-memory.
- A real OpenAI model call was not made. The server-side provider is OpenAI Chat Completions; the default model name is `gpt-4o-mini`, configurable through `OPENAI_MODEL`.
- Authentication, protected routes, user isolation, and instructor workflows are not implemented.
- A genuine whole IDE/split-terminal screenshot cannot be saved by the available browser screenshot tool. The browser-generated component screenshots are under `screenshots/`; capture the IDE manually using the steps below.

## Screenshot Captions

- `screenshots/dashboard-stats-desktop.png`: desktop-width study time, completed lessons, average score, and streak cards.
- `screenshots/course-search-writing.png`: course search filtered to Research writing studio.
- `screenshots/lesson-progress-api-before-68.png`: dashboard API state before the lesson action (68%, demo mode).
- `screenshots/lesson-progress-after-76.png`: rendered course card after lesson completion; progress is 76%.
- `screenshots/assessment-entry-form.png`: form filled with the synthetic Workshop 5.3 assessment label and score; not by itself proof of persistence.
- `screenshots/assessment-api-before-restart-demo.png`: actual API JSON containing the synthetic record before restart; health mode was `demo`.
- `screenshots/assessment-api-after-restart-demo.png`: actual API JSON after restart; synthetic record is absent.
- `screenshots/insights-assessment-demo.png`: assessment-derived average and Probability gap in demo mode.
- `screenshots/assessment-rules-recommendations.png`: deterministic recommendations labeled as assessment rules.
- `screenshots/tutor-fallback-response.png`: actual guided fallback response and provenance label; not an OpenAI model response.
- `screenshots/tutor-ui-controlled-error.png`: controlled 502 error shown in the tutor UI with Retry.
- `screenshots/mobile-stats-390.png`: responsive mobile metric cards at a 390px viewport.

## Manual IDE Captures

1. For structure/code: maximize VS Code, show Explorer with `backend/`, `frontend/`, and `evidence/`, open `backend/src/server.js` or `frontend/src/services/api.js`, and capture the full VS Code window. Keep `backend/.env` closed.
2. For running services: keep the frontend terminal showing `http://localhost:5173/` and the backend terminal showing `http://localhost:4000/` and its actual DB status; split the VS Code terminal panel into two panes.
3. For current database evidence: run `Invoke-RestMethod http://localhost:4000/api/health | ConvertTo-Json` in a third terminal. It currently says `database: demo`; this is not MongoDB verification.
4. For persistent Mongo evidence, configure MongoDB privately, restart the backend, capture the `MongoDB connection verified (ping: ok)` log and `/api/health` with `database: verified`, submit the synthetic assessment through the UI, then restart and retrieve it again. Do not include `backend/.env` in screenshots.
5. For real AI evidence, configure `OPENAI_API_KEY` privately, submit a tutor question, and capture both the UI response and its `OpenAI · model` provenance label. Do not call the guided fallback a model response.
6. To capture full desktop/mobile layout manually, maximize the browser for desktop; use browser responsive mode at 390×844 for mobile. Capture only app UI and avoid any terminal or editor view containing secrets.