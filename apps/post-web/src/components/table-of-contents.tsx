'use client';

import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const headingElements = article.querySelectorAll('h2, h3');
    const items: TOCItem[] = Array.from(headingElements).map((el) => {
      if (!el.id) {
        el.id = el.textContent
          ?.toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '') || '';
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      };
    });

    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find first element that is intersecting from the top
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        On This Page
      </h3>
      <ul className="space-y-2.5 text-[13px]">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.level === 3 ? '12px' : '0px' }}
          >
            <a
              href={`#${heading.id}`}
              className={`block transition-all duration-200 hover:text-foreground/90 ${
                activeId === heading.id
                  ? 'text-accent font-medium border-l-2 border-accent pl-2 -ml-[10px]'
                  : 'text-muted-foreground'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
export default TableOfContents;
