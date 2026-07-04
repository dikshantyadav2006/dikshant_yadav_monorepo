'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const [value, setValue] = useState<number>(defaultValue);

  useEffect(() => {
    const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
    setValue(get);

    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries, values, defaultValue]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

interface ImageDim {
  naturalWidth: number;
  naturalHeight: number;
}

const preloadImageDims = async (urls: string[]): Promise<Map<string, ImageDim>> => {
  const map = new Map<string, ImageDim>();
  await Promise.all(
    urls.map(
      src =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            map.set(src, { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
            resolve();
          };
          img.onerror = () => {
            map.set(src, { naturalWidth: 1, naturalHeight: 1 });
            resolve();
          };
        })
    )
  );
  return map;
};

interface Item {
  id: string;
  img: string;
  url: string;
}

interface GridItem {
  id: string;
  img: string;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: Item[];
  className?: string;
  gap?: number;
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

const Masonry: React.FC<MasonryProps> = ({
  items,
  className,
  gap = 16,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [dims, setDims] = useState<Map<string, ImageDim> | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    setDims(null);
    setImagesLoaded(false);
    preloadImageDims(items.map(i => i.img)).then(map => {
      setDims(map);
      setImagesLoaded(true);
    });
  }, [items]);

  const grid = useMemo<GridItem[]>(() => {
    if (!width || !dims) return [];
    const colHeights = new Array(columns).fill(0);
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    const result = items.map(child => {
      const d = dims.get(child.img);
      const aspectRatio = d ? d.naturalWidth / d.naturalHeight : 1;
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const h = columnWidth / aspectRatio;
      const y = colHeights[col];

      colHeights[col] += h + gap;
      return { ...child, x, y, w: columnWidth, h };
    });

    return result;
  }, [columns, items, width, dims, gap]);

  const containerHeight = useMemo(() => {
    if (!grid.length) return 0;
    const colHeights = new Array(columns).fill(0);
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    for (const child of items) {
      const d = dims?.get(child.img);
      const aspectRatio = d ? d.naturalWidth / d.naturalHeight : 1;
      const col = colHeights.indexOf(Math.min(...colHeights));
      const h = columnWidth / aspectRatio;
      colHeights[col] += h + gap;
    }

    return Math.max(...colHeights) - gap;
  }, [grid, columns, items, width, dims, gap]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesLoaded) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const containerRect = containerRef.current?.getBoundingClientRect();

        let direction = animateFrom;
        if (animateFrom === 'random') {
          const dirs = ['top', 'bottom', 'left', 'right'];
          direction = dirs[Math.floor(Math.random() * dirs.length)] as typeof animateFrom;
        }

        let startX = item.x;
        let startY = item.y;
        if (containerRect) {
          switch (direction) {
            case 'top':
              startX = item.x; startY = -200; break;
            case 'bottom':
              startX = item.x; startY = window.innerHeight + 200; break;
            case 'left':
              startX = -200; startY = item.y; break;
            case 'right':
              startX = window.innerWidth + 200; startY = item.y; break;
            case 'center':
              startX = containerRect.width / 2 - item.w / 2;
              startY = containerRect.height / 2 - item.h / 2;
              break;
            default:
              startX = item.x; startY = item.y + 100;
          }
        }

        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: startX,
            y: startY,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' })
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger
          }
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: 'auto'
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesLoaded, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (id: string) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = (id: string) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      style={{ height: containerHeight > 0 ? containerHeight : 'auto' }}
    >
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute overflow-hidden cursor-pointer rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)]"
          style={{ willChange: 'transform, width, height, opacity' }}
          onClick={() => window.open(item.url, '_blank', 'noopener')}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
        >
          <img
            src={item.img}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
          {colorShiftOnHover && (
            <div className="absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none transition-opacity duration-300 hover:opacity-30" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Masonry;
