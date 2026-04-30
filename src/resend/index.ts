// src/resend/index.ts
export { getResendClient, retryResendCall, isRateLimitError, sleep } from './client'
export type { CreateResendContactResult, AddToResendSegmentResult } from './contacts'
export { createResendContact, addContactToResendSegment } from './contacts'
export type { SendWelcomeEmailResult, HandleNewsletterSubscribeResult } from './newsletter'
export { sendWelcomeEmail, handleNewsletterSubscribe } from './newsletter'
export type {
  CreateAndSendBroadcastOptions,
  CreateAndSendBroadcastResult,
  CancelResendBroadcastResult,
} from './broadcasts'
export { createAndSendResendBroadcast, cancelResendBroadcast, buildFromAddress } from './broadcasts'
export { renderEmailTemplate } from './template'
export {
  createResendTopic,
  updateResendTopic,
  deleteResendTopic,
  subscribeContactToTopic,
} from './topics'
