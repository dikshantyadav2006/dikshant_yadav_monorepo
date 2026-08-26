# Code Block Interactive — Width Fix

## Problem

The `code-block-interactive` block rendered correctly in admin-web (CodeStudio) but appeared narrow (~400-680px) with clipped content on post-web and work-web public pages.

## Root Cause

### 1. `reading-column` constrained all article content to 680px

```css
/* apps/post-web/src/app/globals.css */
.reading-column {
  @apply max-w-[680px] mx-auto;
}
```

Every block inside the article (text, images, code) was capped at 680px. Code blocks had no mechanism to break out.

### 2. Admin-web bypassed this constraint entirely

Admin-web's CodeStudio renders as a **full-screen portal**:

```tsx
// apps/admin-web/src/components/shared/CodeStudio.tsx:265
<div className="fixed inset-0 z-[999999] flex flex-col bg-background">
```

The iframe gets full viewport width — no `reading-column`, no grid, no max-width.

### 3. Code block wrapper had no breakout pattern

Full-width images used `relative left-1/2 -translate-x-1/2` to break out of the reading column. Code blocks used a generic wrapper with no breakout.

```tsx
// BEFORE — stuck inside 680px column
<div key={key} style={styles.style} className={styles.className}>
  <CodeBlockInteractive data={block.data} />
</div>
```

## Solution

### Change 1: Widen `reading-column` from 680px → 960px

**File:** `apps/post-web/src/app/globals.css:147`

```css
.reading-column {
  @apply max-w-[960px] mx-auto;
}
```

All article content now has 960px of reading width (was 680px).

### Change 2: Code blocks break out of the reading column

**File:** `apps/post-web/src/components/content/content-renderer.tsx:176-181`

```tsx
case 'code-block-interactive':
  return (
    <div
      key={key}
      style={{
        ...styles.style,
        width: 'min(1280px, calc(100vw - 2rem))',
      }}
      className="relative left-1/2 -translate-x-1/2"
    >
      <CodeBlockInteractive data={block.data} />
    </div>
  );
```

Uses the same CSS breakout pattern as full-width images:
- `left-1/2 -translate-x-1/2` — shifts element to center then pulls it back
- `width: min(1280px, calc(100vw - 2rem))` — caps at outer container width (1280px), never exceeds viewport

### Result

```
Viewport
  └─ max-w-7xl (1280px) container
       └─ reading-column (960px)
            ├─ Text blocks: 960px
            ├─ Code blocks: BREAK OUT → 1280px (full outer container)
            └─ Other blocks: 960px
```

On desktop: code block = 1280px wide (matches admin-web full-screen portal width)
On mobile: code block = `100vw - 2rem` (full viewport minus padding)

## Render Tree Comparison

### Before (broken)

```
1280px container
  └─ 680px reading-column
       └─ code block: 680px max ← iframe cramped, content clipped
```

### After (fixed)

```
1280px container
  └─ 960px reading-column
       └─ code block: BREAKS OUT → 1280px ← iframe full width
```

## Files Changed

| File | Change |
|------|--------|
| `apps/post-web/src/app/globals.css` | `reading-column` 680px → 960px |
| `apps/post-web/src/components/content/content-renderer.tsx` | Code block wrapper: add breakout pattern |

## No Changes Needed

| File | Why |
|------|-----|
| `packages/ui/src/blocks/CodeBlockInteractive.jsx` | iframe already has `width: '100%'` — fills whatever container it's in |
| `apps/work-web/src/components/project/ContentBlockRenderer.tsx` | Work-web uses `max-w-[1800px]` container with no reading-column — already full width |

## Verification

1. Run `npx tsc --noEmit` in post-web, work-web, admin-web
2. Deploy to Vercel
3. On a post page with a code-block-interactive block:
   - Desktop: iframe should span ~1280px (full outer container)
   - Mobile: iframe should span full viewport minus padding
   - Height should auto-grow based on content
   - No internal scrollbars
