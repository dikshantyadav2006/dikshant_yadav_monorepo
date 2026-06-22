'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@/lib/api';
import type { Post } from '@dikshant/types';
import PostCard from '@/components/ui/post-card';

interface LoadMoreReportsProps {
  initialPage: number;
  totalPages: number;
}

export default function LoadMoreReports({ initialPage, totalPages }: LoadMoreReportsProps) {
  const [page, setPage] = useState(initialPage);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const { isFetching } = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => {
      const data = await apiFetch<{ posts: Post[]; pagination: { totalPages: number } }>(
        `/posts?page=${page}&limit=6`,
      );
      setAllPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...data.posts.filter((p) => !ids.has(p.id))];
      });
      return data;
    },
    enabled: page > initialPage,
  });

  if (page >= totalPages) return null;

  return (
    <div className="mt-8 text-center">
      {allPosts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <button
        onClick={() => setPage((p) => p + 1)}
        disabled={isFetching || page >= totalPages}
        className="border-2 border-foreground px-8 py-3 font-mono text-xs uppercase tracking-wider hover:bg-foreground hover:text-card transition-colors disabled:opacity-50"
      >
        {isFetching ? 'Loading...' : 'Load More Reports'}
      </button>
    </div>
  );
}
