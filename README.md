# EduMentor AI

EduMentor AI is a personalized learning dashboard for college and professional learners. It tracks course progress, turns assessment results into learning-gap insights, recommends focused practice, and provides an AI tutoring chat.

## Run Locally

Requirements: Node.js 20.19+ (or 22.12+) and npm 10+.

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The Express API runs at `http://localhost:4000`; Vite proxies `/api` requests to it. The app starts with sample student data and a guided tutoring fallback, so MongoDB and an AI key are optional for local development.

To use MongoDB and the OpenAI tutoring provider, copy `backend/.env.example` to `backend/.env`, then set `MONGODB_URI` and `OPENAI_API_KEY`. The backend seeds an example student, courses, assessments, progress, and recommendations when it first connects. The tutoring model can be changed with `OPENAI_MODEL`.

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
- Personalized practice recommendations generated from assessment averages.
- AI tutoring through OpenAI Chat Completions, with a guided local fallback when no API key is configured.
- MongoDB persistence with a graceful in-memory sample-data mode when MongoDB is absent.
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

The backend uses Node's built-in test runner for learning analysis, HTTP behavior, validation, progress updates, and tutoring fallback. The frontend is linted with Oxlint and production-built with Vite.

## Production Notes

This project uses a seeded demo learner to keep the prototype immediately usable. It does not include account authentication, authorization, instructor workflows, or production student-data controls. Add those before deployment with real learner information; keep database and AI secrets on the server and configure a trusted `CLIENT_ORIGIN`.