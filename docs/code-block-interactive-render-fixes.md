# Code Block Interactive — Render Fixes

## All bugs fixed (this session)

### Bug 1: esbuild compilation used ESM format — silent failure

**File:** `packages/ui/src/blocks/CodeBlockInteractive.jsx`

`esbuild.transform()` with `format: 'esm'` produces `import`/`export` statements which are invalid inside `new Function()`. The component silently returned `Component: null`.

**Fix:** Changed to `esbuild.build()` with `format: 'iife'` matching admin-web's `compileCode.ts`.

```js
// BEFORE (broken)
var result = await esbuild.transform(code, {
  loader: 'tsx', jsx: 'automatic', format: 'esm', ...
});

// AFTER (matches admin-web)
var result = await esbuild.build({
  entryPoints: ['<virtual>'], bundle: false, format: 'iife',
  loader: { '.tsx': 'tsx', '.ts': 'ts' }, jsx: 'automatic',
  stdin: { contents: code, loader: 'tsx', resolveDir: '/' },
  target: 'es2020', logLevel: 'silent',
});
```

### Bug 2: extractModule didn't match admin-web

**File:** `packages/ui/src/blocks/CodeBlockInteractive.jsx`

Old pattern checked `exportsObj.default` separately. New pattern strips `import`/`export` lines as safety net and matches admin-web's `extractModule.ts`.

```js
// AFTER (matches admin-web)
fn(moduleObj, moduleObj.exports);
var exported = moduleObj.exports;
var Component = exported.default || (typeof exported === 'function' ? exported : null);
```

### Bug 3: iframe started at height 0px — content invisible

**File:** `packages/ui/src/blocks/CodeBlockInteractive.jsx`

iframe style was `height: '0px'` relying entirely on postMessage. If measurement failed, content was clipped.

**Fix:** Default `height: '400px'` — content always visible. Auto-resize via postMessage enhances as enhancement.

```js
// BEFORE
style: { width: '100%', height: '0px', border: 'none', overflow: 'hidden' }

// AFTER
style: { width: '100%', minWidth: '100%', display: 'block', height: '400px', border: 'none', overflow: 'hidden' }
```

### Bug 4: reading-column constrained content to 680px

**File:** `apps/post-web/src/app/globals.css:147`

```css
/* BEFORE */
.reading-column { @apply max-w-[680px] mx-auto; }

/* AFTER */
.reading-column { @apply max-w-[960px] mx-auto; }
```

### Bug 5: code blocks had no breakout from reading column

**File:** `apps/post-web/src/components/content/content-renderer.tsx:176-188`

Code blocks were stuck inside the 960px reading column. Full-width images already used `left-1/2 -translate-x-1/2` to break out.

```tsx
// AFTER — breakout to 1280px outer container
case 'code-block-interactive':
  return (
    <div
      key={key}
      style={{ ...styles.style, width: 'min(1280px, calc(100vw - 2rem))' }}
      className="relative left-1/2 -translate-x-1/2"
    >
      <CodeBlockInteractive data={block.data} />
    </div>
  );
```

### Bug 6: work-web had no wrapper for code-block-interactive

**File:** `apps/work-web/src/components/project/ContentBlockRenderer.tsx:80-85`

```tsx
// BEFORE — no wrapper, no width control
return <CodeBlockInteractive key={index} data={block as any} />;

// AFTER — explicit full-width wrapper
return (
  <div key={index} className="relative w-full bg-transparent">
    <CodeBlockInteractive data={block as any} />
  </div>
);
```

### Bug 7: share page still used 680px width

**File:** `apps/post-web/src/app/share/[token]/page.tsx:35`

```tsx
// BEFORE
<div className="max-w-[680px] mx-auto px-4 sm:px-8 py-12">

// AFTER
<div className="max-w-[960px] mx-auto px-4 sm:px-8 py-12">
```

### Bug 8: packages/ui ContentRenderer had no code-block-interactive support

**File:** `packages/ui/src/blocks/ContentRenderer.jsx`

Added `code-block-interactive` to `blockRenderers` map with breakout wrapper matching post-web.

```jsx
import CodeBlockInteractive from './CodeBlockInteractive.jsx';

const blockRenderers = {
  // ... existing blocks ...
  'code-block-interactive': CodeBlockInteractive,
};

// In render loop:
style={block.type === 'code-block-interactive'
  ? { width: 'min(1280px, calc(100vw - 2rem))', ...styles.style }
  : styles.style}
className={block.type === 'code-block-interactive'
  ? 'relative left-1/2 -translate-x-1/2 my-8'
  : styles.className}
```

### Bug 9: esbuild-wasm import broke Vercel builds

**File:** `packages/ui/src/blocks/CodeBlockInteractive.jsx`

Rollup/Vite tried to resolve `import('esbuild-wasm')` at build time. Post-web and work-web have esbuild-wasm installed, but main-web (Vite) doesn't.

**Fix:** Variable indirection + `@vite-ignore`:

```js
var pkg = 'esbuild-wasm';
esbuildModule = await import(/* @vite-ignore */ pkg);
```

### Bug 10: iframe internal CSS incomplete

**File:** `packages/ui/src/blocks/CodeBlockInteractive.jsx`

Set `html { margin:0; padding:0 }` and `body { margin:0; padding:0; overflow:hidden }` inside iframe srcdoc to prevent internal scrollbars while allowing body scrollHeight to be measured.

### Bug 11: Big HTML code clipped — height measurement unreliable

**File:** `packages/ui/src/blocks/CodeBlockInteractive.jsx`

Previous height script only observed `document.body` with `body.scrollHeight` and polled every 500ms indefinitely. For big code (3000px+) with images, fonts, Tailwind recalc, it reported `400px` initial then intermittently correct, but parent had no way to distinguish multiple iframes (cross-talk).

**Fix:**
- Unique `blockId` per instance (`cb-xxxxx`), sent with postMessage and verified on parent
- Parent verifies `event.data.id === blockId` or `event.source === iframe.contentWindow`
- Height calc: `Math.max(body.scrollHeight, body.offsetHeight, docEl.scrollHeight, docEl.offsetHeight)`
- Observe **both** `document.documentElement` and `document.body` with ResizeObserver
- Add `MutationObserver` on `documentElement` (childList, subtree, attributes)
- Listen for `load`, `resize`, `document.fonts.ready`
- Polling `setInterval 250ms ×20` + `setTimeout` at 0/100/500/1000/2000ms — guarantees big content (5000px+) is measured even if Tailwind/images load late
- React wrapper: `return <div className="relative w-full bg-transparent"><Component {...props} /></div>` ensures width
- HTML wrapper: `return <div className="relative w-full bg-transparent"><iframe ... loading="lazy" /></div>` + `style: width:100% minWidth:100% display:block height:400px`
- Added `overflow-visible` to post-web breakout wrapper so tall iframe never clipped by ancestors

## Render tree (post-web, after fixes)

```
1280px outer container (max-w-7xl)
  └─ 960px reading-column
       ├─ Text blocks: 960px
       ├─ Code blocks: BREAK OUT → min(1280px, 100vw - 2rem)
       └─ Other blocks: 960px
```

## Files changed

| File | Change |
|------|--------|
| `packages/ui/src/blocks/CodeBlockInteractive.jsx` | IIFE compile, extractModule, 400px height, iframe styling |
| `packages/ui/src/blocks/ContentRenderer.jsx` | Added code-block-interactive with breakout |
| `apps/post-web/src/app/globals.css` | reading-column 680→960px |
| `apps/post-web/src/components/content/content-renderer.tsx` | Code block breakout wrapper |
| `apps/post-web/src/app/share/[token]/page.tsx` | Width 680→960px |
| `apps/work-web/src/components/project/ContentBlockRenderer.tsx` | Added full-width wrapper |
| `docs/code-block-interactive-width-fix.md` | Documentation |

## Verification

1. `npx tsc --noEmit` — all 3 apps pass
2. Deploy to Vercel
3. Post page with code-block-interactive: iframe spans ~1280px on desktop
4. Work page with code-block-interactive: iframe spans ~1800px
5. Share page: content at 960px
6. Admin preview: unchanged (full-screen portal)
