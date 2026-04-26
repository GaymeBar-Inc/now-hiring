import type { PayloadHandler } from 'payload'
import type { Broadcast } from '../../../payload-types'
import { cancelResendBroadcast } from '../../../resend/broadcasts'

export const cancelBroadcastHandler: PayloadHandler = async (req) => {
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
    depth: 0,
  })) as Broadcast

  if (!broadcast) {
    return Response.json({ error: 'Broadcast not found' }, { status: 404 })
  }

  if (broadcast.sendStatus !== 'scheduled') {
    return Response.json(
      { error: 'Only scheduled broadcasts can be cancelled' },
      { status: 400 },
    )
  }

  const resendBroadcastId = broadcast.resendBroadcastId as string | null | undefined
  if (!resendBroadcastId) {
    return Response.json({ error: 'No Resend broadcast ID found on this record' }, { status: 400 })
  }

  const result = await cancelResendBroadcast(resendBroadcastId)

  if (result.status === 'error') {
    return Response.json({ error: result.message }, { status: 500 })
  }

  if (result.status === 'disabled') {
    return Response.json({ error: 'Resend is not configured' }, { status: 500 })
  }

  await req.payload.update({
    collection: 'broadcasts',
    id,
    data: {
      sendStatus: 'draft',
      resendBroadcastId: '',
      scheduledAt: null,
      sentAt: null,
      errorMessage: '',
    },
  })

  return Response.json({ success: true })
}
