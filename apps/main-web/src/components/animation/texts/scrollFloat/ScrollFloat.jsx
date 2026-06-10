import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const ScrollFloat = ({
  children,
  from = 'center',
  delay = 0.12,

  // 👇 NEW PROPS
  enter = { y: '120%', opacity: 0 },
  to = { y: '0%', opacity: 1 },
  exit = { y: '120%', opacity: 0 },
}) => {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    const handleChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () =>
      mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const text = typeof children === 'string' ? children : '';

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isMobile
      ? ['start 100%', 'end 90%']
      : ['start 80%', 'end 80%'],
  });

  // enter delay, exit instant
  const progress = useTransform(scrollYProgress, (v) =>
    isMobile && v === 0 ? 1 : v
  );

  return (
    <span ref={ref} className="inline-block overflow-visible whitespace-nowrap">
      {text.split('').map((char, i) => {
        const center = (text.length - 1) / 2;
        const order =
          from === 'center'
            ? Math.abs(i - center)
            : i;

        const start = delay + order * 0.035;
        const end = start + 0.3;

        // 🔥 START → END → EXIT
        const rawY = useTransform(
          progress,
          [0, start, end, 1],
          [exit.y, enter.y, to.y, exit.y]
        );

        const rawOpacity = useTransform(
          progress,
          [0, start, end, 1],
          [exit.opacity, enter.opacity, to.opacity, exit.opacity]
        );

        const y = useSpring(rawY, {
          stiffness: isMobile ? 90 : 120,
          damping: isMobile ? 22 : 18,
        });

        return (
          <motion.span
            key={i}
            className="inline-block will-change-transform"
            style={{ y, opacity: rawOpacity }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </span>
  );
};

export default ScrollFloat;
