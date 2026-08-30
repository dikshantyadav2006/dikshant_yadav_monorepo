'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import TransitionLink from '@/components/ui/transition/TransitionLink';
import { motion } from 'framer-motion';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const SLIDESHOW_INTERVAL_MS = 250;

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const accent = project.swatchColor || '#D2D8CB';
  const cardImage = project.imageUrl || project.heroImageUrl || '';
  const previewImages = (project.previewImages ?? []).filter((src): src is string => !!src && src.trim() !== '');
  const previewVideo = project.previewVideo || '';
  const hasMedia = previewImages.length > 0 || Boolean(previewVideo);

  // Fast cover flip (0.25s) through the work's images while hovered.
  useEffect(() => {
    if (!isHovered || previewImages.length < 2) return;
    setImgIndex(0);
    const id = window.setInterval(() => {
      setImgIndex((current) => (current + 1) % previewImages.length);
    }, SLIDESHOW_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isHovered, previewImages.length]);

  const videoPoster = previewVideo ? previewImages[0] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.08,
      }}
      className="group relative h-[400px] md:h-[560px] overflow-hidden bg-[#ddd]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'none' }}
    >
      <TransitionLink href={`/project/${project.slug}`} className="block w-full h-full">
        {/* Project Number */}
        <span className="absolute top-4 right-6 z-30 font-display text-[60px] md:text-[80px] leading-none text-white/15 select-none pointer-events-none">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Base media — card image, or plain accent + title fallback */}
        {cardImage ? (
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <Image
              src={cardImage}
              alt={project.title}
              fill
              priority={index === 0}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              decoding="async"
            />
          </motion.div>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: accent }}
          >
            <h3 className="font-condensed uppercase font-black tracking-[-0.02em] text-[clamp(40px,5vw,88px)] leading-[0.9] text-center text-black">
              {project.title}
            </h3>
            {project.category && (
              <p className="font-sans text-black/50 text-[12px] uppercase tracking-[0.14em] mt-3">
                {project.category}
              </p>
            )}
          </div>
        )}

        {/* Hover Overlay — tinted by work accent */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ backgroundColor: accent }}
          animate={{ opacity: isHovered ? 0.16 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Bottom-to-center shadow that rises on hover */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 40%, rgba(0,0,0,0) 62%)',
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Inner media card — video or fast image slideshow */}
        {hasMedia && (
          <div className="absolute left-1/2 top-1/2 z-20 w-[min(80%,440px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              className="w-full rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
              style={{ aspectRatio: '16 / 10' }}
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 28,
                scale: isHovered ? 1 : 0.84,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {previewVideo && isHovered ? (
                <video
                  key={previewVideo}
                  className="w-full h-full object-cover"
                  src={previewVideo}
                  poster={videoPoster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                isHovered && (
                  <div className="relative w-full h-full">
                    {previewImages.map((src, i) => (
                      <Image
                        key={src}
                        src={src}
                        alt=""
                        fill
                        sizes="440px"
                        className="object-cover transition-opacity duration-300"
                        style={{ opacity: i === imgIndex ? 1 : 0 }}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    ))}
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}

        {/* Project Info — slides up on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-8 pointer-events-none"
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full mb-2"
            style={{ backgroundColor: accent }}
          />
          <h3 className="font-display text-white text-[18px] md:text-[22px] uppercase tracking-[0.05em] mb-1">
            {project.title}
          </h3>
          <p className="font-sans text-white/70 text-[12px] md:text-[13px] uppercase tracking-[0.12em]">
            {project.category}
          </p>
          {project.techStack && project.techStack.length > 0 && (
            <p className="font-sans text-white/50 text-[11px] uppercase tracking-[0.1em] mt-2">
              {project.techStack.join(' \u2022 ')}
            </p>
          )}
        </motion.div>
      </TransitionLink>
    </motion.div>
  );
}