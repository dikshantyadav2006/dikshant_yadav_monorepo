'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import MagnetLines from '@/components/ui/MagnetLines';
import { i } from 'framer-motion/client';

export default function ReachOut() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* MagnetLines background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <MagnetLines
          rows={isMobile ? 25 : 40}
          columns={isMobile ? 25 : 50}
          containerSize="100vw"
          lineColor="#111111"
          lineWidth="1px"
          lineHeight="2vw"
          baseAngle={-5}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <AnimatedWrapper className="text-center">
          <p className="font-script text-[40px] md:text-[80px] lg:text-[150px] leading-none mb-2">
            Let&apos;s work together!
          </p>
          <motion.a
            href="mailto:hello@dikshantyadav.in"
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="group relative inline-block"
          >
            <h2 className="font-condensed text-[clamp(80px,12vw,220px)] leading-[0.85] uppercase tracking-[-0.04em] font-black">
              REACH OUT
            </h2>
            <motion.span
              variants={{
                rest: { scaleX: 0 ,opacity:.1 },
                hover: { scaleX: 1 , opacity: 1 },
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute left-0 bottom-[-8px] h-[10px] w-full origin-left bg-[var(--text)] rounded-r-full"
            />
          </motion.a>
        </AnimatedWrapper>
      </div>
    </section>
  );
}
