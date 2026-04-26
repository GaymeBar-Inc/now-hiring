'use client'

import { useEffect, useState } from 'react'

import { fetchBroadcastsForPost, type BroadcastSummary } from '../utils/fetchBroadcastsForPost'

type BroadcastCellProps = {
  rowData?: { id: string | number }
}

const BroadcastCell: React.FC<BroadcastCellProps> = ({ rowData }) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastSummary[] | null>(null)

  useEffect(() => {
    if (!rowData?.id) return
    const controller = new AbortController()
    fetchBroadcastsForPost(rowData.id, controller.signal)
      .then(setBroadcasts)
      .catch(() => {})
    return () => controller.abort()
  }, [rowData?.id])

  if (broadcasts === null) return <span />

  const sentCount = broadcasts.filter((b) => b.sendStatus === 'sent').length
  const hasScheduled = broadcasts.some((b) => b.sendStatus === 'scheduled')
  const hasFailed = broadcasts.some((b) => b.sendStatus === 'failed')

  if (sentCount > 0) {
    return (
      <span
        title={`Sent in ${sentCount} broadcast(s)`}
        style={{ color: 'var(--theme-success-500)', fontSize: '16px', lineHeight: 1 }}
      >
        ✓
      </span>
    )
  }

  if (hasScheduled) {
    return (
      <span
        title="Scheduled"
        style={{ color: 'var(--theme-text)', fontSize: '14px', lineHeight: 1 }}
      >
        ⏱
      </span>
    )
  }

  if (hasFailed) {
    return (
      <span
        title="Broadcast failed — check the broadcast for details"
        style={{ color: 'var(--theme-error-500)', fontSize: '16px', lineHeight: 1 }}
      >
        ✗
      </span>
    )
  }

  if (broadcasts.length > 0) {
    return (
      <span
        title={`${broadcasts.length} draft broadcast(s)`}
        style={{ color: 'var(--theme-text-dim)', fontSize: '13px', lineHeight: 1 }}
      >
        Draft
      </span>
    )
  }

  return (
    <span style={{ color: 'var(--theme-text-dim)', fontSize: '16px', lineHeight: 1 }} title="No broadcasts">
      —
    </span>
  )
}

export default BroadcastCell
