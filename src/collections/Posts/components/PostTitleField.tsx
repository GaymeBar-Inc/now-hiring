'use client'

import { FieldLabel, TextInput, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/utilities/useDebounce'

type Props = {
  field: { label?: string; name: string; required?: boolean }
  path: string
  readOnly?: boolean
}

const PostTitleField: React.FC<Props> = ({ field, path, readOnly }) => {
  const resolvedPath = path || field.name
  const { value: formValue, setValue } = useField<string>({ path: resolvedPath })

  // Local state updates immediately on every keystroke — no flicker
  const [localValue, setLocalValue] = useState(formValue ?? '')

  // Only commit to the form (triggering autosave + slug generation) after 600ms idle
  const debouncedValue = useDebounce(localValue, 600)

  useEffect(() => {
    if (debouncedValue !== formValue) {
      setValue(debouncedValue)
    }
  }, [debouncedValue])

  return (
    <div>
      <FieldLabel
        htmlFor={`field-${resolvedPath}`}
        label={field.label}
        required={field.required}
      />
      <TextInput
        onChange={(e) => setLocalValue(e.target.value)}
        path={resolvedPath}
        readOnly={readOnly}
        value={localValue}
      />
    </div>
  )
}

export default PostTitleField
