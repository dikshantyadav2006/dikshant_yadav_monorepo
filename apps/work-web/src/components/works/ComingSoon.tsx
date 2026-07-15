'use client';

import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

export default function ComingSoon() {
  return (
    <section className="h-[400px] md:h-[600px] flex items-center justify-center">
      <AnimatedWrapper className="text-center">
        <p className="font-sans text-[11px] md:text-[12px] uppercase tracking-[0.3em] opacity-40 mb-4">
          New Projects
        </p>
        <p className="font-script text-[80px] md:text-[150px] leading-none opacity-[0.12]">
          Coming Soon!
        </p>
      </AnimatedWrapper>
    </section>
  );
}
