'use client';

import { motion } from 'framer-motion';

interface BlockPostersProps {
  images: [string, string];
  alts: [string, string];
  height?: string;
}

export default function BlockPosters({ images, alts, height = '600px' }: BlockPostersProps) {
  return (
    <div className="grid grid-cols-2 gap-[10px] px-1 max-w-[900px] mx-auto">
      {images.map((src, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: i * 0.1,
          }}
        >
          <motion.img
            src={src}
            alt={alts[i]}
            className="w-full object-cover"
            style={{ height }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      ))}
    </div>
  );
}
