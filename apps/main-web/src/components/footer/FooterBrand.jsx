import { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * FooterBrand Component
 * Massive typography-centric brand name.
 * Each line reveals with a clip-path wipe on scroll into view.
 *
 * The name is split into words so it wraps naturally while each
 * word masks in from below; longer names wrap onto multiple lines.
 *
 * @param {Object} props
 * @param {string} props.name - The brand name (displayed uppercase)
 */
const FooterBrand = ({ name }) => {
  const rootRef = useRef(null);

  const words = useMemo(() => name.split(' '), [name]);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return undefined;

    const spans = root.querySelectorAll('[data-brand-word]');

    const ctx = gsap.context(() => {
      if (reducedMotion) return;

      gsap.fromTo(
        spans,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: root,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, [reducedMotion]);

  const reducedStyle = reducedMotion
    ? undefined
    : { opacity: 0, willChange: 'transform, opacity' };

  return (
    <div
      ref={rootRef}
      className="overflow-hidden"
    >
      <h2
        aria-label={name}
        className="
          font-['font-p-1']
          font-black
          uppercase
          tracking-[-0.04em]
          leading-[0.9]
          text-[clamp(56px,11vw,190px)]
          text-center
          text-[var(--dark-color)]
          dark:text-[var(--light-color)]
          [text-wrap:balance]
        "
      >
        {words.map((word, i) => (
          <span
            key={i}
            data-brand-word
            style={reducedStyle}
            className="inline-block mr-[0.08em] whitespace-nowrap"
          >
            {word}
          </span>
        ))}
      </h2>
    </div>
  );
};

export default FooterBrand;
