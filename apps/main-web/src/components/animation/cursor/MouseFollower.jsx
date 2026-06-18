import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

const MouseFollower = ({
  enabled = () => false, // Function to check if cursor is enabled
  hideDefaultCursor = true,
  followDuration = 0.0015,
  scaleOnClick = 2,
  className = 'w-3 h-3 bg-white/80 mix-blend-difference'
}) => {
  const followerRef = useRef(null);
  const isEnabledRef = useRef(false);

  const isMobile = useMemo(() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 1024;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }, []);

  useEffect(() => {
    if (isMobile || !followerRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    gsap.set(followerRef.current, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      opacity: 0
    });

    // Continuous enabled check (60fps)
    const checkEnabled = () => {
      const isEnabled = typeof enabled === 'function' ? enabled() : enabled
      gsap.to(followerRef.current, {
        opacity: isEnabled ? 1 : 0,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    const intervalId = setInterval(checkEnabled, 16) // ~60fps

    const moveHandler = e => {
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: followDuration,
        ease: 'power3.out'
      });
    };

    const mouseDownHandler = () => {
      gsap.to(followerRef.current, { scale: scaleOnClick, duration: 0.2, ease: 'power2.out' });
    };

    const mouseUpHandler = () => {
      gsap.to(followerRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      document.body.style.cursor = originalCursor;
    };
  }, [hideDefaultCursor, followDuration, scaleOnClick, isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={followerRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full will-change-transform ${className}`}
    />
  );
};

export default MouseFollower;
