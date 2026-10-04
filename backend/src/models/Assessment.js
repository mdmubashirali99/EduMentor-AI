import mongoose from 'mongoose'

const assessmentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  assessmentTitle: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema)