# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based personal portfolio website template called "Astrofy" that serves as Joan Esquivel's personal brand website (JoanMedia). The site includes a blog, CV section, projects showcase, and store functionality.

## Development Commands

- **Development server**: `pnpm run dev` or `npm run dev` - Starts local development server
- **Build**: `pnpm run build` or `npm run build` - Builds the site for production
- **Preview**: `pnpm run preview` or `npm run preview` - Preview production build locally
- **Package management**: Use `pnpm install` (preferred) as indicated in README

## Architecture Overview

### Tech Stack
- **Astro**: Static site generator with component islands
- **TailwindCSS**: Utility-first CSS framework
- **DaisyUI**: Component library built on TailwindCSS
- **TypeScript**: Type-safe JavaScript

### Project Structure
- `src/components/`: Reusable Astro components (Card, Header, Sidebar, etc.)
- `src/layouts/`: Page layouts (BaseLayout, PostLayout, StoreItemLayout)
- `src/pages/`: Route-based pages including dynamic routes for blog and store
- `src/content/`: Content collections for blog posts and store items
- `src/config.ts`: Global site configuration (titles, descriptions, settings)
- `public/`: Static assets (images, favicon, etc.)

### Content Management
- **Blog**: Markdown files in `src/content/blog/` with frontmatter schema validation
- **Store**: Markdown files in `src/content/store/` for shop items
- **Content schemas**: Defined in `src/content/config.ts` using Zod validation
- **Slug generation**: Controlled by `GENERATE_SLUG_FROM_TITLE` in config

### Key Configuration Files
- `astro.config.mjs`: Astro configuration with MDX, sitemap, and TailwindCSS integrations
- `src/config.ts`: Site metadata and feature toggles (TRANSITION_API, etc.)
- `tailwind.config.cjs`: TailwindCSS configuration
- `tsconfig.json`: TypeScript configuration with path aliases for components and layouts

### Component System
- **BaseLayout**: Main layout wrapper for all pages
- **Sidebar**: Navigation with profile, menu items, and social links
- **Cards**: HorizontalCard and Card components for content display
- **Timeline**: CV/resume timeline components
- **Theme**: Controlled via `data-theme` attribute on html element (DaisyUI themes)

### Dynamic Routes
- Blog pagination: `src/pages/blog/[...page].astro`
- Blog posts: `src/pages/blog/[slug].astro`
- Blog tags: `src/pages/blog/tag/[tag]/[...page].astro`
- Store pagination: `src/pages/store/[...page].astro`
- Store items: `src/pages/store/[slug].astro`

### Important Notes
- Uses static site generation (SSG) - dynamic routes are incompatible with SSR
- Site URL configured as `https://www.joanmedia.dev`
- Path aliases: `@components/*` and `@layouts/*` for cleaner imports
- RSS feed auto-generated at `/rss.xml`
- Sitemap auto-generated for SEO