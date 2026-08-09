# work-web CMS Upgrade — Implementation Plan

Branch: `master` (built on the merged Works CMS feature)

## Objective

Upgrade the work-web portfolio site and the Works CMS:

1. **Automatic Next/Previous project** — work-web derives prev/next project from the
   API (ordered `publishedAt desc`), with related metadata (card image, hero image,
   or plain color). No admin involvement.
2. **Remove `nextProject` from admin** — delete the "Next Project" section from the
   work inspector and stop storing the field.
3. **Project Bento becomes a canvas block** — add a `bento` node type to the work
   builder; remove bento from work metadata/settings panel.
4. **More blocks** — add `video`, `embed`, `metrics`, `link` block types.
5. **Mobile + desktop tabs on every block** — same block data, responsive layout;
   tabs are mobile/desktop *previews* in the admin inspector and preview panel.
6. **Color tracker** — new per-work `swatchColor` accent field. It themes the
   next/prev cards, page transitions, and a pointer-following color tracker on the
   project page. If unset, a client-side hook derives a dominant color from the hero
   image.

## Confirmed decisions

- **Breakpoints:** same data per block; layout adapts via CSS. Tabs are previews.
- **New blocks:** `video`, `embed` (YouTube/Vimeo), `metrics` (stats row), `link` (CTA tile).
- **Color tracker:** per-work `swatchColor`; fallback = dominant color from hero image (client canvas).
- **Clean break:** drop `nextProject` + `bento` columns; add `swatchColor`. DB has no
  works yet, so `prisma db push` is safe. No backward-compat fallbacks.

## Steps

### 1. Data model (`packages/database`, `packages/types`, `packages/node-registry`)

- `packages/database/prisma/schema.prisma` — `Work`:
  - remove `bento Json?`, `nextProject Json?`
  - add `swatchColor String?`
  - run `npm run generate:prisma` (db generate) + `npm run db:push`.
- `packages/types/src/index.d.ts`:
  - remove `NextProjectLink`, remove `bento`/`nextProject` from `Work`,
    add `swatchColor?: string | null`.
  - extend `WorkContentBlock` union with: `bento`, `video`, `embed`, `metrics`, `link`.
    Reuse `ProjectBento` shape for the bento block.
- `packages/node-registry/src/index.js` — add to `builtInWorkNodes`:
  - `bento` (defaultData = the 8 ProjectBento fields)
  - `video` (`{ src, title, poster }`)
  - `embed` (`{ url, aspectRatio: '16/9' }`)
  - `metrics` (`{ items: [] }`, each `{ value, label }`)
  - `link` (`{ label, href, description }`)
  - `index.d.ts` unchanged (generic `NodeDefinition`).

### 2. API (`apps/api/src`)

- `services/work.service.ts`:
  - remove `nextProject` + `bento` from create/update inputs and writes.
  - add `swatchColor` passthrough.
  - `getWorkBySlugOrId`: after loading the work, compute `prev`/`next` neighbors in
    the canonical public order (`publishedAt desc, updatedAt desc`, PUBLISHED only;
    admin uses all statuses). Each neighbor: `{ slug, title, subtitle, imageUrl,
    heroImageUrl, swatchColor }`. Return alongside the work detail.
  - `listWorks` select: add `swatchColor`.
- `routes/works.ts`: POST/PATCH body swap `bento`/`nextProject` → `swatchColor`.

### 3. Admin-web (`apps/admin-web/src`)

- `features/work-builder/store.ts` — `WorkMetadata`: remove `bento`, `nextProject`;
  add `swatchColor: string`.
- `features/work-builder/api.ts` — `saveWorkMetadata` payload mirrors the store.
- `components/work-editor/WorkCanvas.tsx` — `initialWork` mapping updated; register
  new node types (`bento`, `video`, `embed`, `metrics`, `link`) in `workNodeTypes`.
- `components/work-editor/nodes/WorkNodes.tsx` — add `BentoNode`, `VideoNode`,
  `EmbedNode`, `MetricsNode`, `LinkNode` (BaseNode-wrapped previews).
- `components/work-editor/WorkSidebar.tsx` — icons for the 5 new node types.
- `components/work-editor/WorkInspector.tsx`:
  - remove "Project Bento" and "Next Project" metadata sections;
  - add `swatchColor` hex picker (with preset swatches + hex input);
  - add node-data inspectors for `bento`, `video`, `embed`, `metrics`, `link`;
  - add a Mobile/Desktop preview toggle (segmented control) at the top of the node
    inspector; renders the block preview in a 375px vs full-width frame.
- `components/work-editor/WorkPreviewPanel.tsx`:
  - extract shared `BlockPreview` component (renders all block types incl. new ones);
  - add Mobile/Desktop device toggle to the preview frame.
  - Inspector tabs reuse the same `BlockPreview`.

### 4. work-web (`apps/work-web/src`)

- `.env` + `next.config.mjs` — `API_BASE_URL` (default `http://localhost:3001`),
  mirroring admin-web's `NEXT_PUBLIC_API_URL` pattern.
- `lib/api.ts` (new) — server-side helpers: `getWorks()` (list), `getWork(slug)`
  (detail incl. prev/next); `notFound` on 404; `next: { revalidate: 60 }`.
- `types/project.ts` — replace local `Project` with `@dikshant/types` (`Work`,
  `WorkContentBlock`). Card number derives from list index.
- `app/page.tsx` — fetch works list from API.
- `app/project/[slug]/page.tsx` — `generateStaticParams` from `getWorks()`;
  metadata + page from `getWork(slug)`; pass API `prev`/`next` to CaseStudyPage.
- `app/sitemap.ts` — slugs from `getWorks()`.
- `components/works/ProjectCard.tsx`/`ProjectGrid.tsx` — `Work` fields (`imageUrl`,
  `category`, `techStack`); hover tint uses `swatchColor`.
- `components/project/CaseStudyPage.tsx` — remove bento special-case; render
  content blocks in order with the existing brand/website groupings extended for
  new block types.
- `components/project/ContentBlockRenderer.tsx` + `blocks/`:
  - `BlockBento` (port of `ProjectBento` incl. cursor-fill cards),
  - `BlockVideo`, `BlockEmbed`, `BlockMetrics`, `BlockLink`.
  - Shared reveal motion (`[0.22, 1, 0.36, 1]`, `whileInView`) + responsive classes.
- `components/project/NextProjectSection.tsx` — use API `prev`/`next`; image
  fallback chain `imageUrl → heroImageUrl → swatchColor block`; hover overlay tinted
  with the adjacent work's swatch.
- Color tracker:
  - `lib/useAccentColor.ts` (new) — client hook: uses `swatchColor`; if empty,
    draws hero image to a tiny canvas (`crossOrigin="anonymous"`) and returns a
    dominant hex.
  - `components/ui/ColorTracker.tsx` (new) — fixed mix-blend-difference dot that
    follows the pointer with springs, tinted by the page accent; mounted on the
    project page.

### 5. Verification

- `npm run generate:prisma` + `npm run db:push` (schema up to date).
- Per-app `npx tsc --noEmit` (admin-web, api, work-web), `npm run lint`.
- Root `npm run build`.
- Manual: run API, admin-web, work-web dev; create/publish a work with bento +
  new blocks; confirm prev/next + swatch behavior on work-web.
- Note: work-web SSG build needs the API running so `generateStaticParams` resolves;
  `getWorks()` degrades to `[]` (logged) if unreachable.

## Notes / risks

- Block type names must match across node-registry → `WorkContentBlock` →
  inspector → `ContentBlockRenderer` (`bento`, `video`, `embed`, `metrics`, `link`).
- Clean break drops metadata bento/nextProject (no works exist yet — accepted).
- Dominant-color extraction is client-side (no native deps); picsum/CDN images are CORS-enabled.
