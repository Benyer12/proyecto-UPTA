'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../lib/theme-store';
import { LiquidGlass } from './ui/glasscn/liquid-glass';

function SunIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M10 2.2V4.1M10 15.9V17.8M2.2 10H4.1M15.9 10H17.8M4.5 4.5L5.9 5.9M14.1 14.1L15.5 15.5M15.5 4.5L14.1 5.9M5.9 14.1L4.5 15.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M15.6 12.6A6.3 6.3 0 0 1 7.4 4.4A6.5 6.5 0 1 0 15.6 12.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeTogglePill({
  showLabels = false,
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
    <LiquidGlass
      blur={2}
      refraction={14}
      bezel={0.42}
      saturation={1.65}
      data-theme-toggle="true"
      className={`inline-flex items-center p-1 rounded-full bg-[#060a18]/[0.45] border-white/[0.16] shrink-0 ${className}`}
    >
      <div role="group" aria-label="Cambiar modo claro u oscuro" className="inline-flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
          aria-label="Activar modo claro"
          title="Modo claro"
          className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer ${
            showLabels ? 'px-3 text-xs font-semibold' : 'w-[34px]'
          } ${
            theme === 'light'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
          }`}
          data-active-pill={theme === 'light' ? 'true' : undefined}
        >
          <SunIcon className="w-4 h-4 shrink-0" />
          {showLabels && <span>Claro</span>}
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
          aria-label="Activar modo oscuro"
          title="Modo oscuro"
          className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer ${
            showLabels ? 'px-3 text-xs font-semibold' : 'w-[34px]'
          } ${
            theme === 'dark'
              ? 'bg-white text-[#0F172A] shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
          }`}
          data-active-pill={theme === 'dark' ? 'true' : undefined}
        >
          <MoonIcon className="w-4 h-4 shrink-0" />
          {showLabels && <span>Oscuro</span>}
        </button>
      </div>
    </LiquidGlass>
  );
}
