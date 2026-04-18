'use client'

import { FieldLabel, useField, useForm } from '@payloadcms/ui'
import { useCallback, useRef } from 'react'

type SiteSettingsResponse = {
  siteName?: string
}

/**
 * Custom Title field for Posts.
 * - Behaves identically to the default text field while typing.
 * - On blur, dispatches a meta.title update in the format "{Site Name} | {Title}".
 * - Site name is fetched once on first blur and cached for subsequent updates.
 */
const PostTitleField: React.FC = () => {
  const { value, setValue } = useField<string>({ path: 'title' })
  const { dispatchFields } = useForm()
  const siteNameRef = useRef<string | null>(null)

  const handleBlur = useCallback(async () => {
    if (!value) return

    if (siteNameRef.current === null) {
      try {
        const res = await fetch('/api/globals/site-settings')
        const json = (await res.json()) as SiteSettingsResponse
        siteNameRef.current = json?.siteName ?? ''
      } catch {
        siteNameRef.current = ''
      }
    }

    const siteName = siteNameRef.current
    const metaTitle = siteName ? `${siteName} | ${value}` : value

    dispatchFields({ type: 'UPDATE', path: 'meta.title', value: metaTitle })
  }, [value, dispatchFields])

  return (
    <div className="field-type text">
      <FieldLabel htmlFor="field-title" label="Title" required />
      <input
        id="field-title"
        type="text"
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        required
      />
    </div>
  )
}

export default PostTitleField
