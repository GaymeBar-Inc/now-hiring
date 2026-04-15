import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { sendBroadcastHandler } from './handlers/send'
import { weeklyPostsHandler } from './handlers/weeklyPosts'

export const Broadcasts: CollectionConfig = {
  slug: 'broadcasts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'sentAt', 'updatedAt'],
    group: 'Email',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  endpoints: [
    {
      // GET /api/broadcasts/weekly-posts
      // Returns post IDs published in the last 7 days for pre-populating weekly digests
      path: '/weekly-posts',
      method: 'get',
      handler: weeklyPostsHandler,
    },
    {
      // POST /api/broadcasts/:id/send
      // Assembles the email, calls Resend, and writes back status fields
      path: '/:id/send',
      method: 'post',
      handler: sendBroadcastHandler,
    },
  ],
  fields: [
    // -------------------------------------------------------------------------
    // Shared fields — present on every broadcast type
    // -------------------------------------------------------------------------
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: "Internal label — appears in the admin list and maps to Resend's broadcast name",
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'custom',
      options: [
        { label: 'Single Post', value: 'single_post' },
        { label: 'Weekly Digest', value: 'weekly_digest' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Email subject line shown to recipients',
      },
    },
    {
      name: 'previewText',
      type: 'text',
      admin: {
        description: 'Short snippet shown in the inbox before the email is opened',
      },
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Admin-drafted copy — appears above post cards in every broadcast type',
      },
    },

    // -------------------------------------------------------------------------
    // Conditional: single_post
    // -------------------------------------------------------------------------
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        condition: (data) => data?.type === 'single_post',
        description: 'Drives the auto-generated post card appended to this broadcast',
      },
    },

    // -------------------------------------------------------------------------
    // Conditional: weekly_digest
    // -------------------------------------------------------------------------
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        condition: (data) => data?.type === 'weekly_digest',
        description: 'Curated list of posts — edit freely before sending',
      },
    },
    {
      // Custom React button that calls /api/broadcasts/weekly-posts and
      // pre-populates the `posts` relationship field above
      name: 'pullPostsButton',
      type: 'ui',
      admin: {
        condition: (data) => data?.type === 'weekly_digest',
        components: {
          Field: '@/collections/Broadcasts/components/PullPostsButton',
        },
      },
    },

    // -------------------------------------------------------------------------
    // Send action — visible on all types once saved
    // -------------------------------------------------------------------------
    {
      name: 'sendBroadcast',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/Broadcasts/components/SendButton',
        },
      },
    },

    // -------------------------------------------------------------------------
    // Resend sync fields — readOnly, system writes only
    // -------------------------------------------------------------------------
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'draft',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
          ],
          admin: {
            readOnly: true,
            description: 'Managed by the system — updated after Resend API calls',
          },
        },
        {
          name: 'resendBroadcastId',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'ID returned by Resend after the broadcast is created',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'scheduledAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Populated for scheduled sends',
          },
        },
        {
          name: 'sentAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Populated on successful send',
          },
        },
      ],
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Populated on send failure — check here when status is "failed"',
      },
    },
  ],
}
