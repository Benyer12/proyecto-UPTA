'use client';

import Link from 'next/link';
import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import PlanetVisual from './components/PlanetVisual';
import { LiquidGlass } from '../components/ui/glasscn/liquid-glass';
import { useThemeStore } from '../lib/theme-store';

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function DraggableCrystalLens() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const pointerOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const [position, setPosition] = useState<Point | null>(null);

  const resetPosition = useCallback(() => {
    const container = containerRef.current;
    const glass = glassRef.current;
    if (!container || !glass) return;
    const containerRect = container.getBoundingClientRect();
    const glassRect = glass.getBoundingClientRect();
    setPosition({
      x: Math.max(0, containerRect.width - glassRect.width - 12),
      y: 8,
    });
  }, []);

  useEffect(() => {
    resetPosition();
    window.addEventListener('resize', resetPosition);
    return () => window.removeEventListener('resize', resetPosition);
  }, [resetPosition]);

  const placeLens = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const glass = glassRef.current;
    if (!container || !glass) return;
    const containerRect = container.getBoundingClientRect();
    const glassRect = glass.getBoundingClientRect();
    const maxX = Math.max(0, containerRect.width - glassRect.width);
    const maxY = Math.max(0, containerRect.height - glassRect.height);
    setPosition({
      x: clamp(clientX - containerRect.left - pointerOffsetRef.current.x, 0, maxX),
      y: clamp(clientY - containerRect.top - pointerOffsetRef.current.y, 0, maxY),
    });
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const glass = glassRef.current;
    if (!glass) return;
    const rect = glass.getBoundingClientRect();
    draggingRef.current = true;
    pointerOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    glass.setPointerCapture(e.pointerId);
    placeLens(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    placeLens(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const glass = glassRef.current;
    draggingRef.current = false;
    if (glass?.hasPointerCapture(e.pointerId)) {
      glass.releasePointerCapture(e.pointerId);
    }
  };

  if (prefersReducedMotion) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 hidden sm:block overflow-hidden">
      <LiquidGlass
        ref={glassRef}
        blur={1.5}
        refraction={18}
        bezel={0.42}
        saturation={1.45}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Lente cristalina interactiva arrastrable"
        className={`pointer-events-auto absolute z-20 size-24 rounded-full bg-white/[0.04] cursor-grab active:cursor-grabbing touch-none transition-opacity duration-300 ${
          position === null ? 'opacity-0' : 'opacity-100'
        }`}
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      />
    </div>
  );
}

const PLANETAS_MUESTRA = [
  {
    nombre: 'Numérix',
    materia: 'Matemáticas',
    frase: 'Supera retos de sumas, restas, multiplicaciones y divisiones entre asteroides.',
    detalle: 'Tablero espacial de 20 casillas y misiones cuánticas',
    accent: '#67E8F9',
    lightAccent: '#0369A1',
    border: 'rgba(103, 232, 249, 0.36)',
    lightBorder: 'rgba(2, 132, 199, 0.38)',
    bgClass: 'bg-[#031524]/[0.34]',
  },
  {
    nombre: 'Letralia',
    materia: 'Lenguaje',
    frase: 'Descifra palabras, lectura comprensiva y acertijos en una galaxia llena de historias.',
    detalle: 'Mapa astral con altares de decodificación',
    accent: '#D8B4FE',
    lightAccent: '#7E22CE',
    border: 'rgba(216, 180, 254, 0.38)',
    lightBorder: 'rgba(147, 51, 234, 0.36)',
    bgClass: 'bg-[#160726]/[0.36]',
  },
  {
    nombre: 'Naturae',
    materia: 'Ciencias',
    frase: 'Descubre cómo funciona la naturaleza, los ecosistemas y los misterios del universo.',
    detalle: 'Exploración científica guiada paso a paso',
    accent: '#6EE7B7',
    lightAccent: '#047857',
    border: 'rgba(110, 231, 183, 0.36)',
    lightBorder: 'rgba(5, 150, 105, 0.38)',
    bgClass: 'bg-[#031B14]/[0.34]',
  },
];

const PASOS_DIDACTICOS = [
  {
    code: '01',
    title: 'Inicia sesión con tu cuenta',
    description:
      'Entra con tu usuario de estudiante para abrir tu panel personal con los mapas estelares listos para jugar.',
    accent: '#67E8F9',
    lightAccent: '#0369A1',
  },
  {
    code: '02',
    title: 'Elige un planeta y lanza el dado',
    description:
      'Avanza por tableros coloridos respondiendo retos cortos y divertidos de matemáticas, lenguaje y ciencias.',
    accent: '#D8B4FE',
    lightAccent: '#7E22CE',
  },
  {
    code: '03',
    title: 'Gana estrellas sin miedo a fallar',
    description:
      'Si te equivocas puedes volver a intentarlo. Cada misión completada suma estrellas a tu progreso en la nube.',
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
    <div className="relative min-h-screen text-white selection:bg-white/25">
      {/* ════════════════════ HERO EDITORIAL + PANEL DIDÁCTICO LIQUID GLASS ════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-10 sm:pt-16 pb-14 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-12 xl:gap-16 items-center">
          {/* Columna izquierda: Tipografía abierta + lente cristalina arrastrable */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative space-y-6"
          >
            <DraggableCrystalLens />

            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[#070b18]/75 backdrop-blur-md px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#67E8F9]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#67E8F9]" aria-hidden="true" />
                <span>Aventura educativa · 10 a 12 años</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-[66px] font-black tracking-[-0.03em] leading-[0.98] text-white">
                UNIVERSO DEL
                <span className="block bg-gradient-to-r from-white via-[#BAE6FD] to-[#67E8F9] bg-clip-text text-transparent">
                  CONOCIMIENTO
                </span>
              </h1>

              <p className="max-w-lg text-base sm:text-lg leading-relaxed text-white/75">
                Aprende matemáticas, lenguaje y ciencias jugando en tableros espaciales. Gana
                estrellas, supera retos y explora cada mundo a tu propio ritmo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link
                  href="/dashboard"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                >
                  <span>Entrar a mi espacio</span>
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
                    className="glance min-h-[48px] inline-flex items-center justify-center px-7 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors rounded-full"
                  >
                    Cómo jugar
                  </Link>
                </LiquidGlass>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha: Tarjeta didáctica en Liquid Glass con buena opacidad y lectura limpia */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            <LiquidGlass
              blur={2}
              refraction={24}
              bezel={0.38}
              saturation={1.68}
              className="w-full max-w-[530px] rounded-3xl bg-[#050a18]/[0.36] border-white/[0.16] p-6 sm:p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-12px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]"
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
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Aprender nunca fue tan divertido
                  </h2>
                  <p className="text-sm leading-relaxed text-white/65 mt-1">
                    Inicia sesión como estudiante para desbloquear tu nave, recorrer los planetas y
                    coleccionar estrellas en cada materia.
                  </p>
                </div>

                {/* Mini resumen visual didáctico */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="rounded-2xl border border-[#67E8F9]/25 bg-[#041724]/70 p-3.5 text-center">
                    <div className="text-xl font-black text-[#67E8F9] tabular-nums">3</div>
                    <div className="text-[11px] font-medium text-white/80 mt-0.5">Planetas</div>
                  </div>
                  <div className="rounded-2xl border border-[#D8B4FE]/25 bg-[#160828]/70 p-3.5 text-center">
                    <div className="text-xl font-black text-[#D8B4FE] tabular-nums">12+</div>
                    <div className="text-[11px] font-medium text-white/80 mt-0.5">Misiones</div>
                  </div>
                  <div className="rounded-2xl border border-[#FDE68A]/25 bg-[#1B1506]/70 p-3.5 text-center">
                    <div className="text-xl font-black text-[#FDE68A] tabular-nums">100%</div>
                    <div className="text-[11px] font-medium text-white/80 mt-0.5">Sin castigos</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">
                      Listo para despegar
                    </div>
                    <p className="text-xs text-white/55">
                      Usa <strong className="text-white">Iniciar sesión</strong> arriba para entrar
                      a tus planetas.
                    </p>
                  </div>
                  <Link
                    href="/about"
                    className="shrink-0 min-h-[38px] inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black px-3.5 text-xs font-semibold text-white transition-colors"
                  >
                    Saber más
                  </Link>
                </div>
              </div>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ PLANETAS DE MUESTRA (VISUAL DIDÁCTICO PARA NIÑOS) ════════════════════ */}
      <section
        aria-labelledby="preview-worlds-heading"
        className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pb-16 sm:pb-20 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-t border-white/10 pt-12">
          <div className="space-y-2 max-w-xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#67E8F9]">
              Vista previa del universo
            </div>
            <h2
              id="preview-worlds-heading"
              className="text-2xl sm:text-4xl font-bold tracking-tight text-white"
            >
              Conoce los mundos que te esperan
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Cada planeta es una aventura diferente. Inicia sesión con tu cuenta de estudiante
              para explorarlos y jugar sus niveles.
            </p>
          </div>

          <span className="self-start md:self-auto inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#070b18]/75 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white/70">
            <span className="size-2 rounded-full bg-[#6EE7B7]" aria-hidden="true" />
            <span>Jugables en tu panel de estudiante</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANETAS_MUESTRA.map((planeta, i) => (
            <motion.div
              key={planeta.nombre}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.42, delay: i * 0.08 }}
            >
              <LiquidGlass
                blur={2}
                refraction={24}
                bezel={0.38}
                saturation={1.68}
                className={`h-full rounded-3xl ${planeta.bgClass} p-6 flex flex-col items-center text-center justify-between gap-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-12px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]`}
                style={{
                  borderColor: isLight ? planeta.lightBorder : planeta.border,
                  backgroundImage:
                    'radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.22) 100%)',
                }}
              >
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                      style={{ color: isLight ? planeta.lightAccent : planeta.accent }}
                    >
                      {planeta.materia}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                      Muestra
                    </span>
                  </div>

                  {/* Figura 3D del planeta */}
                  <div className="flex items-center justify-center py-1">
                    <div className="w-40 h-40 flex items-center justify-center">
                      <div className="scale-[0.86]">
                        <PlanetVisual name={planeta.nombre} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black tracking-tight text-white">
                      {planeta.nombre}
                    </h3>
                    <p className="text-sm text-white/75 leading-relaxed">{planeta.frase}</p>
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-white/10">
                  <div
                    className="rounded-full border px-3.5 py-2 text-xs font-medium"
                    style={{
                      borderColor: isLight ? planeta.lightBorder : planeta.border,
                      color: isLight ? planeta.lightAccent : planeta.accent,
                      backgroundColor: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    {planeta.detalle}
                  </div>
                </div>
              </LiquidGlass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════ 3 PASOS DIDÁCTICOS ════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pb-16 space-y-7">
        <div className="max-w-xl space-y-1.5">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
            Así de fácil empiezas
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Tu recorrido en 3 pasos
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PASOS_DIDACTICOS.map((item) => (
            <LiquidGlass
              key={item.code}
              blur={2}
              refraction={20}
              bezel={0.36}
              saturation={1.62}
              className="rounded-2xl bg-[#050a18]/[0.36] border-white/[0.14] p-6 space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),inset_0_-12px_22px_-12px_rgba(180,220,255,0.14)]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl border border-white/14 bg-white/[0.06] flex items-center justify-center">
                  <StepBadgeIcon code={item.code} color={isLight ? item.lightAccent : item.accent} />
                </div>
                <span className="font-mono text-xs tracking-[0.2em] text-white/45">
                  {item.code}
                </span>
              </div>
              <h3 className="text-base font-bold tracking-tight text-white">{item.title}</h3>
              <p className="text-xs sm:text-[13px] leading-relaxed text-white/70">
                {item.description}
              </p>
            </LiquidGlass>
          ))}
        </div>
      </section>

      {/* ════════════════════ PIE DE PÁGINA ════════════════════ */}
      <footer className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pb-12">
        <LiquidGlass
          blur={2}
          refraction={18}
          bezel={0.34}
          saturation={1.6}
          className="rounded-2xl bg-[#050a18]/[0.34] border-white/[0.14] px-6 py-5"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-white">Universo del Conocimiento</div>
              <p className="text-xs text-white/55">
                Plataforma educativa gamificada de primaria · Matemáticas, Lenguaje y Ciencias
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-xs text-white/75">
              <Link href="/about" className="hover:text-white transition-colors">
                Acerca de
              </Link>
              <Link href="/how-to-play" className="hover:text-white transition-colors">
                Cómo jugar
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Mi espacio
              </Link>
            </div>
          </div>
        </LiquidGlass>
      </footer>
    </div>
  );
}
