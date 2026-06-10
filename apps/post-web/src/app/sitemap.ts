import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts: any[] = [];
  try {
    const res = await fetch(`${API_URL}/posts?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      posts.push(...(data.posts || []));
    }
  } catch (error) {
    console.error('Sitemap fetch failed', error);
  }

  const postUrls = posts.map((post) => ({
    url: `https://post.dikshantyadav.in/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://post.dikshantyadav.in',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...postUrls,
  ];
}
export type Sitemap = MetadataRoute.Sitemap;
