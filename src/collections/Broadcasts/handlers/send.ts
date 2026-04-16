import type { PayloadHandler } from 'payload'
import type { Broadcast } from '../../../payload-types'
import { createAndSendResendBroadcast } from '../../../resend/broadcasts'

export const sendBroadcastHandler: PayloadHandler = async (req) => {
  const id = req.routeParams?.id as string | undefined

  if (!id) {
    return Response.json({ error: 'Broadcast ID is required' }, { status: 400 })
  }

  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const broadcast = await req.payload.findByID({
    collection: 'broadcasts',
    id,
  })

  if (!broadcast) {
    return Response.json({ error: 'Broadcast not found' }, { status: 404 })
  }

  if (broadcast.status === 'sent') {
    return Response.json({ error: 'Broadcast has already been sent' }, { status: 400 })
  }

  // Pull audience ID and from-name from the site-settings global.
  // RESEND_FROM_EMAIL (the verified sender address) stays in .env — only the
  // display name and audience ID are admin-configurable.
  const siteSettings = await req.payload.findGlobal({ slug: 'site-settings' })
  const audienceId = siteSettings?.email?.resendAudienceId ?? undefined

  if (!audienceId) {
    return Response.json(
      { error: 'Resend Audience ID is not configured in Site Settings.' },
      { status: 500 },
    )
  }

  const fromName = siteSettings?.email?.fromName ?? 'Now Hiring'
  const fromEmail = process.env.RESEND_FROM_EMAIL!
  const from = `${fromName} <${fromEmail}>`

  try {
    const html = await assembleBroadcastEmail(req, broadcast)

    const result = await createAndSendResendBroadcast({
      audienceId,
      from,
      name: broadcast.title as string,
      subject: broadcast.subject as string,
      ...(broadcast.previewText ? { previewText: broadcast.previewText as string } : {}),
      html,
    })

    if (result.status === 'error') {
      await req.payload.update({
        collection: 'broadcasts',
        id,
        data: {
          status: 'failed',
          errorMessage: result.message,
        },
      })
      return Response.json({ error: result.message }, { status: 500 })
    }

    if (result.status === 'disabled') {
      return Response.json({ error: 'Resend is not configured.' }, { status: 500 })
    }

    const now = new Date().toISOString()
    const isScheduled = Boolean(broadcast.scheduledAt)

    await req.payload.update({
      collection: 'broadcasts',
      id,
      data: {
        resendBroadcastId: result.resendBroadcastId,
        status: isScheduled ? 'scheduled' : 'sent',
        ...(isScheduled ? {} : { sentAt: now }),
        errorMessage: '',
      },
    })

    return Response.json({ success: true, resendBroadcastId: result.resendBroadcastId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'

    await req.payload.update({
      collection: 'broadcasts',
      id,
      data: { status: 'failed', errorMessage: message },
    })

    return Response.json({ error: message }, { status: 500 })
  }
}

/**
 * Assembles the full HTML email.
 *
 * Assembly order (per spec):
 *   1. Header  — from email-layout global
 *   2. Body    — admin-drafted Lexical rich text
 *   3. Post card(s) — single_post and weekly_digest only
 *   4. Footer  — from email-layout global
 *
 * TODO: implement once the email-layout global is built.
 */
async function assembleBroadcastEmail(
  req: Parameters<PayloadHandler>[0],
  broadcast: Broadcast,
): Promise<string> {
  // Placeholder — full implementation in the next build step
  const subject = broadcast.subject
  return `<p>${subject}</p>`
}
