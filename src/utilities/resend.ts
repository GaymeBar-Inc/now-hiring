// src/utilities/resend.ts
import { Resend } from 'resend'
import type { Payload } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

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
  | { status: 'skipped'; reason: 'missing_from_address' | 'disabled_in_settings' }
  | { status: 'error'; message: string }

export async function sendWelcomeEmail(
  payload: Payload,
  to: string,
): Promise<SendWelcomeEmailResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const fromAddress = process.env.RESEND_FROM_ADDRESS
  if (!fromAddress) {
    console.warn('[Resend] Missing RESEND_FROM_ADDRESS. Skipping welcome email.')
    return { status: 'skipped', reason: 'missing_from_address' }
  }

  try {
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })

    const emailSettings: any = (siteSettings as any)?.email || {}

    if (emailSettings.welcomeEmailEnabled === false) {
      return { status: 'skipped', reason: 'disabled_in_settings' }
    }

    const fromName: string = emailSettings.fromName || 'Now Hiring'
    const replyTo: string | undefined = emailSettings.replyTo || undefined
    const subject: string = emailSettings.welcomeSubject || 'Welcome to the newsletter!'

    // welcomeBody is stored as Lexical JSON (richText). Convert to HTML on-demand.
    const welcomeBodyLexical = emailSettings.welcomeBody
    const htmlBody = welcomeBodyLexical
      ? convertLexicalToHTML({ data: welcomeBodyLexical })
      : '<p>Thanks for subscribing 🎉</p>'

    const { error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to,
      subject,
      html: htmlBody,
      ...(replyTo ? { replyTo } : {}),
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
  payload: Payload,
  email: string,
): Promise<HandleNewsletterSubscribeResult> {
  const contact = await createResendContact(email)

  // Only send welcome email on first subscribe.
  if (contact.status === 'created') {
    const welcomeEmail = await sendWelcomeEmail(payload, email)
    return { contact, welcomeEmail }
  }

  return { contact }
}
