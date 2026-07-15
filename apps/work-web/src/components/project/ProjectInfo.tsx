'use client';

import { motion } from 'framer-motion';
import { Project } from '@/types/project';

interface ProjectInfoProps {
  project: Project;
}

export default function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <section className="px-1 py-[60px] md:py-[100px]">
      <div className="max-w-[900px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <p className="font-sans text-[11px] md:text-[12px] uppercase tracking-[0.2em] opacity-40 mb-6">
            {project.category} — {project.year}
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="font-display text-[40px] md:text-[64px] lg:text-[80px] leading-[0.9] tracking-[-0.03em] uppercase mb-8"
        >
          {project.title}
        </motion.h1>

        {project.description && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="font-sans text-[16px] md:text-[18px] leading-[1.7] opacity-60 max-w-[600px]"
          >
            {project.description}
          </motion.p>
        )}

        {project.techStack && project.techStack.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="font-sans text-[11px] uppercase tracking-[0.15em] px-4 py-2 border border-border"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
