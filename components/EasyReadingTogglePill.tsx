'use client';

import { useEffect } from 'react';
import { useAccessibilityStore } from '../lib/accessibility-store';
import {
  EASY_READING_SHORTCUT_KEY,
  READING_LABELS,
} from '../lib/config/reading-config';
import { LiquidGlass } from './ui/glasscn/liquid-glass';

let activeShortcutListeners = 0;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

function handleGlobalShortcut(event: KeyboardEvent) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.toLowerCase() !== EASY_READING_SHORTCUT_KEY) return;
  if (isEditableTarget(event.target)) return;

  event.preventDefault();
  useAccessibilityStore.getState().toggleEasyReading();
}

function EasyReadingIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.2 4.8C3.2 4.1 3.75 3.6 4.45 3.6H7.8C9.0 3.6 10 4.55 10 5.75V16C9.2 15.2 8.2 14.8 7.0 14.8H4.45C3.75 14.8 3.2 14.25 3.2 13.55V4.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16.8 4.8C16.8 4.1 16.25 3.6 15.55 3.6H12.2C11.0 3.6 10 4.55 10 5.75V16C10.8 15.2 11.8 14.8 13.0 14.8H15.55C16.25 14.8 16.8 14.25 16.8 13.55V4.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5.4 7.2H7.9M5.4 10H7.9M12.1 7.2H14.6M12.1 10H14.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EasyReadingTogglePill({
  compact = false,
  showLabels = false,
  className = '',
}: {
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}) {
  const easyReading = useAccessibilityStore((s) => s.easyReading);
  const toggleEasyReading = useAccessibilityStore((s) => s.toggleEasyReading);
  const initAccessibility = useAccessibilityStore((s) => s.initAccessibility);
  const initialized = useAccessibilityStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initAccessibility();
    }
  }, [initialized, initAccessibility]);

  useEffect(() => {
    activeShortcutListeners += 1;
    if (activeShortcutListeners === 1) {
      window.addEventListener('keydown', handleGlobalShortcut);
    }
    return () => {
      activeShortcutListeners = Math.max(0, activeShortcutListeners - 1);
      if (activeShortcutListeners === 0) {
        window.removeEventListener('keydown', handleGlobalShortcut);
      }
    };
  }, []);

  const showText = showLabels || !compact;
  const labelText = easyReading
    ? showLabels
      ? READING_LABELS.labelOn
      : READING_LABELS.shortLabelOn
    : showLabels
      ? READING_LABELS.labelOff
      : READING_LABELS.shortLabelOff;

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
        onClick={toggleEasyReading}
        aria-pressed={easyReading}
        aria-label={READING_LABELS.ariaLabel}
        title={easyReading ? READING_LABELS.titleOn : READING_LABELS.titleOff}
        data-active-pill={easyReading ? 'true' : undefined}
        data-keep-compact="true"
        className={`min-h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full transition-colors cursor-pointer ${
          showText ? 'px-3 text-xs font-semibold whitespace-nowrap' : 'w-[34px]'
        } ${
          easyReading
            ? 'bg-white text-[#0F172A] shadow-sm'
            : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
        }`}
      >
        <EasyReadingIcon className="w-4 h-4 shrink-0" />
        {showText && <span>{labelText}</span>}
        <span
          aria-hidden="true"
          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            easyReading ? 'bg-emerald-500' : 'bg-white/30'
          }`}
        />
      </button>
    </LiquidGlass>
  );
}
