import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'
import { seedDatabase } from './store.js'

const port = Number(process.env.PORT) || 4000

if (process.env.MONGODB_URI) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
    await seedDatabase()
    console.info('MongoDB connected and demo learning data is ready.')
  } catch (error) {
    console.warn(`MongoDB is unavailable; using demo data. ${error.message}`)
  }
} else {
  console.info('MONGODB_URI is not set; using in-memory demo data.')
}

app.listen(port, () => console.info(`EduMentor API listening on http://localhost:${port}`))