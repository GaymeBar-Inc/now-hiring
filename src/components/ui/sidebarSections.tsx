'use client'

import { cn } from '@/utilities/ui'
import * as React from 'react'

type SideBarSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

type SideBarSubSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const SideBarSection: React.FC<SideBarSectionProps> = ({
  title,
  children,
  className,
  style,
}) => {
  const headingId = React.useId()
  return (
    <section
      aria-labelledby={headingId}
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingBottom: '8px',
        marginBottom: '16px',
        borderTop: '1px solid var(--theme-border-color)',
        paddingTop: '12px',
        marginTop: '8px',
        ...style,
      }}
    >
      <h4 id={headingId} style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>
        {title}
      </h4>
      {children}
    </section>
  )
}

export const SideBarSubSection: React.FC<SideBarSubSectionProps> = ({
  title,
  children,
  className,
  style,
}) => {
  const headingId = React.useId()
  return (
    <div role="group" aria-labelledby={headingId} className={cn(className)} style={style}>
      <h5
        id={headingId}
        style={{
          color: 'var(--theme-text-dim)',
          fontSize: '16px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          marginBottom: '16px',
        }}
      >
        {title}
      </h5>
      {children}
    </div>
  )
}
