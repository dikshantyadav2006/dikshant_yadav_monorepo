'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * SwapChar
 *
 * Two identical layers of the same character in an overflow-hidden mask.
 *
 * REST:   Layer 1 visible (y:0%),  Layer 2 hidden below (y:110%)
 * HOVER:  Layer 1 exits UP (y:-110%), Layer 2 enters from below (y:0%)
 * LEAVE:  Layer 2 exits DOWN (y:110%), Layer 1 re-enters from above (y:0%)
 *
 * Both layers use the same smooth premium easing — one leaves as the other arrives.
 */
const SwapChar = React.memo(({ char, isHovered, delay }) => {
    const ctrlTop = useAnimation();
    const ctrlBottom = useAnimation();

    useEffect(() => {
        if (isHovered) {
            ctrlTop.start({
                y: '-110%',
                transition: {
                    duration: 0.8,
                    delay,
                    ease: [0.16, 1, 0.3, 1],
                },
            });
            ctrlBottom.start({
                y: '0%',
                transition: {
                    duration: 0.8,
                    delay,
                    ease: [0.16, 1, 0.3, 1],
                },
            });
        } else {
            ctrlBottom.start({
                y: '110%',
                transition: {
                    duration: 0.8,
                    delay,
                    ease: [0.16, 1, 0.3, 1],
                },
            });
            ctrlTop.start({
                y: '0%',
                transition: {
                    duration: 0.8,
                    delay,
                    ease: [0.16, 1, 0.3, 1],
                },
            });
        }
    }, [isHovered, ctrlTop, ctrlBottom, delay]);

    return (
        <span
            className="relative inline-flex items-end overflow-hidden align-bottom"
            style={{ verticalAlign: 'bottom' }}
        >
            {/* Layer 1 — Top (in flow, sizes the container) */}
            <motion.span
                className="relative z-10 block leading-none will-change-transform"
                animate={ctrlTop}
                initial={{ y: '0%' }}
            >
                {char === ' ' ? '\u00A0' : char}
            </motion.span>

            {/* Layer 2 — Bottom (absolute, same text, hidden below) */}
            <motion.span
                className="absolute inset-0 z-0 block leading-none will-change-transform"
                animate={ctrlBottom}
                initial={{ y: '110%' }}
            >
                {char === ' ' ? '\u00A0' : char}
            </motion.span>
        </span>
    );
});

/**
 * TextSwap
 *
 * Two identical text layers. On hover, top exits up and bottom enters from below.
 * Same smooth premium easing on both directions.
 *
 * @param {string} text     - The text to display
 * @param {number} stagger  - Delay between each character (default 0.04)
 * @param {string} className - Additional CSS classes
 */
const TextSwap = ({ text, stagger = 0.04, className = '' }) => {
    const [isHovered, setIsHovered] = useState(false);

    const onMouseEnter = useCallback(() => setIsHovered(true), []);
    const onMouseLeave = useCallback(() => setIsHovered(false), []);

    const chars = useMemo(() => text.split(''), [text]);

    return (
        <span
            className={`relative inline-flex ${className}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {chars.map((char, i) => (
                <SwapChar
                    key={i}
                    char={char}
                    isHovered={isHovered}
                    delay={i * stagger}
                />
            ))}
        </span>
    );
};

export default TextSwap;
