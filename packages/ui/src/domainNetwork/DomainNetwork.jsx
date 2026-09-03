'use client';
import { useMemo, useCallback, useEffect, useRef, useId, useState } from 'react';
import { defaultDomains } from './data.js';
import { CurvedSelector } from './CurvedSelector.jsx';
import { DomainText } from './DomainText.jsx';
import { NetworkPanel } from './NetworkPanel.jsx';
import { LeftPanel } from './LeftPanel.jsx';
import { useAutoRotate } from './useAutoRotate.js';
import {
  NetworkThemeContext,
  resolveNetworkTheme,
  buildPalette,
} from './NetworkTheme.js';

function DomainNetwork({
  domains = defaultDomains,
  domain = 'dikshantyadav.in',
  activeColor = '#8b5cf6',
  autoRotateInterval = 2500,
  resumeDelay = 1200,
  cursorEvents = null,
  isDarkMode = true,
  className = '',
}) {
  const sectionRef = useRef(null);
  const domainRef = useRef(null);
  const stageRef = useRef(null);
  const noiseId = useId();
  const [tone, setTone] = useState(isDarkMode ? 'dark' : 'light');

  const { activeIndex, handleHover, handleLeave } = useAutoRotate({
    count: domains.length,
    interval: autoRotateInterval,
    resumeDelay,
    startIndex: 3,
  });

  // Keep the tone in sync with the site mode
  useEffect(() => {
    setTone(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Read the section-theme canvas color from the wrapped Section's CSS vars
  const theme = useMemo(() => {
    const root = sectionRef.current;
    if (!root) return resolveNetworkTheme(null);
    // walk up to the nearest element exposing --dark-color / --light-color
    let el = root;
    let colors = resolveNetworkTheme(el);
    while (el && colors.dark === '#121315' && colors.light === '#121315') {
      el = el.parentElement;
      if (!el) break;
      colors = resolveNetworkTheme(el);
    }
    return colors;
  }, [tone]);

  const canvas = tone === 'dark' ? theme.dark : theme.light;
  const palette = useMemo(
    () => buildPalette(canvas, activeColor),
    [canvas, activeColor],
  );

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
    <NetworkThemeContext.Provider value={palette}>
      <section
        ref={sectionRef}
        className={`relative w-full h-screen overflow-hidden ${className}`}
        style={{
          background: canvas,
          height: '100dvh',
          minHeight: 560,
          maxHeight: 920,
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.04] mix-blend-overlay">
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
            <div className="h-px flex-1 max-w-[120px]" style={{ background: palette.line }} />
            <span
              style={{
                fontFamily: 'Geist, Inter, sans-serif',
                fontSize: 13,
                letterSpacing: '0.12em',
                color: palette.textMuted,
                textTransform: 'uppercase',
              }}
            >
              Hover to connect
            </span>
            <div className="h-px flex-1 max-w-[120px]" style={{ background: palette.line }} />
          </div>
        </div>
      </section>
    </NetworkThemeContext.Provider>
  );
}

export default DomainNetwork;
