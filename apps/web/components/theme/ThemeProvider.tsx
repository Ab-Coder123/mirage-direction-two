'use client';

import * as React from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = React.useState<Theme>('light');

  // Read initial theme from document (which ThemeScript already initialized)
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setThemeState(isDark ? 'dark' : 'light');

    // Listen to OS system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('mirage-theme');
      if (!stored) {
        const newTheme: Theme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme, false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (newTheme: Theme, persist = true) => {
    setThemeState(newTheme);
    const d = document.documentElement;
    if (newTheme === 'dark') {
      d.classList.add('dark');
      d.setAttribute('data-theme', 'dark');
    } else {
      d.classList.remove('dark');
      d.setAttribute('data-theme', 'light');
    }
    if (persist) {
      try {
        localStorage.setItem('mirage-theme', newTheme);
      } catch (e) {
        // Safe fallback in restricted environments
      }
    }
  };

  const toggleTheme = React.useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark', true);
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => {
    applyTheme(t, true);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
