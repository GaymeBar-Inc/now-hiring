import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getSiteSettings } from './getSiteSettings'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

const capitalizeSlug = (slug: string): string => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  isHomepage?: boolean
}): Promise<Metadata> => {
  const { doc, isHomepage = false } = args

  let siteName = 'My Website'
  let siteDescription = ''
  try {
    const settings = await getSiteSettings()
    siteName = settings?.siteName || siteName
    siteDescription = settings?.siteDescription || siteDescription
  } catch {
    // Use defaults if site settings not available
  }

  const ogImage = getImageURL(doc?.meta?.image)

  // Determine the page name: use meta.title, then doc.title, then capitalize slug
  const pageName = doc?.meta?.title || doc?.title || (doc?.slug ? capitalizeSlug(doc.slug) : null)

  // Homepage: just siteName; other pages: siteName | pageName
  const title = isHomepage || !pageName ? siteName : `${siteName} | ${pageName}`

  return {
    description: doc?.meta?.description || siteDescription,
    openGraph: await mergeOpenGraph({
      description: doc?.meta?.description || siteDescription || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    twitter: {
      card: 'summary_large_image',
      title,
    },
    title,
  }
}
