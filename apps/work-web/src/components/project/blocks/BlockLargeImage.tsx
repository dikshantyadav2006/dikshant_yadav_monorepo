'use client';

import { motion } from 'framer-motion';

interface BlockLargeImageProps {
  src: string;
  alt: string;
  height?: string;
}

export default function BlockLargeImage({ src, alt, height = '700px' }: BlockLargeImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-1"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain md:h-[var(--img-h)] md:object-cover"
        style={{ '--img-h': height } as React.CSSProperties}
      />
    </motion.div>
  );
}
