export type BroadcastSummary = {
  id: string
  subject: string
  sendStatus?: string | null
}

type BroadcastListResponse = {
  docs?: BroadcastSummary[]
}

export const fetchBroadcastsForPost = async (
  postId: string | number,
  signal?: AbortSignal,
): Promise<BroadcastSummary[]> => {
  const res = await fetch(
    `/api/broadcasts?where[posts][in]=${postId}&depth=0&limit=10`,
    { signal },
  )
  const json: BroadcastListResponse = await res.json()
  return json.docs ?? []
}
