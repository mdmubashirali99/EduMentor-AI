import Assessment from './models/Assessment.js'
import Course from './models/Course.js'
import LearningProgress from './models/LearningProgress.js'
import Recommendation from './models/Recommendation.js'
import User from './models/User.js'
import {
  demoActivity,
  demoAssessments,
  demoCourses,
  demoProfile,
  demoRecommendations,
  demoWeeklyProgress,
} from './data/demo.js'
import { analyzeLearning } from './services/analysis.js'

const demoCompletedLessons = new Set(['statistics-foundations:probability-basics', 'calculus-ii:limits-continuity'])
const email = demoProfile.email

export function isDatabaseConnected() {
  return User.db.readyState === 1
}

export async function seedDatabase() {
  await User.updateOne({ email }, { $setOnInsert: demoProfile }, { upsert: true })
  for (const course of demoCourses) {
    await Course.updateOne({ slug: course.slug }, { $setOnInsert: course }, { upsert: true })
  }
  if (await Assessment.countDocuments({ userEmail: email }) === 0) {
    await Assessment.insertMany(demoAssessments.map((assessment) => ({ ...assessment, userEmail: email })))
  }
  if (await Recommendation.countDocuments({ userEmail: email }) === 0) {
    await Recommendation.insertMany(demoRecommendations.map(({ id, ...recommendation }) => ({ ...recommendation, userEmail: email })))
  }
  if (await LearningProgress.countDocuments({ userEmail: email }) === 0) {
    await LearningProgress.insertMany([...demoCompletedLessons].map((key) => {
      const [courseSlug, lessonSlug] = key.split(':')
      return { userEmail: email, courseSlug, lessonSlug, completed: true, completedAt: new Date() }
    }))
  }
}

export async function getDashboard() {
  if (!isDatabaseConnected()) {
    const assessments = demoAssessments
    const averageScore = assessments.length
      ? Math.round(assessments.reduce((sum, result) => sum + result.score, 0) / assessments.length)
      : 0
    return {
      profile: structuredClone(demoProfile),
      courses: structuredClone(demoCourses),
      recommendations: structuredClone(demoRecommendations),
      weeklyProgress: structuredClone(demoWeeklyProgress),
      activity: structuredClone(demoActivity),
      analysis: analyzeLearning(assessments),
      stats: { hoursThisWeek: 7.8, lessonsCompleted: 24, averageScore, weeklyGoal: 8, goalPercent: 98 },
      database: 'demo',
    }
  }

  const [profile, courses, recommendations, assessments, progress] = await Promise.all([
    User.findOne({ email }).lean(),
    Course.find().sort({ title: 1 }).lean(),
    Recommendation.find({ userEmail: email }).sort({ priority: -1 }).lean(),
    Assessment.find({ userEmail: email }).lean(),
    LearningProgress.find({ userEmail: email, completed: true }).lean(),
  ])
  const analysis = analyzeLearning(assessments)
  const averageScore = assessments.length
    ? Math.round(assessments.reduce((sum, result) => sum + result.score, 0) / assessments.length)
    : 0
  const completionTotal = courses.reduce((sum, course) => sum + course.progress, 0)
  return {
    profile: { ...profile, avatar: profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() },
    courses,
    recommendations: recommendations.map(({ _id, __v, userEmail, ...item }) => ({ ...item, id: String(_id) })),
    weeklyProgress: demoWeeklyProgress,
    activity: demoActivity,
    analysis,
    stats: {
      hoursThisWeek: 7.8,
      lessonsCompleted: progress.length,
      averageScore,
      weeklyGoal: profile.weeklyGoal,
      goalPercent: Math.min(100, Math.round((7.8 / profile.weeklyGoal) * 100)),
      completionPercent: courses.length ? Math.round(completionTotal / courses.length) : 0,
    },
    database: 'mongodb',
  }
}

export async function getProfile() {
  if (!isDatabaseConnected()) return structuredClone(demoProfile)
  const profile = await User.findOne({ email }).lean()
  return profile ? { ...profile, avatar: profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() } : null
}

export async function listCourses() {
  return isDatabaseConnected() ? Course.find().sort({ title: 1 }).lean() : structuredClone(demoCourses)
}

export async function listAssessments() {
  if (isDatabaseConnected()) return Assessment.find({ userEmail: email }).sort({ completedAt: -1 }).lean()
  return structuredClone(demoAssessments)
}

export async function createAssessment(input) {
  if (isDatabaseConnected()) {
    return Assessment.create({ ...input, userEmail: email })
  }
  demoAssessments.push({ ...input, completedAt: new Date() })
  return structuredClone(demoAssessments.at(-1))
}

export async function listProgress() {
  if (isDatabaseConnected()) return LearningProgress.find({ userEmail: email }).sort({ updatedAt: -1 }).lean()
  return [...demoCompletedLessons].map((key) => {
    const [courseSlug, lessonSlug] = key.split(':')
    return { userEmail: email, courseSlug, lessonSlug, completed: true }
  })
}

export async function completeLesson(courseSlug, lessonSlug, score) {
  if (isDatabaseConnected()) {
    await LearningProgress.updateOne(
      { userEmail: email, courseSlug, lessonSlug },
      { $set: { completed: true, completedAt: new Date(), ...(score === undefined ? {} : { score }) } },
      { upsert: true },
    )
    const course = await Course.findOne({ slug: courseSlug })
    if (course) {
      const completed = await LearningProgress.countDocuments({ userEmail: email, courseSlug, completed: true })
      course.progress = Math.min(100, Math.max(course.progress, Math.round((completed / course.lessons) * 100)))
      await course.save()
    }
    if (score !== undefined) await Assessment.create({ userEmail: email, topic: courseSlug === 'statistics-foundations' ? 'Probability' : 'Course review', score, assessmentTitle: lessonSlug })
    return
  }

  demoCompletedLessons.add(`${courseSlug}:${lessonSlug}`)
  const course = demoCourses.find((item) => item.slug === courseSlug)
  if (course) course.progress = Math.min(100, course.progress + 8)
}

export async function listRecommendations() {
  if (isDatabaseConnected()) {
    return Recommendation.find({ userEmail: email }).sort({ priority: -1 }).lean()
  }
  return structuredClone(demoRecommendations)
}

export async function runAnalysis() {
  const assessments = isDatabaseConnected()
    ? await Assessment.find({ userEmail: email }).lean()
    : demoAssessments
  return analyzeLearning(assessments)
}