'use client';

import { motion } from 'framer-motion';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

export default function WorksCTA() {
  return (
    <section className="pt-[180px] pb-[40px]">
      <AnimatedWrapper className="flex justify-center">
        <motion.div
          whileHover={{ x: 6 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="group"
        >
          <a
            href="mailto:hello@dikshantyadav.com"
            className="font-display text-[24px] md:text-[32px] font-bold uppercase tracking-[0.05em] inline-flex items-center gap-3"
          >
            START A PROJECT
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </motion.div>
      </AnimatedWrapper>
    </section>
  );
}
