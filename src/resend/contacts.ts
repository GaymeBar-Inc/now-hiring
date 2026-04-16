// src/resend/contacts.ts
import type { Payload } from 'payload'
import type { SiteSetting } from '../payload-types'
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
