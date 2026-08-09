'use client';

import { motion } from 'framer-motion';

interface MetricsItem {
  value: string;
  label: string;
}

interface BlockMetricsProps {
  items: MetricsItem[];
}

export default function BlockMetrics({ items }: BlockMetricsProps) {
  return (
    <section className="px-1 py-[60px] md:py-[80px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border">
        {items.map((item, i) => (
          <motion.div
            key={`${item.label}-${i}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.08,
            }}
            className="bg-bg p-8 md:p-10 flex flex-col items-start"
          >
            <span className="font-display text-[clamp(36px,5vw,72px)] leading-none tracking-[-0.04em]">
              {item.value}
            </span>
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mt-3">
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
