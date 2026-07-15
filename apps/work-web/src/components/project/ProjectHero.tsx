'use client';

import { motion } from 'framer-motion';

interface ProjectHeroProps {
  image: string;
  title: string;
}

export default function ProjectHero({ image, title }: ProjectHeroProps) {
  return (
    <section className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
      <motion.img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
    </section>
  );
}
