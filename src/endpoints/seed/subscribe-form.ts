import type { RequiredDataFromCollectionSlug } from 'payload'

export const subscribeForm: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Subscribe to Newsletter',
  confirmationType: 'message',
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Thanks for subscribing! Please check your inbox.',
              version: 1,
            },
          ],
          version: 1,
        },
      ],
      version: 1,
    },
  },

  submitButtonLabel: 'Subscribe',

  // Optional: if your Form Builder is configured to send emails on submission,
  // this will send a welcome email to the subscriber.
  emails: [
    {
      emailFrom: '"Now Hiring" <news@yourdomain.com>',
      emailTo: '{{email}}',
      subject: 'Welcome to the newsletter!',
      message: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'You’re subscribed — thanks for joining!',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      },
    },
  ],

  fields: [
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email',
      required: true,
      width: 100,
    },
  ],

  redirect: undefined,
}
