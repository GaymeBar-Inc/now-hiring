'use client'

import { useField } from '@payloadcms/ui'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

type MediaDoc = {
  id?: string | number
  url?: string | null
  alt?: string | null
  updatedAt?: string | null
}

const SocialPreviewField: React.FC = () => {
  const { value: titleValue } = useField<string>({ path: 'meta.title' })
  const { value: descValue } = useField<string>({ path: 'meta.description' })
  const { value: imageValue } = useField<MediaDoc | string | number | null>({
    path: 'meta.image',
  })
  const { value: slugValue } = useField<string>({ path: 'slug' })

  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageValue) {
      setImageUrl(null)
      return
    }

    if (typeof imageValue === 'object' && imageValue !== null && 'url' in imageValue) {
      setImageUrl(getMediaUrl(imageValue.url, imageValue.updatedAt) || null)
      return
    }

    const id = typeof imageValue === 'string' || typeof imageValue === 'number' ? imageValue : null
    if (!id) return

    void fetch(`/api/media/${id}?depth=0`)
      .then((r) => r.json())
      .then((doc: MediaDoc) => {
        setImageUrl(getMediaUrl(doc.url, doc.updatedAt) || null)
      })
      .catch(() => {})
  }, [imageValue])

  const domain = typeof window !== 'undefined' ? window.location.hostname : 'your-site.com'
  const title = titleValue ?? ''
  const description = descValue ?? ''
  const slug = slugValue ?? ''

  return (
    <div style={{ marginBottom: '16px' }}>
      <p
        style={{
          color: 'var(--theme-text-dim)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '10px',
          textTransform: 'uppercase',
        }}
      >
        Social / Link Preview
      </p>

      <div
        style={{
          border: '1px solid var(--theme-border-color)',
          borderRadius: '14px',
          maxWidth: '380px',
          overflow: 'hidden',
        }}
      >
        {/* Hero image */}
        <div
          style={{
            aspectRatio: '1.91 / 1',
            background: 'var(--theme-elevation-100)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {imageUrl ? (
            <Image
              alt={title || 'preview'}
              src={imageUrl}
              fill
              unoptimized
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ) : (
            <div
              style={{
                alignItems: 'center',
                color: 'var(--theme-text-dim)',
                display: 'flex',
                fontSize: '12px',
                height: '100%',
                justifyContent: 'center',
              }}
            >
              No meta image set
            </div>
          )}
        </div>

        {/* Text */}
        <div
          style={{
            background: 'var(--theme-elevation-50, var(--theme-elevation-100))',
            borderTop: '1px solid var(--theme-border-color)',
            padding: '10px 14px 12px',
          }}
        >
          <p
            style={{
              color: 'var(--theme-text-dim)',
              fontSize: '11px',
              letterSpacing: '0.02em',
              marginBottom: '3px',
              textTransform: 'uppercase',
            }}
          >
            {domain}
            {slug ? ` · /posts/${slug}` : ''}
          </p>

          {title && (
            <p
              style={
                {
                  color: 'var(--theme-text)',
                  display: '-webkit-box',
                  fontSize: '14px',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: description ? '3px' : 0,
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                } as React.CSSProperties
              }
            >
              {title}
            </p>
          )}

          {description && (
            <p
              style={
                {
                  color: 'var(--theme-text-dim)',
                  display: '-webkit-box',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                } as React.CSSProperties
              }
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SocialPreviewField
