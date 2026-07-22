'use client';

import TransitionLink from '@/components/ui/transition/TransitionLink';
import { motion } from 'framer-motion';
import { Project } from '@/types/project';

interface ProjectNavProps {
  prev: Project | null;
  next: Project | null;
}

export default function ProjectNav({ prev, next }: ProjectNavProps) {
  return (
    <section className="px-1 py-[80px] md:py-[120px] border-t border-border">
      <div className="grid grid-cols-2 gap-[4px]">
        {prev ? (
          <TransitionLink href={`/project/${prev.slug}`} className="group block p-6 md:p-10">
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] opacity-40 mb-3">
                ← Previous
              </p>
              <p className="font-display text-[20px] md:text-[28px] uppercase tracking-[-0.02em]">
                {prev.title}
              </p>
            </motion.div>
          </TransitionLink>
        ) : (
          <div />
        )}

        {next ? (
          <TransitionLink
            href={`/project/${next.slug}`}
            className="group block p-6 md:p-10 text-right"
          >
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] opacity-40 mb-3">
                Next →
              </p>
              <p className="font-display text-[20px] md:text-[28px] uppercase tracking-[-0.02em]">
                {next.title}
              </p>
            </motion.div>
          </TransitionLink>
        ) : (
          <div />
        )}
      </div>
    </section>
  );
}
