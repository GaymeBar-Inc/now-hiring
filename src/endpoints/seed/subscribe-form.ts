import { createResendContact } from '@/utilities/resend'

const SUBSCRIBE_FORM_TITLE = 'Subscribe to Newsletter'

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
              text: 'Thanks! If you’re new, you’ll receive a welcome email shortly.',
              version: 1,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
            },
          ],
          version: 1,
          direction: null,
          format: '',
          indent: 0,
        },
      ],
      version: 1,
      direction: null,
      format: '',
      indent: 0,
    },
  },

  submitButtonLabel: 'Subscribe',

  // Welcome emails are sent in code after we attempt to create the subscriber in Resend.
  // This prevents sending a welcome email repeatedly when someone re-subscribes or is already subscribed.
  // See: `src/utilities/resend.ts` and the subscribe submission handler that calls `createResendContact()`.

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
