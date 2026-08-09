'use client';

import { motion } from 'framer-motion';

interface BlockVideoProps {
  src: string;
  title?: string;
  poster?: string;
}

export default function BlockVideo({ src, title, poster }: BlockVideoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-1"
    >
      {title && (
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mb-4">
          {title}
        </p>
      )}
      <div className="relative w-full bg-black">
        <video
          src={src}
          poster={poster || undefined}
          controls
          preload="metadata"
          playsInline
          className="w-full h-auto block"
        />
      </div>
    </motion.div>
  );
}
