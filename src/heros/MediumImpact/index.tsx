import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="hero-medium-impact flex flex-row items-center justify-center">
      <div className="content-container mb-8 mr-4">
        {richText && <RichText className="mb-6" data={richText} enableGutter={true} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex container gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="media-container">
        {media && typeof media === 'object' && (
          <div>
            <Media className="" imgClassName="" priority resource={media} />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
