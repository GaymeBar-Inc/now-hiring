// src/resend/template.ts
import type { EmailLayout, Media } from '../payload-types'
import { resolvePayloadImageUrl } from '../utilities/blobUrl'

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'Twitter',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
  website: 'Website',
}

function resolveLogoUrl(logo: ((number | null) | Media) | undefined | null): string | null {
  return resolvePayloadImageUrl(logo as Media | number | null | undefined, {
    size: 'thumbnail',
    email: true,
  })
}

/**
 * Renders a complete email-safe HTML document from a body fragment and an
 * EmailLayout global record. Uses table-based layout with all inline styles
 * for consistent rendering across Gmail, Outlook, Apple Mail, etc.
 *
 * The unsubscribe link placeholder {{{RESEND_UNSUBSCRIBE_URL}}} is replaced
 * by Resend at send time for broadcast emails.
 */
export function renderEmailTemplate(bodyHtml: string, layout: EmailLayout): string {
  const header = layout.header ?? {}
  const footer = layout.footer

  const headerBg = header.bgColor ?? '#ffffff'
  const headerText = header.textColor ?? '#000000'
  const footerBg = footer.bgColor ?? '#f4f4f4'
  const footerTextColor = footer.textColor ?? '#666666'

  const logoUrl = resolveLogoUrl(header.logo)

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" width="200" style="max-width:200px;height:auto;display:block;margin:0 auto;" />`
    : ''

  const taglineHtml = header.tagline
    ? `<p style="margin:10px 0 0;font-size:14px;color:${headerText};font-family:Arial,Helvetica,sans-serif;">${header.tagline}</p>`
    : ''

  const socialLinksHtml = (footer.socialLinks ?? [])
    .map(
      ({ platform, url }) =>
        `<a href="${url}" target="_blank" style="color:${footerTextColor};text-decoration:underline;margin:0 8px;font-size:13px;font-family:Arial,Helvetica,sans-serif;">${PLATFORM_LABELS[platform] ?? platform}</a>`,
    )
    .join('')

  const unsubscribeText = footer.unsubscribeText ?? 'Unsubscribe from this list'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#f9f9f9;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:${headerBg};padding:24px 32px;border-radius:4px 4px 0 0;">
              ${logoHtml}
              ${taglineHtml}
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 40px;color:#333333;font-size:16px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color:${footerBg};padding:24px 32px;border-radius:0 0 4px 4px;">
              ${
                socialLinksHtml
                  ? `<p style="margin:0 0 14px;line-height:1.6;">${socialLinksHtml}</p>`
                  : ''
              }
              ${
                footer.footerText
                  ? `<p style="margin:0 0 8px;font-size:13px;color:${footerTextColor};font-family:Arial,Helvetica,sans-serif;">${footer.footerText}</p>`
                  : ''
              }
              <p style="margin:0 0 8px;font-size:12px;color:${footerTextColor};font-family:Arial,Helvetica,sans-serif;">${footer.mailingAddress}</p>
              <p style="margin:0;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
                <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${footerTextColor};text-decoration:underline;">${unsubscribeText}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
