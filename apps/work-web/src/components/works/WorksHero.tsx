'use client';

import { motion } from 'framer-motion';
import DotField from '@/components/ui/DotField';
import WorksHeader from '@/components/works/WorksHeader';

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
        <WorksHeader />
      </div>
    </section>
  );
}
