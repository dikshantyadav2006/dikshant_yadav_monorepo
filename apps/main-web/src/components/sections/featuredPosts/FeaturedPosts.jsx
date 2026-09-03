import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { DirectionalCursor } from '@dikshant/ui';
import { useHomepagePosts } from '@hooks';

const POST_URL = import.meta.env.VITE_POST_URL || 'https://posts.dikshantyadav.in';

const rowVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

function ArrowIcon({ className = '' }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="2" y1="7.5" x2="13" y2="7.5" />
      <polyline points="9,3.5 13,7.5 9,11.5" />
    </svg>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function thumbnail(post) {
  if (post.featuredBannerImage?.publicUrl) return post.featuredBannerImage.publicUrl;
  if (post.featuredImage?.publicUrl) return post.featuredImage.publicUrl;
  return '';
}

function PostRow({ post, index, onHover, onLeave, active }) {
  const categoryName = post.category?.name || 'ARTICLE';
  const href = `${POST_URL}/posts/${post.id}/${post.slug}`;

  return (
    <motion.li
      custom={index}
      variants={rowVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`group ${active ? 'cursor-none' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read article: ${post.title}`}
        className="flex items-center gap-4 md:gap-8 border-b border-[rgba(18,19,21,0.09)] dark:border-[rgba(238,244,244,0.09)] py-4 md:py-5 px-2 md:px-4 transition-colors duration-300 ease-out hover:bg-[rgba(18,19,21,0.03)] dark:hover:bg-[rgba(238,244,244,0.03)]"
      >
        <span className="shrink-0 w-4 text-right text-[10px] md:text-[11px] font-light tabular-nums tracking-[0.05em] text-[rgba(18,19,21,0.35)] dark:text-[rgba(238,244,244,0.35)]">
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="shrink-0 text-[10px] md:text-[11px] font-normal uppercase tracking-[0.14em] text-[rgba(18,19,21,0.5)] dark:text-[rgba(238,244,244,0.5)] min-w-[72px] md:min-w-[96px]">
          {categoryName}
        </span>

        <span className="flex-1 text-[13px] md:text-[15px] font-extralight uppercase tracking-[0.02em] leading-relaxed text-[#121315] dark:text-[#EEF4F4] transition-opacity duration-300 group-hover:opacity-70">
          {post.title}
        </span>

        <span className="shrink-0 hidden md:flex items-center gap-2">
          <time dateTime={post.publishedAt ?? undefined} className="text-[9px] md:text-[10px] font-light uppercase tracking-[0.12em] text-[rgba(18,19,21,0.35)] dark:text-[rgba(238,244,244,0.35)]">
            {formatDate(post.publishedAt) || post.createdAt?.slice?.(0, 7)}
          </time>
        </span>

        <span className={`shrink-0 transition-all duration-300 ease-out text-[#121315]/50 dark:text-[#EEF4F4]/50 ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
          <ArrowIcon />
        </span>
      </a>
    </motion.li>
  );
}

function HoverCard({ post }) {
  const image = thumbnail(post);

  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    >
      {image ? (
        <div className="w-full h-full overflow-hidden rounded-lg border border-[rgba(18,19,21,0.09)] dark:border-[rgba(238,244,244,0.09)] bg-[#F7F6F3] dark:bg-[#1b1c1f]">
          <img
            src={image}
            alt={post.featuredImage?.alt || post.title}
            loading="lazy"
            className="w-full h-full object-cover grayscale contrast-[1.02] hover:grayscale-0 transition-[filter] duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center rounded-lg border border-[rgba(18,19,21,0.09)] dark:border-[rgba(238,244,244,0.09)] bg-[#F7F6F3] dark:bg-[#1b1c1f] text-center px-8">
          <span className="font-['font-p-1'] text-[clamp(1.5rem,2.5vw,3rem)] leading-tight uppercase tracking-tight text-[#121315] dark:text-[#EEF4F4]">
            {post.title}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function FeaturedPosts() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { featured, latest, loading, error } = useHomepagePosts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorActive, setCursorActive] = useState(false);

  const displayList = featured.length > 0 ? featured : latest;
  const activePost = displayList[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      aria-label="Featured Posts"
    >
      {/* Shared directional cursor (same as work-site project nav) */}
      <DirectionalCursor
        active={cursorActive}
        label="Read"
        scaled={cursorActive}
      />
      <div className="relative z-10">
        {/* Top label */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="px-[6vw] md:px-[7vw] lg:px-[8vw] pt-[10vh] md:pt-[13vh] lg:pt-[16vh]"
        >
          <span className="text-[11px] md:text-[12px] uppercase tracking-[0.18em] font-light text-[rgba(18,19,21,0.5)] dark:text-[rgba(238,244,244,0.5)]">
            (LATEST ARTICLES.)
          </span>
        </motion.div>

        {/* Main heading */}
        <div className="px-[6vw] md:px-[7vw] lg:px-[8vw] mt-8 md:mt-10 mb-16 md:mb-24">
          <motion.h2
            variants={headerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="font-['font-p-1'] text-[clamp(2.8rem,7vw,8rem)] leading-[0.9] tracking-tight uppercase m-0 p-0 select-none text-[#121315] dark:text-[#EEF4F4]"
          >
            FEATURED
            <br />
            ARTICLES
          </motion.h2>
        </div>

        {/* Split layout: hover card left, list right */}
        <div className="px-[6vw] md:px-[7vw] lg:px-[8vw] pb-[12vh] md:pb-[16vh]">
          <div className="flex flex-col-reverse lg:flex-row lg:items-start lg:gap-[6vw]">
            {/* Left: hover card */}
            <div className="lg:w-[38%] lg:sticky lg:top-32 mt-10 lg:mt-0">
              <div className="relative aspect-[4/3] w-full max-w-[460px]">
                <AnimatePresence mode="wait">
                  {activePost && <HoverCard post={activePost} />}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: list */}
            <div className="lg:w-[52%]">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse border-b border-[rgba(18,19,21,0.08)] dark:border-[rgba(238,244,244,0.08)]"
                    />
                  ))}
                </div>
              ) : error && displayList.length === 0 ? (
                <p className="text-sm text-[rgba(18,19,21,0.5)] dark:text-[rgba(238,244,244,0.5)]">
                  {error}
                </p>
              ) : displayList.length > 0 ? (
                <ul className="border-t border-[rgba(18,19,21,0.12)] dark:border-[rgba(238,244,244,0.12)]">
                  {displayList.map((post, i) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      index={i}
                      active={i === activeIndex}
                      onHover={() => {
                        setActiveIndex(i);
                        setCursorActive(true);
                      }}
                      onLeave={() => {
                        setActiveIndex(0);
                        setCursorActive(false);
                      }}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[rgba(18,19,21,0.5)] dark:text-[rgba(238,244,244,0.5)]">
                  No articles published yet.
                </p>
              )}

              {/* Go to posts CTA */}
              <motion.div
                variants={headerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ delay: 0.2 }}
                className="mt-12 md:mt-16 flex justify-end"
              >
                <a
                  href={POST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Go to the posts website to read all articles"
                  className="group inline-flex items-center gap-3 text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-light text-[#121315] dark:text-[#EEF4F4] transition-colors duration-300"
                >
                  <span className="border-b border-[rgba(18,19,21,0.2)] dark:border-[rgba(238,244,244,0.2)] pb-1 transition-colors group-hover:border-[#121315] dark:group-hover:border-[#EEF4F4]">
                    Go to Posts
                  </span>
                  <ArrowIcon className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedPosts;
