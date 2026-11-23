'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { getPlanetById, getLevelProgress, MOCK_PROGRESS } from '../../../lib/mock-data';
import { obtenerProgresoEstudianteHibrido } from '../../../lib/offline-sync';
import { useAuthStore } from '../../../lib/auth-store';
import type { Course, Level, StudentProgress } from '../../../shared/types';
import PlanetVisual from '../../components/PlanetVisual';
import { LiquidGlass } from '../../../components/ui/glasscn/liquid-glass';
import { useThemeStore } from '../../../lib/theme-store';

function IconArrowLeft({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M19 12H5M12 19L5 12L12 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlay({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <polygon points="4.5,3 13,8 4.5,13" fill="currentColor" />
    </svg>
  );
}

function IconLock({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.2"
        y="7.2"
        width="9.6"
        height="6.4"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 7.2V5.3C5.5 3.92 6.62 2.8 8 2.8C9.38 2.8 10.5 3.92 10.5 5.3V7.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGuardian({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.5L16.5 5.6V10.4C16.5 14.1 13.7 17.1 10 18C6.3 17.1 3.5 14.1 3.5 10.4V5.6L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.5L11.2 9L13.8 9.4L11.9 11.2L12.4 13.8L10 12.5L7.6 13.8L8.1 11.2L6.2 9.4L8.8 9L10 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconStar({ filled, className = 'w-3.5 h-3.5' }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.4L12.35 7.16L17.6 7.92L13.8 11.62L14.7 16.85L10 14.38L5.3 16.85L6.2 11.62L2.4 7.92L7.65 7.16L10 2.4Z"
        fill={filled ? '#FDE68A' : 'none'}
        stroke={filled ? '#F59E0B' : '#475569'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MissingPortalIllustration() {
  return (
    <svg
      viewBox="0 0 200 130"
      fill="none"
      className="w-44 h-28 mx-auto"
      role="img"
      aria-label="Ilustración de órbita planetaria vacía"
    >
      <ellipse
        cx="100"
        cy="68"
        rx="74"
        ry="24"
        stroke="#67E8F9"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <circle
        cx="100"
        cy="68"
        r="28"
        fill="#0B1226"
        stroke="#67E8F9"
        strokeOpacity="0.45"
        strokeWidth="1.6"
      />
      <path
        d="M90 58L110 78M110 58L90 78"
        stroke="#94A3B8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="38" cy="54" r="3.5" fill="#67E8F9" fillOpacity="0.7" />
      <circle cx="164" cy="78" r="2.5" fill="#D8B4FE" fillOpacity="0.75" />
      <circle cx="144" cy="30" r="2" fill="#FDE68A" fillOpacity="0.7" />
    </svg>
  );
}

function getReadableAccent(color: string, isLight: boolean) {
  const normalized = color.toLowerCase();
  if (normalized.includes('bf40ff') || normalized.includes('a855f7')) {
    return isLight
      ? {
          text: '#7E22CE',
          border: 'rgba(147, 51, 234, 0.4)',
          glow: '#9333EA',
          crystalBg: 'bg-[#160726]/[0.34]',
        }
      : {
          text: '#D8B4FE',
          border: 'rgba(216, 180, 254, 0.42)',
          glow: '#BF40FF',
          crystalBg: 'bg-[#160726]/[0.34]',
        };
  }
  if (normalized.includes('00ff88') || normalized.includes('10b981') || normalized.includes('34d399')) {
    return isLight
      ? {
          text: '#047857',
          border: 'rgba(5, 150, 105, 0.42)',
          glow: '#059669',
          crystalBg: 'bg-[#031B14]/[0.34]',
        }
      : {
          text: '#6EE7B7',
          border: 'rgba(110, 231, 183, 0.42)',
          glow: '#00FF88',
          crystalBg: 'bg-[#031B14]/[0.34]',
        };
  }
  return isLight
    ? {
        text: '#0369A1',
        border: 'rgba(2, 132, 199, 0.42)',
        glow: '#0284C7',
        crystalBg: 'bg-[#031524]/[0.34]',
      }
    : {
        text: '#67E8F9',
        border: 'rgba(103, 232, 249, 0.42)',
        glow: color || '#00F5FF',
        crystalBg: 'bg-[#031524]/[0.34]',
      };
}

function RetroGlassLevelCard({
  level,
  available,
  color,
  planetId,
}: {
  level: Level;
  available: boolean;
  color: string;
  planetId: number;
}) {
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';
  const numStr = String(level.order).padStart(2, '0');
  const stageCode = level.isBoss ? `JEFE-0${level.order}` : `FASE-${numStr}`;
  const accent = getReadableAccent(color, isLight);

  const cardInner = (
    <LiquidGlass
      blur={2}
      refraction={24}
      bezel={0.38}
      saturation={1.68}
      className={`relative rounded-3xl ${accent.crystalBg} p-4 sm:p-5 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_26px_-12px_rgba(180,220,255,0.18),0_22px_64px_-28px_rgba(0,0,0,0.75)] ${
        available ? 'glance group-hover:-translate-y-0.5' : ''
      }`}
      style={{
        borderColor: available ? accent.border : 'rgba(255,255,255,0.12)',
        opacity: available ? 1 : 0.68,
        backgroundImage:
          'radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.22) 100%)',
      }}
    >
      {/* Cápsula interior cristalina transparente */}
      <div className="relative overflow-hidden">
        {/* Esquinas técnicas del visor */}
        <span
          aria-hidden="true"
          className="absolute top-2.5 left-2.5 w-2 h-2 border-t-2 border-l-2 pointer-events-none"
          style={{ borderColor: available ? accent.text : 'rgba(255,255,255,0.18)' }}
        />
        <span
          aria-hidden="true"
          className="absolute top-2.5 right-2.5 w-2 h-2 border-t-2 border-r-2 pointer-events-none"
          style={{ borderColor: available ? accent.text : 'rgba(255,255,255,0.18)' }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b-2 border-l-2 pointer-events-none"
          style={{ borderColor: available ? accent.text : 'rgba(255,255,255,0.18)' }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b-2 border-r-2 pointer-events-none"
          style={{ borderColor: available ? accent.text : 'rgba(255,255,255,0.18)' }}
        />

        {/* Cabecera técnica del nivel */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: available ? accent.text : '#64748B',
                boxShadow: available ? `0 0 8px ${accent.glow}` : 'none',
              }}
            />
            <span
              className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: available ? accent.text : '#94A3B8' }}
            >
              {stageCode}
            </span>
          </div>

          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider"
            style={
              available
                ? {
                    color: isLight ? '#0F172A' : '#F8FAFC',
                    borderColor: accent.border,
                    background: isLight ? `${accent.glow}1A` : `${accent.glow}22`,
                  }
                : {
                    color: isLight ? '#64748B' : '#94A3B8',
                    borderColor: isLight ? 'rgba(15,23,42,0.14)' : 'rgba(255,255,255,0.1)',
                    background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.04)',
                  }
            }
          >
            {available ? (
              level.isBoss ? (
                <>
                  <IconGuardian className="w-3.5 h-3.5" />
                  <span>Guardián</span>
                </>
              ) : (
                <>
                  <IconPlay className="w-3 h-3" />
                  <span>Disponible</span>
                </>
              )
            ) : (
              <>
                <IconLock className="w-3 h-3" />
                <span>Bloqueado</span>
              </>
            )}
          </span>
        </div>

        {/* Cuerpo del nivel: bloque numérico + descripción */}
        <div className="relative z-10 flex items-center gap-4">
          <div
            className="relative w-16 h-16 rounded-2xl border backdrop-blur-[4px] flex flex-col items-center justify-center shrink-0"
            style={{
              background: available
                ? `radial-gradient(circle at 35% 30%, ${accent.glow}28 0%, rgba(255, 255, 255, 0.04) 85%)`
                : 'rgba(255, 255, 255, 0.04)',
              borderColor: available ? accent.border : 'rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.24)',
            }}
          >
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5"
              style={{ color: available ? accent.text : '#94A3B8' }}
            >
              NIVEL
            </span>
            <span
              className="font-mono text-2xl font-black leading-none tracking-tight tabular-nums"
              style={{
                color: available ? (isLight ? '#0F172A' : '#F8FAFC') : isLight ? '#64748B' : '#94A3B8',
              }}
            >
              {numStr}
            </span>
          </div>

          <div className="flex-1 min-w-0 text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#F8FAFC] tracking-tight truncate">
                {level.name}
              </h3>
              {level.isBoss && (
                <span
                  className="shrink-0"
                  style={{ color: accent.text }}
                  title="Desafío del guardián"
                >
                  <IconGuardian className="w-4 h-4" />
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#CBD5E1] font-medium truncate">
              {level.description || (level.isBoss ? 'Reto del Comandante' : 'Misión de exploración')}
            </p>

            {/* Indicador de intensidad y estrellas */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((seg) => (
                  <span
                    key={seg}
                    className="h-1.5 w-3.5 rounded-xs"
                    style={{
                      background: available
                        ? seg < (level.isBoss ? 5 : 3)
                          ? accent.text
                          : `${accent.glow}2A`
                        : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-0.5" aria-label="Tres estrellas posibles">
                {[0, 1, 2].map((starIdx) => (
                  <IconStar key={starIdx} filled={available} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pie con llamada a la acción clara */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
            {level.isBoss ? 'Sector Guardián' : `Sector 0${level.order}`}
          </span>

          <span
            className="min-h-[40px] px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors"
            style={
              available
                ? {
                    background: isLight
                      ? `linear-gradient(135deg, ${accent.glow}24, ${accent.glow}10)`
                      : `linear-gradient(135deg, ${accent.glow}34, ${accent.glow}16)`,
                    border: `1px solid ${accent.border}`,
                    color: isLight ? '#0F172A' : '#F8FAFC',
                  }
                : {
                    background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.04)',
                    border: isLight ? '1px solid rgba(15,23,42,0.12)' : '1px solid rgba(255,255,255,0.1)',
                    color: isLight ? '#64748B' : '#94A3B8',
                  }
            }
          >
            {available ? (
              <>
                <IconPlay className="w-3 h-3" />
                <span>Iniciar misión</span>
              </>
            ) : (
              <>
                <IconLock className="w-3 h-3" />
                <span>Bloqueado</span>
              </>
            )}
          </span>
        </div>
      </div>
    </LiquidGlass>
  );

  if (available) {
    return (
      <Link
        href={`/juego/${planetId}/${level.id}`}
        className="block no-underline group rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#67E8F9]"
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <div className="cursor-not-allowed select-none" aria-disabled="true">
      {cardInner}
    </div>
  );
}

function CoursePortalSection({
  course,
  planetColor,
  planetId,
  progressMap,
}: {
  course: Course;
  planetColor: string;
  planetId: number;
  progressMap: Record<number, StudentProgress>;
}) {
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';
  const accent = getReadableAccent(planetColor, isLight);

  return (
    <section
      aria-labelledby={`course-heading-${course.id}`}
      className="mb-10 last:mb-0"
    >
      <LiquidGlass
        blur={2}
        refraction={24}
        bezel={0.34}
        saturation={1.65}
        className={`rounded-3xl ${accent.crystalBg} p-5 sm:p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),inset_0_-16px_30px_-14px_rgba(180,220,255,0.16),0_26px_76px_-30px_rgba(0,0,0,0.78)]`}
        style={{
          borderColor: accent.border,
          backgroundImage:
            'radial-gradient(120% 80% at 15% 6%, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.02) 40%, transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.22) 100%)',
        }}
      >
      {/* Cabecera del Curso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl liquid-glass-inset flex items-center justify-center font-mono text-sm font-black shrink-0 tabular-nums"
            style={{
              color: accent.text,
              borderColor: accent.border,
            }}
          >
            0{course.order}
          </div>
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] block">
              Módulo orbital · {course.levels.length}{' '}
              {course.levels.length === 1 ? 'nivel' : 'niveles'}
            </span>
            <h2
              id={`course-heading-${course.id}`}
              className="text-lg sm:text-xl font-black tracking-tight text-[#F8FAFC]"
            >
              {course.name}
            </h2>
          </div>
        </div>

        <span
          className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-inset text-xs font-semibold"
          style={{ color: accent.text, borderColor: accent.border }}
        >
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: accent.text }}
          />
          <span>{course.description}</span>
        </span>
      </div>

      {/* Ruta conectada de niveles */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="hidden md:block absolute left-1/2 top-6 bottom-6 w-0.5 -translate-x-1/2 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${accent.glow}66 0%, ${accent.glow}24 55%, rgba(255,255,255,0.08) 100%)`,
          }}
        />

        <div className="space-y-6">
          {course.levels.map((level, i) => {
            const prog = progressMap[level.id] || getLevelProgress(level.id);
            const available = prog.status !== 'locked';
            const isLeft = i % 2 === 0;

            return (
              <div key={level.id} className="relative">
                <div className="md:grid md:grid-cols-12 md:items-center md:gap-4">
                  {isLeft ? (
                    <>
                      <div className="md:col-span-5">
                        <RetroGlassLevelCard
                          level={level}
                          available={available}
                          color={planetColor}
                          planetId={planetId}
                        />
                      </div>

                      <div
                        aria-hidden="true"
                        className="hidden md:flex md:col-span-2 items-center justify-center relative"
                      >
                        <div
                          className="h-0.5 w-1/2"
                          style={{
                            background: available ? accent.text : 'rgba(255,255,255,0.12)',
                          }}
                        />
                        <div
                          className="w-5 h-5 rounded-md rotate-45 flex items-center justify-center shrink-0 z-10 border"
                          style={{
                            background: isLight ? '#FFFFFF' : '#080D1C',
                            borderColor: available
                              ? accent.text
                              : isLight
                                ? 'rgba(15,23,42,0.2)'
                                : 'rgba(255,255,255,0.18)',
                            boxShadow: available ? `0 0 12px ${accent.glow}66` : 'none',
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-xs"
                            style={{ background: available ? accent.text : '#475569' }}
                          />
                        </div>
                        <div className="h-0.5 w-1/2 bg-transparent" />
                      </div>

                      <div className="hidden md:block md:col-span-5" />
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block md:col-span-5" />

                      <div
                        aria-hidden="true"
                        className="hidden md:flex md:col-span-2 items-center justify-center relative"
                      >
                        <div className="h-0.5 w-1/2 bg-transparent" />
                        <div
                          className="w-5 h-5 rounded-md rotate-45 flex items-center justify-center shrink-0 z-10 border"
                          style={{
                            background: isLight ? '#FFFFFF' : '#080D1C',
                            borderColor: available
                              ? accent.text
                              : isLight
                                ? 'rgba(15,23,42,0.2)'
                                : 'rgba(255,255,255,0.18)',
                            boxShadow: available ? `0 0 12px ${accent.glow}66` : 'none',
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-xs"
                            style={{ background: available ? accent.text : '#475569' }}
                          />
                        </div>
                        <div
                          className="h-0.5 w-1/2"
                          style={{
                            background: available ? accent.text : 'rgba(255,255,255,0.12)',
                          }}
                        />
                      </div>

                      <div className="md:col-span-5">
                        <RetroGlassLevelCard
                          level={level}
                          available={available}
                          color={planetColor}
                          planetId={planetId}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </LiquidGlass>
    </section>
  );
}

export default function PlanetaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const systemReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const prefersReducedMotion = mounted && Boolean(systemReducedMotion);
  const appTheme = useThemeStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);
  const [progressMap, setProgressMap] = useState<Record<number, StudentProgress>>(MOCK_PROGRESS);
  const isLight = appTheme === 'light';
  const planetId = parseInt(params.id, 10);
  const planet = useMemo(() => getPlanetById(planetId), [planetId]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void obtenerProgresoEstudianteHibrido(String(user.id)).then((res) => {
      if (!cancelled) {
        setProgressMap(res.progressMap);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!planet) {
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center px-6">
        <div className="relative z-10 text-center liquid-glass liquid-glass-panel rounded-3xl p-8 max-w-md w-full space-y-5">
          <MissingPortalIllustration />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
              Portal no encontrado
            </h1>
            <p className="text-[#CBD5E1] text-sm leading-relaxed">
              Este planeta no existe en las cartas estelares disponibles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 liquid-glass-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#F8FAFC] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Volver al mapa estelar</span>
          </button>
        </div>
      </div>
    );
  }

  const accent = getReadableAccent(planet.color, isLight);
  const totalLevels = planet.courses.reduce((sum, c) => sum + c.levels.length, 0);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 px-4 sm:px-6 py-8 pb-20 max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E2E8F0] hover:text-white liquid-glass-pill px-4 py-2.5 rounded-xl transition-all mb-7 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Volver al mapa estelar</span>
        </button>

        {/* Encabezado asimétrico del planeta en cristal ultra-transparente glasscn */}
        <section
          aria-labelledby="planet-page-heading"
          className="mb-10"
        >
          <LiquidGlass
            blur={2}
            refraction={24}
            bezel={0.36}
            saturation={1.68}
            className={`rounded-3xl ${accent.crystalBg} p-6 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-12px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]`}
            style={{
              borderColor: accent.border,
              backgroundImage:
                'radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.22) 100%)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="md:col-span-4 flex items-center justify-center"
              >
                <PlanetVisual name={planet.name} className="scale-90 sm:scale-100" />
              </motion.div>

              <div className="md:col-span-8 text-center md:text-left space-y-3">
                <div
                  className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em]"
                  style={{ color: accent.text }}
                >
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: accent.text }}
                  />
                  <span>Sector planetario · {planet.shortDescription}</span>
                </div>

                <motion.h1
                  id="planet-page-heading"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
                >
                  {planet.name}
                </motion.h1>

                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  className="text-sm sm:text-base text-white/65 max-w-xl leading-relaxed mx-auto md:mx-0"
                >
                  {planet.description}
                </motion.p>

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <div className="px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.04] text-xs font-medium text-white tabular-nums">
                    {planet.courses.length}{' '}
                    {planet.courses.length === 1 ? 'módulo orbital' : 'módulos orbitales'}
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.04] text-xs font-medium text-white/75 tabular-nums">
                    {totalLevels} {totalLevels === 1 ? 'misión' : 'misiones'} en ruta
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlass>
        </section>

        {/* Módulos y Niveles en Liquid Glass */}
        <div className="space-y-8">
          {planet.courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.1 + i * 0.08 }}
            >
              <CoursePortalSection
                course={course}
                planetColor={planet.color}
                planetId={planet.id}
                progressMap={progressMap}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
