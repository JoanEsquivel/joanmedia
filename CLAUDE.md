# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Joan Esquivel's personal brand website (JoanMedia) — a modern portfolio with 5 pages: Home, Conferences, Blog, AI Blog, and CV. Built with Astro, styled with TailwindCSS v3 + DaisyUI v4, using a top navbar layout with dark/light theme toggle.

## Development Commands

- **Development server**: `pnpm run dev` or `npm run dev` - Starts local development server
- **Build**: `pnpm run build` or `npm run build` - Builds the site for production
- **Preview**: `pnpm run preview` or `npm run preview` - Preview production build locally
- **Package management**: Use `pnpm install` (preferred) as indicated in README

## Architecture Overview

### Tech Stack
- **Astro 5+**: Static site generator with component islands
- **TailwindCSS v3**: Utility-first CSS framework
- **DaisyUI v4**: Component library built on TailwindCSS
- **TypeScript**: Strict mode enabled (`astro/tsconfigs/strict`)
- **Sharp**: Image optimization service (used by Astro's `<Image />` component)

### Project Structure
- `src/components/`: Reusable Astro components (Navbar, BlogCard, BlogFilterBar, Footer, etc.)
- `src/layouts/`: Page layouts (BaseLayout, PostLayout, AIPostLayout)
- `src/pages/`: Route-based pages (index, conferences, cv, blog/*, ai-blog/*, 404)
- `src/content/`: Content collections — blog, ai-blog, ai-blog-sources
- `src/config.ts`: Global site configuration (titles, descriptions, feature toggles)
- `src/styles/global.css`: Global styles, animations, and accessibility utilities
- `public/`: Static assets (images, favicon, etc.)

### Content Management
- **Blog**: Markdown files in `src/content/blog/` with frontmatter schema validation
- **AI Blog**: Markdown files in `src/content/ai-blog/` with category-based organization (qa, ai, frontend, backend, data, cloud, life-work-balance, softskills)
- **AI Blog Sources**: Companion files in `src/content/ai-blog-sources/` with matching filenames, linked via `postSlug` field
- **Content schemas**: Defined in `src/content/config.ts` using Zod validation — blog, ai-blog, and ai-blog-sources collections
- **Slug generation**: Controlled by `GENERATE_SLUG_FROM_TITLE` in config
- **Category config**: `src/lib/aiBlogCategories.ts` defines labels, icons, and descriptions for AI blog categories

### Key Configuration Files
- `astro.config.mjs`: Astro config with MDX, sitemap, TailwindCSS integrations, and `image.domains` whitelist
- `src/config.ts`: Site metadata and feature toggles (TRANSITION_API, etc.)
- `tailwind.config.cjs`: TailwindCSS config — themes: `["night", "lofi"]`, darkTheme: `"night"`
- `tsconfig.json`: Extends `astro/tsconfigs/strict` with path aliases for `@components/*` and `@layouts/*`

### Navigation & Layout
- **Navbar** (`src/components/Navbar.astro`): Sticky top navbar with glass effect, desktop center links, mobile dropdown, theme toggle (night/lofi)
- **BaseLayout**: Wraps all pages with skip-to-content link + Navbar + `<main id="main-content">` + Footer. Prop: `activeItemID` for active nav highlighting
- **Footer**: 3-column layout (branding, nav links, social icons) with copyright line
- **Theme**: Controlled via `data-theme` attribute on `<html>` — "night" (dark, default) and "lofi" (light). Persisted in localStorage

### Pages (5 total + blog/ai-blog routes)
- **Home** (`/`): Hero section with profile photo, CTA buttons (LinkedIn, Email, Blog), latest blog posts grid, latest AI research grid
- **Conferences** (`/conferences`): Card grid layout for conference talks and interviews
- **Blog** (`/blog/`): Client-side filtered blog with search, month dropdown, tag pills, pagination (6 per page)
- **AI Blog** (`/ai-blog/`): AI-generated research with category filter pills, search, month dropdown, tag pills, pagination (6 per page)
- **CV** (`/cv`): Profile, experience timeline, education, certifications, skills as badge pills

### Dynamic Routes
- Blog pagination: `src/pages/blog/[...page].astro` (all posts on single page, client-side pagination)
- Blog posts: `src/pages/blog/[slug].astro`
- Blog tags: `src/pages/blog/tag/[tag]/[...page].astro` (for SEO, uses same filter components)
- AI Blog pagination: `src/pages/ai-blog/[...page].astro`
- AI Blog posts: `src/pages/ai-blog/[slug].astro` (includes sources + series nav)
- AI Blog categories: `src/pages/ai-blog/category/[category]/[...page].astro` (SEO routes)
- AI Blog tags: `src/pages/ai-blog/tag/[tag]/[...page].astro` (SEO routes)

### Component System
- **Navbar**: Top navigation replacing old sidebar. Props: `activeItemID`
- **BlogCard**: Vertical card with Astro `<Image />`, date, title, description, tags. Uses `<article>` element. Data attributes for client-side filtering
- **BlogFilterBar**: Unified search + month dropdown + tag pills. Client-side JS handles filtering, pagination, and state. Uses `aria-live` regions for screen reader announcements
- **AIBlogCard**: Like BlogCard but with category badge overlay on image. Uses `data-category` for filtering. CSS class `ai-blog-card`
- **AIBlogFilterBar**: Extends BlogFilterBar with category filter pills row. Client-side filtering includes category dimension
- **AIBlogCategoryPill**: Helper component rendering emoji + label for a category
- **AIBlogSourcesList**: Renders sources/references section with ordered list, external links, optional research notes
- **AIBlogSeriesNav**: Series navigation box with prev/next links and full series list
- **HorizontalCard**: Used for blog post lists (legacy, still available)
- **TimeLine**: CV timeline entries with card-style `bg-base-200 rounded-lg` containers
- **Footer**: Site footer with social icons (GitHub, Twitter, LinkedIn, YouTube)

### Important Notes
- Uses static site generation (SSG) — dynamic routes are incompatible with SSR
- Site URL configured as `https://www.joanmedia.dev`
- Path aliases: `@components/*` and `@layouts/*` for cleaner imports
- RSS feed auto-generated at `/rss.xml`
- Sitemap auto-generated for SEO
- **No projects or store pages** — these were removed in the redesign. Do not recreate them.
- **AI Blog categories** configured in `src/lib/aiBlogCategories.ts` — to add a new category, add it there AND to the Zod enum in `src/content/config.ts`

## Astro Best Practices

All code MUST follow these Astro-specific guidelines:

### Component Structure
- **Always define `interface Props`** in the frontmatter for type safety
- Use destructuring with defaults for optional props: `const { title, count = 0 } = Astro.props`
- Keep all imports at the top of the frontmatter, before logic
- Use `class:list` for conditional CSS classes
- Never access browser APIs (`window`, `document`) in frontmatter — it runs on the server

### Image Optimization
- **Always use Astro's `<Image />` component** (`import { Image } from "astro:assets"`) instead of raw `<img>` tags — this enables automatic WebP conversion and size optimization
- For remote images: `width` and `height` are required (or use `inferSize`)
- Remote image domains must be whitelisted in `astro.config.mjs` under `image.domains`
- Currently whitelisted: `images.unsplash.com`, `logowik.com`, `www.w3.org`
- For content collection images, prefer the `image()` schema helper for local images
- Use `format="webp"` for optimal compression
- PostLayout uses `<Image>` for hero images; BlogCard uses `<Image>` for card thumbnails

### Content Collections
- Schemas defined in `src/content/config.ts` — `blog`, `ai-blog`, and `ai-blog-sources` collections
- Use `z.coerce.date()` for date fields (handles frontmatter string dates)
- Use `.optional()` for non-required fields, `.default([])` for arrays
- Tags have a uniqueness refinement: `.refine(items => new Set(items).size === items.length)`
- Export `BlogSchema`, `AIBlogSchema`, `AIBlogSourcesSchema` types
- AI Blog posts have `category` (enum), optional `series` and `seriesOrder` fields
- AI Blog sources have `postSlug` (matches post filename) and `sources` array with `title`, `url`, optional `accessDate`

### View Transitions
- `ClientRouter` from `astro:transitions` is enabled when `TRANSITION_API` is true in config
- All client-side scripts must re-initialize on `astro:after-swap` event (theme toggle, blog filters)
- Pattern: `initFunction(); document.addEventListener('astro:after-swap', initFunction);`

### TypeScript
- Project uses `astro/tsconfigs/strict` (not just `base`)
- Path aliases: `@components/*` → `src/components/*`, `@layouts/*` → `src/layouts/*`
- All component Props must be typed via `interface Props`

### Islands Architecture
- No UI framework components (React/Vue/Svelte) are used — everything is pure Astro components
- Interactive behavior (theme toggle, blog filters) is handled via `<script>` tags in Astro components
- No `client:*` directives needed since there are no framework component islands
- This is intentional: zero JavaScript frameworks = minimal client-side JS bundle

## Accessibility Standards

All new and modified code MUST follow these accessibility practices:

### Required for Every Page
- **Skip-to-content link**: `<a href="#main-content">` in BaseLayout, visually hidden, visible on focus
- **Semantic landmarks**: `<nav>`, `<main id="main-content">`, `<footer>`, `<article>` used correctly
- **Heading hierarchy**: Never skip levels (h1 -> h2 -> h3). Each page has one `<h1>`, cards use `<h2>`
- **Language attribute**: `lang="en"` on `<html>`

### Interactive Elements
- **All buttons must have accessible names**: Use visible text or `aria-label` for icon-only buttons
- **Toggle buttons**: Use `aria-pressed` (e.g., tag filter pills)
- **Dropdowns/menus**: Use `aria-expanded`, `aria-controls`, and `role="menu"`/`role="menuitem"`
- **Active navigation**: Use `aria-current="page"` on the current page's nav link
- **Theme toggle**: Has `aria-label="Toggle theme"` on the checkbox input

### Forms
- **Every input needs a label**: Use `<label for="id">` (can be `sr-only` for visually hidden)
- **Search inputs**: Use `type="search"` and `role="search"` on the container
- **Select elements**: Always have an associated `<label>`

### Dynamic Content
- **`aria-live="polite"`**: Required on any element whose content changes dynamically (filter results count, no-results messages)
- **`role="status"`**: On status messages (e.g., "No posts found")
- **Pagination**: Wrap in `<nav aria-label="...">`, use `aria-current="page"` on active page, `aria-label` on prev/next, `disabled` attribute on disabled buttons

### Images
- **All images must have `alt` attributes**: Descriptive for content images, empty `alt=""` for decorative
- **Always use Astro `<Image />`** with `width` and `height` to prevent CLS and enable optimization
- **Use `loading="lazy"` and `decoding="async"`** on below-the-fold images

### Links
- **External links** (`target="_blank"`): Always include `rel="noopener noreferrer"`
- **Decorative symbols** (arrows like &larr; &rarr;): Wrap in `<span aria-hidden="true">`
- **SVG icons**: Add `aria-hidden="true"` when the parent link/button has an accessible name

### Color & Motion
- **Minimum text opacity**: Use `text-base-content/70` or higher — never use `/50` or `/60` for text (fails WCAG AA contrast)
- **`prefers-reduced-motion`**: Defined in `global.css` — disables all animations and transitions for users who prefer reduced motion
- **Focus styles**: `:focus-visible` with 2px solid primary outline defined globally

## Performance Best Practices

### Images
- **Use Astro `<Image />` for ALL images** — converts to WebP, resizes, and optimizes automatically
- Remote images are processed through Astro's `_image` endpoint at build time
- Measured savings: 693kB → 6kB, 235kB → 6kB, 162kB → 11kB (card thumbnails)
- Always provide `width`, `height`, `format="webp"`, `loading="lazy"`, `decoding="async"`
- Blog card images use fixed `h-48` container with `object-cover` for consistent sizing
- New remote image domains must be added to `image.domains` in `astro.config.mjs`

### CSS & Animations
- `prefers-reduced-motion` media query respects user preferences and reduces paint work
- Transitions use `duration-200` or `duration-300` — avoid long animations
- `backdrop-blur-lg` on navbar uses GPU compositing (acceptable for single sticky element)
- Blog card show/hide uses `display: none` instead of opacity-only for proper layout reflow

### JavaScript
- Blog filtering is fully client-side — all posts loaded once, no network requests on filter changes
- Search input uses 200ms debounce to avoid excessive DOM manipulation
- Theme preference persisted in localStorage, applied before first paint via inline script
- Event listeners re-initialized on `astro:after-swap` for view transitions compatibility
- Zero framework JS shipped — all interactivity is vanilla JS in `<script>` tags

### Build & Delivery
- Static site generation (SSG) — all pages pre-rendered at build time
- Blog uses `pageSize: 999` to generate a single static page (client-side pagination handles the rest)
- Astro image optimization runs at build time via Sharp — generates optimized WebP assets in `dist/_astro/`
- Sitemap and RSS auto-generated
- No unused dependencies or dead content collections
