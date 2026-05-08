'use client'

import React, { useEffect, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export function LiveClock({ timezone }: { timezone: string }) {
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
}> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => (
        <CMSLink className="text-primary-muted" key={i} {...link} appearance="link" />
      ))}
    </nav>
  )
}
