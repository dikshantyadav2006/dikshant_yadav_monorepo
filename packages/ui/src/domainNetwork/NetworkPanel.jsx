import { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { motion } from 'framer-motion';
import { DomainIcon } from './DomainIcon.jsx';

gsap.registerPlugin(MotionPathPlugin);

function buildOrganicPath(ox, oy, ex, ey, index) {
  const dx = ex - ox;
  const dy = ey - oy;
  const spread = (index - 2.5) * 12;
  const c1x = ox + Math.max(40, dx * 0.28) + spread * 0.4;
  const c1y = oy + dy * 0.08 + spread;
  const c2x = ox + dx * 0.62 + spread * 0.2;
  const c2y = ey - dy * 0.12 - spread * 0.3;
  return `M ${ox.toFixed(1)} ${oy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

export function NetworkPanel({
  domains,
  activeIndex,
  baseDomain,
  activeColor,
  domainRef,
  stageRef: stageRefProp,
  onLabelHover,
  onLabelLeave,
}) {
  const localStageRef = useRef(null);
  const stageRef = stageRefProp ?? localStageRef;
  const cardRefs = useRef([]);
  const pathRefs = useRef([]);
  const particleRef = useRef(null);
  const particleTween = useRef(null);
  const [paths, setPaths] = useState([]);

  const measurePaths = useCallback(() => {
    const stage = stageRef.current;
    const domainEl = domainRef?.current;
    if (!stage || !domainEl) return;

    const stageRect = stage.getBoundingClientRect();
    const domainRect = domainEl.getBoundingClientRect();
    const ox = domainRect.right - stageRect.left + 4;
    const oy = domainRect.top + domainRect.height / 2 - stageRect.top;

    const next = domains.map((_, i) => {
      const card = cardRefs.current[i];
      if (!card) return '';
      const cr = card.getBoundingClientRect();
      const ex = cr.left - stageRect.left + 8;
      const ey = cr.top + cr.height / 2 - stageRect.top;
      return buildOrganicPath(ox, oy, ex, ey, i);
    });
    setPaths(next);
  }, [domains, domainRef]);

  useLayoutEffect(() => {
    measurePaths();
    const stage = stageRef.current;
    if (!stage) return undefined;

    const ro = new ResizeObserver(() => measurePaths());
    ro.observe(stage);
    if (domainRef?.current) ro.observe(domainRef.current);

    window.addEventListener('resize', measurePaths);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measurePaths);
    };
  }, [measurePaths, domainRef, activeIndex]);

  useEffect(() => {
    pathRefs.current.forEach((pathEl, i) => {
      if (!pathEl) return;
      const isActive = i === activeIndex;
      gsap.to(pathEl, {
        stroke: isActive ? activeColor : 'rgba(255,255,255,0.12)',
        strokeOpacity: isActive ? 1 : 0.35,
        duration: 0.55,
        ease: 'power2.out',
      });
    });
  }, [activeIndex, activeColor, paths]);

  useEffect(() => {
    if (particleTween.current) {
      particleTween.current.kill();
      particleTween.current = null;
    }

    const pathEl = pathRefs.current[activeIndex];
    const particle = particleRef.current;
    if (!pathEl || !particle || !paths[activeIndex]) return;

    gsap.set(particle, { opacity: 1 });
    particleTween.current = gsap.to(particle, {
      motionPath: {
        path: pathEl,
        align: pathEl,
        alignOrigin: [0.5, 0.5],
        autoRotate: false,
      },
      duration: 2,
      repeat: -1,
      ease: 'none',
    });

    return () => {
      if (particleTween.current) {
        particleTween.current.kill();
      }
    };
  }, [activeIndex, paths]);

  return (
    <>
      <svg
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
        aria-hidden
        style={{ gridColumn: '1 / -1', gridRow: 1 }}
      >
        <defs>
          <filter id="path-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {paths.map((d, i) => {
          if (!d) return null;
          const isActive = i === activeIndex;
          return (
            <path
              key={domains[i].id ?? domains[i].prefix}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={d}
              fill="none"
              strokeWidth={1.5}
              strokeLinecap="round"
              stroke={isActive ? activeColor : 'rgba(255,255,255,0.12)'}
              strokeOpacity={isActive ? 1 : 0.35}
              style={isActive ? { filter: `url(#path-glow) drop-shadow(0 0 12px ${activeColor})` } : undefined}
            />
          );
        })}

        <circle
          ref={particleRef}
          r={3}
          fill={activeColor}
          opacity={0}
          style={{ filter: `drop-shadow(0 0 8px ${activeColor})` }}
        />
      </svg>

      <div
        className="relative z-20 isolate w-[min(320px,100%)] flex flex-col gap-2 py-2 justify-center items-center"
        style={{ isolation: 'isolate' }}
      >
        {domains.map((domain, i) => {
          const isActive = i === activeIndex;
          const dimmed = activeIndex >= 0 && !isActive;
          return (
            <motion.a
              key={domain.id ?? domain.prefix}
              href={domain.href}
              target="_blank"
              rel="noopener noreferrer"
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onMouseEnter={() => onLabelHover(i)}
              onMouseLeave={onLabelLeave}
              animate={{
                y: 0,
                opacity: dimmed ? 0.35 : 1,
              }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 no-underline"
              style={{
                width: '100%',
                height: 'clamp(56px, 9vh, 84px)',
                borderRadius: 999,
                padding: '0 16px 0 10px',
                background: isActive ? 'rgba(18,19,21,0.92)' : 'rgba(18,19,21,0.8)',
                border: isActive
                  ? `1px solid rgba(139,92,246,0.55)`
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isActive
                  ? `0 0 32px rgba(139,92,246,0.35), inset 0 0 24px rgba(139,92,246,0.08)`
                  : 'none',
              }}
            >
              <div
                className="flex items-center justify-center shrink-0 text-white"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: isActive ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                  border: isActive ? `1px solid rgba(139,92,246,0.35)` : '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? activeColor : 'rgba(255,255,255,0.85)',
                }}
              >
                <DomainIcon name={domain.icon} size={20} />
              </div>
              <div className="min-w-0">
                <div
                  style={{
                    fontFamily: 'Geist, Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }}
                >
                  {domain.label}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontFamily: 'Geist, Inter, sans-serif',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.45)',
                    marginTop: 2,
                  }}
                >
                  {domain.prefix}.{baseDomain}
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </>
  );
}
