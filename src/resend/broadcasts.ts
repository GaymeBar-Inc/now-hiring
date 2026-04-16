// src/resend/broadcasts.ts
import { getResendClient } from './client'

/**
 * Builds the RFC 5322 "From" string used by Resend.
 * Falls back to RESEND_FROM_ADDRESS (the same env var used by the newsletter sender).
 * Returns null if the address env var is missing so the caller can bail early.
 */
export function buildFromAddress(displayName: string): string | null {
  const address = process.env.RESEND_FROM_ADDRESS
  if (!address) return null
  return `${displayName} <${address}>`
}

export type CreateAndSendBroadcastOptions = {
  audienceId: string
  from: string
  name: string
  subject: string
  previewText?: string
  html: string
}

export type CreateAndSendBroadcastResult =
  | { status: 'disabled' }
  | { status: 'sent'; resendBroadcastId: string }
  | { status: 'error'; message: string }

export async function createAndSendResendBroadcast(
  options: CreateAndSendBroadcastOptions,
): Promise<CreateAndSendBroadcastResult> {
  const resend = getResendClient()
  if (!resend) return { status: 'disabled' }

  const { audienceId, from, name, subject, previewText, html } = options

  const { data, error } = await resend.broadcasts.create({
    audienceId,
    from,
    name,
    subject,
    ...(previewText ? { previewText } : {}),
    html,
  })

  if (error || !data) {
    return { status: 'error', message: error?.message ?? 'Unknown error from Resend' }
  }

  await resend.broadcasts.send(data.id)

  return { status: 'sent', resendBroadcastId: data.id }
}
