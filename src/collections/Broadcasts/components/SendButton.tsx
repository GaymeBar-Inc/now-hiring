'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type BroadcastStatus = 'draft' | 'scheduled' | 'sent' | 'failed'

/**
 * UI field rendered at the bottom of every broadcast form.
 * Posts to /api/broadcasts/:id/send, then reloads the page to reflect
 * the updated status, sentAt, and resendBroadcastId fields.
 */
const SendButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { id, savedDocumentData } = useDocumentInfo()

  const status = (savedDocumentData?.status ?? 'draft') as BroadcastStatus
  const resendBroadcastId = savedDocumentData?.resendBroadcastId as string | undefined

  const isSent = status === 'sent'
  const isScheduled = status === 'scheduled'
  const isNewDoc = !id

  const handleSend = async () => {
    if (!id || isSent || isScheduled) return

    const confirmed = window.confirm(
      'Send this broadcast to all subscribers? This cannot be undone.',
    )
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

  // Don't render anything until the doc has been saved at least once
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

      {isScheduled && (
        <p style={{ color: 'var(--theme-text)', fontSize: '14px' }}>
          Scheduled — Resend ID: {resendBroadcastId}
        </p>
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
            {loading ? 'Sending…' : 'Send Now'}
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
