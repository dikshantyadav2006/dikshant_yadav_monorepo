'use client';

import { useEffect, useState } from 'react';
import { cn, slugify } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll('article h2[id], article h3[id]'),
    );

    const tocItems: TocItem[] = headings.map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }));

    setItems(tocItems);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-24">
      <p className="dossier-label mb-4">Contents</p>
      <ul className="space-y-2 border-l-2 border-foreground/20">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                'block py-1 font-mono text-[11px] uppercase tracking-wide transition-colors hover:text-foreground',
                item.level === 3 ? 'pl-6' : 'pl-3',
                activeId === item.id
                  ? 'text-foreground font-bold border-l-2 border-foreground -ml-[2px]'
                  : 'text-muted-foreground',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function assignHeadingId(text: string): string {
  return slugify(text);
}
