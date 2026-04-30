import type { CollectionAfterDeleteHook } from 'payload'
import type { Category } from '../../../payload-types'
import { deleteResendTopic } from '../../../resend/topics'

export const deleteResendTopicHook: CollectionAfterDeleteHook<Category> = async ({ doc }) => {
  if (!doc.resendTopicId) return

  try {
    await deleteResendTopic(doc.resendTopicId)
  } catch (err) {
    console.error('[Categories] deleteResendTopicHook failed', err)
  }
}
