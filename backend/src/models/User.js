import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: String, enum: ['student', 'instructor'], default: 'student' },
  major: { type: String, default: '' },
  year: { type: String, default: '' },
  weeklyGoal: { type: Number, default: 8 },
  streak: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', userSchema)