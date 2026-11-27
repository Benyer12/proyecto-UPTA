'use client';

import { useState } from 'react';
import { MINIGAME_EXIT_LABELS } from '../../../lib/config/modal-safety-config';
import { useModalEscape } from '../../../lib/hooks/useModalEscape';

interface BotonSalidaMinijuegoProps {
  onSafeExit: () => void;
  requireConfirm?: boolean;
  disabled?: boolean;
  className?: string;
}

function ExitIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <path
        d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BotonSalidaMinijuego({
  onSafeExit,
  requireConfirm = false,
  disabled = false,
  className = '',
}: BotonSalidaMinijuegoProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  useModalEscape({
    isOpen: confirmOpen,
    onEscape: () => setConfirmOpen(false),
    priority: 'secondary',
  });

  const handleClick = () => {
    if (disabled) return;
    if (requireConfirm) {
      setConfirmOpen((prev) => !prev);
      return;
    }
    onSafeExit();
  };

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={MINIGAME_EXIT_LABELS.ariaLabel}
        aria-expanded={requireConfirm ? confirmOpen : undefined}
        title={MINIGAME_EXIT_LABELS.ariaLabel}
        data-keep-compact="true"
        className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-300/45 bg-rose-500/20 hover:bg-rose-500/35 active:brightness-95 text-rose-50 text-xs font-extrabold tracking-wide backdrop-blur-md shadow-[0_6px_18px_-8px_rgba(244,63,94,0.55)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ExitIcon />
        <span>{MINIGAME_EXIT_LABELS.buttonText}</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-950/60 border border-rose-200/35 text-[10px] font-mono font-bold text-rose-100 leading-none">
          {MINIGAME_EXIT_LABELS.shortcutHint}
        </kbd>
      </button>

      {requireConfirm && confirmOpen && (
        <div
          role="alertdialog"
          aria-modal="false"
          aria-label={MINIGAME_EXIT_LABELS.confirmTitle}
          className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-rose-300/45 bg-slate-950/95 backdrop-blur-xl p-3.5 text-left shadow-2xl"
        >
          <p className="text-xs font-black text-white mb-1">
            {MINIGAME_EXIT_LABELS.confirmTitle}
          </p>
          <p className="text-[11px] font-medium text-slate-200 leading-relaxed mb-3">
            {MINIGAME_EXIT_LABELS.confirmBody}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                onSafeExit();
              }}
              className="min-h-[34px] w-full px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-extrabold cursor-pointer transition-colors"
            >
              {MINIGAME_EXIT_LABELS.confirmAction}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="min-h-[34px] w-full px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 text-xs font-bold cursor-pointer transition-colors"
            >
              {MINIGAME_EXIT_LABELS.cancelAction}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
