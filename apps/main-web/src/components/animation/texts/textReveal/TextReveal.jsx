import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASING = [0.16, 1, 0.3, 1];

const splitText = (text, mode) => {
  if (mode === 'word') {
    return text.split(/(\s+)/).filter(Boolean);
  }

  return text.split('');
};

const TextReveal = ({
  text,
  by = 'char',
  delay = 0,
  stagger = 0.04,
  once = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const segments = useMemo(() => splitText(text, by), [text, by]);

  if (shouldReduceMotion) {
    return (
      <span className={className} aria-label={text}>
        <span aria-hidden="true">{text}</span>
      </span>
    );
  }

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {segments.map((segment, i) => {
          if (by === 'word' && /^\s+$/.test(segment)) {
            return <span key={i}>{segment}</span>;
          }

          return (
            <motion.span
              key={i}
              className="inline-flex items-end overflow-hidden align-bottom"
              style={{ verticalAlign: 'bottom' }}
              initial={{ y: '100%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once, margin: '0px 0px -10% 0px' }}
              transition={{
                y: {
                  duration: 1,
                  ease: EASING,
                  delay: delay + i * stagger,
                },
              }}
            >
              <span className="block leading-none">
                {by === 'word' ? segment : segment === ' ' ? '\u00A0' : segment}
              </span>
            </motion.span>
          );
        })}
      </span>
    </span>
  );
};

export default TextReveal;
