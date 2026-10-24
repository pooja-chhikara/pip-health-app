/* Receives push messages while the site is closed. Config comes from the URL query set by push.js. */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

const p = new URL(self.location).searchParams
firebase.initializeApp({
  apiKey: p.get('apiKey'),
  authDomain: p.get('authDomain'),
  projectId: p.get('projectId'),
  messagingSenderId: p.get('messagingSenderId'),
  appId: p.get('appId'),
})

const messaging = firebase.messaging()
messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {}
  self.registration.showNotification(n.title || 'Doctor visit reminder', { body: n.body || '' })
})
