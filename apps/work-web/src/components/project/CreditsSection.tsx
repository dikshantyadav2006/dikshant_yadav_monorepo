'use client';

import { motion } from 'framer-motion';
import { ProjectCredit } from '@/types/project';

interface CreditsSectionProps {
  credits: ProjectCredit[];
}

export default function CreditsSection({ credits }: CreditsSectionProps) {
  return (
    <section className="py-[60px] md:py-[80px]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-6 mb-[60px]">
          <div className="h-[1px] w-[80px] bg-border" />
          <p className="font-script italic text-[48px] leading-none">
            Credits
          </p>
          <div className="h-[1px] w-[80px] bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] max-w-[800px] mx-auto">
          {credits.map((credit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.08,
              }}
              className="text-center"
            >
              <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mb-2">
                {credit.role}
              </p>
              <p className="font-sans text-[16px] md:text-[18px]">
                {credit.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
