// Varient 3: Circular Gallery with Smooth Auto-Rotation + Scroll-Linked Rotation + Scale & Opacity Animation


import React, { useRef, useEffect } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useTime,
    useMotionValue,
    useSpring,
} from "framer-motion";

const UniversalCircularGallery = ({
    items = [],
    autoRotate = true,
    dissapearOnScroll = false,
}) => {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    return (
        <div ref={containerRef} className="relative w-full h-[300vh] bg-[#c2c8b8]">
            <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
                <svg
                    viewBox="0 0 600 600"
                    className="w-[90vw] h-[90vw] max-w-[800px] overflow-visible"
                >
                    {items.map((item, index) => (
                        <Ring
                            key={index}
                            item={item}
                            index={index}
                            scrollYProgress={scrollYProgress}
                            autoRotate={autoRotate}
                            dissapearOnScroll={dissapearOnScroll}
                        />
                    ))}
                </svg>

                {/* Fixed Percentage Display */}
                <div className="absolute font-mono text-sm opacity-40">
                    <ScrollPercentage scrollYProgress={scrollYProgress} />
                </div>
            </div>
        </div>
    );
};

const Ring = ({ item, index, scrollYProgress, autoRotate, dissapearOnScroll }) => {
    const direction = index % 2 === 0 ? 1 : -1;

    // 1. Smooth Auto-Rotation
    const time = useTime();
    const rotateAuto = useTransform(time, (t) => {
        if (!autoRotate) return 0;
        return (t / (20000 + index * 5000)) * 360 * direction;
    });

    // 2. Scroll-based rotation
    const rotateScroll = useTransform(scrollYProgress, [0, 1], [0, 360 * direction]);

    // 3. Scale & Opacity
    const opacity = useTransform(scrollYProgress, [0.8, 0.95], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, dissapearOnScroll ? 0.3 : 2]);

    return (
        <motion.g
            style={{
                rotate: rotateAuto,
                originX: "300px",
                originY: "300px"
            }}
        >
            <defs>
                <path
                    id={`path-${index}`}
                    d={`M 300, 300 m -${item.radius}, 0 a ${item.radius},${item.radius} 0 1,1 ${item.radius * 2},0 a ${item.radius},${item.radius} 0 1,1 -${item.radius * 2},0`}
                />
            </defs>

            <motion.text
                fontSize={item.fontSize || "14px"}
                className="fill-black font-mono font-bold uppercase"
                style={{
                    opacity: dissapearOnScroll ? opacity : 1,
                    scale: scale,
                    rotate: rotateScroll,
                    originX: "300px",
                    originY: "300px",
                }}
                dominantBaseline="central"
            >
                <textPath href={`#path-${index}`} startOffset="0%">
                    {/* Repeating enough to close the circle gap */}
                    {`${item.text} `.repeat(15)}
                </textPath>
            </motion.text>
        </motion.g>
    );
};

// Fixed: No state updates, just direct DOM manipulation via useMotionValue
const ScrollPercentage = ({ scrollYProgress }) => {
    const displayValue = useMotionValue(0);

    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            displayValue.set(Math.floor(latest * 100));
        });
    }, [scrollYProgress, displayValue]);

    return (
        <div className="flex">
            <motion.span>{displayValue}</motion.span>
            <span>%</span>
        </div>
    );
};

export default UniversalCircularGallery;