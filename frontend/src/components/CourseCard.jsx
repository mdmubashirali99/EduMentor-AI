import { useState } from 'react'
import { ArrowRight, Check, Clock3, Play } from 'lucide-react'

export default function CourseCard({ course, onComplete, busy }) {
  const [imageFailed, setImageFailed] = useState(false)
  const isComplete = course.progress >= 100

  return (
    <article className={`course-card course-${course.accent || 'mint'}`}>
      <div className={`course-image ${imageFailed ? 'image-failed' : ''}`}>
        {!imageFailed && <img src={course.image} alt="" loading="lazy" onError={() => setImageFailed(true)} />}
        <span className="course-category">{course.category}</span>
        <span className="course-duration"><Clock3 size={13} /> {course.duration}</span>
      </div>
      <div className="course-content">
        <div className="course-title-row"><h3>{course.title}</h3><button className="icon-button tiny" aria-label={`More options for ${course.title}`} title="More course options"><ArrowRight size={16} /></button></div>
        <p className="course-description">{course.description}</p>
        <div className="course-progress-copy"><span>{course.progress}% complete</span><span>{Math.round((course.progress / 100) * course.lessons)} of {course.lessons} lessons</span></div>
        <div className="progress-track"><span style={{ width: `${course.progress}%` }} /></div>
        <div className="course-next"><div><span>UP NEXT</span><strong>{course.nextLesson}</strong></div><button className={`course-action ${isComplete ? 'completed' : ''}`} onClick={() => onComplete(course)} disabled={busy || isComplete}>
          {busy ? <span className="spinner" /> : isComplete ? <Check size={16} /> : <Play size={15} fill="currentColor" />}
          <span>{isComplete ? 'Completed' : 'Finish lesson'}</span>
        </button></div>
      </div>
    </article>
  )
}