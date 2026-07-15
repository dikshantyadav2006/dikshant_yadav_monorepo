'use client';

import { motion } from 'framer-motion';

interface BlockBannerProps {
  src: string;
  alt: string;
  height?: string;
}

export default function BlockBanner({ src, alt, height = '350px' }: BlockBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-1"
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full object-cover"
        style={{ height }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
