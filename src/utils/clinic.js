// Link a user to a (dummy) clinic patient code and pull their data over the API.
// Prescriptions are copied into the vault; appointments become reminders.
import { api } from './api.js'
import { listItems, saveItem, getValue, setValue } from './vault.js'

export const getLink = (uid) => getValue(uid, 'patientLink')

export async function syncClinic(uid, code) {
  const data = await api(`/api/clinic/patients/${encodeURIComponent(code.trim())}/sync`)
  const p = data.patient

  for (const rx of data.prescriptions) {
    await saveItem(uid, 'prescriptions', rx.id, {
      source: 'clinic',
      title: rx.diagnosis,
      doctor: rx.doctor,
      clinic: rx.clinic,
      date: rx.issued,
      bullets: [...rx.simplified, ...(rx.advice ? [`Advice: ${rx.advice}`] : [])],
      createdAt: Date.now(),
    })
  }

  // Keep "done" if the user already ticked it and the time hasn't changed
  const existing = Object.fromEntries((await listItems(uid, 'reminders')).map((r) => [r.id, r]))
  for (const a of data.appointments) {
    const visitAt = new Date(`${a.date}T${a.time}:00`).getTime()
    const old = existing[a.id]
    const sameTime = old && old.visitAt === visitAt
    await saveItem(uid, 'reminders', a.id, {
      source: 'clinic',
      title: a.reason,
      doctor: a.doctor,
      place: `${a.clinic}, ${a.address}`,
      visitAt,
      status: a.status,
      done: a.status !== 'scheduled' ? true : sameTime ? Boolean(old.done) : false,
      notified: sameTime ? Boolean(old.notified) : false,
      createdAt: old?.createdAt || Date.now(),
    })
  }

  const link = { code: p.patientId, name: p.name, clinic: p.clinic.name, doctor: p.doctor, allergies: p.allergies || [], syncedAt: Date.now() }
  await setValue(uid, 'patientLink', link)
  return { link, prescriptions: data.prescriptions.length, appointments: data.appointments.length }
}

export const unlinkClinic = (uid) => setValue(uid, 'patientLink', null)
