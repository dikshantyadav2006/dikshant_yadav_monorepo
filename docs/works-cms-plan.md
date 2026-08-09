# Works CMS — Implementation Plan

Branch: `feat/works-cms`

## Objective

Upgrade the admin-web app to manage the work-web portfolio projects ("Works"/case
studies) with the same capabilities as the existing post management: create, edit,
delete, feature/pin, visual-builder canvas + templates, versions, preview, and
uploads. Works and Posts get a bidirectional "connected" relation so linked posts
appear on the work site and linked works appear on the post site.

## Confirmed decisions

- **Work↔Post link:** many-to-many join table `PostWorkLink`.
- **Works categorization:** freeform fields on the Work model (`category` string,
  `services` array inside `bento`), matching the current portfolio data. No shared
  vocabulary with posts.
- **Existing data:** the 6 hardcoded projects in `apps/work-web/src/lib/projects.ts`
  are migrated to the database via a seed script; work-web becomes API-backed only.
- **Admin editor:** a parallel work editor (work store, work nodes, work sidebar,
  work inspector, work preview) that mirrors the post editor but leaves the post
  editor untouched.

## Steps

### 1. Database (`packages/database/prisma/schema.prisma`)

Follow the existing `db push` + SQL-hotfix pattern (no `prisma/migrations`
directory; CI `migrate deploy` is a no-op safety net).

- New enum `WorkStatus { DRAFT PUBLISHED ARCHIVED }`.
- New model `Work`: metadata columns (title, subtitle, category, year,
  heroImageUrl, imageUrl, overview, description, techStack, link, bento, credits,
  nextProject, seo fields, status, featured, featuredPinned, canvasData,
  currentVersion, publishedAt, archivedAt, timestamps) + relations (author,
  versions, builderNodes, builderEdges, postLinks).
- New models `WorkVersion`, `WorkBuilderNode`, `WorkBuilderEdge` mirroring the
  Post family.
- New model `PostWorkLink` (postId, workId, sortOrder, createdAt).
- Update `User` and `Post` relations.
- Run `npm run generate:prisma` + `npm run db:push`.

### 2. Shared types (`packages/types/src/index.d.ts`)

- `WorkStatus`, `WorkContentBlock` union (the 6 existing block shapes:
  large-image, grid-2, banner, posters, mobile-showcase, desktop-showcase),
  `ProjectBento`, `ProjectCredit`, `NextProjectLink`, `Work`, `WorkVersion`,
  work canvas API types.

### 3. Shared block ordering (`packages/shared`)

- Move `orderNodes(nodes, edges)` from admin-web into `packages/shared`
  (re-exported from admin-web so the post flow is untouched). The API uses it to
  derive `contentBlocks` from `Work.canvasData`.

### 4. Node registry (`packages/node-registry/src/index.js`)

- Add 6 work node definitions with `defaultData` matching the `WorkContentBlock`
  shapes, plus work templates (starter canvases).

### 5. API (`apps/api/src`)

- `routes/works.ts`: list/create/read/update/delete for works (public reads only
  PUBLISHED; admin sees all + writes).
- `routes/works-builder.ts`: canvas GET/PUT + versions + restore (mirrors the post
  visual-builder route).
- `routes/work-links.ts`: `PUT /works/:id/posts` (admin), `GET /posts/:id/works`
  (public).
- `services/work.service.ts`, `services/work-builder.service.ts`,
  `services/work-link.service.ts`.
- Register the three route plugins in `app.ts`.
- `GET /posts/:id` response includes linked published works.

### 6. Admin-web (`apps/admin-web/src`)

Parallel work editor; post editor untouched.

- Nav: `Works` (`/works`) and `New Work` (`/works/new`) in AdminShell.
- List page `(dashboard)/works/page.tsx` + `components/works-table.tsx`
  (status, featured toggle, delete, edit, view).
- New `(dashboard)/works/new/page.tsx` (create draft → canvas) and edit
  `(dashboard)/works/[id]/edit/page.tsx`.
- Work editor: `features/work-builder/{store,api,serializer}.ts`,
  `components/editor/{WorkCanvas,work-nodes,WorkSidebar,WorkInspector,WorkPreviewPanel,WorkVersionsSidebar}.tsx`,
  linked-posts picker.

### 7. work-web (`apps/work-web`)

- `.env.example`, `lib/constants.ts`, `lib/api.ts` (post-web pattern),
  `lib/works.ts` (getWorks/getWorkBySlug/getAdjacentWorks, ISR revalidate).
- Update `app/page.tsx`, `app/project/[slug]/page.tsx`, `app/sitemap.ts`.
- Remove `lib/projects.ts` (data moves to seed).
- Add linked-posts ("Related case studies") section on the project page.

### 8. post-web (`apps/post-web`)

- `getLinkedWorks(postId)` → `GET /posts/:id/works`.
- Article page: "Related Projects" cards linking to work.dikshantyadav.in.

### 9. Seed script

- `apps/api/src/scripts/seed-works.ts` (+ `seed:works` npm script): inserts the 6
  static projects as PUBLISHED Works, building canvasData nodes/edges from their
  contentBlocks.

### 10. Root scripts & CI

- Add work-web to root `lint` and `build`.
- Add `VERCEL_WORK_WEB_DEPLOY_HOOK` curl to CI deploy job.

### 11. Docs rewrite

- New `docs/works-platform-architecture.md`.
- Update post-platform-architecture.md, monorepo-audit-report.md, preview-system.md.

### 12. Verification

- generate:prisma, db:push, seed:works, lint, build, manual dev checks.

## Ordering

work-web stays functional throughout: it is migrated last, after the DB + seed +
API are in place.
