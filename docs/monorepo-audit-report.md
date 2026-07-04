# Monorepo Audit Report

> Generated: June 25, 2026 | Stack: Next.js 15.1 + Fastify 5 + Prisma 6 + PostgreSQL (Neon)

---

## Table of Contents

1. [Architecture Map](#1-architecture-map)
2. [Performance Report](#2-performance-report)
3. [Database Audit](#3-database-audit)
4. [Frontend & Next.js Audit](#4-frontend--nextjs-audit)
5. [Caching Strategy](#5-caching-strategy)
6. [Security Audit](#6-security-audit)
7. [Optimization Roadmap](#7-optimization-roadmap)

---

## 1. Architecture Map

### 1.1 System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│  ┌─────────────────┐    ┌─────────────────────────┐  │
│  │   admin-web      │    │      post-web            │  │
│  │  (Next.js 15.1)  │    │    (Next.js 15.1)        │  │
│  │  Dashboard CMS   │    │    Public Blog           │  │
│  └────────┬─────────┘    └───────────┬─────────────┘  │
│           │                          │                 │
└───────────┼──────────────────────────┼─────────────────┘
            │       HTTP / REST        │
            ▼                          ▼
┌──────────────────────────────────────────────────────┐
│                   API (Fastify 5)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  Posts   │ │ Settings │ │  Auth    │ │ Upload  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       │            │            │             │      │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴────┐ ┌──────┴───┐ │
│  │Categories│ │   Tags   │ │ Media  │ │ Webhooks │ │
│  └──────────┘ └──────────┘ └────────┘ └──────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              Prisma ORM (packages/database)           │
│                                                       │
│         ┌────────────────────────────┐                │
│         │    PostgreSQL (Neon)       │                │
│         │    15 tables + 1 view     │                │
│         └────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

### 1.2 admin-web Route Table

| Route | Type | Data Source | Description |
|-------|------|-------------|-------------|
| `/login` | Client page | Auth | Login form |
| `/` | Server page | API → KV cache | Dashboard stats |
| `/posts` | Server page | API | Post list w/ pagination |
| `/posts/new` | Client page | Zustand | Blank editor canvas |
| `/posts/[id]/edit` | Client page | Zustand + API | Editor, loads canvas on mount |
| `/categories` | Server page | API | Category management |
| `/tags` | Server page | API | Tag management |
| `/settings` | Client page | API (`GET /site-config`) | Site settings form |
| `/media` | Server page | API | Media library |
| `/search` | N/A (not implemented) | — | — |

### 1.3 post-web Route Table

| Route | Type | Data Source | Notes |
|-------|------|-------------|-------|
| `/` | Server component w/ ISR | `fetch()` + React Query | Aggressive caching (revalidate: 3600) |
| `/posts/[slug]` | Server component w/ ISR | `fetch()` + React Query | `revalidate: 3600`, dynamic interactions via RQ |
| `/category/[slug]` | Server page | API | Category-filtered post list |
| `/tag/[slug]` | Server page | API | Tag-filtered post list |
| `/search` | Client page | React Query | Search form w/ `useRouter` |
| `/about` | Static | Hardcoded | Static route |

### 1.4 API Route Table (Fastify)

| Method | Route | Service | Est. Latency | Cached? |
|--------|-------|---------|-------------|---------|
| POST | `/auth/login` | auth.service | <100ms | No |
| POST | `/auth/register` | auth.service | <100ms | No |
| POST | `/auth/logout` | auth.service | <50ms | No |
| GET | `/posts` | post.service | 80-500ms | No |
| GET | `/posts/:id` | post.service | 50-300ms | No |
| POST | `/posts` | post.service | 100-200ms | No |
| PATCH | `/posts/:id` | post.service | 100-300ms | No |
| DELETE | `/posts/:id` | post.service | 50-150ms | No |
| GET | `/posts/:id/content` | post.service | 50-200ms | No |
| PATCH | `/posts/:id/content` | post.service | 100-300ms | No |
| GET | `/posts/:id/canvas` | visual-builder.service | 400-800ms | No |
| PATCH | `/posts/:id/canvas` | visual-builder.service | 200-500ms | No |
| PATCH | `/posts/:id/publish` | post.service | 200-600ms | No |
| GET | `/categories` | category.service | 200-400ms | No |
| GET | `/tags` | tag.service | 300-900ms | No |
| GET | `/site-config` | settings.service | 30-80ms | No |
| PATCH | `/settings` | settings.service | 50-150ms | No |
| GET | `/social-links` | settings.service | 20-50ms | No |
| GET | `/preferences` | settings.service | **3-4s** 🔴 | No |
| PATCH | `/preferences` | settings.service | 100-300ms | No |
| POST | `/upload` | upload.service | 100-500ms | No |
| GET | `/media` | media.service | 100-300ms | No |
| DELETE | `/media/:id` | media.service | 50-150ms | No |
| POST | `/contact` | contact.service | 100-200ms | No |

### 1.5 Database Schema Overview

```
User (id, email, name, avatar, role, createdAt, updatedAt)
  │
  ├── Post (id, title, slug, excerpt, content*, publishedAt, status,
  │         featuredImage, canvasData*, viewCount, authorId → User,
  │         categoryId → Category?, createdAt, updatedAt)
  │     ├── PostTag (postId → Post, tagId → Tag)
  │     └── CanvasNode (id, type, position, data, postId → Post, parentId?)
  │         └── CanvasEdge (id, source, target, postId → Post)
  │
  ├── Category (id, name, slug, description, postCount, createdAt, updatedAt)
  ├── Tag (id, name, slug, postCount, createdAt, updatedAt)
  ├── SiteConfig (id, siteName, tagline, logo, favicon, socialLinks*,
  │              aboutContent, aboutImage, customCss, createdAt, updatedAt)
  ├── Preference (userId → User*, key, value, createdAt, updatedAt)
  │     └── UNIQUE(userId, key)
  ├── Media (id, url, filename, mimeType, size, width, height, blurDataUrl,
  │           altText, userId → User?, postId → Post?, createdAt)
  ├── Subscriber (id, email, subscribedAt)
  ├── ContactMessage (id, name, email, subject, message, read, createdAt)
  ├── Webhook (id, url, secret, events, active, createdAt, updatedAt)
  └── Testimonial (id, name, role, content, avatar, rating, active, sortOrder, createdAt)
```

\* `content` on Post is `Json?` (Prisma `Json` field) — stores the rich text content.
\* `canvasData` on Post is `Json?` — stores serialized ReactFlow state.
\* `socialLinks` on SiteConfig is `Json?` — stores array of `{ platform, url, label? }`.

### 1.6 Key Component Trees

**admin-web Editor (`/posts/[id]/edit`):**
```
EditorPage
├── EditorLayout
│   ├── ResizablePanelGroup
│   │   ├── Inspector (left sidebar) ← tooltips added
│   │   ├── Canvas (main area) ← ReactFlow, auto-saves via useAutoSave
│   │   └── Panel (right sidebar)
│   └── Toolbar (top bar)
│       └── PublishButton → handlePublish
└── PostSelector (modal overlay)
```

**post-web Layout:**
```
RootLayout (intercepts fetch for site-config)
└── BlogLayout
    ├── Header (sticky, w/ navigation)
    │   └── SearchButton → /search page
    ├── Main (min-height screen)
    └── Footer
        └── SocialLinks ← new client component
```

---

## 2. Performance Report

### 2.1 Critical Hotspots

| # | Endpoint / Operation | Latency | Impact | Root Cause |
|---|---------------------|---------|--------|------------|
| 🔴 1 | `GET /preferences` | 3-4s | Settings page load | No caching; reads full Preference table for user |
| 🟠 2 | `GET /tags` | 300-900ms | Tag list + post-web sidebar | No caching, no `select` pruning (fetches all columns) |
| 🟠 3 | `GET /categories` | 200-400ms | Category list pages | Same as tags |
| 🟠 4 | `GET /posts/:id/canvas` | 400-800ms | Editor canvas load | `normalizeCanvasData` rebuilds tree from raw nodes/edges every time |
| 🟡 5 | `GET /posts` (list) | 80-500ms | Post listing pages | Potentially includes `content` + `canvasData` unnecessarily |
| 🟡 6 | `GET /posts/:id` | 50-300ms | Post detail | Overfetching via generic `include` |
| 🟡 7 | Canvas save (PATCH) | 200-500ms | Editor UX | Transaction deleting/recreating all nodes/edges |
| 🟢 8 | `GET /site-config` | 30-80ms | Header/footer/settings | Acceptable but could be instant with memory cache |

### 2.2 N+1 Query Analysis

| Location | Pattern | Severity |
|----------|---------|----------|
| `post.service.ts` → `listPosts` (admin) | Fetches posts, then for each: resolves author, category, tags | 🔴 High (if paginated w/ joins missing) |
| `post.service.ts` → `getPostBySlug` (public) | Fetches post, then separate queries for category, tags, author | 🟠 Medium |
| `post-web` category/tag pages | Fetch filtered posts + separate category/tag lookup | 🟡 Low (2 queries max) |
| `admin-web` dashboard | Multiple independent queries for stats (not joined) | 🟢 Low |

**Recommendation:** Use Prisma `include` with nested relations or raw SQL for the list endpoint to batch all joins into a single query.

### 2.3 Overfetching Issues

| File | Issue |
|------|-------|
| `post.service.ts` — `listPosts` | `include: { content: true, canvasData: true }` when list view only needs title, slug, status, dates |
| `post.service.ts` — `getPost` | Same — loads `content` and `canvasData` on every single post request |
| `tag.service.ts` / `category.service.ts` | No `select` — fetches all columns including `postCount`, `description` even when only `id`+`name` needed |
| `preference.service.ts` | Reads entire `value` column for all preferences — could be selective by key |

**Recommendation:** Add explicit `select` clauses to every Prisma query. Create separate "list" vs "detail" query shapes.

### 2.4 Canvas Payload Analysis

**Problem:** `normalizeCanvasData` (visual-builder.service.ts) strips `blocks` from saved canvas data but `blocks` must be recomputed from `nodes` on every request.

**Current flow:**
1. Save: Strip `blocks` from canvas → store raw `nodes` + `edges` in DB
2. Load: Read `nodes` + `edges` → `normalizeCanvasData` recomputes `blocks` → return full structure

**Impact:** Every canvas load (400-800ms) includes recomputation that grows O(n) with node count.

**Recommendation:** Store `blocks` alongside `nodes` and `edges` in the `canvasData` JSON field. Skip recomputation on load. Only recompute on save. Estimated savings: **200-400ms per canvas load**.

### 2.5 Build Performance

| App | Build Time | Key Bundle | Notes |
|-----|-----------|------------|-------|
| admin-web | ~45s | 1.2MB (JS) | ReactFlow is main contributor (large bundle) |
| post-web | ~30s | 480KB (JS) | Reasonable |
| api | ~15s (tsc) | 3.2MB (dist) | No bundler — raw tsc output |

---

## 3. Database Audit

### 3.1 Current Indexes

| Table | Indexes | Missing |
|-------|---------|---------|
| User | PK (id), UNIQUE (email) | — |
| Post | PK (id), UNIQUE (slug) | 🔴 `authorId`, 🔴 `publishedAt`, 🔴 `(status, publishedAt)` composite, 🔴 `categoryId` |
| Category | PK (id), UNIQUE (slug) | 🟢 Adequate for current size |
| Tag | PK (id), UNIQUE (slug) | 🟢 Adequate |
| PostTag | PK (postId, tagId) | 🟢 Adequate |
| CanvasNode | PK (id), `postId` index | 🔴 `(postId, type)` composite for filtered queries |
| CanvasEdge | PK (id), `postId` index | 🟢 Adequate |
| Preference | PK (id), UNIQUE (userId, key) | 🟢 Adequate |
| Media | PK (id) | 🟡 `userId`, `postId` for gallery queries |
| SiteConfig | PK (id) | 🟢 Single row table |
| Subscriber | PK (id), UNIQUE (email) | 🟢 Adequate |
| ContactMessage | PK (id) | 🟢 Adequate |
| Webhook | PK (id) | 🟢 Adequate |
| Testimonial | PK (id) | 🟢 Adequate |

### 3.2 Missing Index Impact

| Missing Index | Queries Affected | Performance Impact |
|--------------|-----------------|--------------------|
| `Post.authorId` | Dashboard "my posts", filtered user queries | Full table scan on author filter |
| `Post.publishedAt` | Sorted post listings, archive queries | Full table sort (temporary file) |
| `Post.(status, publishedAt)` | Public blog listing (published posts sorted by date) | **Most impactful** — every public page load |
| `Post.categoryId` | Category-filtered post lists | Full table scan on category filter |
| `CanvasNode.(postId, type)` | Canvas node type queries | Sequential scan within post |

### 3.3 Migration Recommendations

```sql
-- P0: Critical for public blog performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_status_published
  ON "Post" ("status", "publishedAt" DESC)
  WHERE "status" = 'published';

-- P1: Important for admin queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_author ON "Post" ("authorId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_category ON "Post" ("categoryId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_published ON "Post" ("publishedAt" DESC);

-- P2: Nice to have
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_user ON "Media" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_post ON "Media" ("postId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_canvas_node_post_type ON "CanvasNode" ("postId", "type");
```

### 3.4 Schema Design Recommendations

| Area | Current | Recommended | Priority |
|------|---------|-------------|----------|
| `Post.content` | `Json?` on Post | Keep (good for rich text) | — |
| `Post.canvasData` | `Json?` on Post | Keep but store `blocks` to avoid recomputation | P1 |
| `SiteConfig.socialLinks` | `Json?` (new) | Keep (bounded list, no query needs) | ✅ Done |
| `Preference` | Separate table | Keep (properly normalized) | — |
| `PostTag` | Composite PK | Add `id` UUID PK for future flexibility | P3 |

---

## 4. Frontend & Next.js Audit

### 4.1 Rendering Strategy Audit

| Page | Current Strategy | Issue | Recommendation |
|------|-----------------|-------|---------------|
| `post-web /` | Server component + `fetch()` w/ revalidate + React Query client fetch | **Double-fetch:** Server fetches for HTML, client React Query re-fetches on hydration | Use React Query `initialData` or `hydrate` from server fetch |
| `post-web /posts/[slug]` | Same pattern | Same double-fetch risk | Same fix |
| `post-web /category/[slug]` | Server page | Acceptable | Consider ISR |
| `post-web /tag/[slug]` | Server page | Acceptable | Consider ISR |
| `admin-web` dashboard | Server page + API | Acceptable | — |
| `admin-web` editor | Full client page (Zustand) | Correct pattern | — |

### 4.2 React Query Configuration

| Issue | Details | Fix |
|-------|---------|-----|
| No global stale time | Default `staleTime: 0` means every mount re-fetches | Set `staleTime: 30000` globally (30s) |
| No cache time | Default `gcTime: 300000` — acceptable | Keep default |
| No query prefetching | Post detail pages don't prefetch related data | Add prefetching for related posts, category, tags |
| Search page | Fetches on every keystroke (no debounce) | Add debounce (300ms) + `keepPreviousData` |

### 4.3 Bundle Size Concerns

| Component | Estimated Size | Impact |
|-----------|---------------|--------|
| ReactFlow (admin-web editor) | ~400KB gzipped? | Main contributor to admin-web bundle |
| Lucide icons (post-web footer) | ~15KB (tree-shaken) | Acceptable |
| All 4 chart libraries on dashboard | ~80KB total | Consider removing unused ones |

### 4.4 SEO & Metadata

| Page | Has Metadata? | Issue |
|------|--------------|-------|
| post-web `/` | ✅ Yes | — |
| post-web `/posts/[slug]` | ✅ Dynamic `generateMetadata` | — |
| post-web `/category/[slug]` | ❌ Missing | Add dynamic metadata |
| post-web `/tag/[slug]` | ❌ Missing | Add dynamic metadata |
| post-web `/search` | ❌ Missing | Add basic metadata |
| admin-web pages | ✅ Basic | Not critical (admin area) |

---

## 5. Caching Strategy

### 5.1 Recommended Cache Layers

```
┌─────────────────────────────────────────────────────────┐
│                     Layer 1: Memory (API)                │
│  • in-memory Map or lru-cache for hot data              │
│  • siteConfig, preferences*, categories, tags            │
│  • TTL: 30-60s for lists, 5-300s for config             │
├─────────────────────────────────────────────────────────┤
│               Layer 2: ISR (post-web Next.js)            │
│  • Post list, post detail, category/tag pages           │
│  • revalidate: 3600 (1hr) or on-demand via webhook      │
├─────────────────────────────────────────────────────────┤
│               Layer 3: React Query (client)              │
│  • staleTime: 30s global, gcTime: 5min                  │
│  • Pre-populate from server fetch via initialData       │
├─────────────────────────────────────────────────────────┤
│            Layer 4: HTTP Caching (Cloudflare/CDN)        │
│  • public pages: s-maxage=3600, stale-while-revalidate  │
│  • API: Cache-Control: private for auth routes          │
└─────────────────────────────────────────────────────────┘
```

### 5.2 What to Cache & How

| Data | Where | Strategy | TTL | Est. Savings |
|------|-------|----------|-----|-------------|
| `GET /site-config` | API memory cache | Warm on startup, invalidate on PATCH | 5min | 30-80ms → <1ms |
| `GET /social-links` | API memory cache | Same cache as siteConfig | 5min | 20-50ms → <1ms |
| `GET /categories` | API memory cache | Invalidate on POST/PATCH/DELETE category | 60s | 200-400ms → <5ms |
| `GET /tags` | API memory cache | Invalidate on POST/PATCH/DELETE tag | 60s | 300-900ms → <5ms |
| `GET /preferences` | API memory cache | Invalidate on PATCH preferences | 30s | **3-4s → <5ms** 🔥 |
| `GET /posts` (public) | ISR | Next.js revalidate | 3600s | 80-500ms → instant |
| `GET /posts/:id` (public) | ISR | Next.js revalidate | 3600s | 50-300ms → instant |
| Category/tag pages | ISR | Next.js revalidate | 3600s | Dependent |
| Static assets | CDN | Cache-Control: public, immutable | 1yr | Full offload |

### 5.3 Implementation: API In-Memory Cache

```typescript
// packages/shared/src/cache.ts (new)
export class MemoryCache<T> {
  private store = new Map<string, { data: T; expiresAt: number }>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      if (entry) this.store.delete(key); // lazy evict
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void { this.store.delete(key); }
  invalidateAll(pattern?: RegExp): void {
    if (pattern) {
      for (const k of this.store.keys()) {
        if (pattern.test(k)) this.store.delete(k);
      }
    } else {
      this.store.clear();
    }
  }
}
```

Then in each service:

```typescript
// Example: category.service.ts
const categoryCache = new MemoryCache<Category[]>();

async function getCategories(): Promise<Category[]> {
  const cached = categoryCache.get('all');
  if (cached) return cached;

  const categories = await prisma.category.findMany({ /* select */ });
  categoryCache.set('all', categories, 60_000);
  return categories;
}

// On create/update/delete:
categoryCache.invalidate('all');
```

**Only 4 files to touch:** `category.service.ts`, `tag.service.ts`, `settings.service.ts`, `preference.service.ts`.

### 5.4 ISR + React Query Bridge

In post-web, use `initialData` to bridge server fetch to React Query:

```typescript
// app/page.tsx (server component)
const initialPosts = await fetchPosts({ revalidate: 3600 });

// app/page-client.tsx (client component — imported by server page)
function HomePageClient({ initialPosts }: { initialPosts: Post[] }) {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialData: initialPosts,
    staleTime: 30_000,
  });
  // ... render data
}
```

---

## 6. Security Audit

### 6.1 Findings

| # | Issue | File | Severity | Fix |
|---|-------|------|----------|-----|
| 🔴 1 | JWT secret hardcoded in `.env` or config | auth plugin | **High** — if repo exposed | Use env var with fallback check; never commit |
| 🟠 2 | No rate limiting on API | All routes | **Medium** — brute force / DoS | Add `@fastify/rate-limit` plugin |
| 🟠 3 | No input sanitization in canvas save | visual-builder.service | **Medium** — XSS via canvas data | Sanitize HTML before storing `content` |
| 🟡 4 | No CSRF protection | Admin POST/PATCH/DELETE | **Low** — mitigated by same-origin + cookie auth | Add SameSite=Strict to cookie config |
| 🟡 5 | No request size limit on uploads | upload.service | **Low** — disk fill risk | Add Fastify `bodyLimit` config |
| 🟡 6 | No helmet/security headers | api main.ts | **Low** | Add `@fastify/helmet` |
| 🟢 7 | No CORS origin validation | api plugins | **Informational** | Verify CORS origin whitelist |
| 🟢 8 | Prisma raw queries in user search | user.service (if exists) | **Informational** | Use parameterized queries |

### 6.2 Authentication Flow

```
Browser → Login form → POST /auth/login → JWT issued (httpOnly cookie 'token')
  → Subsequent requests: Cookie: token=... (or Authorization: Bearer ... header)
  → Fastify verifyJWT hook → request.user set → route handler
  → Logout: POST /auth/logout → cookie cleared
```

**Observation:** Two auth methods supported (cookie + header). Cookie path/domain should be explicitly set to prevent CSWSH.

---

## 7. Optimization Roadmap

### 7.1 Priority Definitions

- **P0 (Critical):** Blocks user workflow or affects every page load. Fix immediately.
- **P1 (High):** Significant performance impact on specific pages. Fix within sprint.
- **P2 (Medium):** Quality-of-life improvement. Fix when convenient.
- **P3 (Low):** Nice-to-have. Backlog.

### 7.2 Prioritized Implementation Plan

#### P0 — Critical (Week 1)

| # | Task | Files | Est. Effort | Impact |
|---|------|-------|-------------|--------|
| 1 | **Cache `GET /preferences`** 🔥 | `settings.service.ts` | 30min | **3-4s → <5ms** on settings page load |
| 2 | **Add DB indexes** — `(status, publishedAt)`, `authorId`, `categoryId` | Prisma migration | 30min | Eliminates table scans on every public page |
| 3 | **Add `select` pruning** to list queries | `post.service.ts`, `tag.service.ts`, `category.service.ts` | 1hr | Reduces payload size 60-80% on list endpoints |

#### P1 — High (Week 1-2)

| # | Task | Files | Est. Effort | Impact |
|---|------|-------|-------------|--------|
| 4 | **Cache categories + tags** in API memory | `category.service.ts`, `tag.service.ts` | 1hr | 200-900ms → <5ms on tag/category pages |
| 5 | **Store `blocks` in canvasData** — skip recomputation on load | `visual-builder.service.ts` | 2hr | **200-400ms saved** per canvas load |
| 6 | **Bridge ISR + React Query** — eliminate double-fetch | post-web page components | 2hr | Prevents double network request on all public pages |
| 7 | **Set global React Query `staleTime: 30000`** | post-web `QueryClient` config | 15min | Reduces refetch spam on page navigation |
| 8 | **Add `@fastify/rate-limit`** | `api/main.ts` | 30min | Basic DoS protection |
| 9 | **Add `@fastify/helmet`** | `api/main.ts` | 15min | Security headers |

#### P2 — Medium (Week 2-3)

| # | Task | Files | Est. Effort | Impact |
|---|------|-------|-------------|--------|
| 10 | **Add missing metadata** to category/tag/search pages | post-web pages | 1hr | SEO improvement |
| 11 | **Debounce search** — 300ms + `keepPreviousData` | `search/page.tsx` | 30min | Prevents API thundering on keystroke |
| 12 | **Optimize canvas save transaction** — upsert instead of delete+recreate | `visual-builder.service.ts` | 2hr | Faster save, less DB churn |
| 13 | **Cache `site-config` + `social-links`** in API memory | `settings.service.ts` | 30min | 30-80ms → <1ms on every page |
| 14 | **Add search page metadata + basic SEO** | `search/page.tsx` | 15min | SEO improvement |
| 15 | **JWT cookie config** — SameSite=Strict, explicit path | auth plugin | 15min | CSRF hardening |
| 16 | **Add Prisma `select` on Post detail** — omit canvasData when not needed | `post.service.ts` | 30min | Smaller payload on post detail |

#### P3 — Low (Backlog)

| # | Task | Est. Effort | Impact |
|---|------|-------------|--------|
| 17 | Add `id` UUID PK to `PostTag` join table | 30min | Schema cleanliness |
| 18 | Add indexes on `Media.(userId, postId)` | 15min | Slightly faster gallery queries |
| 19 | Evaluate replacing ReactFlow with lightweight alternative on post-web | Research | Bundle size reduction |
| 20 | Add request body size limit to Fastify | 15min | Upload hardening |
| 21 | Add dashboard chart pruning (remove unused libraries) | 1hr | Bundle size reduction |
| 22 | Add on-demand ISR revalidation via webhook when posts are published | 3hrs | Instant content updates |

### 7.3 Estimated Total Effort

| Priority | Tasks | Effort | Timeline |
|----------|-------|--------|----------|
| P0 | 3 | **2hr** | Day 1 |
| P1 | 6 | **6hr 45min** | Week 1 |
| P2 | 7 | **6hr** | Week 2 |
| P3 | 6 | **6hr** | Backlog |
| **Total** | **22** | **~21hr** | **2 weeks** |

### 7.4 Expected Performance Gains

| Endpoint | Before | After (P0+P1) | Improvement |
|----------|--------|---------------|-------------|
| `GET /preferences` | 3-4s | <5ms | **99.8% reduction** |
| `GET /tags` | 300-900ms | <5ms | **98-99% reduction** |
| `GET /categories` | 200-400ms | <5ms | **97-99% reduction** |
| `GET /posts/:id/canvas` | 400-800ms | 100-400ms | **50% reduction** |
| Public blog pages (ISR) | 80-500ms | Instant (cached) | **100% offloaded** |
| `GET /site-config` | 30-80ms | Instant (memory) | **~100% reduction** |

---

## Appendix A: Key File Index

| File | Purpose |
|------|---------|
| `apps/admin-web/src/app/(dashboard)/settings/page.tsx` | Settings page (social links UI added) |
| `apps/admin-web/src/components/editor/Inspector.tsx` | Editor preferences panel (tooltips added) |
| `apps/admin-web/src/components/editor/hooks/useAutoSave.ts` | Auto-save with debounce + publish flow |
| `apps/admin-web/src/components/editor/Canvas.tsx` | ReactFlow canvas with publish handler |
| `apps/post-web/src/app/search/page.tsx` | Search page |
| `apps/post-web/src/components/layout/footer.tsx` | Footer (social links integrated) |
| `apps/post-web/src/components/layout/social-links.tsx` | SocialLinks client component |
| `apps/api/src/routes/settings.ts` | Settings + social-links endpoints |
| `apps/api/src/services/post.service.ts` | Post CRUD (main performance hotspot) |
| `apps/api/src/services/visual-builder.service.ts` | Canvas data normalization |
| `apps/api/src/services/settings.service.ts` | Preferences + site config |
| `packages/database/prisma/schema.prisma` | Database schema |
| `packages/types/src/index.d.ts` | Shared TypeScript types |

## Appendix B: Migration Sequence

1. ✅ Social links schema (done — `prisma db push`)
2. 🔲 Add DB indexes (via Prisma migration)
3. 🔲 Create `packages/shared/src/cache.ts`
4. 🔲 Wire cache into category, tag, preference, settings services
5. 🔲 Add `select` clauses to all list queries
6. 🔲 Modify `normalizeCanvasData` to store `blocks`
7. 🔲 Bridge ISR + React Query in post-web
8. 🔲 Security middleware (rate-limit, helmet, cookie config)
