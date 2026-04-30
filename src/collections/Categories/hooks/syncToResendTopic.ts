import type { CollectionAfterChangeHook } from 'payload'
import type { Category, EmailSetting } from '../../../payload-types'
import { createResendTopic, updateResendTopic } from '../../../resend/topics'

export const syncToResendTopic: CollectionAfterChangeHook<Category> = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  // Skip the write-back re-entry: resendTopicId already set, title unchanged
  if (operation === 'update' && doc.resendTopicId && doc.title === previousDoc?.title) {
    return doc
  }

  try {
    const emailSettings = (await payload.findGlobal({
      slug: 'email-settings',
      depth: 0,
    })) as EmailSetting
    const audienceId = emailSettings?.resendAudienceId
    if (!audienceId) return doc

    if (!doc.resendTopicId) {
      const topicId = await createResendTopic(audienceId, doc.title)
      if (topicId) {
        await payload.update({
          collection: 'categories',
          id: doc.id,
          data: { resendTopicId: topicId },
          overrideAccess: true,
        })
      }
    } else if (doc.title !== previousDoc?.title) {
      await updateResendTopic(audienceId, doc.resendTopicId, doc.title)
    }
  } catch (err) {
    console.error('[Categories] syncToResendTopic failed', err)
  }

  return doc
}
