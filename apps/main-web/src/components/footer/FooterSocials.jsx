import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/**
 * Framer Motion variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
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
 * FooterSocials Component
 * Displays social media links with animated arrow icon
 *
 * @param {Object} props
 * @param {Array<{platform: string, href: string, label: string}>} props.links - Social links
 */
const FooterSocials = ({ links }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      className="flex flex-col gap-3 md:gap-4"
    >
      {links.map((link) => (
        <motion.a
          key={link.platform}
          variants={itemVariants}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="
            cursor-target
            group
            inline-flex
            items-center
            gap-2
            text-sm md:text-base
            font-semibold
            uppercase
            tracking-wide
            transition-all
            duration-300
             hover:text-[--primary-dark-color]
                             dark:hover:text-[--primary-light-color]
            w-fit
          "
        >
          <span>{link.label}</span>
          <motion.div
            initial={{ x: 0, y: 0 }}
            whileHover={{ x: 2, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
          </motion.div>
        </motion.a>
      ))}
    </motion.div>
  );
};

export default FooterSocials;
