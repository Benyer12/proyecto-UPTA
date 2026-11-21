'use client';

import Link from 'next/link';
import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LiquidGlass } from '../components/ui/glasscn/liquid-glass';

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

const PLATFORM_PILLARS = [
  {
    code: '01',
    title: 'Inicia sesión para entrar a tus mundos',
    description:
      'Los planetas interactivos y misiones se desbloquean exclusivamente en el panel personal de cada estudiante al iniciar sesión.',
  },
  {
    code: '02',
    title: 'Aprende mediante tableros sin castigos',
    description:
      'Cada desafío combina matemáticas, lenguaje y ciencias con retroalimentación inmediata para aprender a tu propio ritmo.',
  },
  {
    code: '03',
    title: 'Acompañamiento docente en tiempo real',
    description:
      'Las estrellas, niveles completados y sesiones se sincronizan automáticamente para que los tutores puedan guiar el avance.',
  },
];

const AREAS = ['Matemáticas', 'Lenguaje', 'Ciencias', 'Estudiantes', 'Tutores'];

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen text-white selection:bg-white/25">
      {/* ════════════════════ HERO EDITORIAL TRANSPARENTE ESTILO GLASSCN ════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-12 xl:gap-16 items-center">
          {/* Columna izquierda: Tipografía abierta sobre las partículas + lente arrastrable */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative space-y-6"
          >
            <DraggableCrystalLens />

            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                <span className="h-1.5 w-1.5 rounded-full bg-[#67E8F9]" aria-hidden="true" />
                <span>Plataforma educativa · Primaria 10 a 12 años</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-[68px] font-black tracking-[-0.03em] leading-[0.98] text-white">
                UNIVERSO DEL
                <span className="block text-white/85">CONOCIMIENTO</span>
              </h1>

              <p className="max-w-lg text-[15px] sm:text-base leading-relaxed text-white/65">
                Aprende matemáticas, lenguaje y ciencias naturales en un entorno interactivo
                diseñado para despertar la curiosidad y mantener el progreso sincronizado.
              </p>

              <p className="max-w-md text-[13px] leading-relaxed text-white/45">
                Inicia sesión con tu cuenta de estudiante para abrir tu panel personal con todos
                los mundos, cursos y niveles habilitados.
              </p>
            </div>
          </motion.div>

          {/* Columna derecha: Ventana cristalina ultra-transparente estilo macOS / glasscn */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            <LiquidGlass
              blur={2.5}
              refraction={16}
              bezel={0.28}
              saturation={1.36}
              className="w-full max-w-[540px] rounded-2xl bg-white/[0.035] border-white/[0.11] p-6 sm:p-8"
            >
              {/* Indicadores de ventana minimalistas */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="size-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                  Resumen del sistema
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                    Tu centro de aprendizaje espacial
                  </h2>
                  <p className="text-sm leading-relaxed text-white/55 mt-1.5">
                    Acceso organizado por rol con tableros interactivos, metas claras y seguimiento
                    de estrellas en tiempo real.
                  </p>
                </div>

                {/* Campos informativos en cristal ultra-transparente */}
                <div className="space-y-3.5">
                  <div>
                    <div className="text-xs font-medium text-white/75 mb-1.5">Plataforma</div>
                    <div className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 flex items-center justify-between text-sm text-white">
                      <span>Universo del Conocimiento</span>
                      <span className="font-mono text-[11px] text-[#67E8F9]">v2.0</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-white/75 mb-1.5">Acceso a mundos</div>
                    <Link
                      href="/dashboard"
                      className="glance group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="size-8 rounded-lg border border-white/12 bg-white/[0.06] flex items-center justify-center text-[#67E8F9] shrink-0">
                          <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                            <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                            <ellipse
                              cx="10"
                              cy="10"
                              rx="9"
                              ry="3.2"
                              transform="rotate(-20 10 10)"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            Panel exclusivo de estudiantes
                          </div>
                          <div className="text-xs text-white/50 truncate">
                            Inicia sesión para explorar los planetas y guardar estrellas.
                          </div>
                        </div>
                      </div>
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="size-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 8H12.5M8.5 4L12.5 8L8.5 12"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <div className="text-xs font-medium text-white/75 mb-1.5">Edades</div>
                      <div className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 flex items-center text-sm text-white">
                        10 a 12 años
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white/75 mb-1.5">Modalidad</div>
                      <div className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 flex items-center text-sm text-white">
                        Sin penalización
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-white/75 mb-2">Áreas y perfiles</div>
                    <div className="flex flex-wrap gap-1.5">
                      {AREAS.map((area) => (
                        <span
                          key={area}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/80"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-white/45 mt-2">
                      Cada estudiante avanza en sus propios tableros con seguimiento de tutores.
                    </p>
                  </div>
                </div>
              </div>
            </LiquidGlass>
          </motion.div>
        </div>

        {/* Franja inferior de acciones principales separada por hairline */}
        <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12 xl:gap-16 items-center">
          <div className="flex flex-col sm:flex-row gap-3.5">
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
              blur={2.5}
              refraction={12}
              className="inline-flex rounded-full bg-white/[0.045] border-white/[0.14]"
            >
              <Link
                href="/how-to-play"
                className="glance min-h-[48px] inline-flex items-center justify-center px-7 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors rounded-full"
              >
                Cómo funciona el juego
              </Link>
            </LiquidGlass>
          </div>

          <LiquidGlass
            blur={2.5}
            refraction={12}
            className="w-full max-w-[540px] lg:mx-auto rounded-2xl bg-white/[0.03] border-white/[0.10] p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                  Acceso guiado
                </div>
                <p className="text-xs sm:text-sm text-white/75 mt-1">
                  Usa el botón <strong className="text-white">Iniciar sesión</strong> en la barra
                  superior para ingresar o crear tu cuenta.
                </p>
              </div>
              <Link
                href="/about"
                className="shrink-0 min-h-[40px] inline-flex items-center rounded-xl border border-white/12 bg-white/[0.05] hover:bg-white/[0.11] px-3.5 text-xs font-medium text-white transition-colors"
              >
                Conocer más
              </Link>
            </div>
          </LiquidGlass>
        </div>
      </section>

      {/* ════════════════════ CÓMO FUNCIONA (3 PASOS ARQUITECTÓNICOS SIN PLANETAS) ════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pb-20 space-y-8">
        <div className="max-w-xl space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">
            Experiencia de aprendizaje
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Un sistema pensado para avanzar con claridad
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PLATFORM_PILLARS.map((item) => (
            <div
              key={item.code}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-[4px] p-6 space-y-3 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]"
            >
              <div className="font-mono text-[11px] tracking-[0.22em] text-white/45">
                {item.code}
              </div>
              <h3 className="text-base font-semibold tracking-tight text-white">{item.title}</h3>
              <p className="text-[13px] leading-relaxed text-white/55">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ PIE DE PÁGINA MINIMALISTA EN CRISTAL ════════════════════ */}
      <footer className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pb-12">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-[3px] px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">Universo del Conocimiento</div>
            <p className="text-xs text-white/45">
              Plataforma educativa gamificada de primaria · Matemáticas, Lenguaje y Ciencias
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-white/65">
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
      </footer>
    </div>
  );
}
