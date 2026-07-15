'use client';

import { motion } from 'framer-motion';
import DotField from '@/components/ui/DotField';

export default function WorksHero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* DotField background */}
      <div className="absolute inset-0">
        <DotField
          dotRadius={2}
          dotSpacing={14}
          cursorRadius={500}
          bulgeOnly={true}
          bulgeStrength={67}
          glowRadius={180}
          sparkle={true}
          waveAmplitude={0}
          gradientFrom="rgba(255, 100, 80, 0.55)"
          gradientTo="rgba(255, 170, 60, 0.45)"
          glowColor="rgba(255, 120, 80, 0.15)"
        />
      </div>

      {/* Hero content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-center"
        >
          <p className="font-sans text-[11px] md:text-[12px] uppercase tracking-[0.3em] text-[#8B4513]/50 mb-6">
            Selected Projects
          </p>
          <h1 className="font-display text-[clamp(60px,12vw,200px)] leading-[0.85] tracking-[-0.06em] uppercase text-[#2C1810]">
            WORKS
          </h1>
          <p className="font-script text-[clamp(24px,3vw,40px)] mt-6 text-[#8B4513]/60">
            Dikshant Yadav
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[1px] h-12 bg-[#8B4513]/20"
          />
        </motion.div>
      </div>
    </section>
  );
}
