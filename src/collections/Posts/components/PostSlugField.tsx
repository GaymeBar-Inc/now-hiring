'use client'

import {
  Button,
  FieldLabel,
  TextInput,
  useDocumentInfo,
  useField,
  useForm,
  useServerFunctions,
  useTranslation,
} from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

type Props = {
  field: { label?: string; name: string }
  path: string
  readOnly?: boolean
  useAsSlug?: string
}

type SlugCheckResponse = {
  totalDocs: number
}

/**
 * Mirrors Payload's built-in SlugField but defaults to unlocked.
 * Registered via slugField({ overrides }) in the Posts collection.
 */
const PostSlugField: React.FC<Props> = ({
  field,
  path,
  readOnly: readOnlyFromProps,
  useAsSlug = 'title',
}) => {
  const { label } = field
  const { t } = useTranslation()
  const { collectionSlug, globalSlug, id: documentId } = useDocumentInfo()
  const { slugify } = useServerFunctions()
  const { setValue, value, showError, errorMessage } = useField<string>({ path: path || field.name })
  const { getData, getDataByPath } = useForm()
  const [isLocked, setIsLocked] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  // Real-time duplicate slug check — fires 600ms after the slug stops changing.
  // Field-level `validate` only runs at publish time in Payload's draft mode,
  // so this surfaces the conflict earlier while the editor is still writing.
  useEffect(() => {
    if (!value) {
      setDuplicateWarning(null)
      return
    }

    const params = new URLSearchParams({
      'where[slug][equals]': value,
      'where[_status][equals]': 'published',
      depth: '0',
      limit: '1',
    })
    if (documentId) params.append('where[id][not_equals]', String(documentId))

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/posts?${params.toString()}`, {
          credentials: 'include',
        })
        if (!response.ok) return
        const result = (await response.json()) as SlugCheckResponse
        setDuplicateWarning(
          result.totalDocs > 0
            ? `Slug "${value}" is already used by a published post. Edit it before publishing.`
            : null,
        )
      } catch {
        // Silent fail — field validate still catches duplicates at publish time.
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [value, documentId])

  const handleGenerate = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      const valueToSlugify = getDataByPath(useAsSlug)
      const formattedSlug = await slugify({
        collectionSlug,
        data: getData(),
        globalSlug,
        path,
        valueToSlugify,
      })
      if (formattedSlug === null || formattedSlug === undefined) {
        setValue('')
        return
      }
      if (value !== formattedSlug) {
        setValue(formattedSlug)
      }
    },
    [collectionSlug, getData, getDataByPath, globalSlug, path, setValue, slugify, useAsSlug, value],
  )

  const toggleLock = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsLocked((prev) => !prev)
  }, [])

  const errorToDisplay = showError && errorMessage ? errorMessage : duplicateWarning

  return (
    <div className="field-type slug-field-component">
      <div className="label-wrapper">
        <FieldLabel htmlFor={`field-${path}`} label={label} />
        {!isLocked && (
          <Button buttonStyle="none" className="lock-button" onClick={handleGenerate}>
            {t('authentication:generate')}
          </Button>
        )}
        <Button buttonStyle="none" className="lock-button" onClick={toggleLock}>
          {isLocked ? t('general:unlock') : t('general:lock')}
        </Button>
      </div>
      <TextInput
        Error={null}
        onChange={setValue}
        path={path || field.name}
        readOnly={Boolean(readOnlyFromProps || isLocked)}
        showError={false}
        value={value}
      />
      {errorToDisplay && (
        <p
          role="alert"
          style={{ color: '#dc2626', fontSize: '1rem', marginTop: '0.25rem' }}
        >
          {errorToDisplay}
        </p>
      )}
    </div>
  )
}

export default PostSlugField
