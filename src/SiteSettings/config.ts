import type { GlobalConfig } from 'payload'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'My Website',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Default Meta Description',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Default OG Image',
      admin: {
        description: "Used when pages don't have their own OG image",
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon',
      required: false,
      admin: {
        description: 'Used as the site favicon (appears in browser tabs and bookmarks)',
      },
    },
    {
      type: 'group',
      name: 'social',
      label: 'Social Media',
      fields: [
        {
          name: 'twitterCreator',
          type: 'text',
          label: 'Twitter/X Handle',
          admin: {
            placeholder: '@yourhandle',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
