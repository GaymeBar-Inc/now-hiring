import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ heading, links, media, richText }) => {
  return (
    <div className="hero-medium-impact mt-4 mb-10 md:my-16 mx-4 grid grid-cols-2 md:grid-cols-[3fr_2fr] gap-x-8 gap-y-4 items-start">
      {heading && (
        <h1 className="text-display col-start-1 row-start-1 self-center text-center md:self-start md:text-left">
          {heading}
        </h1>
      )}

      {media && typeof media === 'object' && (
        <div className="col-start-2 row-start-1 md:row-span-2">
          <Media imgClassName="w-full h-auto" priority resource={media} />
        </div>
      )}

      <div className="col-start-1 col-span-2 md:col-span-1 row-start-2">
        {richText && <RichText className="mb-6" data={richText} enableGutter={true} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
