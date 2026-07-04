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
  const name = slug.replace(/-/g, ' ');
  return {
    title: `#${name} — Tag Archive`,
    description: `Browse all dossiers tagged with ${name}.`,
    openGraph: {
      title: `#${name} — Tag Archive`,
      description: `Browse all dossiers tagged with ${name}.`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const { posts, pagination } = await getPosts({ tagSlug: slug, limit: 20 });

  const tagName = slug.replace(/-/g, ' ');

  return (
    <div className="space-y-10">
      <header className="border-b-2 border-foreground pb-8">
        <Link href="/" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          ← Archive Home
        </Link>
        <DossierLabel className="mt-4 mb-2">Tag Reference</DossierLabel>
        <h1 className="editorial-headline text-4xl sm:text-5xl capitalize">#{tagName}</h1>
        <p className="font-serif text-muted-foreground mt-3">
          {pagination.total} dossier{pagination.total !== 1 ? 's' : ''} tagged
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="font-serif italic text-muted-foreground">No reports with this tag yet.</p>
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
