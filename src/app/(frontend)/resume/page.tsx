import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { marked } from 'marked'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Resume } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'resumes',
    where: { _status: { equals: 'published' } },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })
  const resume = docs[0] as Resume | undefined
  return { title: resume?.title ?? 'Resume' }
}

export default async function ResumePage() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'resumes',
    where: { _status: { equals: 'published' } },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })

  const resume = docs[0] as Resume | undefined
  if (!resume) notFound()

  const html = resume.content ? await marked(resume.content) : ''

  return (
    <>
      <link rel="stylesheet" href="/resume-stylesheet.css" />
      <div className="resume" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
