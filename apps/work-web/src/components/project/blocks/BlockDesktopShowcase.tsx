'use client';

import { motion } from 'framer-motion';

interface BlockDesktopShowcaseProps {
  desktop: string[];
  mobile?: string[];
}

export default function BlockDesktopShowcase({ desktop, mobile }: BlockDesktopShowcaseProps) {
  return (
    <div className="px-1">
      <div className="flex flex-col gap-[10px] mb-[10px]">
        {desktop.map((src, i) => (
          <motion.div
            key={`desk-${i}`}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.1,
            }}
          >
            <img
              src={src}
              alt={`Desktop ${i + 1}`}
              className="w-full h-auto object-contain md:h-[700px] md:object-cover"
            />
          </motion.div>
        ))}
      </div>

      {mobile && mobile.length > 0 && (
        <div className="grid grid-cols-2 gap-[10px]">
          {mobile.map((src, i) => (
            <motion.div
              key={`mob-${i}`}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.1,
              }}
            >
              <img
                src={src}
                alt={`Mobile ${i + 1}`}
                className="w-full h-auto object-contain md:h-[600px] md:object-cover"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
