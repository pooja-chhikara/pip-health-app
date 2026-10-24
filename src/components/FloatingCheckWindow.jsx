import { useState } from 'react'
import { SYMPTOMS, MOODS, AVATARS } from '../data/symptoms.js'
import { getHealthInsight } from '../logic/healthLogic.js'
import { askGemini, hasGeminiKey } from '../utils/gemini.js'
import BuddyAvatar from './BuddyAvatar.jsx'
import AdviceCard from './AdviceCard.jsx'

export default function FloatingCheckWindow({
  onClose,
  initialTab = 'check',
  profile,
  onSetProfile,
  history,
  onSaveCheckIn,
}) {
  const [tab, setTab] = useState(profile ? initialTab : 'check')
  const [step, setStep] = useState(profile ? 'form' : 'profile')

  // quick profile setup fields
  const [name, setName] = useState('')
  const [age, setAge] = useState(10)
  const [avatar, setAvatar] = useState(AVATARS[0])

  // vitals form fields
  const [symptoms, setSymptoms] = useState([])
  const [mood, setMood] = useState(null)
  const [temperature, setTemperature] = useState(37.0)
  const [heartRate, setHeartRate] = useState(80)
  const [result, setResult] = useState(null)

  const [geminiText, setGeminiText] = useState('')
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [geminiError, setGeminiError] = useState('')

  function toggleSymptom(id) {
    setSymptoms((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  function handleProfileSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSetProfile({ name: name.trim(), age: Number(age), avatar })
    setStep('form')
  }

  function handleVitalsSubmit(e) {
    e.preventDefault()
    const insight = getHealthInsight({ symptoms, temperature, heartRate, mood })
    setResult(insight)
    onSaveCheckIn({ symptoms, mood, temperature, heartRate, insight })
    setStep('result')
  }

  function resetCheck() {
    setSymptoms([])
    setMood(null)
    setTemperature(37.0)
    setHeartRate(80)
    setResult(null)
    setGeminiText('')
    setGeminiError('')
    setStep('form')
  }

  async function askGeminiForMore() {
    setGeminiLoading(true)
    setGeminiError('')
    try {
      const reply = await askGemini({
        message:
          'Using the check-in parameters below, write a short, kid-friendly explanation of what might be going on ' +
          "and 1-2 gentle everyday wellness tips. Do not diagnose. If anything looks concerning, say to tell a grown-up.",
        vitals: { symptoms, mood, temperature, heartRate },
      })
      setGeminiText(reply)
    } catch (err) {
      setGeminiError(err.message || 'Could not reach Gemini.')
    } finally {
      setGeminiLoading(false)
    }
  }

  return (
    <div className="floating-overlay" onClick={onClose}>
      <div className="floating-window" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center border-bottom p-3">
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-pill ${tab === 'check' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTab('check')}
            >
              Check vitals
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill ${tab === 'history' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTab('history')}
              disabled={!profile}
            >
              History
            </button>
          </div>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
        </div>

        <div className="p-3">
          {tab === 'check' && step === 'profile' && (
            <div className="text-center">
              <BuddyAvatar mood="happy" size={72} />
              <h5 className="mt-2">Quick setup</h5>
              <p className="text-secondary small">Tell Pip a little about yourself first.</p>
              <form className="text-start" onSubmit={handleProfileSubmit}>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Age</label>
                  <input type="number" className="form-control" min={4} max={17} value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Avatar</label>
                  <div className="d-flex flex-wrap gap-2">
                    {AVATARS.map((a) => (
                      <button
                        type="button"
                        key={a}
                        className={`btn btn-outline-primary avatar-pick ${avatar === a ? 'active' : ''}`}
                        onClick={() => setAvatar(a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 rounded-pill">Continue</button>
              </form>
            </div>
          )}

          {tab === 'check' && step === 'form' && (
            <form onSubmit={handleVitalsSubmit}>
              <h5 className="mb-1">How are you feeling{profile ? `, ${profile.name}` : ''}?</h5>
              <p className="text-secondary small">Pick anything that matches, then fill in your vitals.</p>

              <h6 className="text-uppercase text-secondary small fw-bold mt-3">Symptoms</h6>
              <div className="row g-2 mb-3">
                {SYMPTOMS.map((s) => (
                  <div className="col-6" key={s.id}>
                    <button
                      type="button"
                      className={`btn btn-outline-secondary w-100 symptom-chip ${symptoms.includes(s.id) ? 'active' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      <span className="me-1">{s.emoji}</span>
                      <span className="small">{s.label}</span>
                    </button>
                  </div>
                ))}
              </div>

              <h6 className="text-uppercase text-secondary small fw-bold">Overall mood</h6>
              <div className="d-flex gap-2 mb-3">
                {MOODS.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className={`btn btn-outline-secondary flex-fill mood-chip ${mood === m.id ? 'active' : ''}`}
                    onClick={() => setMood(m.id)}
                  >
                    <div className="fs-5">{m.emoji}</div>
                    <div className="small">{m.label}</div>
                  </button>
                ))}
              </div>

              <h6 className="text-uppercase text-secondary small fw-bold">Vitals</h6>
              <div className="card border-0 bg-light p-3 mb-2">
                <div className="d-flex justify-content-between fw-bold small mb-2">
                  <span>🌡️ Temperature</span>
                  <span className="text-primary font-monospace">{temperature.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="34"
                  max="41"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
              </div>
              <div className="card border-0 bg-light p-3 mb-3">
                <div className="d-flex justify-content-between fw-bold small mb-2">
                  <span>❤️ Heart rate</span>
                  <span className="text-primary font-monospace">{heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="40"
                  max="160"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="btn btn-warning w-100 rounded-pill fw-bold">
                Ask Pip 🔮
              </button>
            </form>
          )}

          {tab === 'check' && step === 'result' && result && (
            <div>
              <h5 className="mb-3">Here's what Pip thinks 🧠</h5>
              <AdviceCard insight={result} onDone={resetCheck} />

              <div className="card border-0 bg-light p-3 mt-3">
                <h6 className="mb-2">✨ Ask Gemini to explain more</h6>
                {!hasGeminiKey() ? (
                  <p className="small text-secondary mb-0">
                    Gemini isn't configured yet — add VITE_GEMINI_API_KEY to your .env file.
                  </p>
                ) : geminiText ? (
                  <p className="small mb-0">{geminiText}</p>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill align-self-start"
                    onClick={askGeminiForMore}
                    disabled={geminiLoading}
                  >
                    {geminiLoading ? 'Asking Gemini…' : 'Ask Gemini'}
                  </button>
                )}
                {geminiError && <p className="small text-danger mb-0 mt-2">{geminiError}</p>}
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div>
              <h5 className="mb-3">Check-in history</h5>
              {history.length === 0 ? (
                <p className="text-secondary small">No check-ins logged yet.</p>
              ) : (
                <ul className="list-group">
                  {history.map((e) => (
                    <li
                      key={e.id}
                      className={`list-group-item d-flex justify-content-between align-items-center border-start border-4 ${
                        e.insight.urgency === 'urgent'
                          ? 'border-danger'
                          : e.insight.urgency === 'caution'
                          ? 'border-warning'
                          : 'border-success'
                      }`}
                    >
                      <div>
                        <p className="fw-bold small mb-0">{e.insight.headline}</p>
                        <p className="text-secondary small mb-0">
                          {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &middot;{' '}
                          {e.temperature.toFixed(1)}°C &middot; {e.heartRate} bpm
                        </p>
                      </div>
                      <div>{e.symptoms.length === 0 ? '✨' : e.symptoms.slice(0, 3).map((s) => SYMPTOMS.find((x) => x.id === s)?.emoji).join('')}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
