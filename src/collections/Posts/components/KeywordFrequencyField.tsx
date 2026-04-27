'use client'

import { useField } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { extractLexicalText } from '@/utilities/extractLexicalText'

type KeywordEntry = {
  id: string
  name: string
  count: number
}

type LexicalData = {
  root: { text?: string; children?: unknown[]; [k: string]: unknown }
  [k: string]: unknown
}

type ThresholdResult = {
  color: string
  label: string
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getThreshold(count: number): ThresholdResult {
  if (count === 0) return { color: 'var(--theme-text-dim)', label: 'Missing' }
  if (count <= 2) return { color: '#f59e0b', label: 'Low' }
  if (count <= 5) return { color: '#22c55e', label: 'Optimal' }
  return { color: '#f97316', label: 'High' }
}

function extractIds(fieldValue: unknown): string[] {
  if (!Array.isArray(fieldValue)) return []
  return fieldValue.flatMap((item) => {
    if (typeof item === 'string') return [item]
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>
      const id = obj.value ?? obj.id
      if (typeof id === 'string') return [id]
    }
    return []
  })
}

const KeywordFrequencyField: React.FC = () => {
  const { value: contentValue } = useField<LexicalData>({ path: 'content' })
  const { value: keywordsRaw } = useField<unknown>({ path: 'keywords' })

  const [entries, setEntries] = useState<KeywordEntry[]>([])
  const nameCache = useRef<Record<string, string>>({})

  const keywordIds = extractIds(keywordsRaw)

  useEffect(() => {
    if (!keywordIds.length) {
      setEntries([])
      return
    }

    const uncached = keywordIds.filter((id) => !nameCache.current[id])

    const compute = async () => {
      if (uncached.length > 0) {
        try {
          const res = await fetch(
            `/api/keywords?where[id][in]=${uncached.join(',')}&limit=50`,
          )
          if (res.ok) {
            const data = (await res.json()) as { docs: Array<{ id: string; name: string }> }
            for (const kw of data.docs) {
              nameCache.current[kw.id] = kw.name
            }
          }
        } catch {
          // non-critical — fall back to showing ID
        }
      }

      const bodyText = contentValue?.root
        ? extractLexicalText(contentValue.root as Parameters<typeof extractLexicalText>[0])
        : ''

      setEntries(
        keywordIds.map((id) => {
          const name = nameCache.current[id] ?? id
          const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi')
          const count = (bodyText.match(regex) ?? []).length
          return { id, name, count }
        }),
      )
    }

    void compute()
    // keywordIds is derived inline so we stringify it to detect real changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(keywordIds), contentValue])

  if (!entries.length) return null

  return (
    <div style={{ marginTop: '8px', marginBottom: '4px' }}>
      <p
        style={{
          color: 'var(--theme-text-dim)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '6px',
          textTransform: 'uppercase',
        }}
      >
        Keyword Frequency
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {entries.map(({ id, name, count }) => {
          const { color, label } = getThreshold(count)
          return (
            <div
              key={id}
              style={{
                alignItems: 'center',
                display: 'flex',
                fontSize: '12px',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  color: 'var(--theme-text)',
                  maxWidth: '60%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
              <span style={{ color, flexShrink: 0, fontWeight: 600 }}>
                {count}×{' '}
                <span style={{ fontSize: '11px', fontWeight: 400 }}>{label}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default KeywordFrequencyField
