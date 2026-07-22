'use client';

import { useState } from 'react';
import TransitionLink from '@/components/ui/transition/TransitionLink';
import { motion } from 'framer-motion';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.08,
      }}
      className="group relative h-[400px] md:h-[560px] overflow-hidden bg-[#ddd]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'none' }}
    >
      <TransitionLink href={`/project/${project.slug}`} className="block w-full h-full">
        {/* Project Number */}
        <span className="absolute top-4 right-6 z-10 font-display text-[60px] md:text-[80px] leading-none text-white/15 select-none pointer-events-none">
          {project.id}
        </span>

        {/* Image */}
        <motion.img
          src={project.image}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.03 : 1,
          }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        />

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-black pointer-events-none"
          animate={{ opacity: isHovered ? 0.05 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Project Info — slides up on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pointer-events-none"
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-display text-white text-[18px] md:text-[22px] uppercase tracking-[0.05em] mb-1">
            {project.title}
          </h3>
          <p className="font-sans text-white/70 text-[12px] md:text-[13px] uppercase tracking-[0.12em]">
            {project.category}
          </p>
          {project.techStack && project.techStack.length > 0 && (
            <p className="font-sans text-white/50 text-[11px] uppercase tracking-[0.1em] mt-2">
              {project.techStack.join(' \u2022 ')}
            </p>
          )}
        </motion.div>
      </TransitionLink>
    </motion.div>
  );
}
