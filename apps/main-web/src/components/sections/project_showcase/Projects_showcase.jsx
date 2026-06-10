import React, { useRef, useEffect } from 'react'
import { LiquidEther } from '@animation'

// 🔥 GSAP REACT
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const Projects_showcase = ({ addCursor, removeCursor, cursorModes, isDarkMode }) => {
    const ref = useRef(null)
    const liquidRef = useRef(null)

    // ❌❌❌ DO NOT TOUCH - CURSOR HANDLER FOR THE SECTION
    useEffect(() => {
        const el = ref.current
        if (!el) return

        const handleEnter = () => {
            removeCursor(cursorModes.SPLASH)
            removeCursor(cursorModes.TARGET)
            addCursor(cursorModes.FOLLOWER)
        }

        const handleLeave = () => {
            removeCursor(cursorModes.FOLLOWER)
            addCursor(cursorModes.SPLASH)
        }

        el.addEventListener('mouseenter', handleEnter)
        el.addEventListener('mouseleave', handleLeave)

        return () => {
            el.removeEventListener('mouseenter', handleEnter)
            el.removeEventListener('mouseleave', handleLeave)
        }
    }, [addCursor, removeCursor, cursorModes])

    // ✅ GSAP REACT (NO PIN, ONLY SCROLL)
    useGSAP(() => {
        const section = ref.current
        const liquid = liquidRef.current
        if (!section || !liquid) return

        gsap.fromTo(
            liquid,
            { scale: 0.75 },
            {
                scale: 1,
                ease: 'easeInOut',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            }
        )
    }, { scope: ref })

    return (
        <div
            ref={ref}
            className="w-[100%] mx-auto my-20"
            style={{ height: '300vh' }} // scroll space
        >
            {/* STICKY WRAPPER */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div
                    ref={liquidRef}
                    style={{
                        width: '100%',
                        height: 600,
                        position: 'relative',
                        transformOrigin: 'center',
                        willChange: 'transform',
                    }}
                >
                    <svg width="100%" height="1" viewBox="0 0 100 4" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="2" x2="100" y2="2" stroke={isDarkMode ? "#fff" : "#000"} strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <LiquidEther
                        colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                        mouseForce={20}
                        cursorSize={100}
                        isViscous
                        viscous={30}
                        iterationsViscous={32}
                        iterationsPoisson={32}
                        resolution={0.5}
                        isBounce={false}
                        autoDemo
                        autoSpeed={0.5}
                        autoIntensity={2.2}
                        takeoverDuration={0.25}
                        autoResumeDelay={3000}
                        autoRampDuration={0.6}
                        color0="#5227FF"
                        color1="#FF9FFC"
                        color2="#B19EEF"
                    />
                    <svg width="100%" height="1" viewBox="0 0 100 4" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="2" x2="100" y2="2" stroke={isDarkMode ? "#fff" : "#000"} strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default Projects_showcase
