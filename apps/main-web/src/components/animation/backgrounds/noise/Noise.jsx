import { useRef, useEffect } from 'react';

const Noise = ({
    patternRefreshInterval = 2,
    patternAlpha = 15
}) => {
    const grainRef = useRef(null);

    useEffect(() => {
        const canvas = grainRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame = 0;
        let animationId;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            const { width, height } = parent.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // CSS size (layout)
            canvas.style.width = '100%';
            canvas.style.height = '100%';

            // Actual resolution (retina safe)
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const drawGrain = () => {
            const w = canvas.width;
            const h = canvas.height;
            const imageData = ctx.createImageData(w, h);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const value = Math.random() * 255;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
                data[i + 3] = patternAlpha;
            }

            ctx.putImageData(imageData, 0, 0);
        };

        const loop = () => {
            if (frame % patternRefreshInterval === 0) {
                drawGrain();
            }
            frame++;
            animationId = requestAnimationFrame(loop);
        };

        resize();
        loop();

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [patternRefreshInterval, patternAlpha]);

    return (
        <canvas
            ref={grainRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ imageRendering: 'pixelated' }}
        />
    );
};

export default Noise;
