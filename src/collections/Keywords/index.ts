import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const Keywords: CollectionConfig = {
  slug: 'keywords',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (typeof data.name === 'string') {
          data.name = data.name.trim().toLowerCase()
        }
        return data
      },
    ],
  },
}
