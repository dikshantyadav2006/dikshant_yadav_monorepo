import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';

/**
 * useLocomotiveScroll Hook
 * Manages Locomotive Scroll initialization and cleanup
 *
 * @param {Array} deps - Dependencies that trigger re-initialization (e.g. route pathname).
 *                       When the active page changes the old container is destroyed and a
 *                       fresh LocomotiveScroll instance is bound to the new [data-scroll-container].
 * @returns {object} { scrollRef } - Reference to Locomotive Scroll instance
 */
const useLocomotiveScroll = (deps = []) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = document.querySelector("[data-scroll-container]");
    if (!el) return; // Route has no scroll container (e.g. 404 page)

    scrollRef.current = new LocomotiveScroll({
      el,
      smooth: true,
      smoothMobile: true,
      multiplier: .8,
      lerp: 0.12,
      class: 'is-reveal',
      getSpeed: true,
      inertia: 0.8,
      reloadOnContextChange: true,
      horizontalScroll: false,
      firefoxMultiplier: 50,
      touchMultiplier: 2,
      tablet: {
        breakpoint: 768,
        smooth: true,
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothMobile: true,
        multiplier: 0.8,
        inertia: 0.8,
      },
      smartphone: {
        breakpoint: 480,
        smooth: true,
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothMobile: true,
        multiplier: 0.6,
        inertia: 0.8,
      },
    });

    return () => {
      if (scrollRef.current) {
        scrollRef.current.destroy();
        scrollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { scrollRef };
};

export default useLocomotiveScroll;
