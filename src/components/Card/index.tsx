'use client'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { KeywordPill } from '@/components/ui/keyword-pill'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'keywords' | 'publishedAt'
> &
  Partial<Pick<Post, 'content'>>

interface LexicalNode {
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

function countWords(node: LexicalNode): number {
  if (typeof node.text === 'string' && node.text.trim()) {
    return node.text.trim().split(/\s+/).filter(Boolean).length
  }
  if (Array.isArray(node.children)) {
    return node.children.reduce((sum, child) => sum + countWords(child as LexicalNode), 0)
  }
  return 0
}

function getReadMinutes(content: Post['content']): number {
  const words = countWords(content.root as unknown as LexicalNode)
  return Math.max(1, Math.round(words / 250))
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}.${dd}.${yy}`
}

export const Card: React.FC<{
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
  index?: number
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps, index = 0 } = props

  const { slug, categories, keywords, meta, title, publishedAt, content } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const hasKeywords = keywords && Array.isArray(keywords) && keywords.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`
  const readMinutes = content ? getReadMinutes(content) : 1
  const formattedDate = formatDate(publishedAt)
  const cardNumber = `NO. ${String(index + 1).padStart(2, '0')}`

  return (
    <article
      className={`post-card flex flex-row md:flex-col hover:cursor-pointer${className ? ` ${className}` : ''}`}
      ref={card.ref}
    >
      <div className="post-thumb">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            resource={metaImage}
            size="33vw"
            imgClassName="absolute inset-0 w-full h-full object-cover object-center"
            fill
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 1,
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              background: 'color-mix(in oklch, var(--background) 80%, transparent)',
              backdropFilter: 'blur(6px)',
              borderRadius: '4px',
              letterSpacing: '0.08em',
            }}
          >
            {cardNumber}
          </span>
        </div>
      </div>

      <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
            {showCategories && hasCategories && (
              <Fragment>
                {categories?.map((category, i) => {
                  if (typeof category === 'object') {
                    return (
                      <span key={i} className="tag">
                        {category.title || 'Untitled'}
                      </span>
                    )
                  }
                  return null
                })}
              </Fragment>
            )}
            {hasKeywords && (
              <Fragment>
                {keywords!.map((kw) =>
                  typeof kw === 'object' ? <KeywordPill key={kw.id} keyword={kw} /> : null,
                )}
              </Fragment>
            )}
          </div>
          {formattedDate && (
            <span
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                color: 'var(--muted-foreground)',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {formattedDate}
            </span>
          )}
        </div>

        {titleToUse && (
          <h3
            className="font-display"
            style={{
              fontWeight: 600,
              fontSize: '1.375rem',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            <Link
              className="not-prose no-underline"
              href={href}
              ref={link.ref}
              style={{ color: 'inherit' }}
            >
              {titleToUse}
            </Link>
          </h3>
        )}

        {sanitizedDescription && (
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--muted-foreground)',
              lineHeight: 1.55,
              flex: 1,
            }}
          >
            {sanitizedDescription}
          </p>
        )}

        <div
          style={{
            marginTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              letterSpacing: '0.08em',
            }}
          >
            {readMinutes} MIN READ
          </span>
          <span style={{ color: 'var(--primary-on-bg)' }} aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </article>
  )
}
