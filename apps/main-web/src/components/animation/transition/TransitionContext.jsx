import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

export const TRANSITION_PHASE = {
  IDLE: 'idle',
  FILL: 'fill',
  COVERED: 'covered',
  NAVIGATING: 'navigating',
  REVEAL: 'reveal',
};

const TransitionContext = createContext(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return ctx;
}

export default function TransitionProvider({ children }) {
  const [phase, _setPhase] = useState(TRANSITION_PHASE.IDLE);
  const [targetHref, _setTargetHref] = useState(null);

  const phaseRef = useRef(TRANSITION_PHASE.IDLE);
  const targetHrefRef = useRef(null);

  const setPhase = useCallback((p) => {
    phaseRef.current = p;
    _setPhase(p);
  }, []);

  const setTargetHref = useCallback((h) => {
    targetHrefRef.current = h;
    _setTargetHref(h);
  }, []);

  const startTransition = useCallback(
    (href) => {
      if (phaseRef.current !== TRANSITION_PHASE.IDLE) return;
      setTargetHref(href);
      setPhase(TRANSITION_PHASE.FILL);
      document.body.classList.add('no-scroll');
    },
    [setPhase, setTargetHref],
  );

  return (
    <TransitionContext.Provider
      value={{
        phase,
        isTransitioning: phase !== TRANSITION_PHASE.IDLE,
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
