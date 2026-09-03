'use client';

import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * DirectionalCursor
 *
 * A shared, self-contained custom cursor that reproduces the Next/Prev project
 * cursor used on the work website. It is a white circular dot with a
 * mix-blend-difference blend, an arrow that rotates by direction, and a small
 * label beneath it. It tracks the mouse via a window-level listener so it can
 * be dropped into any container without wiring up motion values manually.
 *
 * No style or behavior has been changed from the original work-site cursor.
 *
 * @param {Object}  props
 * @param {boolean} props.active        - show/hide the cursor (e.g. while hovering the host region)
 * @param {boolean} props.clicked       - collapse the cursor after a click
 * @param {string}  props.label         - text shown beneath the dot (e.g. "Scroll", "Prev", "Next")
 * @param {number}  [props.rotation]    - rotation in degrees (e.g. 0, 90, -90)
 * @param {boolean} [props.scaled]      - enlarge the dot (1.1x) while over something clickable
 * @param {number}  [props.arrowRotation] - rotate only the arrow by degrees (label stays upright)
 */
export default function DirectionalCursor({
  active = false,
  clicked = false,
  label = '',
  rotation = 0,
  scaled = false,
  arrowRotation = 0,
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Render via portal to document.body so the cursor escapes any transform
  // ancestor (e.g. locomotive-scroll containers) that would otherwise break
  // position:fixed tracking. Preserves the exact visuals/behavior of the
  // original work-site cursor.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
      style={{ x: smoothX, y: smoothY }}
    >
      <motion.div
        className="
          -ml-8
          -mt-8
          w-16
          h-16
          rounded-full
          flex
          items-center
          justify-center
          backdrop-blur-xl
          border
          border-white/20
          bg-white
          origin-center
        "
        animate={{
          opacity: active && !clicked ? 1 : 0,
          scale: clicked ? 0 : scaled ? 1.1 : 1,
          rotate: rotation,
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 28,
        }}
      >
        <motion.span
          className="flex items-center justify-center"
          animate={{ rotate: arrowRotation }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 28,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4V20" />
            <path d="M6 14L12 20L18 14" />
          </svg>
        </motion.span>

        <motion.span
          className="
            absolute
            -bottom-[22px]
            text-[9px]
            uppercase
            tracking-[0.25em]
            text-white
            whitespace-nowrap
          "
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.span>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
