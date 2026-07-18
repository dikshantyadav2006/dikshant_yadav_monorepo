import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getAllPostSlugs, getPostPath, getCategories, getTags } from '@/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostSlugs();
  const categories = await getCategories();
  const tags = await getTags();

  const postUrls = posts.map((post) => ({
    url: `${SITE_URL}${getPostPath(post)}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const tagUrls = tags.map((tag) => ({
    url: `${SITE_URL}/tags/${tag.slug}`,
    lastModified: new Date(tag.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
  ];
}
