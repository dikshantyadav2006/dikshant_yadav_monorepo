'use client';

import { useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useTransition } from './TransitionContext';

const TOTAL_COLUMNS = 18;
const FILL_DURATION = 1.1;
const COVERED_PAUSE = 200;
const REVEAL_DURATION = 0.95;
const REVEAL_STAGGER_SPREAD = 0.4;

function computeColumns() {
  const baseWidth = 100 / TOTAL_COLUMNS;
  const cols: { width: number; stagger: number }[] = [];
  for (let i = 0; i < TOTAL_COLUMNS; i++) {
    const t = i / (TOTAL_COLUMNS - 1);
    const widthVariation = Math.sin(i * 1.7) * 0.15 + 1;
    const stagger = Math.sin(t * Math.PI) * REVEAL_STAGGER_SPREAD;
    cols.push({ width: baseWidth * widthVariation, stagger });
  }
  const totalWidth = cols.reduce((s, c) => s + c.width, 0);
  return cols.map((c) => ({
    ...c,
    widthPct: (c.width / totalWidth) * 100,
  }));
}

export default function TransitionOverlay() {
  const { phase, setPhase, targetHref, setTargetHref } = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const columnData = useMemo(() => computeColumns(), []);

  const overlayRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);

  // Mutable state machine — never causes re-renders
  const machine = useRef({
    phase: 'idle' as string,
    href: null as string | null,
    navigated: false,
    busy: false,
    fillTl: null as gsap.core.Timeline | null,
    revealTl: null as gsap.core.Timeline | null,
    lastPathname: '',
    mounted: true,
  });

  // Keep machine in sync with React state on every render
  machine.current.phase = phase;
  machine.current.href = targetHref;

  const getCols = () => columnsRef.current.filter(Boolean) as HTMLElement[];

  const killAll = () => {
    machine.current.fillTl?.kill();
    machine.current.revealTl?.kill();
    machine.current.fillTl = null;
    machine.current.revealTl = null;
  };

  const finish = () => {
    machine.current.busy = false;
    machine.current.navigated = false;
    machine.current.href = null;
    setTargetHref(null);
    setPhase('idle');
    document.body.classList.remove('no-scroll');
  };

  const startReveal = () => {
    if (!machine.current.mounted) return;

    const cols = getCols();
    if (!cols.length || !overlayRef.current) {
      console.warn('[transition] reveal: no cols, finishing immediately');
      finish();
      return;
    }

    console.log('[transition] reveal started');
    killAll();
    gsap.set(cols, { scaleY: 1, transformOrigin: 'top' });

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('[transition] reveal completed');
        finish();
      },
    });

    cols.forEach((col, i) => {
      tl.to(
        col,
        {
          scaleY: 0,
          duration: REVEAL_DURATION,
          ease: 'power3.inOut',
        },
        columnData[i].stagger,
      );
    });

    machine.current.revealTl = tl;
  };

  const startFill = (href: string) => {
    if (!machine.current.mounted) return;

    const cols = getCols();
    if (!cols.length || !overlayRef.current) {
      console.warn('[transition] fill: no cols, skipping');
      return;
    }

    console.log('[transition] fill started');
    killAll();
    gsap.set(cols, { scaleY: 0, transformOrigin: 'bottom' });

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('[transition] fill complete');
        setPhase('covered');

        setTimeout(() => {
          if (!machine.current.mounted) return;
          console.log('[transition] navigating →', href);
          machine.current.navigated = true;
          setPhase('navigating');
          router.push(href);
        }, COVERED_PAUSE);
      },
    });

    cols.forEach((col, i) => {
      tl.to(
        col,
        {
          scaleY: 1,
          duration: FILL_DURATION,
          ease: 'power3.inOut',
        },
        columnData[i].stagger,
      );
    });

    machine.current.fillTl = tl;
  };

  // ── Phase orchestrator ──────────────────────
  // Watches React phase state and dispatches into the ref-based machine.
  useEffect(() => {
    if (phase === 'fill' && targetHref && !machine.current.busy) {
      machine.current.busy = true;
      startFill(targetHref);
    }
  }, [phase, targetHref]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pathname watcher — triggers reveal ──────
  useEffect(() => {
    if (pathname === machine.current.lastPathname) return;
    machine.current.lastPathname = pathname;

    console.log('[transition] pathname changed:', pathname, '| phase:', machine.current.phase, '| navigated:', machine.current.navigated);

    if (machine.current.phase === 'navigating' && machine.current.navigated) {
      machine.current.navigated = false;
      startReveal();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Popstate: back / forward ────────────────
  useEffect(() => {
    const onPop = () => {
      if (machine.current.busy) return;

      console.log('[transition] popstate fired');

      // Instant cover — one frame, no flash
      document.body.classList.add('no-scroll');
      machine.current.busy = true;
      machine.current.navigated = false;

      setPhase('fill');

      const cols = getCols();
      if (cols.length && overlayRef.current) {
        killAll();
        gsap.set(cols, { scaleY: 1, transformOrigin: 'bottom' });
      }

      setPhase('covered');

      // Let Next.js process the navigation, then reveal after it settles
      setTimeout(() => {
        if (!machine.current.mounted) return;
        console.log('[transition] popstate → navigating');
        setPhase('navigating');

        // Two frames: one for React to render, one for DOM paint
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!machine.current.mounted) return;
            startReveal();
          });
        });
      }, 50);
    };

    window.addEventListener('popstate', onPop, { capture: true });
    return () => window.removeEventListener('popstate', onPop, { capture: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Unmount guard ───────────────────────────
  useEffect(() => {
    return () => {
      machine.current.mounted = false;
      killAll();
      document.body.classList.remove('no-scroll');
    };
  }, []);

  // ── Render columns ──────────────────────────
  let cumLeft = 0;
  const positioned = columnData.map((col, i) => {
    const left = cumLeft;
    cumLeft += col.widthPct;
    return { ...col, leftPct: left, index: i };
  });

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
      style={{ visibility: phase === 'idle' ? 'hidden' : 'visible' }}
    >
      {positioned.map((col) => (
        <div
          key={col.index}
          ref={(el) => {
            if (el) columnsRef.current[col.index] = el;
          }}
          className="absolute top-0 h-full"
          style={{
            left: `${col.leftPct}%`,
            width: `${col.widthPct}%`,
            backgroundColor: 'var(--text)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        />
      ))}
    </div>
  );
}
