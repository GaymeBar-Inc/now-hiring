'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type CreateBroadcastResponse = {
  doc?: { id: string }
  errors?: unknown[]
  message?: string
}

/**
 * Sidebar UI field rendered on the Post edit screen.
 * Inactive (with hover tooltip) until the post is published.
 * On click, creates a new single_post Broadcast pre-filled with this post's
 * subject and relationship, then navigates to the new broadcast.
 */
const DraftBroadcastButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { id, savedDocumentData } = useDocumentInfo()

  const isNewDoc = !id
  const isPublished = savedDocumentData?._status === 'published'
  const postTitle = (savedDocumentData?.title as string | undefined) ?? ''

  if (isNewDoc) return null

  const handleDraftBroadcast = async () => {
    if (!isPublished || !id) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'single_post',
          subject: postTitle,
          post: id,
        }),
      })

      const json = (await res.json()) as CreateBroadcastResponse

      if (!res.ok || !json.doc?.id) {
        setError('Failed to create broadcast — try again.')
        return
      }

      window.location.href = `/admin/collections/broadcasts/${json.doc.id}`
    } catch {
      setError('Request failed — check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '12px 0',
        borderTop: '1px solid var(--theme-border-color)',
        marginTop: '8px',
      }}
    >
      <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 600 }}>Broadcast</h4>

      <div
        title={
          !isPublished
            ? 'Publish this post before drafting a broadcast'
            : 'Create a new draft broadcast for this post'
        }
        style={{ display: 'inline-block' }}
      >
        <button
          type="button"
          onClick={handleDraftBroadcast}
          disabled={!isPublished || loading}
          className="btn btn--style-secondary btn--size-medium"
          style={
            !isPublished
              ? { opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }
              : undefined
          }
        >
          {loading ? 'Creating…' : 'Draft Broadcast'}
        </button>
      </div>

      {!isPublished && (
        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--theme-text-dim)' }}>
          Publish this post to enable
        </p>
      )}

      {error && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--theme-error-500)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default DraftBroadcastButton
