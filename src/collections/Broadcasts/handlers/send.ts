import type { PayloadHandler } from 'payload'
import type { Broadcast } from '../../../payload-types'
import { createAndSendResendBroadcast, buildFromAddress } from '../../../resend/broadcasts'
import { assembleBroadcastEmail } from '../../../resend/assembleBroadcastEmail'

export const sendBroadcastHandler: PayloadHandler = async (req) => {
  const id = req.routeParams?.id as string | undefined

  if (!id) {
    return Response.json({ error: 'Broadcast ID is required' }, { status: 400 })
  }

  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const broadcast = (await req.payload.findByID({
    collection: 'broadcasts',
    id,
    depth: 2,
  })) as Broadcast

  if (!broadcast) {
    return Response.json({ error: 'Broadcast not found' }, { status: 404 })
  }

  if (broadcast.sendStatus === 'sent') {
    return Response.json({ error: 'Broadcast has already been sent' }, { status: 400 })
  }

  // Pull audience ID and from-name from the email-settings global.
  // RESEND_FROM_ADDRESS (the verified sender address) stays in .env — only the
  // display name and audience ID are admin-configurable.
  const emailSettings = await req.payload.findGlobal({ slug: 'email-settings' })
  const audienceId = emailSettings?.resendAudienceId ?? undefined

  if (!audienceId) {
    return Response.json(
      { error: 'Resend Audience ID is not configured in Email Settings.' },
      { status: 500 },
    )
  }

  const fromName = emailSettings?.fromName ?? 'Now Hiring'
  const from = buildFromAddress(fromName)

  if (!from) {
    return Response.json(
      { error: 'RESEND_FROM_ADDRESS is not configured.' },
      { status: 500 },
    )
  }

  try {
    const html = await assembleBroadcastEmail(req.payload, broadcast)

    const result = await createAndSendResendBroadcast({
      audienceId,
      from,
      name: broadcast.subject as string,
      subject: broadcast.subject as string,
      ...(broadcast.previewText ? { previewText: broadcast.previewText as string } : {}),
      html,
    })

    if (result.status === 'error') {
      await req.payload.update({
        collection: 'broadcasts',
        id,
        data: {
          sendStatus: 'failed',
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
        sendStatus: isScheduled ? 'scheduled' : 'sent',
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
      data: { sendStatus: 'failed', errorMessage: message },
    })

    return Response.json({ error: message }, { status: 500 })
  }
}
