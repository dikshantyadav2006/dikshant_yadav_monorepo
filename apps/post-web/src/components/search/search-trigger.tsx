'use client';

import { Search } from 'lucide-react';

export default function SearchTrigger() {
  const openSearch = () => {
    window.dispatchEvent(new Event('open-command-menu'));
  };

  return (
    <button
      onClick={openSearch}
      className="flex items-center gap-2 border-2 border-foreground/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider hover:border-foreground hover:bg-secondary transition-colors"
      aria-label="Open search"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden md:inline border border-foreground/20 px-1 text-[9px] ml-1">⌘K</kbd>
    </button>
  );
}
