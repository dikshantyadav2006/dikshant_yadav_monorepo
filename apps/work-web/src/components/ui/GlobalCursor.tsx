'use client';

import { useEffect, useState } from 'react';
import { DirectionalCursor } from '@dikshant/ui';

interface CursorStyle {
  label: string;
  rotation: number;
  arrowRotation: number;
  scaled: boolean;
}

const IDLE: CursorStyle = { label: 'Scroll', rotation: 0, arrowRotation: 0, scaled: false };

function hoverStyle(target: EventTarget | null): CursorStyle | null {
  if (!(target instanceof Element)) return null;

  const el = target.closest<HTMLElement>(
    'a[href], button, [role="button"], [data-cursor-prev], [data-cursor-next]',
  );
  if (!el) return null;

  if (el.hasAttribute('data-cursor-prev')) {
    return { label: 'Prev', rotation: 90, arrowRotation: 0, scaled: true };
  }
  if (el.hasAttribute('data-cursor-next')) {
    return { label: 'Next', rotation: -90, arrowRotation: 0, scaled: true };
  }
  return { label: 'View', rotation: 0, arrowRotation: 0, scaled: true };
}

export default function GlobalCursor() {
  const [style, setStyle] = useState<CursorStyle>(IDLE);

  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const next = hoverStyle(e.target);
      setStyle(next ?? IDLE);
    };
    document.addEventListener('mouseover', onOver);
    return () => document.removeEventListener('mouseover', onOver);
  }, []);

  return (
    <DirectionalCursor
      active
      label={style.label}
      rotation={style.rotation}
      arrowRotation={style.arrowRotation}
      scaled={style.scaled}
    />
  );
}