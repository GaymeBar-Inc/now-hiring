// src/utilities/resend.ts
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) throw new Error('Missing RESEND_API_KEY')

const resend = new Resend(apiKey)

export async function createResendContact(email: string) {
  const { data, error } = await resend.contacts.create({
    email,
    unsubscribed: false,
  })

  if (error) {
    // If you want: handle “already exists” more gracefully here
    throw new Error(error.message || 'Resend contact create failed')
  }

  return data
}
