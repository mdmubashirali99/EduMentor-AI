import { useEffect, useRef, useState } from 'react'
import { ArrowUp, BookOpen, Check, MessageCircleMore, Sparkles, X } from 'lucide-react'
import { api } from '../services/api.js'

const startingPrompts = [
  'Can you explain confidence intervals?',
  'Help me study more effectively',
  'Quiz me on integration by parts',
]

export default function ChatAssistant({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey there! What are you working through today? We can unpack a tricky idea, work an example, or make a quick study plan.' },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])
  useEffect(() => {
    if (open) document.getElementById('tutor-input')?.focus()
  }, [open])

  async function sendMessage(value = draft) {
    const message = value.trim()
    if (!message || busy) return
    const history = messages.map(({ role, content }) => ({ role, content }))
    setMessages((current) => [...current, { role: 'user', content: message }])
    setDraft('')
    setError('')
    setBusy(true)
    try {
      const result = await api.chat(message, history)
      setMessages((current) => [...current, { role: 'assistant', content: result.reply, source: result.source, model: result.model }])
    } catch {
      setError('Could not reach the assistant. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <>
      <button className="chat-scrim" aria-label="Close learning assistant" onClick={onClose} />
      <aside className="chat-drawer" aria-label="AI learning assistant">
        <header className="chat-header">
          <div className="chat-brand-mark"><Sparkles size={18} /></div>
          <div className="chat-heading"><strong>Study buddy</strong><span><i /> Ready when you are</span></div>
          <button className="icon-button" onClick={onClose} aria-label="Close assistant"><X size={18} /></button>
        </header>
        <div className="chat-context"><BookOpen size={15} /><span>Learning with you, one idea at a time</span></div>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
              {message.role === 'assistant' && <span className="message-avatar"><Sparkles size={13} /></span>}
              {message.role === 'assistant' ? (
                <div className="assistant-message-content">
                  <p>{message.content}</p>
                  {message.source && <span className="message-source">{message.source === 'openai' ? `OpenAI · ${message.model}` : 'Guided fallback · not model-generated'}</span>}
                </div>
              ) : <p>{message.content}</p>}
            </div>
          ))}
          {busy && <div className="message-row assistant"><span className="message-avatar"><Sparkles size={13} /></span><p className="typing"><i /><i /><i /></p></div>}
          {error && <div className="chat-error" role="alert">{error}<button onClick={() => sendMessage(messages.at(-1)?.content)}>Try again</button></div>}
          <div ref={bottomRef} />
        </div>
        {messages.length === 1 && <div className="prompt-suggestions"><span>TRY ASKING</span>{startingPrompts.map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}<ArrowUp size={13} /></button>)}</div>}
        <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
          <label className="sr-only" htmlFor="tutor-input">Ask a learning question</label>
          <textarea id="tutor-input" rows="2" maxLength="2000" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }} placeholder="Ask anything you're learning..." />
          <div className="composer-footer"><span><Check size={12} /> Your learning stays yours</span><button type="submit" disabled={!draft.trim() || busy} aria-label="Send message"><ArrowUp size={18} /></button></div>
        </form>
        <div className="chat-disclaimer"><MessageCircleMore size={12} /> AI can make mistakes. Check important information.</div>
      </aside>
    </>
  )
}