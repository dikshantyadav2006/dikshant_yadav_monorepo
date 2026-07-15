'use client';

import { motion } from 'framer-motion';

interface BlockMobileShowcaseProps {
  mobile: string[];
  desktop?: string[];
}

export default function BlockMobileShowcase({ mobile, desktop }: BlockMobileShowcaseProps) {
  return (
    <div className="px-1">
      {desktop && desktop.length > 0 && (
        <div className="flex flex-col gap-[4px] mb-[4px]">
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
              <motion.img
                src={src}
                alt={`Desktop ${i + 1}`}
                className="w-full object-cover"
                style={{ height: '700px' }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-[4px]">
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
            <motion.img
              src={src}
              alt={`Mobile ${i + 1}`}
              className="w-full object-cover"
              style={{ height: '600px' }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
