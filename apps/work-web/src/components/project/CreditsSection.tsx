'use client';

import { motion } from 'framer-motion';
import { ProjectCredit } from '@/types/project';

interface CreditsSectionProps {
  credits: ProjectCredit[];
}

export default function CreditsSection({ credits }: CreditsSectionProps) {
  return (
    <section className="py-[80px] md:py-[120px]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-6 mb-[60px]">
          <div className="h-[1px] w-[60px] bg-border" />
          <p className="font-script italic text-[clamp(28px,4vw,50px)] leading-none">
            Credits
          </p>
          <div className="h-[1px] w-[60px] bg-border" />
        </div>

        <div className="flex flex-col items-center gap-[24px]">
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
              <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mb-1">
                {credit.role}
              </p>
              <p className="font-sans text-[15px] md:text-[17px]">
                {credit.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
