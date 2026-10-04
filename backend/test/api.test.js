import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import app from '../src/app.js'

let server
let baseUrl

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api`
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('health, student profile, and dashboard return usable demo data', async () => {
  const [healthResponse, profileResponse, dashboardResponse] = await Promise.all([
    fetch(`${baseUrl}/health`), fetch(`${baseUrl}/profile`), fetch(`${baseUrl}/dashboard`),
  ])
  const health = await healthResponse.json()
  const profile = await profileResponse.json()
  const dashboard = await dashboardResponse.json()

  assert.equal(health.status, 'ok')
  assert.equal(health.database, 'demo')
  assert.equal(profile.profile.name, 'Jordan Student')
  assert.equal(dashboard.courses.length, 3)
  assert.ok(dashboard.analysis.gaps.length > 0)
})

test('assessment endpoint validates input and updates learning analysis', async () => {
  const invalidResponse = await fetch(`${baseUrl}/assessments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: '', score: 140 }),
  })
  const validResponse = await fetch(`${baseUrl}/assessments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Probability', score: 80, assessmentTitle: 'Conditional probability' }),
  })
  const invalid = await invalidResponse.json()
  const valid = await validResponse.json()

  assert.equal(invalidResponse.status, 400)
  assert.ok(invalid.details.length >= 2)
  assert.equal(validResponse.status, 201)
  assert.equal(valid.assessment.topic, 'Probability')
  assert.ok(valid.analysis.topics.some((topic) => topic.topic === 'Probability'))
})

test('malformed and oversized JSON receive safe client errors', async () => {
  const malformedResponse = await fetch(`${baseUrl}/assessments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad',
  })
  const oversizedResponse = await fetch(`${baseUrl}/assessments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'x'.repeat(33 * 1024) }),
  })

  assert.equal(malformedResponse.status, 400)
  assert.deepEqual(await malformedResponse.json(), { error: 'Request body contains invalid JSON.' })
  assert.equal(oversizedResponse.status, 413)
  assert.deepEqual(await oversizedResponse.json(), { error: 'Request body is too large.' })
})

test('blank tutor questions and malformed progress fields are rejected', async () => {
  const chatResponse = await fetch(`${baseUrl}/assistant/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' }),
  })
  const progressResponse = await fetch(`${baseUrl}/progress/complete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseSlug: 'not a slug', lessonSlug: '' }),
  })

  assert.equal(chatResponse.status, 400)
  assert.equal(progressResponse.status, 400)
  assert.equal((await chatResponse.json()).error, 'Please check your input.')
  assert.equal((await progressResponse.json()).details.length, 2)
})

test('progress completion persists a lesson in the demo store', async () => {
  const response = await fetch(`${baseUrl}/progress/complete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseSlug: 'academic-writing', lessonSlug: 'building-an-argument' }),
  })
  const body = await response.json()

  assert.equal(response.status, 201)
  assert.equal(body.completed, true)
  assert.ok(body.dashboard.courses.find((course) => course.slug === 'academic-writing').progress > 18)
})

test('AI assistant answers through the configured fallback when no key is set', async () => {
  const response = await fetch(`${baseUrl}/assistant/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'How should I study for my next quiz?' }),
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.source, 'guided-fallback')
  assert.match(body.reply, /focus block/)
})

test('AI provider failures return a safe 502 response', async () => {
  const originalKey = process.env.OPENAI_API_KEY
  const originalBaseUrl = process.env.OPENAI_BASE_URL
  const mockProvider = createServer((request, response) => {
    request.resume()
    response.writeHead(503, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: { message: 'Local mock provider unavailable.' } }))
  })
  await new Promise((resolve) => mockProvider.listen(0, '127.0.0.1', resolve))

  process.env.OPENAI_API_KEY = 'local-test-only'
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${mockProvider.address().port}/v1`
  try {
    const response = await fetch(`${baseUrl}/assistant/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Explain this concept.' }),
    })
    assert.equal(response.status, 502)
    assert.deepEqual(await response.json(), {
      error: 'The learning assistant is temporarily unavailable. Please try again in a moment.',
    })
  } finally {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = originalKey
    if (originalBaseUrl === undefined) delete process.env.OPENAI_BASE_URL
    else process.env.OPENAI_BASE_URL = originalBaseUrl
    await new Promise((resolve, reject) => mockProvider.close((error) => error ? reject(error) : resolve()))
  }
})