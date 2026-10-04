import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
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