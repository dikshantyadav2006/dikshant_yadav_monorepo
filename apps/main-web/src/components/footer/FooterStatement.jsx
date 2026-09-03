import { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * FooterStatement Component
 * Massive statement typography spanning nearly the full width.
 * Reveals line-by-line with clip-path wipes driven by scroll.
 *
 * @param {Object} props
 * @param {string} props.text - The statement text (uppercased)
 */
const FooterStatement = ({ text }) => {
  const rootRef = useRef(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      if (reducedMotion) return;

      const spans = root.querySelectorAll('[data-statement-line]');
      if (spans.length === 0) return;

      gsap.fromTo(
        spans,
        { clipPath: 'inset(0 0 100% 0)', yPercent: 30 },
        {
          clipPath: 'inset(0% 0 0% 0)',
          yPercent: 0,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.16,
          scrollTrigger: {
            trigger: root,
            start: 'top 95%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, [text, reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        ref={rootRef}
        className="w-full"
      >
        <p className="font-['font-p-1'] font-black uppercase tracking-[-0.03em] leading-[0.92] text-center text-[clamp(40px,7.2vw,120px)] text-[var(--dark-color)] dark:text-[var(--light-color)]">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="w-full"
    >
      <p
        aria-label={text}
        className="
          font-['font-p-1']
          font-black
          uppercase
          tracking-[-0.03em]
          leading-[0.92]
          text-center
          text-[clamp(40px,7.2vw,120px)]
          text-[var(--dark-color)]
          dark:text-[var(--light-color)]
        "
      >
        {text.split(/(\s+)/).map((segment, i) =>
          /\s/.test(segment) ? (
            <span key={i}>&nbsp;</span>
          ) : (
            <span
              key={i}
              data-statement-line
              className="inline-block"
            >
              {segment}
            </span>
          )
        )}
      </p>
    </div>
  );
};

export default FooterStatement;
