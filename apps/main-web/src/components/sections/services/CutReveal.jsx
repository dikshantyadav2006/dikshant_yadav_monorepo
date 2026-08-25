import { motion, useReducedMotion } from 'framer-motion';

const EASING = [0.16, 1, 0.3, 1];

/**
 * CutReveal
 *
 * A masked/clip animation that reveals content from a clipped region.
 * Content slides up from behind a mask — not a simple fade.
 *
 * @param {Object}  props
 * @param {boolean} props.isVisible - whether to reveal
 * @param {number}  [props.delay=0] - animation delay in seconds
 * @param {number}  [props.duration=0.6] - animation duration
 * @param {string}  [props.className] - additional classes
 * @param {React.ReactNode} props.children
 */
function CutReveal({ isVisible, delay = 0, duration = 0.6, className = '', children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={{ opacity: isVisible ? 1 : 0 }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{
        clipPath: 'inset(100% 0 0 0)',
        y: -16,
        opacity: 0,
      }}
      animate={
        isVisible
          ? {
              clipPath: 'inset(0% 0 0 0)',
              y: 0,
              opacity: 1,
            }
          : {
              clipPath: 'inset(100% 0 0 0)',
              y: -16,
              opacity: 0,
            }
      }
      transition={{
        clipPath: { duration, delay, ease: EASING },
        y: { duration, delay, ease: EASING },
        opacity: { duration: duration * 0.6, delay, ease: EASING },
      }}
    >
      {children}
    </motion.div>
  );
}

export default CutReveal;
