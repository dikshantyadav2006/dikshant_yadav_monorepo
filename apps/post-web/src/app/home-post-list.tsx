'use client';

import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Eye, Flame } from 'lucide-react';
import apiFetch from '../lib/api';

interface PostListProps {
  initialPosts: any;
  categories: any[];
}

export function HomePostList({ initialPosts, categories }: PostListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Infinite query for posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts-list', selectedCategory],
    queryFn: async ({ pageParam = 1 }) => {
      const categoryFilter = selectedCategory !== 'all' ? `&categorySlug=${selectedCategory}` : '';
      return apiFetch(`/posts?page=${pageParam}&limit=6${categoryFilter}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialData: selectedCategory === 'all' ? {
      pages: [initialPosts],
      pageParams: [1],
    } : undefined,
  });

  // Load more on scroll to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="space-y-10">
      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/40 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-accent text-white shadow-glow-primary'
              : 'bg-card/50 hover:bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          All Articles
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat.slug
                ? 'bg-accent text-white shadow-glow-primary'
                : 'bg-card/50 hover:bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of posts */}
      {status === 'pending' && selectedCategory !== 'all' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[380px] w-full rounded-2xl border border-border bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground/80">
          No posts found in this category.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {posts.map((post: any, idx: number) => {
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Draft';

              return (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-card hover:shadow-premium dark:hover:shadow-premium-dark glow-effect"
                >
                  <div className="space-y-4">
                    {/* Featured Image if present */}
                    {post.featuredImage && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                        <img
                          src={post.featuredImage.publicUrl}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Metadata bar */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/90">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readingTime} min
                      </span>
                    </div>

                    {/* Category Label */}
                    {post.category && (
                      <span className="inline-block rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-accent uppercase">
                        {post.category.name}
                      </span>
                    )}

                    {/* Title and Excerpt */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-accent transition-colors duration-200">
                        {post.title}
                      </h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground/90 leading-relaxed">
                        {post.excerpt || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {post._count?.views || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5" />
                        {post._count?.reactions || 0}
                      </span>
                    </div>
                    <a
                      href={`/posts/${post.slug}`}
                      className="flex items-center gap-1 text-foreground group-hover:text-accent transition-all duration-200"
                    >
                      Read Article
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Infinite scrolling spinner */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}
    </div>
  );
}
export default HomePostList;
