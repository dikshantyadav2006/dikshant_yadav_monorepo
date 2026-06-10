import React from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, Folder } from 'lucide-react';
import HomePostList from '../../home-post-list';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getCategoryPosts(slug: string) {
  try {
    const res = await fetch(`${API_URL}/posts?categorySlug=${slug}&limit=12`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryPosts(slug);
  const categories = await getCategories();

  if (!data) {
    notFound();
  }

  const categoryName = categories.find((c: any) => c.slug === slug)?.name || slug;

  return (
    <div className="space-y-8 py-4">
      {/* Back Button */}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to home
      </a>

      {/* Header Info */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <Folder className="h-7 w-7 text-accent" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl capitalize">
            {categoryName}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Viewing posts published under the &ldquo;{categoryName}&rdquo; category.
        </p>
      </div>

      <HomePostList initialPosts={data} categories={categories} />
    </div>
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `Posts Category: ${slug} | Dikshant Yadav`,
    description: `Browse all developer blog posts compiled under the ${slug} category.`,
  };
}
