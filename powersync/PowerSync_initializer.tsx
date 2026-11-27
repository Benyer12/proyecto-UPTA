'use client';

import { useEffect, useState } from 'react';
import {
  inicializarBaseDatos,
  conectarPowerSyncBridge,
} from '../lib/powersync';
import {
  comprobarConexionReal,
  depositarSupabaseEnLocal,
  desactivarRecursosLocalesModoNube,
  obtenerEstadoSyncActual,
  sincronizarPendientesASupabase,
  type SyncStatusState,
} from '../lib/offline-sync';
import { useAuthStore } from '../lib/auth-store';
import { useSettingsStore } from '../lib/settings-store';

export default function PowerSyncInitializer() {
  const user = useAuthStore((s) => s.user);
  const localDbEnabled = useSettingsStore((s) => s.localDbEnabled);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const initialized = useSettingsStore((s) => s.initialized);

  const [syncState, setSyncState] = useState<SyncStatusState>(() =>
    obtenerEstadoSyncActual(),
  );
  const [recentNotice, setRecentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      initSettings();
    }
  }, [initialized, initSettings]);

  useEffect(() => {
    if (!initialized) return;

    if (!localDbEnabled) {
      void desactivarRecursosLocalesModoNube();
      return;
    }

    let cancelled = false;
    let noticeTimer: ReturnType<typeof setTimeout> | null = null;

    const ejecutarCicloOnline = async (forceDeposit = false) => {
      const onlineReal = await comprobarConexionReal();
      if (cancelled) return;

      if (onlineReal) {
        await conectarPowerSyncBridge();
        const res = await sincronizarPendientesASupabase();
        if (!cancelled && res.syncedCount > 0) {
          setRecentNotice(
            `${res.syncedCount} ${res.syncedCount === 1 ? 'cambio local subido' : 'cambios locales subidos'} a Supabase`,
          );
          if (noticeTimer) clearTimeout(noticeTimer);
          noticeTimer = setTimeout(() => setRecentNotice(null), 4000);
        }
        await depositarSupabaseEnLocal({
          usuarioId:
            user && user.role === 'student' ? String(user.id) : undefined,
          force: forceDeposit,
        });
      }
    };

    const iniciar = async () => {
      await inicializarBaseDatos();

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }

      await ejecutarCicloOnline(false);
    };

    void iniciar();

    const handleSyncEvent = (e: Event) => {
      const detail = (e as CustomEvent<SyncStatusState>).detail;
      if (detail && !cancelled) {
        setSyncState(detail);
      }
    };

    const handleOnline = () => {
      void ejecutarCicloOnline(true);
    };

    const handleOffline = () => {
      void comprobarConexionReal();
    };

    const interval = setInterval(() => {
      const est = obtenerEstadoSyncActual();
      if (!est.online || est.pendingCount > 0) {
        void ejecutarCicloOnline(false);
      }
    }, 12000);

    window.addEventListener('universo-sync-status', handleSyncEvent);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (noticeTimer) clearTimeout(noticeTimer);
      window.removeEventListener('universo-sync-status', handleSyncEvent);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, user?.role, localDbEnabled, initialized]);

  if (!localDbEnabled) return null;

  const showPill =
    !syncState.online ||
    syncState.syncing ||
    syncState.pendingCount > 0 ||
    Boolean(recentNotice);

  if (!showPill) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[90] pointer-events-none select-none"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#050a18]/85 px-3.5 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            !syncState.online
              ? 'bg-amber-400'
              : syncState.syncing
                ? 'bg-[#67E8F9] animate-pulse'
                : 'bg-[#6EE7B7]'
          }`}
        />
        <span className="font-mono text-[11px] font-semibold tracking-wide text-white/90">
          {!syncState.online
            ? syncState.pendingCount > 0
              ? `Sin internet · ${syncState.pendingCount} ${syncState.pendingCount === 1 ? 'cambio guardado en BD local' : 'cambios guardados en BD local'}`
              : 'Sin internet · Modo PLUS local activo'
            : syncState.syncing
              ? `Sincronizando ${syncState.pendingCount} cambios con Supabase...`
              : syncState.pendingCount > 0
                ? `${syncState.pendingCount} cambios locales por subir`
                : recentNotice}
        </span>
      </div>
    </div>
  );
}
