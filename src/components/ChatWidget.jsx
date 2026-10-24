import { useEffect, useRef, useState } from 'react'
import BuddyAvatar from './BuddyAvatar.jsx'
import { askGemini, hasGeminiKey } from '../utils/gemini.js'

export default function ChatWidget({ latestVitals }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi! I'm Pip. Ask me anything about staying healthy!" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, open])

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setError('')
    const next = [...messages, { role: 'user', text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const reply = await askGemini({
        history: next.slice(0, -1).map((m) => ({ role: m.role, text: m.text })),
        message: text,
        vitals: latestVitals,
      })
      setMessages((prev) => [...prev, { role: 'model', text: reply }])
    } catch (err) {
      setError(err.message || 'Pip could not answer right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="d-flex justify-content-between align-items-center border-bottom p-2 px-3">
            <span className="fw-bold small">💬 Chat with Pip</span>
            <button type="button" className="btn-close" aria-label="Close chat" onClick={() => setOpen(false)}></button>
          </div>


          <div ref={scrollRef} className="flex-fill overflow-y-auto p-2 d-flex flex-column gap-2">
            {messages.map((m, i) => (
              <div key={i} className={`d-flex ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                {m.role === 'model' && <div className="me-2"><BuddyAvatar mood="happy" size={26} /></div>}
                <div className={`p-2 px-3 rounded-4 small chat-bubble ${m.role === 'user' ? 'bg-primary text-white' : 'bg-light border'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-secondary small ps-2">Pip is typing…</div>}
          </div>

          {error && <div className="alert alert-danger small m-2 py-2">{error}</div>}

          <form className="d-flex gap-2 p-2 border-top" onSubmit={sendMessage}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!hasGeminiKey() || loading}
            />
            <button type="submit" className="btn btn-primary btn-sm rounded-pill" disabled={!hasGeminiKey() || loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button type="button" className="chat-toggle-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle chat">
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}
