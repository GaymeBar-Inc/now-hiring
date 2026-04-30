import { getResendClient } from './client'

export async function createResendTopic(
  name: string,
  description?: string,
): Promise<string | null> {
  const resend = getResendClient()
  if (!resend) return null

  try {
    type CreateTopicOptionsWithVisibility = Parameters<typeof resend.topics.create>[0] & {
      visibility?: 'public' | 'private'
    }
    const { data, error } = await resend.topics.create({
      name,
      ...(description ? { description } : {}),
      defaultSubscription: 'opt_out',
      visibility: 'public',
    } as CreateTopicOptionsWithVisibility)
    if (error || !data) {
      console.error('[Resend Topics] Failed to create topic', { name, error })
      return null
    }
    return data.id
  } catch (err) {
    console.error('[Resend Topics] Exception creating topic', err)
    return null
  }
}

export async function updateResendTopic(
  topicId: string,
  name?: string,
  description?: string | null,
): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  try {
    const { error } = await resend.topics.update({
      id: topicId,
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description: description ?? undefined } : {}),
    })
    if (error) {
      console.error('[Resend Topics] Failed to update topic', { topicId, error })
    }
  } catch (err) {
    console.error('[Resend Topics] Exception updating topic', err)
  }
}

export async function deleteResendTopic(topicId: string): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  try {
    const { error } = await resend.topics.remove(topicId)
    if (error) {
      console.error('[Resend Topics] Failed to delete topic', { topicId, error })
    }
  } catch (err) {
    console.error('[Resend Topics] Exception deleting topic', err)
  }
}

export async function subscribeContactToTopic(topicId: string, email: string): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  try {
    const { error } = await resend.contacts.topics.update({
      email,
      topics: [{ id: topicId, subscription: 'opt_in' }],
    })
    if (error) {
      console.error('[Resend Topics] Failed to subscribe contact to topic', { topicId, error })
    }
  } catch (err) {
    console.error('[Resend Topics] Exception subscribing contact to topic', err)
  }
}
