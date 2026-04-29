import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'

type Args = {
  keywordIds: (string | number)[]
  categoryIds: (string | number)[]
  currentPostId: string | number
}

/**
 * Returns up to 3 related posts using a two-phase algorithm:
 *
 * Phase 1 — keyword round-robin (same as before):
 *   For each keyword, fetch up to 3 recent published posts, then round-robin
 *   through the buckets until 3 unique posts are collected.
 *
 * Phase 2 — category fallback:
 *   If fewer than 3 were found, fill remaining slots with the most-recently
 *   published posts that share any of the current post's categories, excluding
 *   the current post and any already-selected keyword posts.
 */
export async function getRelatedPostsByKeywords({
  keywordIds,
  categoryIds,
  currentPostId,
}: Args): Promise<Post[]> {
  const payload = await getPayload({ config: configPromise })

  const selected: Post[] = []
  const selectedIds = new Set<string | number>([currentPostId])

  // Phase 1: keyword round-robin
  if (keywordIds.length > 0) {
    const buckets = await Promise.all(
      keywordIds.map((keywordId) =>
        payload
          .find({
            collection: 'posts',
            depth: 1,
            limit: 3,
            sort: '-publishedAt',
            where: {
              and: [
                { keywords: { in: [keywordId] } },
                { id: { not_equals: currentPostId } },
                { _status: { equals: 'published' } },
              ],
            },
          })
          .then((r) => r.docs as Post[]),
      ),
    )

    for (let round = 0; round < 3 && selected.length < 3; round++) {
      for (const bucket of buckets) {
        if (selected.length >= 3) break
        const candidate = bucket[round]
        if (candidate && !selectedIds.has(candidate.id)) {
          selected.push(candidate)
          selectedIds.add(candidate.id)
        }
      }
    }
  }

  // Phase 2: category fallback for remaining slots
  if (selected.length < 3 && categoryIds.length > 0) {
    const needed = 3 - selected.length
    const { docs: categoryFill } = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: needed,
      sort: '-publishedAt',
      where: {
        and: [
          { categories: { in: categoryIds } },
          { id: { not_in: [...selectedIds] } },
          { _status: { equals: 'published' } },
        ],
      },
    })
    selected.push(...(categoryFill as Post[]))
  }

  return selected
}
