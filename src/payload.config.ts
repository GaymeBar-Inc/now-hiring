import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import type { Payload, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { SiteSettings } from './SiteSettings/SiteSettings'
import { subscribeForm } from './endpoints/seed/subscribe-form'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function ensureDefaultForms(payload: Payload) {
  const defaults = [subscribeForm]

  for (const form of defaults) {
    const title = form?.title
    if (!title) continue

    const existing = await payload.find({
      collection: 'forms',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing?.docs?.length) {
      // Keep seeded default forms in sync with the repo (important for template users).
      // This also ensures any removed fields (e.g. Form Builder `emails`) are cleared in the DB.
      await payload.update({
        collection: 'forms',
        id: existing.docs[0].id,
        data: form,
        overrideAccess: true,
      })
      continue
    }

    await payload.create({
      collection: 'forms',
      data: form,
      overrideAccess: true,
    })
  }
}

// Migrate site-settings.email.welcomeBody from string to Lexical JSON object if necessary
async function ensureDefaultSiteSettings(payload: Payload) {
  const current = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  })

  const email: any = (current as any)?.email || {}
  const welcomeBody = email?.welcomeBody

  // If this field used to be a textarea, the DB may contain a plain string.
  // Lexical richText requires an object. Convert the old string into a minimal Lexical doc.
  if (typeof welcomeBody === 'string') {
    await payload.updateGlobal({
      slug: 'site-settings',
      overrideAccess: true,
      data: {
        ...(current as any),
        email: {
          ...email,
          welcomeBody: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: welcomeBody,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      },
    })
  }
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  collections: [Pages, Posts, Media, Categories, Users],
  cors: [getServerSideURL()].filter(Boolean),
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY!,
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS!,
    defaultFromName: process.env.RESEND_FROM_NAME!,
  }),
  globals: [Header, Footer, SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  onInit: async (payload) => {
    await ensureDefaultForms(payload)
    await ensureDefaultSiteSettings(payload)
  },
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
