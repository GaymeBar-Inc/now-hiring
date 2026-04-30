type ResendTopic = {
  id: string
  name: string
}

type TopicsListResponse = {
  data: ResendTopic[]
}

type TopicCreateResponse = {
  data: {
    id: string
  }
}

const RESEND_BASE = 'https://api.resend.com'

function resendFetch(path: string, init?: RequestInit): Promise<Response> | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Resend Topics] RESEND_API_KEY not configured — skipping')
    return null
  }
  return fetch(`${RESEND_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

export async function createResendTopic(audienceId: string, name: string): Promise<string | null> {
  try {
    const res = resendFetch(`/audiences/${audienceId}/topics`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    if (!res) return null
    const response = await res
    if (!response.ok) {
      console.error('[Resend Topics] Failed to create topic', { name, status: response.status })
      return null
    }
    const data = (await response.json()) as TopicCreateResponse
    return data.data.id
  } catch (err) {
    console.error('[Resend Topics] Exception creating topic', err)
    return null
  }
}

export async function updateResendTopic(
  audienceId: string,
  topicId: string,
  name: string,
): Promise<void> {
  try {
    const res = resendFetch(`/audiences/${audienceId}/topics/${topicId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
    if (!res) return
    const response = await res
    if (!response.ok) {
      console.error('[Resend Topics] Failed to update topic', {
        topicId,
        name,
        status: response.status,
      })
    }
  } catch (err) {
    console.error('[Resend Topics] Exception updating topic', err)
  }
}

export async function deleteResendTopic(audienceId: string, topicId: string): Promise<void> {
  try {
    const res = resendFetch(`/audiences/${audienceId}/topics/${topicId}`, {
      method: 'DELETE',
    })
    if (!res) return
    const response = await res
    if (!response.ok) {
      console.error('[Resend Topics] Failed to delete topic', { topicId, status: response.status })
    }
  } catch (err) {
    console.error('[Resend Topics] Exception deleting topic', err)
  }
}

export async function subscribeContactToTopic(
  audienceId: string,
  topicId: string,
  email: string,
): Promise<void> {
  try {
    const res = resendFetch(`/audiences/${audienceId}/topics/${topicId}/contacts`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    if (!res) return
    const response = await res
    if (!response.ok) {
      console.error('[Resend Topics] Failed to subscribe contact to topic', {
        topicId,
        status: response.status,
      })
    }
  } catch (err) {
    console.error('[Resend Topics] Exception subscribing contact to topic', err)
  }
}

export type { ResendTopic, TopicsListResponse }
