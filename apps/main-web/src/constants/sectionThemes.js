/**
 * Section Theme Palette
 *
 * Every scrollable "section" on the site can own its own background theme.
 * Each theme provides the two colors the site already uses everywhere:
 *
 *   dark  -> used as `--dark-color`  (background in dark mode / text in light mode)
 *   light -> used as `--light-color` (background in light mode / text in dark mode)
 *
 * The fixed background layer fades between these colors as you scroll so each
 * section gets its own look in dark AND light mode with smooth transitions.
 *
 * Add a key here and wrap any content in `<Section id="key">` to activate it.
 */
export const sectionThemes = {
  // Base / fallback — also used where no section is active
  default: {
    dark: '#091223',
    light: '#c9e7e7',
  },

  // Home hero — the cream canvas stays cream in both modes
  hero: {
    dark: '#F8F4E9',
    light: '#F8F4E9',
  },

  // Thinking note — bright mint in light, deep navy in dark
  thinking: {
    dark: '#0d1526',
    light: '#dff2f2',
  },

  // Domain network — always a near-black canvas
  network: {
    dark: '#121315',
    light: '#121315',
  },

  // Footer — refined charcoal in dark, porcelain in light
  footer: {
    dark: '#121315',
    light: '#EEF4F4',
  },

  // Connect page hero — cream in light, navy in dark
  connect: {
    dark: '#0d1526',
    light: '#F8F4E9',
  },

  // Services — near-black in dark, pale mint in light
  services: {
    dark: '#0a0f1a',
    light: '#e8eeee',
  },
};

export const defaultSectionTheme = sectionThemes.default;
