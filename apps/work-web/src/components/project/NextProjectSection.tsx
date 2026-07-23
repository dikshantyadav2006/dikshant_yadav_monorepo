'use client';

import { useRef, useState, useCallback } from 'react';
import TransitionLink from '@/components/ui/transition/TransitionLink';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface AdjacentProject {
  title: string;
  image: string;
  slug: string;
}

interface NextProjectProps {
  prevProject: AdjacentProject | null;
  nextProject: AdjacentProject | null;
}

type HoverSide = 'down' | 'left' | 'right';

function ProjectLink({
  project,
  label,
  onEnter,
  onLeave,
}: {
  project: AdjacentProject;
  label: string;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <TransitionLink
      href={`/project/${project.slug}`}
      className="group relative block overflow-hidden"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Image */}
      <motion.img
        src={project.image}
        alt={project.title}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          opacity-0
          scale-105
          group-hover:opacity-100
          group-hover:scale-100
          transition-all
          duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
        "
      />

      {/* Dark overlay */}
      <div
        className="
          absolute
          inset-0
          bg-black/0
          group-hover:bg-black/35
          transition-all
          duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
        "
      />

      {/* Content */}
      <div
        className="
          relative
          z-10
          min-h-[320px]
          md:min-h-[420px]
          flex
          flex-col
          items-center
          justify-center
          p-8
        "
      >
        <p
          className="
            text-[11px]
            uppercase
            tracking-[0.3em]
            opacity-40
            group-hover:text-white
            group-hover:opacity-100
            transition-all
            duration-500
          "
        >
          {label}
        </p>

        <h2
          className="
            font-display
            uppercase
            font-black
            text-[clamp(48px,8vw,140px)]
            tracking-[-0.06em]
            leading-[0.9]
            mt-4
            text-center
            group-hover:text-white
            transition-all
            duration-500
          "
        >
          {project.title}
        </h2>
      </div>
    </TransitionLink>
  );
}

export default function NextProjectSection({ prevProject, nextProject }: NextProjectProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoverSide, setHoverSide] = useState<HoverSide>('down');
  const [isActive, setIsActive] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    [mouseX, mouseY],
  );

  const handleSectionEnter = useCallback(() => setIsActive(true), []);
  const handleSectionLeave = useCallback(() => {
    setIsActive(false);
    setHoverSide('down');
  }, []);

  const handlePrevEnter = useCallback(() => setHoverSide('left'), []);
  const handleNextEnter = useCallback(() => setHoverSide('right'), []);
  const handleProjectLeave = useCallback(() => setHoverSide('down'), []);

  if (!prevProject && !nextProject) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-[60px] md:py-[80px] border-t border-border cursor-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleSectionEnter}
      onMouseLeave={handleSectionLeave}
    >
      {/* Custom Cursor */}
      <motion.div
        className="
          pointer-events-none
          fixed
          left-0
          top-0
          z-[9999]
          mix-blend-difference
        "
        style={{ x: smoothX, y: smoothY }}
      >
        <motion.div
          className="
            -ml-8
            -mt-8
            w-16
            h-16
            rounded-full
            flex
            items-center
            justify-center
            backdrop-blur-xl
            border
            border-white/20
            bg-white
          "
          animate={{
            opacity: isActive ? 1 : 0,
            scale: hoverSide === 'down' ? 1 : 1.1,
            rotate: hoverSide === 'left' ? -90 : hoverSide === 'right' ? 90 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 28,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4V20" />
            <path d="M6 14L12 20L18 14" />
          </svg>

          <motion.span
            className="
              absolute
              -bottom-[22px]
              text-[9px]
              uppercase
              tracking-[0.25em]
              text-white
              whitespace-nowrap
            "
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {hoverSide === 'left' ? 'Prev' : hoverSide === 'right' ? 'Next' : 'Scroll'}
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border">
          {prevProject ? (
            <ProjectLink
              project={prevProject}
              label="Previous Project"
              onEnter={handlePrevEnter}
              onLeave={handleProjectLeave}
            />
          ) : (
            <div className="min-h-[320px] md:min-h-[420px] bg-bg flex items-center justify-center p-8">
              <TransitionLink
                href="/"
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.3em]
                  opacity-40
                  hover:opacity-100
                  transition-opacity
                  duration-300
                "
              >
                Back to Works
              </TransitionLink>
            </div>
          )}

          {nextProject ? (
            <ProjectLink
              project={nextProject}
              label="Next Project"
              onEnter={handleNextEnter}
              onLeave={handleProjectLeave}
            />
          ) : (
            <div className="min-h-[320px] md:min-h-[420px] bg-bg flex items-center justify-center p-8">
              <TransitionLink
                href="/"
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.3em]
                  opacity-40
                  hover:opacity-100
                  transition-opacity
                  duration-300
                "
              >
                Back to Works
              </TransitionLink>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
