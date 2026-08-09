'use client';

import { motion } from 'framer-motion';
import { useAccent } from '@/components/project/AccentContext';

interface BlockLinkProps {
  label: string;
  href: string;
  description?: string;
}

export default function BlockLink({ label, href, description }: BlockLinkProps) {
  const { accent } = useAccent();
  const isExternal = /^https?:\/\//.test(href);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="px-1"
    >
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="group relative block border border-border bg-bg overflow-hidden"
      >
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: accent }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-8 md:p-10 mix-blend-multiply group-hover:mix-blend-normal transition-[mix-blend-mode] duration-500">
          <div>
            <h3 className="font-display text-[clamp(28px,4vw,56px)] uppercase tracking-[-0.03em] font-black leading-none">
              {label}
            </h3>
            {description && (
              <p className="font-sans text-[13px] uppercase tracking-[0.15em] opacity-50 mt-2">
                {description}
              </p>
            )}
          </div>
          <span className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-50 group-hover:opacity-100 transition-opacity duration-300">
            Open ↗
          </span>
        </div>
      </a>
    </motion.div>
  );
}
