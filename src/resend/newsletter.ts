// src/resend/newsletter.ts
import type { Payload } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { Category, EmailLayout, EmailSetting } from '../payload-types'
import { getResendClient, retryResendCall } from './client'
import { renderEmailTemplate } from './template'
import { createResendContact, addContactToResendSegment } from './contacts'
import type { CreateResendContactResult, AddToResendSegmentResult } from './contacts'
import { subscribeContactToTopic } from './topics'

interface ResendEmailData {
  id: string
}

export type SendWelcomeEmailResult =
  | { status: 'disabled' }
  | { status: 'sent' }
  | { status: 'skipped'; reason: 'missing_from_address' | 'disabled_in_settings' }
  | { status: 'error'; message: string }

export type HandleNewsletterSubscribeResult = {
  contact: CreateResendContactResult
  segment?: AddToResendSegmentResult
  welcomeEmail?: SendWelcomeEmailResult
}

export async function sendWelcomeEmail(
  payload: Payload,
  to: string,
): Promise<SendWelcomeEmailResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const normalizedTo = to.trim().toLowerCase()

  const fromAddress = process.env.RESEND_FROM_ADDRESS?.replace(/^["']|["']$/g, '')
  if (!fromAddress) {
    console.warn('[Resend] Missing RESEND_FROM_ADDRESS. Skipping welcome email.')
    return { status: 'skipped', reason: 'missing_from_address' }
  }

  try {
    const [emailSettings, emailLayout] = await Promise.all([
      payload.findGlobal({ slug: 'email-settings', depth: 0 }) as Promise<EmailSetting>,
      payload.findGlobal({ slug: 'email-layout', depth: 1 }) as Promise<EmailLayout>,
    ])

    if (emailSettings.welcomeEmailEnabled === false) {
      return { status: 'skipped', reason: 'disabled_in_settings' }
    }

    const fromName: string = emailSettings.fromName || 'Now Hiring'
    const replyTo: string | undefined = emailSettings.replyTo || undefined
    const subject: string = emailSettings.welcomeSubject || 'Welcome to the newsletter!'

    const welcomeBodyLexical = emailSettings.welcomeBody
    const bodyHtml = welcomeBodyLexical
      ? convertLexicalToHTML({ data: welcomeBodyLexical })
      : '<p>Thanks for subscribing 🎉</p>'

    const htmlBody = renderEmailTemplate(bodyHtml, emailLayout)

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

export async function handleNewsletterSubscribe(
  payload: Payload,
  email: string,
): Promise<HandleNewsletterSubscribeResult> {
  const contact = await createResendContact(email)

  // Add to segment on both first-time and repeat subscribes.
  // (Idempotent: if already in segment, we treat it as success.)
  const segment =
    contact.status === 'disabled' ? undefined : await addContactToResendSegment(payload, email)

  // Subscribe to all Category topics (idempotent — safe to call on re-subscribe so new
  // topics added since last sign-up are picked up automatically).
  if (contact.status !== 'disabled') {
    await subscribeToAllCategoryTopics(payload, email)
  }

  // Only send welcome email on first subscribe.
  if (contact.status === 'created') {
    const welcomeEmail = await sendWelcomeEmail(payload, email)
    return { contact, segment, welcomeEmail }
  }

  return { contact, segment }
}

async function subscribeToAllCategoryTopics(payload: Payload, email: string): Promise<void> {
  try {
    const result = await payload.find({
      collection: 'categories',
      limit: 200,
      depth: 0,
    })

    const topicIds = (result.docs as Category[])
      .map((c) => c.resendTopicId)
      .filter((id): id is string => Boolean(id))

    await Promise.allSettled(
      topicIds.map((topicId) => subscribeContactToTopic(topicId, email)),
    )
  } catch (err) {
    console.error('[Newsletter] Failed to subscribe contact to category topics', err)
  }
}
