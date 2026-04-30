import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { deleteResendTopicHook } from './hooks/deleteResendTopic'
import { syncToResendTopic } from './hooks/syncToResendTopic'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [syncToResendTopic],
    afterDelete: [deleteResendTopicHook],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Shown on the Resend unsubscribe page to help subscribers understand this topic.',
      },
    },
    {
      name: 'resendTopicId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Synced automatically from Resend Topics API — do not edit manually.',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
