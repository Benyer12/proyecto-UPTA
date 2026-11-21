'use client';

import { create } from 'zustand';

const STORAGE_KEY = 'universo-sound-muted';

interface SoundState {
  muted: boolean;
  initialized: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => boolean;
  initSound: () => void;
}

let storageListenerAttached = false;

export const useSoundStore = create<SoundState>((set, get) => ({
  muted: false,
  initialized: false,
  setMuted: (muted) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {}
    set({ muted, initialized: true });
  },
  toggleMuted: () => {
    const next = !get().muted;
    get().setMuted(next);
    return next;
  },
  initSound: () => {
    if (typeof window === 'undefined') return;
    let resolved = false;
    try {
      resolved = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {}
    set({ muted: resolved, initialized: true });

    if (!storageListenerAttached) {
      storageListenerAttached = true;
      window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEY) return;
        set({ muted: event.newValue === '1', initialized: true });
      });
    }
  },
}));
