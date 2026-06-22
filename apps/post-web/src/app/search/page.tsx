'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense } from 'react';
import apiFetch from '@/lib/api';
import type { Post } from '@dikshant/types';
import PostCard from '@/components/ui/post-card';
import DossierLabel from '@/components/ui/dossier-label';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search-page', query],
    queryFn: () => apiFetch<Post[]>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
  });

  return (
    <div className="space-y-10">
      <header className="border-b-2 border-foreground pb-8">
        <Link href="/" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
          ← Archive Home
        </Link>
        <DossierLabel className="mt-4 mb-2">Search Results</DossierLabel>
        <h1 className="editorial-headline text-4xl sm:text-5xl">
          {query ? `Results for "${query}"` : 'Search Archive'}
        </h1>
      </header>

      {!query.trim() ? (
        <p className="font-serif text-muted-foreground italic">
          Enter a search term from the homepage or press Ctrl+K.
        </p>
      ) : isLoading ? (
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Searching archive...</p>
      ) : results.length === 0 ? (
        <p className="font-serif italic text-muted-foreground">
          No dossiers found matching your query.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="font-mono text-xs uppercase tracking-wider">Loading search...</p>}>
      <SearchResults />
    </Suspense>
  );
}
