'use client'

import { useEffect, useState } from 'react'

import { fetchBroadcastsForPost } from '../utils/fetchBroadcastsForPost'

type BroadcastCellProps = {
  rowData?: { id: string | number }
}

const BroadcastCell: React.FC<BroadcastCellProps> = ({ rowData }) => {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!rowData?.id) return
    const controller = new AbortController()
    fetchBroadcastsForPost(rowData.id, controller.signal)
      .then((broadcasts) => setCount(broadcasts.length))
      .catch(() => {})
    return () => controller.abort()
  }, [rowData?.id])

  const hasBroadcast = (count ?? 0) > 0

  return (
    <span
      title={hasBroadcast ? `${count} broadcast(s)` : 'Not broadcast'}
      style={{
        color: hasBroadcast ? 'var(--theme-success-500)' : 'var(--theme-text-dim)',
        fontSize: '16px',
        lineHeight: 1,
      }}
    >
      {count === null ? '' : hasBroadcast ? '✓' : '—'}
    </span>
  )
}

export default BroadcastCell
