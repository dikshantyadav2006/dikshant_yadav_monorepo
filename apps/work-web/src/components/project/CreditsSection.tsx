'use client';

import { motion } from 'framer-motion';
import { ProjectCredit } from '@/types/project';

interface CreditsSectionProps {
  credits: ProjectCredit[];
  year: string;
}

export default function CreditsSection({ credits, year }: CreditsSectionProps) {
  const creditMap = Object.fromEntries(credits.map((c) => [c.role.toLowerCase(), c.value]));

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
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 mb-6">
            Project Metadata
          </p>
          <h2 className="font-script italic text-[clamp(100px,18vw,240px)] leading-[0.85]">
            Credits
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
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 mb-6">
            Project Credits
          </p>
          <h3 className="font-display text-[clamp(48px,8vw,140px)] leading-[0.85] tracking-[-0.06em] uppercase">
            Crafted With
            <br />
            Precision
          </h3>
        </motion.div>

        {/* Art Direction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          whileHover={{ y: -6 }}
          className="md:col-span-5 bg-bg p-8 md:p-10 relative overflow-hidden group"
        >
          <span className="absolute right-6 top-4 font-display text-[120px] opacity-[0.04] leading-none">
            01
          </span>
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 mb-6">
            Art Direction
          </p>
          <p className="font-script italic text-[clamp(32px,4vw,64px)] leading-none group-hover:bg-[#ece9e1] transition-all duration-500 inline">
            {creditMap['art direction'] || creditMap['design'] || '—'}
          </p>
        </motion.div>

        {/* Web Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          whileHover={{ y: -6 }}
          className="md:col-span-7 bg-bg p-8 md:p-10 relative overflow-hidden group"
        >
          <span className="absolute right-6 top-4 font-display text-[120px] opacity-[0.04] leading-none">
            02
          </span>
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 mb-6">
            Web Design
          </p>
          <p className="font-condensed text-[clamp(48px,6vw,100px)] leading-[0.9] uppercase group-hover:bg-[#ece9e1] transition-all duration-500 inline">
            {creditMap['web design'] || creditMap['design'] || '—'}
          </p>
        </motion.div>

        {/* Development */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          whileHover={{ y: -6 }}
          className="md:col-span-4 bg-bg p-8 md:p-10 group"
        >
          <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 mb-6">
            Development
          </p>
          <p className="font-mono text-[18px] md:text-[24px] break-all group-hover:bg-[#ece9e1] transition-all duration-500 inline">
            {creditMap['development'] || '—'}
          </p>
        </motion.div>

        {/* Year */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
          className="md:col-span-8 bg-bg p-8 md:p-10 flex items-end justify-between"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-40 mb-4">
              Year
            </p>
            <h3 className="font-display text-[clamp(80px,10vw,180px)] leading-none tracking-[-0.08em]">
              {year}
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
