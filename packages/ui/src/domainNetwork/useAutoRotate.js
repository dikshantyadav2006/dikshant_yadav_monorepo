import { useState, useEffect, useCallback, useRef } from 'react';

export function useAutoRotate({ count, interval = 2500, resumeDelay = 1200, startIndex = 3 }) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const resumeTimerRef = useRef(null);
  const intervalRef = useRef(null);

  const clearRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRotation = useCallback(() => {
    clearRotation();
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, interval);
  }, [count, interval, clearRotation]);

  useEffect(() => {
    startRotation();
    return clearRotation;
  }, [startRotation, clearRotation]);

  const handleHover = useCallback(
    (index) => {
      clearRotation();
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      setActiveIndex(index);
    },
    [clearRotation],
  );

  const handleLeave = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      startRotation();
    }, resumeDelay);
  }, [resumeDelay, startRotation]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  return { activeIndex, setActiveIndex, handleHover, handleLeave };
}
