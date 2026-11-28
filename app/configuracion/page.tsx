'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import GlassTooltip from '../../components/ui/GlassTooltip';
import { OrbitalSpinner } from '../../components/ui/PanelSkeletons';
import LottieAnimation from '../../components/ui/LottieAnimation';
import googleCloudAnimationData from '../../lib/lottie/google-cloud.json';
import cloudLoadingAnimationData from '../../lib/lottie/cloud-loading.json';
import configGearsAnimationData from '../../lib/lottie/config-gears.json';
import { StyleCurveIcon, LeafIcon } from '../../components/DesignModeTogglePill';
import { useAuthStore } from '../../lib/auth-store';
import { useThemeStore } from '../../lib/theme-store';
import { useSoundStore } from '../../lib/sound-store';
import { useSettingsStore, type DesignMode } from '../../lib/settings-store';
import { useAccessibilityStore } from '../../lib/accessibility-store';
import { runViewTransition } from '../../lib/view-transitions';
import { playSoundEnabledChime } from '../../lib/sound-engine';
import {
  comprobarConexionReal,
  descargarTodoModoPlus,
  desactivarRecursosLocalesModoNube,
  obtenerEstadoSyncActual,
  type SyncStatusState,
} from '../../lib/offline-sync';

type ConfigSectionId = 'apariencia' | 'lectura' | 'sonido' | 'rendimiento' | 'almacenamiento';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function GearMechanicIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SunMoonGlyph({ dark }: { dark: boolean }) {
  return dark ? (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M15.6 12.6A6.3 6.3 0 0 1 7.4 4.4A6.5 6.5 0 1 0 15.6 12.6Z" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <circle cx="10" cy="10" r="3.4" stroke="currentColor" strokeWidth="1.65" />
      <path d="M10 2.5V4M10 16V17.5M2.5 10H4M16 10H17.5M4.7 4.7L5.8 5.8M14.2 14.2L15.3 15.3M15.3 4.7L14.2 5.8M5.8 14.2L4.7 15.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BookGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M3.2 4.8C3.2 4.1 3.75 3.6 4.45 3.6H7.8C9 3.6 10 4.55 10 5.75V16C9.2 15.2 8.2 14.8 7 14.8H4.45C3.75 14.8 3.2 14.25 3.2 13.55V4.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16.8 4.8C16.8 4.1 16.25 3.6 15.55 3.6H12.2C11 3.6 10 4.55 10 5.75V16C10.8 15.2 11.8 14.8 13 14.8H15.55C16.25 14.8 16.8 14.25 16.8 13.55V4.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function SoundGlyph({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M3.5 7.8H6.8L11.2 4.2V15.8L6.8 12.2H3.5C2.95 12.2 2.5 11.75 2.5 11.2V8.8C2.5 8.25 2.95 7.8 3.5 7.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      {muted ? (
        <path d="M14 7.6L17.5 11.1M17.5 7.6L14 11.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M14.2 7.3C15.1 8.1 15.6 9 15.6 10C15.6 11 15.1 11.9 14.2 12.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

function CloudDbGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="M6.2 15.2H14.2C16.1 15.2 17.5 13.8 17.5 12C17.5 10.3 16.2 9 14.6 8.9C14 6.4 11.8 4.8 9.2 4.8C6.2 4.8 3.9 7.1 3.9 10.1C2.9 10.5 2.3 11.5 2.3 12.6C2.3 14.1 3.5 15.2 5 15.2H6.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const initTheme = useThemeStore((s) => s.initTheme);
  const themeInitialized = useThemeStore((s) => s.initialized);

  const muted = useSoundStore((s) => s.muted);
  const toggleMuted = useSoundStore((s) => s.toggleMuted);
  const initSound = useSoundStore((s) => s.initSound);
  const soundInitialized = useSoundStore((s) => s.initialized);

  const designMode = useSettingsStore((s) => s.designMode);
  const setDesignModeAdmin = useSettingsStore((s) => s.setDesignModeAdmin);
  const localDbEnabled = useSettingsStore((s) => s.localDbEnabled);
  const setLocalDbEnabledAdmin = useSettingsStore((s) => s.setLocalDbEnabledAdmin);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const settingsInitialized = useSettingsStore((s) => s.initialized);

  const easyReading = useAccessibilityStore((s) => s.easyReading);
  const setEasyReading = useAccessibilityStore((s) => s.setEasyReading);
  const initAccessibility = useAccessibilityStore((s) => s.initAccessibility);
  const a11yInitialized = useAccessibilityStore((s) => s.initialized);

  const [activeSection, setActiveSection] = useState<ConfigSectionId>('apariencia');
  const [syncState, setSyncState] = useState<SyncStatusState>(() => obtenerEstadoSyncActual());
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState<string | null>(null);

  const [downloadingPlus, setDownloadingPlus] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStep, setDownloadStep] = useState<string | null>(null);
  const [lastDownloadInfo, setLastDownloadInfo] = useState<{ fecha: string; count: number } | null>(null);

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installNotice, setInstallNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!themeInitialized) initTheme();
    if (!soundInitialized) initSound();
    if (!settingsInitialized) initSettings();
    if (!a11yInitialized) initAccessibility();
  }, [
    themeInitialized,
    initTheme,
    soundInitialized,
    initSound,
    settingsInitialized,
    initSettings,
    a11yInitialized,
    initAccessibility,
  ]);

  useEffect(() => {
    try {
      const fecha = window.localStorage.getItem('universo-plus-last-download');
      const count = Number(window.localStorage.getItem('universo-plus-cached-count') || 0);
      if (fecha) {
        setLastDownloadInfo({ fecha, count: Number.isFinite(count) ? count : 0 });
      }
    } catch {}

    void comprobarConexionReal().then(() => {
      setSyncState(obtenerEstadoSyncActual());
    });

    const handleSyncStatus = (e: Event) => {
      const detail = (e as CustomEvent<SyncStatusState>).detail;
      if (detail) setSyncState(detail);
    };

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('universo-sync-status', handleSyncStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('universo-sync-status', handleSyncStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleSelectDesignModeAdmin = async (mode: DesignMode) => {
    if (!isAdmin || savingGlobal) return;
    setSavingGlobal(true);
    setGlobalFeedback(null);
    const res = await setDesignModeAdmin(mode, { role: user?.role, name: user?.name });
    runViewTransition(() => {
      if (res.ok) {
        setGlobalFeedback(
          mode === 'eco'
            ? 'Modo Ahorro activado de forma general para todos los usuarios.'
            : 'Modo Style activado de forma general para todos los usuarios.',
        );
      } else {
        setGlobalFeedback(res.error || 'No se pudo actualizar el modo visual.');
      }
      setSavingGlobal(false);
    }, 'choice');
  };

  const handleSelectStorageModeAdmin = async (enableLocalDb: boolean) => {
    if (!isAdmin || savingGlobal) return;
    setSavingGlobal(true);
    setGlobalFeedback(null);

    const res = await setLocalDbEnabledAdmin(enableLocalDb, {
      role: user?.role,
      name: user?.name,
    });

    if (!res.ok) {
      setGlobalFeedback(res.error || 'No se pudo cambiar el modo de almacenamiento.');
      setSavingGlobal(false);
      return;
    }

    if (!enableLocalDb) {
      await desactivarRecursosLocalesModoNube();
      setGlobalFeedback('Modo CLOUD activo para todos (BD Local: FALSE, solo Supabase).');
    } else {
      setGlobalFeedback('Modo PLUS activo para todos (BD Local: TRUE, Nube + Offline).');
    }
    setSavingGlobal(false);
  };

  const handleDescargarModoPlus = async () => {
    if (!isAdmin || downloadingPlus || !localDbEnabled) return;
    setDownloadingPlus(true);
    setDownloadProgress(5);
    setDownloadStep('Preparando descarga sin conexión...');

    const res = await descargarTodoModoPlus((step, percent) => {
      setDownloadStep(step);
      setDownloadProgress(percent);
    });

    if (res.ok) {
      setLastDownloadInfo({ fecha: res.fecha, count: res.rutasCacheadas });
      setDownloadStep(
        `Listo: ${res.rutasCacheadas} archivos cacheados y respaldo de Supabase en BD local.`,
      );
    } else {
      setDownloadStep(res.error || 'No se pudo completar la descarga offline.');
    }
    setDownloadingPlus(false);
  };

  const handleInstalarAppEnPC = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallNotice('Instalación iniciada en tu PC.');
      }
      setInstallPrompt(null);
      return;
    }
    setInstallNotice(
      'En Chrome o Edge: abre el menú (⋮) -> "Guardar y compartir" / "Aplicaciones" -> "Instalar Universo del Conocimiento".',
    );
  };

  const backHref = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'tutor' || user.role === 'docente'
        ? '/maestro'
        : '/dashboard'
    : '/';

  const navItems: {
    id: ConfigSectionId;
    label: string;
    badge: string;
    icon: ReactNode;
  }[] = [
    {
      id: 'apariencia',
      label: 'Apariencia',
      badge: theme === 'dark' ? 'Oscuro' : 'Claro',
      icon: <SunMoonGlyph dark={theme === 'dark'} />,
    },
    {
      id: 'lectura',
      label: 'Lectura Fácil',
      badge: easyReading ? 'Activa' : 'Normal',
      icon: <BookGlyph />,
    },
    {
      id: 'sonido',
      label: 'Sonido',
      badge: muted ? 'Silencio' : 'Activo',
      icon: <SoundGlyph muted={muted} />,
    },
    {
      id: 'rendimiento',
      label: 'Style / Ahorro',
      badge: designMode === 'eco' ? 'Ahorro' : 'Style',
      icon: designMode === 'eco' ? <LeafIcon /> : <StyleCurveIcon />,
    },
    ...(isAdmin
      ? [
          {
            id: 'almacenamiento' as ConfigSectionId,
            label: 'Nube / PLUS',
            badge: localDbEnabled ? 'PLUS' : 'Cloud',
            icon: <CloudDbGlyph />,
          },
        ]
      : []),
  ];

  const isLight = theme === 'light';

  return (
    <div className="min-h-screen px-4 sm:px-6 pb-16 pt-4 max-w-6xl mx-auto">
      {/* Marco principal Glassy Dashboard con Liquid Glass muy acentuado */}
      <LiquidGlass
        blur={14}
        refraction={26}
        bezel={0.44}
        saturation={1.65}
        className="rounded-[32px] p-4 sm:p-6"
      >
        <div className="grid gap-5 lg:grid-cols-12 items-stretch">
          {/* COLUMNA IZQUIERDA (Sidebar estilo Glassy Dashboard con todas las configuraciones) */}
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between gap-4">
            <LiquidGlass
              blur={12}
              refraction={22}
              bezel={0.4}
              saturation={1.5}
              className="rounded-3xl p-4 sm:p-5 flex-1 flex flex-col justify-between gap-5"
            >
              <div className="space-y-4">
                {/* Identificador con engranaje mecánico */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/12">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white shrink-0">
                      <LottieAnimation
                        animationData={configGearsAnimationData}
                        size={32}
                        speed={0.85}
                        forcePlay
                        renderer="canvas"
                      />
                    </span>
                    <div className="min-w-0">
                      <h1 className="text-sm sm:text-base font-extrabold text-white truncate">
                        Configuración
                      </h1>
                      <p className="text-[11px] text-white/60 truncate">
                        {isAdmin ? 'Administrador' : user ? user.name : 'Preferencias'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lista vertical de TODAS las configuraciones a la izquierda */}
                <nav aria-label="Secciones de configuración" className="space-y-1.5">
                  {navItems.map((item) => {
                    const selected = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => runViewTransition(() => setActiveSection(item.id), 'section')}
                        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          selected
                            ? 'bg-white text-slate-950 shadow-sm'
                            : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
                        }`}
                        data-active-pill={selected ? 'true' : undefined}
                      >
                        <span className="inline-flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span
                          className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${
                            selected
                              ? 'bg-slate-900/10 text-slate-800'
                              : 'bg-white/[0.08] text-white/65'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-white/12">
                <Link
                  href={backHref}
                  className="liquid-glass-btn w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white"
                >
                  <span>←</span>
                  <span>Volver</span>
                </Link>
              </div>
            </LiquidGlass>
          </aside>

          {/* COLUMNA DERECHA (Tarjetas resumen arriba + breve explicación y control de la opción elegida) */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
            {/* Fila superior de tarjetas métricas compactas estilo Glassy Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setActiveSection('apariencia')}
                className="text-left rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] p-3.5 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-mono uppercase text-white/55">Tema</div>
                <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  {theme === 'dark' ? 'Oscuro' : 'Claro'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('lectura')}
                className="text-left rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] p-3.5 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-mono uppercase text-white/55">Lectura</div>
                <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  {easyReading ? 'Fácil' : 'Estándar'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('sonido')}
                className="text-left rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] p-3.5 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-mono uppercase text-white/55">Audio</div>
                <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  {muted ? 'Silencio' : 'Activo'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('rendimiento')}
                className="text-left rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] p-3.5 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-mono uppercase text-white/55">Visual</div>
                <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  {designMode === 'eco' ? 'Ahorro' : 'Style'}
                </div>
              </button>
            </div>

            {/* Panel derecho principal con explicación BREVE y control limpio */}
            <LiquidGlass
              blur={14}
              refraction={24}
              bezel={0.42}
              saturation={1.6}
              className="rounded-3xl p-5 sm:p-7 flex-1 flex flex-col justify-between gap-5"
            >
              {activeSection === 'apariencia' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Modo Oscuro o Claro
                    </h2>
                    <p className="text-sm text-white/75 leading-relaxed max-w-xl">
                      El Modo Oscuro descansa la vista en lugares con poca luz; el Modo Claro da mayor luminosidad para aulas bien iluminadas.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
                    <button
                      type="button"
                      onClick={() => runViewTransition(() => setTheme('dark'), 'choice')}
                      className={`rounded-2xl px-4 py-3 text-sm font-bold border transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-white/[0.05] text-white/80 border-white/15 hover:bg-white/[0.1]'
                      }`}
                    >
                      Modo Oscuro
                    </button>
                    <button
                      type="button"
                      onClick={() => runViewTransition(() => setTheme('light'), 'choice')}
                      data-keep-light-text={theme === 'light' ? 'true' : undefined}
                      className={`rounded-2xl px-4 py-3 text-sm font-bold border transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white/[0.05] text-white/80 border-white/15 hover:bg-white/[0.1]'
                      }`}
                    >
                      Modo Claro
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'lectura' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Modo Lectura Fácil
                    </h2>
                    <p className="text-sm text-white/75 leading-relaxed max-w-xl">
                      Amplía el tamaño de letra, separa las líneas y mejora el contraste de los textos. También puedes activarlo rápido con la tecla <strong>L</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => runViewTransition(() => setEasyReading(true), 'choice')}
                      data-keep-light-text={easyReading ? 'true' : undefined}
                      className={`rounded-2xl px-5 py-2.5 text-sm font-bold border transition-all cursor-pointer ${
                        easyReading
                          ? 'bg-slate-900 text-white border-white/40'
                          : 'bg-white/[0.05] text-white/80 border-white/15 hover:bg-white/[0.1]'
                      }`}
                    >
                      Activado
                    </button>
                    <button
                      type="button"
                      onClick={() => runViewTransition(() => setEasyReading(false), 'choice')}
                      className={`rounded-2xl px-5 py-2.5 text-sm font-bold border transition-all cursor-pointer ${
                        !easyReading
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-white/[0.05] text-white/80 border-white/15 hover:bg-white/[0.1]'
                      }`}
                    >
                      Desactivado
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'sonido' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Sonido y Efectos
                    </h2>
                    <p className="text-sm text-white/75 leading-relaxed max-w-xl">
                      Controla los efectos de audio al lanzar el dado, responder retos y jugar en los minijuegos.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (muted) toggleMuted();
                        playSoundEnabledChime();
                      }}
                      className={`rounded-2xl px-5 py-2.5 text-sm font-bold border transition-all cursor-pointer ${
                        !muted
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-white/[0.05] text-white/80 border-white/15 hover:bg-white/[0.1]'
                      }`}
                    >
                      Sonido activo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!muted) toggleMuted();
                      }}
                      className={`rounded-2xl px-5 py-2.5 text-sm font-bold border transition-all cursor-pointer ${
                        muted
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-white/[0.05] text-white/80 border-white/15 hover:bg-white/[0.1]'
                      }`}
                    >
                      Silenciado
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'rendimiento' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                        Modo Style o Modo Ahorro
                      </h2>
                      <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/75">
                        General para todos
                      </span>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed max-w-2xl">
                      <strong>Style</strong> activa cristal líquido completo y partículas. <strong>Ahorro</strong> conserva el fondo y los colores, reduciendo efectos pesados para PCs lentas. El Administrador define este modo para estudiantes y tutores.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 items-stretch">
                    {/* Tarjeta/Botón STYLE con la curva del fondo y Liquid Glass muy acentuado */}
                    <LiquidGlass
                      blur={14}
                      refraction={28}
                      bezel={0.46}
                      saturation={1.7}
                      className={`rounded-3xl p-4 sm:p-5 transition-all ${
                        designMode === 'original' ? 'ring-2 ring-white/80' : 'opacity-85'
                      }`}
                    >
                      <img
                        src={isLight ? '/images/liquid-prism-light-bg.jpg' : '/images/liquid-prism-bg.jpg'}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center opacity-55"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-slate-950/45"
                      />
                      <div data-keep-light-text="true" className="relative z-10 flex flex-col justify-between gap-4 h-full">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-base font-extrabold text-white">
                            <StyleCurveIcon className="w-5 h-5" />
                            <span>Style</span>
                          </span>
                          <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-black/40 text-white border border-white/25">
                            {designMode === 'original' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-xs text-white/85 leading-relaxed">
                          Efectos visuales completos con la curva cósmica y cristal líquido.
                        </p>
                        {isAdmin && (
                          <button
                            type="button"
                            disabled={savingGlobal}
                            onClick={() => void handleSelectDesignModeAdmin('original')}
                            className={`w-full rounded-2xl px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                              designMode === 'original'
                                ? 'bg-white text-slate-950 border-white'
                                : 'bg-black/40 text-white border-white/25 hover:bg-black/55'
                            }`}
                          >
                            Style
                          </button>
                        )}
                      </div>
                    </LiquidGlass>

                    {/* Tarjeta/Botón MODO AHORRO simple sin colores neón */}
                    <div
                      className={`rounded-3xl p-4 sm:p-5 border flex flex-col justify-between gap-4 transition-all ${
                        designMode === 'eco'
                          ? 'bg-white/14 border-white/60'
                          : 'bg-white/[0.04] border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-base font-extrabold text-white">
                          <LeafIcon className="w-5 h-5" />
                          <span>Modo Ahorro</span>
                        </span>
                        <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                          {designMode === 'eco' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-xs text-white/75 leading-relaxed">
                        Sin partículas ni blur pesado; máxima fluidez para equipos de bajos recursos.
                      </p>
                      {isAdmin && (
                        <button
                          type="button"
                          disabled={savingGlobal}
                          onClick={() => void handleSelectDesignModeAdmin('eco')}
                          className={`w-full rounded-2xl px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                            designMode === 'eco'
                              ? 'bg-white text-slate-950 border-white'
                              : 'bg-white/[0.06] text-white/85 border-white/20 hover:bg-white/[0.12]'
                          }`}
                        >
                          Activar Modo Ahorro
                        </button>
                      )}
                    </div>
                  </div>

                  {!isAdmin && (
                    <p className="text-xs text-white/65">
                      Ajuste administrado globalmente: actualmente está activo el <strong>{designMode === 'eco' ? 'Modo Ahorro' : 'Modo Style'}</strong> para toda la plataforma.
                    </p>
                  )}
                </div>
              )}

              {activeSection === 'almacenamiento' && isAdmin && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                        Modo CLOUD o Modo PLUS
                      </h2>
                      <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/75">
                        Exclusivo Admin
                      </span>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed max-w-2xl">
                      <strong>CLOUD</strong> desactiva la BD local (<code>FALSE</code>) y usa solo Supabase en línea. <strong>PLUS</strong> activa el uso offline + online (<code>TRUE</code>) para toda la plataforma.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      disabled={savingGlobal}
                      onClick={() => void handleSelectStorageModeAdmin(false)}
                      className={`text-left rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        !localDbEnabled
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-white/[0.04] text-white border-white/15 hover:bg-white/[0.09]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-extrabold">Modo CLOUD (Solo Nube)</span>
                          <span className="font-mono text-[10px] uppercase">
                            {!localDbEnabled ? 'Activo' : 'Elegir'}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${!localDbEnabled ? 'text-slate-700' : 'text-white/70'}`}>
                          BD local desactivada (False). Todo va directo a Supabase con internet.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 flex items-center justify-center">
                        <div
                          className={`rounded-xl px-3 py-1.5 flex items-center justify-center ${
                            !localDbEnabled ? 'bg-slate-950/[0.06]' : 'bg-black/25'
                          }`}
                        >
                          <LottieAnimation
                            animationData={cloudLoadingAnimationData}
                            size={64}
                            forcePlay
                            renderer="canvas"
                          />
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={savingGlobal}
                      onClick={() => void handleSelectStorageModeAdmin(true)}
                      className={`text-left rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        localDbEnabled
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-white/[0.04] text-white border-white/15 hover:bg-white/[0.09]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-extrabold">Modo PLUS (Nube + Offline)</span>
                          <span className="font-mono text-[10px] uppercase">
                            {localDbEnabled ? 'Activo' : 'Elegir'}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${localDbEnabled ? 'text-slate-700' : 'text-white/70'}`}>
                          BD local activa (True). Funciona sin conexión y sincroniza con Supabase.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 flex items-center justify-center">
                        <div
                          className={`rounded-xl px-3 py-1.5 flex items-center justify-center ${
                            localDbEnabled ? 'bg-slate-950/[0.06]' : 'bg-black/25'
                          }`}
                        >
                          <LottieAnimation
                            animationData={googleCloudAnimationData}
                            size={64}
                            forcePlay
                            renderer="canvas"
                          />
                        </div>
                      </div>
                    </button>
                  </div>

                  {localDbEnabled && (
                    <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <span>
                            Red: <strong>{syncState.online ? 'En línea' : 'Offline'}</strong> · Pendientes: <strong>{syncState.pendingCount}</strong>
                          </span>
                          {syncState.syncing && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                              <LottieAnimation
                                animationData={googleCloudAnimationData}
                                size={22}
                                forcePlay
                                renderer="canvas"
                              />
                              <span>Guardando en la nube...</span>
                            </span>
                          )}
                        </span>
                        {lastDownloadInfo && (
                          <span className="text-white/60">
                            Última descarga: {lastDownloadInfo.count} archivos
                          </span>
                        )}
                      </div>

                      {downloadProgress > 0 && (
                        <div className="space-y-1">
                          <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden border border-white/10">
                            <div
                              className="h-full bg-white transition-all duration-300"
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>
                          {downloadStep && (
                            <p className="text-xs text-white/80">{downloadStep}</p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2.5">
                        <GlassTooltip label="Descarga todas las páginas, assets y tablas de Supabase a tu PC" placement="top">
                          <button
                            type="button"
                            disabled={downloadingPlus}
                            onClick={() => void handleDescargarModoPlus()}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-950 hover:bg-white/90 disabled:opacity-50 font-bold text-xs px-4 py-2.5 transition-colors cursor-pointer"
                          >
                            {downloadingPlus && <OrbitalSpinner size="xs" />}
                            <span>
                              {downloadingPlus
                                ? `Descargando... ${downloadProgress}%`
                                : 'Descargar recursos y BD local'}
                            </span>
                          </button>
                        </GlassTooltip>
                        <GlassTooltip label="Instalar Universo del Conocimiento como aplicación de escritorio" placement="top">
                          <button
                            type="button"
                            onClick={() => void handleInstalarAppEnPC()}
                            className="liquid-glass-btn rounded-2xl px-4 py-2.5 text-xs font-bold text-white cursor-pointer"
                          >
                            Instalar página en PC
                          </button>
                        </GlassTooltip>
                      </div>

                      {installNotice && (
                        <p className="text-xs text-white/75 leading-relaxed">{installNotice}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {globalFeedback && (
                <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs text-white/90">
                  {globalFeedback}
                </div>
              )}
            </LiquidGlass>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
}
