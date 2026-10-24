// Turns on push alerts for this device (works even when Pip is closed,
// once the Cloud Functions in functions/ are deployed).
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import app from '../firebase.js'
import { saveItem } from './vault.js'

const VAPID = import.meta.env.VITE_FIREBASE_VAPID_KEY

export const pushConfigured = () => Boolean(VAPID)

export async function enablePush(uid) {
  if (!VAPID) throw new Error('Add VITE_FIREBASE_VAPID_KEY to .env first.')
  if (!(await isSupported())) throw new Error('This browser does not support push alerts.')
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Alerts were not allowed.')
  const env = import.meta.env
  const q = new URLSearchParams({
    apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID, messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  })
  const reg = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${q}`)
  const token = await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: reg })
  if (!token) throw new Error('Could not get a push token.')
  await saveItem(uid, 'fcmTokens', token.slice(-20).replace(/[.#$[\]/]/g, '_'), { token, at: Date.now() })
}
