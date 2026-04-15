// src/utilities/resend.ts
import { Resend } from 'resend'
import type { ErrorResponse } from 'resend'
import type { Payload } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SiteSetting } from '../payload-types'

interface ResendEmailData {
  id: string
}

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.warn('RESEND_API_KEY not found - some features may be disabled')
}

function getResendClient() {
  if (!apiKey) return null
  return new Resend(apiKey)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRateLimitError(err: ErrorResponse): boolean {
  const name = (err?.name || '').toString().toLowerCase()
  const msg = (err?.message || '').toString().toLowerCase()
  return (
    err?.statusCode === 429 ||
    name.includes('rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit')
  )
}

async function retryResendCall<T>(
  fn: () => Promise<{ data: T | null; error: ErrorResponse | null }>,
  opts: { attempts?: number; baseDelayMs?: number } = {},
): Promise<{ data: T | null; error: ErrorResponse | null }> {
  const attempts = opts.attempts ?? 4
  const baseDelayMs = opts.baseDelayMs ?? 650

  let last: { data: T | null; error: ErrorResponse | null } = { data: null, error: null }

  for (let i = 0; i < attempts; i++) {
    const res = await fn()
    last = res

    if (!res.error) return res

    if (!isRateLimitError(res.error)) return res

    // Exponential backoff: 650ms, 1300ms, 2600ms, ...
    const wait = baseDelayMs * Math.pow(2, i)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Resend] rate limited (429) — backing off', {
        attempt: i + 1,
        waitMs: wait,
        message: res.error?.message,
      })
    }
    await sleep(wait)
  }

  return last
}

export type CreateResendContactResult =
  | { status: 'disabled' }
  | { status: 'created'; data: unknown }
  | { status: 'already_subscribed' }
  | { status: 'error'; message: string }

export type AddToResendSegmentResult =
  | { status: 'disabled' }
  | { status: 'added'; data: unknown }
  | { status: 'already_in_segment' }
  | { status: 'skipped'; reason: 'missing_segment_id' }
  | { status: 'error'; message: string }

/**
 * Adds a contact (by email) to the configured Resend Segment.
 *
 * NOTE: Resend calls this a "segment". In many dashboards the default segment is "General".
 * We store the ID in Site Settings so template users can configure it without code changes.
 */
export async function addContactToResendSegment(
  payload: Payload,
  email: string,
  segmentIdOverride?: string,
): Promise<AddToResendSegmentResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })

    const emailSettings: NonNullable<SiteSetting['email']> = siteSettings?.email || {}

    // V1: we store this ID in Site Settings (currently named resendAudienceId)
    // because that's where users expect to paste the ID from Resend.
    const segmentId: string | undefined = segmentIdOverride || (emailSettings?.resendAudienceId ?? undefined)

    if (!segmentId) {
      return {
        status: 'skipped',
        reason: 'missing_segment_id',
      }
    }

    const { data, error } = await retryResendCall(() =>
      resend.contacts.segments.add({
        email: normalizedEmail,
        segmentId,
      }),
    )

    if (error) {
      const msg = (error.message || '').toLowerCase()

      // Be tolerant of wording differences.
      const alreadyInSegment =
        msg.includes('already') ||
        msg.includes('exists') ||
        msg.includes('duplicate') ||
        msg.includes('conflict')

      if (alreadyInSegment) return { status: 'already_in_segment' }

      return { status: 'error', message: error.message || 'Resend segment add failed' }
    }

    return { status: 'added', data }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Resend segment add failed',
    }
  }
}

export async function createResendContact(email: string): Promise<CreateResendContactResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const { data, error } = await retryResendCall(() =>
      resend.contacts.create({
        email: normalizedEmail,
        unsubscribed: false,
      }),
    )

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

  const normalizedTo = to.trim().toLowerCase()

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

    const emailSettings: NonNullable<SiteSetting['email']> = siteSettings?.email || {}

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

    const { data, error } = await retryResendCall(() =>
      resend.emails.send({
        from: `${fromName} <${fromAddress}>`,
        to: normalizedTo,
        subject,
        html: htmlBody,
        ...(replyTo ? { replyTo } : {}),
      }),
    )

    if (error) {
      console.error('[Resend] Welcome email send failed', {
        to: normalizedTo,
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
      })

      return { status: 'error' as const, message: error.message || 'Resend send failed' }
    }

    console.info('[Resend] Welcome email sent', { id: (data as ResendEmailData)?.id })
    return { status: 'sent' as const }
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Resend welcome email failed',
    }
  }
}

export type HandleNewsletterSubscribeResult = {
  contact: CreateResendContactResult
  segment?: AddToResendSegmentResult
  welcomeEmail?: SendWelcomeEmailResult
}

export async function handleNewsletterSubscribe(
  payload: Payload,
  email: string,
): Promise<HandleNewsletterSubscribeResult> {
  const contact = await createResendContact(email)

  // Add to segment on both first-time and repeat subscribes.
  // (Idempotent: if already in segment, we treat it as success.)
  const segment =
    contact.status === 'disabled' ? undefined : await addContactToResendSegment(payload, email)

  // Only send welcome email on first subscribe.
  if (contact.status === 'created') {
    const welcomeEmail = await sendWelcomeEmail(payload, email)
    return { contact, segment, welcomeEmail }
  }

  return { contact, segment }
}
