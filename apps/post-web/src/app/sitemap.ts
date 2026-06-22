import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getAllPostSlugs, getPostPath } from '@/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostSlugs();

  const postUrls = posts.map((post) => ({
    url: `${SITE_URL}${getPostPath(post)}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...postUrls,
  ];
}
