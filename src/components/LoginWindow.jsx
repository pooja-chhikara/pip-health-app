import { useState } from 'react'
import { signUp, logIn, friendlyAuthError } from '../utils/auth.js'
import CountrySelect from './CountrySelect.jsx'
import BuddyAvatar from './BuddyAvatar.jsx'

// initialMode decides which tab opens first: 'login' or 'signup'.
export default function LoginWindow({ onClose, onSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Switch between Log In and Sign Up, clearing any old error message
  function switchMode(newMode) {
    setMode(newMode)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = mode === 'signup' ? await signUp(email, password, name, country) : await logIn(email, password)
      onSuccess(user)
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="floating-overlay" onClick={onClose}>
      <div className="floating-window" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center border-bottom p-3">
          <h5 className="mb-0">{mode === 'login' ? 'Log In' : 'Sign Up'}</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
        </div>

        <div className="p-3">
          <div className="text-center mb-3">
            <BuddyAvatar mood="happy" size={64} />
          </div>

          <div className="btn-group w-100 mb-3" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-pill ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => switchMode('login')}
            >
              Log In
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill ${mode === 'signup' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="mb-2">
                <label className="form-label small fw-bold">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <div className="mb-2">
                <label className="form-label small fw-bold">Country</label>
                <CountrySelect value={country} onChange={setCountry} required />
              </div>
            )}

            <div className="mb-2">
              <label className="form-label small fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <button type="submit" className="btn btn-primary w-100 rounded-pill" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center small text-secondary mt-3 mb-0">
            {mode === 'login' ? 'New to Pip?' : 'Already have an account?'}{' '}
            <button
              type="button"
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
