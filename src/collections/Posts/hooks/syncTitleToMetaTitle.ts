import type { CollectionBeforeChangeHook } from 'payload'
import type { Post } from '../../../payload-types'

type SiteSettingsCache = {
  siteName: string
  cachedAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let siteSettingsCache: SiteSettingsCache | null = null

/**
 * Keeps meta.title in sync with the post title on every save (including autosave).
 * Format: "{Site Name} | {Post Title}"
 *
 * Site settings are cached for 5 minutes to avoid a DB round-trip on every
 * 100ms autosave. If the site name is updated in admin, it propagates within
 * one cache TTL.
 */
export const syncTitleToMetaTitle: CollectionBeforeChangeHook<Post> = async ({
  data,
  req: { payload },
}) => {
  if (!data.title) return data

  const now = Date.now()
  if (!siteSettingsCache || now - siteSettingsCache.cachedAt > CACHE_TTL_MS) {
    const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
    siteSettingsCache = {
      siteName: siteSettings?.siteName ?? '',
      cachedAt: now,
    }
  }

  const metaTitle = siteSettingsCache.siteName
    ? `${siteSettingsCache.siteName} | ${data.title}`
    : data.title

  return {
    ...data,
    meta: {
      ...data.meta,
      title: metaTitle,
    },
  }
}
