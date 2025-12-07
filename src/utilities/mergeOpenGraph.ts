import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { getSiteSettings } from './getSiteSettings'

export const mergeOpenGraph = async (
  og?: Metadata['openGraph'],
): Promise<Metadata['openGraph']> => {
  const serverUrl = getServerSideURL()

  let siteName = 'My Website'
  let siteDescription = ''
  let defaultImage = `${serverUrl}/website-template-OG.webp`

  try {
    const settings = await getSiteSettings()
    siteName = settings?.siteName || siteName
    siteDescription = settings?.siteDescription || siteDescription
    if (settings?.ogImage && typeof settings.ogImage === 'object') {
      defaultImage = serverUrl + settings.ogImage.url
    }
  } catch {
    // Use defaults if site settings not available
  }

  const defaultOpenGraph: Metadata['openGraph'] = {
    type: 'website',
    description: siteDescription,
    images: [{ url: defaultImage }],
    siteName,
    title: siteName,
  }

  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
