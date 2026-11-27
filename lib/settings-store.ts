'use client';

import { create } from 'zustand';

export type DesignMode = 'original' | 'eco';
export type StorageArchMode = 'plus' | 'cloud';

const DESIGN_MODE_KEY = 'universo-design-mode';
const EASY_READING_KEY = 'universo-easy-reading';
const LOCAL_DB_ENABLED_KEY = 'universo-local-db-enabled';
const LOCAL_DB_UPDATED_AT_KEY = 'universo-local-db-updated-at';

interface SettingsState {
  designMode: DesignMode;
  easyReading: boolean;
  localDbEnabled: boolean;
  localDbUpdatedAt: string | null;
  initialized: boolean;
  setDesignMode: (mode: DesignMode) => void;
  toggleDesignMode: () => void;
  setEasyReading: (enabled: boolean) => void;
  toggleEasyReading: () => void;
  setLocalDbEnabledAdmin: (
    enabled: boolean,
    actor?: { role?: string; name?: string },
  ) => Promise<{ ok: boolean; syncedServer?: boolean; error?: string }>;
  initSettings: () => void;
}

let storageListenerAttached = false;
let serverSyncedOnce = false;

export function applyDesignModeToDOM(mode: DesignMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.designMode = mode;
}

export function applyEasyReadingToDOM(enabled: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.easyReading = enabled ? 'true' : 'false';
}

/**
 * Lectura síncrona usada por la capa de datos híbrida (PowerSync / Supabase)
 * para saber si el Administrador habilitó la BD local (true = Modo PLUS) o si
 * está en modo estricto Solo en la Nube (false = solo Supabase).
 */
export function isLocalDbEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(LOCAL_DB_ENABLED_KEY);
    if (raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function getStorageModeLabel(enabled: boolean): StorageArchMode {
  return enabled ? 'plus' : 'cloud';
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  designMode: 'original',
  easyReading: false,
  localDbEnabled: true,
  localDbUpdatedAt: null,
  initialized: false,

  setDesignMode: (mode) => {
    applyDesignModeToDOM(mode);
    try {
      window.localStorage.setItem(DESIGN_MODE_KEY, mode);
    } catch {}
    set({ designMode: mode, initialized: true });
  },

  toggleDesignMode: () => {
    const next: DesignMode = get().designMode === 'original' ? 'eco' : 'original';
    get().setDesignMode(next);
  },

  setEasyReading: (enabled) => {
    applyEasyReadingToDOM(enabled);
    try {
      window.localStorage.setItem(EASY_READING_KEY, enabled ? 'true' : 'false');
    } catch {}
    set({ easyReading: enabled, initialized: true });
  },

  toggleEasyReading: () => {
    get().setEasyReading(!get().easyReading);
  },

  setLocalDbEnabledAdmin: async (enabled, actor) => {
    const role = String(actor?.role || '').trim().toLowerCase();
    if (role !== 'admin') {
      return {
        ok: false,
        error: 'Solo un Administrador puede modificar el modo de almacenamiento local.',
      };
    }

    const nowIso = new Date().toISOString();
    try {
      window.localStorage.setItem(LOCAL_DB_ENABLED_KEY, enabled ? 'true' : 'false');
      window.localStorage.setItem(LOCAL_DB_UPDATED_AT_KEY, nowIso);
    } catch {}

    set({
      localDbEnabled: enabled,
      localDbUpdatedAt: nowIso,
      initialized: true,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('universo-storage-mode-change', {
          detail: { localDbEnabled: enabled, updatedAt: nowIso },
        }),
      );
    }

    let syncedServer = false;
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const res = await fetch('/api/system-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            localDbEnabled: enabled,
            role,
            updatedBy: actor?.name || 'Administrador',
          }),
        });
        if (res.ok) {
          syncedServer = true;
        }
      } catch {
        syncedServer = false;
      }
    }

    return { ok: true, syncedServer };
  },

  initSettings: () => {
    if (typeof window === 'undefined') return;

    let resolvedDesign: DesignMode = 'original';
    let resolvedReading = false;
    let resolvedLocalDb = true;
    let resolvedUpdatedAt: string | null = null;
    let hasLocalDbPref = false;

    try {
      const savedDesign = window.localStorage.getItem(DESIGN_MODE_KEY);
      if (savedDesign === 'eco' || savedDesign === 'original') {
        resolvedDesign = savedDesign;
      }

      const savedReading = window.localStorage.getItem(EASY_READING_KEY);
      resolvedReading = savedReading === 'true';

      const savedDb = window.localStorage.getItem(LOCAL_DB_ENABLED_KEY);
      if (savedDb === 'true' || savedDb === 'false') {
        resolvedLocalDb = savedDb === 'true';
        hasLocalDbPref = true;
      }
      resolvedUpdatedAt = window.localStorage.getItem(LOCAL_DB_UPDATED_AT_KEY);
    } catch {}

    applyDesignModeToDOM(resolvedDesign);
    applyEasyReadingToDOM(resolvedReading);

    set({
      designMode: resolvedDesign,
      easyReading: resolvedReading,
      localDbEnabled: resolvedLocalDb,
      localDbUpdatedAt: resolvedUpdatedAt,
      initialized: true,
    });

    if (!storageListenerAttached) {
      storageListenerAttached = true;
      window.addEventListener('storage', (event) => {
        if (event.key === DESIGN_MODE_KEY) {
          const next: DesignMode = event.newValue === 'eco' ? 'eco' : 'original';
          applyDesignModeToDOM(next);
          set({ designMode: next, initialized: true });
        } else if (event.key === EASY_READING_KEY) {
          const next = event.newValue === 'true';
          applyEasyReadingToDOM(next);
          set({ easyReading: next, initialized: true });
        } else if (event.key === LOCAL_DB_ENABLED_KEY) {
          const next = event.newValue !== 'false';
          set({ localDbEnabled: next, initialized: true });
          window.dispatchEvent(
            new CustomEvent('universo-storage-mode-change', {
              detail: { localDbEnabled: next },
            }),
          );
        }
      });
    }

    if (!serverSyncedOnce && typeof navigator !== 'undefined' && navigator.onLine) {
      serverSyncedOnce = true;
      void fetch('/api/system-config', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const cfg = data?.config;
          if (!cfg || typeof cfg.localDbEnabled !== 'boolean') return;

          const remoteTs = cfg.updatedAt ? Date.parse(cfg.updatedAt) : 0;
          const localTs = resolvedUpdatedAt ? Date.parse(resolvedUpdatedAt) : 0;

          if (!hasLocalDbPref || (remoteTs > 0 && remoteTs > localTs)) {
            const nextDb = Boolean(cfg.localDbEnabled);
            try {
              window.localStorage.setItem(LOCAL_DB_ENABLED_KEY, nextDb ? 'true' : 'false');
              if (cfg.updatedAt) {
                window.localStorage.setItem(LOCAL_DB_UPDATED_AT_KEY, String(cfg.updatedAt));
              }
            } catch {}

            const prevDb = get().localDbEnabled;
            set({
              localDbEnabled: nextDb,
              localDbUpdatedAt: cfg.updatedAt || resolvedUpdatedAt,
            });
            if (prevDb !== nextDb) {
              window.dispatchEvent(
                new CustomEvent('universo-storage-mode-change', {
                  detail: { localDbEnabled: nextDb },
                }),
              );
            }
          }
        })
        .catch(() => {});
    }
  },
}));
