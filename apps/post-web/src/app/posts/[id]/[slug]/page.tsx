import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import ReadingProgress from '@/components/ui/reading-progress';
import TableOfContents from '@/components/ui/table-of-contents';
import SmartImage from '@/components/ui/smart-image';
import ArticleHeader from '@/components/article/article-header';
import MetadataBar from '@/components/article/metadata-bar';
import RelatedArticles from '@/components/article/related-articles';
import ReactionBoard from '@/components/article/reaction-board';
import ShareButtons from '@/components/article/share-buttons';
import ContentRenderer from '@/components/content/content-renderer';
import { mdxComponents } from '@/components/content/mdx-renderer';
import { RelatedArticlesSkeleton } from '@/components/ui/article-skeleton';
import {
  getPostByPath,
  getRelatedPosts,
  getPostPath,
  getPosts,
} from '@/lib/posts';
import { resolveBlocks } from '@/lib/canvas';
import { SITE_URL } from '@/lib/constants';
import { logServerRender } from '@/lib/perf';

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export const revalidate = 30;

export async function generateStaticParams() {
  const data = await getPosts({ limit: 50 });
  return data.posts.map((post) => ({
    id: post.id,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, slug } = await params;
  const post = await getPostByPath(id, slug);
  if (!post) return { title: 'Not Found' };

  const canonical = post.canonicalUrl || `${SITE_URL}${getPostPath(post)}`;

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: post.featuredImage?.publicUrl ? [post.featuredImage.publicUrl] : undefined,
    },
    alternates: { canonical },
  };
}

async function RelatedArticlesSection({ postId }: { postId: string }) {
  const relatedPosts = await getRelatedPosts(postId);
  return <RelatedArticles posts={relatedPosts} />;
}

export default async function PostPage({ params }: PageProps) {
  const renderStart = performance.now();
  const { id, slug } = await params;
  const post = await getPostByPath(id, slug);

  if (!post) notFound();

  if (post.slug !== slug) {
    redirect(getPostPath(post));
  }

  const blocks = resolveBlocks(post.canvasData);
  const hasBlocks = blocks.length > 0;

  logServerRender('post-page', renderStart, {
    postId: post.id,
    hasBlocks,
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Abhay Singh Yadav',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Intelligence Archive',
      url: SITE_URL,
    },
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || undefined,
    url: `${SITE_URL}${getPostPath(post)}`,
    image: post.featuredImage?.publicUrl || undefined,
    ...(post.category && {
      articleSection: [post.category.name],
    }),
    ...(post.tags?.length && {
      keywords: post.tags
        .map((t) => ('tag' in t && t.tag ? t.tag.name : (t as { name: string }).name))
        .join(', '),
    }),
  };

  return (
    <>
      <ReadingProgress />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="relative article-enter">
        <ArticleHeader post={post} />
        <MetadataBar post={post} />

        {post.featuredImage && (
          <figure className="my-10 border-2 border-foreground overflow-hidden">
            <div className="relative aspect-[21/9] w-full bg-secondary">
              <SmartImage
                src={post.featuredImage.publicUrl}
                alt={post.featuredImage.alt || post.title}
                fill
                priority
                blurDataUrl={post.featuredImage.blurDataUrl}
                dominantColor={post.featuredImage.dominantColor}
                className="object-cover grayscale"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
            <figcaption className="border-t-2 border-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Cover — {post.title}
            </figcaption>
          </figure>
        )}

        <div className="grid gap-12 xl:grid-cols-[1fr_220px] mt-10">
          <div className="reading-column min-w-0 article-content-enter">
            {hasBlocks ? (
              <ContentRenderer blocks={blocks} />
            ) : (
              <div className="prose-dossier">
                <MDXRemote source={post.content?.body || ''} components={mdxComponents} />
              </div>
            )}

            <div className="mt-16 pt-8 border-t-2 border-foreground flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
              <ReactionBoard postId={post.id} />
              <ShareButtons post={post} />
            </div>
          </div>

          <aside className="hidden xl:block">
            <TableOfContents />
          </aside>
        </div>

        <Suspense fallback={<RelatedArticlesSkeleton />}>
          <RelatedArticlesSection postId={post.id} />
        </Suspense>
      </article>
    </>
  );
}
