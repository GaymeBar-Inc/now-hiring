import type { CollectionBeforeChangeHook } from 'payload'
import type { Category } from '../../../payload-types'
import { createResendTopic, updateResendTopic } from '../../../resend/topics'

export const syncToResendTopic: CollectionBeforeChangeHook<Category> = async ({
  data,
  operation,
  originalDoc,
}) => {
  try {
    if (operation === 'create') {
      // Create the Resend Topic and embed the ID in the document before first save.
      // Using beforeChange avoids a payload.update() write-back, which was the source
      // of the duplicate-topic bug (write-back re-fired afterChange with resendTopicId: null).
      const topicId = await createResendTopic(
        data.title as string,
        data.description as string | undefined,
      )
      if (topicId) data.resendTopicId = topicId
    } else if (operation === 'update' && originalDoc?.resendTopicId) {
      const titleChanged = data.title !== undefined && data.title !== originalDoc?.title
      const descriptionChanged =
        data.description !== undefined && data.description !== originalDoc?.description
      if (titleChanged || descriptionChanged) {
        await updateResendTopic(
          originalDoc.resendTopicId,
          titleChanged ? (data.title as string) : undefined,
          descriptionChanged ? (data.description as string | null | undefined) : undefined,
        )
      }
    }
  } catch (err) {
    console.error('[Categories] syncToResendTopic failed', err)
  }

  return data
}
