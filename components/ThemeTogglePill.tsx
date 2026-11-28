'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../lib/theme-store';
import { runViewTransition } from '../lib/view-transitions';
import ThemeToggleLottie from './ui/ThemeToggleLottie';

export default function ThemeTogglePill({
  className = '',
}: {
  showLabels?: boolean;
  className?: string;
}) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const initTheme = useThemeStore((s) => s.initTheme);
  const initialized = useThemeStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initTheme();
    }
  }, [initialized, initTheme]);

  return (
    <div
      data-theme-toggle="true"
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <ThemeToggleLottie
        theme={theme}
        size="sm"
        onToggle={() =>
          runViewTransition(
            () => setTheme(theme === 'dark' ? 'light' : 'dark'),
            'choice',
          )
        }
      />
    </div>
  );
}
