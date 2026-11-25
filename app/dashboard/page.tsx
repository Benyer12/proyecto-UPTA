'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import PlanetVisual from '../components/PlanetVisual';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import ThemeTogglePill from '../../components/ThemeTogglePill';
import SoundTogglePill from '../../components/SoundTogglePill';
import EasyReadingTogglePill from '../../components/EasyReadingTogglePill';
import RoleAvatar from '../../components/RoleAvatar';
import { useAuthStore } from '../../lib/auth-store';
import { useThemeStore } from '../../lib/theme-store';
import { MOCK_PLANETS, MOCK_PROGRESS } from '../../lib/mock-data';
import {
  obtenerPlanetasLocales,
  obtenerProgresoEstudianteHibrido,
} from '../../lib/offline-sync';
import type { Planet, StudentProgress } from '../../shared/types';

async function obtenerProgresoDelEstudiante(userId: string) {
  return obtenerProgresoEstudianteHibrido(userId);
}

interface PlanetTheme {
  discipline: string;
  accent: string;
  border: string;
  cardBg: string;
  spotlight: string;
  ringColor: string;
  cardGlow: string;
  btnBg: string;
  btnBorder: string;
  btnGlow: string;
}

function getPlanetTheme(name: string, isLight: boolean): PlanetTheme {
  if (name.includes('Numérix')) {
    return isLight
      ? {
          discipline: 'MATEMÁTICAS',
          accent: '#0369A1',
          border: 'rgba(14, 165, 233, 0.56)',
          cardBg: 'bg-[#F4F8FF]/80',
          spotlight: 'radial-gradient(circle, rgba(14, 165, 233, 0.28) 0%, rgba(56, 189, 248, 0.1) 48%, transparent 74%)',
          ringColor: 'rgba(14, 165, 233, 0.26)',
          cardGlow: '0 24px 64px -26px rgba(14, 165, 233, 0.35)',
          btnBg: 'rgba(2, 132, 199, 0.92)',
          btnBorder: 'rgba(56, 189, 248, 0.85)',
          btnGlow: '0 10px 26px -6px rgba(14, 165, 233, 0.5)',
        }
      : {
          discipline: 'MATEMÁTICAS',
          accent: '#67E8F9',
          border: 'rgba(56, 189, 248, 0.58)',
          cardBg: 'bg-[#020B18]/[0.76]',
          spotlight: 'radial-gradient(circle, rgba(0, 245, 255, 0.34) 0%, rgba(14, 165, 233, 0.14) 46%, transparent 74%)',
          ringColor: 'rgba(103, 232, 249, 0.28)',
          cardGlow: '0 24px 70px -24px rgba(0, 245, 255, 0.38)',
          btnBg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.42) 0%, rgba(2, 132, 199, 0.55) 100%)',
          btnBorder: 'rgba(103, 232, 249, 0.72)',
          btnGlow: '0 10px 28px -6px rgba(0, 245, 255, 0.45)',
        };
  }
  if (name.includes('Letralia')) {
    return isLight
      ? {
          discipline: 'LENGUAS',
          accent: '#7E22CE',
          border: 'rgba(147, 51, 234, 0.52)',
          cardBg: 'bg-[#FAF5FF]/80',
          spotlight: 'radial-gradient(circle, rgba(192, 132, 252, 0.32) 0%, rgba(168, 85, 247, 0.1) 48%, transparent 74%)',
          ringColor: 'rgba(168, 85, 247, 0.26)',
          cardGlow: '0 24px 64px -26px rgba(147, 51, 234, 0.32)',
          btnBg: 'rgba(126, 34, 206, 0.92)',
          btnBorder: 'rgba(216, 180, 254, 0.82)',
          btnGlow: '0 10px 26px -6px rgba(147, 51, 234, 0.48)',
        }
      : {
          discipline: 'LENGUAS',
          accent: '#E9D5FF',
          border: 'rgba(217, 70, 239, 0.56)',
          cardBg: 'bg-[#100422]/[0.78]',
          spotlight: 'radial-gradient(circle, rgba(232, 121, 249, 0.34) 0%, rgba(168, 85, 247, 0.15) 46%, transparent 74%)',
          ringColor: 'rgba(232, 121, 249, 0.28)',
          cardGlow: '0 24px 70px -24px rgba(217, 70, 239, 0.38)',
          btnBg: 'linear-gradient(135deg, rgba(192, 38, 211, 0.42) 0%, rgba(126, 34, 206, 0.56) 100%)',
          btnBorder: 'rgba(240, 171, 252, 0.72)',
          btnGlow: '0 10px 28px -6px rgba(217, 70, 239, 0.45)',
        };
  }
  return isLight
    ? {
        discipline: 'CIENCIAS',
        accent: '#047857',
        border: 'rgba(16, 185, 129, 0.54)',
        cardBg: 'bg-[#F2FBF7]/80',
        spotlight: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(45, 212, 191, 0.1) 48%, transparent 74%)',
        ringColor: 'rgba(16, 185, 129, 0.26)',
        cardGlow: '0 24px 64px -26px rgba(16, 185, 129, 0.32)',
        btnBg: 'rgba(5, 150, 105, 0.92)',
        btnBorder: 'rgba(110, 231, 183, 0.85)',
        btnGlow: '0 10px 26px -6px rgba(16, 185, 129, 0.48)',
      }
    : {
        discipline: 'CIENCIAS',
        accent: '#6EE7B7',
        border: 'rgba(16, 185, 129, 0.56)',
        cardBg: 'bg-[#02130D]/[0.76]',
        spotlight: 'radial-gradient(circle, rgba(0, 255, 136, 0.32) 0%, rgba(16, 185, 129, 0.14) 46%, transparent 74%)',
        ringColor: 'rgba(110, 231, 183, 0.28)',
        cardGlow: '0 24px 70px -24px rgba(16, 185, 129, 0.38)',
        btnBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.42) 0%, rgba(5, 150, 105, 0.56) 100%)',
        btnBorder: 'rgba(110, 231, 183, 0.72)',
        btnGlow: '0 10px 28px -6px rgba(16, 185, 129, 0.45)',
      };
}

function ExplorerAvatarIcon() {
  return (
    <div
      data-keep-light-text="true"
      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-[#67E8F9]/45"
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
        boxShadow: '0 0 22px rgba(14, 165, 233, 0.42)',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <circle cx="12" cy="9.5" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M9.5 9.2C10.2 8.4 13.8 8.4 14.5 9.2"
          stroke="#BAE6FD"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6.2 19.2C6.8 16.2 9.1 14.5 12 14.5C14.9 14.5 17.2 16.2 17.8 19.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function IconStar({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.8L14.85 8.56L21.2 9.48L16.6 13.96L17.68 20.28L12 17.3L6.32 20.28L7.4 13.96L2.8 9.48L9.15 8.56L12 2.8Z"
        fill="#FACC15"
        stroke="#F59E0B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExplore({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.8C12.8 4.4 14.6 7.4 14.6 10.8L16.8 13L15.4 14.4L13.1 13.5H6.9L4.6 14.4L3.2 13L5.4 10.8C5.4 7.4 7.2 4.4 10 2.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.8" r="1.4" fill="currentColor" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLevelState({ state }: { state: 'completed' | 'unlocked' | 'locked' }) {
  if (state === 'completed') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="#6EE7B7" strokeWidth="1.5" />
        <path
          d="M5.2 8.2L7.1 10.1L10.9 6.1"
          stroke="#6EE7B7"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (state === 'unlocked') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
        <polygon points="6,4.2 12.2,8 6,11.8" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <rect x="3.5" y="7.2" width="9" height="6.2" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.6 7.2V5.3C5.6 3.97 6.67 2.9 8 2.9C9.33 2.9 10.4 3.97 10.4 5.3V7.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ════════════════════════ PANEL LIMPIO Y DIDÁCTICO DEL ESTUDIANTE ════════════════════════ */

function StudentDashboardView({
  planets,
  progress,
  user,
  totalStars,
  loadingProgress,
  progressError,
  onRetry,
}: {
  planets: Planet[];
  progress: Record<number, StudentProgress>;
  user: { id: string | number; name: string; usuario: string; role: string };
  totalStars: number;
  loadingProgress: boolean;
  progressError: string | null;
  onRetry: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';
  const [expandedPlanetId, setExpandedPlanetId] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-10 space-y-10">
      {/* Alerta de sincronización solo si hay error */}
      {progressError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400/40 bg-[#1B0B16]/90 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <p className="text-xs sm:text-sm text-rose-100 font-medium">{progressError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[38px] px-4 py-1.5 rounded-full border border-rose-300/45 bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-white cursor-pointer shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 1. BARRA DE SALUDO EN LIQUID-REFRACT CRISTALIZADO */}
      <LiquidGlass
        blur={2}
        refraction={22}
        bezel={0.38}
        saturation={1.65}
        className="rounded-3xl bg-white/[0.045] border-white/[0.16] px-5 sm:px-7 py-4 sm:py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),inset_0_-14px_26px_-12px_rgba(180,220,255,0.18),0_24px_70px_-32px_rgba(0,0,0,0.75)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <RoleAvatar role="student" name={user.name || 'Explorador'} size={50} />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate">
              ¡Hola, {user.name || 'Explorador'}!
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            <EasyReadingTogglePill showLabels />
            <SoundTogglePill />
            <ThemeTogglePill showLabels />

            <LiquidGlass
              blur={2}
              refraction={14}
              bezel={0.42}
              saturation={1.65}
              className="inline-flex items-center gap-3 rounded-full border-white/[0.18] bg-white/[0.05] px-4 sm:px-5 py-2 shrink-0"
            >
              <IconStar className="w-6 h-6 shrink-0" />
              <div className="leading-tight">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Estrellas
                </div>
                <div className="text-lg sm:text-xl font-black text-white tabular-nums">
                  {loadingProgress ? '...' : totalStars}
                </div>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </LiquidGlass>

      {/* 2. ENCABEZADO CENTRAL LIMPIO */}
      <div className="text-center space-y-2 pt-1">
        <h2 className="text-3xl sm:text-5xl font-black tracking-wide uppercase bg-gradient-to-b from-white via-[#BAE6FD] to-[#7DD3FC] bg-clip-text text-transparent">
          MAPAS ESTELARES
        </h2>
        <p className="text-sm sm:text-base text-white/75 font-medium">
          Selecciona un planeta para comenzar tu misión
        </p>
      </div>

      {/* 3. TARJETAS DE LOS 3 PLANETAS (PLANETAS COMO PROTAGONISTAS CON ESCENARIO LUMINOSO) */}
      <section aria-label="Planetas disponibles">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {planets.map((planet) => {
            const theme = getPlanetTheme(planet.name, isLight);
            const isExpanded = expandedPlanetId === planet.id;
            const panelId = `planet-courses-${planet.id}`;

            return (
              <LiquidGlass
                key={planet.id}
                blur={2.5}
                refraction={24}
                bezel={0.42}
                saturation={1.65}
                className={`group rounded-3xl ${theme.cardBg} p-6 sm:p-7 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1.5`}
                style={{
                  borderColor: theme.border,
                  boxShadow: isLight
                    ? `inset 0 1px 0 0 rgba(255,255,255,0.85), ${theme.cardGlow}`
                    : `inset 0 1px 0 0 rgba(255,255,255,0.36), inset 0 -16px 32px -14px rgba(180,220,255,0.16), ${theme.cardGlow}`,
                  backgroundImage: isLight
                    ? 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.36) 46%, transparent 76%)'
                    : 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 44%, transparent 74%), linear-gradient(180deg, rgba(4,9,24,0.35) 0%, rgba(2,5,16,0.72) 100%)',
                }}
              >
                <article
                  aria-labelledby={`planet-title-${planet.id}`}
                  className="flex flex-col items-center text-center h-full justify-between gap-6"
                >
                  {/* Escenario focal y figura 3D protagonista del planeta */}
                  <div className="pt-1 w-full flex flex-col items-center">
                    <div className="relative w-52 h-52 flex items-center justify-center mx-auto">
                      {/* Spotlight cósmico propio detrás del planeta */}
                      <div
                        aria-hidden="true"
                        className="absolute -inset-3 rounded-full pointer-events-none transition-transform duration-500 group-hover:scale-110"
                        style={{ background: theme.spotlight }}
                      />
                      {/* Órbita estelar sutil alrededor del planeta */}
                      <div
                        aria-hidden="true"
                        className="absolute w-48 h-48 rounded-full border border-dashed pointer-events-none transition-transform duration-700 group-hover:rotate-12"
                        style={{ borderColor: theme.ringColor }}
                      />
                      <div className="relative z-10 scale-[1.12] sm:scale-[1.15] transition-transform duration-500 group-hover:scale-[1.22]">
                        <PlanetVisual name={planet.name} />
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <h3
                        id={`planet-title-${planet.id}`}
                        className="text-3xl sm:text-[32px] font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
                      >
                        {planet.name}
                      </h3>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.22em] border"
                        style={{
                          color: theme.accent,
                          borderColor: theme.ringColor,
                          backgroundColor: isLight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {theme.discipline}
                      </span>
                    </div>
                  </div>

                  {/* Acciones simples: Explorar Planeta + Ver Cursos */}
                  <div className="w-full space-y-3">
                    <Link
                      href={`/planeta/${planet.id}`}
                      data-keep-light-text="true"
                      className="glance min-h-[50px] w-full inline-flex items-center justify-center gap-2 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-all hover:brightness-115 active:scale-[0.98]"
                      style={{
                        background: theme.btnBg,
                        border: `1.5px solid ${theme.btnBorder}`,
                        boxShadow: theme.btnGlow,
                      }}
                    >
                      <IconExplore className="w-4 h-4 shrink-0" />
                      <span>Explorar planeta</span>
                    </Link>

                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => setExpandedPlanetId(isExpanded ? null : planet.id)}
                      className="min-h-[40px] w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] cursor-pointer transition-opacity hover:opacity-85"
                      style={{ color: theme.accent }}
                    >
                      <IconChevron open={isExpanded} />
                      <span>{isExpanded ? 'Ocultar cursos' : 'Ver cursos'}</span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={panelId}
                          initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden text-left"
                        >
                          <div className="pt-3 mt-1 border-t border-white/10 space-y-3">
                            {planet.courses.map((course) => (
                              <div
                                key={course.id}
                                className="rounded-2xl border border-white/10 bg-[#050914]/75 p-3.5 space-y-2.5"
                              >
                                <div className="text-xs font-bold text-white">{course.name}</div>
                                <div className="flex flex-wrap gap-2">
                                  {course.levels.map((level) => {
                                    const prog = progress[level.id];
                                    const state: 'completed' | 'unlocked' | 'locked' =
                                      prog?.status === 'completed'
                                        ? 'completed'
                                        : prog?.status === 'unlocked'
                                          ? 'unlocked'
                                          : 'locked';

                                    if (state === 'locked') {
                                      return (
                                        <span
                                          key={level.id}
                                          aria-label={`${level.name} bloqueado`}
                                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-white/45 cursor-not-allowed"
                                        >
                                          <IconLevelState state="locked" />
                                          <span>{level.name}</span>
                                        </span>
                                      );
                                    }

                                    return (
                                      <Link
                                        key={level.id}
                                        href={`/juego/${planet.id}/${level.id}`}
                                        className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors hover:bg-white/[0.12]"
                                        style={
                                          state === 'completed'
                                            ? isLight
                                              ? {
                                                  backgroundColor: 'rgba(16, 185, 129, 0.14)',
                                                  borderColor: 'rgba(5, 150, 105, 0.45)',
                                                  color: '#047857',
                                                }
                                              : {
                                                  backgroundColor: 'rgba(16, 185, 129, 0.16)',
                                                  borderColor: 'rgba(110, 231, 183, 0.45)',
                                                  color: '#A7F3D0',
                                                }
                                            : {
                                                backgroundColor: theme.btnBg,
                                                borderColor: theme.btnBorder,
                                                color: isLight ? '#0F172A' : '#FFFFFF',
                                              }
                                        }
                                      >
                                        <IconLevelState state={state} />
                                        <span>{level.name}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </article>
              </LiquidGlass>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ════════════════════════ COMPONENTE DE PÁGINA /dashboard ════════════════════════ */

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<Record<number, StudentProgress>>(MOCK_PROGRESS);
  const [totalStars, setTotalStars] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    void obtenerPlanetasLocales();
    setMounted(true);
  }, []);

  const cargarProgreso = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;
    setLoadingProgress(true);
    setProgressError(null);
    const result = await obtenerProgresoDelEstudiante(String(userId));
    setProgress(result.progressMap);
    setTotalStars(result.totalStars);
    setProgressError(result.errorMessage);
    setLoadingProgress(false);
  }, [user]);

  useEffect(() => {
    if (mounted && user?.role === 'student') {
      cargarProgreso();
    }
  }, [mounted, user, cargarProgreso]);

  useEffect(() => {
    if (mounted && user?.role) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'tutor' || user.role === 'docente') {
        router.push('/maestro');
      }
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center px-6">
        <p className="text-sm font-medium text-white/65" role="status">
          Cargando tus mapas estelares...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-[72vh] flex items-center justify-center px-5 sm:px-6">
        <LiquidGlass
          blur={14}
          refraction={10}
          readingPriority
          className="relative z-10 text-center max-w-md w-full mx-auto p-7 sm:p-9 rounded-3xl bg-[#070c1c]/[0.84] border-white/[0.14]"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#67E8F9]">
                Acceso de estudiantes
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Inicia sesión para jugar
              </h1>
              <p className="text-sm text-white/70 leading-relaxed">
                Entra con tu cuenta de estudiante desde el botón superior para abrir tus planetas y
                guardar tus estrellas.
              </p>
            </div>
            <Link
              href="/"
              className="min-h-[46px] inline-flex items-center justify-center rounded-full bg-white hover:bg-white/90 text-black px-7 text-sm font-semibold transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </LiquidGlass>
      </div>
    );
  }

  if (user.role === 'admin' || user.role === 'tutor' || user.role === 'docente') return null;

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        {user.role === 'student' && (
          <StudentDashboardView
            planets={MOCK_PLANETS}
            progress={progress}
            user={user}
            totalStars={totalStars}
            loadingProgress={loadingProgress}
            progressError={progressError}
            onRetry={cargarProgreso}
          />
        )}
      </div>
    </div>
  );
}
