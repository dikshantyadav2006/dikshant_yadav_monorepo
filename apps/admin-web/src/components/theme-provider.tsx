'use client';

import React, { useEffect, useState } from 'react';
import useThemeStore from '../store/use-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove('light', 'dim', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Hydration fallback to prevent layout flash
  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return <>{children}</>;
}
export default ThemeProvider;
