'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'asc-theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
}

function getStoredTheme(): Theme | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>('dark');

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme ?? (mediaQuery.matches ? 'dark' : 'light');

    applyTheme(initialTheme);
    setTheme(initialTheme);

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!getStoredTheme()) {
        const nextTheme = event.matches ? 'dark' : 'light';
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

  const handleToggle = () => {
    applyTheme(nextTheme);
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The theme still applies for the current session if storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-indigo text-ink-secondary transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === 'dark'}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      <span className="sr-only">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
    </button>
  );
}
