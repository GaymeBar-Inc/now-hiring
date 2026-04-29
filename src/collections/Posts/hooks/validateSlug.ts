import type { PayloadRequest } from 'payload'

type SlugValidateOptions = {
  req: PayloadRequest
  id?: number | string
}

export const validateSlug = async (
  value: string | null | undefined,
  { req, id }: SlugValidateOptions,
): Promise<string | true> => {
  if (!value) return true

  const result = await req.payload.find({
    collection: 'posts',
    where: {
      slug: { equals: value },
      _status: { equals: 'published' },
      ...(id !== undefined ? { id: { not_equals: id } } : {}),
    },
    limit: 1,
    depth: 0,
  })

  return result.totalDocs > 0
    ? `Slug "${value}" is already in use by another published post. Please edit the slug to make it unique before publishing.`
    : true
}
