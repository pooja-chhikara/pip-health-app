import { useState } from 'react'
import { AVATARS } from '../data/symptoms.js'
import BuddyAvatar from './BuddyAvatar.jsx'

export default function ProfileSettings({ user, profile, onClose, onSaveProfile, onResetData, onLogout }) {
  const [name, setName] = useState(profile?.name || '')
  const [age, setAge] = useState(profile?.age || 10)
  const [avatar, setAvatar] = useState(profile?.avatar || AVATARS[0])
  const [confirmReset, setConfirmReset] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSaveProfile({ name: name.trim(), age: Number(age), avatar })
    onClose()
  }

  return (
    <div className="floating-overlay" onClick={onClose}>
      <div className="floating-window" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center border-bottom p-3">
          <h5 className="mb-0">Profile settings</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
        </div>

        <form className="p-3" onSubmit={handleSubmit}>
          <div className="text-center mb-3">
            <BuddyAvatar mood="happy" size={64} />
          </div>

          {user && (
            <div className="alert alert-light border small d-flex justify-content-between align-items-center mb-3">
              <span>Logged in as <strong>{user.email}</strong></span>
              <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={onLogout}>
                Log out
              </button>
            </div>
          )}

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

          <button type="submit" className="btn btn-primary w-100 rounded-pill mb-3">Save</button>

          <hr />

          {confirmReset ? (
            <div>
              <p className="small text-secondary">Clear every saved check-in? This can't be undone.</p>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger btn-sm rounded-pill" onClick={onResetData}>
                  Yes, clear my data
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setConfirmReset(true)}>
              Clear all my data
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
