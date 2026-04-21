import type { CollectionBeforeChangeHook } from 'payload'
import type { Category, Post } from '../../../payload-types'

/**
 * Appends category names to the meta title set by syncTitleToMetaTitle.
 * Must run AFTER syncTitleToMetaTitle in the beforeChange hooks array.
 *
 * Input:  "{Site Name} | {Post Title}"   (set by syncTitleToMetaTitle)
 * Output: "{Site Name} | {Post Title} | Category1, Category2"
 *
 * If the post has no categories, or meta.title is not yet set, returns data unchanged.
 */
export const syncCategoriesToMetaTitle: CollectionBeforeChangeHook<Post> = async ({
  data,
  req: { payload },
}) => {
  const baseTitle = data.meta?.title
  if (!baseTitle) return data

  const rawCategories = data.categories ?? []

  const categoryIds = rawCategories.filter((c): c is number => typeof c === 'number')
  const populatedCategories = rawCategories.filter((c): c is Category => typeof c !== 'number')

  if (categoryIds.length === 0 && populatedCategories.length === 0) return data

  // Fetch titles for any categories that arrived as IDs (the normal admin save path)
  let fetchedTitles: string[] = []
  if (categoryIds.length > 0) {
    const result = await payload.find({
      collection: 'categories',
      where: { id: { in: categoryIds } },
      depth: 0,
      limit: categoryIds.length,
    })
    fetchedTitles = result.docs.map((c) => c.title)
  }

  const allTitles = [
    ...populatedCategories.map((c) => c.title),
    ...fetchedTitles,
  ].filter(Boolean)

  if (allTitles.length === 0) return data

  return {
    ...data,
    meta: {
      ...data.meta,
      title: `${baseTitle} | ${allTitles.join(', ')}`,
    },
  }
}
