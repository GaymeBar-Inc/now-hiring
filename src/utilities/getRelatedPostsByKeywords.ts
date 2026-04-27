import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'

type Args = {
  keywordIds: (string | number)[]
  currentPostId: string | number
}

/**
 * Returns up to 3 related posts by cycling through keyword buckets.
 *
 * Algorithm:
 * - For each keyword, fetch up to 3 most-recent published posts (in parallel)
 * - Round-robin through the buckets until 3 unique posts are collected
 *
 * Examples:
 * - 1 keyword  → 3 most-recent posts for that keyword
 * - 2 keywords → most-recent for kw1, most-recent for kw2, 2nd most-recent for kw1
 * - 3+ keywords → most-recent for each of the first 3 keywords
 */
export async function getRelatedPostsByKeywords({
  keywordIds,
  currentPostId,
}: Args): Promise<Post[]> {
  if (!keywordIds.length) return []

  const payload = await getPayload({ config: configPromise })

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

  const selected: Post[] = []
  const selectedIds = new Set<string | number>()

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

  return selected
}
