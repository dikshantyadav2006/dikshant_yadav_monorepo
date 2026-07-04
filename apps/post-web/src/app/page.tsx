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
  getSiteConfig,
  getTrendingPosts,
} from '@/lib/posts';

export default async function HomePage() {
  const [siteConfig, initialPosts, categories, trendingPosts] = await Promise.all([
    getSiteConfig(),
    getPosts({ page: 1, limit: 6 }),
    getCategories(),
    getTrendingPosts(5),
  ]);

  const featuredPosts = await getFeaturedPosts(siteConfig.homepageFeaturedCount);
  const homepageConfig = siteConfig.homepageConfig ?? {};
  const displayedFeaturedIds = new Set(featuredPosts.map((post) => post.id));
  const latestPosts = initialPosts.posts.filter((p) => !displayedFeaturedIds.has(p.id));

  return (
    <div className="space-y-16">
      <section className="text-center space-y-3 pb-4 border-b-2 border-foreground">
        <DossierLabel>Vol. {new Date().getFullYear()} — Public Edition</DossierLabel>
        <h1 className="editorial-headline text-5xl sm:text-6xl md:text-7xl">
          Abhay Singh Yadav 
        </h1>
        <p className="font-serif text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Degree: LLB (Hons.)
- University: Lucknow University
- Roles: Social Worker, Legal Learner
- Focus: Academic credibility, leadership, professionalism
        </p>
      </section>

      <SearchHero />

      {featuredPosts.length > 0 && (
        <div className="space-y-16">
          {featuredPosts.map((post) => (
            <FeaturedDossier key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-16">
          {homepageConfig.showLatestArticles !== false && (
            <>
              <LatestReports posts={latestPosts} />
              <LoadMoreReports
                initialPage={1}
                totalPages={initialPosts.pagination.totalPages}
              />
            </>
          )}
        </div>
        <aside className="lg:col-span-4">
          {homepageConfig.showPopularArticles !== false && <TrendingArticles posts={trendingPosts} />}
        </aside>
      </div>

      {homepageConfig.showCategories !== false && <CategoriesSection categories={categories} />}
    </div>
  );
}
