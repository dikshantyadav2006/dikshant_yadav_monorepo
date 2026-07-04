'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense, useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import apiFetch from '@/lib/api';
import type { Post } from '@dikshant/types';
import PostCard from '@/components/ui/post-card';
import DossierLabel from '@/components/ui/dossier-label';

function SearchResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { data: results = [], isLoading, isPlaceholderData } = useQuery({
    queryKey: ['search-page', query],
    queryFn: () => apiFetch<Post[]>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
    placeholderData: (previousData) => previousData,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  const handleChange = useCallback((value: string) => {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      }
    }, 300);
  }, [router]);

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

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search intelligence reports, topics, keywords..."
            className="w-full border-2 border-foreground bg-card py-3 pl-10 pr-4 font-serif text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <button
          type="submit"
          className="border-2 border-foreground bg-foreground text-card px-8 py-3 font-mono text-xs uppercase tracking-wider hover:bg-card hover:text-foreground transition-colors shrink-0"
        >
          Search Archive
        </button>
      </form>

      {!query.trim() ? (
        <p className="font-serif text-muted-foreground italic">
          Enter a search term above or press Ctrl+K for quick search.
        </p>
      ) : isLoading ? (
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {isPlaceholderData ? 'Updating results...' : 'Searching archive...'}
        </p>
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

export default function SearchResults() {
  return (
    <Suspense fallback={<p className="font-mono text-xs uppercase tracking-wider">Loading search...</p>}>
      <SearchResultsInner />
    </Suspense>
  );
}
