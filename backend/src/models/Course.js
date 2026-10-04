import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  instructor: { type: String, default: '' },
  duration: { type: String, default: '' },
  lessons: { type: Number, default: 0 },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  nextLesson: { type: String, default: '' },
  image: { type: String, default: '' },
  accent: { type: String, default: 'mint' },
}, { timestamps: true })

export default mongoose.models.Course || mongoose.model('Course', courseSchema)