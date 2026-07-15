'use client';

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
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.06,
            }}
            className={`bg-bg p-[24px] md:p-[32px] flex flex-col justify-between group hover:bg-[#EAE8E3] transition-colors duration-300 ${
              card.span === 4
                ? 'md:col-span-4'
                : card.span === 6
                ? 'md:col-span-6'
                : card.span === 8
                ? 'md:col-span-8'
                : 'md:col-span-12'
            }`}
            style={{
              gridRow: card.rowSpan ? `span ${card.rowSpan}` : undefined,
            }}
          >
            <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mb-4">
              {card.label}
            </p>
            <p className="font-display text-[clamp(18px,2.5vw,32px)] uppercase tracking-[-0.02em] font-bold leading-[1.1]">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
