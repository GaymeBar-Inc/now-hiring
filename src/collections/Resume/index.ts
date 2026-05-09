import type { CollectionConfig } from 'payload'

export const Resume: CollectionConfig = {
  slug: 'resumes',
  labels: { singular: 'Resume', plural: 'Resumes' },
  versions: { drafts: true },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'updatedAt', '_status'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        rows: 30,
        description: 'Raw Markdown — not a rich text editor.',
      },
    },
    {
      name: 'downloadPanel',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/Resume/components/ResumeDownloadPanel',
        },
      },
    },
  ],
}
