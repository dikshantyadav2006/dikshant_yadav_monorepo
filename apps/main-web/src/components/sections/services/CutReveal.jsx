import { motion, useReducedMotion } from 'framer-motion';

const ENTER_EASING = [0.22, 1, 0.36, 1];
const EXIT_EASING = [0.4, 0, 0.2, 1];

function CutReveal({ isVisible, delay = 0, duration = 0.5, className = '', children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={{ opacity: isVisible ? 1 : 0 }}>
        {children}
      </div>
    );
  }

  // Exit is quicker and has no stagger delay — hides before container shrinks
  const exitDuration = Math.min(duration * 0.45, 0.2);

  return (
    <motion.div
      className={className}
      style={{ willChange: 'clip-path, transform, opacity' }}
      initial={{ clipPath: 'inset(0 0 100% 0)', y: -8, opacity: 0 }}
      animate={
        isVisible
          ? { clipPath: 'inset(0 0 0% 0)', y: 0, opacity: 1 }
          : { clipPath: 'inset(0 0 100% 0)', y: -8, opacity: 0 }
      }
      transition={
        isVisible
          ? {
              clipPath: { duration, delay, ease: ENTER_EASING },
              y: { duration, delay, ease: ENTER_EASING },
              opacity: { duration: duration * 0.65, delay, ease: ENTER_EASING },
            }
          : {
              clipPath: { duration: exitDuration, delay: 0, ease: EXIT_EASING },
              y: { duration: exitDuration, delay: 0, ease: EXIT_EASING },
              opacity: { duration: exitDuration * 0.7, delay: 0, ease: EXIT_EASING },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export default CutReveal;
