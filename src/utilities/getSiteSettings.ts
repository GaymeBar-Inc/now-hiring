import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SiteSetting } from '@/payload-types'

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting> => {
    const payload = await getPayload({ config: configPromise })
    return payload.findGlobal({ slug: 'site-settings' })
  },
  ['site-settings'],
  { tags: ['site-settings'] },
)