import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { assembleBroadcastEmail } from '@/resend/assembleBroadcastEmail'
import { getServerSideURL } from '@/utilities/getURL'
import BroadcastPreviewClient from './page.client'

type Props = {
  params: Promise<{ id: string }>
}

export default async function BroadcastPreviewPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return (
      <html lang="en">
        <body style={{ margin: 0, padding: '24px', fontFamily: 'Arial, sans-serif' }}>
          <p>Unauthorized — please log in to the admin panel.</p>
        </body>
      </html>
    )
  }

  const broadcast = await payload.findByID({
    collection: 'broadcasts',
    id,
    draft: true,
    depth: 2,
    overrideAccess: false,
    user,
  })

  if (!broadcast) notFound()

  const html = await assembleBroadcastEmail(payload, broadcast, { preview: true })

  return (
    <>
      <BroadcastPreviewClient serverURL={getServerSideURL()} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
