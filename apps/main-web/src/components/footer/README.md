/**
 * FOOTER INTEGRATION GUIDE
 *
 * Quick Start:
 * -----------
 *
 * 1. Import the Footer component:
 *    import { Footer } from '@components/footer';
 *
 * 2. Add it to your app (wrapped in a themed Section):
 *    import { Section } from '@layout';
 *
 *    <Section id="footer">
 *      <Footer addCursor={...} removeCursor={...} cursorModes={...} isDarkMode={...} />
 *    </Section>
 *
 * FILE STRUCTURE:
 * ---------------
 *
 * /src/components/footer/
 *   ├── Footer.jsx              - Orchestrator: contact form + editorial footer + GSAP timeline
 *   ├── FooterBrand.jsx         - Massive centered name, word-wise wipe reveal (GSAP)
 *   ├── FooterNav.jsx           - Centered top nav row (About / Works / Posts / Contact)
 *   ├── FooterTaglines.jsx      - Small uppercase role descriptors
 *   ├── FooterContactLinks.jsx  - Email + socials with minimal underline hover
 *   ├── FooterStatement.jsx     - Full-width statement, word-by-word mask reveal
 *   ├── FooterBottom.jsx        - Copyright / built-with / legal row
 *   ├── MarbleBackground.jsx    - Interactive WebGL marble texture (lazy-loaded, R3F)
 *   ├── EditorialContactForm.jsx- "Let's work together" inquiry form
 *   └── index.js                - Barrel exports
 *
 * /src/constants/
 *   └── footerLinks.js          - All footer content (nav, contact, socials, legal)
 *
 * /src/constants/
 *   └── sectionThemes.js        - `footer` theme (dark: #121315 / light: #EEF4F4)
 *
 * /src/types/
 *   └── footer.js               - JSDoc type definitions
 *
 * CUSTOMIZATION:
 * ---------------
 *
 * Edit /src/constants/footerLinks.js to change:
 *   - Brand name + taglines
 *   - Statement text
 *   - Navigation links (About / Works / Posts / Contact)
 *   - Contact links (email, Instagram, GitHub, LinkedIn)
 *   - Legal links (Privacy / Terms)
 *   - Built-with line
 *
 * FEATURES:
 * ---------
 * ✓ Typography-first, ultra-minimal editorial layout
 * ✓ Interactive marble/stone texture (WebGL, mouse parallax, extremely subtle)
 * ✓ GSAP ScrollTrigger reveals (nav slide-up, text fades, statement mask)
 * ✓ Lazy-loaded Three.js — only fetched when the footer nears the viewport
 * ✓ Reduced-motion support (static texture, no movement)
 * ✓ 60fps / GPU-accelerated (transform + opacity only)
 * ✓ Mobile optimized (no parallax on coarse pointers, capped DPR)
 *
 * STYLING:
 * --------
 * - Background: #EEF4F4 (light) / #121315 (dark), per section theme
 * - Text: contrast of the same pair
 * - Font: font-p-1 (display), font-p-2 (mono, bottom row), font-p-3 (sans, nav/links)
 * - Letter-spacing: wide tracking on labels, tight negative tracking on display text
 *
 * ANIMATIONS:
 * -----------
 * - Navigation row slides upward slightly on entry
 * - Brand name wipes in word-by-word
 * - Taglines / contact links fade with slight y-offset
 * - Statement reveals word-by-word with clip-path masks
 * - Bottom row and divider fade in last
 */

export {};