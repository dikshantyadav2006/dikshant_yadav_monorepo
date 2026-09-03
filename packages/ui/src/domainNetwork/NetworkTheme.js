import { createContext, useContext } from 'react';

/**
 * Themed color tokens for the domain network.
 *
 * The network is a self-contained "stage": a strong background canvas with
 * contrasting foreground text, tile surfaces and hairline dividers. Every
 * color is derived from the active section theme (`--dark-color` on the
 * wrapper drives dark mode, `--light-color` drives light mode) so the panel
 * adapts automatically to both site modes.
 */
let FALLBACK = {
  dark: '#121315',
  light: '#121315',
};

export function resolveNetworkTheme(rootEl) {
  let dark = '#121315';
  let light = '#121315';
  if (rootEl && typeof getComputedStyle === 'function') {
    const cs = getComputedStyle(rootEl);
    const d = cs.getPropertyValue('--dark-color').trim();
    const l = cs.getPropertyValue('--light-color').trim();
    if (d) dark = d;
    if (l) light = l;
  }
  return { dark, light };
}

/**
 * Convert a theme color (hex) into a full palette of text / surface tones.
 * Assumes the given canvas color, and derives readable foreground colors.
 */
export function buildPalette(canvas, accent) {
  const isDarkCanvas = luminance(canvas) < 0.4;
  const textPrimary = isDarkCanvas ? '#ffffff' : '#111111';
  const textSecondary = isDarkCanvas ? 'rgba(255,255,255,0.62)' : 'rgba(17,17,17,0.62)';
  const textMuted = isDarkCanvas ? 'rgba(255,255,255,0.38)' : 'rgba(17,17,17,0.42)';
  const surface = isDarkCanvas ? 'rgba(255,255,255,0.035)' : 'rgba(17,17,17,0.035)';
  const surfaceHover = isDarkCanvas ? 'rgba(255,255,255,0.07)' : 'rgba(17,17,17,0.06)';
  const border = isDarkCanvas ? 'rgba(255,255,255,0.10)' : 'rgba(17,17,17,0.12)';
  const line = isDarkCanvas ? 'rgba(255,255,255,0.14)' : 'rgba(17,17,17,0.18)';
  return {
    canvas,
    textPrimary,
    textSecondary,
    textMuted,
    surface,
    surfaceHover,
    border,
    line,
    accent,
  };
}

function luminance(hex) {
  const clean = String(hex || '#000').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export const NetworkThemeContext = createContext(buildPalette(FALLBACK.dark, '#8b5cf6'));

export const useNetworkTheme = () => useContext(NetworkThemeContext);
