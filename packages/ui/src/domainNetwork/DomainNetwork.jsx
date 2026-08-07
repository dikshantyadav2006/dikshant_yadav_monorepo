import { useMemo, useCallback, useEffect, useRef, useId } from 'react';
import { defaultDomains } from './data.js';
import { CurvedSelector } from './CurvedSelector.jsx';
import { DomainText } from './DomainText.jsx';
import { NetworkPanel } from './NetworkPanel.jsx';
import { LeftPanel } from './LeftPanel.jsx';
import { useAutoRotate } from './useAutoRotate.js';

function DomainNetwork({
  domains = defaultDomains,
  domain = 'dikshantyadav.in',
  activeColor = '#8b5cf6',
  autoRotateInterval = 2500,
  resumeDelay = 1200,
  cursorEvents = null,
  className = '',
}) {
  const sectionRef = useRef(null);
  const domainRef = useRef(null);
  const stageRef = useRef(null);
  const noiseId = useId();

  const { activeIndex, handleHover, handleLeave } = useAutoRotate({
    count: domains.length,
    interval: autoRotateInterval,
    resumeDelay,
    startIndex: 3,
  });

  const activeDomain = useMemo(() => domains[activeIndex], [domains, activeIndex]);

  const onLabelHover = useCallback(
    (index) => {
      handleHover(index);
    },
    [handleHover],
  );

  const onLabelLeave = useCallback(() => {
    handleLeave();
  }, [handleLeave]);

  useEffect(() => {
    if (!cursorEvents || !sectionRef.current) return;
    const { addCursor, removeCursor, cursorModes } = cursorEvents;
    const el = sectionRef.current;
    const handleEnter = () => addCursor(cursorModes.TARGET);
    const handleMouseLeave = () => removeCursor(cursorModes.TARGET);
    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorEvents]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{
        background: '#121315',
        height: '100dvh',
        minHeight: 560,
        maxHeight: 920,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(139,92,246,0.08), transparent 60%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id={noiseId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
        </svg>
      </div>

      <div className="relative z-20 h-full flex flex-col">
        <div className="flex-1 min-h-0 flex items-center">
            <div className="mx-auto w-full max-w-[1720px] px-4 lg:px-10 flex flex-row items-center justify-center gap-4 lg:gap-6 xl:gap-8">
              <LeftPanel activeColor={activeColor} />

              <div className="relative z-10 flex flex-row items-center justify-center shrink-0 gap-3 lg:gap-5">
                <CurvedSelector
                  domains={domains}
                  activeIndex={activeIndex}
                  activeColor={activeColor}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />

                <div className="hidden md:flex">
                  <DomainText
                    prefix={activeDomain.prefix}
                    domain={domain}
                    activeColor={activeColor}
                    domainRef={domainRef}
                  />
                </div>
              </div>

              <div
                ref={stageRef}
                className="relative flex-1 min-w-0 flex items-center justify-center min-h-[400px]"
              >
                <NetworkPanel
                  domains={domains}
                  activeIndex={activeIndex}
                  baseDomain={domain}
                  activeColor={activeColor}
                  domainRef={domainRef}
                  stageRef={stageRef}
                  onLabelHover={onLabelHover}
                  onLabelLeave={onLabelLeave}
                />
              </div>
            </div>
        </div>

        <div className="shrink-0 pb-5 lg:pb-6 flex items-center justify-center gap-6 px-6">
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-white/10" />
          <span
            style={{
              fontFamily: 'Geist, Inter, sans-serif',
              fontSize: 13,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
            }}
          >
            Hover to connect
          </span>
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </section>
  );
}

export default DomainNetwork;
