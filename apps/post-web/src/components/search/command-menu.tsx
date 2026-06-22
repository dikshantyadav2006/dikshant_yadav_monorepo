'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, FileText, CornerDownLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@/lib/api';
import type { Post } from '@dikshant/types';

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-menu', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-menu', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', search],
    queryFn: async () => {
      if (!search.trim()) return [];
      return apiFetch<Post[]>(`/search?q=${encodeURIComponent(search)}`);
    },
    enabled: isOpen && search.trim().length > 0,
  });

  const handleSelect = (slug: string) => {
    router.push(`/posts/${slug}`);
    setIsOpen(false);
    setSearch('');
  };

  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex].slug);
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-foreground/40 pt-[15vh] backdrop-blur-sm">
      <div ref={containerRef} className="w-full max-w-xl border-2 border-foreground bg-card shadow-dossier">
        <div className="flex items-center gap-3 border-b-2 border-foreground px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search archive..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent font-serif outline-none placeholder:text-muted-foreground"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span className="font-mono text-[10px] uppercase tracking-wider border border-foreground/30 px-1.5 py-0.5 hidden sm:block">ESC</span>
        </div>

        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
          {!search.trim() ? (
            <p className="p-8 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Enter keywords to search the archive
            </p>
          ) : results.length === 0 && !isLoading ? (
            <p className="p-8 text-center font-serif text-muted-foreground italic">
              No dossiers found for &ldquo;{search}&rdquo;
            </p>
          ) : (
            <ul>
              {results.map((post, index) => (
                <li
                  key={post.id}
                  onClick={() => handleSelect(post.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between cursor-pointer px-4 py-3 border-b border-foreground/10 transition-colors ${
                    index === selectedIndex ? 'bg-secondary' : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-display text-sm truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt || 'Open dossier'}</p>
                    </div>
                  </div>
                  {index === selectedIndex && <CornerDownLeft className="h-3 w-3 text-muted-foreground" />}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t-2 border-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>↑↓ navigate · ↵ select</span>
          <span>Ctrl+K toggle</span>
        </div>
      </div>
    </div>
  );
}
