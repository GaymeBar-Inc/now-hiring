import type { PayloadHandler } from 'payload'

/**
 * GET /api/broadcasts/weekly-posts
 *
 * Returns IDs of posts published in the last 7 days.
 * Used by PullPostsButton to pre-populate the `posts` field on weekly_digest broadcasts.
 */
export const weeklyPostsHandler: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const result = await req.payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { publishedAt: { greater_than_equal: sevenDaysAgo.toISOString() } },
      ],
    },
    sort: '-publishedAt',
    limit: 50,
  })

  const postIds = result.docs.map((post) => post.id)

  if (postIds.length === 0) {
    return Response.json(
      { postIds, total: 0, message: 'No published posts found in the last 7 days.' },
      { status: 200 },
    )
  }

  return Response.json({ postIds, total: result.totalDocs })
}
