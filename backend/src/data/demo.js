export const demoProfile = {
  name: 'Jordan Student',
  email: 'jordan.lee@example.edu',
  major: 'Data Science',
  year: 'Junior',
  weeklyGoal: 8,
  streak: 6,
  avatar: 'JS',
}

export const demoCourses = [
  {
    slug: 'statistics-foundations', title: 'Statistics, made clear', category: 'DATA SCIENCE',
    description: 'Build intuition for probability, distributions, and inference.', instructor: 'Dr. Maya Chen',
    duration: '6h 20m', lessons: 12, progress: 68, nextLesson: 'Sampling & confidence intervals',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=960&q=82', accent: 'mint',
  },
  {
    slug: 'calculus-ii', title: 'Calculus II: the essentials', category: 'MATHEMATICS',
    description: 'Make integrals and series feel less abstract, one step at a time.', instructor: 'Prof. Daniel Ortiz',
    duration: '8h 10m', lessons: 16, progress: 42, nextLesson: 'Integration by parts',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=960&q=82', accent: 'coral',
  },
  {
    slug: 'academic-writing', title: 'Research writing studio', category: 'COMMUNICATION',
    description: 'Turn strong research into clear, confident academic writing.', instructor: 'Amara Wilson',
    duration: '4h 45m', lessons: 9, progress: 18, nextLesson: 'Building an argument',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=960&q=82', accent: 'blue',
  },
]

export const demoAssessments = [
  { topic: 'Probability', score: 58 }, { topic: 'Probability', score: 64 },
  { topic: 'Calculus', score: 68 }, { topic: 'Calculus', score: 74 },
  { topic: 'Academic writing', score: 88 }, { topic: 'Academic writing', score: 92 },
  { topic: 'Research methods', score: 78 },
]

export const demoRecommendations = [
  {
    id: 'rec-probability', type: 'practice', title: 'A little more probability',
    description: 'Try a 12-minute practice set on conditional probability.', reason: 'Your last two checks suggest this topic could use another pass.',
    minutes: 12, priority: 5,
  },
  {
    id: 'rec-statistics', type: 'course', title: 'Sampling, without the guesswork',
    description: 'A visual walkthrough of sampling distributions and confidence intervals.', reason: 'It connects directly to your current statistics lesson.',
    minutes: 18, priority: 4,
  },
  {
    id: 'rec-recall', type: 'review', title: 'Quick recall: integration rules',
    description: 'Five short questions to make the core rules stick.', reason: 'A small review now can make the next calculus lesson easier.',
    minutes: 8, priority: 3,
  },
]

export const demoWeeklyProgress = [
  { day: 'Mon', hours: 0.7 }, { day: 'Tue', hours: 1.3 }, { day: 'Wed', hours: 0.9 },
  { day: 'Thu', hours: 1.8 }, { day: 'Fri', hours: 1.1 }, { day: 'Sat', hours: 1.5 }, { day: 'Sun', hours: 0.5 },
]

export const demoActivity = [
  { title: 'Probability quiz completed', detail: 'Statistics, made clear', time: 'Today, 9:42 AM', score: '64%' },
  { title: 'Lesson finished', detail: 'Limits & continuity', time: 'Yesterday, 4:16 PM' },
  { title: 'Weekly goal reached', detail: '8 hours of focused learning', time: 'Sunday, 7:30 PM' },
]