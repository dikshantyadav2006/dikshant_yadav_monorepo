'use client';

import { motion } from 'framer-motion';

interface AboutSectionProps {
  overview: string;
}

export default function AboutSection({ overview }: AboutSectionProps) {
  return (
    <section className="py-[60px] md:py-[80px] px-1">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-[40px]">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-condensed text-[clamp(140px,12vw,260px)] leading-[0.85] uppercase tracking-[-0.04em] font-black">
            About
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="flex flex-col justify-center"
        >
          <p className="font-script italic text-[clamp(24px,3vw,40px)] mb-6">
            The Project
          </p>
          <p className="font-sans text-[15px] md:text-[17px] leading-[1.8] opacity-60 max-w-[500px]">
            {overview}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
