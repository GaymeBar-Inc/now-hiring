import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { Payload } from 'payload'
import type { Broadcast, EmailLayout, Post } from '../payload-types'
import { renderEmailTemplate } from './template'
import { renderPostCard } from './renderPostCard'

type AssembleOptions = {
  preview?: boolean
}

export async function assembleBroadcastEmail(
  payload: Payload,
  broadcast: Broadcast,
  options: AssembleOptions = {},
): Promise<string> {
  const bodyHtml = broadcast.body ? convertLexicalToHTML({ data: broadcast.body }) : ''
  const postCardsHtml = buildPostCardsHtml(broadcast, options.preview ?? false)

  const layout = (await payload.findGlobal({
    slug: 'email-layout',
    depth: 1,
  })) as EmailLayout

  const html = renderEmailTemplate(bodyHtml + postCardsHtml, layout)

  if (options.preview) {
    return html.replace(
      /href="\{{{RESEND_UNSUBSCRIBE_URL}}}"[^>]*>[^<]*/,
      'href="#">[Unsubscribe — preview only]',
    )
  }

  return html
}

function buildPostCardsHtml(broadcast: Broadcast, preview: boolean): string {
  if (broadcast.type === 'single_post') {
    const post = broadcast.posts?.[0]
    if (!post || typeof post === 'number') return ''
    return renderPostCard(post as Post, preview)
  }

  if (broadcast.type === 'weekly_digest') {
    const posts = broadcast.posts
    if (!posts?.length) return ''
    return posts
      .filter((p): p is Post => typeof p !== 'number')
      .map((p) => renderPostCard(p, preview))
      .join('\n')
  }

  return ''
}
