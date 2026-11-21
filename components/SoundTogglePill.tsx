'use client';

import { useEffect } from 'react';
import { useSoundStore } from '../lib/sound-store';
import { playSoundEnabledChime } from '../lib/sound-engine';
import { LiquidGlass } from './ui/glasscn/liquid-glass';

function VolumeOnIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 7.8H6.8L11.2 4.2V15.8L6.8 12.2H3.5C2.95 12.2 2.5 11.75 2.5 11.2V8.8C2.5 8.25 2.95 7.8 3.5 7.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 7.4C14.85 8.15 15.35 9.05 15.35 10C15.35 10.95 14.85 11.85 14 12.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16.1 5.4C17.4 6.65 18.1 8.25 18.1 10C18.1 11.75 17.4 13.35 16.1 14.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VolumeMutedIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 7.8H6.8L11.2 4.2V15.8L6.8 12.2H3.5C2.95 12.2 2.5 11.75 2.5 11.2V8.8C2.5 8.25 2.95 7.8 3.5 7.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 7.6L18 11.6M18 7.6L14 11.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SoundTogglePill({
  showLabels = false,
  className = '',
}: {
  showLabels?: boolean;
  className?: string;
}) {
  const muted = useSoundStore((s) => s.muted);
  const toggleMuted = useSoundStore((s) => s.toggleMuted);
  const initSound = useSoundStore((s) => s.initSound);
  const initialized = useSoundStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initSound();
    }
  }, [initialized, initSound]);

  const handleToggle = () => {
    const nowMuted = toggleMuted();
    if (!nowMuted) {
      playSoundEnabledChime();
    }
  };

  return (
    <LiquidGlass
      blur={2}
      refraction={14}
      bezel={0.42}
      saturation={1.65}
      data-theme-toggle="true"
      className={`inline-flex items-center p-1 rounded-full bg-[#060a18]/[0.45] border-white/[0.16] shrink-0 ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={!muted}
        aria-label={muted ? 'Activar sonidos del juego' : 'Silenciar sonidos del juego'}
        title={muted ? 'Sonido silenciado (clic para activar)' : 'Sonido activado (clic para silenciar)'}
        className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer ${
          showLabels ? 'px-3 text-xs font-semibold' : 'w-[34px]'
        } ${
          muted
            ? 'text-white/55 hover:text-white hover:bg-white/[0.08]'
            : 'text-[#67E8F9] hover:bg-white/[0.08]'
        }`}
      >
        {muted ? (
          <VolumeMutedIcon className="w-4 h-4 shrink-0" />
        ) : (
          <VolumeOnIcon className="w-4 h-4 shrink-0" />
        )}
        {showLabels && <span>{muted ? 'Silencio' : 'Sonido'}</span>}
      </button>
    </LiquidGlass>
  );
}
