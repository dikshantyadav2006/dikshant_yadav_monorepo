# Article Page Performance Audit — The Abhay (`post-web`)

Audit date: 2026-06-23  
Scope: `/posts/[id]/[slug]` navigation and render pipeline

## Architecture (before)

```
Click PostCard → Next.js RSC → fetch API (no-store) → Prisma (post + relations)
              → await view tracking (2 DB ops) → return JSON
              → sequential fetch related posts → render full page (no loading.tsx)
```

## Root bottlenecks identified

| # | Bottleneck | Impact | Severity |
|---|-----------|--------|----------|
| 1 | `getPost()` used `cache: 'no-store'` | Every article hit = cold API + DB round trip | **Critical** |
| 2 | View tracking `await`ed before API response | +50–200ms per page view (2 extra queries) | **Critical** |
| 3 | Sequential post → related fetches on server | Waterfall; TTFB = sum of both API calls | **High** |
| 4 | No `loading.tsx` / route transition UI | Zero perceived feedback on click | **High** |
| 5 | No ISR / `generateStaticParams` | SSR on every request | **High** |
| 6 | Over-fetching in Prisma includes | Full category/tags/media objects | **Medium** |
| 7 | Related posts fetched full post shape | Unnecessary payload for cards | **Medium** |
| 8 | `getPostByPath` called from metadata + page without dedupe | Potential duplicate fetch (mitigated by React dedupe in some cases) | **Medium** |
| 9 | No performance instrumentation | Could not measure regressions | **Low** |

## Optimizations applied

### API (`apps/api`)

1. **Fire-and-forget view tracking** — response returns immediately; views recorded in background.
2. **Prisma query tuning** — UUID lookup uses indexed `id` path; public selects trim author/category/media fields.
3. **Related posts lean query** — `select` instead of full `include`; tag lookup uses lightweight first query.
4. **Cache-Control headers** — `s-maxage=30, stale-while-revalidate=120` on post detail + related.
5. **Structured perf logging** — `db:*` timings via `LOG_PERF=true`; slow API responses logged via Fastify hook.

### Next.js (`apps/post-web`)

1. **ISR caching** — article fetches use `revalidate: 30` + cache tags (`post-{id}`).
2. **`React.cache()` on `getPostByPath`** — single fetch per request for metadata + page.
3. **`generateStaticParams`** — prebuilds 50 most recent posts at build time.
4. **`Suspense` streaming** — related articles load after main article shell streams.
5. **`loading.tsx`** — editorial skeleton matching article layout (instant route feedback).
6. **Navigation system** — top progress bar + pending link state on PostCard click.
7. **Motion system** — subtle fade + upward enter; hero blur-to-sharp via `blurDataUrl`.
8. **Server fetch / render logging** — `server-fetch` and `server-render` JSON logs in dev.

## Caching strategy

| Layer | Policy | Tags |
|-------|--------|------|
| Next.js fetch (post detail) | ISR 30s | `posts`, `post-{id}` |
| Next.js fetch (related) | ISR 30s | `related`, `related-{postId}` |
| API response | CDN/proxy 30s + SWR 120s | — |
| Static generation | Top 50 posts at build | — |
| View counts | Async, non-blocking | Not cached in page payload |

**Future:** wire admin publish webhook to `revalidateTag('post-{id}')` for instant updates.

## How to measure

Enable logging:

```bash
# API
LOG_PERF=true npm run dev --workspace=@dikshant/api

# post-web (dev logs enabled by default)
npm run dev --workspace=@dikshant/post-web
```

Look for JSON log lines:

- `{ "type": "db:getPostBySlugOrId", "durationMs": ... }`
- `{ "type": "db:incrementViews", "durationMs": ... }` (after response)
- `{ "type": "api-response", "url": "/posts/...", "durationMs": ... }`
- `{ "type": "server-fetch", "path": "/posts/...", "durationMs": ... }`
- `{ "type": "server-render", "label": "post-page", "durationMs": ... }`

## Expected impact

| Metric | Before (typical) | After (target) |
|--------|------------------|----------------|
| API post detail (p50) | 300–800ms | 80–150ms |
| View tracking on critical path | 50–200ms | **0ms** |
| Next.js TTFB (cached) | 500ms–2s+ | **<100ms perceived** (loading.tsx) |
| Click feedback | None | **Immediate** (progress + skeleton) |
| Related posts blocking | Yes | **No** (Suspense) |

Run local benchmark script after starting API + post-web:

```bash
node scripts/benchmark-article.mjs
```

## Files changed

- `apps/api/src/utils/perf.ts`
- `apps/api/src/app.ts`
- `apps/api/src/services/post.service.ts`
- `apps/api/src/routes/posts.ts`
- `apps/api/src/routes/related.ts`
- `apps/post-web/src/lib/perf.ts`
- `apps/post-web/src/lib/posts.ts`
- `apps/post-web/src/app/posts/[id]/[slug]/page.tsx`
- `apps/post-web/src/app/posts/[id]/[slug]/loading.tsx`
- `apps/post-web/src/components/ui/article-skeleton.tsx`
- `apps/post-web/src/components/ui/navigation-provider.tsx`
- `apps/post-web/src/components/ui/navigation-link.tsx`
- `apps/post-web/src/components/ui/smart-image.tsx`
- `apps/post-web/src/components/ui/post-card.tsx`
- `apps/post-web/src/app/layout.tsx`
- `apps/post-web/src/app/globals.css`
