'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import DossierFrame from '@/components/layout/dossier-frame';

export default function SearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <DossierFrame label="Archive Search">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-3">
        Press Ctrl+K for quick search
      </p>
    </DossierFrame>
  );
}
