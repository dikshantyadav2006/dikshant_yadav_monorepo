import React from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValue
} from "framer-motion";

const AnimationCircularText2 = ({
    items = [],
    center = 300
}) => {
    const { scrollYProgress } = useScroll();

    // rotate all rings together (perfect circle)
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    return (
        <svg width="600" height="600" viewBox="0 0 600 600">
            <motion.g
                style={{
                    rotate,
                    originX: `${center}px`,
                    originY: `${center}px`
                }}
            >
                {items.map((item, ringIndex) => {
                    const {
                        text,
                        radius = 180,
                        fontSize = 18
                    } = item;

                    const repeatedText = text.repeat(10);

                    return (
                        <g key={ringIndex}>
                            <defs>
                                <path
                                    id={`circlePath-${ringIndex}`}
                                    d={`
                    M ${center},${center}
                    m -${radius},0
                    a ${radius},${radius} 0 1,1 ${radius * 2},0
                    a ${radius},${radius} 0 1,1 -${radius * 2},0
                  `}
                                />
                            </defs>

                            <text fill="currentColor" fontSize={fontSize}>
                                <textPath href={`#circlePath-${ringIndex}`}>
                                    {repeatedText.split("").map((char, i) => (
                                        <IndividualLetter
                                            key={`${ringIndex}-${i}`}
                                            char={char}
                                            progress={scrollYProgress}
                                        />
                                    ))}
                                </textPath>
                            </text>
                        </g>
                    );
                })}
            </motion.g>
        </svg>
    );
};

// ================= Individual Letter =================

const IndividualLetter = ({ char, progress }) => {
    const safeProgress = progress ?? useMotionValue(0);

    // stable random per letter
    const scatterX = React.useMemo(
        () => (Math.random() - 0.5) * 120,
        []
    );
    const scatterY = React.useMemo(
        () => (Math.random() - 0.5) * 120,
        []
    );

    const x = useTransform(safeProgress, [0, 1], [0, scatterX]);
    const y = useTransform(safeProgress, [0, 1], [0, scatterY]);

    const opacity = useTransform(
        safeProgress,
        [0, 0.6, 1],
        [1, 0.8, 0]
    );

    return (
        <motion.tspan
            dx="0.6em"
            style={{ x, y, opacity }}
        >
            {char === " " ? "\u00A0" : char}
        </motion.tspan>
    );
};

export default AnimationCircularText2;
