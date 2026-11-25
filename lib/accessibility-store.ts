'use client';

import { create } from 'zustand';
import {
  EASY_READING_DATA_ATTR,
  EASY_READING_STORAGE_KEY,
} from './config/reading-config';

interface AccessibilityState {
  easyReading: boolean;
  initialized: boolean;
  initAccessibility: () => void;
  setEasyReading: (enabled: boolean) => void;
  toggleEasyReading: () => void;
}

let storageListenerAttached = false;

function applyEasyReadingToDom(enabled: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute(
    EASY_READING_DATA_ATTR,
    enabled ? 'true' : 'false',
  );
}

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  easyReading: false,
  initialized: false,

  setEasyReading: (enabled) => {
    applyEasyReadingToDom(enabled);
    try {
      window.localStorage.setItem(
        EASY_READING_STORAGE_KEY,
        enabled ? 'true' : 'false',
      );
    } catch {}
    set({ easyReading: enabled, initialized: true });
  },

  toggleEasyReading: () => {
    get().setEasyReading(!get().easyReading);
  },

  initAccessibility: () => {
    if (typeof window === 'undefined') return;
    let resolved = false;
    try {
      const saved = window.localStorage.getItem(EASY_READING_STORAGE_KEY);
      resolved = saved === 'true';
    } catch {}
    applyEasyReadingToDom(resolved);
    set({ easyReading: resolved, initialized: true });

    if (!storageListenerAttached) {
      storageListenerAttached = true;
      window.addEventListener('storage', (event) => {
        if (event.key !== EASY_READING_STORAGE_KEY) return;
        const next = event.newValue === 'true';
        applyEasyReadingToDom(next);
        set({ easyReading: next, initialized: true });
      });
    }
  },
}));
