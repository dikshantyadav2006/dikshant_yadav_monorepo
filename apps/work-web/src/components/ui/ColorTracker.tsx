'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAccent } from '@/components/project/AccentContext';

export default function ColorTracker() {
  const { accent, isAuto } = useAccent();

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[9998] flex items-center gap-3 pointer-events-none mix-blend-difference"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={accent}
          className="block h-4 w-4 rounded-full border border-white/30"
          style={{ backgroundColor: accent }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        />
      </AnimatePresence>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
        {accent}
        {isAuto ? ' · auto' : ''}
      </span>
    </motion.div>
  );
}
