import type { Category, Post, Tag } from '@dikshant/types';
import { API_URL, REVALIDATE_SECONDS } from './constants';

export interface PostsListResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PostsQuery {
  page?: number;
  limit?: number;
  featured?: boolean;
  categorySlug?: string;
  tagSlug?: string;
}

async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      next: options.cache === 'no-store' ? undefined : { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getPosts(query: PostsQuery = {}): Promise<PostsListResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.featured) params.set('featured', 'true');
  if (query.categorySlug) params.set('categorySlug', query.categorySlug);
  if (query.tagSlug) params.set('tagSlug', query.tagSlug);

  const data = await serverFetch<PostsListResponse>(`/posts?${params.toString()}`);
  return data ?? { posts: [], pagination: { total: 0, page: 1, limit: query.limit ?? 10, totalPages: 0 } };
}

export function getPostPath(post: Pick<Post, 'id' | 'slug'>): string {
  return `/posts/${post.id}/${post.slug}`;
}

export async function getPost(identifier: string): Promise<Post | null> {
  return serverFetch<Post>(`/posts/${identifier}`, { cache: 'no-store' });
}

export async function getPostByPath(id: string, slug: string): Promise<Post | null> {
  const post = await getPost(id);
  if (!post) return null;
  return post;
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const data = await getPosts({ featured: true, limit });
  return data.posts;
}

export async function getTrendingPosts(limit = 5): Promise<Post[]> {
  const data = await getPosts({ limit: 20 });
  return [...data.posts]
    .sort((a, b) => (b._count?.views ?? 0) - (a._count?.views ?? 0))
    .slice(0, limit);
}

export async function getRelatedPosts(postId: string, limit = 3): Promise<Post[]> {
  const data = await serverFetch<Post[]>(`/related?postId=${postId}&limit=${limit}`);
  return data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const data = await serverFetch<Category[]>('/categories');
  return data ?? [];
}

export async function getTags(): Promise<Tag[]> {
  const data = await serverFetch<Tag[]>('/tags');
  return data ?? [];
}

export async function searchPosts(query: string): Promise<Post[]> {
  if (!query.trim()) return [];
  const data = await serverFetch<Post[]>(`/search?q=${encodeURIComponent(query)}`);
  return data ?? [];
}

export async function getAllPostSlugs(): Promise<{ id: string; slug: string; updatedAt: string }[]> {
  const data = await getPosts({ limit: 100 });
  return data.posts.map((p) => ({ id: p.id, slug: p.slug, updatedAt: p.updatedAt }));
}

export function getPostTags(post: Post): Tag[] {
  if (!post.tags?.length) return [];
  return post.tags.map((t) => ('tag' in t && t.tag ? t.tag : (t as Tag)));
}

export function getCoverUrl(post: Post, fallback?: string): string {
  return post.featuredImage?.publicUrl || fallback || '';
}
