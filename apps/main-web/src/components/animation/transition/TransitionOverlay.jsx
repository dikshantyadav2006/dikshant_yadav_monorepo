import { useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useTransition, TRANSITION_PHASE } from './TransitionContext';

const TOTAL_COLUMNS = 18;
const FILL_DURATION = 1.1;
const COVERED_PAUSE = 200;
const REVEAL_DURATION = 0.95;
const REVEAL_STAGGER_SPREAD = 0.4;

function computeColumns() {
  const baseWidth = 100 / TOTAL_COLUMNS;
  const cols = [];
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
  const navigate = useNavigate();
  const location = useLocation();

  const columnData = useMemo(() => computeColumns(), []);

  const overlayRef = useRef(null);
  const columnsRef = useRef([]);

  const machine = useRef({
    phase: TRANSITION_PHASE.IDLE,
    href: null,
    navigated: false,
    busy: false,
    fillTl: null,
    revealTl: null,
    lastPathname: '',
    mounted: true,
    lastNavigateDone: true,
  });

  machine.current.phase = phase;
  machine.current.href = targetHref;

  const getCols = () => columnsRef.current.filter(Boolean);

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
    setPhase(TRANSITION_PHASE.IDLE);
    document.body.classList.remove('no-scroll');
  };

  const startReveal = () => {
    if (!machine.current.mounted) return;

    const cols = getCols();
    if (!cols.length || !overlayRef.current) {
      finish();
      return;
    }

    killAll();
    gsap.set(cols, { scaleY: 1, transformOrigin: 'top' });

    const tl = gsap.timeline({
      onComplete: () => {
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

  const startFill = (href) => {
    if (!machine.current.mounted) return;

    const cols = getCols();
    if (!cols.length || !overlayRef.current) return;

    killAll();
    gsap.set(cols, { scaleY: 0, transformOrigin: 'bottom' });

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase(TRANSITION_PHASE.COVERED);

        setTimeout(() => {
          if (!machine.current.mounted) return;
          machine.current.navigated = true;
          machine.current.lastNavigateDone = false;
          setPhase(TRANSITION_PHASE.NAVIGATING);
          navigate(href);
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
  useEffect(() => {
    if (phase === TRANSITION_PHASE.FILL && targetHref && !machine.current.busy) {
      machine.current.busy = true;
      startFill(targetHref);
    }
  }, [phase, targetHref]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Location watcher — triggers reveal ──────
  useEffect(() => {
    if (location.pathname === machine.current.lastPathname) return;
    machine.current.lastPathname = location.pathname;

    if (
      machine.current.phase === TRANSITION_PHASE.NAVIGATING &&
      machine.current.navigated
    ) {
      machine.current.navigated = false;
      startReveal();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Popstate: back / forward ────────────────
  useEffect(() => {
    const onPop = () => {
      if (machine.current.busy) return;

      document.body.classList.add('no-scroll');
      machine.current.busy = true;
      machine.current.navigated = false;

      setPhase(TRANSITION_PHASE.FILL);

      const cols = getCols();
      if (cols.length && overlayRef.current) {
        killAll();
        gsap.set(cols, { scaleY: 1, transformOrigin: 'bottom' });
      }

      setPhase(TRANSITION_PHASE.COVERED);

      setTimeout(() => {
        if (!machine.current.mounted) return;
        setPhase(TRANSITION_PHASE.NAVIGATING);

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

  let cumLeft = 0;
  const positioned = columnData.map((col, i) => {
    const left = cumLeft;
    cumLeft += col.widthPct;
    return { ...col, leftPct: left, index: i };
  });

  return (
    <div
      ref={overlayRef}
      className="transition-overlay fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
      style={{ visibility: phase === TRANSITION_PHASE.IDLE ? 'hidden' : 'visible' }}
    >
      {positioned.map((col) => (
        <div
          key={col.index}
          ref={(el) => {
            if (el) columnsRef.current[col.index] = el;
          }}
          className="transition-overlay-col absolute top-0 h-full"
          style={{
            left: `${col.leftPct}%`,
            width: `${col.widthPct}%`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        />
      ))}
    </div>
  );
}
