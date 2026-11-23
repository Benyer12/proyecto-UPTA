'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import PlanetVisual from './components/PlanetVisual';
import { LiquidGlass } from '../components/ui/glasscn/liquid-glass';
import { useThemeStore } from '../lib/theme-store';
import { playStep } from '../lib/sound-engine';

interface PlanetShowcase {
  id: number;
  nombre: string;
  materia: string;
  frase: string;
  accent: string;
  lightAccent: string;
  border: string;
  lightBorder: string;
  neonGlowDark: string;
  neonGlowLight: string;
  vividGradient: string;
  orbitColorA: string;
  orbitColorB: string;
  bgClass: string;
}

const PLANETAS_MUESTRA: PlanetShowcase[] = [
  {
    id: 1,
    nombre: 'Numérix',
    materia: 'Matemáticas · 6 niveles',
    frase: 'Calcula, resuelve acertijos numéricos y domina las operaciones.',
    accent: '#00F5FF',
    lightAccent: '#0284C7',
    border: 'rgba(0, 245, 255, 0.55)',
    lightBorder: 'rgba(2, 132, 199, 0.48)',
    neonGlowDark:
      '0 0 34px rgba(0, 245, 255, 0.44), 0 0 80px rgba(37, 99, 235, 0.34), inset 0 1px 0 0 rgba(255,255,255,0.45)',
    neonGlowLight:
      '0 0 30px rgba(14, 165, 233, 0.3), 0 16px 44px -16px rgba(37, 99, 235, 0.32), inset 0 1px 0 0 rgba(255,255,255,0.95)',
    vividGradient:
      'radial-gradient(circle at 22% 22%, rgba(0, 245, 255, 0.42) 0%, transparent 56%), radial-gradient(circle at 82% 76%, rgba(59, 130, 246, 0.48) 0%, transparent 58%), radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.24) 0%, transparent 72%)',
    orbitColorA: '#00F5FF',
    orbitColorB: '#60A5FA',
    bgClass: 'bg-[#031524]/[0.34]',
  },
  {
    id: 2,
    nombre: 'Letralia',
    materia: 'Lenguaje · 3 niveles',
    frase: 'Practica lectura, ortografía y redacción con misiones rápidas.',
    accent: '#F0ABFC',
    lightAccent: '#9333EA',
    border: 'rgba(232, 121, 249, 0.58)',
    lightBorder: 'rgba(147, 51, 234, 0.48)',
    neonGlowDark:
      '0 0 34px rgba(232, 121, 249, 0.46), 0 0 80px rgba(168, 85, 247, 0.36), inset 0 1px 0 0 rgba(255,255,255,0.45)',
    neonGlowLight:
      '0 0 30px rgba(192, 38, 211, 0.28), 0 16px 44px -16px rgba(147, 51, 234, 0.3), inset 0 1px 0 0 rgba(255,255,255,0.95)',
    vividGradient:
      'radial-gradient(circle at 20% 24%, rgba(244, 63, 94, 0.36) 0%, transparent 54%), radial-gradient(circle at 80% 74%, rgba(192, 38, 211, 0.48) 0%, transparent 58%), radial-gradient(circle at 50% 48%, rgba(168, 85, 247, 0.28) 0%, transparent 72%)',
    orbitColorA: '#F472B6',
    orbitColorB: '#C084FC',
    bgClass: 'bg-[#160726]/[0.36]',
  },
  {
    id: 3,
    nombre: 'Naturae',
    materia: 'Ciencias · 3 niveles',
    frase: 'Descubre el cuerpo humano, los ecosistemas y la ciencia diaria.',
    accent: '#00FF88',
    lightAccent: '#059669',
    border: 'rgba(0, 255, 136, 0.54)',
    lightBorder: 'rgba(5, 150, 105, 0.48)',
    neonGlowDark:
      '0 0 34px rgba(0, 255, 136, 0.42), 0 0 80px rgba(6, 182, 212, 0.32), inset 0 1px 0 0 rgba(255,255,255,0.45)',
    neonGlowLight:
      '0 0 30px rgba(16, 185, 129, 0.3), 0 16px 44px -16px rgba(6, 182, 212, 0.28), inset 0 1px 0 0 rgba(255,255,255,0.95)',
    vividGradient:
      'radial-gradient(circle at 24% 22%, rgba(0, 255, 136, 0.38) 0%, transparent 55%), radial-gradient(circle at 80% 78%, rgba(6, 182, 212, 0.46) 0%, transparent 58%), radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.26) 0%, transparent 72%)',
    orbitColorA: '#00FF88',
    orbitColorB: '#22D3EE',
    bgClass: 'bg-[#031B14]/[0.34]',
  },
];

const PASOS_RAPIDOS = [
  {
    code: '01',
    title: 'Inicia sesión',
    description: 'Usa tu usuario para guardar tus estrellas y continuar donde quedaste.',
    accent: '#67E8F9',
    lightAccent: '#0369A1',
  },
  {
    code: '02',
    title: 'Lanza el dado',
    description: 'Muévete por el tablero y responde preguntas cortas en cada casilla.',
    accent: '#D8B4FE',
    lightAccent: '#7E22CE',
  },
  {
    code: '03',
    title: 'Gana estrellas',
    description: 'Suma puntos, usa pistas cuando las necesites y desbloquea niveles.',
    accent: '#6EE7B7',
    lightAccent: '#047857',
  },
];

function PlanetMiniIcon({ id, color }: { id: number; color: string }) {
  if (id === 1) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
        <path d="M5 7H9M7 5V9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11.5 13H15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 6L15 9M15 6L12 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="7" cy="13.5" r="1.1" fill={color} />
      </svg>
    );
  }
  if (id === 2) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
        <path
          d="M4.5 5.2C6.8 4.6 8.8 5.1 10 6.2C11.2 5.1 13.2 4.6 15.5 5.2V14.8C13.2 14.2 11.2 14.7 10 15.8C8.8 14.7 6.8 14.2 4.5 14.8V5.2Z"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M10 6.2V15.5" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <path
        d="M15.8 4.4C10.8 4.4 6.6 7.1 5.3 11.8C4.8 13.5 5.5 15 7.2 15.4C11.7 16.4 15.8 12.2 15.8 4.4Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5.5 14.8L11.5 9.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StepBadgeIcon({ code, color }: { code: string; color: string }) {
  if (code === '01') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="8.5" r="3.5" stroke={color} strokeWidth="1.7" />
        <path
          d="M5.5 19C5.5 15.8 8.4 13.5 12 13.5C15.6 13.5 18.5 15.8 18.5 19"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (code === '02') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3.5" stroke={color} strokeWidth="1.7" />
        <circle cx="9" cy="9" r="1.2" fill={color} />
        <circle cx="15" cy="9" r="1.2" fill={color} />
        <circle cx="12" cy="12" r="1.2" fill={color} />
        <circle cx="9" cy="15" r="1.2" fill={color} />
        <circle cx="15" cy="15" r="1.2" fill={color} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
      <path
        d="M12 3.2L14.7 8.7L20.8 9.6L16.4 13.9L17.4 20L12 17.1L6.6 20L7.6 13.9L3.2 9.6L9.3 8.7L12 3.2Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const systemReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const prefersReducedMotion = mounted && Boolean(systemReducedMotion);
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';

  const [activeIdx, setActiveIdx] = useState(0);

  const activePlanet = PLANETAS_MUESTRA[activeIdx];
  const activeColor = isLight ? activePlanet.lightAccent : activePlanet.accent;

  const handleSelectPlanet = (idx: number) => {
    setActiveIdx(idx);
    playStep();
  };

  const handleNextPlanet = () => {
    setActiveIdx((prev) => (prev + 1) % PLANETAS_MUESTRA.length);
    playStep();
  };

  return (
    <div className="relative min-h-screen overflow-x-clip text-white selection:bg-white/25">
      {/* ════════════════════ 1. HERO VISUAL CON BRILLO NEÓN Y TARJETA INTERACTIVA ════════════════════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10 pt-10 sm:pt-16 pb-14 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.06fr_0.98fr] lg:gap-12 items-center">
          {/* Izquierda: Titular con brillo neón sincronizado, subtítulo y botones claros */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative space-y-6"
          >
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#070b18]/65 backdrop-blur-md px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#67E8F9]">
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                  <path
                    d="M8 1.8L9.6 5.8L13.8 7.5L9.6 9.2L8 13.2L6.4 9.2L2.2 7.5L6.4 5.8L8 1.8Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Primaria · 10 a 12 años</span>
              </div>

              <h1 className="hero-neon-title text-4xl sm:text-6xl xl:text-[64px] font-black tracking-[-0.03em] leading-[0.98] text-white">
                UNIVERSO DEL
                <span className="hero-neon-accent block bg-gradient-to-r from-white via-[#67E8F9] to-[#C084FC] bg-clip-text text-transparent">
                  CONOCIMIENTO
                </span>
              </h1>

              <p className="max-w-lg text-base sm:text-lg leading-relaxed text-white/80">
                Refuerzo escolar de 10 a 12 años: avanza por tableros espaciales, supera retos
                cortos y aprende a tu ritmo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                <Link
                  href="/dashboard"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition-all hover:bg-white/90 shadow-[0_0_24px_rgba(103,232,249,0.34)]"
                >
                  <span>Entrar a jugar</span>
                  <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden="true">
                    <path
                      d="M3.5 8H12.5M8.5 4L12.5 8L8.5 12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                <LiquidGlass
                  blur={2}
                  refraction={18}
                  bezel={0.4}
                  saturation={1.65}
                  className="inline-flex rounded-full bg-white/[0.045] border-white/[0.16]"
                >
                  <Link
                    href="/how-to-play"
                    className="glance min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center px-7 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors rounded-full"
                  >
                    ¿Cómo funciona?
                  </Link>
                </LiquidGlass>
              </div>
            </div>
          </motion.div>

          {/* Derecha: Vitrina Orbital 3D a todo color vívido y neón (cero preguntas, puro impacto visual) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            {/* Halo exterior neón súper vívido en modo oscuro y sutil en modo claro (sin blur-3xl GPU) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 rounded-[2.5rem] transition-opacity duration-500"
              style={{
                background: isLight
                  ? `radial-gradient(circle at 42% 42%, ${activePlanet.lightAccent}1C 0%, transparent 68%)`
                  : `radial-gradient(circle at 42% 42%, ${activePlanet.orbitColorA}40 0%, ${activePlanet.orbitColorB}24 42%, transparent 72%)`,
              }}
            />

            <LiquidGlass
              blur={2}
              refraction={22}
              bezel={0.36}
              saturation={1.8}
              className="relative w-full max-w-[515px] rounded-3xl bg-[#050a18]/[0.46] p-5 sm:p-6 transition-all duration-500"
              style={{
                borderColor: isLight ? activePlanet.lightBorder : activePlanet.border,
                boxShadow: isLight ? activePlanet.neonGlowLight : activePlanet.neonGlowDark,
              }}
            >
              {/* Fondo de nebulosa vívida interior que responde al planeta seleccionado */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-500"
                style={{
                  backgroundImage: activePlanet.vividGradient,
                  opacity: isLight ? 0.16 : 0.92,
                }}
              />

              <div className="relative z-10 space-y-4">
                {/* Encabezado neón limpio */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="w-4 h-4 shrink-0"
                      style={{
                        color: activeColor,
                        filter: `drop-shadow(0 0 10px ${activeColor})`,
                      }}
                      aria-hidden="true"
                    >
                      <path
                        d="M10 2.2L12.1 7.4L17.6 9.5L12.1 11.6L10 16.8L7.9 11.6L2.4 9.5L7.9 7.4L10 2.2Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span
                      className="font-mono text-[11px] font-extrabold uppercase tracking-[0.22em] truncate"
                      style={{
                        color: activeColor,
                        textShadow: isLight ? 'none' : `0 0 14px ${activePlanet.accent}`,
                      }}
                    >
                      Aventura espacial
                    </span>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] border"
                    style={{
                      color: activeColor,
                      borderColor: isLight ? activePlanet.lightBorder : `${activePlanet.accent}66`,
                      backgroundColor: isLight
                        ? 'rgba(255, 255, 255, 0.45)'
                        : `${activePlanet.accent}1A`,
                    }}
                  >
                    3 Mundos 3D
                  </span>
                </div>

                {/* Escenario central interactivo: Planeta 3D gigante con anillos neón giratorios */}
                <button
                  type="button"
                  onClick={handleNextPlanet}
                  aria-label={`Cambiar planeta destacado. Actual: ${activePlanet.nombre}`}
                  className="group relative w-full rounded-2xl border p-5 sm:p-6 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all"
                  style={{
                    borderColor: isLight ? activePlanet.lightBorder : `${activePlanet.accent}48`,
                    background: isLight
                      ? 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 100%)'
                      : 'radial-gradient(circle at 50% 45%, rgba(15, 23, 42, 0.35) 0%, rgba(3, 7, 18, 0.72) 100%)',
                  }}
                >
                  {/* Anillo orbital exterior giratorio en neón */}
                  <motion.div
                    aria-hidden="true"
                    animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                    className="pointer-events-none absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-dashed opacity-55"
                    style={{
                      borderColor: activePlanet.orbitColorA,
                      boxShadow: `0 0 24px ${activePlanet.orbitColorA}40`,
                    }}
                  />
                  {/* Segundo anillo inclinado luminoso */}
                  <motion.div
                    aria-hidden="true"
                    animate={prefersReducedMotion ? undefined : { rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="pointer-events-none absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border opacity-60"
                    style={{
                      borderColor: activePlanet.orbitColorB,
                      boxShadow: `0 0 22px ${activePlanet.orbitColorB}50`,
                    }}
                  />

                  {/* Planeta 3D animado */}
                  <div className="relative z-10 h-44 sm:h-48 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activePlanet.nombre}
                        initial={
                          prefersReducedMotion
                            ? false
                            : { opacity: 0, scale: 0.72, rotate: -14 }
                        }
                        animate={{
                          opacity: 1,
                          scale: 1.08,
                          rotate: 0,
                          y: prefersReducedMotion ? 0 : [0, -7, 0],
                        }}
                        exit={
                          prefersReducedMotion
                            ? undefined
                            : { opacity: 0, scale: 0.76, rotate: 14 }
                        }
                        transition={{
                          duration: 0.38,
                          ease: [0.22, 1, 0.36, 1],
                          y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
                        }}
                        className="transition-transform duration-300 group-hover:scale-[1.14]"
                      >
                        <PlanetVisual name={activePlanet.nombre} />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Título vívido del planeta */}
                  <div className="relative z-10 mt-2 text-center space-y-1">
                    <div
                      className="text-2xl sm:text-3xl font-black tracking-tight text-white"
                      style={{
                        textShadow: isLight ? 'none' : `0 0 20px ${activePlanet.accent}95`,
                      }}
                    >
                      {activePlanet.nombre}
                    </div>
                    <div
                      className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: activeColor }}
                    >
                      {activePlanet.materia}
                    </div>
                  </div>
                </button>

                {/* Selector de planetas con brillo vívido */}
                <div
                  role="tablist"
                  aria-label="Cambiar planeta destacado"
                  className="grid grid-cols-3 gap-2"
                >
                  {PLANETAS_MUESTRA.map((p, idx) => {
                    const selected = idx === activeIdx;
                    const pColor = isLight ? p.lightAccent : p.accent;
                    return (
                      <button
                        key={p.nombre}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => handleSelectPlanet(idx)}
                        className="min-h-[42px] rounded-xl px-2.5 py-2 flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer border"
                        style={{
                          borderColor: selected
                            ? pColor
                            : isLight
                              ? 'rgba(15, 23, 42, 0.14)'
                              : 'rgba(255, 255, 255, 0.16)',
                          background: selected
                            ? `linear-gradient(135deg, ${p.orbitColorA}38 0%, ${p.orbitColorB}28 100%)`
                            : isLight
                              ? 'rgba(255, 255, 255, 0.24)'
                              : 'rgba(255, 255, 255, 0.05)',
                          boxShadow: selected
                            ? `0 0 20px ${p.orbitColorA}55, inset 0 0 12px ${p.orbitColorA}22`
                            : 'none',
                          color: selected ? (isLight ? p.lightAccent : '#FFFFFF') : undefined,
                        }}
                      >
                        <PlanetMiniIcon id={p.id} color={pColor} />
                        <span className={selected ? '' : 'text-white/85'}>{p.nombre}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 3 píldoras vibrantes de impacto rápido */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-[#00F5FF]/35 bg-[#041724]/55 px-2.5 py-2.5 text-center">
                    <div className="text-lg sm:text-xl font-black text-[#67E8F9] tabular-nums leading-none">
                      3
                    </div>
                    <div className="text-[11px] font-semibold text-white/85 mt-1">Planetas</div>
                  </div>
                  <div className="rounded-xl border border-[#E879F9]/35 bg-[#160828]/55 px-2.5 py-2.5 text-center">
                    <div className="text-lg sm:text-xl font-black text-[#F0ABFC] tabular-nums leading-none">
                      12+
                    </div>
                    <div className="text-[11px] font-semibold text-white/85 mt-1">Misiones</div>
                  </div>
                  <div className="rounded-xl border border-[#00FF88]/35 bg-[#031B14]/55 px-2.5 py-2.5 text-center">
                    <div className="text-sm sm:text-base font-black text-[#6EE7B7] leading-tight">
                      Con pistas
                    </div>
                    <div className="text-[10px] font-medium text-white/75 mt-0.5">
                      Sin castigos
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ 2. SECCIÓN ELIGE TU AVENTURA (TRES MUNDOS) ════════════════════ */}
      <section
        aria-labelledby="preview-worlds-heading"
        className="mwg-defer-section relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10 pb-16 sm:pb-20 space-y-8"
      >
        <div className="border-t border-white/10 pt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#67E8F9]">
              Tres mundos
            </div>
            <h2
              id="preview-worlds-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Elige tu aventura
            </h2>
            <p className="text-sm text-white/75">
              Cada planeta tiene misiones cortas de primaria. Toca uno para empezar.
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#070b18]/75 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/70 shrink-0">
            <span>Panel estudiante</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANETAS_MUESTRA.map((planeta) => (
            <Link
              key={planeta.nombre}
              href="/dashboard"
              className="block no-underline group rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#67E8F9]"
            >
              <LiquidGlass
                blur={2}
                refraction={22}
                bezel={0.38}
                saturation={1.68}
                className={`mwg-scroll-reveal h-full rounded-3xl ${planeta.bgClass} p-6 sm:p-7 transition-transform duration-300 group-hover:-translate-y-1`}
                style={{
                  borderColor: isLight ? planeta.lightBorder : planeta.border,
                }}
              >
                <article className="flex flex-col items-center text-center gap-4">
                  <span
                    className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: isLight ? planeta.lightAccent : planeta.accent }}
                  >
                    {planeta.materia}
                  </span>

                  <div className="w-40 h-40 flex items-center justify-center">
                    <div className="scale-[0.88] transition-transform duration-300 group-hover:scale-[0.94]">
                      <PlanetVisual name={planeta.nombre} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-white">{planeta.nombre}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">{planeta.frase}</p>
                </article>
              </LiquidGlass>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════ 3. SECCIÓN DE PASOS (PASO 01 - PASO 03) ════════════════════ */}
      <section
        aria-labelledby="steps-heading"
        className="mwg-defer-section relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10 pb-14 space-y-5"
      >
        <h2
          id="steps-heading"
          className="text-xl sm:text-2xl font-bold tracking-tight text-white"
        >
          Empieza en menos de un minuto
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {PASOS_RAPIDOS.map((item) => (
            <LiquidGlass
              key={item.code}
              blur={2}
              refraction={20}
              bezel={0.36}
              saturation={1.62}
              className="mwg-scroll-reveal rounded-2xl bg-[#050a18]/[0.36] border-white/[0.14] p-5 space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-white/14 bg-white/[0.06] flex items-center justify-center shrink-0">
                  <StepBadgeIcon code={item.code} color={isLight ? item.lightAccent : item.accent} />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] tracking-[0.2em] text-white/45">
                    PASO {item.code}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {item.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed">
                {item.description}
              </p>
            </LiquidGlass>
          ))}
        </div>
      </section>

      {/* ════════════════════ 4. PIE DE PÁGINA INSTITUCIONAL ════════════════════ */}
      <footer className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10 pb-12">
        <LiquidGlass
          blur={2}
          refraction={18}
          bezel={0.34}
          saturation={1.6}
          className="rounded-2xl bg-[#050a18]/[0.34] border-white/[0.14] px-6 py-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <span className="text-xs sm:text-sm font-semibold text-white">
              Universo del Conocimiento · Proyecto educativo UPTA · Primaria (10 a 12 años)
            </span>
            <nav aria-label="Enlaces del pie de página" className="flex items-center gap-5 text-xs text-white/75 shrink-0">
              <Link href="/about" className="hover:text-white transition-colors">
                Acerca de
              </Link>
              <Link href="/how-to-play" className="hover:text-white transition-colors">
                Cómo jugar
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Mi espacio
              </Link>
            </nav>
          </div>
        </LiquidGlass>
      </footer>
    </div>
  );
}
