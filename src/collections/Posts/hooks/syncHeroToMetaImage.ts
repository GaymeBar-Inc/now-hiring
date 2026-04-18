import type { CollectionBeforeChangeHook } from 'payload'
import type { Post } from '../../../payload-types'

/**
 * Keeps meta.image in sync with heroImage.
 * Runs before every save so the post card in broadcast emails
 * always reflects the hero image without manual duplication.
 */
export const syncHeroToMetaImage: CollectionBeforeChangeHook<Post> = ({ data }) => {
  if (data.heroImage !== undefined) {
    return {
      ...data,
      meta: {
        ...data.meta,
        image: data.heroImage,
      },
    }
  }
  return data
}
