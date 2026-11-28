'use client';

import { useEffect, useRef, useState } from 'react';
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
import LottieAnimation from '../components/ui/LottieAnimation';
import googleCloudAnimationData from '../lib/lottie/google-cloud.json';

interface CloudBannerState {
  title: string;
  subtitle: string;
}

export default function PowerSyncInitializer() {
  const user = useAuthStore((s) => s.user);
  const localDbEnabled = useSettingsStore((s) => s.localDbEnabled);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const initialized = useSettingsStore((s) => s.initialized);

  const [syncState, setSyncState] = useState<SyncStatusState>(() =>
    obtenerEstadoSyncActual(),
  );
  const [cloudBanner, setCloudBanner] = useState<CloudBannerState | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOfflineRef = useRef<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  const showCloudBanner = (title: string, subtitle: string, durationMs = 5500) => {
    setCloudBanner({ title, subtitle });
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setCloudBanner(null);
      bannerTimerRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    if (!initialized) {
      initSettings();
    }
  }, [initialized, initSettings]);

  // Listener global de reconexión a internet (funciona tanto en Modo PLUS como en Modo CLOUD)
  useEffect(() => {
    const onGlobalOffline = () => {
      wasOfflineRef.current = true;
    };

    const onGlobalOnline = () => {
      wasOfflineRef.current = false;
      showCloudBanner(
        'Conectado a internet',
        localDbEnabled
          ? 'Guardando tus cambios en la nube...'
          : 'Conexión con la nube restaurada',
        5500,
      );
    };

    window.addEventListener('offline', onGlobalOffline);
    window.addEventListener('online', onGlobalOnline);
    return () => {
      window.removeEventListener('offline', onGlobalOffline);
      window.removeEventListener('online', onGlobalOnline);
      if (bannerTimerRef.current) {
        clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = null;
      }
    };
  }, [localDbEnabled]);

  useEffect(() => {
    if (!initialized) return;

    if (!localDbEnabled) {
      void desactivarRecursosLocalesModoNube();
      return;
    }

    let cancelled = false;

    const ejecutarCicloOnline = async (forceDeposit = false) => {
      const onlineReal = await comprobarConexionReal();
      if (cancelled) return;

      if (onlineReal) {
        const recoveredFromOffline = wasOfflineRef.current;
        wasOfflineRef.current = false;

        await conectarPowerSyncBridge();
        const res = await sincronizarPendientesASupabase();
        if (!cancelled && res.syncedCount > 0) {
          showCloudBanner(
            'Guardado en la nube',
            `${res.syncedCount} ${res.syncedCount === 1 ? 'cambio guardado' : 'cambios guardados'} en la nube`,
            5500,
          );
        } else if (!cancelled && (recoveredFromOffline || forceDeposit)) {
          showCloudBanner(
            'Conectado a internet',
            'Tus datos están al día con la nube',
            5000,
          );
        }
        await depositarSupabaseEnLocal({
          usuarioId:
            user && user.role === 'student' ? String(user.id) : undefined,
          force: forceDeposit,
        });
      } else {
        wasOfflineRef.current = true;
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
        if (!detail.online) {
          wasOfflineRef.current = true;
        }
        setSyncState(detail);
      }
    };

    const handleOnline = () => {
      void ejecutarCicloOnline(true);
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
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
      window.removeEventListener('universo-sync-status', handleSyncEvent);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, user?.role, localDbEnabled, initialized]);

  const showCloudAnimationCard = Boolean(cloudBanner) || (localDbEnabled && syncState.online && syncState.syncing);
  const showOfflinePill =
    localDbEnabled &&
    !showCloudAnimationCard &&
    (!syncState.online || syncState.pendingCount > 0);

  if (!showCloudAnimationCard && !showOfflinePill) return null;

  if (showCloudAnimationCard) {
    const title = syncState.syncing
      ? 'Guardando en la nube...'
      : cloudBanner?.title || 'Conectado a internet';
    const subtitle = syncState.syncing
      ? syncState.pendingCount > 0
        ? `Guardando ${syncState.pendingCount} ${syncState.pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'} en la nube`
        : 'Guardando tus cambios en la nube...'
      : cloudBanner?.subtitle || 'Tus datos están al día con la nube';

    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-5 left-5 z-[95] pointer-events-none select-none"
      >
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/20 bg-[#070d1f]/95 px-4 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.6)]">
          <div className="rounded-xl bg-white/[0.08] p-1 flex items-center justify-center shrink-0">
            <LottieAnimation
              animationData={googleCloudAnimationData}
              size={54}
              forcePlay
              renderer="canvas"
            />
          </div>
          <div className="min-w-0 pr-1">
            <p className="text-sm font-extrabold text-white leading-tight">
              {title}
            </p>
            <p className="text-xs text-white/75 leading-snug mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[90] pointer-events-none select-none"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#050a18]/90 px-3.5 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            !syncState.online ? 'bg-amber-400' : 'bg-[#6EE7B7]'
          }`}
        />
        <span className="font-mono text-[11px] font-semibold tracking-wide text-white/90">
          {!syncState.online
            ? syncState.pendingCount > 0
              ? `Sin internet · ${syncState.pendingCount} ${syncState.pendingCount === 1 ? 'cambio guardado en este equipo' : 'cambios guardados en este equipo'}`
              : 'Sin internet · Modo PLUS activo en este equipo'
            : `${syncState.pendingCount} cambios pendientes por guardar en la nube`}
        </span>
      </div>
    </div>
  );
}
