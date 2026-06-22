import type { Post } from '@dikshant/types';
import PostCard from '@/components/ui/post-card';
import DossierLabel from '@/components/ui/dossier-label';

interface RelatedArticlesProps {
  posts: Post[];
}

export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t-2 border-foreground">
      <DossierLabel className="mb-2">Cross Reference</DossierLabel>
      <h2 className="font-display text-2xl mb-8">Related Dossiers</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
