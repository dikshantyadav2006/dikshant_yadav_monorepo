'use client';

import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BentoCard {
  label: string;
  value: string;
  span?: number;
  rowSpan?: number;
}

interface ProjectBentoProps {
  story: string;
  client: string;
  year: string;
  services: string[];
  timeline: string;
  role: string;
  techStack: string[];
  results: string;
}

function BentoCardItem({ card, index }: { card: BentoCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLSpanElement>(null);
  const exitPos = useRef({ x: 50, y: 50 });
  const rafId = useRef<number>(0);
  const isLeaving = useRef(false);

  const getPercent = useCallback((clientX: number, clientY: number) => {
    if (!ref.current) return { x: 50, y: 50 };
    const rect = ref.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isLeaving.current) {
        cancelAnimationFrame(rafId.current!);
        isLeaving.current = false;
        const el = bgRef.current;
        if (el) {
          el.style.transition = 'none';
          el.style.transform = 'scale(1)';
          // Force reflow
          el.offsetHeight;
        }
      }
      const pos = getPercent(e.clientX, e.clientY);
      if (bgRef.current) {
        const el = bgRef.current;
        el.style.transition = 'none';
        el.style.transformOrigin = `${pos.x}% ${pos.y}%`;
        el.style.transform = 'scale(0)';
        // Force reflow
        el.offsetHeight;
        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = 'scale(1)';
      }
    },
    [getPercent]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const pos = getPercent(e.clientX, e.clientY);
      exitPos.current = pos;
      if (bgRef.current) {
        const el = bgRef.current;
        // Freeze at current state, then animate out from exit point
        el.style.transition = 'none';
        el.style.transform = 'scale(1)';
        el.offsetHeight; // reflow
        el.style.transformOrigin = `${pos.x}% ${pos.y}%`;
        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = 'scale(0)';
      }
      isLeaving.current = true;
      rafId.current = requestAnimationFrame(() => {
        setTimeout(() => {
          isLeaving.current = false;
        }, 420);
      });
    },
    [getPercent]
  );

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafId.current!);
    };
  }, []);

  const spanClass =
    card.span === 4
      ? 'md:col-span-4'
      : card.span === 6
      ? 'md:col-span-6'
      : card.span === 8
      ? 'md:col-span-8'
      : 'md:col-span-12';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.06,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative bg-bg p-[24px] md:p-[32px] flex flex-col justify-between overflow-hidden ${spanClass}`}
      style={{ gridRow: card.rowSpan ? `span ${card.rowSpan}` : undefined }}
    >
      {/* Static right border */}
      <span className="absolute right-0 top-0 h-full w-[1px] bg-border z-10" />

      {/* Animated background — enter from cursor, exit toward cursor */}
      <span
        ref={bgRef}
        className="absolute inset-0 bg-[#EAE8E3] pointer-events-none"
        style={{ transform: 'scale(0)', willChange: 'transform, transform-origin' }}
      />

      <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mb-4 relative z-10">
        {card.label}
      </p>
      <p className="font-display text-[clamp(18px,2.5vw,32px)] uppercase tracking-[-0.02em] font-bold leading-[1.1] relative z-10">
        {card.value}
      </p>
    </motion.div>
  );
}

export default function ProjectBento({
  story,
  client,
  year,
  services,
  timeline,
  role,
  techStack,
  results,
}: ProjectBentoProps) {
  const cards: BentoCard[] = [
    { label: 'Project Story', value: story, span: 8 },
    { label: 'Client', value: client, span: 4 },
    { label: 'Year', value: year, span: 4 },
    { label: 'Services', value: services.join(' / '), span: 8 },
    { label: 'Timeline', value: timeline, span: 6 },
    { label: 'Role', value: role, span: 6 },
    { label: 'Tech Stack', value: techStack.join(' / '), span: 12 },
    { label: 'Results', value: results, span: 12 },
  ];

  return (
    <section className="py-[60px] md:py-[80px] px-1">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[1px] bg-border">
        {cards.map((card, i) => (
          <BentoCardItem key={card.label} card={card} index={i} />
        ))}
      </div>
    </section>
  );
}
