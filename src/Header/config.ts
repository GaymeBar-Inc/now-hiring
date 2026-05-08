import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'group',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mimeType: {
              in: ['image/svg+xml', 'image/png', 'image/jpeg'],
            },
          },
          admin: {
            description: 'Logo image - SVG, PNG, or JPG (optional if text is provided)',
          },
        },
        {
          name: 'text',
          type: 'text',
          admin: {
            description: 'Logo text (optional if image is provided)',
          },
        },
      ],
    },
    {
      name: 'locationLabel',
      type: 'text',
      defaultValue: 'NOLA',
      admin: { description: 'Short location shown in the header (e.g. SF, NOLA, NYC)' },
    },
    {
      name: 'timezone',
      type: 'select',
      defaultValue: 'America/Chicago',
      options: [
        // ── Americas ──────────────────────────────────────────────────────
        { label: 'Americas — Honolulu (HT)',       value: 'Pacific/Honolulu' },
        { label: 'Americas — Anchorage (AKT)',     value: 'America/Anchorage' },
        { label: 'Americas — Los Angeles (PT)',    value: 'America/Los_Angeles' },
        { label: 'Americas — Vancouver (PT)',      value: 'America/Vancouver' },
        { label: 'Americas — Denver (MT)',         value: 'America/Denver' },
        { label: 'Americas — Phoenix (MST)',       value: 'America/Phoenix' },
        { label: 'Americas — Chicago (CT)',        value: 'America/Chicago' },
        { label: 'Americas — Mexico City (CT)',    value: 'America/Mexico_City' },
        { label: 'Americas — New York (ET)',       value: 'America/New_York' },
        { label: 'Americas — Toronto (ET)',        value: 'America/Toronto' },
        { label: 'Americas — Bogotá (COT)',        value: 'America/Bogota' },
        { label: 'Americas — Lima (PET)',          value: 'America/Lima' },
        { label: 'Americas — Caracas (VET)',       value: 'America/Caracas' },
        { label: 'Americas — Santiago (CLT)',      value: 'America/Santiago' },
        { label: 'Americas — São Paulo (BRT)',     value: 'America/Sao_Paulo' },
        { label: 'Americas — Buenos Aires (ART)', value: 'America/Argentina/Buenos_Aires' },
        // ── Europe ────────────────────────────────────────────────────────
        { label: 'Europe — London (GMT/BST)',      value: 'Europe/London' },
        { label: 'Europe — Lisbon (WET)',          value: 'Europe/Lisbon' },
        { label: 'Europe — Paris (CET)',           value: 'Europe/Paris' },
        { label: 'Europe — Berlin (CET)',          value: 'Europe/Berlin' },
        { label: 'Europe — Amsterdam (CET)',       value: 'Europe/Amsterdam' },
        { label: 'Europe — Brussels (CET)',        value: 'Europe/Brussels' },
        { label: 'Europe — Madrid (CET)',          value: 'Europe/Madrid' },
        { label: 'Europe — Rome (CET)',            value: 'Europe/Rome' },
        { label: 'Europe — Vienna (CET)',          value: 'Europe/Vienna' },
        { label: 'Europe — Zurich (CET)',          value: 'Europe/Zurich' },
        { label: 'Europe — Stockholm (CET)',       value: 'Europe/Stockholm' },
        { label: 'Europe — Oslo (CET)',            value: 'Europe/Oslo' },
        { label: 'Europe — Copenhagen (CET)',      value: 'Europe/Copenhagen' },
        { label: 'Europe — Warsaw (CET)',          value: 'Europe/Warsaw' },
        { label: 'Europe — Prague (CET)',          value: 'Europe/Prague' },
        { label: 'Europe — Helsinki (EET)',        value: 'Europe/Helsinki' },
        { label: 'Europe — Athens (EET)',          value: 'Europe/Athens' },
        { label: 'Europe — Kyiv (EET)',            value: 'Europe/Kiev' },
        { label: 'Europe — Istanbul (TRT)',        value: 'Europe/Istanbul' },
        { label: 'Europe — Moscow (MSK)',          value: 'Europe/Moscow' },
        // ── Africa ────────────────────────────────────────────────────────
        { label: 'Africa — Casablanca (WET)',      value: 'Africa/Casablanca' },
        { label: 'Africa — Lagos (WAT)',           value: 'Africa/Lagos' },
        { label: 'Africa — Cairo (EET)',           value: 'Africa/Cairo' },
        { label: 'Africa — Nairobi (EAT)',         value: 'Africa/Nairobi' },
        { label: 'Africa — Johannesburg (SAST)',   value: 'Africa/Johannesburg' },
        // ── Middle East ───────────────────────────────────────────────────
        { label: 'Middle East — Beirut (EET)',     value: 'Asia/Beirut' },
        { label: 'Middle East — Jerusalem (IST)',  value: 'Asia/Jerusalem' },
        { label: 'Middle East — Riyadh (AST)',     value: 'Asia/Riyadh' },
        { label: 'Middle East — Dubai (GST)',      value: 'Asia/Dubai' },
        // ── Asia ──────────────────────────────────────────────────────────
        { label: 'Asia — Karachi (PKT)',           value: 'Asia/Karachi' },
        { label: 'Asia — Kolkata (IST)',           value: 'Asia/Kolkata' },
        { label: 'Asia — Colombo (IST)',           value: 'Asia/Colombo' },
        { label: 'Asia — Dhaka (BST)',             value: 'Asia/Dhaka' },
        { label: 'Asia — Bangkok (ICT)',           value: 'Asia/Bangkok' },
        { label: 'Asia — Jakarta (WIB)',           value: 'Asia/Jakarta' },
        { label: 'Asia — Singapore (SGT)',         value: 'Asia/Singapore' },
        { label: 'Asia — Kuala Lumpur (MYT)',      value: 'Asia/Kuala_Lumpur' },
        { label: 'Asia — Manila (PHT)',            value: 'Asia/Manila' },
        { label: 'Asia — Hong Kong (HKT)',         value: 'Asia/Hong_Kong' },
        { label: 'Asia — Shanghai (CST)',          value: 'Asia/Shanghai' },
        { label: 'Asia — Taipei (CST)',            value: 'Asia/Taipei' },
        { label: 'Asia — Seoul (KST)',             value: 'Asia/Seoul' },
        { label: 'Asia — Tokyo (JST)',             value: 'Asia/Tokyo' },
        { label: 'Asia — Almaty (ALMT)',           value: 'Asia/Almaty' },
        // ── Oceania ───────────────────────────────────────────────────────
        { label: 'Oceania — Perth (AWST)',         value: 'Australia/Perth' },
        { label: 'Oceania — Brisbane (AEST)',      value: 'Australia/Brisbane' },
        { label: 'Oceania — Sydney (AEST/AEDT)',   value: 'Australia/Sydney' },
        { label: 'Oceania — Melbourne (AEST/AEDT)', value: 'Australia/Melbourne' },
        { label: 'Oceania — Auckland (NZST)',      value: 'Pacific/Auckland' },
        { label: 'Oceania — Fiji (FJT)',           value: 'Pacific/Fiji' },
        { label: 'Oceania — Guam (ChST)',          value: 'Pacific/Guam' },
      ],
      admin: { description: 'Timezone for the live clock' },
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
