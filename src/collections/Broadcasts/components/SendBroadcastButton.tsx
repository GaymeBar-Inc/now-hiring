'use client'

import { DatePicker, FormSubmit, PopupList, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type BroadcastStatus = 'draft' | 'failed' | 'scheduled' | 'sent'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export const SendBroadcastButton: React.FC = () => {
  const { id, savedDocumentData } = useDocumentInfo()

  const status = (savedDocumentData?.sendStatus ?? 'draft') as BroadcastStatus
  const scheduledAt = savedDocumentData?.scheduledAt as string | null | undefined

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickedDate, setPickedDate] = useState<Date | null>(null)

  const isSent = status === 'sent'
  const isScheduled = status === 'scheduled'
  const canSend = !isSent && !isScheduled && !loading

  if (!id) return null

  const handleSendNow = async () => {
    if (!canSend) return
    if (!window.confirm('Send this broadcast to all subscribers now? This cannot be undone.'))
      return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/broadcasts/${id}/send`, { method: 'POST' })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (json.success) {
        window.location.reload()
      } else {
        setError(json.error ?? 'Send failed — try again.')
      }
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async (close: () => void) => {
    if (!pickedDate) return
    if (pickedDate <= new Date()) {
      setError('Scheduled time must be in the future.')
      return
    }
    close()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/broadcasts/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: pickedDate.toISOString() }),
      })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (json.success) {
        window.location.reload()
      } else {
        setError(json.error ?? 'Schedule failed — try again.')
      }
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSchedule = async (close: () => void) => {
    if (
      !window.confirm(
        'Cancel this scheduled broadcast? It will be removed from Resend and reset to draft.',
      )
    )
      return
    close()
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

  const buttonLabel = isSent
    ? '✓ Sent'
    : isScheduled
      ? `⏱ Scheduled`
      : loading
        ? '…'
        : 'Send Broadcast'

  const subMenuContent = ({ close }: { close: () => void }): React.ReactNode => {
    if (isSent) return null

    if (isScheduled) {
      return (
        <PopupList.ButtonGroup>
          {scheduledAt && (
            <PopupList.Button disabled>
              <span style={{ fontSize: '12px', color: 'var(--theme-text-dim)' }}>
                {formatDate(scheduledAt)}
              </span>
            </PopupList.Button>
          )}
          <PopupList.Button onClick={() => handleCancelSchedule(close)}>
            Cancel Schedule
          </PopupList.Button>
        </PopupList.ButtonGroup>
      )
    }

    return (
      <div style={{ padding: '12px 16px 16px', minWidth: '270px' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '10px',
            color: 'var(--theme-text)',
          }}
        >
          Schedule Broadcast
        </p>
        <DatePicker
          onChange={(val) => setPickedDate(val as Date)}
          pickerAppearance="dayAndTime"
          value={pickedDate ?? undefined}
        />
        <button
          className="btn btn--style-primary btn--size-small"
          disabled={!pickedDate || loading}
          onClick={() => handleSchedule(close)}
          style={{ marginTop: '10px', width: '100%' }}
          type="button"
        >
          Confirm Schedule
        </button>
        <button
          onClick={() => setPickedDate(null)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--theme-text-dim)',
            cursor: 'pointer',
            fontSize: '12px',
            marginTop: '6px',
            textAlign: 'center',
            width: '100%',
          }}
          type="button"
        >
          Clear
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <FormSubmit
        buttonId="action-send-broadcast"
        buttonStyle="primary"
        disabled={!canSend}
        enableSubMenu={!isSent}
        onClick={canSend ? handleSendNow : undefined}
        size="medium"
        SubMenuPopupContent={subMenuContent}
        type="button"
      >
        {buttonLabel}
      </FormSubmit>
      {error && (
        <div
          style={{
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-error-500)',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'var(--theme-error-500)',
            fontSize: '12px',
            right: 0,
            marginTop: '6px',
            padding: '8px 32px 8px 10px',
            position: 'absolute',
            top: '100%',
            width: '260px',
            zIndex: 10,
          }}
        >
          <button
            aria-label="Dismiss error"
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-error-500)',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1,
              padding: '2px 4px',
              position: 'absolute',
              right: '4px',
              top: '4px',
            }}
            type="button"
          >
            ×
          </button>
          {error}
        </div>
      )}
    </div>
  )
}
