---
name: publish-curiosity-post
description: Use when adding or publishing a ready-written post to the Curiosities section of joanmedia.dev. Explains exactly where the file goes, which frontmatter fields are required vs optional, the topic keys, hero-image rules, and how to verify it before committing. Trigger phrases include "publish a curiosities post", "add a curiosity post", "new music/food/travel post".
---

# Publish a Curiosities Post

Use this when the post text is already written and you just need to place it and format it correctly for the Curiosities section.

## 1. Where the file goes

All Curiosities posts live **flat in one folder** — routing is by the `topic` frontmatter field, NOT by subfolder:

```
src/content/curiosities/<your-file-name>.md
```

- Do **not** create per-topic subfolders. `src/content/curiosities/my-post.md` with `topic: "music"` is automatically listed under Music.
- Use a short, kebab-case, descriptive filename ending in `.md` (or `.mdx` if you need components).
- The **filename is not the URL.** Because `GENERATE_SLUG_FROM_TITLE = true` (`src/config.ts`), the public URL is `/curiosities/<slug-of-title>`. Keep the filename close to the title so the folder stays easy to scan.

## 2. Required frontmatter

Every post must have these four fields:

```yaml
---
title: "Your post title"                 # becomes the URL slug
description: "One or two sentences shown on the card and in previews."
pubDate: 2026-07-20                       # YYYY-MM-DD (unquoted)
topic: "music"                            # exactly one key from the list below
---
```

**Valid `topic` keys (pick exactly one):**
`music`, `food`, `exercise`, `travel`, `books`, `history`, `psychology`, `games`, `science`, `brainstorming`

A value outside this list fails the build.

## 3. Optional frontmatter

Add only what you need:

```yaml
heroImage: "https://images.unsplash.com/photo-XXXX?w=750&h=422&fit=crop"
tags: ["live", "vinyl"]        # must be unique; shown as pills; no tag pages in v1
series: "Japan Diaries"        # group multi-part posts
seriesOrder: 1                 # required if `series` is set; 1-based
updatedDate: "2026-08-01"      # string; shows a "Last updated" line
```

- **heroImage** — optional. If remote, the host MUST be whitelisted in `astro.config.mjs` `image.domains` (currently `images.unsplash.com`, `logowik.com`, `www.w3.org`). To use another host, add it there first. Recommended size ~750×422. Without a hero image the card renders text-only (no image band).
- **tags** — array of unique strings. Duplicate tags fail the build.
- **series / seriesOrder** — set BOTH to make a post part of a series. Prev/next series navigation only appears once **two or more** posts share the same `series` string. `seriesOrder` controls their order.
- **updatedDate** — a string, not a coerced date.

## 4. Body

Write the post in Markdown after the frontmatter. The first `#`-level structure is up to you; the layout already renders the title as the page `<h1>`, so start body headings at `##`.

## 5. Verify before committing

Run the build — it validates the frontmatter against the schema:

```bash
pnpm run build   # if pnpm isn't on PATH: node_modules/.bin/astro build
```

Then confirm the post is placed correctly:

```bash
ls dist/curiosities/<slug-of-title>/index.html          # the post page exists
ls dist/curiosities/topic/<topic>/index.html            # it appears under its topic
```

Optionally `pnpm run dev` and visit `/curiosities/topic/<topic>` to eyeball the card, and the post page in both night and lofi themes.

## 6. Common mistakes

- Wrong or misspelled `topic` (must be one of the 10 keys) → build fails.
- Remote `heroImage` from a non-whitelisted host → build fails until you add the domain to `astro.config.mjs`.
- `series` without `seriesOrder` (or only one post in the series) → no series navigation renders.
- Quoting `pubDate` is fine, but keep it `YYYY-MM-DD`.
- Duplicate entries in `tags` → build fails.
