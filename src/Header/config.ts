import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'group',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mimeType: {
              in: ['image/svg+xml', 'image/png', 'image/jpeg'],
            },
          },
          admin: {
            description: 'Logo image - SVG, PNG, or JPG (optional if text is provided)',
          },
        },
        {
          name: 'text',
          type: 'text',
          admin: {
            description: 'Logo text (optional if image is provided)',
          },
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
