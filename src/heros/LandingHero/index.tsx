'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'

type HeroLink = NonNullable<Page['hero']['links']>[number]

const ShaderBackground = dynamic(
  () =>
    import('shaders/react').then((mod) => {
      function Bg() {
        return (
          <mod.Shader style={{ width: '100%', height: '100%' }}>
            <mod.LinearGradient colorA="#fef8ee" colorB="#f0b030" angle={150} />
          </mod.Shader>
        )
      }
      Bg.displayName = 'ShaderBackground'
      return { default: Bg }
    }),
  { ssr: false },
)

export const LandingHero: React.FC<Page['hero']> = ({ links, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  })

  return (
    <section
      className="relative flex min-h-[78vh] flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-amber-pale)' }}
      aria-label="Hero"
    >
      {/* WebGL warm amber gradient — CSS background-color is the SSR/no-WebGL fallback */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <ShaderBackground />
      </div>

      {/* Header clearance */}
      <div className="pointer-events-none h-[6.5rem] w-full flex-shrink-0" aria-hidden="true" />

      {/* Content: headline top, CTAs bottom */}
      <div
        className="container relative z-10 flex flex-1 flex-col justify-between pb-16 pt-10"
        style={{ color: 'var(--color-warm-near-black)' }}
      >
        {richText && (
          <div className="hero-enter">
            <RichText
              className="[&_h1]:text-display [&_h1]:mb-8 [&_p]:text-body [&_p]:opacity-75"
              data={richText}
              enableGutter={false}
            />
          </div>
        )}

        <div className="hero-enter hero-enter-delay-2 flex flex-wrap items-center gap-6 pt-10">
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap items-center gap-3" role="list">
              {links.map(({ link }: HeroLink, i: number) => (
                <li key={i}>
                  <CMSLink
                    {...link}
                    className={
                      i === 0
                        ? 'inline-flex items-center rounded-[var(--radius)] px-7 py-3.5 text-label bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-transparent transition-all duration-150'
                        : 'inline-flex items-center rounded-[var(--radius)] px-7 py-3.5 text-label border border-border text-foreground hover:bg-accent active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-transparent transition-all duration-150'
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          <a
            href="#subscribe"
            className="text-label inline-flex items-center gap-2 opacity-50 hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:opacity-90"
            aria-label="Scroll to newsletter subscribe"
          >
            Get the newsletter
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 3v10M3 8l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
