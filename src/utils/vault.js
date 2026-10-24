// Health Vault storage: records, prescriptions, reminders, clinic link.
// Saved in Firebase Realtime Database under users/<uid>/<kind>/<id>.
// If VITE_FIREBASE_DATABASE_URL isn't set, falls back to this browser's localStorage.
import { ref, get, set, update, remove } from 'firebase/database'
import { db } from '../firebase.js'

const lsKey = (uid, kind) => `pip-vault:${uid}:${kind}`
function lsRead(uid, kind) {
  try {
    const v = JSON.parse(localStorage.getItem(lsKey(uid, kind)) || '{}')
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
  } catch { return {} }
}
function lsWrite(uid, kind, obj) {
  try { localStorage.setItem(lsKey(uid, kind), JSON.stringify(obj)) } catch { /* full */ }
}

export const usingFirebase = () => Boolean(db)

export async function listItems(uid, kind) {
  if (!uid) return []
  let obj
  if (db) {
    const snap = await get(ref(db, `users/${uid}/${kind}`))
    obj = snap.exists() ? snap.val() : {}
  } else obj = lsRead(uid, kind)
  return Object.entries(obj).map(([id, v]) => ({ id, ...v }))
}

export async function saveItem(uid, kind, id, data) {
  const clean = JSON.parse(JSON.stringify(data)) // Firebase rejects undefined
  delete clean.id
  if (db) return set(ref(db, `users/${uid}/${kind}/${id}`), clean)
  const all = lsRead(uid, kind); all[id] = clean; lsWrite(uid, kind, all)
}

export async function patchItem(uid, kind, id, fields) {
  if (db) return update(ref(db, `users/${uid}/${kind}/${id}`), fields)
  const all = lsRead(uid, kind); all[id] = { ...(all[id] || {}), ...fields }; lsWrite(uid, kind, all)
}

export async function deleteItem(uid, kind, id) {
  if (db) return remove(ref(db, `users/${uid}/${kind}/${id}`))
  const all = lsRead(uid, kind); delete all[id]; lsWrite(uid, kind, all)
}

export async function getValue(uid, key) {
  if (db) { const s = await get(ref(db, `users/${uid}/${key}`)); return s.exists() ? s.val() : null }
  try { return JSON.parse(localStorage.getItem(lsKey(uid, key)) || 'null') } catch { return null }
}
export async function setValue(uid, key, val) {
  if (db) return val == null ? remove(ref(db, `users/${uid}/${key}`)) : set(ref(db, `users/${uid}/${key}`), val)
  try { val == null ? localStorage.removeItem(lsKey(uid, key)) : localStorage.setItem(lsKey(uid, key), JSON.stringify(val)) } catch { /* */ }
}

export const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())).replace(/[.#$[\]]/g, '')
