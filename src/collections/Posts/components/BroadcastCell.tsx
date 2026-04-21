'use client'

type BroadcastJoinValue = {
  docs?: { id: string | number }[]
  hasNextPage?: boolean
  totalDocs?: number
}

type BroadcastCellProps = {
  cellData?: BroadcastJoinValue | null
}

const BroadcastCell: React.FC<BroadcastCellProps> = ({ cellData }) => {
  const hasBroadcast = (cellData?.totalDocs ?? 0) > 0

  return (
    <span
      title={hasBroadcast ? `${cellData!.totalDocs} broadcast(s)` : 'Not broadcast'}
      style={{
        color: hasBroadcast ? 'var(--theme-success-500)' : 'var(--theme-text-dim)',
        fontSize: '16px',
        lineHeight: 1,
      }}
    >
      {hasBroadcast ? '✓' : '—'}
    </span>
  )
}

export default BroadcastCell
