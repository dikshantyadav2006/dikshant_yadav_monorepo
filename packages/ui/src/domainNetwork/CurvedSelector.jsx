'use client';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useNetworkTheme } from './NetworkTheme.js';

const BASE_RAIL_W = 104;
const BASE_RAIL_H = 500;
const BASE_ITEM_STEP = 72;

// Multiple identical copies so the strip can scroll past the start/end of the
// domain list without ever "jumping back to the first" item.
const COPIES = 7;

/** Horizontal offset along a subtle vertical arc (~15% bend) */
function arcOffset(relIndex) {
  const t = relIndex / 2.5;
  return Math.min(t * t, 1) * 20;
}

function withAlpha(hex, alpha) {
  const clean = String(hex || '#8b5cf6').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function viewportScale() {
  if (typeof window === 'undefined') return 1;
  const avail = window.innerHeight - 190;
  return Math.min(1, Math.max(0.5, avail / BASE_RAIL_H));
}

export function CurvedSelector({ domains, activeIndex, activeColor, onHover, onLeave }) {
  const t = useNetworkTheme();
  const stripRef = useRef(null);
  const glowPathRef = useRef(null);
  const tweenRef = useRef(null);

  const [scale, setScale] = useState(viewportScale);

  useEffect(() => {
    const compute = () => setScale(viewportScale());
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const s = scale;
  const RAIL_W = BASE_RAIL_W * s;
  const RAIL_H = BASE_RAIL_H * s;
  const ITEM_STEP = BASE_ITEM_STEP * s;
  const CENTER_Y = RAIL_H / 2;

  const count = domains.length;
  const total = count * COPIES;
  const LO = count * 2; // start of the "middle" copy
  const HI = count * 3; // end of the "middle" copy

  // Continuous (unwrapped) strip position, kept inside the middle copy range.
  // Wrapping forward/backward moves by +/-1 instead of resetting to index 0.
  const stateRef = useRef({ pos: LO + activeIndex, lastActive: activeIndex });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const { pos } = stateRef.current;

    gsap.set(strip, { y: CENTER_Y - pos * ITEM_STEP - ITEM_STEP / 2 });

    strip.querySelectorAll('[data-selector-item]').forEach((el) => {
      const g = Number(el.getAttribute('data-global'));
      const rel = g - pos;
      const dist = Math.abs(rel);
      const visible = dist <= 2;
      gsap.set(el, {
        x: rel === 0 ? 0 : arcOffset(rel) * s,
        scale: rel === 0 ? 1 : 0.82,
        opacity: visible ? (rel === 0 ? 1 : 0.55 - dist * 0.08) : 0,
        pointerEvents: visible ? 'auto' : 'none',
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const sRef = stateRef.current;
    let delta = activeIndex - sRef.lastActive;
    const half = count / 2;
    if (delta > half) delta -= count;
    else if (delta < -half) delta += count;

    // Target is allowed to drift into the neighbouring copies so a wrap from
    // last -> first keeps scrolling in the same direction.
    const target = sRef.pos + delta;
    sRef.lastActive = activeIndex;
    sRef.pos = target;

    const tween = gsap.to(strip, {
      y: CENTER_Y - target * ITEM_STEP - ITEM_STEP / 2,
      duration: 0.9,
      ease: 'power3.out',
      overwrite: 'auto',
      onComplete: () => {
        if (tweenRef.current !== tween) return;
        let p = stateRef.current.pos;
        if (p >= HI) p -= count;
        else if (p < LO) p += count;
        stateRef.current.pos = p;
        gsap.set(strip, { y: CENTER_Y - p * ITEM_STEP - ITEM_STEP / 2 });
      },
    });
    tweenRef.current = tween;

    strip.querySelectorAll('[data-selector-item]').forEach((el) => {
      const g = Number(el.getAttribute('data-global'));
      const rel = g - target;
      const dist = Math.abs(rel);
      const visible = dist <= 2;
      gsap.to(el, {
        x: rel === 0 ? 0 : arcOffset(rel) * s,
        scale: rel === 0 ? 1 : 0.82,
        opacity: visible ? (rel === 0 ? 1 : 0.55 - dist * 0.08) : 0,
        pointerEvents: visible ? 'auto' : 'none',
        duration: 0.9,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, count, s]);

  useEffect(() => {
    const glow = glowPathRef.current;
    if (!glow) return;
    gsap.to(glow, {
      opacity: 0.85,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  const arcPath = `M ${28 * s} ${36 * s} Q ${78 * s} ${RAIL_H / 2} ${28 * s} ${RAIL_H - 36 * s}`;
  const glowPath = `M ${32 * s} ${48 * s} Q ${74 * s} ${RAIL_H / 2} ${32 * s} ${RAIL_H - 48 * s}`;

  return (
    <div
      className="relative isolate select-none"
      style={{ width: RAIL_W, height: RAIL_H, overflow: 'hidden', zIndex: 0 }}
    >
   

      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={stripRef}
          className="absolute left-0 right-0"
          style={{ top: 0, willChange: 'transform' }}
        >
          {Array.from({ length: total }).map((_, g) => {
            const domain = domains[g % count];
            return (
              <div
                key={`${domain.id ?? domain.prefix}-${g}`}
                data-selector-item
                data-global={g}
                className="flex items-center justify-center cursor-pointer"
                style={{
                  height: ITEM_STEP,
                  width: RAIL_W,
                  transformOrigin: 'center center',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
                onMouseEnter={() => onHover(g % count)}
                onMouseLeave={onLeave}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 52 * s,
                    height: 52 * s,
                    borderRadius: 16 * s,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <span
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontWeight: 600,
            fontSize: 22 * s,
            color: t.textPrimary,
            textShadow: `0 0 10px ${withAlpha(activeColor, 0.9)}, 0 0 26px ${withAlpha(activeColor, 0.5)}, 0 0 48px ${withAlpha(activeColor, 0.3)}`,
          }}
                  >
                    {domain.prefix}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Center slot guide */}
      <div
        className="absolute pointer-events-none left-0 right-0"
        style={{
          top: CENTER_Y - 40 * s,
          height: 80 * s,
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
        }}
      />
    </div>
  );
}
