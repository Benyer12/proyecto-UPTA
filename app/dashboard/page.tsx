'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import PlanetVisual from '../components/PlanetVisual';
import { useAuthStore } from '../../lib/auth-store';
import { MOCK_PLANETS, MOCK_PROGRESS } from '../../lib/mock-data';
import type { Course, Level, Planet, StudentProgress } from '../../shared/types';

interface ProgressFetchResult {
  progressMap: Record<number, StudentProgress>;
  totalStars: number;
  errorMessage: string | null;
}

async function obtenerProgresoDelEstudiante(userId: string): Promise<ProgressFetchResult> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase
      .from('progreso_usuario')
      .select('nivel_id, completado, estrellas')
      .eq('usuario_id', userId);

    if (error) {
      return {
        progressMap: { ...MOCK_PROGRESS },
        totalStars: 0,
        errorMessage: 'No se pudo sincronizar tu progreso desde la nube.',
      };
    }

    const progressMap: Record<number, StudentProgress> = { ...MOCK_PROGRESS };
    let totalStars = 0;

    (data || []).forEach((row) => {
      const nivelId = Number(row.nivel_id);
      const stars = Number(row.estrellas) || 0;
      progressMap[nivelId] = {
        levelId: nivelId,
        status: row.completado ? 'completed' : 'unlocked',
        score: stars * 100,
        stars,
      };
      totalStars += stars;
    });

    return { progressMap, totalStars, errorMessage: null };
  } catch {
    return {
      progressMap: { ...MOCK_PROGRESS },
      totalStars: 0,
      errorMessage: 'Ocurrió un problema de conexión al consultar tu progreso.',
    };
  }
}

interface PlanetPalette {
  accent: string;
  textAccent: string;
  buttonBg: string;
  buttonText: string;
  surfaceTint: string;
  borderTint: string;
  discipline: string;
}

function getPlanetPalette(name: string): PlanetPalette {
  if (name.includes('Numérix')) {
    return {
      accent: '#00F5FF',
      textAccent: '#67E8F9',
      buttonBg: '#00F5FF',
      buttonText: '#06101F',
      surfaceTint: 'rgba(0, 245, 255, 0.07)',
      borderTint: 'rgba(103, 232, 249, 0.34)',
      discipline: 'Matemáticas',
    };
  }
  if (name.includes('Letralia')) {
    return {
      accent: '#BF40FF',
      textAccent: '#D8B4FE',
      buttonBg: '#D8B4FE',
      buttonText: '#06101F',
      surfaceTint: 'rgba(191, 64, 255, 0.08)',
      borderTint: 'rgba(216, 180, 254, 0.34)',
      discipline: 'Lenguaje',
    };
  }
  return {
    accent: '#00FF88',
    textAccent: '#6EE7B7',
    buttonBg: '#00FF88',
    buttonText: '#06101F',
    surfaceTint: 'rgba(0, 255, 136, 0.07)',
    borderTint: 'rgba(110, 231, 183, 0.34)',
    discipline: 'Ciencias',
  };
}

function getPlanetStats(planet: Planet, progress: Record<number, StudentProgress>) {
  const allLevels = planet.courses.flatMap((c) => c.levels);
  const totalLevels = allLevels.length;
  const completedLevels = allLevels.filter((lvl) => progress[lvl.id]?.status === 'completed').length;
  const unlockedLevels = allLevels.filter(
    (lvl) => progress[lvl.id]?.status === 'unlocked' || progress[lvl.id]?.status === 'completed',
  ).length;
  const planetStars = allLevels.reduce((acc, lvl) => acc + (progress[lvl.id]?.stars || 0), 0);
  const percent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

  let nextLevel: { course: Course; level: Level } | null = null;
  for (const course of planet.courses) {
    for (const level of course.levels) {
      const st = progress[level.id]?.status;
      if (st === 'unlocked') {
        nextLevel = { course, level };
        break;
      }
    }
    if (nextLevel) break;
  }

  return {
    totalLevels,
    completedLevels,
    unlockedLevels,
    planetStars,
    percent,
    nextLevel,
  };
}

/* ════════════════════════ ICONOS VECTORIALES PROPIOS (SIN EMOJIS) ════════════════════════ */

function IconStar({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.8L14.85 8.56L21.2 9.48L16.6 13.96L17.68 20.28L12 17.3L6.32 20.28L7.4 13.96L2.8 9.48L9.15 8.56L12 2.8Z"
        fill="#FDE68A"
        stroke="#F59E0B"
        strokeWidth="1.4"
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

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M4 6.25L8 10.25L12 6.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ════════════════════════ VISTA PRINCIPAL DEL ESTUDIANTE ════════════════════════ */

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
  const [expandedPlanetId, setExpandedPlanetId] = useState<number | null>(null);

  const summary = useMemo(() => {
    const allLevels = planets.flatMap((p) => p.courses.flatMap((c) => c.levels));
    const totalLevels = allLevels.length;
    const completedLevels = allLevels.filter(
      (lvl) => progress[lvl.id]?.status === 'completed',
    ).length;
    const planetsStarted = planets.filter((p) => {
      const levels = p.courses.flatMap((c) => c.levels);
      return levels.some((lvl) => progress[lvl.id]?.status === 'completed');
    }).length;
    const overallPct = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

    // Elegir la siguiente misión real disponible (prioriza el planeta en progreso o el primero disponible)
    let activeMission: { planet: Planet; course: Course; level: Level } | null = null;
    for (const planet of planets) {
      const st = getPlanetStats(planet, progress);
      if (st.completedLevels > 0 && st.nextLevel) {
        activeMission = { planet, course: st.nextLevel.course, level: st.nextLevel.level };
        break;
      }
    }
    if (!activeMission) {
      for (const planet of planets) {
        const st = getPlanetStats(planet, progress);
        if (st.nextLevel) {
          activeMission = { planet, course: st.nextLevel.course, level: st.nextLevel.level };
          break;
        }
      }
    }

    const featuredPlanet = activeMission?.planet ?? planets[0];
    const secondaryPlanets = planets.filter((p) => p.id !== featuredPlanet.id);

    return {
      totalLevels,
      completedLevels,
      planetsStarted,
      overallPct,
      activeMission,
      featuredPlanet,
      secondaryPlanets,
    };
  }, [planets, progress]);

  const featuredPalette = getPlanetPalette(summary.featuredPlanet.name);
  const featuredStats = getPlanetStats(summary.featuredPlanet, progress);

  const motionReveal = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.36, ease: 'easeOut' as const },
      };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12">
      {/* ── ALERTA DE ERROR DE SINCRONIZACIÓN (R-27) ── */}
      {progressError && (
        <div
          role="alert"
          className="rounded-xl bg-[#1A0D18]/95 border border-rose-400/50 px-4 py-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-rose-100">
              No se pudo actualizar tu progreso guardado
            </p>
            <p className="text-xs text-rose-200/90">
              {progressError} Se muestran los niveles iniciales disponibles mientras reconectamos.
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-300/60 text-xs font-bold text-white cursor-pointer transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
          >
            Reintentar carga
          </button>
        </div>
      )}

      {/* ════════════════════ 1. CONSOLA DE MISIÓN ACTIVA (PUNTO FOCAL ÚNICO, GLASS #1) ════════════════════ */}
      <motion.section
        aria-labelledby="dashboard-heading"
        {...motionReveal}
        className="rounded-2xl liquid-glass liquid-glass-panel p-5 sm:p-8 border border-white/15"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Columna izquierda: Saludo + Misión siguiente concreta */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#CBD5E1]">
                {summary.completedLevels === 0
                  ? 'Bitácora lista para tu primera partida'
                  : `Bitácora de ${user.usuario ? `@${user.usuario}` : 'tu cuenta'}`}
              </p>
              <h1
                id="dashboard-heading"
                className="text-2xl sm:text-4xl font-black tracking-tight text-[#F8FAFC] leading-tight"
              >
                Hola, {user.name || 'Explorador'}
              </h1>
            </div>

            {summary.activeMission ? (
              <div className="space-y-4 pt-1">
                <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed max-w-xl">
                  {summary.completedLevels === 0 ? (
                    <>
                      Tu punto de partida es{' '}
                      <strong className="text-white">{summary.activeMission.planet.name}</strong> en{' '}
                      <span className="text-white font-semibold">
                        {summary.activeMission.course.name}
                      </span>{' '}
                      ({summary.activeMission.level.name}).
                    </>
                  ) : (
                    <>
                      Siguiente desafío disponible:{' '}
                      <strong className="text-white">{summary.activeMission.planet.name}</strong>,{' '}
                      {summary.activeMission.course.name} ({summary.activeMission.level.name}).
                    </>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <Link
                    href={`/juego/${summary.activeMission.planet.id}/${summary.activeMission.level.id}`}
                    className="min-h-[46px] inline-flex items-center justify-center px-6 py-3 rounded-lg font-extrabold text-sm tracking-wide transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                    style={{
                      backgroundColor: featuredPalette.buttonBg,
                      color: featuredPalette.buttonText,
                      boxShadow: `0 8px 26px -6px ${featuredPalette.accent}66`,
                    }}
                  >
                    {summary.completedLevels === 0
                      ? `Jugar ${summary.activeMission.level.name} en ${summary.activeMission.planet.name}`
                      : `Continuar en ${summary.activeMission.planet.name}`}
                  </Link>

                  <Link
                    href={`/planeta/${summary.activeMission.planet.id}`}
                    className="min-h-[46px] inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white/8 hover:bg-white/14 border border-white/20 text-sm font-bold text-[#F8FAFC] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                  >
                    Ver ruta de {summary.activeMission.planet.name}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed max-w-xl">
                  Completaste los niveles habilitados en tus mundos actuales. Puedes repetir cualquier
                  nivel para mejorar tu total de estrellas.
                </p>
                <Link
                  href={`/planeta/${summary.featuredPlanet.id}`}
                  className="min-h-[46px] inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#00F5FF] text-[#06101F] font-extrabold text-sm tracking-wide hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                >
                  Repasar {summary.featuredPlanet.name}
                </Link>
              </div>
            )}
          </div>

          {/* Columna derecha: Telemetría real (superficie mate contrastada, sin números inventados) */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#0B1022]/95 border border-white/14 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">
                  Progreso real
                </span>
                {loadingProgress ? (
                  <span className="text-xs font-semibold text-[#67E8F9]" aria-live="polite">
                    Sincronizando...
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#F8FAFC]">
                    {summary.overallPct}% completado
                  </span>
                )}
              </div>

              {/* Barra de progreso general accesible */}
              <div
                role="progressbar"
                aria-label="Progreso total de niveles completados"
                aria-valuenow={summary.overallPct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.overallPct}%`,
                    backgroundColor: '#67E8F9',
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-lg bg-[#080D1C] border border-white/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]">
                    <IconStar className="w-4 h-4 shrink-0" />
                    <span>Estrellas</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#FDE68A] mt-1 tabular-nums">
                    {loadingProgress ? '...' : totalStars}
                  </div>
                </div>

                <div className="rounded-lg bg-[#080D1C] border border-white/10 p-3">
                  <div className="text-xs font-semibold text-[#94A3B8]">Niveles</div>
                  <div className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1 tabular-nums">
                    {loadingProgress ? '...' : `${summary.completedLevels}/${summary.totalLevels}`}
                  </div>
                </div>

                <div className="rounded-lg bg-[#080D1C] border border-white/10 p-3">
                  <div className="text-xs font-semibold text-[#94A3B8]">Mundos</div>
                  <div className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1 tabular-nums">
                    {loadingProgress ? '...' : `${summary.planetsStarted}/${planets.length}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ════════════════════ 2. MUNDOS DE APRENDIZAJE (RITMO ASIMÉTRICO: DESTACADO + 2 SECUNDARIOS) ════════════════════ */}
      <section aria-labelledby="worlds-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 id="worlds-heading" className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
              Mundos de aprendizaje
            </h2>
            <p className="text-sm text-[#CBD5E1] mt-1">
              Elige un planeta o entra directamente a cualquiera de los niveles habilitados.
            </p>
          </div>
          <p className="text-xs font-semibold text-[#94A3B8]">
            {planets.length} mundos activos en tu plan
          </p>
        </div>

        {/* 2A. Mundo destacado (horizontal split, segunda superficie glass dentro del tope R-10) */}
        <article
          aria-labelledby={`planet-title-${summary.featuredPlanet.id}`}
          className="rounded-2xl liquid-glass p-5 sm:p-7 border"
          style={{
            background: `linear-gradient(155deg, ${featuredPalette.surfaceTint} 0%, rgba(11, 16, 34, 0.88) 55%, rgba(8, 13, 28, 0.94) 100%)`,
            borderColor: featuredPalette.borderTint,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Visual 3D del planeta con espacio reservado (sin salto CLS) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center py-2">
              <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                <div className="scale-[0.82] sm:scale-95">
                  <PlanetVisual name={summary.featuredPlanet.name} />
                </div>
              </div>
              <span
                className="mt-2 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
                style={{
                  color: featuredPalette.textAccent,
                  borderColor: featuredPalette.borderTint,
                  backgroundColor: '#080D1C',
                }}
              >
                {featuredPalette.discipline}
              </span>
            </div>

            {/* Contenido, progreso real y accesos directos a niveles */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Mundo recomendado ahora
                  </span>
                  <h3
                    id={`planet-title-${summary.featuredPlanet.id}`}
                    className="text-2xl sm:text-3xl font-black text-[#F8FAFC]"
                  >
                    {summary.featuredPlanet.name}
                  </h3>
                  <p className="text-sm text-[#CBD5E1] max-w-xl">
                    {summary.featuredPlanet.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-[#CBD5E1] shrink-0">
                  <span className="px-3 py-1.5 rounded-md bg-[#080D1C] border border-white/12">
                    {featuredStats.completedLevels}/{featuredStats.totalLevels} niveles
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#080D1C] border border-white/12 text-[#FDE68A]">
                    <IconStar className="w-3.5 h-3.5" />
                    <span>{featuredStats.planetStars}</span>
                  </span>
                </div>
              </div>

              {/* Cursos y niveles interactivos del mundo destacado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.featuredPlanet.courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl bg-[#080D1C]/90 border border-white/10 p-4 space-y-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#F8FAFC]">{course.name}</h4>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{course.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
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
                              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-[#94A3B8] cursor-not-allowed"
                            >
                              <IconLevelState state="locked" />
                              <span>{level.name}</span>
                            </span>
                          );
                        }

                        return (
                          <Link
                            key={level.id}
                            href={`/juego/${summary.featuredPlanet.id}/${level.id}`}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                            style={
                              state === 'completed'
                                ? {
                                    backgroundColor: 'rgba(16, 185, 129, 0.16)',
                                    borderColor: 'rgba(110, 231, 183, 0.5)',
                                    color: '#A7F3D0',
                                  }
                                : {
                                    backgroundColor: 'rgba(0, 245, 255, 0.14)',
                                    borderColor: featuredPalette.borderTint,
                                    color: '#F8FAFC',
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

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={`/planeta/${summary.featuredPlanet.id}`}
                  className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-extrabold text-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                  style={{
                    backgroundColor: featuredPalette.buttonBg,
                    color: featuredPalette.buttonText,
                  }}
                >
                  Abrir mapa de {summary.featuredPlanet.name}
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* ── 2B. OTROS MUNDOS (SUPERFICIES MATE SÓLIDAS, REJILLA FLUIDA 1 -> 2 COLUMNAS) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.secondaryPlanets.map((planet) => {
            const palette = getPlanetPalette(planet.name);
            const stats = getPlanetStats(planet, progress);
            const isExpanded = expandedPlanetId === planet.id;
            const panelId = `planet-courses-${planet.id}`;

            return (
              <article
                key={planet.id}
                aria-labelledby={`planet-title-${planet.id}`}
                className="rounded-xl bg-[#0B1022]/95 border border-white/12 p-5 sm:p-6 flex flex-col justify-between gap-5 transition-colors hover:border-white/24"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                      <div className="scale-[0.54] sm:scale-[0.62]">
                        <PlanetVisual name={planet.name} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5 pt-1">
                      <span
                        className="inline-block text-xs font-bold uppercase tracking-wider"
                        style={{ color: palette.textAccent }}
                      >
                        {palette.discipline}
                      </span>
                      <h3
                        id={`planet-title-${planet.id}`}
                        className="text-xl sm:text-2xl font-black text-[#F8FAFC]"
                      >
                        {planet.name}
                      </h3>
                      <p className="text-sm text-[#CBD5E1] leading-relaxed">
                        {planet.description}
                      </p>
                    </div>
                  </div>

                  {/* Barra de avance del planeta */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#CBD5E1]">
                      <span>
                        {stats.completedLevels} de {stats.totalLevels} niveles completados
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#FDE68A] font-bold">
                        <IconStar className="w-3.5 h-3.5" />
                        <span>{stats.planetStars}</span>
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`Avance en ${planet.name}`}
                      aria-valuenow={stats.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="h-2 w-full rounded-full bg-white/10 overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.percent}%`,
                          backgroundColor: palette.accent,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Acciones con objetivo táctil >= 44px */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/planeta/${planet.id}`}
                      className="flex-1 min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-extrabold text-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                      style={{
                        backgroundColor: palette.buttonBg,
                        color: palette.buttonText,
                      }}
                    >
                      Abrir mapa de {planet.name}
                    </Link>

                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => setExpandedPlanetId(isExpanded ? null : planet.id)}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/6 hover:bg-white/12 border border-white/16 text-xs font-bold text-[#F8FAFC] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                    >
                      <span>
                        {isExpanded
                          ? 'Ocultar temario'
                          : `Ver temario (${planet.courses.length} ${planet.courses.length === 1 ? 'curso' : 'cursos'})`}
                      </span>
                      <IconChevron open={isExpanded} />
                    </button>
                  </div>

                  {/* Temario desplegable con niveles reales */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={panelId}
                        initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-1 border-t border-white/10 space-y-3">
                          {planet.courses.map((course) => (
                            <div
                              key={course.id}
                              className="rounded-lg bg-[#080D1C] border border-white/10 p-3.5 space-y-2.5"
                            >
                              <div>
                                <h4 className="text-sm font-bold text-[#F8FAFC]">{course.name}</h4>
                                <p className="text-xs text-[#94A3B8] mt-0.5">
                                  {course.description}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2.5">
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
                                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-[#94A3B8] cursor-not-allowed"
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
                                      className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                                      style={
                                        state === 'completed'
                                          ? {
                                              backgroundColor: 'rgba(16, 185, 129, 0.16)',
                                              borderColor: 'rgba(110, 231, 183, 0.5)',
                                              color: '#A7F3D0',
                                            }
                                          : {
                                              backgroundColor: palette.surfaceTint,
                                              borderColor: palette.borderTint,
                                              color: '#F8FAFC',
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
        <p className="text-sm font-semibold text-[#CBD5E1]" role="status">
          Cargando tu centro de aprendizaje...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-[72vh] flex items-center justify-center px-4 sm:px-6">
        <div className="relative z-10 text-center max-w-md w-full mx-auto p-6 sm:p-8 rounded-2xl liquid-glass liquid-glass-panel space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
              Inicia sesión para ver tu progreso
            </h1>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              Necesitas entrar con tu cuenta de estudiante para abrir los planetas y guardar tus
              estrellas.
            </p>
          </div>
          <Link
            href="/"
            className="min-h-[46px] inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#00F5FF] text-[#06101F] text-sm font-extrabold tracking-wide hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
          >
            Volver al inicio para iniciar sesión
          </Link>
        </div>
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
