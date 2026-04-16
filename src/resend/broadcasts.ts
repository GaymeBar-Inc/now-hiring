// src/resend/broadcasts.ts
import { getResendClient } from './client'

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
