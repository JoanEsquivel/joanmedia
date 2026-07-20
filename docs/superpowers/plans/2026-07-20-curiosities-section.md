# Curiosities Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public "Curiosities" section to joanmedia.dev — a topic-hub landing page plus statically-paginated per-topic category pages and minimal post pages — for Joan's interests outside the QA/AI domain.

**Architecture:** New Astro content collection (`curiosities`) with a topics config module, consumed by three route groups (landing hub, paginated topic pages via Astro's `paginate()`, and a minimal post view). New `Curiosity*`-prefixed components parallel the AI Blog components; the AI Blog is not modified. All pages are statically generated; no client-side JS is added for browsing.

**Tech Stack:** Astro 5 (SSG), TailwindCSS v3, DaisyUI v4, TypeScript (strict), `astro:content`, `astro:assets` `<Image />`, `dayjs`.

## Global Constraints

Every task's requirements implicitly include this section.

- **Do not modify the AI Blog** — its collections (`ai-blog`, `ai-blog-sources`), components (`AIBlog*`), layouts (`AIPostLayout`), or routes (`src/pages/ai-blog/**`). Curiosities is fully parallel.
- **Zero JS frameworks.** No React/Vue/Svelte, no `client:*` directives. Browsing is pure server-rendered HTML — no client-side filtering/pagination JS in v1.
- **Astro `<Image />`** (`import { Image } from "astro:assets"`) for all images, with `width`, `height`, `format="webp"`, and `loading="lazy"`/`decoding="async"` on card thumbnails. Remote hero images must use an already-whitelisted domain (`images.unsplash.com`).
- **`interface Props`** in the frontmatter of every component; destructure with defaults.
- **Path aliases:** `@components/*` → `src/components/*`, `@layouts/*` → `src/layouts/*` (use them where existing sibling files do).
- **Accessibility:** one `<h1>` per page; cards use `<h2>`; breadcrumbs and pagination wrapped in `<nav aria-label>`; active page marked `aria-current="page"`; disabled prev/next marked `aria-disabled="true"`; decorative emoji/arrows wrapped in `<span aria-hidden="true">`; text contrast `text-base-content/70` or higher.
- **Themes:** works under both `night` (dark, default) and `lofi` (light) — use DaisyUI semantic classes (`bg-base-200`, `text-base-content`, `badge-primary`, etc.), never hard-coded colors.
- **Package manager:** `pnpm`.
- **Slugs:** post URLs are `"/curiosities/" + createSlug(entry.data.title, entry.slug)` using the existing `src/lib/createSlug.ts`.
- **10 topic keys (exact):** `music`, `food`, `exercise`, `travel`, `books`, `history`, `psychology`, `games`, `science`, `brainstorming`.

---

### Task 1: Topics config, content collection, and seed content

Establishes the data layer: the topics module, the Zod schema, and seed posts so later route tasks have real content to render and paginate.

**Files:**
- Create: `src/lib/curiositiesTopics.ts`
- Modify: `src/content/config.ts`
- Create: `src/content/curiosities/*.md` (seed posts, listed below)

**Interfaces:**
- Consumes: nothing (first task).
- Produces:
  - `CURIOSITIES_TOPICS` — a `const` object keyed by the 10 topic keys; each value `{ label: string; icon: string; description: string }`.
  - `type CuriositiesTopic = keyof typeof CURIOSITIES_TOPICS`.
  - Collection `"curiosities"` with `type CuriositiesSchema` exported from `src/content/config.ts`. Fields: `title: string`, `description: string`, `pubDate: Date` (coerced), `updatedDate?: string`, `heroImage?: string`, `topic: CuriositiesTopic` (enum), `tags?: string[]` (unique), `series?: string`, `seriesOrder?: number`.

- [ ] **Step 1: Create the topics module**

Create `src/lib/curiositiesTopics.ts`:

```ts
export const CURIOSITIES_TOPICS = {
  music: { label: "Music", icon: "🎵", description: "Albums, live shows, and playlists worth remembering." },
  food: { label: "Food", icon: "🍳", description: "Recipes, restaurants, and cooking experiments." },
  exercise: { label: "Exercise", icon: "🏋️", description: "Training, running, and staying healthy." },
  travel: { label: "Travel", icon: "✈️", description: "Places I've been and places I want to go." },
  books: { label: "Books", icon: "📚", description: "What I'm reading and what stuck with me." },
  history: { label: "History", icon: "🏛️", description: "Moments and stories from the past." },
  psychology: { label: "Psychology", icon: "🧠", description: "How the mind works." },
  games: { label: "Games", icon: "🎮", description: "Video games and board games I enjoy." },
  science: { label: "Science", icon: "🔬", description: "Curiosities from the natural world." },
  brainstorming: { label: "Brainstorming", icon: "💡", description: "Half-formed ideas and thinking out loud." },
} as const;

export type CuriositiesTopic = keyof typeof CURIOSITIES_TOPICS;
```

- [ ] **Step 2: Add the collection to the content config**

Modify `src/content/config.ts`. Keep the existing `ai-blog` and `ai-blog-sources` definitions untouched. Add the schema/collection and register it in the `collections` export:

```ts
// --- add below the existing aiBlogSourcesSchema block ---
const curiositiesSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    topic: z.enum([
        "music", "food", "exercise", "travel", "books",
        "history", "psychology", "games", "science", "brainstorming",
    ]),
    tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
        message: 'tags must be unique',
    }).optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
});

export type CuriositiesSchema = z.infer<typeof curiositiesSchema>;

const curiositiesCollection = defineCollection({ schema: curiositiesSchema });
```

Then update the `collections` export to include the new collection:

```ts
export const collections = {
    'ai-blog': aiBlogCollection,
    'ai-blog-sources': aiBlogSourcesCollection,
    'curiosities': curiositiesCollection,
}
```

- [ ] **Step 3: Create seed content**

These posts exercise every path: >6 posts in one topic (pagination), a 2-part series, tags, a hero image, and topics left empty. Run this block from the repo root:

```bash
mkdir -p src/content/curiosities
# --- Music: 7 posts to force pagination (6 per page -> page 1 + page 2) ---
cat > src/content/curiosities/music-focus-playlist.md <<'MD'
---
title: "Building the perfect focus playlist"
description: "How I assemble instrumental sets that keep me in flow for hours."
pubDate: 2026-07-12
topic: "music"
tags: ["playlist", "focus"]
heroImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=750&h=422&fit=crop"
---
A good focus playlist is less about genre and more about predictability. Here is how I build mine.
MD
cat > src/content/curiosities/music-small-venues.md <<'MD'
---
title: "Why small venues beat stadiums"
description: "The case for seeing live music in a room that fits a hundred people."
pubDate: 2026-07-03
topic: "music"
tags: ["live"]
---
There is a kind of intimacy in a small room that no stadium production can replicate.
MD
cat > src/content/curiosities/music-vinyl-return.md <<'MD'
---
title: "Coming back to vinyl"
description: "What a turntable taught me about listening to a whole album."
pubDate: 2026-06-24
topic: "music"
tags: ["vinyl"]
---
Vinyl forces you to sit with an album from start to finish. That constraint is the point.
MD
cat > src/content/curiosities/music-month-classical.md <<'MD'
---
title: "A month of only classical"
description: "What changed after I listened to nothing but classical for thirty days."
pubDate: 2026-06-02
topic: "music"
---
Thirty days of classical rewired how I hear rhythm in everything else.
MD
cat > src/content/curiosities/music-old-favorite.md <<'MD'
---
title: "Rediscovering an old favorite band"
description: "Returning to an album I hadn't played in a decade."
pubDate: 2026-05-18
topic: "music"
---
Some records age with you. This one waited patiently for a decade.
MD
cat > src/content/curiosities/music-concert-notes.md <<'MD'
---
title: "Concert notes: the setlist surprise"
description: "When a band throws out the plan and plays what they feel like."
pubDate: 2026-05-04
topic: "music"
---
The best moment of the night was not on any setlist.
MD
cat > src/content/curiosities/music-headphones.md <<'MD'
---
title: "The headphones I finally settled on"
description: "After years of chasing gear, what actually matters."
pubDate: 2026-04-20
topic: "music"
---
Comfort beats specs. That is the whole review.
MD
# --- Travel: a 2-part series ---
cat > src/content/curiosities/travel-japan-1.md <<'MD'
---
title: "Japan diaries, part 1: arriving in Tokyo"
description: "First impressions, jet lag, and the best convenience-store dinner of my life."
pubDate: 2026-06-15
topic: "travel"
series: "Japan Diaries"
seriesOrder: 1
heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=750&h=422&fit=crop"
---
Tokyo at midnight, straight off the plane, is a city that refuses to feel tired.
MD
cat > src/content/curiosities/travel-japan-2.md <<'MD'
---
title: "Japan diaries, part 2: trains and temples"
description: "Riding the Shinkansen to Kyoto and getting lost on purpose."
pubDate: 2026-06-18
topic: "travel"
series: "Japan Diaries"
seriesOrder: 2
---
The train was so smooth I only knew we were moving by the scenery.
MD
# --- Food: one tagged post ---
cat > src/content/curiosities/food-weeknight-ramen.md <<'MD'
---
title: "Weeknight ramen without the 12-hour broth"
description: "A shortcut bowl that is 80% as good in 30 minutes."
pubDate: 2026-07-08
topic: "food"
tags: ["recipe", "quick"]
---
You do not need to simmer bones overnight to get a satisfying bowl on a Tuesday.
MD
# --- Books: one post ---
cat > src/content/curiosities/books-thinking-fast-slow.md <<'MD'
---
title: "Notes on Thinking, Fast and Slow"
description: "The ideas that stuck with me months after finishing it."
pubDate: 2026-06-28
topic: "books"
---
Most of the book is a catalog of the ways my own intuition misleads me.
MD
```

- [ ] **Step 4: Confirm the collection is empty of build output first**

Run: `test ! -d dist/curiosities && echo "OK: no curiosities output yet"`
Expected: `OK: no curiosities output yet` (no routes consume the collection yet, so nothing is generated — this baseline confirms Task 1 adds data only).

- [ ] **Step 5: Sync types and build to validate the schema**

Run: `pnpm run build`
Expected: build SUCCEEDS. The `curiosities` collection is validated against the Zod schema (bad frontmatter would fail here). AI Blog output is unchanged. `src/content/curiosities/` contains 11 markdown files.

- [ ] **Step 6: Commit**

```bash
git add src/lib/curiositiesTopics.ts src/content/config.ts src/content/curiosities/
git commit -m "feat(curiosities): add topics config, collection schema, and seed content"
```

---

### Task 2: Minimal post view (layout + series nav + slug route)

Delivers readable individual posts. Independently testable: after this task, every seed post is reachable at its URL and renders title/date/prose, with tags and series nav appearing only when present.

**Files:**
- Create: `src/components/CuriositySeriesNav.astro`
- Create: `src/layouts/CuriosityPostLayout.astro`
- Create: `src/pages/curiosities/[slug].astro`

**Interfaces:**
- Consumes: `CURIOSITIES_TOPICS`, `CuriositiesTopic`, `CuriositiesSchema`, collection `"curiosities"`, `createSlug`.
- Produces:
  - `CuriositySeriesNav` props: `{ seriesName: string; currentOrder: number; posts: { title: string; url: string; order: number }[] }`.
  - `CuriosityPostLayout` props: `{ title: string; description: string; pubDate: Date; updatedDate?: string; heroImage?: string; topic: CuriositiesTopic; tags?: string[]; seriesName?: string; seriesOrder?: number; seriesPosts?: { title: string; url: string; order: number }[] }` + a default `<slot />`.
  - Static routes `/curiosities/<post-slug>` for every collection entry.

- [ ] **Step 1: Create the series-nav component**

Create `src/components/CuriositySeriesNav.astro` (mirrors `AIBlogSeriesNav` behavior):

```astro
---
interface SeriesPost {
  title: string;
  url: string;
  order: number;
}

interface Props {
  seriesName: string;
  currentOrder: number;
  posts: SeriesPost[];
}

const { seriesName, currentOrder, posts } = Astro.props;

const sorted = [...posts].sort((a, b) => a.order - b.order);
const currentIndex = sorted.findIndex((p) => p.order === currentOrder);
const prevPost = currentIndex > 0 ? sorted[currentIndex - 1] : null;
const nextPost = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
---

<nav aria-label={`Series: ${seriesName}`} class="bg-base-200 rounded-xl p-4 border border-base-300 mt-8">
  <p class="font-bold mb-3">
    Series: {seriesName}
    <span class="text-base-content/70 font-normal">({currentOrder} of {sorted.length})</span>
  </p>
  <ol class="list-decimal list-inside space-y-1 mb-4">
    {sorted.map((post) => (
      <li class:list={[post.order === currentOrder && "font-bold text-primary"]}>
        {post.order === currentOrder ? (
          <span>{post.title}</span>
        ) : (
          <a href={post.url} class="hover:text-primary transition-colors duration-200">{post.title}</a>
        )}
      </li>
    ))}
  </ol>
  <div class="flex justify-between gap-4">
    {prevPost ? (
      <a href={prevPost.url} class="btn btn-ghost btn-sm" aria-label={`Previous in series: ${prevPost.title}`}>
        <span aria-hidden="true">&larr;</span> Previous
      </a>
    ) : <span></span>}
    {nextPost ? (
      <a href={nextPost.url} class="btn btn-ghost btn-sm" aria-label={`Next in series: ${nextPost.title}`}>
        Next <span aria-hidden="true">&rarr;</span>
      </a>
    ) : <span></span>}
  </div>
</nav>
```

- [ ] **Step 2: Create the minimal post layout**

Create `src/layouts/CuriosityPostLayout.astro`:

```astro
---
import BaseLayout from "./BaseLayout.astro";
import CuriositySeriesNav from "../components/CuriositySeriesNav.astro";
import { Image } from "astro:assets";
import { CURIOSITIES_TOPICS, type CuriositiesTopic } from "../lib/curiositiesTopics";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

interface SeriesPost {
  title: string;
  url: string;
  order: number;
}

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: string;
  heroImage?: string;
  topic: CuriositiesTopic;
  tags?: string[];
  seriesName?: string;
  seriesOrder?: number;
  seriesPosts?: SeriesPost[];
}

const {
  title,
  description,
  pubDate,
  updatedDate,
  heroImage,
  topic,
  tags = [],
  seriesName,
  seriesOrder,
  seriesPosts,
} = Astro.props;

dayjs.extend(localizedFormat);
const displayDate = dayjs(pubDate).format("ll");
const t = CURIOSITIES_TOPICS[topic];
---

<BaseLayout title={title} description={description} image={heroImage} ogType="article" activeItemID="curiosities">
  <div class="max-w-3xl mx-auto">
    <nav aria-label="Breadcrumb" class="text-sm breadcrumbs mb-4">
      <ul>
        <li><a href="/curiosities/">Curiosities</a></li>
        <li><a href={`/curiosities/topic/${topic}`}>{t.label}</a></li>
        <li><span class="text-base-content/70">{title}</span></li>
      </ul>
    </nav>

    <a href="/curiosities/" class="btn btn-ghost btn-sm mb-6"><span aria-hidden="true">&larr;</span> Back to Curiosities</a>

    <article class="prose prose-lg max-w-none prose-img:mx-auto prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      {heroImage && <Image width={750} height={422} format="webp" src={heroImage} alt={title} class="w-full mb-6 rounded-lg" />}
      <div class="flex items-center gap-2 mb-2 not-prose">
        <span class="badge badge-primary gap-1"><span aria-hidden="true">{t.icon}</span> {t.label}</span>
      </div>
      <h1 class="title my-2 text-4xl font-bold">{title}</h1>
      {pubDate && <time datetime={pubDate.toISOString()} class="text-base-content/70">{displayDate}</time>}
      {tags.length > 0 && (
        <div class="not-prose mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => <span class="badge badge-outline">{tag}</span>)}
        </div>
      )}
      {updatedDate && (
        <div>Last updated on <time>{updatedDate}</time></div>
      )}
      <div class="divider my-2"></div>
      <slot />
    </article>

    {seriesName && seriesOrder && seriesPosts && seriesPosts.length > 1 && (
      <CuriositySeriesNav seriesName={seriesName} currentOrder={seriesOrder} posts={seriesPosts} />
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 3: Create the post route**

Create `src/pages/curiosities/[slug].astro`:

```astro
---
import { type CollectionEntry, getCollection } from "astro:content";
import { type CuriositiesSchema } from "../../content/config";
import CuriosityPostLayout from "../../layouts/CuriosityPostLayout.astro";
import createSlug from "../../lib/createSlug";

export async function getStaticPaths() {
  const postEntries = await getCollection("curiosities");
  return postEntries.map((entry) => ({
    params: { slug: createSlug(entry.data.title, entry.slug) },
    props: { entry },
  }));
}

interface Props {
  entry: CollectionEntry<"curiosities">;
}

const { entry } = Astro.props;
const post: CuriositiesSchema = entry.data;
const { Content } = await entry.render();

let seriesPosts: Array<{ title: string; url: string; order: number }> = [];
if (post.series) {
  const allPosts = await getCollection("curiosities");
  seriesPosts = allPosts
    .filter((p) => p.data.series === post.series)
    .map((p) => ({
      title: p.data.title,
      url: "/curiosities/" + createSlug(p.data.title, p.slug),
      order: p.data.seriesOrder || 0,
    }))
    .sort((a, b) => a.order - b.order);
}
---

<CuriosityPostLayout
  title={post.title}
  description={post.description}
  pubDate={post.pubDate}
  heroImage={post.heroImage}
  updatedDate={post.updatedDate}
  topic={post.topic}
  tags={post.tags}
  seriesName={post.series}
  seriesOrder={post.seriesOrder}
  seriesPosts={seriesPosts.length > 1 ? seriesPosts : undefined}
>
  <Content />
</CuriosityPostLayout>
```

- [ ] **Step 4: Build and assert post pages generate**

Run: `pnpm run build && ls dist/curiosities/weeknight-ramen-without-the-12-hour-broth/index.html && ls dist/curiosities/japan-diaries-part-1-arriving-in-tokyo/index.html`
Expected: build SUCCEEDS and both files exist (slugs are the title, lowercased/hyphenated by `createSlug`).

- [ ] **Step 5: Assert conditional rendering (series nav + tags)**

Run:
```bash
grep -q "Series: Japan Diaries" dist/curiosities/japan-diaries-part-1-arriving-in-tokyo/index.html && echo "series-nav OK"
grep -q "Next in series" dist/curiosities/japan-diaries-part-1-arriving-in-tokyo/index.html && echo "series-next OK"
grep -q "badge badge-outline" dist/curiosities/weeknight-ramen-without-the-12-hour-broth/index.html && echo "tags OK"
grep -q "Series:" dist/curiosities/notes-on-thinking-fast-and-slow/index.html || echo "no-series OK"
```
Expected: `series-nav OK`, `series-next OK`, `tags OK`, and `no-series OK` (the non-series, un-tagged post shows neither a series block).

- [ ] **Step 6: Commit**

```bash
git add src/components/CuriositySeriesNav.astro src/layouts/CuriosityPostLayout.astro src/pages/curiosities/\[slug\].astro
git commit -m "feat(curiosities): add minimal post view with optional tags and series nav"
```

---

### Task 3: Paginated category pages (card + pagination + topic route)

Delivers the per-topic browse experience with real static pagination. Independently testable: `/curiosities/topic/music` shows 6 cards and `/curiosities/topic/music/2` shows the 7th; every topic (including empty ones) resolves to a page.

**Files:**
- Create: `src/components/CuriosityCard.astro`
- Create: `src/components/CuriosityPagination.astro`
- Create: `src/pages/curiosities/topic/[topic]/[...page].astro`

**Interfaces:**
- Consumes: `CURIOSITIES_TOPICS`, `CuriositiesTopic`, collection `"curiosities"`, `createSlug`, Astro `paginate` / `page` object (`page.data`, `page.currentPage`, `page.lastPage`, `page.url.prev`, `page.url.next`).
- Produces:
  - `CuriosityCard` props: `{ title: string; img?: string; desc: string; url: string; tags?: string[]; pubDate?: string; topic: CuriositiesTopic }`.
  - `CuriosityPagination` props: `{ currentPage: number; lastPage: number; prevUrl?: string; nextUrl?: string; basePath: string }`.
  - Static routes `/curiosities/topic/<topic>` and `/curiosities/topic/<topic>/<n>` for all 10 topics.

- [ ] **Step 1: Create the card component**

Create `src/components/CuriosityCard.astro`:

```astro
---
import { Image } from "astro:assets";
import { CURIOSITIES_TOPICS, type CuriositiesTopic } from "../lib/curiositiesTopics";

interface Props {
  title: string;
  img?: string;
  desc: string;
  url: string;
  tags?: string[];
  pubDate?: string;
  topic: CuriositiesTopic;
}

const { title, img, desc, url, tags = [], pubDate, topic } = Astro.props;

const formattedDate = pubDate
  ? new Date(pubDate).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
  : "";
const t = CURIOSITIES_TOPICS[topic];
---

<article class="card bg-base-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
  <a href={url} class="block focus-visible:outline-offset-4">
    {img && (
      <figure class="h-48 overflow-hidden relative">
        <Image
          src={img}
          alt=""
          loading="lazy"
          decoding="async"
          width={400}
          height={192}
          format="webp"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span class="badge badge-primary absolute top-2 right-2 gap-1">
          <span aria-hidden="true">{t.icon}</span> {t.label}
        </span>
      </figure>
    )}
    <div class="card-body p-4">
      {formattedDate && (
        <time datetime={pubDate} class="text-xs text-base-content/70">{formattedDate}</time>
      )}
      <h2 class="card-title text-lg">{title}</h2>
      <p class="text-sm text-base-content/70 line-clamp-2">{desc}</p>
      {tags.length > 0 && (
        <div class="card-actions mt-2">
          {tags.map((tag: string) => (
            <span class="badge badge-outline badge-sm">{tag}</span>
          ))}
        </div>
      )}
    </div>
  </a>
</article>
```

- [ ] **Step 2: Create the pagination component**

Create `src/components/CuriosityPagination.astro`:

```astro
---
interface Props {
  currentPage: number;
  lastPage: number;
  prevUrl?: string;
  nextUrl?: string;
  basePath: string;
}

const { currentPage, lastPage, prevUrl, nextUrl, basePath } = Astro.props;

const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
const pageHref = (n: number) => (n === 1 ? basePath : `${basePath}/${n}`);
---

{lastPage > 1 && (
  <nav class="flex items-center justify-center gap-2 mt-10 mb-8" aria-label="Curiosities pagination">
    {prevUrl ? (
      <a href={prevUrl} class="btn btn-sm" aria-label="Previous page"><span aria-hidden="true">&lsaquo;</span></a>
    ) : (
      <span class="btn btn-sm btn-disabled" aria-disabled="true" aria-label="Previous page"><span aria-hidden="true">&lsaquo;</span></span>
    )}
    {pages.map((n) => (
      n === currentPage ? (
        <span class="btn btn-sm btn-primary" aria-current="page" aria-label={`Page ${n}`}>{n}</span>
      ) : (
        <a href={pageHref(n)} class="btn btn-sm" aria-label={`Page ${n}`}>{n}</a>
      )
    ))}
    {nextUrl ? (
      <a href={nextUrl} class="btn btn-sm" aria-label="Next page"><span aria-hidden="true">&rsaquo;</span></a>
    ) : (
      <span class="btn btn-sm btn-disabled" aria-disabled="true" aria-label="Next page"><span aria-hidden="true">&rsaquo;</span></span>
    )}
  </nav>
)}
```

- [ ] **Step 3: Create the paginated topic route**

Create `src/pages/curiosities/topic/[topic]/[...page].astro`:

```astro
---
import BaseLayout from "@layouts/BaseLayout.astro";
import CuriosityCard from "@components/CuriosityCard.astro";
import CuriosityPagination from "@components/CuriosityPagination.astro";
import { getCollection } from "astro:content";
import createSlug from "../../../../lib/createSlug";
import { CURIOSITIES_TOPICS } from "../../../../lib/curiositiesTopics";
import type { GetStaticPathsOptions } from "astro";

export async function getStaticPaths({ paginate }: GetStaticPathsOptions) {
  const allPosts = await getCollection("curiosities");
  const topics = Object.keys(CURIOSITIES_TOPICS);

  return topics.flatMap((topic) => {
    const filtered = allPosts
      .filter((post) => post.data.topic === topic)
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    // Guarantee every topic resolves to a page 1, even with zero posts yet
    // (topic tiles always link here). Don't rely on paginate([]) emitting a page.
    if (filtered.length === 0) {
      return [{
        params: { topic, page: undefined },
        props: {
          page: {
            data: [],
            currentPage: 1,
            lastPage: 1,
            url: { current: `/curiosities/topic/${topic}`, prev: undefined, next: undefined },
            start: 0,
            end: 0,
            size: 6,
            total: 0,
          },
        },
      }];
    }

    return paginate(filtered, {
      params: { topic },
      pageSize: 6,
    });
  });
}

const { page } = Astro.props;
const params = Astro.params;
const posts = page.data;
const topic = params.topic as keyof typeof CURIOSITIES_TOPICS;
const t = CURIOSITIES_TOPICS[topic];
const basePath = `/curiosities/topic/${topic}`;
---

<BaseLayout title={"Curiosities - " + t.label} activeItemID="curiosities">
  <nav aria-label="Breadcrumb" class="text-sm breadcrumbs mb-4">
    <ul>
      <li><a href="/curiosities/">Curiosities</a></li>
      <li><span class="text-base-content/70">{t.label}</span></li>
    </ul>
  </nav>

  <div class="mb-8">
    <h1 class="text-4xl font-bold tracking-tight flex items-center gap-3">
      <span aria-hidden="true">{t.icon}</span> {t.label}
    </h1>
    <p class="text-base-content/70 mt-2">{t.description}</p>
  </div>

  {posts.length === 0 ? (
    <div class="bg-base-200 border-l-4 border-secondary w-full p-4">
      <p class="font-bold">Nothing here yet</p>
      <p>No posts in {t.label} yet. Check back later!</p>
    </div>
  ) : (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post: any) => (
        <CuriosityCard
          title={post.data.title}
          img={post.data.heroImage}
          desc={post.data.description}
          url={"/curiosities/" + createSlug(post.data.title, post.slug)}
          tags={post.data.tags}
          pubDate={post.data.pubDate.toISOString()}
          topic={post.data.topic}
        />
      ))}
    </div>
  )}

  <CuriosityPagination
    currentPage={page.currentPage}
    lastPage={page.lastPage}
    prevUrl={page.url.prev}
    nextUrl={page.url.next}
    basePath={basePath}
  />
</BaseLayout>
```

- [ ] **Step 4: Build and assert pagination + empty-topic pages**

Run:
```bash
pnpm run build
ls dist/curiosities/topic/music/index.html && echo "music p1 OK"
ls dist/curiosities/topic/music/2/index.html && echo "music p2 OK"
ls dist/curiosities/topic/history/index.html && echo "empty-topic OK"
```
Expected: build SUCCEEDS; `music p1 OK`, `music p2 OK` (7 music posts → 2 pages), `empty-topic OK` (a topic with 0 posts still generates a page via the explicit empty-page branch in Step 3).

- [ ] **Step 5: Assert card count on page 1 and 2**

Run:
```bash
test "$(grep -c 'card-title' dist/curiosities/topic/music/index.html)" = "6" && echo "6-on-p1 OK"
test "$(grep -c 'card-title' dist/curiosities/topic/music/2/index.html)" = "1" && echo "1-on-p2 OK"
grep -q 'aria-label="Curiosities pagination"' dist/curiosities/topic/music/index.html && echo "pager OK"
```
Expected: `6-on-p1 OK`, `1-on-p2 OK`, `pager OK`.

- [ ] **Step 6: Commit**

```bash
git add src/components/CuriosityCard.astro src/components/CuriosityPagination.astro "src/pages/curiosities/topic/[topic]/[...page].astro"
git commit -m "feat(curiosities): add paginated topic pages with cards"
```

---

### Task 4: Landing hub (topic tiles + latest feed)

Delivers the entry point. Independently testable: `/curiosities/` renders 10 tiles with correct counts and a "Latest" feed of the 3 newest posts.

**Files:**
- Create: `src/components/CuriosityTopicTile.astro`
- Create: `src/pages/curiosities/index.astro`

**Interfaces:**
- Consumes: `CURIOSITIES_TOPICS`, collection `"curiosities"`, `createSlug`, `CuriosityCard` (Task 3).
- Produces:
  - `CuriosityTopicTile` props: `{ topicKey: string; label: string; icon: string; count: number }`.
  - Static route `/curiosities/`.

- [ ] **Step 1: Create the topic tile component**

Create `src/components/CuriosityTopicTile.astro`:

```astro
---
interface Props {
  topicKey: string;
  label: string;
  icon: string;
  count: number;
}

const { topicKey, label, icon, count } = Astro.props;
---

<a
  href={`/curiosities/topic/${topicKey}`}
  class="card bg-base-200 hover:bg-base-300 hover:-translate-y-1 transition-all duration-200 shadow-sm items-center text-center p-4 focus-visible:outline-offset-4"
>
  <span class="text-3xl" aria-hidden="true">{icon}</span>
  <span class="font-semibold text-sm mt-2">{label}</span>
  <span class="text-xs text-base-content/70 mt-1">{count} {count === 1 ? "post" : "posts"}</span>
</a>
```

- [ ] **Step 2: Create the landing page**

Create `src/pages/curiosities/index.astro`:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import CuriosityCard from "../../components/CuriosityCard.astro";
import CuriosityTopicTile from "../../components/CuriosityTopicTile.astro";
import { getCollection } from "astro:content";
import createSlug from "../../lib/createSlug";
import { CURIOSITIES_TOPICS } from "../../lib/curiositiesTopics";

const allPosts = await getCollection("curiosities");
const sorted = [...allPosts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
const latest = sorted.slice(0, 3);

const counts = new Map<string, number>();
for (const post of allPosts) {
  counts.set(post.data.topic, (counts.get(post.data.topic) || 0) + 1);
}

const topics = Object.entries(CURIOSITIES_TOPICS).map(([key, t]) => ({
  key,
  label: t.label,
  icon: t.icon,
  count: counts.get(key) || 0,
}));
---

<BaseLayout title="Curiosities" activeItemID="curiosities">
  <div class="mb-8">
    <h1 class="text-4xl font-bold tracking-tight">Curiosities</h1>
    <p class="text-base-content/70 mt-2 max-w-2xl">
      Things I'm into outside of QA — music, food, training, books, and the odd rabbit hole.
      Notes to my future self, shared openly.
    </p>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
    {topics.map((t) => (
      <CuriosityTopicTile topicKey={t.key} label={t.label} icon={t.icon} count={t.count} />
    ))}
  </div>

  {latest.length > 0 && (
    <section>
      <h2 class="text-sm uppercase tracking-wide text-base-content/70 mb-4">Latest across all topics</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {latest.map((post) => (
          <CuriosityCard
            title={post.data.title}
            img={post.data.heroImage}
            desc={post.data.description}
            url={"/curiosities/" + createSlug(post.data.title, post.slug)}
            tags={post.data.tags}
            pubDate={post.data.pubDate.toISOString()}
            topic={post.data.topic}
          />
        ))}
      </div>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 3: Build and assert the landing page**

Run:
```bash
pnpm run build
ls dist/curiosities/index.html && echo "landing OK"
test "$(grep -c 'card bg-base-200 hover:bg-base-300' dist/curiosities/index.html)" = "10" && echo "10-tiles OK"
grep -q "Latest across all topics" dist/curiosities/index.html && echo "latest-feed OK"
```
Expected: build SUCCEEDS; `landing OK`, `10-tiles OK` (all 10 topic tiles render), `latest-feed OK`.

- [ ] **Step 4: Assert counts are correct**

Run: `grep -o '7 posts\|1 post\b' dist/curiosities/index.html | head`
Expected: output includes `7 posts` (music) and at least one `1 post` (food/books/travel have 1–2). This confirms per-topic counts are computed, not hard-coded.

- [ ] **Step 5: Commit**

```bash
git add src/components/CuriosityTopicTile.astro src/pages/curiosities/index.astro
git commit -m "feat(curiosities): add landing hub with topic tiles and latest feed"
```

---

### Task 5: Navigation integration (navbar + footer)

Wires Curiosities into site navigation. Independently testable: the navbar and footer link to `/curiosities/`, and Curiosities pages show the active nav state.

**Files:**
- Modify: `src/components/Navbar.astro:8-13`
- Modify: `src/components/Footer.astro:19-24`

**Interfaces:**
- Consumes: the existing `navLinks` array pattern and `activeItemID="curiosities"` already passed by Tasks 2–4.
- Produces: nothing consumed by later tasks (final task).

- [ ] **Step 1: Add Curiosities to the navbar links**

In `src/components/Navbar.astro`, add the entry to `navLinks` (between `ai-blog` and `cv`) so the `id` matches the `activeItemID="curiosities"` the Curiosities pages already pass:

```ts
const navLinks = [
  { id: "home", label: "Home", href: "/" },
  { id: "conferences", label: "Conferences", href: "/conferences" },
  { id: "ai-blog", label: "AI Blog", href: "/ai-blog/" },
  { id: "curiosities", label: "Curiosities", href: "/curiosities/" },
  { id: "cv", label: "CV", href: "/cv" },
];
```

- [ ] **Step 2: Add Curiosities to the footer nav list**

In `src/components/Footer.astro`, add the list item after the AI Blog line (inside the "Pages" `<ul>`):

```html
<li><a href="/curiosities/" class="hover:text-primary transition-colors duration-200">Curiosities</a></li>
```

- [ ] **Step 3: Build and assert nav wiring + active state**

Run:
```bash
pnpm run build
grep -q 'href="/curiosities/"' dist/index.html && echo "navbar-link OK"
grep -q 'aria-current="page"' dist/curiosities/index.html && echo "active-state OK"
grep -c 'href="/curiosities/"' dist/curiosities/index.html
```
Expected: `navbar-link OK` (home page navbar links to Curiosities); `active-state OK` (landing page marks the Curiosities nav item current); the final count is ≥1.

- [ ] **Step 4: Full regression build — AI Blog untouched**

Run:
```bash
pnpm run build
ls dist/ai-blog/index.html && echo "ai-blog intact OK"
git status --porcelain src/pages/ai-blog src/components/AIBlog*.astro src/layouts/AIPostLayout.astro
```
Expected: build SUCCEEDS; `ai-blog intact OK`; the `git status` prints nothing (no AI Blog files were modified anywhere in this plan).

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.astro src/components/Footer.astro
git commit -m "feat(curiosities): add Curiosities to navbar and footer"
```

---

### Task 6: "Publish a Curiosities post" project skill

Adds a repository skill that turns a ready-written Curiosities post into a correctly-placed, correctly-front-mattered file. Documentation deliverable — verified by cross-checking against the real schema/topics and by dry-running a sample post through the build. Do this task LAST, after Tasks 1–5 are merged/committed, so the skill describes the shipped reality.

**Files:**
- Create: `.claude/skills/publish-curiosity-post/SKILL.md`

**Interfaces:**
- Consumes (must stay accurate to): `src/lib/curiositiesTopics.ts` (the 10 topic keys), `src/content/config.ts` (the `curiosities` Zod schema fields), `src/config.ts` (`GENERATE_SLUG_FROM_TITLE`), `astro.config.mjs` (`image.domains`), and the routes from Tasks 2–4.
- Produces: a user-invocable/auto-triggering skill; no code consumes it.

- [ ] **Step 1: Confirm the source-of-truth values before writing**

Run: `sed -n '1,20p' src/lib/curiositiesTopics.ts && echo "---SCHEMA---" && sed -n '/curiositiesSchema/,/^});/p' src/content/config.ts && echo "---SLUG---" && grep GENERATE_SLUG src/config.ts && echo "---IMG DOMAINS---" && grep -A6 "domains" astro.config.mjs`
Expected: prints the 10 topic keys, the schema field list, `GENERATE_SLUG_FROM_TITLE = true`, and the whitelisted image domains. Use these EXACT values in the SKILL.md — do not invent field names or topic keys.

- [ ] **Step 2: Create the skill file**

Create `.claude/skills/publish-curiosity-post/SKILL.md` with this content:

````markdown
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
````

- [ ] **Step 3: Cross-check the skill against the real code**

Run:
```bash
for k in music food exercise travel books history psychology games science brainstorming; do
  grep -q "\"$k\"" src/content/config.ts || echo "MISSING topic in config: $k"
  grep -q "$k" .claude/skills/publish-curiosity-post/SKILL.md || echo "MISSING topic in skill: $k"
done
echo "topic cross-check done"
grep -q "GENERATE_SLUG_FROM_TITLE = true" src/config.ts && echo "slug fact OK"
grep -q "images.unsplash.com" astro.config.mjs && echo "img domain fact OK"
```
Expected: no `MISSING ...` lines, `topic cross-check done`, `slug fact OK`, `img domain fact OK`. Fix any mismatch in the SKILL.md so it matches the code exactly.

- [ ] **Step 4: Dry-run a sample post through the build, then remove it**

Prove the instructions actually work end-to-end:
```bash
cat > src/content/curiosities/skilltest-sample.md <<'MD'
---
title: "Skill test sample post"
description: "Temporary post to verify the publishing skill instructions."
pubDate: 2026-07-20
topic: "science"
tags: ["temp"]
---
Temporary body for verification.
MD
pnpm run build || node_modules/.bin/astro build
ls dist/curiosities/skill-test-sample-post/index.html && echo "sample built OK"
ls dist/curiosities/topic/science/index.html && echo "listed under topic OK"
rm src/content/curiosities/skilltest-sample.md
```
Expected: `sample built OK` and `listed under topic OK`, confirming a post authored purely by following the skill lands correctly. The sample file is deleted at the end — confirm `git status` shows only the new SKILL.md staged, no `skilltest-sample.md`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/publish-curiosity-post/SKILL.md
git status --porcelain   # verify ONLY the SKILL.md is staged; no sample post lingering
git commit -m "docs(curiosities): add publish-curiosity-post project skill"
```

---

## Verification summary (whole feature)

After all tasks, from a clean `pnpm run build`:
- `/curiosities/` — hub with 10 tiles (live counts) + 3-post Latest feed.
- `/curiosities/topic/<topic>` + `/curiosities/topic/<topic>/<n>` — real static pagination, 6/page, newest-first; empty topics render a friendly empty state.
- `/curiosities/<slug>` — minimal post; tags and series nav appear only when present.
- Navbar + footer link to Curiosities; active state correct.
- AI Blog output and files unchanged.

## Manual visual check (optional, recommended once)

Run `pnpm run dev` and visit `/curiosities/`, one topic page, page 2 of Music, a series post (Japan diaries part 1), and the tagged Food post. Toggle the theme (night/lofi) on each to confirm both themes read well.
