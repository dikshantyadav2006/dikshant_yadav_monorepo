import { useRef, useEffect } from 'react';
import './MagnetLines.css';

export default function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = '80vmin',
  lineColor = '#efefef',
  lineWidth = '1vmin',
  lineHeight = '6vmin',
  baseAngle = -10,
  className = '',
  style = {}
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll('span'));
    if (!items.length) return;

    let rects: { cx: number; cy: number }[] = [];
    let rafId = 0;
    let px = 0;
    let py = 0;
    let dirty = true;

    function cacheRects() {
      rects = items.map(el => {
        const r = el.getBoundingClientRect();
        return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
      });
    }

    function apply() {
      rafId = 0;
      if (!dirty) return;
      dirty = false;

      for (let i = 0; i < items.length; i++) {
        const { cx, cy } = rects[i];
        const b = px - cx;
        const a = py - cy;
        const c = Math.sqrt(a * a + b * b) || 1;
        const r = ((Math.acos(b / c) * 180) / Math.PI) * (py > cy ? 1 : -1);
        items[i].style.transform = `rotate(${r}deg)`;
      }
    }

    function schedule() {
      dirty = true;
      if (!rafId) rafId = requestAnimationFrame(apply);
    }

    function onPointerMove(e: PointerEvent) {
      px = e.clientX;
      py = e.clientY;
      schedule();
    }

    cacheRects();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', cacheRects, { passive: true });

    const mid = items[Math.floor(items.length / 2)].getBoundingClientRect();
    px = mid.x + mid.width / 2;
    py = mid.y + mid.height / 2;
    schedule();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', cacheRects);
    };
  }, [rows, columns]);

  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => (
    <span
      key={i}
      style={{
        transform: `rotate(${baseAngle}deg)`,
        backgroundColor: lineColor,
        width: lineWidth,
        height: lineHeight
      }}
    />
  ));

  return (
    <div
      ref={containerRef}
      className={`magnetLines-container ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style
      }}
    >
      {spans}
    </div>
  );
}
