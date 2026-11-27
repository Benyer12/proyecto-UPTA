'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import DesignModeTogglePill, { BoltIcon, LeafIcon } from '../../components/DesignModeTogglePill';
import ThemeTogglePill from '../../components/ThemeTogglePill';
import SoundTogglePill from '../../components/SoundTogglePill';
import EasyReadingTogglePill from '../../components/EasyReadingTogglePill';
import { useAuthStore } from '../../lib/auth-store';
import { useThemeStore } from '../../lib/theme-store';
import { useSoundStore } from '../../lib/sound-store';
import { useSettingsStore } from '../../lib/settings-store';
import { useAccessibilityStore } from '../../lib/accessibility-store';
import { playSoundEnabledChime } from '../../lib/sound-engine';
import {
  comprobarConexionReal,
  descargarTodoModoPlus,
  desactivarRecursosLocalesModoNube,
  obtenerEstadoSyncActual,
  type SyncStatusState,
} from '../../lib/offline-sync';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
  const setDesignMode = useSettingsStore((s) => s.setDesignMode);
  const localDbEnabled = useSettingsStore((s) => s.localDbEnabled);
  const setLocalDbEnabledAdmin = useSettingsStore((s) => s.setLocalDbEnabledAdmin);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const settingsInitialized = useSettingsStore((s) => s.initialized);

  const easyReading = useAccessibilityStore((s) => s.easyReading);
  const setEasyReading = useAccessibilityStore((s) => s.setEasyReading);
  const initAccessibility = useAccessibilityStore((s) => s.initAccessibility);
  const a11yInitialized = useAccessibilityStore((s) => s.initialized);

  const [syncState, setSyncState] = useState<SyncStatusState>(() => obtenerEstadoSyncActual());
  const [switchingStorage, setSwitchingStorage] = useState(false);
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);

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

  const handleSelectStorageMode = async (enableLocalDb: boolean) => {
    if (!isAdmin || switchingStorage) return;
    setSwitchingStorage(true);
    setStorageFeedback(null);

    const res = await setLocalDbEnabledAdmin(enableLocalDb, {
      role: user?.role,
      name: user?.name,
    });

    if (!res.ok) {
      setStorageFeedback(res.error || 'No se pudo cambiar el modo de almacenamiento.');
      setSwitchingStorage(false);
      return;
    }

    if (!enableLocalDb) {
      await desactivarRecursosLocalesModoNube();
      setStorageFeedback(
        'Modo Solo en la Nube activado (BD Local = FALSE). Toda operación usa únicamente Supabase en línea y se limpió el caché local.',
      );
    } else {
      setStorageFeedback(
        'Modo PLUS activado (BD Local = TRUE). Ahora la plataforma combina la base de datos local PowerSync con respaldo automático en Supabase.',
      );
    }
    setSwitchingStorage(false);
  };

  const handleDescargarModoPlus = async () => {
    if (!isAdmin || downloadingPlus || !localDbEnabled) return;
    setDownloadingPlus(true);
    setDownloadProgress(5);
    setDownloadStep('Iniciando descarga para uso sin conexión...');

    const res = await descargarTodoModoPlus((step, percent) => {
      setDownloadStep(step);
      setDownloadProgress(percent);
    });

    if (res.ok) {
      setLastDownloadInfo({ fecha: res.fecha, count: res.rutasCacheadas });
      setDownloadStep(
        `Descarga completa: ${res.rutasCacheadas} recursos web cacheados y tablas de Supabase respaldadas en PowerSync local.`,
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
        setInstallNotice('Instalación iniciada. Ya podrás abrir Universo del Conocimiento directo desde tu PC incluso sin internet.');
      }
      setInstallPrompt(null);
      return;
    }
    setInstallNotice(
      'En Chrome o Edge: abre el menú superior derecho (⋮) -> "Guardar y compartir" o "Aplicaciones" -> "Instalar Universo del Conocimiento" para guardarla como app en tu escritorio.',
    );
  };

  const backHref = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'tutor' || user.role === 'docente'
        ? '/maestro'
        : '/dashboard'
    : '/';

  return (
    <div className="min-h-screen px-4 sm:px-6 pb-20 pt-6 max-w-5xl mx-auto space-y-8">
      {/* Cabecera de Configuración */}
      <LiquidGlass
        blur={6}
        refraction={14}
        bezel={0.28}
        saturation={1.25}
        className="rounded-3xl p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#67E8F9] font-semibold">
              Centro de preferencias y accesibilidad
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Configuración de la plataforma
            </h1>
            <p className="text-sm text-white/75 max-w-2xl leading-relaxed">
              Personaliza el estilo visual, el rendimiento para tu computadora, la comodidad de lectura y el sonido. Cada opción incluye su descripción antes de elegir para qué sirve.
            </p>
          </div>
          <Link
            href={backHref}
            className="liquid-glass-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white shrink-0"
          >
            <span>←</span>
            <span>Volver</span>
          </Link>
        </div>
      </LiquidGlass>

      {/* Preferencias Generales para TODOS los usuarios */}
      <section className="space-y-4">
        <div className="px-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Preferencias de visualización, rendimiento y audio
          </h2>
          <p className="text-xs sm:text-sm text-white/65">
            Disponibles para todos los usuarios (estudiantes, tutores, administradores e invitados).
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* 1. Estilo y Rendimiento: Diseño Original ⚡ vs Diseño de Ahorro 🌱 */}
          <LiquidGlass
            blur={6}
            refraction={12}
            bezel={0.26}
            saturation={1.2}
            className="rounded-3xl p-5 sm:p-6 md:col-span-2"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6EE7B7] font-semibold">
                    Style y rendimiento en tu PC
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Modo de diseño: Original (rayo) vs Ahorro (hoja de planta)
                  </h3>
                </div>
                <DesignModeTogglePill showLabels />
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-xs sm:text-sm text-white/75 leading-relaxed space-y-1.5">
                <p>
                  <strong className="text-white">¿Para qué sirve?</strong> Te permite adaptar la carga gráfica de la página según la potencia de tu computadora sin perder el fondo ni los colores del universo.
                </p>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDesignMode('original')}
                  aria-pressed={designMode === 'original'}
                  className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                    designMode === 'original'
                      ? 'border-[#38BDF8] bg-[#38BDF8]/15'
                      : 'border-white/15 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="inline-flex items-center gap-2 font-bold text-white">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#38BDF8]/20 text-[#67E8F9] border border-[#38BDF8]/40">
                        <BoltIcon className="w-4 h-4" />
                      </span>
                      <span>Diseño Original</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-white/15 text-white/80">
                      {designMode === 'original' ? 'Activo' : 'Elegir'}
                    </span>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Muestra el efecto completo de cristal líquido (Liquid Glass), partículas estelares interactivas, brillos espaciales y animaciones en todos los tableros. Ideal para equipos modernos o con buena aceleración gráfica.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDesignMode('eco')}
                  aria-pressed={designMode === 'eco'}
                  className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                    designMode === 'eco'
                      ? 'border-[#34D399] bg-[#34D399]/15'
                      : 'border-white/15 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="inline-flex items-center gap-2 font-bold text-white">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#34D399]/20 text-[#6EE7B7] border border-[#34D399]/40">
                        <LeafIcon className="w-4 h-4" />
                      </span>
                      <span>Diseño de Ahorro</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-white/15 text-white/80">
                      {designMode === 'eco' ? 'Activo' : 'Elegir'}
                    </span>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Conserva el fondo cósmico y los colores lindos de la plataforma, pero apaga las partículas, desactiva filtros pesados del cristal líquido y aligera los tableros para navegar y jugar sin lagueo en PCs de bajos recursos.
                  </p>
                </button>
              </div>
            </div>
          </LiquidGlass>

          {/* 2. Modo Oscuro / Modo Claro */}
          <LiquidGlass
            blur={6}
            refraction={12}
            bezel={0.26}
            saturation={1.2}
            className="rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#67E8F9] font-semibold">
                    Iluminación visual
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Modo Oscuro o Modo Claro
                  </h3>
                </div>
                <ThemeTogglePill showLabels />
              </div>

              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                <strong>¿Para qué sirve?</strong> El <strong>Modo Oscuro</strong> reduce el brillo general para cuidar tus ojos en habitaciones con poca luz y resalta el ambiente espacial. El <strong>Modo Claro</strong> ofrece fondos luminosos de cristal nítido ideales para aulas o lugares muy iluminados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-bold border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white text-slate-950 border-white'
                    : 'bg-white/[0.04] text-white/80 border-white/15 hover:bg-white/[0.09]'
                }`}
              >
                Modo Oscuro
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                data-keep-light-text={theme === 'light' ? 'true' : undefined}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-bold border transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white/[0.04] text-white/80 border-white/15 hover:bg-white/[0.09]'
                }`}
              >
                Modo Claro
              </button>
            </div>
          </LiquidGlass>

          {/* 3. Modo Lectura Fácil */}
          <LiquidGlass
            blur={6}
            refraction={12}
            bezel={0.26}
            saturation={1.2}
            className="rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D8B4FE] font-semibold">
                    Accesibilidad
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Modo Lectura Fácil
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <EasyReadingTogglePill showLabels />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                <strong>¿Para qué sirve?</strong> Agranda la tipografía, amplía el espaciado entre líneas y palabras, y refuerza el contraste de los textos y tarjetas para leer preguntas, explicaciones e informes sin cansancio visual. También puedes activarlo o desactivarlo rápido presionando la tecla <strong>L</strong>.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white/80">
              <span>
                Estado actual: <strong>{easyReading ? 'Lectura ampliada y alto contraste activos' : 'Tamaño de lectura estándar'}</strong>.
              </span>
              <button
                type="button"
                onClick={() => setEasyReading(!easyReading)}
                aria-pressed={easyReading}
                data-keep-light-text={easyReading ? 'true' : undefined}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shrink-0 ${
                  easyReading
                    ? 'bg-[#A855F7] text-white border-[#C084FC]'
                    : 'bg-white/[0.06] text-white/80 border-white/20 hover:bg-white/[0.12]'
                }`}
              >
                {easyReading ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </LiquidGlass>

          {/* 4. Sonido y Efectos */}
          <LiquidGlass
            blur={6}
            refraction={12}
            bezel={0.26}
            saturation={1.2}
            className="rounded-3xl p-5 sm:p-6 md:col-span-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FDE68A] font-semibold">
                  Audio interactivo
                </span>
                <h3 className="text-lg font-bold text-white">
                  Sonido y efectos de juego
                </h3>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                  <strong>¿Para qué sirve?</strong> Activa o silencia los efectos sonoros al lanzar el dado 3D, acertar preguntas, recolectar estrellas en los planetas y jugar en los 8 Minijuegos sin afectar el volumen de tu dispositivo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <SoundTogglePill showLabels />
                <button
                  type="button"
                  onClick={() => {
                    if (muted) toggleMuted();
                    playSoundEnabledChime();
                  }}
                  className="liquid-glass-btn px-4 py-2 rounded-full text-xs font-bold text-white cursor-pointer"
                >
                  Probar sonido
                </button>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </section>

      {/* Sección EXCLUSIVA del Administrador: Base de Datos Local vs Nube y Descarga Offline */}
      {isAdmin && (
        <section className="space-y-4">
          <div className="px-1 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-[#FDE68A] border border-amber-400/40 mb-1.5">
                Exclusivo Administrador
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                Almacenamiento, Base de Datos Local y Funcionamiento Sin Conexión
              </h2>
            </div>
          </div>

          <LiquidGlass
            blur={6}
            refraction={12}
            bezel={0.26}
            saturation={1.2}
            className="rounded-3xl p-6 sm:p-7 space-y-6"
          >
            <div className="rounded-2xl border border-amber-300/25 bg-amber-400/[0.06] p-4 text-xs sm:text-sm text-white/85 leading-relaxed space-y-1.5">
              <p>
                <strong>Información antes de elegir:</strong> Aquí decides la arquitectura general de datos de la plataforma en este equipo. Puedes activar el <strong>Modo PLUS (`BD Local = True`)</strong> para descargar la página, su base de datos local y usarla con o sin internet respaldando hacia Supabase; o elegir <strong>Solo en la Nube (`BD Local = False`)</strong> para desactivar por completo la base de datos local y operar únicamente con Supabase en línea.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Opción 1: Solo en la Nube (False a BD local) */}
              <button
                type="button"
                disabled={switchingStorage}
                onClick={() => void handleSelectStorageMode(false)}
                aria-pressed={!localDbEnabled}
                className={`text-left rounded-2xl p-5 border transition-all cursor-pointer ${
                  !localDbEnabled
                    ? 'border-[#38BDF8] bg-[#38BDF8]/15'
                    : 'border-white/15 bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-base sm:text-lg font-extrabold text-white">
                    Solo en la Nube (Supabase)
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase px-2.5 py-1 rounded-full font-bold border ${
                      !localDbEnabled
                        ? 'bg-[#38BDF8] text-slate-950 border-[#38BDF8]'
                        : 'border-white/20 text-white/70'
                    }`}
                  >
                    BD Local: FALSE {!localDbEnabled ? '· Activo' : ''}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                  Coloca en <strong>False</strong> general el uso de la base de datos local PowerSync y limpia los recursos sin conexión guardados en el navegador. Todas las consultas de usuarios, asignaciones y avances se realizan exclusivamente contra Supabase en la nube. Requiere internet siempre para iniciar sesión y guardar datos.
                </p>
              </button>

              {/* Opción 2: Modo PLUS (True a Offline + Online) */}
              <button
                type="button"
                disabled={switchingStorage}
                onClick={() => void handleSelectStorageMode(true)}
                aria-pressed={localDbEnabled}
                className={`text-left rounded-2xl p-5 border transition-all cursor-pointer ${
                  localDbEnabled
                    ? 'border-[#34D399] bg-[#34D399]/15'
                    : 'border-white/15 bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-base sm:text-lg font-extrabold text-white">
                    Modo PLUS (Offline + Online)
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase px-2.5 py-1 rounded-full font-bold border ${
                      localDbEnabled
                        ? 'bg-[#34D399] text-slate-950 border-[#34D399]'
                        : 'border-white/20 text-white/70'
                    }`}
                  >
                    BD Local: TRUE {localDbEnabled ? '· Activo' : ''}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                  Coloca en <strong>True</strong> el funcionamiento híbrido sin conexión y en línea. Descarga y respalda las tablas de Supabase en la base de datos local PowerSync SQLite junto con las rutas y recursos de la página en tu PC, permitiendo usarla y guardar progreso aunque se corte el internet (subiéndolo automáticamente al reconectar).
                </p>
              </button>
            </div>

            {storageFeedback && (
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs sm:text-sm text-white/90">
                {storageFeedback}
              </div>
            )}

            {/* Sub-panel de descarga de recursos, BD local e instalación en PC (solo cuando Modo PLUS = TRUE) */}
            {localDbEnabled && (
              <div className="rounded-2xl border border-[#34D399]/35 bg-[#34D399]/[0.07] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Descargar página, recursos y base de datos local en esta PC
                    </h3>
                    <p className="text-xs text-white/75 mt-1 leading-relaxed">
                      Guarda en este equipo las vistas clave (Inicio, Tableros, Minijuegos, Tutor y Admin), el Service Worker offline y una copia actualizada de Supabase en SQLite local para abrir la web sin conexión.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl border border-white/12 bg-black/25 px-3.5 py-2.5">
                    <div className="text-white/55 font-mono text-[10px] uppercase">Estado de red</div>
                    <div className="font-bold text-white mt-0.5">
                      {syncState.online ? 'En línea con Supabase' : 'Sin conexión (Offline)'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/12 bg-black/25 px-3.5 py-2.5">
                    <div className="text-white/55 font-mono text-[10px] uppercase">Pendientes por subir</div>
                    <div className="font-bold text-white mt-0.5">
                      {syncState.pendingCount} {syncState.pendingCount === 1 ? 'registro' : 'registros'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/12 bg-black/25 px-3.5 py-2.5">
                    <div className="text-white/55 font-mono text-[10px] uppercase">Última descarga PLUS</div>
                    <div className="font-bold text-white mt-0.5">
                      {lastDownloadInfo
                        ? `${lastDownloadInfo.count} archivos (${new Date(lastDownloadInfo.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                        : 'Pendiente de descargar'}
                    </div>
                  </div>
                </div>

                {downloadProgress > 0 && (
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full rounded-full bg-black/35 overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-[#34D399] transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    {downloadStep && (
                      <p className="text-xs text-[#6EE7B7] font-medium">{downloadStep}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={downloadingPlus}
                    onClick={() => void handleDescargarModoPlus()}
                    className="rounded-full bg-[#34D399] hover:bg-[#6EE7B7] disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-2.5 transition-colors cursor-pointer"
                  >
                    {downloadingPlus
                      ? `Descargando... ${downloadProgress}%`
                      : 'Descargar recursos y BD local en mi PC'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleInstalarAppEnPC()}
                    className="liquid-glass-btn rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer"
                  >
                    Instalar acceso de la página en esta PC
                  </button>
                </div>

                {installNotice && (
                  <div className="rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white/85 leading-relaxed">
                    {installNotice}
                  </div>
                )}
              </div>
            )}
          </LiquidGlass>
        </section>
      )}
    </div>
  );
}
