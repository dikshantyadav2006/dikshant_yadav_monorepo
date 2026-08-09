import { useEffect, useMemo } from 'react';
import { useSectionBackground } from './SectionBackgroundProvider';
import { sectionThemes, defaultSectionTheme } from '@/constants/sectionThemes';

/**
 * Section
 *
 * A scroll-aware wrapper that gives a block of content its own theme.
 *
 * - Registers `id` with the SectionBackgroundProvider so the fixed background
 *   layer fades to this section's colors while it is on screen.
 * - Scopes the site's `--dark-color` / `--light-color` CSS variables to this
 *   subtree, so every child using the standard
 *   `text-[--dark-color] dark:text-[--light-color]` pattern adapts to the
 *   section theme automatically (in both dark and light mode).
 *
 * @param {Object}  props
 * @param {string}  props.id - theme key from constants/sectionThemes
 * @param {Object}  [props.theme] - inline theme override `{ dark, light }`
 * @param {string}  [props.className]
 * @param {string|Function} [props.as='section'] - rendered tag
 */
function Section({ id, theme, className = '', as: Tag = 'section', children }) {
  const context = useSectionBackground();

  const colors = useMemo(() => {
    if (theme && theme.dark && theme.light) return theme;
    return sectionThemes[id] || defaultSectionTheme;
  }, [theme, id]);

  useEffect(() => {
    if (!context) return undefined;
    const { registerSection, unregisterSection } = context;
    registerSection(id);
    return () => unregisterSection(id);
  }, [id, context]);

  return (
    <Tag
      data-section-theme={id}
      className={className}
      style={{
        '--dark-color': colors.dark,
        '--light-color': colors.light,
      }}
    >
      {children}
    </Tag>
  );
}

export default Section;
