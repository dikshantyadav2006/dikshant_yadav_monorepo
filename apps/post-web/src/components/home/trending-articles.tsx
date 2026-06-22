import type { Post } from '@dikshant/types';
import PostCard from '@/components/ui/post-card';
import DossierLabel from '@/components/ui/dossier-label';
import DossierFrame from '@/components/layout/dossier-frame';

interface TrendingArticlesProps {
  posts: Post[];
}

export default function TrendingArticles({ posts }: TrendingArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section>
      <DossierLabel className="mb-2">Trending</DossierLabel>
      <h2 className="font-display text-3xl mb-8 section-rule">Most Reviewed</h2>
      <DossierFrame>
        <div className="divide-y divide-foreground/10">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} variant="compact" index={i} />
          ))}
        </div>
      </DossierFrame>
    </section>
  );
}
