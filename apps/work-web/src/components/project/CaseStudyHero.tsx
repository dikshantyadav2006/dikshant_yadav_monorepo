'use client';

import { motion } from 'framer-motion';

interface CaseStudyHeroProps {
  image: string;
  title: string;
  subtitle: string;
}

export default function CaseStudyHero({ image, title, subtitle }: CaseStudyHeroProps) {
  return (
    <section className="w-full">
      <div className="w-full max-w-[90vw] max-w-[1400px] mx-auto overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-auto object-cover"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="text-center pt-[40px] md:pt-[60px] pb-[20px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-[24px] opacity-60">*</span>
            <span className="font-script italic text-[clamp(36px,5vw,72px)] leading-none">
              {title}
            </span>
            <span className="text-[24px] opacity-60">*</span>
          </div>

          <p className="font-sans text-[11px] md:text-[12px] uppercase tracking-[0.25em] opacity-40 mb-3">
            Featured Work
          </p>

          <h1 className="font-display text-[clamp(40px,7vw,96px)] leading-[0.85] uppercase tracking-[-0.04em] font-black">
            {title}
          </h1>

          <p className="font-sans text-[12px] md:text-[14px] uppercase tracking-[0.15em] opacity-40 mt-3">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
