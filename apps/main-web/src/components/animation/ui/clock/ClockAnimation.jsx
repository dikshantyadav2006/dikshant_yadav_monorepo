import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClockAnimation = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hh = time.getHours().toString().padStart(2, '0');
    const mm = time.getMinutes().toString().padStart(2, '0');
    const ss = time.getSeconds();

    const totalTicks = 60;

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="relative flex items-center justify-center">
                {/* SVG Clock Face */}
                <svg width="400" height="400" viewBox="0 0 200 200">
                    <g transform="translate(100, 100)">
                        {[...Array(totalTicks)].map((_, i) => {
                            const isRemaining = i >= ss;
                            return (
                                <motion.line
                                    key={i}
                                    x1="0"
                                    y1="-75"
                                    x2="0"
                                    y2="-88"
                                    stroke="#374151"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    initial={false}
                                    animate={{
                                        // Jo seconds bache hain unki opacity 1, baaki ki 0.1
                                        opacity: isRemaining ? 1 : 0.21,
                                        scaleY: isRemaining ? 1 : 0.98,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeOut"
                                    }}
                                    style={{
                                        originY: "75px",
                                        rotate: i * 6,
                                        transformBox: "fill-box"
                                    }}
                                />
                            );
                        })}
                        {/* Digital Time Display */}
                        <text
                            x="0"
                            y="-20"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            dy="0.35em"
                            fill="#374151"
                            style={{
                                fontSize: '24px',
                                fontWeight: 300,
                                letterSpacing: '-0.05em',
                                userSelect: 'none'
                            }}
                        >
                            {hh}:{mm}
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default ClockAnimation;