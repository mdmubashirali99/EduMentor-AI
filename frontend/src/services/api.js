async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.')
  return body
}

export const api = {
  dashboard: () => request('/dashboard'),
  completeLesson: (courseSlug, lessonSlug) => request('/progress/complete', {
    method: 'POST',
    body: JSON.stringify({ courseSlug, lessonSlug }),
  }),
  analyze: () => request('/recommendations/analyze', { method: 'POST', body: '{}' }),
  submitAssessment: (assessment) => request('/assessments', {
    method: 'POST',
    body: JSON.stringify(assessment),
  }),
  chat: (message, history) => request('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  }),
}