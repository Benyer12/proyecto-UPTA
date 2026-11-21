'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import PlanetVisual from '../components/PlanetVisual';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
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
  discipline: string;
}

function getPlanetPalette(name: string): PlanetPalette {
  if (name.includes('Numérix')) {
    return {
      accent: '#00F5FF',
      textAccent: '#67E8F9',
      discipline: 'Matemáticas',
    };
  }
  if (name.includes('Letralia')) {
    return {
      accent: '#BF40FF',
      textAccent: '#D8B4FE',
      discipline: 'Lenguaje',
    };
  }
  return {
    accent: '#00FF88',
    textAccent: '#6EE7B7',
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

function IconStar({ className = 'w-4 h-4' }: { className?: string }) {
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

/* ════════════════════════ PANEL EXCLUSIVO DEL ESTUDIANTE (MUNDOS Y PROGRESO) ════════════════════════ */

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

    return {
      totalLevels,
      completedLevels,
      planetsStarted,
      overallPct,
      activeMission,
      featuredPlanet,
    };
  }, [planets, progress]);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-10">
      {/* Alerta de error de sincronización */}
      {progressError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400/35 bg-rose-500/[0.08] backdrop-blur-[6px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-rose-100">
              No se pudo actualizar tu progreso guardado
            </p>
            <p className="text-xs text-rose-200/80">
              {progressError} Se muestran los niveles iniciales disponibles mientras reconectamos.
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[40px] px-4 py-2 rounded-full border border-rose-300/40 bg-rose-500/15 hover:bg-rose-500/25 text-xs font-semibold text-white cursor-pointer transition-colors shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 1. CABECERA ARQUITECTÓNICA ABIERTA (SIN CAJA GRIS PESADA) + TELEMETRÍA EN CRISTAL */}
      <section
        aria-labelledby="dashboard-heading"
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10"
      >
        <div className="space-y-2.5">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
            Mi universo · {user.usuario ? `@${user.usuario}` : 'Estudiante'}
          </div>
          <h1
            id="dashboard-heading"
            className="text-3xl sm:text-5xl font-black tracking-[-0.02em] text-white leading-tight"
          >
            Hola, {user.name || 'Explorador'}
          </h1>
          <p className="text-sm sm:text-[15px] text-white/60 max-w-xl leading-relaxed">
            Selecciona cualquiera de tus mundos para avanzar por cursos y acumular estrellas.
          </p>
        </div>

        {/* Franja de telemetría real en cristal ultra-transparente */}
        <LiquidGlass
          blur={2.5}
          refraction={14}
          bezel={0.3}
          className="rounded-2xl bg-white/[0.035] border-white/[0.10] shrink-0"
        >
          <div className="grid grid-cols-4 divide-x divide-white/10">
            <div className="px-4 sm:px-5 py-3.5">
              <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-white/45">
                <IconStar className="w-3.5 h-3.5 shrink-0" />
                <span>Estrellas</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#FDE68A] mt-0.5 tabular-nums">
                {loadingProgress ? '...' : totalStars}
              </div>
            </div>

            <div className="px-4 sm:px-5 py-3.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                Niveles
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mt-0.5 tabular-nums">
                {loadingProgress ? '...' : `${summary.completedLevels}/${summary.totalLevels}`}
              </div>
            </div>

            <div className="px-4 sm:px-5 py-3.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                Mundos
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mt-0.5 tabular-nums">
                {loadingProgress ? '...' : `${summary.planetsStarted}/${planets.length}`}
              </div>
            </div>

            <div className="px-4 sm:px-5 py-3.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                Avance
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#67E8F9] mt-0.5 tabular-nums">
                {loadingProgress ? '...' : `${summary.overallPct}%`}
              </div>
            </div>
          </div>
        </LiquidGlass>
      </section>

      {/* 2. BARRA DE SIGUIENTE MISIÓN ACTIVA EN LIQUID GLASS CRISTALINO */}
      <LiquidGlass
        blur={2.5}
        refraction={12}
        bezel={0.28}
        className="rounded-2xl bg-white/[0.035] border-white/[0.11] p-5 sm:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#67E8F9]">
              Siguiente misión sugerida
            </div>
            {summary.activeMission ? (
              <p className="text-sm sm:text-base text-white/80">
                <strong className="text-white font-semibold">
                  {summary.activeMission.planet.name}
                </strong>{' '}
                · {summary.activeMission.course.name} ({summary.activeMission.level.name})
              </p>
            ) : (
              <p className="text-sm sm:text-base text-white/80">
                Completaste los niveles habilitados. Puedes repetir cualquier reto para sumar más
                estrellas.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {summary.activeMission ? (
              <>
                <Link
                  href={`/juego/${summary.activeMission.planet.id}/${summary.activeMission.level.id}`}
                  className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-white hover:bg-white/90 text-black text-xs sm:text-sm font-semibold px-6 transition-colors"
                >
                  {summary.completedLevels === 0 ? 'Iniciar primera misión' : 'Continuar misión'}
                </Link>
                <Link
                  href={`/planeta/${summary.activeMission.planet.id}`}
                  className="glance min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/[0.11] text-white text-xs sm:text-sm font-medium px-5 transition-colors"
                >
                  Ver ruta de {summary.activeMission.planet.name}
                </Link>
              </>
            ) : (
              <Link
                href={`/planeta/${summary.featuredPlanet.id}`}
                className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-white hover:bg-white/90 text-black text-xs sm:text-sm font-semibold px-6 transition-colors"
              >
                Repasar {summary.featuredPlanet.name}
              </Link>
            )}
          </div>
        </div>
      </LiquidGlass>

      {/* 3. LOS 3 PLANETAS (EXCLUSIVOS DEL DASHBOARD DEL ESTUDIANTE) EN CRISTAL ULTRA-TRANSPARENTE */}
      <section aria-labelledby="worlds-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 mb-1">
              Mundos activos
            </div>
            <h2 id="worlds-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Explora tus planetas
            </h2>
          </div>
          <p className="font-mono text-xs text-white/45">
            {planets.length} mundos disponibles en tu cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {planets.map((planet) => {
            const palette = getPlanetPalette(planet.name);
            const stats = getPlanetStats(planet, progress);
            const isExpanded = expandedPlanetId === planet.id;
            const panelId = `planet-courses-${planet.id}`;

            return (
              <LiquidGlass
                key={planet.id}
                blur={3}
                refraction={14}
                bezel={0.26}
                className="rounded-3xl bg-white/[0.03] border-white/[0.10] flex flex-col justify-between p-6"
              >
                <article
                  aria-labelledby={`planet-title-${planet.id}`}
                  className="flex flex-col justify-between h-full gap-6"
                >
                  <div className="space-y-5">
                    {/* Fila superior: disciplina + estrellas */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
                        style={{ color: palette.textAccent }}
                      >
                        {palette.discipline}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-[#FDE68A] tabular-nums">
                        <IconStar className="w-3.5 h-3.5" />
                        <span>{stats.planetStars}</span>
                      </span>
                    </div>

                    {/* Visual 3D del planeta flotando libre sobre el cristal transparente */}
                    <div className="flex items-center justify-center py-1">
                      <div className="w-40 h-40 flex items-center justify-center">
                        <div className="scale-[0.84]">
                          <PlanetVisual name={planet.name} />
                        </div>
                      </div>
                    </div>

                    {/* Título y descripción */}
                    <div className="space-y-1.5">
                      <h3
                        id={`planet-title-${planet.id}`}
                        className="text-2xl font-bold tracking-tight text-white"
                      >
                        {planet.name}
                      </h3>
                      <p className="text-[13px] text-white/60 leading-relaxed">
                        {planet.description}
                      </p>
                    </div>

                    {/* Progreso minimalista */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/55 tabular-nums">
                        <span>
                          {stats.completedLevels} de {stats.totalLevels} niveles
                        </span>
                        <span className="font-mono text-white/80">{stats.percent}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Avance en ${planet.name}`}
                        aria-valuenow={stats.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
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

                  {/* Acciones + Temario desplegable */}
                  <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/planeta/${planet.id}`}
                        className="flex-1 min-h-[44px] inline-flex items-center justify-center rounded-full bg-white hover:bg-white/90 text-black text-xs sm:text-sm font-semibold px-4 transition-colors"
                      >
                        Abrir {planet.name}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        onClick={() => setExpandedPlanetId(isExpanded ? null : planet.id)}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] hover:bg-white/[0.10] px-4 text-xs font-medium text-white cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? 'Ocultar' : 'Niveles'}</span>
                        <IconChevron open={isExpanded} />
                      </button>
                    </div>

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
                          <div className="pt-3 space-y-3">
                            {planet.courses.map((course) => (
                              <div
                                key={course.id}
                                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 space-y-2.5"
                              >
                                <div>
                                  <h4 className="text-xs font-semibold text-white">{course.name}</h4>
                                  <p className="text-[11px] text-white/50 mt-0.5">
                                    {course.description}
                                  </p>
                                </div>
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
                                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-medium text-white/40 cursor-not-allowed"
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
                                            ? {
                                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                borderColor: 'rgba(110, 231, 183, 0.35)',
                                                color: '#A7F3D0',
                                              }
                                            : {
                                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                                borderColor: 'rgba(255, 255, 255, 0.18)',
                                                color: '#FFFFFF',
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
        <p className="text-sm font-medium text-white/60" role="status">
          Cargando tu espacio de aprendizaje...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-[72vh] flex items-center justify-center px-5 sm:px-6">
        <LiquidGlass
          blur={3}
          refraction={14}
          className="relative z-10 text-center max-w-md w-full mx-auto p-7 sm:p-9 rounded-3xl bg-white/[0.035] border-white/[0.11]"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                Acceso exclusivo de estudiantes
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Inicia sesión para ver tus planetas
              </h1>
              <p className="text-sm text-white/60 leading-relaxed">
                Los mundos interactivos y tu progreso de estrellas están disponibles únicamente
                dentro de tu cuenta de estudiante.
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
