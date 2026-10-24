// Checks reminders every 30 s while the site is open.
// Alerts once 24 hours before a visit and again 1 hour before.
import { useEffect, useRef } from 'react'
import { patchItem } from '../utils/vault.js'

const DAY = 86400000, HOUR = 3600000

export default function useReminderAlerts(uid, reminders, onAlert) {
  const latest = useRef(reminders)
  latest.current = reminders

  const checkRef = useRef(() => {})

  useEffect(() => {
    if (!uid) return
    async function check() {
      const now = Date.now()
      for (const r of latest.current) {
        if (r.done || !r.visitAt || r.visitAt < now) continue
        const left = r.visitAt - now
        const stage = left <= HOUR ? 'hour' : left <= DAY ? 'day' : null
        if (!stage || r.notified === stage || (r.notified === 'hour' && stage === 'day')) continue
        const when = new Date(r.visitAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
        const text = `${r.title} — ${when}${r.doctor ? ` with ${r.doctor}` : ''}`
        onAlert(stage === 'hour' ? `⏰ Doctor visit in less than an hour: ${text}` : `📅 Doctor visit tomorrow: ${text}`)
        if ('Notification' in window && Notification.permission === 'granted') {
          try { new Notification('Pip reminder', { body: text }) } catch { /* some browsers block */ }
        }
        r.notified = stage
        patchItem(uid, 'reminders', r.id, { notified: stage }).catch(() => {})
      }
    }
    checkRef.current = check
    check()
    const t = setInterval(check, 30000)
    return () => clearInterval(t)
  }, [uid, onAlert])

  // Check straight away whenever reminders load or change
  useEffect(() => { checkRef.current() }, [reminders])
}
