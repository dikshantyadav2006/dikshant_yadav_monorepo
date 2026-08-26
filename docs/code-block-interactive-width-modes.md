# Code Block Interactive — Width Modes

## Problem
Forcing `CodeBlockInteractive` to always be viewport-wide (`left-1/2 -translate-x-1/2 width: min(1280px, 100vw)`) broke post layout:
- Reading column (`--content-width: 960px`) was overflowed
- `max-w-7xl` outer container + TOC (`xl:grid-cols-[1fr_220px]`) misaligned
- Image blocks with `full-width` inside same column conflicted
- Teleprompter example HTML with `max-w-7xl` / fixed `grid-cols-3` caused horizontal overflow

## Solution: `widthMode`

Added `widthMode` to `code-block-interactive` data:

```ts
widthMode?: 'contained' | 'wide' | 'full-bleed' // default 'contained'
```

### Spec
- **contained**: `width:100%` `max-width: var(--content-width)` (960px) — stays inside `reading-column`, no breakout, preserves TOC, image layout, responsive behavior. Default for all new blocks.
- **wide**: `width:100%` `max-width:1400px` `margin:0 auto` implemented as breakout `relative left-1/2 -translate-x-1/2 width:min(1400px, calc(100vw - 2rem))` — centered, slightly wider than article, minimal TOC overlap, opt-in.
- **full-bleed**: `width:100vw` `margin-left:calc(50% - 50vw)` — edge-to-edge viewport, `max-width:none`, breaks out of both `reading-column` and `max-w-7xl`. Opt-in for hero/immersive blocks.

## Files changed

| File | Change |
|------|--------|
| `packages/types/src/index.d.ts` | `WorkContentBlock` `code-block-interactive` add `widthMode?` |
| `packages/node-registry/src/index.js` | `builtInNodes` + `builtInWorkNodes` defaultData `widthMode:'contained'` |
| `apps/post-web/src/app/globals.css` | `:root { --content-width:960px }` + `reading-column { max-width:var(--content-width); margin:0 auto }` + `html,body {overflow-x:clip}` |
| `apps/post-web/src/components/content/content-renderer.tsx` | `case 'code-block-interactive'` switch on `widthMode`; contained `w-full min-w-0 overflow-x-clip`, wide `left-1/2 -translate width:min(1400px,100vw-2rem)`, full-bleed `width:100vw marginLeft:calc(50% -50vw)` |
| `apps/work-web/src/components/project/ContentBlockRenderer.tsx` | Same `widthMode` switch, `bg-transparent` preserved |
| `packages/ui/src/blocks/ContentRenderer.jsx` | Same `widthMode` switch |
| `packages/ui/src/blocks/CodeBlockInteractive.jsx` | Pass `widthMode` to `HtmlCodeBlock`/`ReactCodeBlock`; React wrapper `w-full min-w-0 max-w-full overflow-x-clip`; Html outer `w-full min-w-0 max-w-full overflow-x-clip`; iframe `width:100% minWidth:0 display:block`; buildSrcdoc `responsiveFix` for `contained` (`.max-w-7xl{max-width:100%!important}`) + `baseResponsive` (`* {min-width:0} img{max-width:100%}`) + `html/body overflow-x:hidden`; deps `[code,blockId,widthMode]` |
| `apps/admin-web/src/components/editor/Inspector.tsx` | Add `Width Mode` select under Component section for `code-block-interactive` |
| `apps/admin-web/src/components/work-editor/WorkInspector.tsx` | Same `Width Mode` select |
| `apps/admin-web/src/components/shared/codeTemplates.ts` | `html-landing` grid `grid-cols-3` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full min-w-0` + children `w-full min-w-0` to prevent fixed-width overflow (Teleprompter fix) |

## Teleprompter example — overflow investigation

**Overflow sources identified in big gradient test HTML:**
- `max-w-7xl` / `max-w-6xl` / `max-w-5xl` (1280/1152/1024) inside `contained` 960 → exceeds parent
- `grid-cols-3` fixed on mobile, `h-48` fixed height, `px-8` padding + `gap-8`
- `text-7xl md:text-9xl` huge headings, `w-[800px]`-like fixed widths if present
- `h-screen` / `min-h-screen` causing height loop in auto-height iframe

**Fixes:**
- Remove fixed `max-w-7xl` effect in `contained` via injected `responsiveFix`
- Replace `grid-cols-3` with responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Ensure all children `w-full min-w-0`, images `max-width:100%`
- Parent wrappers `min-w-0 max-w-full overflow-x-clip`, body `overflow-x:clip`
- Iframe `h-screen` pinned to parent `window.innerHeight` via JS injected `vhStyle` (prevents 100vh loop)

**Verification:**
- `contained` with Teleprompter HTML: no horizontal scroll, content wraps within 960, height auto-grows, no flicker
- `wide` with same HTML: centered 1400, shows more columns, still no overflow
- `full-bleed`: edge-to-edge, gradient fills viewport
- Existing `full-width` images unaffected

## Usage
In Admin Code Studio / visual builder Inspector → `Code Block` → `Width Mode`:
- **Contained** (default): safe for articles, respects TOC
- **Wide**: for immersive demos needing extra width
- **Full Bleed**: for hero sections needing viewport bleed
