import mongoose from 'mongoose'

const learningProgressSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  courseSlug: { type: String, required: true },
  lessonSlug: { type: String, required: true },
  completed: { type: Boolean, default: false },
  score: { type: Number, min: 0, max: 100 },
  completedAt: { type: Date },
}, { timestamps: true })
learningProgressSchema.index({ userEmail: 1, courseSlug: 1, lessonSlug: 1 }, { unique: true })

export default mongoose.models.LearningProgress || mongoose.model('LearningProgress', learningProgressSchema)