// Push alerts even when Pip is closed (needs Firebase Blaze plan).
// Deploy:  cd functions && npm install && firebase deploy --only functions
//
// sendVisitReminders    every 5 min: pushes 1 day before and 1 hour before each visit
// syncClinicAppointments every 30 min: re-fetches appointments from the clinic API for linked users
const { onSchedule } = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')
admin.initializeApp()

const API_URL = (process.env.PIP_API_URL || '').replace(/\/$/, '') // your Render URL, set in functions/.env
const DAY = 86400000, HOUR = 3600000

exports.sendVisitReminders = onSchedule('every 5 minutes', async () => {
  const now = Date.now()
  const users = (await admin.database().ref('users').once('value')).val() || {}
  const jobs = []
  for (const [uid, u] of Object.entries(users)) {
    const tokens = Object.values(u.fcmTokens || {}).map((t) => t.token).filter(Boolean)
    if (!tokens.length) continue
    for (const [id, r] of Object.entries(u.reminders || {})) {
      if (r.done || !r.visitAt || r.visitAt < now) continue
      const left = r.visitAt - now
      const stage = left <= HOUR ? 'hour' : left <= DAY ? 'day' : null
      if (!stage || r.pushed === stage || (r.pushed === 'hour' && stage === 'day')) continue
      const when = new Date(r.visitAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: '2-digit' })
      jobs.push(
        admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: stage === 'hour' ? 'Doctor visit in under an hour' : 'Doctor visit tomorrow',
            body: `${r.title}${r.doctor ? ' with ' + r.doctor : ''} - ${when}`,
          },
        }).then(() => admin.database().ref(`users/${uid}/reminders/${id}/pushed`).set(stage))
      )
    }
  }
  await Promise.all(jobs)
})

exports.syncClinicAppointments = onSchedule('every 30 minutes', async () => {
  if (!API_URL) return
  const users = (await admin.database().ref('users').once('value')).val() || {}
  for (const [uid, u] of Object.entries(users)) {
    const code = u.patientLink?.code
    if (!code) continue
    try {
      const res = await fetch(`${API_URL}/api/clinic/patients/${encodeURIComponent(code)}/sync`)
      if (!res.ok) continue
      const data = await res.json()
      for (const a of data.appointments || []) {
        const visitAt = new Date(`${a.date}T${a.time}:00+05:30`).getTime()
        const old = (u.reminders || {})[a.id]
        const same = old && old.visitAt === visitAt
        await admin.database().ref(`users/${uid}/reminders/${a.id}`).update({
          source: 'clinic', title: a.reason, doctor: a.doctor, place: `${a.clinic}, ${a.address}`,
          visitAt, status: a.status,
          done: a.status !== 'scheduled' ? true : same ? Boolean(old.done) : false,
          ...(same ? {} : { notified: false, pushed: false }),
          createdAt: old?.createdAt || Date.now(),
        })
      }
    } catch (e) { console.warn('sync failed for', uid, e.message) }
  }
})
