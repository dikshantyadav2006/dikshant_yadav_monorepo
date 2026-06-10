'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, FileText, ArrowRight } from 'lucide-react';
import apiFetch from '../../lib/api';

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  // Autofocus search input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch query
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search-page', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return [];
      return apiFetch(`/search?q=${encodeURIComponent(debouncedSearch)}`);
    },
    enabled: debouncedSearch.trim().length > 0,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          window.location.href = `/posts/${selected.slug}`;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 animate-fade-in">
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Instant Search
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Perform query searches using title, tags, categories, or text content.
        </p>
      </div>

      {/* Input Box */}
      <div className="relative flex items-center rounded-2xl border border-border/80 bg-card/60 px-4 py-3.5 shadow-premium dark:shadow-premium-dark focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/15 transition-all">
        <Search className="h-5 w-5 text-muted-foreground mr-3" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search this blog..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedIndex(0);
          }}
          className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60 text-base"
        />
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-accent" />}
      </div>

      {/* Results view */}
      <div className="space-y-3">
        {!debouncedSearch.trim() ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Type something in the search bar above...
          </div>
        ) : results.length === 0 && !isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No results found for &ldquo;{debouncedSearch}&rdquo;.
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((post: any, idx: number) => {
              const isSelected = idx === selectedIndex;
              return (
                <a
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between rounded-xl border p-4 transition-all duration-150 ${
                    isSelected
                      ? 'border-accent/40 bg-accent/5 shadow-glow-accent'
                      : 'border-border bg-card/40 hover:bg-card'
                  }`}
                >
                  <div className="flex gap-4">
                    <FileText className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                    <div>
                      <h3 className="font-bold text-foreground leading-snug">{post.title}</h3>
                      <p className="text-xs text-muted-foreground/90 mt-1">{post.excerpt || 'Read this post'}</p>
                      {post.category && (
                        <span className="inline-block mt-2 rounded bg-muted/70 border border-border/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-accent">
                    <ArrowRight className={`h-4 w-4 transition-transform ${isSelected ? 'translate-x-0.5 text-accent' : ''}`} />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex justify-between text-[11px] text-muted-foreground/80 px-2 pt-2 border-t border-border/40">
          <span>Use ↑↓ keys to navigate</span>
          <span>Press Enter to select</span>
        </div>
      )}
    </div>
  );
}
