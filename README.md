# EduMentor AI

EduMentor AI is a personalized learning dashboard for college and professional learners. It tracks course progress, turns assessment results into learning-gap insights, recommends focused practice, and provides an AI tutoring chat.

## Run Locally

Requirements: Node.js 20.19+ (or 22.12+) and npm 10+.

```bash
npm install
npm run dev
```

The frontend normally starts at `http://localhost:5173`; Vite proxies `/api` requests to the Express API at `http://localhost:4000`. If a port is occupied, use the actual URL printed by Vite. To keep service logs in separate terminals, run:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

For a production preview, build first and then start both services:

```bash
npm run build
npm start
```

The frontend preview normally uses `http://localhost:4173`; the API remains on port `4000`.

## Environment Configuration

The backend loads `backend/.env` through `dotenv/config`. To create a private local file in PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set these names privately; do not paste values into reports, screenshots, chat, or frontend variables:

- `PORT`
- `CLIENT_ORIGIN`
- `MONGODB_URI`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

For MongoDB Atlas, create a database deployment and database user, allow the development machine's IP in the network access list, and place the connection URI in `backend/.env`. Keep `.env` closed when capturing evidence; it is excluded by `.gitignore`.

On startup, the backend connects to MongoDB, sends an administrative ping, and only then seeds data and logs `MongoDB connection verified (ping: ok)`. `/api/health` reports `database: verified`, `demo`, `connecting`, or `unavailable`. Without `MONGODB_URI`, data is in-memory only and is lost on backend restart. Do not treat demo data as persistent.

The AI client is server-side OpenAI Chat Completions using `OPENAI_MODEL` (default `gpt-4o-mini`). With `OPENAI_API_KEY` configured, API responses identify `source: openai` and include the model name. Without the key, the app returns a guided fallback labeled `source: guided-fallback`; it is not a model response. Recommendations and knowledge-gap classifications are deterministic rules based on assessment averages, not model-generated recommendations.

## Project Layout

```text
backend/
  src/
    data/          Demo learner and course data
    models/        Mongoose schemas for users, courses, assessments, progress, recommendations
    routes/        Validated Express API routes
    services/      Learning analysis and AI tutoring
    app.js         Express middleware and error handling
    server.js      MongoDB connection and API startup
    store.js       MongoDB-backed store with in-memory demo mode
  test/            Service and HTTP API tests
frontend/
  src/
    components/    Course cards, learning chart, AI chat drawer
    services/      API client
    App.jsx        Dashboard navigation, course flow, insights
    styles.css     Responsive design system
```

## Features

- Student overview with study time, streak, completed lessons, weekly goal, activity, and course progress.
- Course library with search and interactive lesson completion.
- Assessment endpoints and topic-level analysis that highlights focus areas and strengths.
- Assessment-average-based practice recommendations and knowledge-gap analysis using deterministic rules.
- AI tutoring through the backend OpenAI Chat Completions client, with clearly labeled guided fallback replies when no key is configured.
- MongoDB persistence after connection and successful ping; otherwise, clearly reported in-memory demo data.
- Input validation with Zod, request-size limits, configurable CORS, user-safe error responses, and loading/empty/error states.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API and integration status |
| `GET` | `/api/profile` | Current demo student profile |
| `GET` | `/api/dashboard` | Profile, courses, progress summary, recommendations, and insights |
| `GET` | `/api/courses` | Course catalog |
| `GET` | `/api/progress` | Lesson completion history |
| `POST` | `/api/progress/complete` | Mark a lesson complete; accepts `courseSlug`, `lessonSlug`, optional `score` |
| `GET` | `/api/assessments` | Assessment history |
| `POST` | `/api/assessments` | Record a result; accepts `topic`, `score`, optional `assessmentTitle` |
| `GET` | `/api/recommendations` | Current personalized recommendations |
| `POST` | `/api/recommendations/analyze` | Recalculate topic strengths, gaps, and practice recommendations |
| `POST` | `/api/assistant/chat` | Ask the learning assistant; accepts `message` and optional conversation `history` |

## Verification

```bash
npm test
npm run lint
npm run build
```

The backend uses Node's built-in test runner for learning analysis, HTTP behavior, validation, progress updates, fallback tutoring, and a localhost-only mocked provider failure. The frontend is linted with Oxlint and production-built with Vite. Functional test results are not learning-quality or AI-accuracy measurements. See [`evidence/test-results.md`](evidence/test-results.md) for the dated test matrix and [`evidence/development-summary.md`](evidence/development-summary.md) for verified findings and evidence captions.

## Production Notes

This project uses a seeded demo learner to keep the prototype immediately usable. It does not include account authentication, protected routes, authorization, instructor workflows, or production student-data controls. The current development environment has no `MONGODB_URI` or `OPENAI_API_KEY`, so database persistence and a real OpenAI response are not verified. Add those privately before production use. Keep secrets server-side and configure a trusted `CLIENT_ORIGIN`.