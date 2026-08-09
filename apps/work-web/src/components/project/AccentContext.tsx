'use client';

import { createContext, useContext } from 'react';
import { useAccentColor, DEFAULT_ACCENT } from '@/lib/useAccentColor';

interface AccentContextValue {
  accent: string;
  isAuto: boolean;
}

const AccentContext = createContext<AccentContextValue>({
  accent: DEFAULT_ACCENT,
  isAuto: true,
});

export function AccentProvider({
  swatchColor,
  heroImageUrl,
  children,
}: {
  swatchColor?: string | null;
  heroImageUrl?: string | null;
  children: React.ReactNode;
}) {
  const { accent, isAuto } = useAccentColor(swatchColor, heroImageUrl);
  return (
    <AccentContext.Provider value={{ accent, isAuto }}>{children}</AccentContext.Provider>
  );
}

export function useAccent() {
  return useContext(AccentContext);
}
