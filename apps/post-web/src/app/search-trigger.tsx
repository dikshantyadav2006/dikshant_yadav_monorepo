'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export function SearchTrigger() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  const openSearch = () => {
    // Dispatch a custom event to open the command menu, or simply click the shortcut
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={openSearch}
      className="flex items-center gap-2 rounded-lg border border-border/80 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-border/80 bg-muted px-1 text-[9px] font-medium leading-none">
        <span>{isMac ? '⌘' : 'Ctrl'}</span>K
      </kbd>
    </button>
  );
}
export default SearchTrigger;
