'use client';

import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

export default function ReachOut() {
  return (
    <section className="py-[120px] md:py-[200px]">
      <AnimatedWrapper className="text-center">
        <p className="font-script text-[40px] md:text-[80px] lg:text-[120px] leading-none mb-2">
          Let&apos;s work together!
        </p>
        <h2 className="font-display text-[80px] md:text-[140px] lg:text-[220px] leading-[0.85] tracking-[-0.05em] uppercase">
          REACH OUT
        </h2>
      </AnimatedWrapper>
    </section>
  );
}
