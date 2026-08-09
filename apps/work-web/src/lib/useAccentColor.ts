'use client';

import { useEffect, useMemo, useState } from 'react';

export const DEFAULT_ACCENT = '#D2D8CB';

function rgbToHex(r: number, g: number, b: number) {
  return (
    '#' +
    [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
  );
}

/**
 * Resolves the accent color for a work:
 * - uses the admin-defined `swatchColor` when present,
 * - otherwise samples a dominant color from the hero image on the client.
 */
export function useAccentColor(
  swatchColor?: string | null,
  heroImageUrl?: string | null,
): { accent: string; isAuto: boolean } {
  const [sampled, setSampled] = useState<string | null>(null);

  useEffect(() => {
    if (swatchColor || !heroImageUrl) {
      setSampled(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = heroImageUrl;
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }
        if (count > 0) {
          setSampled(rgbToHex(r / count, g / count, b / count));
        }
      } catch {
        // Canvas tainted (cross-origin) — keep fallback accent.
      }
    };
    return () => {
      cancelled = true;
    };
  }, [swatchColor, heroImageUrl]);

  const accent = useMemo(() => {
    if (swatchColor) return swatchColor;
    return sampled || DEFAULT_ACCENT;
  }, [swatchColor, sampled]);

  return { accent, isAuto: !swatchColor };
}
