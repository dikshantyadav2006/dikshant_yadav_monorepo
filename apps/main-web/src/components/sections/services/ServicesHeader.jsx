import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const EASING = [0.16, 1, 0.3, 1];

function CutWord({ children, delay = 0, duration = 0.8 }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <span className="inline-block overflow-hidden align-bottom">
        <span className="block leading-none">{children}</span>
      </span>
    );
  }

  return (
    <span className="inline-block overflow-hidden align-bottom" style={{ verticalAlign: 'bottom' }}>
      <motion.span
        className="block leading-none"
        initial={{ y: '110%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true }}
        transition={{ duration, delay, ease: EASING }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function ServicesHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  const labelVariants = {
    hidden: { opacity: 0, x: 12 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div
      ref={ref}
      className="w-full flex items-start justify-between px-[4vw] md:px-[6vw] lg:px-[4vw] pt-[6vh] md:pt-[8vh] lg:pt-[10vh] pb-[4vh] md:pb-[5vh] border-b border-[--dark-color]/20 dark:border-[--light-color]/20"
    >
      {/* SERVICES heading with cut reveal */}
      <h2 className="font-['font-p-1'] text-[clamp(36px,7vw,80px)] leading-[0.9] tracking-tight uppercase m-0 p-0">
        <CutWord delay={0}>S</CutWord>
        <CutWord delay={0.05}>E</CutWord>
        <CutWord delay={0.1}>R</CutWord>
        <CutWord delay={0.15}>V</CutWord>
        <CutWord delay={0.2}>I</CutWord>
        <CutWord delay={0.25}>C</CutWord>
        <CutWord delay={0.3}>E</CutWord>
        <CutWord delay={0.35}>S</CutWord>
      </h2>

      {/* DSGN/4 label */}
      <motion.span
        className="font-['font-p-2'] text-[10px] md:text-xs uppercase tracking-widest opacity-50 mt-[1vw]"
        variants={labelVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        transition={{ duration: 0.6, delay: 0.5, ease: EASING }}
      >
        DSGN/4
      </motion.span>
    </div>
  );
}

export default ServicesHeader;
