'use client';

import { useEffect } from 'react';
import { useSettingsStore, type DesignMode } from '../lib/settings-store';
import { LiquidGlass } from './ui/glasscn/liquid-glass';

export function StyleCurveIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M2.5 13.5C5.2 6.5 9.2 6.2 10.2 10C11.2 13.8 14.8 13.5 17.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M14.8 4.4L15.3 5.7L16.6 6.2L15.3 6.7L14.8 8L14.3 6.7L13 6.2L14.3 5.7L14.8 4.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LeafIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M16.2 4.2C10.6 4.2 5.7 7.4 4.8 14C11.4 13.1 16.2 9.6 16.2 4.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4.6 15.8C6.6 13.1 9.4 10.8 12.6 8.9"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DesignModeTogglePill({
  showLabels = true,
  className = '',
  onChangeMode,
  disabled = false,
}: {
  showLabels?: boolean;
  className?: string;
  onChangeMode?: (mode: DesignMode) => void;
  disabled?: boolean;
}) {
  const designMode = useSettingsStore((s) => s.designMode);
  const setDesignMode = useSettingsStore((s) => s.setDesignMode);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const initialized = useSettingsStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initSettings();
    }
  }, [initialized, initSettings]);

  const handleSelect = (mode: DesignMode) => {
    if (disabled) return;
    if (onChangeMode) {
      onChangeMode(mode);
    } else {
      setDesignMode(mode);
    }
  };

  return (
    <LiquidGlass
      blur={10}
      refraction={24}
      bezel={0.44}
      saturation={1.65}
      data-theme-toggle="true"
      className={`inline-flex items-center p-1 rounded-full bg-white/[0.08] border-white/[0.24] shrink-0 ${className}`}
    >
      <div
        role="group"
        aria-label="Cambiar entre Modo Style y Modo Ahorro"
        className="inline-flex items-center gap-1"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect('original')}
          aria-pressed={designMode === 'original'}
          aria-label="Activar Modo Style"
          title="Modo Style"
          className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer disabled:opacity-60 ${
            showLabels ? 'px-3.5 text-xs font-semibold' : 'w-[34px]'
          } ${
            designMode === 'original'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
          }`}
          data-active-pill={designMode === 'original' ? 'true' : undefined}
        >
          <StyleCurveIcon className="w-4 h-4 shrink-0" />
          {showLabels && <span>Style</span>}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect('eco')}
          aria-pressed={designMode === 'eco'}
          aria-label="Activar Modo Ahorro"
          title="Modo Ahorro"
          className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer disabled:opacity-60 ${
            showLabels ? 'px-3.5 text-xs font-semibold' : 'w-[34px]'
          } ${
            designMode === 'eco'
              ? 'bg-slate-200 text-slate-900 shadow-sm'
              : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
          }`}
          data-active-pill={designMode === 'eco' ? 'true' : undefined}
        >
          <LeafIcon className="w-4 h-4 shrink-0" />
          {showLabels && <span>Ahorro</span>}
        </button>
      </div>
    </LiquidGlass>
  );
}
