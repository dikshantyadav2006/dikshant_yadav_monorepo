import { useRef, useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FooterBrand from './FooterBrand';
import FooterNav from './FooterNav';
import FooterTaglines from './FooterTaglines';
import FooterContactLinks from './FooterContactLinks';
import FooterStatement from './FooterStatement';
import FooterBottom from './FooterBottom';
import EditorialContactForm from './EditorialContactForm';
import { footerContent } from '@/constants/footerLinks';

const MarbleBackground = lazy(() => import('./MarbleBackground'));

gsap.registerPlugin(ScrollTrigger);

const CONTACT_API_URL = `${import.meta.env.VITE_API_URL || "https://api.dikshantyadav.in"}/contact-submissions`;

async function submitContactForm(data) {
    const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            email: data.email,
            message: data.message,
            budget: data.budget,
            source: "connect",
        }),
    });

    if (!response.ok) {
        let message = "Something went wrong";
        try {
            const body = await response.json();
            message = body.message || message;
        } catch {
            // ignore parse failure, fall back to generic message
        }
        throw new Error(message);
    }
}

/**
 * Footer Component
 * Ultra-minimal, typography-first, Awwwards-grade footer.
 * - Massive brand typography
 * - Interactive marble/stone texture background (WebGL)
 * - Scroll-driven reveals via GSAP
 *
 * @component
 */
const Footer = ({ addCursor, removeCursor, cursorModes, isDarkMode }) => {
    const ref = useRef(null);
    const currentYear = new Date().getFullYear();
    const [showTexture, setShowTexture] = useState(false);

    const reducedMotion = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleEnter = () => addCursor(cursorModes.FOLLOWER);
        const handleLeave = () => removeCursor(cursorModes.FOLLOWER);

        el.addEventListener('mouseenter', handleEnter);
        el.addEventListener('mouseleave', handleLeave);

        return () => {
            el.removeEventListener('mouseenter', handleEnter);
            el.removeEventListener('mouseleave', handleLeave);
        };
    }, [addCursor, removeCursor, cursorModes]);

    // Defer mounting the WebGL marble texture until the footer scrolls near view
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShowTexture(true);
                        io.disconnect();
                    }
                });
            },
            { rootMargin: '0px 0px 200px 0px', threshold: 0 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        const root = ref.current;
        if (!root || reducedMotion) return undefined;

        const els = {
            nav: root.querySelector('[data-footer-nav]'),
            taglines: root.querySelector('[data-footer-taglines]'),
            contacts: root.querySelector('[data-footer-contacts]'),
            divider: root.querySelector('[data-footer-divider]'),
            bottom: root.querySelector('[data-footer-bottom]'),
        };

        const ctx = gsap.context(() => {
            // Navigation slides upward slightly
            if (els.nav) {
                gsap.fromTo(
                    els.nav,
                    { y: 24, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: root,
                            start: 'top 92%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // Contact links + taglines fade in
            if (els.taglines) {
                gsap.fromTo(
                    els.taglines,
                    { opacity: 0, y: 14 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: root,
                            start: 'top 82%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            if (els.contacts) {
                gsap.fromTo(
                    els.contacts,
                    { opacity: 0, y: 16 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: 'power2.out',
                        delay: 0.3,
                        scrollTrigger: {
                            trigger: root,
                            start: 'top 78%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            if (els.divider) {
                gsap.fromTo(
                    els.divider,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: 1.4,
                        ease: 'power3.inOut',
                        scrollTrigger: {
                            trigger: els.divider,
                            start: 'top 95%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            if (els.bottom) {
                gsap.fromTo(
                    els.bottom,
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: 1,
                        ease: 'power1.out',
                        delay: 0.5,
                        scrollTrigger: {
                            trigger: els.bottom,
                            start: 'top 98%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }
        }, root);

        return () => ctx.revert();
    }, [reducedMotion]);

    return (
        <div ref={ref} className="relative">
            {/* Interactive marble texture background - spans entire footer area */}
            {showTexture && (
                <Suspense fallback={null}>
                    <MarbleBackground isDarkMode={isDarkMode} />
                </Suspense>
            )}

            {/* CTA Section - Editorial Contact Form */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true, margin: '0px 0px -100px 0px' }}
                className="relative z-10 py-8 sm:py-10 md:py-12 lg:py-16"
            >
                <EditorialContactForm
                    title="Let's work together!"
                    budgets={['5K–10K', '10K–20K', '20K–50K', 'Custom']}
                    onSubmit={(data) => submitContactForm(data)}
                />
            </motion.div>

            <footer className="relative font-['font-p-3']">
                {/* Content */}
                <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 lg:px-12 pt-8 md:pt-12">
                    <div data-footer-divider className="mx-auto mb-5 max-w-md origin-center border-t border-current/10" />

                    <div className="flex flex-col items-center text-center">
                        {/* Top Navigation Row */}
                        <div
                            data-footer-nav
                            className="mb-8 md:mb-12"
                        >
                            <FooterNav links={footerContent.navigation} />
                        </div>

                        {/* Main Section */}
                        <div className="w-full">
                            <div data-footer-name>
                                <FooterBrand name={footerContent.brand.name} />
                            </div>

                            <div
                                data-footer-taglines
                                className="mt-3 md:mt-4"
                            >
                                <FooterTaglines taglines={footerContent.brand.taglines} />
                            </div>

                            <div
                                data-footer-contacts
                                className="mt-6 md:mt-8"
                            >
                                <FooterContactLinks links={footerContent.contactLinks} />
                            </div>
                        </div>

                        {/* Massive Statement */}
                        <div
                            data-footer-statement
                            className="mt-10 w-full md:mt-14"
                        >
                            <FooterStatement text={footerContent.brand.statement} />
                        </div>

                        {/* Bottom Row */}
                        <div
                            data-footer-bottom
                            className="mt-8 md:mt-12"
                        >
                            <FooterBottom
                                currentYear={currentYear}
                                fullName={footerContent.brand.fullName}
                                builtWith={footerContent.brand.builtWith}
                                legal={footerContent.legal}
                            />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
