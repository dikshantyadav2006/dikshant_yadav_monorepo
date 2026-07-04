
// varient 1: Circular Gallery with Percentage Counter Animation



import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const LandingAnimation = () => {
    const containerRef = useRef(null);
    const counterRef = useRef(null);

    const texts = [
        { text: "MAX • FUTURE FRONTEND DEVELOPER • ", radius: 55, fontSize: "12px" },
        { text: "CREATIVE • DESIGN • ", radius: 80, fontSize: "14px" },
        { text: "FRONTEND • DEVELOPER • ", radius: 105, fontSize: "16px" },
        { text: "REACT • GSAP • TAILWIND • ", radius: 135, fontSize: "18px" },
        { text: "THREE.JS • WEBGL • CANVAS • ", radius: 170, fontSize: "20px" },
        { text: "WORDPRESS • BLENDER • ", radius: 210, fontSize: "22px" },
    ];

    useGSAP(() => {
        // Random target percentage between 91-99
        const targetPercentage = Math.floor(Math.random() * 9) + 91;
        const animationDuration = 1.8; // Duration for counter to reach target

        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" }
        });

        // 1. Text Animation - Animate textPath startOffset for smooth circular motion
        texts.forEach((_, i) => {
            const direction = i % 2 === 0 ? 1 : -1;
            const textPathElement = containerRef.current.querySelector(`#textPath-${i}`);
            
            if (textPathElement) {
                tl.to(textPathElement, {
                    attr: { startOffset: `${150 * direction}%` },
                    duration: animationDuration,
                    ease: "none",
                }, 0);
            }
        });

        // 2. Counter Animation (0% to random 91-99%)
        tl.to(counterRef.current, {
            innerText: targetPercentage,
            duration: animationDuration,
            snap: { innerText: 1 },
            onUpdate: function () {
                if (counterRef.current) {
                    const currentProgress = gsap.getProperty(counterRef.current, "innerText");
                    counterRef.current.innerText = Math.round(currentProgress) + "%";
                }
            }
        }, 0);

        // 3. Exit Animation (starts after counter reaches target)
        tl.to(containerRef.current, {
            scale: 1.5,
            opacity: 0,
            duration: .41,
            delay: -0.53,
            display: "none",
            ease: "power4.in"
        }, animationDuration);

    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            className="dark:bg-[--dark-color] bg-[--light-color] text-[--dark-color] dark:text-[--light-color] absolute w-full h-screen overflow-hidden flex items-center justify-center"
        >
            <div className="relative w-[800px] h-[800px] flex items-center justify-center">
                <svg
                    viewBox="0 0 600 600"
                    className="w-full h-full overflow-visible"
                    style={{ transformBox: 'fill-box' }}
                >
                    {texts.map((item, index) => (
                        <g key={index} className={`ring-${index}`}>
                            <path
                                id={`circlePath-${index}`}
                                d={`
                  M 300, 300
                  m -${item.radius}, 0
                  a ${item.radius},${item.radius} 0 1,1 ${item.radius * 2},0
                  a ${item.radius},${item.radius} 0 1,1 -${item.radius * 2},0
                `}
                                fill="transparent"
                            />

                            <text
                                className="font-bold uppercase dark:fill-[--light-color] fill-[--dark-color] tracking-[4px]"
                                fontSize={item.fontSize}
                                style={{ userSelect: 'none' }}
                            >
                                <textPath
                                    id={`textPath-${index}`}
                                    href={`#circlePath-${index}`}
                                    startOffset="0%"
                                >
                                    {item.text.repeat(3)}
                                </textPath>
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Center Percentage Counter */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <h1 ref={counterRef} className="text-2xl font-[font-p-1]  font-thin">
                        0%
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default LandingAnimation
