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
import { useCallback, useState } from 'react'

type Props = {
  field: { label?: string; name: string }
  path: string
  readOnly?: boolean
  useAsSlug?: string
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
  const { collectionSlug, globalSlug } = useDocumentInfo()
  const { slugify } = useServerFunctions()
  const { setValue, value, showError, errorMessage } = useField<string>({ path: path || field.name })
  const { getData, getDataByPath } = useForm()
  const [isLocked, setIsLocked] = useState(false)

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
      {showError && errorMessage && (
        <p
          role="alert"
          style={{ color: '#dc2626', fontSize: '1rem', marginTop: '0.25rem' }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default PostSlugField
