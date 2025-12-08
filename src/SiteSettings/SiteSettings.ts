import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'text',
      required: true,
    },
  ],
}
