# Preview System & Private Share Links

## Overview

The platform provides two tightly integrated features:

1. **Admin Preview Panel** — real-time preview of post blocks rendered inside device frames
2. **Private Share Links** — token-based shareable URLs with optional expiry, plus QR codes

Both share a **unified block renderer** from `@dikshant/ui` to guarantee pixel-identical output between admin preview and public post page.

---

## Architecture

```
                       ┌──────────────────────┐
                       │    @dikshant/ui       │
                       │  ContentRenderer.jsx  │
                       │  (shared block comps) │
                       └──────┬───────────────┘
                              │ imports
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  post-web    │ │  admin-web   │ │  post-web    │
     │ ContentRendr │ │ PreviewPanel │ │ /share/[tkn] │
     │ (public      │ │ (admin       │ │ (public      │
     │  post page)  │ │  preview)    │ │  share page) │
     └──────────────┘ └──────────────┘ └──────┬───────┘
                                              │
                                              ▼
                                     ┌──────────────┐
                                     │  API server  │
                                     │ /share/:token│
                                     │ /share-links │
                                     └──────────────┘
```

### Shared Renderer (`packages/ui/src/blocks/ContentRenderer.jsx`)

- Contains all 13 block types: heading, text, image, video, gallery, quote, divider, code-block, embed, question, poll, button, ai-block
- Uses Tailwind classes identical to the public post page
- Imported by both `post-web` and `admin-web` via `@dikshant/ui`
- Configured to be transpiled by Next.js via `transpilePackages: ['@dikshant/ui']`

### Tailwind Configuration

Both apps' `tailwind.config.ts` include the packages path:
```
'../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
```

This ensures all Tailwind utility classes used in the shared renderer are included in the CSS build.

---

## Admin Preview Panel

**Location:** `apps/admin-web/src/components/editor/PreviewPanel.tsx`

### Features

- **Device frame toggle:** Mobile (375px), Tablet (768px), Desktop (100%)
- **Real-time rendering:** Reads canvas data from Zustand store, orders blocks via `orderNodes()`, renders via shared `ContentRenderer`
- **Share panel tab:** Toggle between preview and share link management

### Access

Click the **Preview** button (👁 icon) in the editor toolbar. The canvas, sidebar, and inspector are replaced by the preview panel. Click ✕ or Preview again to return.

---

## Private Share Links

### Database Model (`ShareLink`)

```prisma
model ShareLink {
  id        String    @id @default(uuid())
  postId    String
  token     String    @unique
  expiresAt DateTime? // null = infinite
  createdAt DateTime  @default(now())
  post      Post      @relation(...)
}
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/posts/:id/share-links` | Admin | Create share link (body: `{ expiresInMs: number \| null }`) |
| `GET` | `/posts/:id/share-links` | Admin | List share links for a post |
| `DELETE` | `/share-links/:linkId` | Admin | Delete a share link |
| `GET` | `/share/:token` | Public | Access shared post by token |

### Expiry Options

| Value | Label |
|-------|-------|
| `3600000` | 1 hour |
| `86400000` | 24 hours |
| `604800000` | 7 days |
| `2592000000` | 30 days |
| `-1` (null) | No expiry (infinite) |

### Share URL Format

```
http://localhost:3000/share/<32-char-hex-token>
```

### QR Code

QR codes are generated client-side using the free [QR Server API](https://goqr.me/api/):
```
https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=<encoded-url>
```

No additional npm dependencies required.

### Public Share Page

**Location:** `apps/post-web/src/app/share/[token]/page.tsx`

A server-rendered page that:
1. Fetches `GET /api/share/:token` from the backend
2. Validates token existence and expiry (returns 404/410 if invalid)
3. Renders the post using the shared `ContentRenderer`
4. Uses standard post layout, responsive container, and dossier styling

---

## Files Changed

| File | Change |
|------|--------|
| `packages/ui/src/blocks/ContentRenderer.jsx` | New — shared block renderer |
| `packages/ui/src/index.js` | Updated — exports ContentRenderer |
| `apps/admin-web/src/components/editor/PreviewPanel.tsx` | Rewritten — uses shared renderer + share panel |
| `apps/admin-web/src/components/editor/Toolbar.tsx` | Updated — added Preview button |
| `apps/admin-web/src/components/editor/Canvas.tsx` | Updated — preview toggle wiring |
| `apps/admin-web/tailwind.config.ts` | Updated — scans packages/ui |
| `apps/post-web/tailwind.config.ts` | Updated — scans packages/ui |
| `apps/admin-web/next.config.mjs` | Updated — transpilePackages |
| `apps/post-web/next.config.mjs` | Updated — transpilePackages |
| `apps/post-web/src/app/share/[token]/page.tsx` | New — public share page |
| `apps/api/src/routes/share-links.ts` | New — share link API routes |
| `apps/api/src/services/share-link.service.ts` | New — share link business logic |
| `apps/api/src/app.ts` | Updated — registers share link routes |
| `packages/database/prisma/schema.prisma` | Updated — added ShareLink model |
| `packages/types/src/index.d.ts` | Updated — added ShareLink type |
