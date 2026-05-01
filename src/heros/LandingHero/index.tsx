'use client'

import React, { useEffect } from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'
import { cn } from '@/utilities/ui'

/* TODO: Replace CSS gradient with shaders.com LinearGradient component.
   Install: pnpm add shaders
   Usage: import { LinearGradient } from 'shaders/react'
   Props: colorA="oklch(10% 0.01 58)" colorB="oklch(48% 0.17 60)"
   Render as the absolute-positioned background canvas. */

export const LandingHero: React.FC<Page['hero']> = ({ links, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(
          135deg,
          oklch(10% 0.01 58) 0%,
          oklch(22% 0.08 54) 30%,
          oklch(38% 0.16 57) 65%,
          oklch(50% 0.17 62) 100%
        )`,
      }}
      aria-label="Hero"
    >
      {/* Subtle noise texture for depth — mid-fi polish */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* Header clearance */}
      <div className="pointer-events-none h-[6.5rem] w-full flex-shrink-0" aria-hidden="true" />

      <div className="container relative z-10 flex flex-col items-center text-center">
        {/* Rich text — h1 and subhead rendered from CMS */}
        {richText && (
          <div
            className={cn('hero-enter mb-10 max-w-4xl')}
            style={{ color: 'var(--color-warm-white)' }}
          >
            <RichText
              className="[&_h1]:text-display [&_h1]:mb-6 [&_h1]:font-display [&_p]:text-body [&_p]:opacity-80 [&_p]:mx-auto"
              data={richText}
              enableGutter={false}
            />
          </div>
        )}

        {/* CTA links */}
        {Array.isArray(links) && links.length > 0 && (
          <ul
            className={cn('hero-enter hero-enter-delay-2 flex flex-wrap items-center justify-center gap-4')}
            role="list"
          >
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink
                  {...link}
                  className={cn(
                    i === 0
                      ? [
                          'inline-flex items-center rounded-[var(--radius)] px-8 py-4',
                          'text-label bg-[var(--color-warm-white)] text-[var(--color-warm-near-black)]',
                          'hover:bg-[var(--color-amber-pale)] active:scale-[0.98]',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-warm-white)] focus:ring-offset-2',
                          'focus:ring-offset-transparent transition-all duration-150',
                        ]
                      : [
                          'inline-flex items-center rounded-[var(--radius)] px-8 py-4',
                          'text-label border border-[rgba(255,255,255,0.35)] text-[var(--color-warm-white)]',
                          'hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.06)]',
                          'active:scale-[0.98]',
                          'focus:outline-none focus:ring-2 focus:ring-[var(--color-warm-white)] focus:ring-offset-2',
                          'focus:ring-offset-transparent transition-all duration-150',
                        ],
                  )}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Secondary anchor hint */}
        <a
          href="#subscribe"
          className={cn(
            'hero-enter hero-enter-delay-3',
            'mt-16 flex flex-col items-center gap-2 opacity-50',
            'hover:opacity-80 transition-opacity duration-200',
            'focus:outline-none focus:opacity-80',
            'text-[var(--color-warm-white)]',
          )}
          aria-label="Scroll to newsletter"
        >
          <span className="text-label" style={{ fontSize: '0.875rem', letterSpacing: '0.06em' }}>
            GET THE NEWSLETTER
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="animate-bounce"
          >
            <path
              d="M10 4v12M4 10l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  )
}
