import { Router } from 'express'
import { z } from 'zod'
import { answerQuestion } from '../services/tutor.js'
import { createRecommendations } from '../services/analysis.js'
import {
  completeLesson,
  getDatabaseStatus,
  getDashboard,
  getProfile,
  createAssessment,
  listAssessments,
  listCourses,
  listProgress,
  listRecommendations,
  runAnalysis,
} from '../store.js'

const router = Router()
const chatSchema = z.object({
  message: z.string().trim().min(1, 'Write a question first.').max(2000, 'Keep your question under 2,000 characters.'),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) })).max(12).default([]),
})
const progressSchema = z.object({
  courseSlug: z.string().regex(/^[a-z0-9-]{2,80}$/),
  lessonSlug: z.string().regex(/^[a-z0-9-]{2,100}$/),
  score: z.number().int().min(0).max(100).optional(),
})
const assessmentSchema = z.object({
  topic: z.string().trim().min(2).max(80),
  score: z.number().int().min(0).max(100),
  assessmentTitle: z.string().trim().max(120).default('Quick check'),
})

router.get('/health', (_request, response) => {
  response.json({ status: 'ok', database: getDatabaseStatus(), ai: process.env.OPENAI_API_KEY ? 'configured' : 'guided-fallback' })
})

router.get('/dashboard', async (_request, response) => {
  response.json(await getDashboard())
})

router.get('/profile', async (_request, response) => {
  response.json({ profile: await getProfile() })
})

router.get('/courses', async (_request, response) => {
  response.json({ courses: await listCourses() })
})

router.get('/progress', async (_request, response) => {
  response.json({ progress: await listProgress() })
})

router.get('/assessments', async (_request, response) => {
  response.json({ assessments: await listAssessments() })
})

router.post('/assessments', async (request, response) => {
  const input = assessmentSchema.parse(request.body)
  const assessment = await createAssessment(input)
  response.status(201).json({ assessment, analysis: await runAnalysis() })
})

router.post('/progress/complete', async (request, response) => {
  const input = progressSchema.parse(request.body)
  await completeLesson(input.courseSlug, input.lessonSlug, input.score)
  response.status(201).json({ completed: true, dashboard: await getDashboard() })
})

router.get('/recommendations', async (_request, response) => {
  response.json({ recommendations: await listRecommendations() })
})

router.post('/recommendations/analyze', async (_request, response) => {
  const analysis = await runAnalysis()
  response.json({ analysis, recommendations: createRecommendations(analysis) })
})

router.post('/assistant/chat', async (request, response) => {
  const input = chatSchema.parse(request.body)
  try {
    response.json(await answerQuestion(input.message, input.history))
  } catch (error) {
    request.log?.error(error)
    response.status(502).json({ error: 'The learning assistant is temporarily unavailable. Please try again in a moment.' })
  }
})

export default router