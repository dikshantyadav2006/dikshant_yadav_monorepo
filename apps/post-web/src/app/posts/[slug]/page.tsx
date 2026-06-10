import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin, Link2, Eye, Flame } from 'lucide-react';
import mdxComponents from '../../../components/mdx-renderer';
import ReadingProgress from '../../../components/reading-progress';
import TableOfContents from '../../../components/table-of-contents';
import ReactionBoard from '../../../components/reaction-board';
import ShareButtons from './share-buttons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getPost(slug: string) {
  try {
    // bypass cache so that views update on each request
    const res = await fetch(`${API_URL}/posts/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

async function getRelatedPosts(postId: string) {
  try {
    const res = await fetch(`${API_URL}/related?postId=${postId}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  return (
    <div className="relative py-4 space-y-12">
      {/* Scroll Reading Progress */}
      <ReadingProgress />

      {/* Back button */}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to articles
      </a>

      {/* Article Header */}
      <header className="space-y-6">
        {post.category && (
          <span className="inline-block rounded-md bg-accent/15 px-3 py-1 text-xs font-bold tracking-wider text-accent uppercase">
            {post.category.name}
          </span>
        )}
        <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight leading-tight text-foreground">
          {post.title}
        </h1>
        
        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border/40 pb-6">
          <span className="font-semibold text-foreground/80">{post.author?.name || 'Dikshant Yadav'}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} min read
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post._count?.views || 0} views
          </span>
        </div>
      </header>

      {/* Featured Cover Image */}
      {post.featuredImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-premium dark:shadow-premium-dark">
          <img
            src={post.featuredImage.publicUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Article Grid Content Layout */}
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Main Body Column */}
        <div className="lg:col-span-8">
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <MDXRemote
              source={post.content?.body || ''}
              components={mdxComponents}
            />
          </article>

          {/* Reactions board */}
          <div className="border-t border-border/40 mt-12 pt-8">
            <ReactionBoard postId={post.id} />
          </div>
        </div>

        {/* Floating Sidebar */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-premium dark:shadow-premium-dark">
            <TableOfContents />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-premium dark:shadow-premium-dark space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Share Article</h3>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border/40 pt-12 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Related Articles
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedPosts.map((related: any) => (
              <a
                key={related.id}
                href={`/posts/${related.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/40 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-card hover:shadow-premium"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-wider text-accent uppercase">
                    {related.category?.name || 'Article'}
                  </span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                    {related.title}
                  </h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {related.excerpt || 'Read the full writeup.'}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 mt-4 pt-3 text-[10px] text-muted-foreground">
                  <span>{related.readingTime} min read</span>
                  <span className="flex items-center gap-0.5 text-foreground font-semibold group-hover:text-accent">
                    Read →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
