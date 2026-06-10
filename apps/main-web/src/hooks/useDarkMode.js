import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode with localStorage persistence
 * Default: dark mode is ON
 * 
 * @returns {Object} { isDarkMode, toggleDarkMode }
 */
const useDarkMode = () => {
  // Initialize dark mode state from localStorage or default to true
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });

  // Initialize dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Dark Mode Toggle Handler
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));

      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return newMode;
    });
  };

  return { isDarkMode, toggleDarkMode };
};

export default useDarkMode;
