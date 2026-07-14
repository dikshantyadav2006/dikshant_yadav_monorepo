import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import FooterBrand from "./FooterBrand";
import FooterNav from "./FooterNav";
import FooterContacts from "./FooterContacts";
import { footerContent } from "@/constants/footerLinks";
import { ElasticString, ClockAnimation } from "@animation";

/**
 * Footer Component
 * Main footer orchestrating all sub-components with Swiss design principles
 * - Typography-driven layout
 * - Minimal, clean spacing
 * - Fully responsive (mobile, tablet, desktop)
 * - Smooth Framer Motion animations
 *
 * @component
 */
const Footer = ({ addCursor, removeCursor, cursorModes }) => {
    const ref = useRef(null);
    const currentYear = new Date().getFullYear();
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Direct imperative event handlers (NO STATE)
        // On hover: ADD target cursor (both SPLASH + TARGET visible)
        const handleEnter = () => addCursor(cursorModes.TARGET);
        // On leave: REMOVE target cursor (only SPLASH visible)
        const handleLeave = () => removeCursor(cursorModes.TARGET);

        el.addEventListener("mouseenter", handleEnter);
        el.addEventListener("mouseleave", handleLeave);

        return () => {
            el.removeEventListener("mouseenter", handleEnter);
            el.removeEventListener("mouseleave", handleLeave);
        };
    }, [addCursor, removeCursor, cursorModes]);
    return (
        <div ref={ref}>
            <div
                className="relative"
                style={{ width: "100vw", mixBlendMode: "difference" }}
            >
                <div className="absolute  top-[200%] scale-75 left-[5%] -translate-x-1/2 w-[400px] h-[400px] pointer-events-none select-none opacity-90">
                    <ClockAnimation />
                </div>

                {/* This will be full screen width */}
                <ElasticString color="black" height={300} />
            </div>

            {/* CTA Section - All screens */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                className="py-10 sm:py-14 md:py-16 lg:py-0"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center">
                    <h2
                        className="font-['playground'] text-[10vw] sm:text-[9vw] md:text-[8vw] xl:text-[10vw] leading-none tracking-tight text-[var(--dark-color)] dark:text-[var(--light-color)] cursor-target whitespace-nowrap"
                        style={{ fontWeight: 300 }}
                    >
                        Let's work together!
                    </h2>
                </div>
            </motion.div>

            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                className="  font-['font-p-3']      pb-16 md:pb-20 lg:pb-24 "
            >
                <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
                    {/* Brand + Content Grid */}
                    <div className="space-y-12 lg:space-y-0">
                        {/* Content Grid: Navigation (Left) + Contacts (Right) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                            {/* Left Column: Navigation Sections */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                                className="space-y-10"
                            >
                                {/* Internal Navigation */}
                                <div>
                                    <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6">
                                        Navigation
                                    </h2>
                                    <FooterNav links={footerContent.navigation} />
                                </div>

                                {/* External Links */}
                                <div>
                                    <FooterNav links={footerContent.externalLinks} />
                                </div>
                            </motion.div>

                            {/* Right Column: Contact Information */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                                className="lg:col-start-3"
                            >
                                <FooterContacts
                                    contact={footerContent.contact}
                                    socials={footerContent.socials}
                                />
                            </motion.div>
                        </div>
                    </div>
                    <FooterBrand name={footerContent.brand.name} />

                    {/* Footer Bottom: Copyright & Legal */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                        className="    border-gray-200    flex     flex-col      font-['font-p-2']     md:flex-row     md:items-center     md:justify-between      border-t      gap-4"
                    >
                        <p className="  hover:text-white  cursor-target cursor-nonedark:hover:text-[--light-color] text-xs md:text-sm text-gray-500 uppercase tracking-wide">
                            © {currentYear} {footerContent.brand.fullName}. All rights
                            reserved.
                        </p>
                        <nav className="flex gap-6">
                            <a
                                href="#privacy"
                                className="  text-xs md:text-sm   text-gray-500   uppercase   tracking-wide  transition-colors  duration-300  hover:text-white dark:hover:text-[--light-color]            cursor-target cursor-none "
                            >
                                Privacy
                            </a>
                            <a
                                href="#terms"
                                className="    uppercase    text-gray-500    tracking-wide    transition-colors    duration-300    hover:text-white    dark:hover:text-[--light-color]    cursor-target    text-xs md:text-sm   cursor-none "
                            >
                                Terms
                            </a>
                        </nav>
                    </motion.div>
                </div>
            </motion.footer>
        </div>
    );
};

export default Footer;
