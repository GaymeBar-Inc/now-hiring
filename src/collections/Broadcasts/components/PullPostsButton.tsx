'use client'

import { useDocumentInfo, useForm } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

/**
 * UI field rendered inside the weekly_digest form.
 * Calls GET /api/broadcasts/weekly-posts and pre-populates the `posts` relationship field.
 * Auto-fires on mount when the type was just changed to weekly_digest (not when loading an
 * existing weekly_digest broadcast). The admin can re-pull or remove posts at any time.
 */
const PullPostsButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const { dispatchFields, submit } = useForm()
  const { savedDocumentData } = useDocumentInfo()

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

      // Trigger a draft save so Payload's postMessage fires and the live preview refreshes.
      void submit({ skipValidation: true, disableFormWhileProcessing: false })
    } catch (err: unknown) {
      setIsError(true)
      setMessage(err instanceof Error ? err.message : 'Failed to pull posts — try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-pull when the type is first changed to weekly_digest. If the saved document already
  // has type === 'weekly_digest' (i.e. loading an existing broadcast), skip auto-pull so we
  // don't overwrite posts the user has already curated.
  useEffect(() => {
    const savedType = savedDocumentData?.type as string | undefined
    if (savedType !== 'weekly_digest') {
      void handlePull()
    }
    // Intentionally runs once on mount only — savedDocumentData captured at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
