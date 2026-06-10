import React from 'react';
import {LogoLoop} from '@animation';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
} from 'react-icons/si';

/**
 * Tech logos (React Icons based)
 */
const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
];

/**
 * LogoMarquee Component
 * Smooth infinite marquee for tech / brand logos
 */
const LogoMarquee = ({ isDarkMode }) => {
  return (
    <section className="relative w-full overflow-hidden py-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
      {/* Horizontal marquee */}
      <LogoLoop
        logos={techLogos}
        speed={100}
        direction="left"
        logoHeight={56}
        gap={64}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor={isDarkMode ? 'var(--dark-color)' : 'var(--light-color)'}
        ariaLabel="Technology stack"
      />

      {/* Optional second row (reverse / variation) */}
      {/* <div className="mt-10">
        <LogoLoop
          logos={techLogos}
          speed={80}
          direction="right"
          logoHeight={48}
          gap={64}
          hoverSpeed={20}
          fadeOut
          useCustomRender={false}
          ariaLabel="Technology stack secondary"
        />
      </div> */}
    </section>
  );
};

export default LogoMarquee;
