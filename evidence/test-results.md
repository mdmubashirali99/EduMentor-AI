# Workshop 5.3 Test Results

Date: 2026-10-04

Environment: Windows / PowerShell 5.1, Node.js v22.23.2, npm 10.9.8, Vite 8.3.1, Express 5.1.x, Mongoose 8.x, OpenAI SDK 4.104.0. No local MongoDB service or private MongoDB/OpenAI configuration was present.

`npm test`: 10 passed, 0 failed. `npm run lint`: passed. `npm run build`: passed. These are functional/code checks, not educational-outcome or AI-accuracy measurements.

| Test ID | Input / action | Expected result | Observed result | Status | Evidence filename |
| --- | --- | --- | --- | --- | --- |
| SVC-01 | Start Vite with `npm run dev --workspace frontend` | Vite prints a local URL | Vite printed `http://localhost:5173/` | PASS | `runtime-checks.txt` |
| SVC-02 | Start Express with `npm run dev --workspace backend` | API prints its local URL and DB mode | API printed `http://localhost:4000`; reports in-memory demo mode | PASS | `runtime-checks.txt` |
| API-01 | GET `/api/health` and Vite `/api/health` | API is healthy and proxy reaches backend | Both returned `status=ok`; `database=demo`; `ai=guided-fallback` | PASS | `runtime-checks.txt` |
| UI-01 | Load student dashboard | Profile, metrics, chart, and courses render | “Welcome, Jordan Student.” and dashboard rendered | PASS | `dashboard-stats-desktop.png`, `lesson-progress-after-76.png` |
| UI-02 | Search courses for `writing` | Only matching course remains | One match: Research writing studio; Statistics course count was zero | PASS | `course-search-writing.png` |
| UI-03 | Complete next lesson from the rendered course button | Progress and lesson list update | Progress changed 68% to 76%; `/api/progress` returned HTTP 200 and 3 entries. Browser pointer automation was intercepted by the fixed header, so the rendered React button handler was dispatched directly. | PASS (handler/API); pointer-coordinate check partial | `lesson-progress-after-76.png`, `runtime-checks.txt` |
| UI-04 | Submit `WS5.3 synthetic evidence check`, Probability, score 37 | Form saves and assessment is retrievable | UI showed saved notification; GET `/api/assessments` returned the exact title/topic/score; dashboard average became 70 and Probability average 53 | PASS (demo mode only) | `assessment-entry-form.png`, `assessment-api-before-restart-demo.png`, `insights-assessment-demo.png` |
| UI-05 | Refresh learning analysis | Weak areas and next steps update from results | Probability was identified as a focus gap; recommendations were labeled “Assessment rules” | PASS | `insights-assessment-demo.png`, `assessment-rules-recommendations.png` |
| UI-06 | Ask a tutor question with no API key | Guided fallback responds and identifies its source | HTTP 200, `source=guided-fallback`, no model name; UI says “Guided fallback · not model-generated” | PASS (fallback only) | `tutor-fallback-response.png` |
| AI-01 | Configure a real OpenAI request | Receive actual provider-generated response | `OPENAI_API_KEY` absent; no external model request was attempted | BLOCKED | `runtime-checks.txt` |
| AI-02 | Local mock provider returns HTTP 503 | API returns safe 502; frontend displays error and retry | API returned safe 502; UI showed connection error and Retry | PASS (controlled mock failure; not a model success) | `tutor-ui-controlled-error.png`, backend test `api.test.js` |
| AI-03 | Evaluate tutoring accuracy or educational outcomes | Measure against a defined, labeled learning benchmark | No educational benchmark or accuracy evaluation was run | UNTESTED | `runtime-checks.txt` |
| VAL-01 | Invalid assessment score/topic | Reject with HTTP 400 and field details | Zod returned HTTP 400 with validation details | PASS | backend test `api.test.js` |
| VAL-02 | Blank tutor question and malformed progress slugs | Reject with HTTP 400 | Both requests returned HTTP 400 | PASS | backend test `api.test.js` |
| ERR-01 | Malformed JSON and body over 32 KB | Return safe HTTP 400 / 413 without echoing body | Malformed JSON returned 400; oversized JSON returned 413; app logs only error type | PASS | backend test `api.test.js` |
| DB-01 | Start with a deliberately unreachable loopback Mongo endpoint | Health says unavailable; app uses demo fallback; no URI in logs | Sanitized `MongooseServerSelectionError`; health `unavailable`; dashboard `demo` | PASS (controlled failure) | `runtime-checks.txt` |
| DB-02 | Configure real `MONGODB_URI`, connect, and issue admin ping | Backend reports `database=verified` only after successful ping | No URI configured and no local Mongo service/binary found; real ping was not attempted | BLOCKED | `runtime-checks.txt` |
| DB-03 | Retrieve synthetic assessment after backend restart | Same assessment remains available from MongoDB | The record was absent after restart; health remained `demo`; lesson progress reset to 68 | FAIL (persistence acceptance); expected because only in-memory fallback was configured | `assessment-api-before-restart-demo.png`, `assessment-api-after-restart-demo.png`, `runtime-checks.txt` |
| SEC-01 | Check Git ignore and frontend source for secrets | `.env` ignored; no credentials in frontend | `backend/.env` ignored, no real `.env` tracked, zero frontend matches for DB/API key references | PASS | `runtime-checks.txt` |
| AUTH-01 | GET profile without auth; request `/api/auth` | Protected routes require authentication if implemented | Profile returned HTTP 200; `/api/auth` returned 404. Authentication and protected routes are not implemented. | NOT IMPLEMENTED | `runtime-checks.txt` |
| RESP-01 | Desktop viewport, 1929px | No horizontal overflow | `document.scrollWidth=1914` | PASS | `dashboard-stats-desktop.png` |
| RESP-02 | Mobile viewport, 390×844 | No horizontal overflow | `document.scrollWidth=375`; heading and stat cards rendered. Mobile menu handler opened in DOM test; physical pointer helper was unreliable. | PASS (layout); menu pointer check partial | `mobile-stats-390.png` |

## Blockers and Untested Cases

- MongoDB persistence and successful ping remain blocked until a real `MONGODB_URI` and reachable database are configured privately. The restart test demonstrates that demo data is volatile.
- Real OpenAI request/response remains blocked until `OPENAI_API_KEY` is configured privately. Only the guided fallback and a localhost mock failure were tested.
- Login, user isolation, protected API routes, and instructor workflows are not implemented; no authentication success can be claimed.
- IDE Explorer/code and split-terminal window captures cannot be produced by the browser screenshot tool. See `development-summary.md` for manual capture steps.