'use client';

import { create } from 'zustand';

export type AppTheme = 'dark' | 'light';

const STORAGE_KEY = 'universo-theme';

interface ThemeState {
  theme: AppTheme;
  initialized: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

function applyThemeToDom(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  initialized: false,
  setTheme: (theme) => {
    applyThemeToDom(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    set({ theme, initialized: true });
  },
  toggleTheme: () => {
    const next: AppTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
  initTheme: () => {
    if (typeof window === 'undefined') return;
    let resolved: AppTheme = 'dark';
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        resolved = saved;
      }
    } catch {}
    applyThemeToDom(resolved);
    set({ theme: resolved, initialized: true });
  },
}));
