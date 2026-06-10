import React from 'react';
import { motion } from 'framer-motion';

/**
 * Framer Motion variants for container and items
 */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
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
 * FooterNav Component
 * Displays navigation links with hover effects and underline animations
 *
 * @param {Object} props
 * @param {Array<{label: string, href: string, target?: string, rel?: string}>} props.links - Navigation links
 */
const FooterNav = ({ links }) => {
    return (
        <motion.nav
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            className="flex flex-col gap-4 md:gap-6"
        >
            {links.map((link) => (
                <motion.a
                    key={link.href}
                    variants={itemVariants}
                    href={link.href}
                    target={link.target}
                    rel={link.rel}
                    className="
            group
            inline-block
            text-sm md:text-base
            font-semibold
            uppercase
            tracking-wide
            hover:text-[--secondary-dark-color]
            dark:hover:text-[--secondary-light-color]
            relative
            w-fit
            cursor-target

          "
                >
                    <span className="relative">
                        {link.label}
                        <motion.span
                            className="
                absolute
                bottom-0
                left-0
                h-px
                origin-left
                 hover:text-[--primary-dark-color]
                             dark:hover:text-[--primary-light-color]
              "
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: '100%' }}
                        />
                    </span>
                </motion.a>
            ))}
        </motion.nav>
    );
};

export default FooterNav;
