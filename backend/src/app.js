import cors from 'cors'
import express from 'express'
import { ZodError } from 'zod'
import api from './routes/api.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '32kb' }))
app.use('/api', api)
app.use((_request, response) => response.status(404).json({ error: 'That endpoint does not exist.' }))
app.use((error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({ error: 'Please check your input.', details: error.issues.map(({ path, message }) => ({ field: path.join('.'), message })) })
  }
  if (error instanceof SyntaxError && error.status === 400 && Object.hasOwn(error, 'body')) {
    return response.status(400).json({ error: 'Request body contains invalid JSON.' })
  }
  if (error.status === 413) {
    return response.status(413).json({ error: 'Request body is too large.' })
  }
  console.error(`Request failed (${error.name || 'Error'}).`)
  return response.status(500).json({ error: 'Something went wrong. Please try again.' })
})

export default app