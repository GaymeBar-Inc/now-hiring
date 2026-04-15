'use client'

import { useForm } from '@payloadcms/ui'
import { useState } from 'react'

/**
 * UI field rendered inside the weekly_digest form.
 * Calls GET /api/broadcasts/weekly-posts and pre-populates the `posts` relationship field.
 * The admin can then remove any posts before sending.
 */
const PullPostsButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const { dispatchFields } = useForm()

  const handlePull = async () => {
    setLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const res = await fetch('/api/broadcasts/weekly-posts')

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const { postIds, total } = (await res.json()) as { postIds: string[]; total: number }

      dispatchFields({
        type: 'UPDATE',
        path: 'posts',
        value: postIds,
      })

      setMessage(
        total === 0
          ? 'No published posts found in the last 7 days.'
          : `Pulled ${postIds.length} post${postIds.length !== 1 ? 's' : ''} — review the list and remove any you don't want to include.`,
      )
    } catch (err: unknown) {
      setIsError(true)
      setMessage(err instanceof Error ? err.message : 'Failed to pull posts — try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '4px', marginBottom: '4px' }}>
      <button
        type="button"
        onClick={handlePull}
        disabled={loading}
        className="btn btn--style-secondary btn--size-small"
      >
        {loading ? 'Pulling…' : "Pull This Week's Posts"}
      </button>

      {message && (
        <p
          style={{
            marginTop: '6px',
            fontSize: '13px',
            color: isError ? 'var(--theme-error-500)' : 'var(--theme-text)',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default PullPostsButton
