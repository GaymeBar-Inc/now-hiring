import { NextResponse } from 'next/server'

function getBlobBaseUrl(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null
  const storeId = token.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase()
  if (!storeId) return null
  return `https://${storeId}.public.blob.vercel-storage.com`
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const blobBase = getBlobBaseUrl()
  if (!blobBase) {
    return new NextResponse('Blob storage not configured', { status: 500 })
  }

  const { path } = await params
  const filename = path.join('/')
  const blobUrl = `${blobBase}/${filename}`

  let upstream: Response
  try {
    upstream = await fetch(blobUrl)
  } catch {
    return new NextResponse('Failed to fetch from blob storage', { status: 502 })
  }

  if (!upstream.ok) {
    return new NextResponse('Not found', { status: 404 })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('Content-Type', contentType)
  // s-maxage lets Vercel's Edge Network cache at the CDN level —
  // only the first request per file invokes this function.
  headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400')

  return new NextResponse(upstream.body, { status: 200, headers })
}
