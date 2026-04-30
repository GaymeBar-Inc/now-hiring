import type { CollectionAfterDeleteHook } from 'payload'
import type { Category, EmailSetting } from '../../../payload-types'
import { deleteResendTopic } from '../../../resend/topics'

export const deleteResendTopicHook: CollectionAfterDeleteHook<Category> = async ({
  doc,
  req: { payload },
}) => {
  if (!doc.resendTopicId) return

  try {
    const emailSettings = (await payload.findGlobal({
      slug: 'email-settings',
      depth: 0,
    })) as EmailSetting
    const audienceId = emailSettings?.resendAudienceId
    if (!audienceId) return

    await deleteResendTopic(audienceId, doc.resendTopicId)
  } catch (err) {
    console.error('[Categories] deleteResendTopicHook failed', err)
  }
}
