import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeft } from 'lucide-react';
import mdxComponents from '../../../components/mdx-renderer';
import ReadingProgress from '../../../components/reading-progress';
import TableOfContents from '../../../components/table-of-contents';
import ReactionBoard from '../../../components/reaction-board';
import ShareButtons from './share-buttons';
import { NodeRenderer } from '../../../components/renderer/NodeRenderer';

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
    <div className="relative py-4 max-w-[70ch] mx-auto space-y-10">
      {/* Scroll Reading Progress */}
      <ReadingProgress />

      {/* Back button */}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to articles
      </a>

      {/* Article Header */}
      <header className="space-y-4 pt-4">
        {post.category && (
          <span className="inline-block rounded bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
            {post.category.name}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-foreground font-sans">
          {post.title}
        </h1>
        
        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-2 font-medium">
          <span className="text-foreground/90">{post.author?.name || 'Dikshant Yadav'}</span>
          <span>•</span>
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{post.readingTime} min read</span>
          {post._count?.views !== undefined && (
            <>
              <span>•</span>
              <span>{post._count.views} views</span>
            </>
          )}
        </div>
      </header>

      <hr className="border-border/40 my-6" />

      {/* Featured Cover Image */}
      {post.featuredImage && (
        <>
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border/40 bg-muted/10">
            <img
              src={post.featuredImage.publicUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
          <hr className="border-border/40 my-6" />
        </>
      )}

      {/* Article Content Layout */}
      <div className="relative">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          {post.canvasData?.blocks ? (
            <NodeRenderer blocks={post.canvasData.blocks} />
          ) : (
            <MDXRemote
              source={post.content?.body || ''}
              components={mdxComponents}
            />
          )}
        </article>

        {/* Floating Sidebar (Large screens) */}
        <aside className="hidden xl:block xl:absolute xl:left-[calc(100%+4rem)] xl:top-0 xl:w-56 h-fit space-y-8 sticky top-24">
          <div className="rounded-xl border border-border/40 bg-card/10 p-5 backdrop-blur-sm">
            <TableOfContents />
          </div>
        </aside>

        {/* Reactions board & Share (Bottom of article) */}
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <ReactionBoard postId={post.id} />
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Share Article</h3>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border/40 pt-12 space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
            Related Articles
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {relatedPosts.slice(0, 3).map((related: any) => (
              <a
                key={related.id}
                href={`/posts/${related.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/10 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-card/25"
              >
                <div className="space-y-3">
                  <span className="text-[9px] font-bold tracking-wider text-accent uppercase">
                    {related.category?.name || 'Article'}
                  </span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors font-sans line-clamp-2">
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
