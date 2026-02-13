// src/utilities/resend.ts
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.warn('RESEND_API_KEY not found - some features may be disabled')
}

const resend = new Resend(apiKey)

export async function createResendContact(email: string) {
  if (!apiKey) return { status: 'disabled' as const }

  const normalizedEmail = email.trim().toLowerCase()

  const { data, error } = await resend.contacts.create({
    email: normalizedEmail,
    unsubscribed: false,
  })

  if (error) {
    const msg = (error.message || '').toLowerCase()

    // Resend may return different wording; handle broadly.
    const alreadyExists =
      msg.includes('already') ||
      msg.includes('exists') ||
      msg.includes('duplicate') ||
      msg.includes('conflict')

    if (alreadyExists) {
      // Treat as success for UX: user is already subscribed (or at least already in contacts)
      return { status: 'already_subscribed' as const }
    }

    throw new Error(error.message || 'Resend contact create failed')
  }

  return { status: 'created' as const, data }
}
