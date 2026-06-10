import React from 'react';
import HomePostList from './home-post-list';
import { Calendar, Clock, ArrowRight, Eye, Flame } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getInitialPosts() {
  try {
    const res = await fetch(`${API_URL}/posts?page=1&limit=6`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    // Return empty list fallback to prevent build crash
    return { posts: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 0 } };
  }
}

async function getFeaturedPosts() {
  try {
    const res = await fetch(`${API_URL}/posts?featured=true&limit=3`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const [initialPosts, featuredPosts, categories] = await Promise.all([
    getInitialPosts(),
    getFeaturedPosts(),
    getCategories(),
  ]);

  const heroPost = featuredPosts[0] || initialPosts.posts[0];
  const remainingFeatured = featuredPosts.slice(1);

  return (
    <div className="space-y-16 py-4">
      {/* Hero / Glass Grid Layout */}
      <section className="relative rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/20 p-6 sm:p-10 shadow-premium dark:shadow-premium-dark overflow-hidden grid-bg">
        {/* Glowing background anchor */}
        <div className="absolute top-0 right-1/4 h-[250px] w-[250px] rounded-full bg-accent/10 blur-[80px] pointer-events-none animate-glow-pulse" />

        {heroPost ? (
          <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3.5 py-1 text-xs font-bold tracking-wider text-accent uppercase">
                ⚡ Featured Article
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold sm:text-4xl tracking-tight leading-tight text-foreground">
                  {heroPost.title}
                </h1>
                <p className="text-base text-muted-foreground/90 leading-relaxed max-w-xl">
                  {heroPost.excerpt || 'Read the full story of this featured post in engineering, design, and developer trends.'}
                </p>
              </div>

              {/* Author & reading stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/80">
                <span className="font-semibold text-foreground/80">{heroPost.author?.name || 'Dikshant Yadav'}</span>
                <span>•</span>
                <span>{heroPost.publishedAt ? new Date(heroPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}</span>
                <span>•</span>
                <span>{heroPost.readingTime} min read</span>
              </div>

              {/* Action Button */}
              <a
                href={`/posts/${heroPost.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-glow-primary hover:bg-accent/90 transition-all hover:scale-[1.02]"
              >
                Read Featured Post
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Featured Hero cover Image */}
            <div className="lg:col-span-5 relative aspect-video lg:aspect-square w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/20">
              <img
                src={heroPost.featuredImage?.publicUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'}
                alt={heroPost.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="relative z-10 text-center py-16 space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Welcome to dikshant.post
            </h1>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              A premium space where I share write-ups on developer ecosystems, full-stack architectures, and web trends.
            </p>
          </div>
        )}
      </section>

      {/* Main post grid list section */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Latest Publications
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse all articles, engineering logs, and technical writeups.
            </p>
          </div>
        </div>

        <HomePostList initialPosts={initialPosts} categories={categories} />
      </section>
    </div>
  );
}
