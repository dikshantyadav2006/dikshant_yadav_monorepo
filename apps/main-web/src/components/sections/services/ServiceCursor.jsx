import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

function ServiceCursor({ active }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.set(ref.current, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.5 });

    const move = (e) => {
      gsap.to(ref.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power3.out',
      });
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      opacity: active ? 1 : 0,
      scale: active ? 1 : 0.5,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [active]);

  return createPortal(
    <div
      ref={ref}
      className="fixed top-0 left-0 pointer-events-none mix-blend-difference will-change-transform"
      style={{
        width: 40,
        height: 40,
        background: 'white',
        zIndex: 999999,
      }}
    />,
    document.body
  );
}

export default ServiceCursor;
