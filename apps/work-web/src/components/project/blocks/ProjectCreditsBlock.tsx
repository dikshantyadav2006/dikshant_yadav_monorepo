'use client';

import { motion } from 'framer-motion';
import type { ProjectCreditBlockItem } from '@dikshant/types';

interface ProjectCreditsBlockProps {
  eyebrow?: string;
  title?: string;
  headingLabel?: string;
  heading?: string;
  year?: string;
  items?: ProjectCreditBlockItem[];
}

const CARD_VARIANTS: Record<string, { span: string; text: string }> = {
  script: {
    span: 'md:col-span-5',
    text: 'font-script italic text-[clamp(32px,4vw,64px)] leading-none',
  },
  condensed: {
    span: 'md:col-span-7',
    text: 'font-condensed text-[clamp(48px,6vw,100px)] leading-[0.9] uppercase',
  },
  mono: {
    span: 'md:col-span-4',
    text: 'font-mono text-[18px] md:text-[24px] break-all',
  },
};

export default function ProjectCreditsBlock({
  eyebrow = 'Project Metadata',
  title = 'Credits',
  headingLabel = 'Project Credits',
  heading = 'Crafted With\nPrecision',
  year = '',
  items = [],
}: ProjectCreditsBlockProps) {
  return (
    <section className="min-h-screen mt-[10vh] flex flex-col justify-between px-1 py-[60px] md:py-[80px]">
      {/* Huge Credits Title */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 mb-6">{eyebrow}</p>
          <h2 className="font-script italic text-[clamp(100px,18vw,240px)] leading-[0.85]">
            {title}
          </h2>
        </div>
      </motion.div>

      {/* Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[1px] bg-border mt-[80px]">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-12 bg-bg p-8 md:p-14 border-b border-border"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 mb-6">{headingLabel}</p>
          <h3 className="font-display text-[clamp(48px,8vw,140px)] leading-[0.85] tracking-[-0.06em] uppercase whitespace-pre-line">
            {heading}
          </h3>
        </motion.div>

        {/* Credit Items */}
        {items.map((item, index) => {
          const variant = CARD_VARIANTS[item.variant] || CARD_VARIANTS.script;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 * (index + 1) }}
              whileHover={{ y: -6 }}
              className={`${variant.span} bg-bg p-8 md:p-10 relative overflow-hidden group`}
            >
              <span className="absolute right-6 top-4 font-display text-[120px] opacity-[0.04] leading-none">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 mb-6">{item.label}</p>
              <p className={`${variant.text} group-hover:bg-[#ece9e1] transition-all duration-500 inline`}>
                {item.value || '—'}
              </p>
            </motion.div>
          );
        })}

        {/* Year */}
        {year && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
            className="md:col-span-8 bg-bg p-8 md:p-10 flex items-end justify-between"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 mb-4">Year</p>
              <h3 className="font-display text-[clamp(80px,10vw,180px)] leading-none tracking-[-0.08em]">
                {year}
              </h3>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
