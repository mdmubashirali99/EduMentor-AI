import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'
import { seedDatabase, setDatabaseStatus } from './store.js'

const port = Number(process.env.PORT) || 4000

if (process.env.MONGODB_URI) {
  setDatabaseStatus('connecting')
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
    const ping = await mongoose.connection.db.admin().ping()
    if (ping.ok !== 1) throw new Error('MongoDB ping returned an unexpected result.')
    await seedDatabase()
    setDatabaseStatus('verified')
    console.info('MongoDB connection verified (ping: ok); demo learning data is ready.')
  } catch (error) {
    setDatabaseStatus('unavailable')
    await mongoose.disconnect().catch(() => {})
    const errorType = error instanceof Error ? error.name : 'UnknownError'
    console.warn(`MongoDB verification failed (${errorType}); using in-memory demo data. Check backend/.env privately and confirm database network access.`)
  }
} else {
  setDatabaseStatus('demo')
  console.info('MONGODB_URI is not set; using in-memory demo data.')
}

app.listen(port, () => console.info(`EduMentor API listening on http://localhost:${port}`))