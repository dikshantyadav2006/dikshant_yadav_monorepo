'use client';

import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="py-[80px] md:py-[120px] text-center"
    >
      <div className="flex items-center justify-center gap-6">
        <span className="w-2 h-2 rounded-full bg-[var(--text)]" />
        <p className="font-script italic text-[clamp(28px,4vw,50px)] leading-none">
          {title}
        </p>
        <span className="w-2 h-2 rounded-full bg-[var(--text)]" />
      </div>
      {subtitle && (
        <p className="font-sans text-[11px] md:text-[12px] uppercase tracking-[0.25em] opacity-40 mt-4">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
