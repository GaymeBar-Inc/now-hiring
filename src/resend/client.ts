// src/resend/client.ts
import { Resend } from 'resend'
import type { ErrorResponse } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.warn('RESEND_API_KEY not found - some features may be disabled')
}

export function getResendClient() {
  if (!apiKey) return null
  return new Resend(apiKey)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isRateLimitError(err: ErrorResponse): boolean {
  const name = (err?.name || '').toString().toLowerCase()
  const msg = (err?.message || '').toString().toLowerCase()
  return (
    err?.statusCode === 429 ||
    name.includes('rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit')
  )
}

export async function retryResendCall<T>(
  fn: () => Promise<{ data: T | null; error: ErrorResponse | null }>,
  opts: { attempts?: number; baseDelayMs?: number } = {},
): Promise<{ data: T | null; error: ErrorResponse | null }> {
  const attempts = opts.attempts ?? 4
  const baseDelayMs = opts.baseDelayMs ?? 650

  let last: { data: T | null; error: ErrorResponse | null } = { data: null, error: null }

  for (let i = 0; i < attempts; i++) {
    const res = await fn()
    last = res

    if (!res.error) return res
    if (!isRateLimitError(res.error)) return res

    const wait = baseDelayMs * Math.pow(2, i)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Resend] rate limited (429) — backing off', {
        attempt: i + 1,
        waitMs: wait,
        message: res.error?.message,
      })
    }
    await sleep(wait)
  }

  return last
}
