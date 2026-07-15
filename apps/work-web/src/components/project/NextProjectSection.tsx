'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface NextProjectProps {
  title: string;
  image: string;
  slug: string;
}

export default function NextProjectSection({ title, image, slug }: NextProjectProps) {
  return (
    <section className="py-[80px] md:py-[120px] border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mb-[40px]">
          Next Project
        </p>

        <Link href={`/project/${slug}`} className="group inline-block">
          <div className="w-[280px] md:w-[350px] mx-auto mb-[30px] overflow-hidden">
            <motion.img
              src={image}
              alt={title}
              className="w-full h-auto object-cover"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <h2 className="font-display text-[clamp(28px,4vw,56px)] leading-[0.9] uppercase tracking-[-0.03em] font-black group-hover:opacity-60 transition-opacity duration-300">
            {title}
          </h2>

          <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40 mt-3">
            Previous Project
          </p>
        </Link>
      </motion.div>
    </section>
  );
}
