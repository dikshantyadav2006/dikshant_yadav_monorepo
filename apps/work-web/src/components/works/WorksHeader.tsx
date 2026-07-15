'use client';

import { motion } from 'framer-motion';

export default function WorksHeader() {
  return (
    <section className="pt-[120px] pb-[60px] px-1">
      <div className="flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-baseline gap-4"
        >
          <span className="font-sans text-[14px] tracking-[0.15em] uppercase opacity-40">
            *
          </span>
          <span className="font-script text-[clamp(60px,8vw,170px)] leading-none italic">
            All
          </span>
          <span className="font-sans text-[14px] tracking-[0.15em] uppercase opacity-40">
            *
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-display text-[clamp(80px,14vw,320px)] leading-[0.85] tracking-[-0.08em] uppercase"
        >
          WORKS
        </motion.h1>
      </div>
    </section>
  );
}
