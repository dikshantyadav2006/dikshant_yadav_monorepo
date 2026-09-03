import { motion } from 'framer-motion';
import { useNetworkTheme } from './NetworkTheme.js';

export function DomainText({ prefix, domain, activeColor, domainRef }) {
  const t = useNetworkTheme();
  return (
    <div ref={domainRef} className="flex items-center gap-5 whitespace-nowrap">
      <motion.span
        className="shrink-0 rounded-full hidden lg:block"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 8,
          height: 8,
          background: activeColor,
          boxShadow: `0 0 16px ${activeColor}, 0 0 32px ${activeColor}66`,
        }}
        aria-hidden
      />
      <motion.h1
        className="flex flex-wrap items-baseline gap-0"
        style={{
          fontFamily: 'Geist, Inter, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(20px, 3.4vw, 60px)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: t.textPrimary }}>{domain}</span>
      </motion.h1>
    </div>
  );
}
