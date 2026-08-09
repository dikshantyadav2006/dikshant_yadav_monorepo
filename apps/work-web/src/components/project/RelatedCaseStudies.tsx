'use client';

import { motion } from 'framer-motion';
import { POST_SITE_URL } from '@/lib/constants';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: { publicUrl?: string; alt?: string | null } | null;
}

interface RelatedCaseStudiesProps {
  posts: RelatedPost[];
}

export default function RelatedCaseStudies({ posts }: RelatedCaseStudiesProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="px-1 py-[60px] md:py-[80px] border-t border-border">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-[40px]">
        <h2 className="font-display text-[clamp(40px,6vw,80px)] leading-[0.9] uppercase tracking-[-0.04em] font-black">
          Related Case Studies
        </h2>
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] opacity-40">
          Read the write-up
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[4px]">
        {posts.map((post, index) => (
          <motion.a
            key={post.id}
            href={`${POST_SITE_URL}/posts/${post.id}/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.08,
            }}
            className="group relative block h-[260px] md:h-[360px] overflow-hidden bg-[#ddd]"
          >
            {post.featuredImage?.publicUrl ? (
              <img
                src={post.featuredImage.publicUrl}
                alt={post.featuredImage.alt || post.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            ) : (
              <div className="absolute inset-0 bg-bg" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-display text-white text-[18px] md:text-[20px] uppercase tracking-[0.05em] leading-tight">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="font-sans text-white/70 text-[12px] leading-relaxed mt-2 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
