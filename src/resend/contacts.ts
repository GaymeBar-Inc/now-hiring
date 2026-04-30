// src/resend/contacts.ts
import type { Payload } from 'payload'
import type { EmailSetting } from '../payload-types'
import { getResendClient, retryResendCall } from './client'

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
      const alreadyExists =
        msg.includes('already') ||
        msg.includes('exists') ||
        msg.includes('duplicate') ||
        msg.includes('conflict')

      if (alreadyExists) return { status: 'already_subscribed' }

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

/**
 * Adds a contact (by email) to the configured Resend Segment.
 *
 * NOTE: Resend calls this a "segment". In many dashboards the default segment is "General".
 * We store the ID in Email Settings so template users can configure it without code changes.
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
    const emailSettings: EmailSetting = await payload.findGlobal({
      slug: 'email-settings',
      depth: 0,
    })

    const segmentId: string | undefined =
      segmentIdOverride || (emailSettings?.resendAudienceId ?? undefined)

    if (!segmentId) {
      return { status: 'skipped', reason: 'missing_segment_id' }
    }

    const { data, error } = await retryResendCall(() =>
      resend.contacts.segments.add({
        email: normalizedEmail,
        segmentId,
      }),
    )

    if (error) {
      const msg = (error.message || '').toLowerCase()
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

export async function removeContactFromResendAudience(
  audienceId: string,
  email: string,
): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const { error } = await resend.contacts.remove({ audienceId, email: normalizedEmail })
    if (error) {
      console.error('[Resend Contacts] Failed to remove contact from audience', {
        email: normalizedEmail,
        error,
      })
    }
  } catch (err) {
    console.error('[Resend Contacts] Exception removing contact from audience', err)
  }
}
