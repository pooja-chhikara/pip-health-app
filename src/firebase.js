// Initializes the Firebase app + Auth using values from .env (all must start with VITE_)

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // Only needed if you use the Realtime Database (not required for Auth or Firestore).
  // Leave VITE_FIREBASE_DATABASE_URL unset in .env and this is simply omitted.
  ...(import.meta.env.VITE_FIREBASE_DATABASE_URL && {
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  }),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Realtime Database is only usable once VITE_FIREBASE_DATABASE_URL is set in .env.
// db is null otherwise, so callers (see utils/auth.js) skip DB writes/reads gracefully.
export const db = firebaseConfig.databaseURL ? getDatabase(app) : null

export default app
