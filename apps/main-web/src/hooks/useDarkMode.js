import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode with localStorage persistence.
 * Default: light mode is ON.
 *
 * @returns {Object} { isDarkMode, toggleDarkMode }
 */
const STORAGE_KEY = 'darkMode';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  try {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode !== null) {
      const parsed = JSON.parse(savedMode);
      if (typeof parsed === 'boolean') return parsed;
    }
  } catch {
    // Corrupt or unavailable storage — fall through to default
  }
  return false; // Default: light mode
};

const applyDarkModeClass = (isDarkMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDarkMode);
};

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const initial = getInitialDarkMode();
    // Apply before first paint to avoid a flash of the wrong theme
    applyDarkModeClass(initial);
    return initial;
  });

  useEffect(() => {
    applyDarkModeClass(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage may be unavailable (private mode, etc.)
      }
      return next;
    });
  };

  return { isDarkMode, toggleDarkMode };
};

export default useDarkMode;
