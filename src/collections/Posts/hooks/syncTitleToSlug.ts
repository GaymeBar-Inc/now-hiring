import { slugify } from 'payload/shared'

import type { CollectionBeforeChangeHook } from 'payload'
import type { Post } from '../../../payload-types'

/**
 * Auto-generates the slug from the post title on every save.
 *
 * Bypasses Payload's built-in `generateSlug` checkbox hook, which permanently
 * disables itself after the first CREATE (the checkbox is saved as `false` once
 * a slug exists, so all subsequent UPDATE autosaves skip generation).
 *
 * User-override detection: if the incoming slug differs from the last-saved slug
 * the user has manually edited it, so we leave it alone.
 */
export const syncTitleToSlug: CollectionBeforeChangeHook<Post> = ({ data, originalDoc }) => {
  if (!data.title) return data

  // If the user has manually changed the slug since the last save, respect it.
  if (originalDoc?.slug && data.slug !== originalDoc.slug) return data

  return {
    ...data,
    slug: slugify(data.title as string),
  }
}
