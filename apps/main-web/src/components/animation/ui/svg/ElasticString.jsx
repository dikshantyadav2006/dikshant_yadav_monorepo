import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const ElasticString = ({ height = 200, className = "" }) => {
    const pathRef = useRef(null);
    const containerRef = useRef(null);

    useGSAP(() => {
        // Helper to generate the flat path string based on current size
        const getFinalPath = () => {
            const width = containerRef.current.offsetWidth;
            const center = height / 2;
            // M 0 100 = Start (Left)
            // Q ${width/2} 100 = Control Point (Middle)
            // ${width} 100 = End (Right)
            return `M 0 ${center} Q ${width / 2} ${center} ${width} ${center}`;
        };

        // Initialize the path immediately
        gsap.set(pathRef.current, { attr: { d: getFinalPath() } });

        const handleMouseMove = (e) => {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const width = rect.width;
            const center = height / 2;

            // Update curve: Start(0, center) -> Control(mouseX, mouseY) -> End(width, center)
            const newPath = `M 0 ${center} Q ${x} ${y} ${width} ${center}`;

            gsap.to(pathRef.current, {
                attr: { d: newPath },
                duration: 0.2,
                ease: "power3.out",
            });
        };

        const handleMouseLeave = () => {
            // Snap back to the straight line (re-calculated in case size changed)
            gsap.to(pathRef.current, {
                attr: { d: getFinalPath() },
                duration: 1.5,
                ease: "elastic.out(1, 0.2)",
            });
        };

        // Handle Window Resize (Optional but recommended)
        const handleResize = () => {
            gsap.set(pathRef.current, { attr: { d: getFinalPath() } });
        }

        const container = containerRef.current;
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("resize", handleResize);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("resize", handleResize);
        };
    }, { scope: containerRef, dependencies: [height] }); // Re-run if height prop changes

    return (
        <div
            ref={containerRef}
            // Combine incoming className with default layout styles
            // 'text-current' ensures SVG inherits color
            className={`relative w-full flex items-center justify-center ${className}`}
            style={{ height: `${height}px` }}
        >
            <svg width="100%" height="100%" style={{ overflow: "visible" }}>
                <path
                    ref={pathRef}
                    d=""
                    stroke="currentColor" // <--- THIS IS THE KEY CHANGE
                    strokeWidth="2"
                    fill="transparent"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default ElasticString;