import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'
import type { Where } from 'payload'

type Args = {
  categoryIds?: (string | number)[]
  keywordIds?: (string | number)[]
  limit?: number
}

export async function getPostsByFilters({ categoryIds, keywordIds, limit = 10 }: Args): Promise<Post[]> {
  const payload = await getPayload({ config: configPromise })

  const hasCategories = categoryIds && categoryIds.length > 0
  const hasKeywords = keywordIds && keywordIds.length > 0

  let where: Where | undefined

  if (hasCategories && hasKeywords) {
    where = {
      or: [
        { categories: { in: categoryIds } },
        { keywords: { in: keywordIds } },
      ],
    }
  } else if (hasCategories) {
    where = { categories: { in: categoryIds } }
  } else if (hasKeywords) {
    where = { keywords: { in: keywordIds } }
  }

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    sort: '-publishedAt',
    ...(where ? { where } : {}),
  })

  return docs as Post[]
}
