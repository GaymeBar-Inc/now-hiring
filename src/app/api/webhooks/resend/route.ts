import { NextRequest } from 'next/server'
import { Webhook } from 'svix'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { EmailSetting } from '../../../../payload-types'
import { removeContactFromResendAudience } from '../../../../resend/contacts'

interface ResendContactUpdatedData {
  audience_id: string
  contact_id: string
  email: string
  unsubscribed: boolean
}

interface ResendWebhookEvent {
  type: string
  created_at: string
  data: ResendContactUpdatedData
}

export async function POST(req: NextRequest): Promise<Response> {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET not set')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const rawBody = await req.text()
  let event: ResendWebhookEvent

  try {
    const wh = new Webhook(secret)
    event = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ResendWebhookEvent
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  if (event.type === 'contact.updated' && event.data.unsubscribed) {
    try {
      const payload = await getPayload({ config })
      const emailSettings = (await payload.findGlobal({
        slug: 'email-settings',
        depth: 0,
      })) as EmailSetting

      const audienceId = emailSettings.resendAudienceId
      if (audienceId) {
        await removeContactFromResendAudience(audienceId, event.data.email)
        console.info('[Resend Webhook] Removed globally unsubscribed contact', {
          email: event.data.email,
        })
      }
    } catch (err) {
      console.error('[Resend Webhook] Failed to process unsubscribe', err)
      return new Response('Internal error', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
