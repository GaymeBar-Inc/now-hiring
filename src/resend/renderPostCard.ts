import type { Media, Post } from '../payload-types'
import { getServerSideURL } from '../utilities/getURL'

function resolveImageUrl(heroImage: Post['heroImage']): string | null {
  if (!heroImage || typeof heroImage === 'number') return null
  const media = heroImage as Media
  if (!media.url) return null
  if (media.url.startsWith('http://') || media.url.startsWith('https://')) return media.url
  return `${getServerSideURL()}${media.url}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function renderPostCard(post: Post): string {
  const postUrl = `${getServerSideURL()}/posts/${post.slug ?? ''}`
  const imageUrl = resolveImageUrl(post.heroImage)
  const description = post.meta?.description ?? null
  const publishedAt = post.publishedAt ? formatDate(post.publishedAt) : null

  const imageHtml = imageUrl
    ? `<tr>
        <td style="padding:0 0 0 0;">
          <a href="${postUrl}" style="display:block;text-decoration:none;">
            <img src="${imageUrl}" alt="${post.title}" width="520" style="max-width:100%;height:200px;object-fit:cover;display:block;" />
          </a>
        </td>
      </tr>`
    : ''

  const dateHtml = publishedAt
    ? `<p style="margin:0 0 6px;font-size:12px;color:#888888;font-family:Arial,Helvetica,sans-serif;">${publishedAt}</p>`
    : ''

  const descriptionHtml = description
    ? `<p style="margin:8px 0 0;font-size:14px;color:#555555;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">${description}</p>`
    : ''

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:16px;">
  ${imageHtml}
  <tr>
    <td style="padding:16px 20px;">
      ${dateHtml}
      <h2 style="margin:0;font-size:18px;font-weight:700;line-height:1.3;font-family:Arial,Helvetica,sans-serif;">
        <a href="${postUrl}" style="color:#111111;text-decoration:none;">${post.title}</a>
      </h2>
      ${descriptionHtml}
      <p style="margin:12px 0 0;">
        <a href="${postUrl}" style="color:#0070f3;font-size:14px;font-family:Arial,Helvetica,sans-serif;text-decoration:underline;">Read more &rarr;</a>
      </p>
    </td>
  </tr>
</table>`
}
