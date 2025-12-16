import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateDescription, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { getSiteSettings } from '@/utilities/getSiteSettings'
import { Resend } from 'resend'

const generateDescription: GenerateDescription<Post> = ({ doc }) => {
  if (!doc?.content?.root?.children) return ''

  const extractText = (node: any): string => {
    if (typeof node.text === 'string') return node.text
    if (Array.isArray(node.children)) {
      return node.children.map(extractText).join('')
    }
    return ''
  }

  const fullText = extractText(doc.content.root)
  // Trim to 160 characters (ideal for SEO meta descriptions)
  return fullText.substring(0, 160).trim()
}

const generateTitle: GenerateTitle<Post | Page> = async ({ doc }) => {
  // Get the site name from settings to use as prefix
  let siteName = 'Payload Website Template'

  try {
    const settings = await getSiteSettings()
    if (settings?.siteName) {
      siteName = settings.siteName
    }
  } catch (error) {
    // Use default if site settings not available
    console.log(error)
  }

  // If doc has a title, use it with the site name prefix; otherwise fallback to site name
  if (doc?.title) {
    return `${siteName} | ${doc.title}`
  }

  return siteName
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const SUBSCRIBE_FORM_TITLE = 'Subscribe to Newsletter'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_API
  if (!apiKey) return null
  return new Resend(apiKey)
}

async function createOrUpdateResendContact(email: string) {
  const resend = getResendClient()
  if (!resend) {
    // Template-friendly: do not hard-fail if the user hasn't configured Resend yet.
    console.warn('[Resend] Missing RESEND_API_KEY (or RESEND_API). Skipping contact creation.')
    return
  }

  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
  })

  // Treat errors as non-fatal so subscriptions still succeed.
  if (error) {
    const msg = typeof error === 'string' ? error : (error as any)?.message
    console.warn('[Resend] contacts.create error:', msg || error)
  }
}

function extractSubmittedEmail(submissionData: any): string | null {
  if (!Array.isArray(submissionData)) return null
  const emailEntry = submissionData.find((item) => item?.field === 'email')
  const value = emailEntry?.value
  return typeof value === 'string' ? value.trim() : null
}

export const plugins: Plugin[] = [
  vercelBlobStorage({
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  }),
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateDescription,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      hooks: {
        afterChange: [
          async ({ doc, req }) => {
            try {
              // Only run on create
              if (req?.method && req.method !== 'POST') return doc

              const formValue: any = (doc as any)?.form
              let formTitle: string | undefined

              if (formValue && typeof formValue === 'object') {
                formTitle = formValue?.title
              } else if (formValue) {
                const formDoc = await req.payload.findByID({
                  collection: 'forms',
                  id: formValue,
                  depth: 0,
                })
                formTitle = (formDoc as any)?.title
              }

              if (formTitle !== SUBSCRIBE_FORM_TITLE) return doc

              const email = extractSubmittedEmail((doc as any)?.submissionData)
              if (!email) return doc

              await createOrUpdateResendContact(email)
            } catch (err) {
              console.warn('[Resend] Failed to create contact from form submission:', err)
            }

            return doc
          },
        ],
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
