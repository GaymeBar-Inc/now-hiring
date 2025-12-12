import type { Block } from 'payload'

/**
 * Subscribe Block
 *
 * This block defines CMS-editable content for a newsletter subscribe form.
 * It can be placed on the Home page, Post layouts, or anywhere blocks are used.
 *
 * The actual subscriber storage lives in the `newsletter-subscribers` collection.
 */
export const Subscribe: Block = {
  slug: 'subscribe',
  interfaceName: 'SubscribeBlock',
  labels: {
    singular: 'Subscribe',
    plural: 'Subscribe Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Subscribe to the newsletter',
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue: 'Get updates in your inbox. No spam.',
    },
    {
      name: 'placeholder',
      type: 'text',
      defaultValue: 'Enter your email',
    },
    {
      name: 'buttonText',
      type: 'text',
      defaultValue: 'Subscribe',
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'homepage',
      admin: {
        description: 'Stored with the subscriber record (e.g. homepage, post-footer)',
      },
    },
  ],
}
