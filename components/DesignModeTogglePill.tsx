'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '../lib/settings-store';
import { LiquidGlass } from './ui/glasscn/liquid-glass';

export function BoltIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M11.2 2.2L4.8 10.9H9.9L8.8 17.8L15.2 9.1H10.1L11.2 2.2Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LeafIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M16.5 3.8C10.4 3.8 5.2 7.2 4.3 14.3C11.4 13.4 16.5 9.6 16.5 3.8Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M4.2 16.2C6.4 13.2 9.4 10.6 12.8 8.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DesignModeTogglePill({
  showLabels = false,
  className = '',
}: {
  showLabels?: boolean;
  className?: string;
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

  return (
    <LiquidGlass
      blur={2}
      refraction={14}
      bezel={0.42}
      saturation={1.65}
      data-theme-toggle="true"
      className={`inline-flex items-center p-1 rounded-full bg-[#060a18]/[0.45] border-white/[0.16] shrink-0 ${className}`}
    >
      <div
        role="group"
        aria-label="Cambiar entre Diseño Original y Diseño de Ahorro"
        className="inline-flex items-center gap-0.5"
      >
        <button
          type="button"
          onClick={() => setDesignMode('original')}
          aria-pressed={designMode === 'original'}
          aria-label="Activar Diseño Original con efectos completos"
          title="Diseño Original (Efectos completos)"
          className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer ${
            showLabels ? 'px-3 text-xs font-semibold' : 'w-[34px]'
          } ${
            designMode === 'original'
              ? 'bg-[#38BDF8] text-[#04101D] shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
          }`}
          data-active-pill={designMode === 'original' ? 'true' : undefined}
        >
          <BoltIcon className="w-4 h-4 shrink-0" />
          {showLabels && <span>Original</span>}
        </button>

        <button
          type="button"
          onClick={() => setDesignMode('eco')}
          aria-pressed={designMode === 'eco'}
          aria-label="Activar Diseño de Ahorro para PCs de bajos recursos"
          title="Diseño de Ahorro (Máxima fluidez sin lag)"
          className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer ${
            showLabels ? 'px-3 text-xs font-semibold' : 'w-[34px]'
          } ${
            designMode === 'eco'
              ? 'bg-[#34D399] text-[#031A11] shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
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
