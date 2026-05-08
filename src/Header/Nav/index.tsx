'use client'

import React, { useEffect, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

function LiveClock({ timezone }: { timezone: string }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: timezone,
        }).format(new Date()),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timezone])

  return <span>{time}</span>
}

export const HeaderNav: React.FC<{
  data: HeaderType
  locationLabel?: string | null
  timezone?: string | null
}> = ({ data, locationLabel, timezone }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => (
        <CMSLink className="text-primary-muted" key={i} {...link} appearance="link" />
      ))}

      <span className="w-px h-4 bg-border" aria-hidden="true" />

      <span
        className="font-mono text-muted-foreground"
        style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}
      >
        {locationLabel && `${locationLabel} · `}
        <LiveClock timezone={timezone ?? 'America/Chicago'} />
      </span>
    </nav>
  )
}
