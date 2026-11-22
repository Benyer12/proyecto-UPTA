'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import PlanetVisual from './components/PlanetVisual';
import { LiquidGlass } from '../components/ui/glasscn/liquid-glass';
import { useThemeStore } from '../lib/theme-store';
import { playCorrect, playIncorrect, playStep } from '../lib/sound-engine';

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
  bgClass: string;
  reto: {
    pregunta: string;
    opciones: [string, string, string];
    correcta: string;
    pista: string;
  };
}

const PLANETAS_MUESTRA: PlanetShowcase[] = [
  {
    id: 1,
    nombre: 'Numérix',
    materia: 'Matemáticas · 6 niveles',
    frase: 'Calcula, resuelve acertijos numéricos y domina las operaciones.',
    accent: '#67E8F9',
    lightAccent: '#0284C7',
    border: 'rgba(103, 232, 249, 0.42)',
    lightBorder: 'rgba(2, 132, 199, 0.45)',
    neonGlowDark:
      '0 0 28px rgba(56, 189, 248, 0.34), 0 0 64px rgba(14, 165, 233, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.38)',
    neonGlowLight:
      '0 0 26px rgba(14, 165, 233, 0.24), 0 14px 40px -16px rgba(2, 132, 199, 0.28), inset 0 1px 0 0 rgba(255,255,255,0.92)',
    bgClass: 'bg-[#031524]/[0.34]',
    reto: {
      pregunta: '¿Cuánto es 7 × 8?',
      opciones: ['54', '56', '64'],
      correcta: '56',
      pista: '7 × 7 = 49; súmale 7 más para llegar al resultado.',
    },
  },
  {
    id: 2,
    nombre: 'Letralia',
    materia: 'Lenguaje · 3 niveles',
    frase: 'Practica lectura, ortografía y redacción con misiones rápidas.',
    accent: '#D8B4FE',
    lightAccent: '#7E22CE',
    border: 'rgba(216, 180, 254, 0.44)',
    lightBorder: 'rgba(147, 51, 234, 0.44)',
    neonGlowDark:
      '0 0 28px rgba(192, 132, 252, 0.36), 0 0 64px rgba(168, 85, 247, 0.22), inset 0 1px 0 0 rgba(255,255,255,0.38)',
    neonGlowLight:
      '0 0 26px rgba(147, 51, 234, 0.24), 0 14px 40px -16px rgba(126, 34, 206, 0.26), inset 0 1px 0 0 rgba(255,255,255,0.92)',
    bgClass: 'bg-[#160726]/[0.36]',
    reto: {
      pregunta: '¿Cuál palabra lleva tilde?',
      opciones: ['árbol', 'sol', 'pared'],
      correcta: 'árbol',
      pista: 'Es una palabra grave terminada en L, por eso lleva tilde.',
    },
  },
  {
    id: 3,
    nombre: 'Naturae',
    materia: 'Ciencias · 3 niveles',
    frase: 'Descubre el cuerpo humano, los ecosistemas y la ciencia diaria.',
    accent: '#6EE7B7',
    lightAccent: '#047857',
    border: 'rgba(110, 231, 183, 0.42)',
    lightBorder: 'rgba(5, 150, 105, 0.44)',
    neonGlowDark:
      '0 0 28px rgba(52, 211, 153, 0.34), 0 0 64px rgba(16, 185, 129, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.38)',
    neonGlowLight:
      '0 0 26px rgba(16, 185, 129, 0.24), 0 14px 40px -16px rgba(4, 120, 87, 0.26), inset 0 1px 0 0 rgba(255,255,255,0.92)',
    bgClass: 'bg-[#031B14]/[0.34]',
    reto: {
      pregunta: '¿Qué órgano bombea la sangre?',
      opciones: ['Pulmón', 'Corazón', 'Hígado'],
      correcta: 'Corazón',
      pista: 'Late todo el día en tu pecho para llevar oxígeno al cuerpo.',
    },
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
  const prefersReducedMotion = useReducedMotion();
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const activePlanet = PLANETAS_MUESTRA[activeIdx];
  const activeColor = isLight ? activePlanet.lightAccent : activePlanet.accent;
  const currentChoice = selectedAnswers[activePlanet.id] ?? null;
  const isChoiceCorrect = currentChoice === activePlanet.reto.correcta;

  const handleSelectPlanet = (idx: number) => {
    setActiveIdx(idx);
    playStep();
  };

  const handleAnswerDemo = (option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [activePlanet.id]: option }));
    if (option === activePlanet.reto.correcta) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white selection:bg-white/25">
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

          {/* Derecha: Tarjeta interactiva AVENTURA ESPACIAL con brillo neón sincronizado y cero puntos de colores */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            {/* Halo ambiental neón que cambia suavemente según el planeta activo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-[2rem] blur-2xl transition-all duration-500"
              style={{
                background: isLight
                  ? `radial-gradient(circle at 50% 45%, ${activePlanet.lightAccent}26 0%, transparent 72%)`
                  : `radial-gradient(circle at 50% 45%, ${activePlanet.accent}36 0%, rgba(168, 85, 247, 0.14) 55%, transparent 78%)`,
              }}
            />

            <LiquidGlass
              blur={2}
              refraction={22}
              bezel={0.36}
              saturation={1.68}
              className="relative w-full max-w-[515px] rounded-3xl bg-[#050a18]/[0.42] p-5 sm:p-6 transition-all duration-500"
              style={{
                borderColor: isLight ? activePlanet.lightBorder : activePlanet.border,
                boxShadow: isLight ? activePlanet.neonGlowLight : activePlanet.neonGlowDark,
              }}
            >
              {/* Encabezado limpio sin puntos macOS */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="w-4 h-4 shrink-0"
                    style={{
                      color: activeColor,
                      filter: `drop-shadow(0 0 8px ${activeColor})`,
                    }}
                    aria-hidden="true"
                  >
                    <path
                      d="M10 2.2L12.1 7.4L17.6 9.5L12.1 11.6L10 16.8L7.9 11.6L2.4 9.5L7.9 7.4L10 2.2Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span
                    className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] truncate"
                    style={{
                      color: activeColor,
                      textShadow: isLight ? 'none' : `0 0 12px ${activePlanet.accent}90`,
                    }}
                  >
                    Aventura espacial
                  </span>
                </div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 shrink-0">
                  Prueba interactiva
                </span>
              </div>

              <div className="space-y-4">
                {/* Selector interactivo de planetas (sin puntos de colores) */}
                <div
                  role="tablist"
                  aria-label="Explorar planetas de muestra"
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
                        className="relative min-h-[42px] rounded-xl px-2.5 py-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border"
                        style={{
                          borderColor: selected
                            ? pColor
                            : isLight
                              ? 'rgba(15, 23, 42, 0.14)'
                              : 'rgba(255, 255, 255, 0.14)',
                          backgroundColor: selected
                            ? isLight
                              ? `${pColor}1A`
                              : `${p.accent}1C`
                            : isLight
                              ? 'rgba(255, 255, 255, 0.24)'
                              : 'rgba(255, 255, 255, 0.04)',
                          boxShadow: selected
                            ? isLight
                              ? `0 0 14px ${pColor}30`
                              : `0 0 18px ${p.accent}42, inset 0 0 10px ${p.accent}18`
                            : 'none',
                          color: selected ? pColor : undefined,
                        }}
                      >
                        <PlanetMiniIcon id={p.id} color={pColor} />
                        <span className={selected ? '' : 'text-white/85'}>{p.nombre}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mini reto interactivo en vivo del planeta seleccionado */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePlanet.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl border p-4 space-y-3"
                    style={{
                      borderColor: isLight ? activePlanet.lightBorder : `${activePlanet.accent}38`,
                      backgroundColor: isLight
                        ? 'rgba(255, 255, 255, 0.26)'
                        : 'rgba(6, 12, 28, 0.54)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: activeColor }}
                      >
                        {activePlanet.materia}
                      </span>
                      <span className="font-mono text-[10px] text-white/60">Toca tu respuesta</span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-white leading-snug">
                      {activePlanet.reto.pregunta}
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {activePlanet.reto.opciones.map((opt) => {
                        const isPicked = currentChoice === opt;
                        const isRightOpt = opt === activePlanet.reto.correcta;

                        let borderCol = isLight
                          ? 'rgba(15, 23, 42, 0.16)'
                          : 'rgba(255, 255, 255, 0.16)';
                        let bgCol = isLight
                          ? 'rgba(255, 255, 255, 0.32)'
                          : 'rgba(255, 255, 255, 0.05)';
                        let glow = 'none';

                        if (isPicked && isRightOpt) {
                          borderCol = '#10B981';
                          bgCol = isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.24)';
                          glow = '0 0 16px rgba(16, 185, 129, 0.45)';
                        } else if (isPicked && !isRightOpt) {
                          borderCol = '#F59E0B';
                          bgCol = isLight ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.2)';
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswerDemo(opt)}
                            className="min-h-[40px] rounded-xl px-2.5 py-2 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer border hover:brightness-110"
                            style={{
                              borderColor: borderCol,
                              backgroundColor: bgCol,
                              boxShadow: glow,
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {currentChoice && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl px-3 py-2 text-xs font-medium leading-snug border"
                        style={
                          isChoiceCorrect
                            ? {
                                borderColor: 'rgba(16, 185, 129, 0.45)',
                                backgroundColor: isLight
                                  ? 'rgba(16, 185, 129, 0.14)'
                                  : 'rgba(16, 185, 129, 0.16)',
                                color: isLight ? '#047857' : '#A7F3D0',
                              }
                            : {
                                borderColor: 'rgba(245, 158, 11, 0.45)',
                                backgroundColor: isLight
                                  ? 'rgba(245, 158, 11, 0.14)'
                                  : 'rgba(245, 158, 11, 0.14)',
                                color: isLight ? '#92400E' : '#FDE68A',
                              }
                        }
                      >
                        {isChoiceCorrect
                          ? '¡Correcto! Sumaste +1 ★ de prueba. Elige otro planeta o entra a jugar.'
                          : `Pista: ${activePlanet.reto.pista}`}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* 3 métricas equilibradas y alineadas */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/14 bg-white/[0.04] px-2.5 py-2.5 text-center">
                    <div className="text-lg sm:text-xl font-black text-[#67E8F9] tabular-nums leading-none">
                      3
                    </div>
                    <div className="text-[11px] font-semibold text-white/80 mt-1">Planetas</div>
                  </div>
                  <div className="rounded-xl border border-white/14 bg-white/[0.04] px-2.5 py-2.5 text-center">
                    <div className="text-lg sm:text-xl font-black text-[#D8B4FE] tabular-nums leading-none">
                      12+
                    </div>
                    <div className="text-[11px] font-semibold text-white/80 mt-1">Misiones</div>
                  </div>
                  <div className="rounded-xl border border-white/14 bg-white/[0.04] px-2.5 py-2.5 text-center">
                    <div className="text-sm sm:text-base font-black text-[#FDE68A] leading-tight">
                      Con pistas
                    </div>
                    <div className="text-[10px] font-medium text-white/70 mt-0.5">
                      Sin castigos
                    </div>
                  </div>
                </div>

                {/* Pie interactivo de la tarjeta */}
                <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 flex items-center justify-between gap-2.5">
                  <span className="text-xs font-medium text-white/80 truncate">
                    Inicia sesión arriba para guardar estrellas
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/about"
                      className="min-h-[34px] inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black px-3 text-xs font-semibold text-white transition-colors"
                    >
                      Acerca de
                    </Link>
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
                className={`mwg-scroll-reveal h-full rounded-3xl ${planeta.bgClass} p-6 sm:p-7 transition-transform duration-300 group-hover:-translate-y-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-12px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]`}
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
              className="mwg-scroll-reveal rounded-2xl bg-[#050a18]/[0.36] border-white/[0.14] p-5 space-y-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),inset_0_-12px_22px_-12px_rgba(180,220,255,0.14)]"
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
