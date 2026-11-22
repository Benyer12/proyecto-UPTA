'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import PlanetVisual from './components/PlanetVisual';
import { LiquidGlass } from '../components/ui/glasscn/liquid-glass';
import { useThemeStore } from '../lib/theme-store';

const PLANETAS_MUESTRA = [
  {
    id: 1,
    nombre: 'Numérix',
    materia: 'Matemáticas · 6 niveles',
    frase: 'Calcula, resuelve acertijos numéricos y domina las operaciones.',
    accent: '#67E8F9',
    lightAccent: '#0369A1',
    border: 'rgba(103, 232, 249, 0.36)',
    lightBorder: 'rgba(2, 132, 199, 0.38)',
    bgClass: 'bg-[#031524]/[0.34]',
  },
  {
    id: 2,
    nombre: 'Letralia',
    materia: 'Lenguaje · 3 niveles',
    frase: 'Practica lectura, ortografía y redacción con misiones rápidas.',
    accent: '#D8B4FE',
    lightAccent: '#7E22CE',
    border: 'rgba(216, 180, 254, 0.38)',
    lightBorder: 'rgba(147, 51, 234, 0.36)',
    bgClass: 'bg-[#160726]/[0.36]',
  },
  {
    id: 3,
    nombre: 'Naturae',
    materia: 'Ciencias · 3 niveles',
    frase: 'Descubre el cuerpo humano, los ecosistemas y la ciencia diaria.',
    accent: '#6EE7B7',
    lightAccent: '#047857',
    border: 'rgba(110, 231, 183, 0.36)',
    lightBorder: 'rgba(5, 150, 105, 0.38)',
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

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white selection:bg-white/25">
      {/* ════════════════════ 1. HERO VISUAL Y TARJETA AVENTURA ESPACIAL ════════════════════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-10 pt-10 sm:pt-16 pb-14 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.97fr] lg:gap-12 items-center">
          {/* Izquierda: Titular despejado (sin círculo decorativo encima), subtítulo y botones claros */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative space-y-6"
          >
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[#070b18]/75 backdrop-blur-md px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#67E8F9]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#67E8F9]" aria-hidden="true" />
                <span>Primaria · 10 a 12 años</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-[64px] font-black tracking-[-0.03em] leading-[0.98] text-white">
                UNIVERSO DEL
                <span className="block bg-gradient-to-r from-white via-[#BAE6FD] to-[#67E8F9] bg-clip-text text-transparent">
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
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-white/90"
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

          {/* Derecha: Tarjeta AVENTURA ESPACIAL optimizada también para pantallas de 375px */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            <LiquidGlass
              blur={2}
              refraction={24}
              bezel={0.38}
              saturation={1.68}
              className="w-full max-w-[500px] rounded-3xl bg-[#050a18]/[0.36] border-white/[0.16] p-5 sm:p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-12px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]"
              style={{
                backgroundImage:
                  'radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.22) 100%)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="size-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                  Aventura espacial
                </span>
              </div>

              <div className="space-y-4">
                {/* 3 métricas: 2 columnas arriba + 1 abajo en 375px, 3 columnas en >=480px (sm) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-2xl border border-[#67E8F9]/25 bg-[#041724]/70 p-3.5 sm:p-4 text-center flex flex-col justify-center">
                    <div className="text-2xl font-black text-[#67E8F9] tabular-nums">3</div>
                    <div className="text-xs font-semibold text-white/85 mt-0.5">Planetas</div>
                  </div>
                  <div className="rounded-2xl border border-[#D8B4FE]/25 bg-[#160828]/70 p-3.5 sm:p-4 text-center flex flex-col justify-center">
                    <div className="text-2xl font-black text-[#D8B4FE] tabular-nums">12+</div>
                    <div className="text-xs font-semibold text-white/85 mt-0.5">Misiones</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#FDE68A]/25 bg-[#1B1506]/70 p-3.5 sm:p-4 text-center flex flex-col justify-center">
                    <div className="text-sm sm:text-base font-black text-[#FDE68A] leading-tight">
                      Con pistas
                    </div>
                    <div className="text-[11px] font-medium text-white/80 mt-1 leading-snug">
                      Si fallas, recibes ayuda sin perder tu progreso.
                    </div>
                  </div>
                </div>

                {/* Píldoras de planetas con flex-wrap para no cortarse en 375px */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {PLANETAS_MUESTRA.map((p) => (
                    <div
                      key={p.nombre}
                      className="flex-1 min-w-[96px] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 flex items-center justify-center gap-2"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: isLight ? p.lightAccent : p.accent }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold text-white whitespace-nowrap">
                        {p.nombre}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-white/75">
                    Inicia sesión arriba para jugar
                  </span>
                  <Link
                    href="/about"
                    className="shrink-0 min-h-[38px] inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black px-3.5 text-xs font-semibold text-white transition-colors"
                  >
                    Acerca de
                  </Link>
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
            <span className="size-2 rounded-full bg-[#6EE7B7]" aria-hidden="true" />
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
                refraction={24}
                bezel={0.38}
                saturation={1.68}
                className={`mwg-scroll-reveal h-full rounded-3xl ${planeta.bgClass} p-6 sm:p-7 transition-transform duration-300 group-hover:-translate-y-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-12px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]`}
                style={{
                  borderColor: isLight ? planeta.lightBorder : planeta.border,
                  backgroundImage:
                    'radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.22) 100%)',
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
