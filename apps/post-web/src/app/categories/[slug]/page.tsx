import Link from 'next/link';
import type { Metadata } from 'next';
import PostCard from '@/components/ui/post-card';
import DossierLabel from '@/components/ui/dossier-label';
import { getPosts } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, ' ')} — Category Archive` };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { posts, pagination } = await getPosts({ categorySlug: slug, limit: 20 });

  const categoryName = posts[0]?.category?.name || slug.replace(/-/g, ' ');

  return (
    <div className="space-y-10">
      <header className="border-b-2 border-foreground pb-8">
        <Link href="/" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          ← Archive Home
        </Link>
        <DossierLabel className="mt-4 mb-2">Category Index</DossierLabel>
        <h1 className="editorial-headline text-4xl sm:text-5xl capitalize">{categoryName}</h1>
        <p className="font-serif text-muted-foreground mt-3">
          {pagination.total} dossier{pagination.total !== 1 ? 's' : ''} in this section
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="font-serif italic text-muted-foreground">No reports in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
