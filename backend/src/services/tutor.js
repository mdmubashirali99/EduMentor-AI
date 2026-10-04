import OpenAI from 'openai'

const fallbackReplies = [
  'Let’s break that down into a smaller idea first. Start by identifying what you already know, then connect it to one example. What part feels least clear?',
  'A useful way to approach this is to work through one concrete example before memorizing a rule. Share the problem you are working on and I can walk through the reasoning with you.',
  'Try explaining the concept in your own words, even roughly. I can help spot the missing step and build from there. What have you tried so far?',
]

export async function answerQuestion(message, history = []) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    const reply = message.toLowerCase().includes('study')
      ? 'Try a 25-minute focus block: review one idea, solve two practice questions without notes, then write down what still feels uncertain. Short retrieval practice is more useful than rereading when you want to check what stuck.'
      : fallbackReplies[message.length % fallbackReplies.length]
    return { reply, source: 'guided-fallback' }
  }

  const client = new OpenAI({ apiKey })
  const recentHistory = history.slice(-8).map(({ role, content }) => ({ role, content }))
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.45,
    messages: [
      {
        role: 'system',
        content: 'You are EduMentor, a patient college learning tutor. Teach step by step, use clear examples, ask a brief follow-up when it helps, and guide students toward understanding rather than simply completing graded work for them. Keep answers focused.',
      },
      ...recentHistory,
      { role: 'user', content: message },
    ],
  })
  const reply = completion.choices[0]?.message?.content?.trim()
  if (!reply) throw new Error('The AI provider returned an empty response.')
  return { reply, source: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' }
}