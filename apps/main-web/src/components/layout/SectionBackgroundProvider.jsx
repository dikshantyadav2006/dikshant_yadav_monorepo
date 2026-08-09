import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { sectionThemes, defaultSectionTheme } from '@/constants/sectionThemes';

const SectionBackgroundContext = createContext(null);

export const useSectionBackground = () => useContext(SectionBackgroundContext);

/**
 * SectionBackgroundProvider
 *
 * Renders the single fixed background layer that drives the site's dynamic
 * "per-section theme" background.
 *
 * How it works:
 * - Every `<Section id="...">` registers its id here.
 * - A native scroll handler finds whichever section currently sits at the
 *   vertical midline of the viewport (LocomotiveScroll v5 is Lenis-based, so
 *   native `window` scroll advances normally).
 * - The fixed layer fades its background to that section's theme color for the
 *   active dark/light mode. It also syncs `document.body` so overscroll edges
 *   never flash a stale/transparent color.
 *
 * @param {boolean} isDarkMode - active site-wide mode
 * @param {string}  defaultTheme - theme key used until a section is active
 */
function SectionBackgroundProvider({
  isDarkMode,
  defaultTheme = 'default',
  children,
}) {
  const sectionsRef = useRef(new Map());
  const [activeId, setActiveId] = useState(null);

  const registerSection = useCallback((id) => {
    sectionsRef.current.set(id, true);
  }, []);

  const unregisterSection = useCallback((id) => {
    sectionsRef.current.delete(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.5;
      let found = null;

      // Deepest section whose top edge has passed the viewport midline.
      // getBoundingClientRect is viewport-relative, so this is scroll-mechanism
      // agnostic (native scroll, Lenis, transforms — all handled).
      sectionsRef.current.forEach((_, id) => {
        const el = document.querySelector(`[data-section-theme="${id}"]`);
        if (!el) return;
        if (el.getBoundingClientRect().top <= mid) found = id;
      });

      if (found !== null) {
        setActiveId((prev) => (prev === found ? prev : found));
      }
    };

    const onResize = () => onScroll();
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const colors = useMemo(() => {
    const theme = (activeId && sectionThemes[activeId]) || sectionThemes[defaultTheme] || defaultSectionTheme;
    return theme;
  }, [activeId, defaultTheme]);

  const backgroundColor = isDarkMode ? colors.dark : colors.light;

  // Keep <body> in sync so overscroll / short pages never show transparent gaps
  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [backgroundColor]);

  const value = useMemo(
    () => ({
      isDarkMode,
      activeId,
      registerSection,
      unregisterSection,
    }),
    [isDarkMode, activeId, registerSection, unregisterSection],
  );

  return (
    <SectionBackgroundContext.Provider value={value}>
      {/* Fixed dynamic background layer */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundColor,
          transition: 'background-color 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {children}
    </SectionBackgroundContext.Provider>
  );
}

export default SectionBackgroundProvider;
