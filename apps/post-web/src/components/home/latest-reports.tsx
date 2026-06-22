import type { Post } from '@dikshant/types';
import PostCard from '@/components/ui/post-card';
import DossierLabel from '@/components/ui/dossier-label';

interface LatestReportsProps {
  posts: Post[];
}

export default function LatestReports({ posts }: LatestReportsProps) {
  if (posts.length === 0) {
    return (
      <section>
        <DossierLabel className="mb-2">Latest Intelligence Reports</DossierLabel>
        <h2 className="font-display text-3xl mb-6">Recent Publications</h2>
        <p className="text-muted-foreground font-serif">No reports published yet. Check back soon.</p>
      </section>
    );
  }

  return (
    <section>
      <DossierLabel className="mb-2">Latest Intelligence Reports</DossierLabel>
      <h2 className="font-display text-3xl mb-8 section-rule">Recent Publications</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
