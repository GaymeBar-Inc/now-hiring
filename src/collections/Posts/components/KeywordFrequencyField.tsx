'use client'

import { useField } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { extractLexicalText } from '@/utilities/extractLexicalText'
import { SideBarSubSection } from '@/components/ui/sidebarSections'

type KeywordEntry = {
  id: string | number
  name: string
  count: number
}

type LexicalData = {
  root: { text?: string; children?: unknown[]; [k: string]: unknown }
  [k: string]: unknown
}

type ThresholdResult = {
  color: string
  backgroundColor: string
  label: string
  tooltip: string
}

type PillWithTooltipProps = {
  color: string
  backgroundColor: string
  label: string
  tooltip: string
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getThreshold(count: number): ThresholdResult {
  if (count === 0)
    return {
      color: '#ffffff',
      backgroundColor: '#6b7280',
      label: 'Missing',
      tooltip:
        'No occurrences found in the post body. Add this keyword naturally to signal relevance to search engines.',
    }
  if (count <= 2)
    return {
      color: '#ffffff',
      backgroundColor: '#d97706',
      label: 'Low',
      tooltip:
        'Below the recommended range. Mention this keyword a few more times where it fits naturally.',
    }
  if (count <= 5)
    return {
      color: '#ffffff',
      backgroundColor: '#16a34a',
      label: 'Optimal',
      tooltip:
        'Ideal frequency. Search engines can clearly associate this post with the topic without over-optimization.',
    }
  return {
    color: '#ffffff',
    backgroundColor: '#ea580c',
    label: 'High',
    tooltip:
      'May appear too often. Excessive repetition can look like keyword stuffing — consider reducing usage.',
  }
}

const TOOLTIP_BG = '#1f2937'

const PillWithTooltip: React.FC<PillWithTooltipProps> = ({
  color,
  backgroundColor,
  label,
  tooltip,
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <span
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {visible && (
        <span
          role="tooltip"
          style={{
            backgroundColor: TOOLTIP_BG,
            borderRadius: '6px',
            bottom: 'calc(100% + 8px)',
            color: '#f9fafb',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: 1.5,
            padding: '8px 10px',
            pointerEvents: 'none',
            position: 'absolute',
            right: 0,
            width: '220px',
            zIndex: 10,
          }}
        >
          {tooltip}
          <span
            aria-hidden="true"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${TOOLTIP_BG}`,
              bottom: '-5px',
              height: 0,
              position: 'absolute',
              right: '10px',
              width: 0,
            }}
          />
        </span>
      )}
      <span
        style={{
          backgroundColor,
          borderRadius: '9999px',
          color,
          cursor: 'default',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          padding: '2px 8px',
        }}
      >
        {label}
      </span>
    </span>
  )
}

function extractIds(fieldValue: unknown): (string | number)[] {
  if (!Array.isArray(fieldValue)) return []
  return fieldValue.flatMap((item) => {
    if (typeof item === 'string') return [item]
    if (typeof item === 'number') return [item]
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>
      const id = obj.value ?? obj.id
      if (typeof id === 'string' || typeof id === 'number') return [id]
    }
    return []
  })
}

const KeywordFrequencyField: React.FC = () => {
  const { value: contentValue } = useField<LexicalData>({ path: 'content' })
  const { value: keywordsRaw } = useField<unknown>({ path: 'keywords' })

  const [entries, setEntries] = useState<KeywordEntry[]>([])
  const nameCache = useRef<Record<string | number, string>>({})

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
          const res = await fetch(`/api/keywords?where[id][in]=${uncached.join(',')}&limit=50`)
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
    <SideBarSubSection>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--theme-border-color)',
        }}
      >
        <label>Keyword Frequency</label>
        {entries.map(({ id, name, count }) => {
          const { color, backgroundColor, label, tooltip } = getThreshold(count)
          return (
            <div
              key={id}
              style={{
                alignItems: 'center',
                display: 'flex',
                fontSize: '16px',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  color: 'var(--theme-text)',
                  maxWidth: '55%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                - {name}
              </span>
              <span style={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: '6px' }}>
                <span style={{ color: 'var(--theme-text-dim)', fontWeight: 600 }}>{count}×</span>
                <PillWithTooltip
                  color={color}
                  backgroundColor={backgroundColor}
                  label={label}
                  tooltip={tooltip}
                />
              </span>
            </div>
          )
        })}
      </div>
    </SideBarSubSection>
  )
}

export default KeywordFrequencyField
