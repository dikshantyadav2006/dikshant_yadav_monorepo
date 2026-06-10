import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dim' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // default to premium dark mode
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.setAttribute('data-theme', theme);
          
          // Next-themes uses class-based selection for some shadcn/ui styles too
          root.classList.remove('light', 'dim', 'dark');
          root.classList.add(theme);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
export default useThemeStore;
