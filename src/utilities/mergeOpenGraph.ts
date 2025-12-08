import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { getSiteSettings } from './getSiteSettings'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'An open-source website built with Payload and Next.js.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: 'Payload Website Template',
  title: 'Payload Website Template',
}

export const mergeOpenGraph = async (
  og?: Metadata['openGraph'],
): Promise<Metadata['openGraph']> => {
  // Get site settings to override defaults
  let siteName = 'Payload Website Template'

  try {
    const settings = await getSiteSettings()
    if (settings?.siteName) {
      siteName = settings.siteName
    }
  } catch (error) {
    // Use defaults if site settings not available
    console.log(error)
  }

  const defaultOpenGraphWithSettings: Metadata['openGraph'] = {
    ...defaultOpenGraph,
    siteName,
  }

  return {
    ...defaultOpenGraphWithSettings,
    ...og,
    images: og?.images ? og.images : defaultOpenGraphWithSettings.images,
  }
}
