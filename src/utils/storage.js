// Per-user localStorage persistence, keyed by Firebase UID.
// Health data intentionally stays in localStorage (per your README) —
// only auth moved to Firebase, and the Gemini key moved to .env.

function stateKey(uid) {
  return `pip-website-state:v2:${uid}`
}

export function loadState(uid) {
  if (!uid) return null
  try {
    const raw = window.localStorage.getItem(stateKey(uid))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(uid, state) {
  if (!uid) return
  try {
    window.localStorage.setItem(stateKey(uid), JSON.stringify(state))
  } catch (err) {
    console.warn('Could not save data.', err)
  }
}

export function clearState(uid) {
  if (!uid) return
  try {
    window.localStorage.removeItem(stateKey(uid))
  } catch (err) {
    console.warn('Could not clear data.', err)
  }
}
