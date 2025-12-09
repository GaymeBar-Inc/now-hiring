# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

This is a Next.js 15 application built with:

- **Payload CMS** (v3.67.0) - Headless CMS backend
- **TypeScript** - Type safety throughout the codebase
- **React 19** - Component-based frontend framework
- **TailwindCSS** - Utility-first CSS framework with shadcn/ui components
- **PostgreSQL** via Vercel Postgres adapter for database storage

## Development Commands

### Basic Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests (unit and e2e)
pnpm test

# Run unit tests only
pnpm run test:int

# Run e2e tests only
pnpm run test:e2e
```

### Payload-specific Commands

```bash
# Generate TypeScript types from Payload config
pnpm generate:types

# Generate import map for Payload
pnpm generate:importmap

# Run the Payload CLI directly
pnpm payload
```

## Key Architecture Components

### Core Structure

1. **`src/`** - Main source code directory:
   - `app/` - Next.js app router files (frontend pages, API routes)
   - `collections/` - Payload CMS collection definitions (Pages, Posts, Media, Categories, Users)
   - `blocks/` - Layout building blocks (Hero, Content, Media, CallToAction, Archive)
   - `components/` - Reusable UI components
   - `Footer/` & `Header/` - Site header and footer configurations
   - `SiteSettings/` - Global site settings configuration
   - `utilities/` - Utility functions for metadata, URL handling, etc.
   - `payload.config.ts` - Main Payload CMS configuration

### Metadata Handling Architecture

This template implements comprehensive SEO and metadata handling:

1. **Global Site Settings**: The `SiteSettings` global configuration includes fields like:
   - `siteName` (used as base for page titles)
   - `siteDescription` (default meta description)
   - `ogImage` (default Open Graph image)

2. **Per-Page Metadata**: Each Page and Post collection can have a `meta` field with:
   - `title` (custom title override)
   - `description` (custom meta description)
   - `image` (custom OG image for the specific page/post)

3. **Dynamic Meta Generation**:
   - The `generateMetadata()` function in `/src/app/(frontend)/[slug]/page.tsx` handles per-page metadata
   - Uses `generateMeta()` utility to create proper title, description, and Open Graph tags
   - Integrates with site settings for default values when page-specific data is missing

4. **Open Graph Integration**:
   - The `mergeOpenGraph()` function combines site defaults with page-specific content
   - Proper handling of image URLs (OG images) through the media collection

### Metadata Generation Flow

- Homepage title uses only the site name
- Other pages use "Site Name | Page Title"
- Fallback to default OG image when no specific image is provided
- Site settings are cached using Next.js `unstable_cache` for performance

## Important Files and Functions

1. **Metadata generation**: `/src/utilities/generateMeta.ts`
2. **Open Graph merging**: `/src/utilities/mergeOpenGraph.ts`
3. **Site settings retrieval**: `/src/utilities/getSiteSettings.ts`
4. **Main site configuration**: `src/payload.config.ts`
5. **Page metadata handling**: `src/app/(frontend)/[slug]/page.tsx`

The system follows a standard Payload CMS template architecture where:

- Content management happens in the admin panel
- Pages are generated from collections with layout builders
- Metadata is managed both globally (site-wide defaults) and per-document
- Next.js handles static generation with proper meta tags for SEO
