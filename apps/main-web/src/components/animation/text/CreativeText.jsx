import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CreativeText = ({ text , size}) => {
  const lettersRef = useRef([]);
  const intervalRef = useRef(null);

  const randomAnimation = (el) => {
    const first = el.querySelector('.first');
    const second = el.querySelector('.second');
    const origins = ['top', 'bottom', 'left', 'right'];
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const animationProps = { duration: 2, ease: 'power3.out' };

    if (first && second) {
      gsap.set(first, { clearProps: 'all' });
      gsap.set(second, { clearProps: 'all' });

      const animations = {
        top: () => {
          gsap.fromTo(first, { y: "0%" }, { y: "-100%", ...animationProps });
          gsap.fromTo(second, { y: "100%" }, { y: "0%", ...animationProps });
        },
        bottom: () => {
          gsap.fromTo(first, { y: "0%" }, { y: "100%", ...animationProps });
          gsap.fromTo(second, { y: "-100%" }, { y: "0%", ...animationProps });
        },
        left: () => {
          gsap.fromTo(first, { x: "0%" }, { x: "100%", ...animationProps });
          gsap.fromTo(second, { x: "-100%" }, { x: "0%", ...animationProps });
        },
        right: () => {
          gsap.fromTo(first, { x: "0%" }, { x: "-100%", ...animationProps });
          gsap.fromTo(second, { x: "100%" }, { x: "0%", ...animationProps });
        }
      };

      animations[origin]();
    }
  };

  useEffect(() => {
    if (lettersRef.current.length > 0) {
      const randomDelay = Math.floor(Math.random() * 2000 + 500);
      intervalRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * lettersRef.current.length);
        const randomLetter = lettersRef.current[randomIndex];
        if (randomLetter) {
          randomAnimation(randomLetter);
        }
      }, randomDelay);
    }

    return () => clearInterval(intervalRef.current);
  }, [text]);

  return (
    <>
      {text.split('').map((char, index) => (
        <span
          key={index}
          ref={(el) => { if (el) lettersRef.current[index] = el; }}
          className={`relative inline-flex items-center justify-center overflow-hidden`}
        >
          <span className="first absolute inset-0 flex items-center justify-center leading-none pl-1">
            {char === ' ' ? '\u00A0' : char}
          </span>
          <span className="second relative leading-none pl-1">
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </>
  );
};

export default CreativeText;
