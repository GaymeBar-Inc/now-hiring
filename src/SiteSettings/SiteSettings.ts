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
      name: 'email',
      label: 'Email',
      type: 'group',
      admin: {
        description:
          'Controls email display identity + behavior (welcome email, broadcasts, digests). Verified sender address stays in .env (RESEND_FROM_ADDRESS).',
      },
      fields: [
        {
          name: 'fromName',
          label: 'From Name',
          type: 'text',
          defaultValue: 'Now Hiring',
          admin: {
            description:
              'Display name shown in the inbox. The actual sending address is configured via RESEND_FROM_ADDRESS in .env.',
          },
        },
        {
          name: 'replyTo',
          label: 'Reply-To Email',
          type: 'email',
          required: false,
          admin: {
            description:
              'Optional. If set, replies will go to this address (recommended if your “from” address is a no-inbox sender).',
          },
        },
        {
          name: 'senderLabel',
          label: 'Sender Label',
          type: 'text',
          defaultValue: 'Newsletter',
          required: false,
          admin: {
            description: 'Optional label you can use in templates (“Newsletter”, “Updates”, etc.).',
          },
        },
        {
          name: 'welcomeEmailEnabled',
          label: 'Send Welcome Email on Subscribe',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'welcomeSubject',
          label: 'Welcome Email Subject',
          type: 'text',
          defaultValue: 'Welcome to the newsletter!',
          admin: {
            condition: (_, siblingData) => Boolean((siblingData as any)?.welcomeEmailEnabled),
          },
        },
        {
          name: 'welcomeBody',
          label: 'Welcome Email Body',
          type: 'textarea',
          defaultValue: `Thanks for subscribing 🎉\n\nYou’re on the list — we’ll send updates as we publish new posts.`,
          admin: {
            condition: (_, siblingData) => Boolean((siblingData as any)?.welcomeEmailEnabled),
            description:
              'V1 uses a simple text body. Later we can upgrade this to a rich HTML template.',
          },
        },
      ],
    },
  ],
}
