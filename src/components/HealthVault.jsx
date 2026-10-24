// Health Vault: Records · Reminders · Patterns · Clinic
import { useRef, useState } from 'react'
import { fileToSmallDataUrl } from '../utils/api.js'
import { explainRecord } from '../utils/gemini.js'
import { saveItem, patchItem, deleteItem, newId } from '../utils/vault.js'
import { syncClinic, unlinkClinic } from '../utils/clinic.js'
import { SYMPTOMS, MOODS } from '../data/symptoms.js'
import { enablePush, pushConfigured } from '../utils/push.js'

const TABS = [
  ['records', '📁 Records'],
  ['reminders', '⏰ Reminders'],
  ['patterns', '📈 Patterns'],
  ['clinic', '🏥 Clinic'],
]

export default function HealthVault({ user, initialTab = 'records', records, reminders, history, link, onChanged, onClose }) {
  const [tab, setTab] = useState(initialTab)
  return (
    <div className="floating-overlay" onClick={onClose}>
      <div className="floating-window vault-window" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center border-bottom p-3">
          <h5 className="mb-0">🔐 Health Vault</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
        </div>
        <ul className="nav nav-pills nav-fill gap-1 p-2 border-bottom small">
          {TABS.map(([id, label]) => (
            <li className="nav-item" key={id}>
              <button className={`nav-link py-1 ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
            </li>
          ))}
        </ul>
        <div className="p-3">
          {tab === 'records' && <Records user={user} records={records} onChanged={onChanged} />}
          {tab === 'reminders' && <Reminders user={user} reminders={reminders} onChanged={onChanged} />}
          {tab === 'patterns' && <Patterns history={history} />}
          {tab === 'clinic' && <Clinic user={user} link={link} onChanged={onChanged} />}
        </div>
      </div>
    </div>
  )
}

// ---------------- Records ----------------
function Records({ user, records, onChanged }) {
  const fileRef = useRef(null)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function pickImage(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { setImage(await fileToSmallDataUrl(f)) } catch (err) { setError(err.message) }
  }

  async function add(e) {
    e.preventDefault()
    if (!title.trim() || (!text.trim() && !image)) return setError('Add a title and some text or a photo.')
    setError(''); setBusy('save')
    try {
      await saveItem(user.uid, 'records', newId(), { title: title.trim(), text: text.trim(), image, createdAt: Date.now() })
      setTitle(''); setText(''); setImage(null)
      await onChanged()
    } catch (err) { setError(err.message) } finally { setBusy('') }
  }

  async function explain(r) {
    setError(''); setBusy(r.id)
    try {
      const explanation = await explainRecord({ text: `${r.title}\n${r.text || ''}`, image: r.image })
      await patchItem(user.uid, 'records', r.id, { explanation })
      await onChanged()
    } catch (err) { setError(err.message) } finally { setBusy('') }
  }

  async function del(id) {
    if (!window.confirm('Delete this record?')) return
    await deleteItem(user.uid, 'records', id); onChanged()
  }

  const sorted = [...records].sort((a, b) => b.createdAt - a.createdAt)
  return (
    <>
      <form onSubmit={add} className="mb-3">
        <input className="form-control form-control-sm mb-2" placeholder="Title (e.g. Blood test, Jan 2026)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="Notes from the doctor or report…" value={text} onChange={(e) => setText(e.target.value)} />
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
        <div className="d-flex gap-2 align-items-center">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => fileRef.current?.click()}>📷 {image ? 'Change photo' : 'Add photo'}</button>
          {image && <img src={image} alt="" style={{ height: 34, borderRadius: 6 }} />}
          <button className="btn btn-primary btn-sm ms-auto" disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save record'}</button>
        </div>
      </form>
      {error && <div className="alert alert-danger small py-2">{error}</div>}
      {sorted.length === 0 && <p className="text-secondary small text-center">No records yet.</p>}
      {sorted.map((r) => (
        <div key={r.id} className="border rounded-3 p-2 mb-2">
          <div className="d-flex justify-content-between">
            <span className="fw-semibold small">{r.title}</span>
            <span className="text-secondary small">{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          {r.text && <p className="small mb-1">{r.text}</p>}
          {r.image && <img src={r.image} alt="" className="img-fluid rounded mb-1" style={{ maxHeight: 160 }} />}
          {r.explanation && <div className="bg-light rounded p-2 small mb-1" style={{ whiteSpace: 'pre-line' }}>🦄 {r.explanation}</div>}
          <div className="d-flex gap-3">
            <button className="btn btn-link btn-sm p-0" disabled={busy === r.id} onClick={() => explain(r)}>
              {busy === r.id ? 'Explaining…' : r.explanation ? 'Explain again' : '✨ Explain simply'}
            </button>
            <button className="btn btn-link btn-sm p-0 text-danger ms-auto" onClick={() => del(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  )
}

// ---------------- Reminders ----------------
function Reminders({ user, reminders, onChanged }) {
  const [title, setTitle] = useState('')
  const [doctor, setDoctor] = useState('')
  const [when, setWhen] = useState('')
  const [perm, setPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')

  async function add(e) {
    e.preventDefault()
    if (!title.trim() || !when) return
    await saveItem(user.uid, 'reminders', newId(), {
      source: 'manual', title: title.trim(), doctor: doctor.trim(), visitAt: new Date(when).getTime(),
      done: false, notified: false, createdAt: Date.now(),
    })
    setTitle(''); setDoctor(''); setWhen('')
    onChanged()
  }

  async function askPermission() {
    if (typeof Notification === 'undefined') return
    setPerm(await Notification.requestPermission())
  }

  const [pushMsg, setPushMsg] = useState('')
  async function turnOnPush() {
    setPushMsg('')
    try { await enablePush(user.uid); setPushMsg('✅ Alerts are on for this device, even when Pip is closed.') }
    catch (err) { setPushMsg(err.message) }
  }

  const toggle = async (r) => { await patchItem(user.uid, 'reminders', r.id, { done: !r.done }); onChanged() }
  const del = async (r) => { await deleteItem(user.uid, 'reminders', r.id); onChanged() }

  const now = Date.now()
  const upcoming = reminders.filter((r) => !r.done && r.visitAt >= now).sort((a, b) => a.visitAt - b.visitAt)
  const past = reminders.filter((r) => r.done || r.visitAt < now).sort((a, b) => b.visitAt - a.visitAt)

  return (
    <>
      {perm === 'default' && (
        <div className="alert alert-info small py-2 d-flex align-items-center gap-2">
          Get a pop-up before each visit.
          <button className="btn btn-primary btn-sm ms-auto" onClick={askPermission}>Turn on alerts</button>
        </div>
      )}
      {perm === 'denied' && <div className="alert alert-secondary small py-2">Pop-up alerts are blocked in this browser. You'll still see alerts inside Pip.</div>}

      {pushConfigured() && (
        <div className="d-flex align-items-center gap-2 mb-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={turnOnPush}>📲 Alerts when Pip is closed</button>
          {pushMsg && <span className="small">{pushMsg}</span>}
        </div>
      )}

      <form onSubmit={add} className="mb-3">
        <input className="form-control form-control-sm mb-2" placeholder="What is the visit for?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="d-flex gap-2">
          <input className="form-control form-control-sm" placeholder="Doctor (optional)" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
          <input type="datetime-local" className="form-control form-control-sm" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm mt-2 w-100">Add reminder</button>
      </form>

      <p className="fw-semibold small mb-1">Coming up</p>
      {upcoming.length === 0 && <p className="text-secondary small">Nothing coming up.</p>}
      {upcoming.map((r) => <ReminderRow key={r.id} r={r} onToggle={toggle} onDelete={del} />)}
      {past.length > 0 && <p className="fw-semibold small mb-1 mt-3">Done / past</p>}
      {past.slice(0, 8).map((r) => <ReminderRow key={r.id} r={r} onToggle={toggle} onDelete={del} />)}
      <p className="text-secondary small mt-2 mb-0">Pip reminds you a day before and an hour before, while Pip is open.</p>
    </>
  )
}

function ReminderRow({ r, onToggle, onDelete }) {
  return (
    <div className={`border rounded-3 p-2 mb-2 d-flex gap-2 align-items-start ${r.done ? 'opacity-50' : ''}`}>
      <input type="checkbox" className="form-check-input mt-1" checked={Boolean(r.done)} onChange={() => onToggle(r)} />
      <div className="flex-fill">
        <div className="small fw-semibold">
          {r.title} {r.source === 'clinic' && <span className="badge text-bg-info">clinic</span>}
          {r.status === 'cancelled' && <span className="badge text-bg-secondary ms-1">cancelled</span>}
        </div>
        <div className="small">{new Date(r.visitAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</div>
        {(r.doctor || r.place) && <div className="text-secondary small">{[r.doctor, r.place].filter(Boolean).join(' · ')}</div>}
      </div>
      <button className="btn btn-link btn-sm p-0 text-danger" onClick={() => onDelete(r)}>✕</button>
    </div>
  )
}

// ---------------- Patterns ----------------
function Patterns({ history }) {
  if (history.length < 2) return <p className="text-secondary small text-center">Do at least 2 check-ins and Pip will show patterns here.</p>

  const recent = history.slice(0, 14)
  const counts = {}
  recent.forEach((h) => (h.symptoms || []).forEach((s) => { counts[s] = (counts[s] || 0) + 1 }))
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const label = (id) => SYMPTOMS.find((s) => s.id === id) || { label: id, emoji: '•' }

  const temps = recent.map((h) => h.temperature).reverse()
  const maxT = Math.max(...temps), minT = Math.min(...temps)
  const trend = temps.length >= 3 ? temps[temps.length - 1] - temps[0] : 0
  const moods = {}
  recent.forEach((h) => { if (h.mood) moods[h.mood] = (moods[h.mood] || 0) + 1 })

  const notes = []
  top.filter(([, n]) => n >= 3).forEach(([id, n]) => notes.push(`${label(id).emoji} ${label(id).label} came up ${n} times. If it keeps happening, tell a grown-up or doctor.`))
  if (trend >= 0.8) notes.push('🌡️ Your temperature has been going up. Tell a grown-up.')
  if (maxT >= 38) notes.push(`🌡️ Highest temperature was ${maxT.toFixed(1)}°C.`)
  if ((moods.bad || 0) + (moods.meh || 0) >= 3) notes.push('💛 You have felt low a few times. Talking to someone you trust can help.')
  if (!notes.length) notes.push('✅ No worrying patterns. Keep it up!')

  return (
    <>
      <p className="text-secondary small">From your last {recent.length} check-ins.</p>
      <ul className="small ps-3">{notes.map((n, i) => <li key={i} className="mb-1">{n}</li>)}</ul>

      <p className="fw-semibold small mb-1">Temperature</p>
      <div className="d-flex align-items-end gap-1 mb-3" style={{ height: 70 }}>
        {temps.map((t, i) => {
          const h = 15 + ((t - Math.min(minT, 36)) / Math.max(1, maxT - Math.min(minT, 36))) * 55
          return <div key={i} title={`${t.toFixed(1)}°C`} className={t >= 38 ? 'bg-danger' : t >= 37.5 ? 'bg-warning' : 'bg-primary'} style={{ flex: 1, height: h, borderRadius: 4 }} />
        })}
      </div>

      <p className="fw-semibold small mb-1">Most common symptoms</p>
      {top.length === 0 ? <p className="small text-secondary">None 🎉</p> : top.slice(0, 5).map(([id, n]) => (
        <div key={id} className="d-flex align-items-center gap-2 small mb-1">
          <span style={{ width: 130 }}>{label(id).emoji} {label(id).label}</span>
          <div className="progress flex-fill" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${(n / recent.length) * 100}%` }} /></div>
          <span>{n}</span>
        </div>
      ))}

      <p className="fw-semibold small mb-1 mt-3">Moods</p>
      <div className="d-flex gap-3 small">
        {MOODS.map((m) => <span key={m.id}>{m.emoji} {moods[m.id] || 0}</span>)}
      </div>
    </>
  )
}

// ---------------- Clinic ----------------
function Clinic({ user, link, onChanged }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function doSync(c) {
    setError(''); setMsg(''); setBusy(true)
    try {
      const r = await syncClinic(user.uid, c)
      setMsg(`Linked to ${r.link.name}. Got ${r.prescriptions} prescription(s) and ${r.appointments} appointment(s).`)
      setCode('')
      await onChanged()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function unlink() {
    if (!window.confirm('Unlink this clinic? Saved prescriptions and reminders stay.')) return
    await unlinkClinic(user.uid); onChanged()
  }

  return (
    <>
      {link ? (
        <div className="border rounded-3 p-3 mb-3">
          <p className="fw-bold mb-1">🏥 {link.clinic}</p>
          <p className="small mb-1">Patient: {link.name} ({link.code})</p>
          <p className="small mb-1">Doctor: {link.doctor}</p>
          {link.allergies?.length > 0 && <p className="small mb-1 text-danger">Allergies: {link.allergies.join(', ')}</p>}
          <p className="text-secondary small mb-2">Last updated {new Date(link.syncedAt).toLocaleString()}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => doSync(link.code)}>{busy ? 'Updating…' : '🔄 Get latest from clinic'}</button>
            <button className="btn btn-outline-danger btn-sm ms-auto" onClick={unlink}>Unlink</button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) doSync(code) }} className="mb-3">
          <p className="small">Enter the patient code from your clinic. Pip will fetch your prescriptions and next appointments, and set reminders.</p>
          <div className="d-flex gap-2">
            <input className="form-control form-control-sm" placeholder="e.g. PT-1001" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Linking…' : 'Link'}</button>
          </div>
          <p className="text-secondary small mt-2 mb-0">Demo: practice codes PT-1001 to PT-1010.</p>
        </form>
      )}
      {msg && <div className="alert alert-success small py-2">{msg}</div>}
      {error && <div className="alert alert-danger small py-2">{error}</div>}
    </>
  )
}
