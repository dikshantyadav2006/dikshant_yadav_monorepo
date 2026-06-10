// varient 2: Circular Gallery with Scroll-Linked Rotation Animation


import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const ScrollCircularGallery = () => {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);

    const texts = [
        { text: "SCROLL • EXPLORE • EXPERIENCE • ", radius: 60, fontSize: "12px" },
        { text: "INNOVATION • DESIGN • CREATIVITY • ", radius: 90, fontSize: "14px" },
        { text: "INTERACTIVE • INTERFACE • VISUAL • ", radius: 125, fontSize: "16px" },
        { text: "DEVELOPMENT • SOLUTIONS • MOTION • ", radius: 165, fontSize: "18px" },
        { text: "TRANSFORM • DIGITAL • REALITY • ", radius: 210, fontSize: "20px" },
    ];

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",      // Start when container hits top of viewport
                end: "+=2000",         // Duration of the scroll effect (2000px)
                scrub: 1,              // Smoothly links animation to scrollbar
                pin: true,             // Pins the section while animating
                markers: false,
            }
        });

        // 1. Rotate Rings based on scroll
        texts.forEach((_, i) => {
            const direction = i % 2 === 0 ? 1 : -1;
            const textPathElement = containerRef.current.querySelector(`#textPath-${i}`);
            
            if (textPathElement) {
                tl.to(textPathElement, {
                    attr: { startOffset: `${200 * direction}%` },
                    ease: "none",
                }, 0);
            }
        });

        // 2. Add a dynamic scale/zoom effect as you scroll deep
        tl.to(wrapperRef.current, {
            scale: 2,
            opacity: 0.2,
            ease: "power1.inOut"
        }, 0);

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black text-white overflow-hidden">
            <div ref={wrapperRef} className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 600 600" className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] overflow-visible">
                    {texts.map((item, index) => (
                        <g key={index}>
                            <path
                                id={`circlePath-${index}`}
                                d={`M 300, 300 m -${item.radius}, 0 a ${item.radius},${item.radius} 0 1,1 ${item.radius * 2},0 a ${item.radius},${item.radius} 0 1,1 -${item.radius * 2},0`}
                                fill="transparent"
                            />
                            <text fontSize={item.fontSize} className="fill-white font-bold uppercase tracking-widest">
                                <textPath
                                    id={`textPath-${index}`}
                                    href={`#circlePath-${index}`}
                                    startOffset="0%"
                                >
                                    {item.text.repeat(4)}
                                </textPath>
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute bottom-10 w-full text-center opacity-50 uppercase text-xs tracking-[0.2em]">
                Scroll Down
            </div>
        </div>
    );
};

export default ScrollCircularGallery;