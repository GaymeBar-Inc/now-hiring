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

export const mergeOpenGraph = async (og?: Metadata['openGraph']): Promise<Metadata['openGraph']> => {
  // Get site settings to override defaults
  let siteName = 'Payload Website Template'
  let description = 'An open-source website built with Payload and Next.js.'

  try {
    const settings = await getSiteSettings()
    if (settings?.siteName) {
      siteName = settings.siteName
    }
    if (settings?.siteDescription) {
      description = settings.siteDescription
    }
  } catch (error) {
    // Use defaults if site settings not available
  }

  const defaultOpenGraphWithSettings: Metadata['openGraph'] = {
    ...defaultOpenGraph,
    siteName,
    description,
  }

  return {
    ...defaultOpenGraphWithSettings,
    ...og,
    images: og?.images ? og.images : defaultOpenGraphWithSettings.images,
  }
}
