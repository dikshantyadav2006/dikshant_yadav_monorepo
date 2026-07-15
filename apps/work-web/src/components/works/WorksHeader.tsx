'use client';

import { motion } from 'framer-motion';

export default function WorksHeader() {
  return (
    <section className="pt-[120px] pb-[10px] px-1">
      <div className="grid grid-cols-[auto_1fr] items-end">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-12 pb-4"
        >
          <span className="text-[40px] leading-none opacity-80">*</span>
          <span className="font-script italic leading-none text-[clamp(90px,8vw,180px)] font-light">
            All
          </span>
          <span className="text-[40px] leading-none opacity-80">*</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="justify-self-end font-condensed uppercase leading-[0.78] tracking-[-0.04em] font-black text-[clamp(160px,18vw,420px)]"
        >
          WORKS
        </motion.h1>
      </div>
    </section>
  );
}
