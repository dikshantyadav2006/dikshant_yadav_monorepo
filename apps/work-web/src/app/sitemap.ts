import { MetadataRoute } from 'next';
import { getWorks } from '@/lib/api';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://work.dikshantyadav.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const works = await getWorks();
  const projectUrls = works.map((work) => ({
    url: `${SITE_URL}/project/${work.slug}`,
    lastModified: work.updatedAt ? new Date(work.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    ...projectUrls,
  ];
}
