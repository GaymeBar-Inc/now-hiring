'use client'

import { DatePicker, FormSubmit, PopupList, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type BroadcastStatus = 'draft' | 'failed' | 'scheduled' | 'sent'
type SendPhase = 'idle' | 'confirming' | 'sending' | 'sent'

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

  const [sendPhase, setSendPhase] = useState<SendPhase>('idle')
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickedDate, setPickedDate] = useState<Date | null>(null)

  const isSent = status === 'sent' || sendPhase === 'sent'
  const isScheduled = status === 'scheduled'
  const isConfirming = sendPhase === 'confirming'
  const isSending = sendPhase === 'sending'
  const canSend = !isSent && !isScheduled && !scheduleLoading && sendPhase === 'idle'

  if (!id) return null

  const handleSendClick = () => {
    if (!canSend) return
    setSendPhase('confirming')
  }

  const handleConfirmSend = async () => {
    setSendPhase('sending')
    setError(null)
    try {
      const res = await fetch(`/api/broadcasts/${id}/send`, { method: 'POST' })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (json.success) {
        setSendPhase('sent')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setSendPhase('idle')
        setError(json.error ?? 'Send failed — try again.')
      }
    } catch {
      setSendPhase('idle')
      setError('Request failed — check your network and try again.')
    }
  }

  const handleCancelConfirm = () => setSendPhase('idle')

  const handleSchedule = async (close: () => void) => {
    if (!pickedDate) return
    if (pickedDate <= new Date()) {
      setError('Scheduled time must be in the future.')
      return
    }
    close()
    setScheduleLoading(true)
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
      setScheduleLoading(false)
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
    setScheduleLoading(true)
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
      setScheduleLoading(false)
    }
  }

  const buttonLabel = (() => {
    switch (true) {
      case isSent: return '✓ Broadcast Sent'
      case isConfirming: return 'Confirming Send'
      case isSending: return 'Sending Broadcast'
      case isScheduled: return '⏱ Scheduled'
      case scheduleLoading: return '…'
      default: return 'Send Broadcast'
    }
  })()

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
          disabled={!pickedDate || scheduleLoading}
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
      {isConfirming && (
        <div
          style={{
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--theme-elevation-0)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
              maxWidth: '420px',
              padding: '28px 28px 24px',
              width: '90%',
            }}
          >
            <p
              style={{
                color: 'var(--theme-text)',
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              Send Broadcast
            </p>
            <p
              style={{
                color: 'var(--theme-text-dim)',
                fontSize: '13px',
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              Send this broadcast to all subscribers now? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn--style-secondary btn--size-medium"
                onClick={handleCancelConfirm}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn--style-primary btn--size-medium"
                onClick={handleConfirmSend}
                type="button"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
      <FormSubmit
        buttonId="action-send-broadcast"
        buttonStyle="primary"
        disabled={!canSend}
        enableSubMenu={!isSent && sendPhase === 'idle'}
        onClick={canSend ? handleSendClick : undefined}
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
