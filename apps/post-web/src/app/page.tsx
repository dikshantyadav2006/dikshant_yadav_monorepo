import FeaturedDossier from '@/components/home/featured-dossier';
import LatestReports from '@/components/home/latest-reports';
import CategoriesSection from '@/components/home/categories-section';
import TrendingArticles from '@/components/home/trending-articles';
import SearchHero from '@/components/home/search-hero';
import LoadMoreReports from '@/components/home/load-more-reports';
import DossierLabel from '@/components/ui/dossier-label';
import {
  getPosts,
  getFeaturedPosts,
  getCategories,
  getTrendingPosts,
} from '@/lib/posts';

export default async function HomePage() {
  const [initialPosts, featuredPosts, categories, trendingPosts] = await Promise.all([
    getPosts({ page: 1, limit: 6 }),
    getFeaturedPosts(3),
    getCategories(),
    getTrendingPosts(5),
  ]);

  const heroPost = featuredPosts[0] || initialPosts.posts[0];
  const latestPosts = heroPost
    ? initialPosts.posts.filter((p) => p.id !== heroPost.id)
    : initialPosts.posts;

  return (
    <div className="space-y-16">
      <section className="text-center space-y-3 pb-4 border-b-2 border-foreground">
        <DossierLabel>Vol. {new Date().getFullYear()} — Public Edition</DossierLabel>
        <h1 className="editorial-headline text-5xl sm:text-6xl md:text-7xl">
          Intelligence Archive
        </h1>
        <p className="font-serif text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Curated dossiers on engineering, architecture, and technology — presented in the tradition of editorial intelligence reports.
        </p>
      </section>

      <SearchHero />

      {heroPost && <FeaturedDossier post={heroPost} />}

      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-16">
          <LatestReports posts={latestPosts} />
          <LoadMoreReports
            initialPage={1}
            totalPages={initialPosts.pagination.totalPages}
          />
        </div>
        <aside className="lg:col-span-4">
          <TrendingArticles posts={trendingPosts} />
        </aside>
      </div>

      <CategoriesSection categories={categories} />
    </div>
  );
}
