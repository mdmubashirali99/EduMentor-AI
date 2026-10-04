import { lazy, Suspense, useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  Menu,
  MessageCircleMore,
  Plus,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react'
import ChatAssistant from './components/ChatAssistant.jsx'
import AssessmentForm from './components/AssessmentForm.jsx'
import CourseCard from './components/CourseCard.jsx'
import { api } from './services/api.js'
import './styles.css'

const ProgressChart = lazy(() => import('./components/ProgressChart.jsx'))

const fallbackDashboard = {
  profile: { name: 'Jordan Student', email: 'jordan.lee@example.edu', major: 'Data Science', year: 'Junior', weeklyGoal: 8, streak: 6, avatar: 'JS' },
  stats: { hoursThisWeek: 7.8, lessonsCompleted: 24, averageScore: 75, weeklyGoal: 8, goalPercent: 98 },
  weeklyProgress: [
    { day: 'Mon', hours: 0.7 }, { day: 'Tue', hours: 1.3 }, { day: 'Wed', hours: 0.9 },
    { day: 'Thu', hours: 1.8 }, { day: 'Fri', hours: 1.1 }, { day: 'Sat', hours: 1.5 }, { day: 'Sun', hours: 0.5 },
  ],
  courses: [
    { slug: 'statistics-foundations', title: 'Statistics, made clear', category: 'DATA SCIENCE', description: 'Build intuition for probability, distributions, and inference.', instructor: 'Dr. Maya Chen', duration: '6h 20m', lessons: 12, progress: 68, nextLesson: 'Sampling & confidence intervals', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=960&q=82', accent: 'mint' },
    { slug: 'calculus-ii', title: 'Calculus II: the essentials', category: 'MATHEMATICS', description: 'Make integrals and series feel less abstract, one step at a time.', instructor: 'Prof. Daniel Ortiz', duration: '8h 10m', lessons: 16, progress: 42, nextLesson: 'Integration by parts', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=960&q=82', accent: 'coral' },
    { slug: 'academic-writing', title: 'Research writing studio', category: 'COMMUNICATION', description: 'Turn strong research into clear, confident academic writing.', instructor: 'Amara Wilson', duration: '4h 45m', lessons: 9, progress: 18, nextLesson: 'Building an argument', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=960&q=82', accent: 'blue' },
  ],
  recommendations: [
    { id: 'rec-probability', type: 'practice', title: 'A little more probability', description: 'Try a 12-minute practice set on conditional probability.', reason: 'Your last two checks suggest this topic could use another pass.', minutes: 12, priority: 5 },
    { id: 'rec-statistics', type: 'course', title: 'Sampling, without the guesswork', description: 'A visual walkthrough of sampling distributions and confidence intervals.', reason: 'It connects directly to your current statistics lesson.', minutes: 18, priority: 4 },
    { id: 'rec-recall', type: 'review', title: 'Quick recall: integration rules', description: 'Five short questions to make the core rules stick.', reason: 'A small review now can make the next calculus lesson easier.', minutes: 8, priority: 3 },
  ],
  analysis: {
    topics: [
      { topic: 'Probability', average: 61, level: 'focus', attempts: 2 },
      { topic: 'Calculus', average: 71, level: 'developing', attempts: 2 },
      { topic: 'Research methods', average: 78, level: 'developing', attempts: 1 },
      { topic: 'Academic writing', average: 90, level: 'strong', attempts: 2 },
    ],
    gaps: [{ topic: 'Probability', average: 61, level: 'focus', attempts: 2, suggestion: 'Review the core ideas in Probability, then try a short practice set to check your understanding.' }],
    strengths: [{ topic: 'Academic writing', average: 90, level: 'strong', attempts: 2 }],
  },
  activity: [
    { title: 'Probability quiz completed', detail: 'Statistics, made clear', time: 'Today, 9:42 AM', score: '64%' },
    { title: 'Lesson finished', detail: 'Limits & continuity', time: 'Yesterday, 4:16 PM' },
    { title: 'Weekly goal reached', detail: '8 hours of focused learning', time: 'Sunday, 7:30 PM' },
  ],
}

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My learning', icon: BookOpenCheck },
  { label: 'Insights', icon: ChartNoAxesCombined },
]

const greeting = () => 'Welcome'

function StatCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={17} strokeWidth={2} /></div>
      <div className="stat-details"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
      <ArrowUpRight className="stat-trend" size={16} />
    </article>
  )
}

function App() {
  const [dashboard, setDashboard] = useState(fallbackDashboard)
  const [activeView, setActiveView] = useState('Overview')
  const [chatOpen, setChatOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [busyCourse, setBusyCourse] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [assessmentOpen, setAssessmentOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [connection, setConnection] = useState('connecting')
  const [requestError, setRequestError] = useState('')

  useEffect(() => {
    let mounted = true
    api.dashboard()
      .then((data) => {
        if (!mounted) return
        setDashboard(data)
        setConnection(data.database === 'mongodb' ? 'mongodb' : 'demo')
      })
      .catch(() => {
        if (!mounted) return
        setConnection('offline')
        setRequestError('Showing sample learning data. Start the API to sync your progress.')
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const { profile, stats, courses, recommendations, analysis, activity, weeklyProgress } = dashboard
  const filteredCourses = courses.filter((course) => `${course.title} ${course.category}`.toLowerCase().includes(search.toLowerCase()))
  const currentGap = analysis.gaps[0]

  async function completeNextLesson(course) {
    setBusyCourse(course.slug)
    setRequestError('')
    const lessonSlug = course.nextLesson.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    try {
      const result = await api.completeLesson(course.slug, lessonSlug)
      setDashboard(result.dashboard)
      setConnection(result.dashboard.database === 'mongodb' ? 'mongodb' : 'demo')
      setNotice('Lesson completed. Your learning progress is up to date.')
    } catch {
      setDashboard((current) => ({
        ...current,
        courses: current.courses.map((item) => item.slug === course.slug ? { ...item, progress: Math.min(100, item.progress + Math.round(100 / item.lessons)) } : item),
        stats: { ...current.stats, lessonsCompleted: current.stats.lessonsCompleted + 1 },
      }))
      setNotice('Saved in this session. Reconnect the API to sync progress.')
    } finally {
      setBusyCourse('')
    }
  }

  async function refreshAnalysis() {
    setAnalyzing(true)
    try {
      const result = await api.analyze()
      setDashboard((current) => ({ ...current, analysis: result.analysis, recommendations: result.recommendations.length ? result.recommendations : current.recommendations }))
      setNotice('Your learning insights are up to date.')
    } catch {
      setNotice('Could not refresh insights. Please try again when the API is available.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function submitAssessment(assessment) {
    const result = await api.submitAssessment(assessment)
    const updatedDashboard = await api.dashboard().catch(() => null)
    setDashboard((current) => updatedDashboard || { ...current, analysis: result.analysis })
    setAssessmentOpen(false)
    setNotice('Assessment saved. Your learning plan has been updated.')
  }

  function renderOverview() {
    return (
      <>
        <div className="stats-grid">
          <StatCard icon={Clock3} label="Study time" value={`${stats.hoursThisWeek}h`} detail="of your 8h weekly goal" tone="green" />
          <StatCard icon={BookOpenCheck} label="Lessons finished" value={stats.lessonsCompleted} detail="across all your courses" tone="blue" />
          <StatCard icon={Target} label="Average score" value={`${stats.averageScore}%`} detail="up 6% this month" tone="coral" />
          <StatCard icon={Flame} label="Day streak" value={`${profile.streak} days`} detail="you’re building a habit" tone="yellow" />
        </div>

        <div className="overview-grid">
          <div className="overview-main">
            <Suspense fallback={<div className="chart-loading">Loading your week...</div>}><ProgressChart data={weeklyProgress} /></Suspense>
            <section className="section-block course-section">
              <div className="section-heading"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Your learning path</h2></div><button className="text-button" onClick={() => setActiveView('My learning')}>All courses <ArrowRight size={15} /></button></div>
              <div className="course-grid">{courses.slice(0, 2).map((course) => <CourseCard key={course.slug} course={course} onComplete={completeNextLesson} busy={busyCourse === course.slug} />)}</div>
            </section>
          </div>
          <aside className="overview-aside">
            <section className="panel goal-panel">
              <div className="panel-heading"><div><p className="eyebrow">A GOOD RHYTHM</p><h2>This week</h2></div><button className="icon-button tiny" aria-label="Weekly goal details" title="Weekly goal details"><CalendarDays size={16} /></button></div>
              <div className="goal-ring-wrap"><div className="goal-ring" style={{ '--goal-progress': `${Math.min(stats.goalPercent, 100) * 3.6}deg` }}><div><strong>{stats.goalPercent}%</strong><span>of goal</span></div></div><div className="goal-summary"><strong>{stats.hoursThisWeek} <span>of {stats.weeklyGoal} hrs</span></strong><p>{stats.goalPercent >= 100 ? 'You reached your weekly target.' : `${(stats.weeklyGoal - stats.hoursThisWeek).toFixed(1)} hours to your weekly goal.`}</p></div></div>
              <div className="goal-footer"><span className="tiny-avatar">JS</span><span>You're finding your rhythm.</span><Sparkles size={15} /></div>
            </section>

            <section className="focus-card">
              <div className="focus-top"><span><Sparkles size={13} /> YOUR NEXT BEST STEP</span><span className="focus-time"><Clock3 size={12} /> 12 min</span></div>
              <div className="focus-icon"><BrainCircuit size={20} /></div>
              <h3>{currentGap ? `Strengthen ${currentGap.topic.toLowerCase()}` : 'Keep your momentum going'}</h3>
              <p>{currentGap ? `${currentGap.suggestion}` : 'Your assessment results are looking strong. Keep practicing to make it stick.'}</p>
              <button onClick={() => setChatOpen(true)}>Work through it <ArrowRight size={15} /></button>
            </section>

            <section className="panel activity-panel">
              <div className="panel-heading"><div><p className="eyebrow">NICE WORK</p><h2>Recent activity</h2></div><button className="icon-button tiny" aria-label="View all activity" title="View all activity"><ChevronRight size={17} /></button></div>
              <div className="activity-list">{activity.slice(0, 3).map((item) => <div className="activity-item" key={item.title}><span className="activity-check"><Check size={13} /></span><div className="activity-copy"><strong>{item.title}</strong><span>{item.detail}</span><small>{item.time}</small></div>{item.score && <span className="activity-score">{item.score}</span>}</div>)}</div>
            </section>
          </aside>
        </div>

        <section className="recommendation-strip"><div className="recommendation-mark"><Lightbulb size={19} /></div><div className="recommendation-copy"><span>MADE FOR YOUR NEXT STUDY SESSION</span><strong>{recommendations[0]?.title || 'Your next study step'}</strong><p>{recommendations[0]?.description || 'Build on your recent progress with a quick review.'}</p></div><button className="recommendation-link" onClick={() => setActiveView('Insights')} aria-label="See your personalized learning insights"><ArrowRight size={18} /></button></section>
      </>
    )
  }

  function renderLearning() {
    return (
      <div className="page-content-block">
        <div className="subpage-heading"><div><p className="eyebrow">YOUR PERSONAL CURRICULUM</p><h2>Learning at your pace</h2><p>Pick up where you left off, or find a new topic to explore.</p></div><label className="course-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a course" aria-label="Find a course" /><kbd>/</kbd></label></div>
        <div className="learning-summary"><span><BookOpen size={16} /> {courses.length} courses in progress</span><span><Check size={15} /> {stats.lessonsCompleted} lessons completed</span><span><Clock3 size={15} /> {stats.hoursThisWeek} hours this week</span></div>
        {filteredCourses.length ? <div className="learning-course-grid">{filteredCourses.map((course) => <CourseCard key={course.slug} course={course} onComplete={completeNextLesson} busy={busyCourse === course.slug} />)}</div> : <div className="empty-state"><Search size={23} /><strong>No courses match “{search}”</strong><span>Try another title or subject.</span></div>}
      </div>
    )
  }

  function renderInsights() {
    return (
      <div className="page-content-block">
        <div className="subpage-heading insights-title"><div><p className="eyebrow">A CLEARER PICTURE</p><h2>Your learning, understood</h2><p>Patterns from your recent assessments, turned into practical next steps.</p></div><div className="insights-actions"><button className="secondary-button" onClick={() => setAssessmentOpen(true)}><Plus size={15} />Log an assessment</button><button className="primary-button" onClick={refreshAnalysis} disabled={analyzing}>{analyzing ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={16} />}{analyzing ? 'Updating...' : 'Refresh insights'}</button></div></div>
        <div className="insights-overview"><section className="panel insight-score-panel"><div className="insight-panel-title"><span className="insight-symbol"><Target size={19} /></span><div><p className="eyebrow">CURRENT AVERAGE</p><h3>{stats.averageScore}% <span>across {analysis.topics.length} topics</span></h3></div></div><div className="score-bars">{analysis.topics.map((topic) => <div className="score-row" key={topic.topic}><span>{topic.topic}</span><div className="score-track"><i className={`score-fill ${topic.level}`} style={{ width: `${topic.average}%` }} /></div><strong>{topic.average}%</strong></div>)}</div><div className="insight-legend"><span><i className="score-dot focus" /> Focus area</span><span><i className="score-dot developing" /> In progress</span><span><i className="score-dot strong" /> A strength</span></div></section>
          <section className="focus-card insights-focus"><div className="focus-top"><span><BrainCircuit size={14} /> LEARNING PATTERN</span><span className="signal-label">{currentGap ? 'Worth a revisit' : 'On track'}</span></div><div className="focus-icon"><Lightbulb size={20} /></div><h3>{currentGap ? `${currentGap.topic} is your best opportunity` : 'You’re building a strong foundation'}</h3><p>{currentGap ? `Your recent average is ${currentGap.average}%. Short recall sessions can help this idea click before your next lesson.` : 'Your assessment history is trending in the right direction. A little practice will keep the momentum.'}</p><button onClick={() => setChatOpen(true)}>Ask your study buddy <MessageCircleMore size={15} /></button></section></div>
        <div className="insights-lower"><section className="panel topic-panel"><div className="panel-heading"><div><p className="eyebrow">PERSONALIZED PLAN</p><h2>Good next steps</h2></div><span className="ai-tag"><Sparkles size={12} /> AI supported</span></div><div className="recommendation-list">{recommendations.map((item, index) => <article className="recommendation-item" key={item.id || item.title}><div className={`recommendation-index index-${index + 1}`}>{index + 1}</div><div className="recommendation-info"><strong>{item.title}</strong><p>{item.description}</p><span><Clock3 size={12} /> {item.minutes} min <i /> {item.reason}</span></div><button className="icon-button tiny" aria-label={`Ask about ${item.title}`} onClick={() => setChatOpen(true)}><ArrowRight size={16} /></button></article>)}</div></section><section className="panel strengths-panel"><div className="panel-heading"><div><p className="eyebrow">LOOK WHAT’S CLICKING</p><h2>Your strengths</h2></div><span className="strength-icon"><Zap size={17} /></span></div>{analysis.strengths.length ? analysis.strengths.map((topic) => <div className="strength-item" key={topic.topic}><div className="strength-head"><strong>{topic.topic}</strong><span>{topic.average}%</span></div><div className="strength-bar"><i style={{ width: `${topic.average}%` }} /></div><p>Consistent results across {topic.attempts} recent checks.</p></div>) : <p className="strength-empty">Complete a few more short assessments to see patterns emerge.</p>}<button className="text-button" onClick={() => setActiveView('My learning')}>Keep learning <ArrowRight size={15} /></button></section></div>
      </div>
    )
  }

  const headings = {
    Overview: 'Your learning, in focus.',
    'My learning': 'A path that moves with you.',
    Insights: 'Progress with a purpose.',
  }

  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <button className="brand-lockup" onClick={() => { setActiveView('Overview'); setMenuOpen(false) }} aria-label="EduMentor dashboard">
          <span className="brand-mark"><GraduationCap size={21} /></span><span className="brand-name">edu<span>mentor</span><sup>AI</sup></span>
        </button>
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">{navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeView === label ? 'active' : ''}`} onClick={() => { setActiveView(label); setMenuOpen(false) }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Insights' && <span className="nav-spark"><Sparkles size={12} /></span>}</button>)}</nav>
        <div className="sidebar-divider" />
        <div className="sidebar-label learning-label">YOUR LEARNING</div>
        <button className="subject-link" onClick={() => setActiveView('My learning')}><span className="subject-dot mint-dot" />Data Science <span>2</span></button>
        <button className="subject-link" onClick={() => setActiveView('My learning')}><span className="subject-dot coral-dot" />Mathematics <span>1</span></button>
        <button className="subject-link" onClick={() => setActiveView('My learning')}><span className="subject-dot blue-dot" />Communication <span>1</span></button>
        <div className="sidebar-grow" />
        <div className="sidebar-coach-card"><div className="coach-spark"><Sparkles size={16} /></div><strong>A study buddy, built around you.</strong><p>Questions, concepts, or a study plan. Start anywhere.</p><button onClick={() => setChatOpen(true)}>Ask a question <ArrowRight size={14} /></button><div className="coach-decoration" /></div>
        <button className="sidebar-help" onClick={() => setChatOpen(true)}><CircleHelp size={16} />Need a hand?</button>
        <button className="profile-button"><span className="profile-avatar">{profile.avatar}</span><span className="profile-info"><strong>{profile.name}</strong><small>{profile.major} · {profile.year}</small></span><ChevronDown size={15} /></button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Your space</span><ChevronRight size={14} /><strong>{activeView}</strong></div>
          <div className="topbar-actions"><div className={`connection-indicator ${connection}`}><i />{connection === 'mongodb' ? 'Synced' : connection === 'demo' ? 'Demo data' : connection === 'offline' ? 'Offline mode' : 'Connecting'}</div><button className="icon-button top-chat-button" aria-label="Open learning assistant" title="Open learning assistant" onClick={() => setChatOpen(true)}><MessageCircleMore size={19} /><span className="notification-dot" /></button><button className="icon-button" aria-label="Notifications" title="Notifications" onClick={() => setNotice('You’re all caught up. No new notifications.')}><Bell size={18} /></button><span className="topbar-avatar">{profile.avatar}</span></div>
        </header>

        <div className="page-wrap">
          <section className="page-heading"><div><h1>{activeView === 'Overview' ? `${greeting()}, ${profile.name}.` : headings[activeView]}</h1><p>{activeView === 'Overview' ? 'Curiosity makes progress personal.' : activeView === 'Insights' ? 'Your effort is adding up. Here’s what your learning patterns are telling us.' : 'Keep your curiosity moving. Your next lesson is right here.'}</p></div><button className="assistant-button" onClick={() => setChatOpen(true)}><span><Sparkles size={16} /></span>Ask your study buddy</button></section>
          {requestError && <div className="connection-note" role="status"><span><Lightbulb size={15} /></span>{requestError}<button onClick={() => setRequestError('')} aria-label="Dismiss message"><X size={15} /></button></div>}
          {activeView === 'Overview' ? renderOverview() : activeView === 'My learning' ? renderLearning() : renderInsights()}
          <footer className="page-footer"><span>Made for how you learn.</span><span><span className="footer-dot" /> Your progress is your own</span><button onClick={() => setChatOpen(true)}><CircleHelp size={13} /> Help</button></footer>
        </div>
      </main>

      {notice && <div className="toast" role="status"><span><Check size={15} /></span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}
      {assessmentOpen && <AssessmentForm onClose={() => setAssessmentOpen(false)} onSubmit={submitAssessment} />}
      <ChatAssistant open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

export default App
