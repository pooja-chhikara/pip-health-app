// Dashboard section: uploaded + clinic prescriptions, shown as simple points.
import { useRef, useState } from 'react'
import { fileToSmallDataUrl } from '../utils/api.js'
import { readPrescription } from '../utils/gemini.js'
import { saveItem, deleteItem, newId } from '../utils/vault.js'

export default function Prescriptions({ user, prescriptions, onChanged, onLogin }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [openImg, setOpenImg] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(''); setBusy(true)
    try {
      const image = await fileToSmallDataUrl(file)
      const r = await readPrescription(image)
      await saveItem(user.uid, 'prescriptions', newId(), {
        source: 'upload',
        title: r.diagnosis || 'Prescription',
        doctor: r.doctor || '',
        date: r.date || new Date().toISOString().slice(0, 10),
        bullets: r.bullets?.length ? r.bullets : ['Could not read this prescription clearly. Please ask your doctor.'],
        followUp: r.followUp || '',
        unclear: Boolean(r.unclear),
        image,
        createdAt: Date.now(),
      })
      await onChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this prescription?')) return
    await deleteItem(user.uid, 'prescriptions', id)
    onChanged()
  }

  const sorted = [...prescriptions].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

  return (
    <div className="mt-5" id="prescriptions">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-0">💊 My prescriptions</h5>
          <p className="text-secondary small mb-0">Upload a photo and Pip turns it into easy points.</p>
        </div>
        {user ? (
          <>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
            <button type="button" className="btn btn-outline-primary rounded-pill btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? 'Reading…' : '📷 Upload prescription'}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-outline-primary rounded-pill btn-sm" onClick={onLogin}>Log in to add</button>
        )}
      </div>

      {error && <div className="alert alert-danger small py-2">{error}</div>}

      {sorted.length === 0 ? (
        <div className="dashboard-stat-card text-center text-secondary small">
          No prescriptions yet. Upload a photo, or link your clinic in the Health Vault.
        </div>
      ) : (
        <div className="row g-3">
          {sorted.map((rx) => (
            <div className="col-md-6" key={rx.id}>
              <div className="dashboard-stat-card h-100">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <p className="fw-bold mb-0">{rx.title}</p>
                    <p className="text-secondary small mb-2">
                      {rx.date}{rx.doctor ? ` · ${rx.doctor}` : ''}
                    </p>
                  </div>
                  <span className={`badge ${rx.source === 'clinic' ? 'text-bg-info' : 'text-bg-light border'}`}>
                    {rx.source === 'clinic' ? 'From clinic' : 'Uploaded'}
                  </span>
                </div>
                {rx.unclear && <div className="alert alert-warning small py-1 px-2 mb-2">Some words were hard to read — check with your doctor.</div>}
                <ul className="small mb-2 ps-3">
                  {(rx.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                {rx.followUp && <p className="small mb-2">📅 Follow-up: {rx.followUp}</p>}
                <div className="d-flex gap-2">
                  {rx.image && <button className="btn btn-link btn-sm p-0" onClick={() => setOpenImg(rx.image)}>View photo</button>}
                  <button className="btn btn-link btn-sm p-0 text-danger ms-auto" onClick={() => handleDelete(rx.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {openImg && (
        <div className="floating-overlay" onClick={() => setOpenImg(null)}>
          <img src={openImg} alt="Prescription" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12 }} />
        </div>
      )}
    </div>
  )
}
