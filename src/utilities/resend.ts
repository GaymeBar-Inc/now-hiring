// src/utilities/resend.ts
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.warn('RESEND_API_KEY not found - some features may be disabled')
}

function getResendClient() {
  if (!apiKey) return null
  return new Resend(apiKey)
}

export type CreateResendContactResult =
  | { status: 'disabled' }
  | { status: 'created'; data: unknown }
  | { status: 'already_subscribed' }
  | { status: 'error'; message: string }

export async function createResendContact(email: string): Promise<CreateResendContactResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const normalizedEmail = email.trim().toLowerCase()

  try {
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
        return { status: 'already_subscribed' }
      }

      return { status: 'error', message: error.message || 'Resend contact create failed' }
    }

    return { status: 'created', data }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Resend contact create failed',
    }
  }
}

export type SendWelcomeEmailResult =
  | { status: 'disabled' }
  | { status: 'sent' }
  | { status: 'skipped'; reason: 'missing_from' }
  | { status: 'error'; message: string }

export async function sendWelcomeEmail(to: string): Promise<SendWelcomeEmailResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  // Template-friendly: let users configure this via env. Keep a safe fallback.
  const from = process.env.RESEND_FROM
  if (!from) {
    console.warn('[Resend] Missing RESEND_FROM. Skipping welcome email.')
    return { status: 'skipped', reason: 'missing_from' }
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: 'Welcome to the newsletter!',
      html: `<p>Thanks for subscribing 🎉</p>`,
    })

    if (error) {
      return { status: 'error', message: error.message || 'Resend welcome email failed' }
    }

    return { status: 'sent' }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Resend welcome email failed',
    }
  }
}

export type HandleNewsletterSubscribeResult = {
  contact: CreateResendContactResult
  welcomeEmail?: SendWelcomeEmailResult
}

export async function handleNewsletterSubscribe(
  email: string,
): Promise<HandleNewsletterSubscribeResult> {
  const contact = await createResendContact(email)

  // Only send welcome email on first subscribe.
  if (contact.status === 'created') {
    const welcomeEmail = await sendWelcomeEmail(email)
    return { contact, welcomeEmail }
  }

  return { contact }
}
