'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

export type TransitionPhase =
  | 'idle'
  | 'fill'
  | 'covered'
  | 'navigating'
  | 'reveal';

interface TransitionContextValue {
  phase: TransitionPhase;
  isTransitioning: boolean;
  targetHref: string | null;
  startTransition: (href: string) => void;
  setPhase: (p: TransitionPhase) => void;
  setTargetHref: (h: string | null) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return ctx;
}

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phase, _setPhase] = useState<TransitionPhase>('idle');
  const [targetHref, _setTargetHref] = useState<string | null>(null);

  const phaseRef = useRef<TransitionPhase>('idle');
  const targetHrefRef = useRef<string | null>(null);

  const setPhase = useCallback((p: TransitionPhase) => {
    phaseRef.current = p;
    _setPhase(p);
  }, []);

  const setTargetHref = useCallback((h: string | null) => {
    targetHrefRef.current = h;
    _setTargetHref(h);
  }, []);

  const startTransition = useCallback(
    (href: string) => {
      if (phaseRef.current !== 'idle') return;
      setTargetHref(href);
      setPhase('fill');
      document.body.classList.add('no-scroll');
    },
    [setPhase, setTargetHref],
  );

  return (
    <TransitionContext.Provider
      value={{
        phase,
        isTransitioning: phase !== 'idle',
        targetHref,
        startTransition,
        setPhase,
        setTargetHref,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}
