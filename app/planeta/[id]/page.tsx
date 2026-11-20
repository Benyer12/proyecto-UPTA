'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getPlanetById, getLevelProgress } from '../../../lib/mock-data';
import type { Course, Level } from '../../../shared/types';
import PlanetVisual from '../../components/PlanetVisual';

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
  const numStr = String(level.order).padStart(2, '0');
  const stageCode = level.isBoss ? `BOSS-0${level.order}` : `STG-${numStr}`;

  const cardInner = (
    <div
      className="relative rounded-3xl liquid-glass p-3 transition-all duration-300"
      style={{
        borderColor: available ? `${color}55` : 'rgba(255,255,255,0.08)',
        boxShadow: available
          ? `0 18px 40px -10px rgba(0,0,0,0.7), 0 0 28px -6px ${color}30, inset 0 1.5px 1px rgba(255,255,255,0.3)`
          : '0 12px 28px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        opacity: available ? 1 : 0.62,
      }}
    >
      {/* Cápsula interior Liquid Glass Retro (Doble Encapsulado + Pantalla CRT Arcade) */}
      <div
        className="relative rounded-2xl liquid-glass-pill p-4 sm:p-5 overflow-hidden"
        style={{
          background: available
            ? `linear-gradient(155deg, ${color}18 0%, rgba(10, 14, 28, 0.72) 55%, rgba(5, 8, 18, 0.86) 100%)`
            : 'linear-gradient(155deg, rgba(255,255,255,0.03) 0%, rgba(8,10,20,0.75) 100%)',
          borderColor: available ? `${color}45` : 'rgba(255,255,255,0.07)',
        }}
      >
        {/* Efecto Scanlines CRT Retro */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Esquinas técnicas Retro-HUD */}
        <span
          className="absolute top-2.5 left-2.5 w-2 h-2 border-t-2 border-l-2 pointer-events-none"
          style={{ borderColor: available ? color : 'rgba(255,255,255,0.2)' }}
        />
        <span
          className="absolute top-2.5 right-2.5 w-2 h-2 border-t-2 border-r-2 pointer-events-none"
          style={{ borderColor: available ? color : 'rgba(255,255,255,0.2)' }}
        />
        <span
          className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b-2 border-l-2 pointer-events-none"
          style={{ borderColor: available ? color : 'rgba(255,255,255,0.2)' }}
        />
        <span
          className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b-2 border-r-2 pointer-events-none"
          style={{ borderColor: available ? color : 'rgba(255,255,255,0.2)' }}
        />

        {/* Cabecera Retro HUD del Cartucho */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: available ? color : '#475569',
                boxShadow: available ? `0 0 8px ${color}` : 'none',
              }}
            />
            <span
              className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase"
              style={{ color: available ? color : '#64748b' }}
            >
              {stageCode}
            </span>
          </div>

          <span
            className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-widest"
            style={
              available
                ? {
                    color: '#fff',
                    borderColor: `${color}66`,
                    background: `${color}22`,
                    textShadow: `0 0 8px ${color}`,
                  }
                : {
                    color: '#64748b',
                    borderColor: 'rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                  }
            }
          >
            {available ? (level.isBoss ? '★ BOSS' : '● READY') : '🔒 LOCKED'}
          </span>
        </div>

        {/* Cuerpo Principal del Nivel: Monitor Retro Numérico + Info */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Pantalla Numérica Arcade Retro en Cristal Líquido */}
          <div
            className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl liquid-glass flex flex-col items-center justify-center shrink-0"
            style={{
              background: available
                ? `radial-gradient(circle at 35% 30%, ${color}35 0%, rgba(4, 8, 22, 0.9) 80%)`
                : 'rgba(5, 8, 18, 0.85)',
              borderColor: available ? `${color}80` : 'rgba(255,255,255,0.1)',
              boxShadow: available
                ? `0 0 20px ${color}35, inset 0 0 14px ${color}25`
                : 'inset 0 2px 6px rgba(0,0,0,0.7)',
            }}
          >
            <span
              className="font-mono text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5"
              style={{ color: available ? `${color}cc` : '#475569' }}
            >
              LVL
            </span>
            <span
              className="font-mono text-2xl sm:text-3xl font-black leading-none tracking-tighter"
              style={{
                color: available ? '#ffffff' : '#475569',
                textShadow: available ? `0 0 14px ${color}, 0 0 4px #ffffff` : 'none',
              }}
            >
              {numStr}
            </span>
          </div>

          {/* Detalles de la Misión + Barra de Energía Segmentada Retro */}
          <div className="flex-1 min-w-0 text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide truncate">
                {level.name}
              </h3>
              {level.isBoss && (
                <span className="text-xs" title="Jefe de Estación">
                  👾
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300/85 font-medium truncate">
              {level.description || (level.isBoss ? 'Reto del Comandante' : 'Misión de exploración')}
            </p>

            {/* Barra de energía retro por segmentos + Estrellas arcade */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((seg) => (
                  <span
                    key={seg}
                    className="h-1.5 w-3.5 rounded-xs"
                    style={{
                      background: available
                        ? seg < (level.isBoss ? 5 : 3)
                          ? color
                          : `${color}30`
                        : 'rgba(255,255,255,0.08)',
                      boxShadow:
                        available && seg < (level.isBoss ? 5 : 3) ? `0 0 6px ${color}` : 'none',
                    }}
                  />
                ))}
              </div>

              <div className="font-mono text-[11px] tracking-widest" style={{ color: available ? '#facc15' : '#475569' }}>
                ★★★
              </div>
            </div>
          </div>
        </div>

        {/* Botón inferior estilo Arcade Retro en Liquid Glass */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {level.isBoss ? 'SECTOR GUARDIÁN' : `SECTOR 0${level.order}`}
          </span>

          <span
            className="font-mono text-[11px] font-black uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
            style={
              available
                ? {
                    background: `linear-gradient(135deg, ${color}38, ${color}18)`,
                    border: `1px solid ${color}88`,
                    color: '#ffffff',
                    boxShadow: `0 0 14px ${color}30`,
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#64748b',
                  }
            }
          >
            {available ? (
              <>
                <span>▶</span> INICIAR MISIÓN
              </>
            ) : (
              <>
                <span>🔒</span> BLOQUEADO
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );

  if (available) {
    return (
      <Link href={`/juego/${planetId}/${level.id}`} className="block no-underline group">
        {cardInner}
      </Link>
    );
  }

  return <div className="cursor-not-allowed select-none">{cardInner}</div>;
}

function CoursePortalSection({
  course,
  planetColor,
  planetId,
}: {
  course: Course;
  planetColor: string;
  planetId: number;
}) {
  return (
    <div className="mb-12 last:mb-0 rounded-3xl liquid-glass liquid-glass-panel p-5 sm:p-7">
      {/* Cabecera del Curso con estética Retro-Arcade en Liquid Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl liquid-glass-pill flex items-center justify-center font-mono text-sm font-black"
            style={{
              color: planetColor,
              borderColor: `${planetColor}55`,
              boxShadow: `0 0 14px ${planetColor}25`,
            }}
          >
            0{course.order}
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 block">
              MÓDULO ORBITAL · {course.levels.length} NIVELES
            </span>
            <h2
              className="text-lg sm:text-xl font-black tracking-wide uppercase"
              style={{ color: '#ffffff', textShadow: `0 0 14px ${planetColor}55` }}
            >
              {course.name}
            </h2>
          </div>
        </div>

        <span
          className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill font-mono text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: planetColor, borderColor: `${planetColor}44` }}
        >
          <span>◈</span> {course.description}
        </span>
      </div>

      {/* Ruta Conectada de Cartuchos Liquid Glass Retro */}
      <div className="relative">
        {/* Línea conductora central tipo circuito retro */}
        <div
          className="hidden md:block absolute left-1/2 top-6 bottom-6 w-0.5 -translate-x-1/2 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${planetColor}66 0%, ${planetColor}22 50%, rgba(255,255,255,0.06) 100%)`,
            boxShadow: `0 0 10px ${planetColor}33`,
          }}
        />

        <div className="space-y-6">
          {course.levels.map((level, i) => {
            const prog = getLevelProgress(level.id);
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

                      {/* Conector central de circuito retro */}
                      <div className="hidden md:flex md:col-span-2 items-center justify-center relative">
                        <div
                          className="h-0.5 w-1/2"
                          style={{
                            background: available ? planetColor : 'rgba(255,255,255,0.1)',
                            boxShadow: available ? `0 0 8px ${planetColor}` : 'none',
                          }}
                        />
                        <div
                          className="w-5 h-5 rounded-md rotate-45 flex items-center justify-center shrink-0 z-10 border"
                          style={{
                            background: available ? '#040816' : '#0a0e1a',
                            borderColor: available ? planetColor : 'rgba(255,255,255,0.15)',
                            boxShadow: available ? `0 0 12px ${planetColor}` : 'none',
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-xs"
                            style={{ background: available ? planetColor : '#334155' }}
                          />
                        </div>
                        <div className="h-0.5 w-1/2 bg-transparent" />
                      </div>

                      <div className="hidden md:block md:col-span-5" />
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block md:col-span-5" />

                      {/* Conector central de circuito retro */}
                      <div className="hidden md:flex md:col-span-2 items-center justify-center relative">
                        <div className="h-0.5 w-1/2 bg-transparent" />
                        <div
                          className="w-5 h-5 rounded-md rotate-45 flex items-center justify-center shrink-0 z-10 border"
                          style={{
                            background: available ? '#040816' : '#0a0e1a',
                            borderColor: available ? planetColor : 'rgba(255,255,255,0.15)',
                            boxShadow: available ? `0 0 12px ${planetColor}` : 'none',
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-xs"
                            style={{ background: available ? planetColor : '#334155' }}
                          />
                        </div>
                        <div
                          className="h-0.5 w-1/2"
                          style={{
                            background: available ? planetColor : 'rgba(255,255,255,0.1)',
                            boxShadow: available ? `0 0 8px ${planetColor}` : 'none',
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
    </div>
  );
}

export default function PlanetaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const planetId = parseInt(params.id, 10);
  const planet = useMemo(() => getPlanetById(planetId), [planetId]);

  if (!planet) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="relative z-10 text-center liquid-glass liquid-glass-panel rounded-3xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-black text-white mb-2">Portal no encontrado</h1>
          <p className="text-slate-300 text-sm mb-6">Este planeta no existe en el cosmos conocido...</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="liquid-glass-btn px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
          >
            ← Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 px-4 sm:px-6 py-8 pb-20 max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-200 hover:text-white liquid-glass-pill px-4 py-2.5 rounded-xl transition-all mb-7 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Mapa estelar
        </button>

        {/* Encabezado del Planeta con el Planeta 3D Real + Doble Encapsulado Liquid Glass */}
        <div className="mb-10 rounded-3xl liquid-glass liquid-glass-panel p-4 sm:p-5">
          <div
            className="rounded-2xl liquid-glass p-6 sm:p-8 text-center relative overflow-hidden"
            style={{
              borderColor: `${planet.color}40`,
              background: `linear-gradient(160deg, ${planet.color}12 0%, rgba(10, 14, 28, 0.55) 55%, rgba(6, 8, 18, 0.72) 100%)`,
            }}
          >
            {/* Ilustración 3D real del planeta en lugar del cuadrado con símbolo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 14 }}
              className="flex items-center justify-center -my-3"
            >
              <PlanetVisual name={planet.name} className="scale-90 sm:scale-100" />
            </motion.div>

            <div className="mt-2 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass-pill font-mono text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: planet.color }}>
                <span>✦</span> SECTOR PLANETARIO · {planet.shortDescription} <span>✦</span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-black tracking-wide"
                style={{
                  background: `linear-gradient(135deg, #fff 30%, ${planet.color} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 18px ${planet.color}44)`,
                }}
              >
                {planet.name}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
                className="text-sm sm:text-base text-slate-200/90 max-w-lg mx-auto leading-relaxed"
              >
                {planet.description}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Módulos y Niveles en Liquid Glass Retro */}
        <div className="space-y-8">
          {planet.courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
            >
              <CoursePortalSection
                course={course}
                planetColor={planet.color}
                planetId={planet.id}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
