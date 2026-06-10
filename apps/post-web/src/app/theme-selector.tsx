'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import useThemeStore, { Theme } from '../store/use-theme';

export function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg border border-border/80 bg-muted/40 animate-pulse" />;
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dim');
    } else if (theme === 'dim') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-card/60 hover:bg-muted/50 hover:text-foreground text-muted-foreground transition-all duration-200"
      aria-label="Toggle color theme"
    >
      {theme === 'light' && <Sun className="h-4.5 w-4.5 text-amber-500 animate-fade-in" />}
      {theme === 'dim' && <Sparkles className="h-4.5 w-4.5 text-cyan-400 animate-fade-in" />}
      {theme === 'dark' && <Moon className="h-4.5 w-4.5 text-indigo-400 animate-fade-in" />}
    </button>
  );
}
export default ThemeSelector;
