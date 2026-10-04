import { useState } from 'react'
import { Check, LoaderCircle, X } from 'lucide-react'

export default function AssessmentForm({ onClose, onSubmit }) {
  const [topic, setTopic] = useState('Probability')
  const [score, setScore] = useState('70')
  const [assessmentTitle, setAssessmentTitle] = useState('Quick check')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSubmit({ topic, score: Number(score), assessmentTitle })
    } catch (submitError) {
      setError(submitError.message || 'Could not save this result.')
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="assessment-modal" role="dialog" aria-modal="true" aria-labelledby="assessment-title">
        <header className="assessment-modal-header"><span className="assessment-modal-mark"><Check size={18} /></span><div><p className="eyebrow">A LITTLE FEEDBACK GOES A LONG WAY</p><h2 id="assessment-title">Log an assessment</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close assessment form"><X size={18} /></button></header>
        <p className="assessment-intro">Add a recent result to tune your learning plan to what you know today.</p>
        <form className="assessment-form" onSubmit={handleSubmit}>
          <label>Topic<select value={topic} onChange={(event) => setTopic(event.target.value)}><option>Probability</option><option>Calculus</option><option>Research methods</option><option>Academic writing</option></select></label>
          <label>Assessment name<input value={assessmentTitle} onChange={(event) => setAssessmentTitle(event.target.value)} required minLength={2} maxLength={120} /></label>
          <label>Score <span className="field-hint">0 to 100</span><div className="score-input-wrap"><input type="number" value={score} onChange={(event) => setScore(event.target.value)} required min="0" max="100" step="1" /><span>%</span></div></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="assessment-modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}{busy ? 'Saving...' : 'Save result'}</button></div>
        </form>
      </section>
    </div>
  )
}