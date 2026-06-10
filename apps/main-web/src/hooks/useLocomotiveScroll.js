import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';

/**
 * useLocomotiveScroll Hook
 * Manages Locomotive Scroll initialization and cleanup
 * 
 * @returns {object} { scrollRef } - Reference to Locomotive Scroll instance
 */
const useLocomotiveScroll = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current = new LocomotiveScroll({
      el: document.querySelector("[data-scroll-container]"),
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
      if (scrollRef.current) scrollRef.current.destroy();
    };
  }, []);

  return { scrollRef };
};

export default useLocomotiveScroll;
