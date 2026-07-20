# Curiosities Section — Design

**Date:** 2026-07-20
**Status:** Approved for planning
**Project:** joanmedia.dev (Astro 5 SSG portfolio)

## Goal

Add a public, standalone section to joanmedia.dev for Joan's interests outside the
QA/AI domain — a personal reference, shared openly. Topics span music, food,
exercise, travel, books, history, psychology, games, science, and brainstorming.

The section must browse cleanly as the post count grows into the hundreds. It is
fully separate from the existing AI Blog: the AI Blog and its components,
collections, and routes are **not** modified.

## Context

- Stack: Astro 5+ (SSG), TailwindCSS v3, DaisyUI v4 (`night`/`lofi` themes),
  strict TypeScript, zero UI frameworks (vanilla JS in `<script>` tags).
- The AI Blog loads all posts onto one page (`pageSize: 999`) and paginates
  client-side. That is acceptable at ~45 posts but does not scale to hundreds
  across 10 casual topics, and a flat filtered list is a poor way to browse by
  interest. Curiosities therefore uses a **topic-hub + real pagination** design.
- Existing patterns to mirror: `src/lib/aiBlogCategories.ts`,
  `src/content/config.ts`, `AIBlogCard`, `AIBlogFilterBar`, `AIBlogSeriesNav`,
  `AIPostLayout`, and the AI Blog route structure.

## Decisions (from brainstorming)

- **Audience:** fully public — part of the brand site, in the navbar and sitemap.
- **Content type:** full articles / essays (same reading experience as AI Blog).
- **Section name:** "Curiosities" (navbar label).
- **Architecture:** Approach B — topic-hub landing page → paginated category
  pages. New collection + new parallel components; no shared-engine refactor.
- **Landing page:** Option B — topic tiles + a "Latest across all topics" feed.
- **Post features:** minimal by default (title, date, hero image, prose), with
  **optional** tags and **optional** series support available when needed.

## Topics (10)

Music, Food, Exercise, Travel, Books, History, Psychology, Games, Science,
Brainstorming.

Defined in a new `src/lib/curiositiesTopics.ts` (key, label, emoji, description),
mirroring `aiBlogCategories.ts`. Adding a topic later means editing this file
**and** the Zod enum in `src/content/config.ts`.

## Architecture

### Content collection

- New collection `curiosities`, markdown/MDX in `src/content/curiosities/`.
- Schema added to `src/content/config.ts` (Zod):
  - `title: z.string()`
  - `description: z.string()`
  - `pubDate: z.coerce.date()`
  - `updatedDate: z.string().optional()`
  - `heroImage: z.string().optional()`
  - `topic: z.enum([...10 topics])`
  - `tags: z.array(z.string()).refine(unique).optional()`
  - `series: z.string().optional()`
  - `seriesOrder: z.number().optional()`
- Export `CuriositiesSchema` type.
- No sources companion collection (out of scope v1).

### Routes (all statically generated)

| Route | File | Purpose |
|---|---|---|
| `/curiosities/` | `src/pages/curiosities/index.astro` | Landing hub: 10 topic tiles with live post counts + "Latest across all topics" feed (3 most recent) |
| `/curiosities/topic/[topic]/[...page].astro` | same | Paginated category page, 6 posts/page via Astro `paginate()`, newest-first |
| `/curiosities/[slug].astro` | same | Minimal post reading view |

Each pagination page is its own static URL (`/curiosities/topic/music/2`), so
page weight stays flat regardless of total post count.

**Architecture note (resolved during planning):** This uses Astro's official
`paginate()` helper with **nested pagination by topic** — the framework-idiomatic
pattern, the same one Astro's own docs site and Starlight use. Category pages are
**browse-only** (no client-side search box, no live sort toggle) because true
static pagination and full-collection client search pull against each other in
SSG. The topic hub plus real pagination is the intended way to find content.
Full-text search, when the library grows enough to need it, is a clean future
add via **Pagefind** (the framework-blessed static-search tool Starlight ships) —
see Out of scope.

### Components (new, `Curiosity*`-prefixed; parallel to AI Blog, no shared code)

- `CuriosityCard.astro` — card with Astro `<Image />` hero, topic badge, title,
  date, optional tag pills.
- `CuriosityTopicTile.astro` — landing-page tile: emoji, label, post count.
- `CuriosityPagination.astro` — static prev/next + numbered page links for the
  category route, driven by Astro's `page` object. Pure server-rendered links, no
  client JS.
- `CuriositySeriesNav.astro` — lightweight prev/next series navigation, rendered
  only when a post declares a `series`.
- `CuriosityPostLayout.astro` (in `src/layouts/`) — minimal reading layout:
  title, date, hero image, prose, back-link; conditionally renders tag pills and
  `CuriositySeriesNav`.

### Navigation & config integration

- Navbar (`src/components/Navbar.astro`): add "Curiosities" as the 5th link —
  desktop center links + mobile dropdown, with `aria-current="page"` handling.
- Footer (`src/components/Footer.astro`): add "Curiosities" to nav links.
- `astro.config.mjs`: whitelist any new remote image domains only if hero images
  use them (local content-collection images preferred).

## Behavior

- **Landing:** tiles show per-topic counts computed at build time; "Latest" feed
  shows the 3 most recent posts across all topics with topic badges.
- **Category page:** shows that topic's posts newest-first, 6 per static page,
  with server-rendered pagination. Browse-only (no search/sort in v1).
- **Post:** minimal render; tags and series nav appear only when present in
  frontmatter.

## Standards (carried from CLAUDE.md)

- Astro `<Image />` for all images (`width`/`height`, `format="webp"`, lazy).
- `interface Props` on every component; destructure with defaults.
- Accessibility: global skip-link already covers new pages; semantic landmarks;
  one `<h1>` per page; pagination wrapped in `<nav aria-label>` with
  `aria-current="page"` on the active page and `aria-disabled` on unavailable
  prev/next; WCAG-safe text contrast (`text-base-content/70`+).
- Zero JS frameworks; vanilla `<script>` re-initialized on `astro:after-swap`.
- Both `night` (dark, default) and `lofi` (light) themes supported.

## Out of scope (v1)

- Full-text search — add later via **Pagefind** (Astro/Starlight's static-search
  tool); it indexes at build time and needs no change to the collection or routes.
- Live newest/oldest sort toggle on category pages (posts ship newest-first).
- Sources / references list (the AI Blog `sources` companion collection).
- RSS feed for Curiosities.
- Home-page integration (a "Latest Curiosities" block on `/`).
- Comments / reactions.

These can be added in later iterations; the schema and routes leave room for them.

## Testing / verification

- `pnpm run build` succeeds with the new collection and routes.
- Landing page renders 10 tiles with correct counts and a Latest feed.
- Category pages paginate correctly (spot-check a topic with >6 posts).
- A minimal post, a tagged post, and a series post each render correctly.
- Navbar/footer show Curiosities with correct active state.
- AI Blog pages are unchanged and still build.
