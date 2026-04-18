'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

type Props = {
  serverURL: string
}

export default function BroadcastPreviewClient({ serverURL }: Props) {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={router.refresh} serverURL={serverURL} />
}
