import { useRef, useEffect, useState } from 'react';
import { Noise, ScrambledText, ScrollReveal } from '@animation';
import { motion, useScroll, useTransform } from 'framer-motion';

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1
        }
    }
};

const line = {
    hidden: {
        y: 20,
        opacity: 0,
        filter: 'blur(6px)'
    },
    show: {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

/**
 * ThinkingNote component - IMPERATIVE multi-cursor control
 * No useState, no re-renders, pure event-driven
 * Adds TARGET cursor on hover (SPLASH + TARGET both visible)
 */
const ThinkingNote = ({ addCursor, removeCursor, cursorModes }) => {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Direct imperative event handlers (NO STATE)
        // On hover: ADD target cursor (both SPLASH + TARGET visible)
        const handleEnter = () => addCursor(cursorModes.TARGET)
        // On leave: REMOVE target cursor (only SPLASH visible)
        const handleLeave = () => removeCursor(cursorModes.TARGET)

        el.addEventListener('mouseenter', handleEnter)
        el.addEventListener('mouseleave', handleLeave)

        return () => {
            el.removeEventListener('mouseenter', handleEnter)
            el.removeEventListener('mouseleave', handleLeave)
        }
    }, [addCursor, removeCursor, cursorModes])
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    const width = useTransform(
        scrollYProgress,
        [0, 0.5, 1],
        ["80vw", "100vw", "90vw"]
    )

    return (
        <div ref={ref} className="w-full overflow-x-hidden ">
            <motion.div
                ref={ref}
                style={{ width }}
                className="relative mx-auto rounded-md overflow-hidden p-[2vw] py-[5vh]"
            >

                <div className="absolute inset-0 z-[9999] pointer-events-none">
                    <div className="w-full h-full noise">
                        <Noise
                            patternSize={350}
                            patternScaleX={2}
                            patternScaleY={2}
                            patternRefreshInterval={2}
                            patternAlpha={15}
                        />
                    </div>
                </div>

                <motion.h1
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="text-4xl font-thin font-['font-p-2'] md:text-6xl lg:text-7xl  leading-tight tracking-tight uppercase"
                >
                    <motion.span variants={line} className="block">
                        It’s not just a
                    </motion.span>
                    <motion.span variants={line} className="block ml-[7vw]">
                        <span className='font-[font-p-1]  cursor-target'>profession</span> — it’s a <span className='font-[font-p-1]  cursor-target'>way</span>
                    </motion.span>
                    <motion.span variants={line} className="block">
                        of <span className='font-[font-p-3]  cursor-target'>thinking.</span>
                    </motion.span>
                </motion.h1>
                <div className="lg:max-w-[25vw] md:max-w-[60vw]  flex justify-self-center mt-12 md:mt-16 lg:mt-20 space-y-8 md:space-y-10 text-md md:text-md lg:text-xl  font-['font-p-4'] uppercase leading-relaxed tracking-wide font-extralight">
                    <div className="h3">
                        For me,<br /> <span className='font-[font-p-1] ml-[2vw] cursor-target'>design</span> is not just a profession but a way of <span className='font-[font-p-3] ml-[3vw]  cursor-target'>life</span>. As a UX/UI <br /><span className='font-[font-p-3] cursor-target'>designer</span>, I closely observe how people interact with <br /> <span className='cursor-target ml-6'>spaces, technology, and the products they use every day.</span>
                    </div>
                </div>
                <div className="lg:max-w-[45vw] min-h-[100vh] md:max-w-[70vw] flex justify-self-end   text-md md:text-md lg:text-xl font-['font-p-4'] uppercase leading-relaxed font-extralight ">
                    <ScrambledText
                        className="block dark:text-[--light-color] text-[--dark-color]"
                        radius={100}
                        duration={1.2}
                        speed={0.5}
                        scrambleChars=".:"
                    >
                        By <span className="font-[font-p-1] ">understanding</span> <br />
                        <span className="font-[font-p-3] ml-[2vw] ">human behavior</span> and <br />
                        <span className="ml-[3vw] ">psychology</span>, I strive to create <br />
                        designs that are not only <br />
                        <span className="font-[font-p-1] ">visually appealing</span> but also <br />
                        <span className="font-[font-p-3] ml-6 ">intuitive and user-friendly</span>. <br />
                        Design thinking allows me to <br />
                        <span className="">empathize with users</span>, identify <br />
                        their needs, and develop <br />
                        <span className="font-[font-p-1] ">innovative solutions</span> that enhance <br />
                        their experiences.
                    </ScrambledText>
                </div>
                <div className="lg:max-w-[30vw] min-h-[40vh] md:max-w-[70vw] flex justify-self-start font-['font-p-1'] uppercase leading-relaxed font-light text-md md:text-md lg:text-2xl ml-[5vw] cursor-target ">
                    <ScrollReveal
                        baseOpacity={0.1}
                        enableBlur
                        baseRotation={2}
                        blurStrength={7}
                    >
                        Every project I take on is  more than just a task—it’s a story I help tell through design.
                        I believe a good interface goes beyond colors and fonts;  it’s about the emotions and experiences it evokes
                    </ScrollReveal>
                </div>
            </motion.div>
        </div>
    );
};

export default ThinkingNote;
