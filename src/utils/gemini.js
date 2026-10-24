// Gemini now goes through the Pip server, so the API key is never in the website.
import { api } from './api.js'

export function hasGeminiKey() {
  return true // chat is always typable; the server reports if its key is missing
}

export async function askGemini({ history = [], message, vitals = null }) {
  const { reply } = await api('/api/chat', { method: 'POST', body: { history, message, vitals } })
  return reply
}

export async function readPrescription(imageDataUrl) {
  return api('/api/prescriptions/read', { method: 'POST', body: { imageBase64: imageDataUrl, mimeType: 'image/jpeg' } })
}

export async function explainRecord({ text, image }) {
  const { explanation } = await api('/api/explain', {
    method: 'POST',
    body: { text, ...(image && { imageBase64: image, mimeType: 'image/jpeg' }) },
  })
  return explanation
}
