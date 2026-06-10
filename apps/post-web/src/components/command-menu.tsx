'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '../lib/api';

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle open command menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Fetch search results
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', search],
    queryFn: async () => {
      if (!search.trim()) return [];
      return apiFetch(`/search?q=${encodeURIComponent(search)}`);
    },
    enabled: isOpen && search.trim().length > 0,
  });

  const handleSelect = (slug: string) => {
    router.push(`/posts/${slug}`);
    setIsOpen(false);
    setSearch('');
  };

  // Keyboard navigation inside list
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex].slug);
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, selectedIndex]);

  // Click outside to close
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm transition-all duration-300">
      <div
        ref={containerRef}
        className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-premium dark:shadow-premium-dark backdrop-blur-md transition-all duration-300"
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3.5">
          <Search className="h-4.5 w-4.5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search posts, categories, tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/75"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
          <div className="hidden rounded bg-muted/65 border border-border/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            ESC
          </div>
        </div>

        {/* Search Results list */}
        <div className="max-h-[350px] overflow-y-auto p-2 no-scrollbar">
          {!search.trim() ? (
            <div className="p-8 text-center text-xs text-muted-foreground/80">
              Type something to search this blog...
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground/80">
              No results found for &ldquo;{search}&rdquo;
            </div>
          ) : (
            <ul className="space-y-0.5">
              {results.map((post: any, index: number) => {
                const isSelected = index === selectedIndex;
                return (
                  <li
                    key={post.id}
                    onClick={() => handleSelect(post.slug)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between cursor-pointer rounded-xl px-3.5 py-3 transition-all duration-150 ${
                      isSelected
                        ? 'bg-accent/10 text-accent font-medium border-l-[3px] border-accent pl-[11px]'
                        : 'text-foreground/85 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className={`h-4.5 w-4.5 flex-shrink-0 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-none truncate">{post.title}</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1 leading-none truncate">{post.excerpt || 'Read article'}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1.5 text-[10px] text-accent/80 font-medium">
                        <span className="hidden sm:inline">Navigate</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-border/80 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <div>Press Cmd+K to toggle</div>
        </div>
      </div>
    </div>
  );
}
export default CommandMenu;
