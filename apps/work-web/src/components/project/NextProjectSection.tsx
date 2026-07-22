'use client';

import TransitionLink from '@/components/ui/transition/TransitionLink';
import { motion } from 'framer-motion';

interface AdjacentProject {
  title: string;
  image: string;
  slug: string;
}

interface NextProjectProps {
  prevProject: AdjacentProject | null;
  nextProject: AdjacentProject | null;
}

function ProjectLink({
  project,
  label,
}: {
  project: AdjacentProject;
  label: string;
}) {
  return (
    <TransitionLink
      href={`/project/${project.slug}`}
      className="group relative block overflow-hidden"
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
  if (!prevProject && !nextProject) return null;

  return (
    <section className="py-[60px] md:py-[80px] border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border">
          {prevProject ? (
            <ProjectLink project={prevProject} label="Previous Project" />
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
            <ProjectLink project={nextProject} label="Next Project" />
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
