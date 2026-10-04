import mongoose from 'mongoose'

const recommendationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  type: { type: String, enum: ['course', 'practice', 'review'], default: 'course' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  reason: { type: String, default: '' },
  courseSlug: { type: String, default: '' },
  minutes: { type: Number, default: 15 },
  priority: { type: Number, min: 1, max: 5, default: 3 },
}, { timestamps: true })

export default mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema)