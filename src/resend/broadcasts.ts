// src/resend/broadcasts.ts
import { getResendClient } from './client'

/**
 * Builds the RFC 5322 "From" string used by Resend.
 * Falls back to RESEND_FROM_ADDRESS (the same env var used by the newsletter sender).
 * Returns null if the address env var is missing so the caller can bail early.
 */
export function buildFromAddress(displayName: string): string | null {
  const address = process.env.RESEND_FROM_ADDRESS?.replace(/^["']|["']$/g, '')
  if (!address) return null
  return `${displayName} <${address}>`
}

export type CreateAndSendBroadcastOptions = {
  audienceId: string
  topicId?: string
  from: string
  name: string
  subject: string
  previewText?: string
  html: string
  scheduledAt?: string
}

export type CreateAndSendBroadcastResult =
  | { status: 'disabled' }
  | { status: 'sent'; resendBroadcastId: string }
  | { status: 'scheduled'; resendBroadcastId: string }
  | { status: 'error'; message: string }

export async function createAndSendResendBroadcast(
  options: CreateAndSendBroadcastOptions,
): Promise<CreateAndSendBroadcastResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const { audienceId, topicId, from, name, subject, previewText, html, scheduledAt } = options

  const { data, error } = await resend.broadcasts.create({
    audienceId,
    from,
    name,
    subject,
    ...(previewText ? { previewText } : {}),
    html,
    // topicId is supported by the Resend API for targeted sends; SDK types may not include it yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(topicId ? { topicId } : {}),
  } as any)

  if (error || !data) {
    return { status: 'error', message: error?.message ?? 'Unknown error from Resend' }
  }

  const sendResult = await resend.broadcasts.send(data.id, {
    ...(scheduledAt ? { scheduledAt } : {}),
  })

  if (sendResult.error) {
    return { status: 'error', message: sendResult.error.message ?? 'Unknown error from Resend' }
  }

  return scheduledAt
    ? { status: 'scheduled', resendBroadcastId: data.id }
    : { status: 'sent', resendBroadcastId: data.id }
}

export type CancelResendBroadcastResult =
  | { status: 'disabled' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }

export async function cancelResendBroadcast(
  resendBroadcastId: string,
): Promise<CancelResendBroadcastResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const { error } = await resend.broadcasts.remove(resendBroadcastId)

  if (error) {
    return { status: 'error', message: error.message ?? 'Unknown error from Resend' }
  }

  return { status: 'cancelled' }
}
