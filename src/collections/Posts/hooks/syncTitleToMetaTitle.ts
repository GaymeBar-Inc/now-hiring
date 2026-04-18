import type { CollectionBeforeChangeHook } from 'payload'
import type { Post } from '../../../payload-types'

/**
 * Keeps meta.title in sync with the post title.
 * Format: "{Site Name} | {Post Title}"
 */
export const syncTitleToMetaTitle: CollectionBeforeChangeHook<Post> = async ({
  data,
  req: { payload, context },
}) => {
  if (context.autosave || !data.title) return data

  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
  const siteName = siteSettings?.siteName ?? ''
  const metaTitle = siteName ? `${siteName} | ${data.title}` : data.title

  return {
    ...data,
    meta: {
      ...data.meta,
      title: metaTitle,
    },
  }
}
