'use client';

import TransitionLink from '@/components/ui/transition/TransitionLink';
import { TextSwap } from '@dikshant/ui';

export default function BackToWorks() {
  return (
    <TransitionLink
      href="/"
      aria-label="Back to Works"
      className="group fixed top-4 left-4 z-50 inline-flex items-center rounded-full border border-border bg-[var(--bg)] px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-[var(--text)] transition-colors duration-300 hover:border-[var(--text)]"
    >
      <TextSwap text="← Back to Works" stagger={0.03} />
    </TransitionLink>
  );
}