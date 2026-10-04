import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeLearning, createRecommendations } from '../src/services/analysis.js'

test('analysis groups assessment scores and detects knowledge gaps', () => {
  const analysis = analyzeLearning([
    { topic: 'Probability', score: 50 },
    { topic: 'Probability', score: 70 },
    { topic: 'Writing', score: 92 },
  ])

  assert.equal(analysis.topics[0].average, 60)
  assert.equal(analysis.gaps[0].topic, 'Probability')
  assert.equal(analysis.strengths[0].topic, 'Writing')
})

test('recommendations prioritize each identified gap', () => {
  const recommendations = createRecommendations({
    gaps: [{ topic: 'Calculus', average: 62 }, { topic: 'Statistics', average: 68 }],
  })

  assert.equal(recommendations.length, 2)
  assert.match(recommendations[0].reason, /62%/)
  assert.ok(recommendations[0].priority > recommendations[1].priority)
})

test('analysis handles an empty assessment history', () => {
  assert.deepEqual(analyzeLearning([]), { topics: [], gaps: [], strengths: [] })
})