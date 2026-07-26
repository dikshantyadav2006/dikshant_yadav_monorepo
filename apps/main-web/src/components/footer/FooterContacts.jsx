
import { motion, useAnimation } from 'framer-motion';
import FooterSocials from './FooterSocials';
import React, { useEffect, useState, useMemo, useCallback } from 'react';

/**
 * Framer Motion variants
 */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.15,
        },
    },
};
const getIndiaTime = () => {
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date());
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

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

/**
 * FooterContacts Component
 * Displays contact information: phone, email, address, and social links
 *
 * @param {Object} props
 * @param {Object} props.contact - Contact details (phone, email, address)
 * @param {string} props.contact.phone - Phone number
 * @param {string} props.contact.email - Email address
 * @param {string} props.contact.address - Physical address or location
 * @param {Array<{platform: string, href: string, label: string}>} props.socials - Social media links
 */
const FooterContacts = ({ contact, socials }) => {
    const [indiaTime, setIndiaTime] = useState(getIndiaTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setIndiaTime(getIndiaTime());
        }, 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <motion.address
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            className="not-italic space-y-8 p-6 w-max min-w-[320px] md:min-w-[400px]"
        >
            {/* Phone */}
            <motion.div variants={itemVariants}>
                <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="
                        block
                        text-[8.5vw]
                        md:text-[3.5vw]
                        font-black font-['font-p-1']
                        lowercase
                        cursor-none
                        hover:text-[--secondary-dark-color]
                        dark:hover:text-[--secondary-light-color]
                        cursor-target
                        w-fit
                    "
                >
                    <TextSwap text={contact.phone} />
                </a>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
                <a
                    href={`mailto:${contact.email}`}
                    className="
                        cursor-target
                        block
                        text-[8.5vw]
                        md:text-[3.5vw]
                        font-black font-['font-p-1']
                        lowercase
                        cursor-none
                        hover:text-[--secondary-dark-color]
                        dark:hover:text-[--secondary-light-color]
                        w-fit
                    "
                >
                    <TextSwap text={contact.email} />
                </a>
            </motion.div>

            {/* Socials */}
            <motion.div variants={itemVariants}>
                <FooterSocials links={socials} />
            </motion.div>

            {/* Address */}
            <motion.p
                variants={itemVariants}
                className="
                    text-xs md:text-sm
                    text-gray-500
                    uppercase
                    tracking-wide
                    pt-4
                    border-t
                    border-gray-200
                    hover:text-white
                    dark:hover:text-[--primary-light-color]
                "
            >
                India (GMT +5:30) — {indiaTime}
            </motion.p>

        </motion.address>
    );
};

export default FooterContacts;
