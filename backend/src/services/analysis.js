export function analyzeLearning(assessments) {
  const topics = new Map()

  for (const assessment of assessments) {
    const topic = assessment.topic.trim()
    const scores = topics.get(topic) ?? []
    scores.push(assessment.score)
    topics.set(topic, scores)
  }

  const results = [...topics.entries()].map(([topic, scores]) => {
    const average = Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    const level = average < 70 ? 'focus' : average >= 85 ? 'strong' : 'developing'
    return { topic, average, level, attempts: scores.length }
  }).sort((first, second) => first.average - second.average)

  return {
    topics: results,
    gaps: results.filter((result) => result.level === 'focus').map((result) => ({
      ...result,
      suggestion: `Review the core ideas in ${result.topic}, then try a short practice set to check your understanding.`,
    })),
    strengths: results.filter((result) => result.level === 'strong'),
  }
}

export function createRecommendations(analysis) {
  return analysis.gaps.map((gap, index) => ({
    id: `gap-${gap.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    type: 'practice',
    title: `${gap.topic} refresher`,
    description: `A focused ${Math.max(10, 20 - index * 3)}-minute practice session based on your recent results.`,
    reason: `Your recent average is ${gap.average}%.`,
    minutes: Math.max(10, 20 - index * 3),
    priority: 5 - Math.min(index, 3),
  }))
}