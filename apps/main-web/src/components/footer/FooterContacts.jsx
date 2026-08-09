import { motion } from 'framer-motion';
import { TextSwap } from '@dikshant/ui';
import FooterSocials from './FooterSocials';
import React, { useEffect, useState } from 'react';

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
                    hover:text-[--dark-color]
                    dark:hover:text-[--light-color]
                "
            >
                India (GMT +5:30) — {indiaTime}
            </motion.p>

        </motion.address>
    );
};

export default FooterContacts;
