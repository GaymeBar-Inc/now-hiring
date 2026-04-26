'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type BroadcastStatus = 'draft' | 'scheduled' | 'sent' | 'failed'

function formatScheduledAt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

/**
 * UI field rendered at the bottom of every broadcast form.
 *
 * - No scheduledAt set → "Send Now" button (immediate send)
 * - scheduledAt set, status draft/failed → "Schedule for [date]" button
 * - status === 'scheduled' → shows scheduled time + "Cancel Schedule" button
 * - status === 'sent' → shows confirmation with Resend ID
 */
const SendButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { id, savedDocumentData } = useDocumentInfo()

  const status = (savedDocumentData?.sendStatus ?? 'draft') as BroadcastStatus
  const resendBroadcastId = savedDocumentData?.resendBroadcastId as string | undefined
  const scheduledAt = savedDocumentData?.scheduledAt as string | undefined | null

  const isSent = status === 'sent'
  const isScheduled = status === 'scheduled'
  const isNewDoc = !id
  const isWillSchedule = Boolean(scheduledAt) && !isSent && !isScheduled

  const handleSend = async () => {
    if (!id || isSent || isScheduled) return

    const label = isWillSchedule
      ? `Schedule this broadcast for ${formatScheduledAt(scheduledAt!)}? It will be sent automatically at that time.`
      : 'Send this broadcast to all subscribers now? This cannot be undone.'

    const confirmed = window.confirm(label)
    if (!confirmed) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/broadcasts/${id}/send`, { method: 'POST' })
      const json = (await res.json()) as { success?: boolean; error?: string }

      if (json.success) {
        window.location.reload()
      } else {
        setError(json.error ?? 'Send failed — check the error message field above.')
      }
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!id || !isScheduled) return

    const confirmed = window.confirm(
      'Cancel this scheduled broadcast? It will be removed from Resend and reset to draft.',
    )
    if (!confirmed) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/broadcasts/${id}/cancel`, { method: 'POST' })
      const json = (await res.json()) as { success?: boolean; error?: string }

      if (json.success) {
        window.location.reload()
      } else {
        setError(json.error ?? 'Cancel failed — try again.')
      }
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isNewDoc) return null

  return (
    <div
      style={{
        padding: '16px 0',
        marginTop: '8px',
        borderTop: '1px solid var(--theme-border-color)',
      }}
    >
      <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 600 }}>
        Send Broadcast
      </h4>

      {isSent && (
        <p style={{ color: 'var(--theme-success-500)', fontSize: '14px' }}>
          ✓ Sent{resendBroadcastId ? ` — Resend ID: ${resendBroadcastId}` : ''}
        </p>
      )}

      {isScheduled && scheduledAt && (
        <div>
          <p style={{ color: 'var(--theme-text)', fontSize: '14px', marginBottom: '10px' }}>
            ⏱ Scheduled for {formatScheduledAt(scheduledAt)}
            {resendBroadcastId && (
              <span style={{ color: 'var(--theme-text-dim)', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                Resend ID: {resendBroadcastId}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="btn btn--style-error btn--size-medium"
          >
            {loading ? 'Cancelling…' : 'Cancel Schedule'}
          </button>
        </div>
      )}

      {!isSent && !isScheduled && (
        <>
          {status === 'failed' && (
            <p style={{ marginBottom: '10px', color: 'var(--theme-error-500)', fontSize: '13px' }}>
              Previous send attempt failed. See the Error Message field for details.
            </p>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="btn btn--style-primary btn--size-medium"
          >
            {loading
              ? isWillSchedule ? 'Scheduling…' : 'Sending…'
              : isWillSchedule
                ? `Schedule for ${formatScheduledAt(scheduledAt!)}`
                : 'Send Now'}
          </button>

          {error && (
            <p style={{ marginTop: '8px', color: 'var(--theme-error-500)', fontSize: '13px' }}>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default SendButton
