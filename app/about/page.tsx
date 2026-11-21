'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import PlanetVisual from '../components/PlanetVisual';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';

const planetasInfo = [
  {
    id: 1,
    nombre: 'Numérix',
    materia: 'Matemáticas',
    desc: 'Números, operaciones, geometría y razonamiento lógico transformados en misiones espaciales paso a paso.',
    accent: '#67E8F9',
    border: 'rgba(0, 245, 255, 0.34)',
    bgClass: 'bg-[#041724]/[0.82]',
    badge: '6 niveles · 2 cursos',
  },
  {
    id: 2,
    nombre: 'Letralia',
    materia: 'Lenguas',
    desc: 'Gramática, vocabulario, ortografía y comprensión lectora con acertijos y aventuras llenas de imaginación.',
    accent: '#D8B4FE',
    border: 'rgba(191, 64, 255, 0.36)',
    bgClass: 'bg-[#160828]/[0.82]',
    badge: '3 niveles · 1 curso',
  },
  {
    id: 3,
    nombre: 'Naturae',
    materia: 'Ciencias',
    desc: 'Seres vivos, ecosistemas, energía y secretos del universo en recorridos llenos de descubrimientos.',
    accent: '#6EE7B7',
    border: 'rgba(0, 255, 136, 0.34)',
    bgClass: 'bg-[#041C14]/[0.82]',
    badge: '3 niveles · 1 curso',
  },
];

const PILARES = [
  {
    id: 'sync',
    label: 'Modo Offline y Online',
    desc: 'Guarda tus estrellas en el dispositivo y sincronízalas en la nube para no perder nunca tu aventura.',
    accent: '#67E8F9',
    cardBg: 'bg-[#041724]/[0.78]',
    border: 'rgba(103, 232, 249, 0.3)',
  },
  {
    id: 'safe',
    label: 'Aprendizaje sin castigos',
    desc: 'Equivocarse te da pistas útiles y una nueva oportunidad. ¡Aquí cada intento cuenta para aprender!',
    accent: '#6EE7B7',
    cardBg: 'bg-[#041B14]/[0.78]',
    border: 'rgba(110, 231, 183, 0.3)',
  },
  {
    id: 'age',
    label: 'Primaria de 10 a 12 años',
    desc: 'Retos coloridos, lecturas claras y mecánicas de juego pensadas especialmente para estudiantes de primaria.',
    accent: '#FDE68A',
    cardBg: 'bg-[#1C1405]/[0.78]',
    border: 'rgba(253, 230, 138, 0.3)',
  },
] as const;

function PillarIcon({ id, color }: { id: 'sync' | 'safe' | 'age'; color: string }) {
  if (id === 'sync') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 11A8 8 0 0 0 6.3 5.3L4 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4V7.5H7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 13A8 8 0 0 0 17.7 18.7L20 16.5" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 20V16.5H16.5" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === 'safe') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3L5 6V11.5C5 16 8 19.8 12 21C16 19.8 19 16 19 11.5V6L12 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 12L11 14L15.2 9.8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3L14.8 8.7L21 9.6L16.5 14L17.6 20.2L12 17.2L6.4 20.2L7.5 14L3 9.6L9.2 8.7L12 3Z"
        fill="#FDE68A"
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JoyfulPlanetsStage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="relative rounded-2xl border border-white/12 p-5 sm:p-6 overflow-hidden min-h-[250px] flex flex-col items-center justify-center"
      style={{
        background:
          'radial-gradient(circle at 22% 24%, rgba(0, 245, 255, 0.22) 0%, transparent 48%), radial-gradient(circle at 78% 28%, rgba(191, 64, 255, 0.24) 0%, transparent 50%), radial-gradient(circle at 52% 85%, rgba(0, 255, 136, 0.20) 0%, transparent 50%), rgba(6, 10, 24, 0.72)',
      }}
    >
      {/* Órbita decorativa luminosa */}
      <svg
        viewBox="0 0 360 220"
        fill="none"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-70"
        aria-hidden="true"
      >
        <ellipse cx="180" cy="112" rx="146" ry="62" stroke="#67E8F9" strokeOpacity="0.3" strokeWidth="1.3" strokeDasharray="5 6" />
        <ellipse cx="180" cy="112" rx="108" ry="44" stroke="#D8B4FE" strokeOpacity="0.28" strokeWidth="1.2" />
        <circle cx="48" cy="40" r="3" fill="#FDE68A" />
        <circle cx="314" cy="48" r="2.5" fill="#67E8F9" />
        <circle cx="298" cy="184" r="3" fill="#6EE7B7" />
        <circle cx="64" cy="176" r="2.5" fill="#D8B4FE" />
      </svg>

      {/* Trío alegre de planetas 3D */}
      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4">
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
        >
          <div className="scale-[0.54] sm:scale-[0.62]">
            <PlanetVisual name="Numérix" />
          </div>
        </motion.div>

        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center -mt-4"
        >
          <div className="scale-[0.64] sm:scale-[0.74]">
            <PlanetVisual name="Letralia" />
          </div>
        </motion.div>

        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
        >
          <div className="scale-[0.54] sm:scale-[0.62]">
            <PlanetVisual name="Naturae" />
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#070c1e]/85 px-4 py-1.5 text-xs font-semibold text-[#FDE68A]">
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
          <path
            d="M10 2.4L12.35 7.16L17.6 7.92L13.8 11.62L14.7 16.85L10 14.38L5.3 16.85L6.2 11.62L2.4 7.92L7.65 7.16L10 2.4Z"
            fill="#FACC15"
            stroke="#F59E0B"
            strokeWidth="1.2"
          />
        </svg>
        <span>3 mundos llenos de retos y estrellas</span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12 pb-24 space-y-10 sm:space-y-12">
        {/* 1. ENCABEZADO ALEGRE Y LUMINOSO EN LIQUID GLASS */}
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <LiquidGlass
            blur={8}
            refraction={14}
            bezel={0.24}
            saturation={1.5}
            className="rounded-3xl bg-[#070d1f]/[0.82] border-white/[0.14] p-6 sm:p-9"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#041724]/80 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">
                  <span className="size-2 rounded-full bg-[#67E8F9]" aria-hidden="true" />
                  <span>Nuestra misión educativa</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.06] bg-gradient-to-r from-white via-[#BAE6FD] to-[#D8B4FE] bg-clip-text text-transparent">
                  Universo del Conocimiento
                </h1>

                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  Una plataforma educativa alegre y gamificada que convierte el repaso escolar en
                  una <strong className="text-white">gran aventura espacial</strong> para niños y
                  niñas de 10 a 12 años.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-[#6EE7B7]/35 bg-[#041B14]/80 px-3.5 py-1.5 text-xs font-semibold text-[#6EE7B7]">
                    100% Gratuito
                  </span>
                  <span className="rounded-full border border-[#D8B4FE]/35 bg-[#160828]/80 px-3.5 py-1.5 text-xs font-semibold text-[#D8B4FE]">
                    Sin castigos
                  </span>
                  <span className="rounded-full border border-[#FDE68A]/35 bg-[#1C1405]/80 px-3.5 py-1.5 text-xs font-semibold text-[#FDE68A]">
                    Gana estrellas
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <JoyfulPlanetsStage />
              </div>
            </div>
          </LiquidGlass>
        </motion.section>

        {/* 2. HISTORIA Y PILARES CON COLOR Y ENERGÍA */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#67E8F9] block">
                Origen y propósito
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ¿Cómo nació esta aventura?
              </h2>
            </div>
            <span className="rounded-full border border-[#6EE7B7]/40 bg-[#041B14]/80 px-4 py-1.5 text-xs font-bold text-[#6EE7B7]">
              Acceso gratuito para primaria
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <LiquidGlass
              blur={8}
              refraction={12}
              bezel={0.24}
              className="rounded-3xl bg-[#041724]/[0.80] p-6 sm:p-7 space-y-3"
              style={{ borderColor: 'rgba(103, 232, 249, 0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl border border-[#67E8F9]/40 bg-[#00F5FF]/12 flex items-center justify-center text-[#67E8F9] shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                    <path
                      d="M12 3.5C15.5 5.5 17.5 9.2 17.5 13.5L20 16L18.2 17.8L15.4 16.6H8.6L5.8 17.8L4 16L6.5 13.5C6.5 9.2 8.5 5.5 12 3.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10.8" r="1.7" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-[#67E8F9]">
                  Educación y gamificación
                </h3>
              </div>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Este proyecto nació para motivar a los estudiantes mediante retos dinámicos,
                combinando contenidos escolares con tableros coloridos para que aprender se sienta
                como explorar el espacio.
              </p>
            </LiquidGlass>

            <LiquidGlass
              blur={8}
              refraction={12}
              bezel={0.24}
              className="rounded-3xl bg-[#160828]/[0.80] p-6 sm:p-7 space-y-3"
              style={{ borderColor: 'rgba(216, 180, 254, 0.32)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl border border-[#D8B4FE]/40 bg-[#BF40FF]/15 flex items-center justify-center text-[#D8B4FE] shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                    <path
                      d="M12 20.2C12 20.2 4.5 15.6 4.5 9.6C4.5 6.8 6.6 4.8 9.1 4.8C10.7 4.8 11.6 5.6 12 6.5C12.4 5.6 13.3 4.8 14.9 4.8C17.4 4.8 19.5 6.8 19.5 9.6C19.5 15.6 12 20.2 12 20.2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-[#D8B4FE]">
                  Inclusivo y sin frustración
                </h3>
              </div>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Nuestra meta es ofrecer una herramienta{' '}
                <strong className="text-white">gratuita, amigable y sin castigos</strong> que ayude
                a fortalecer Matemática, Lenguaje y Ciencias Naturales a su propio ritmo.
              </p>
            </LiquidGlass>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {PILARES.map((pilar) => (
              <div
                key={pilar.label}
                className={`rounded-2xl border ${pilar.cardBg} backdrop-blur-md p-5 flex items-start gap-3.5`}
                style={{ borderColor: pilar.border }}
              >
                <div
                  className="w-11 h-11 rounded-xl border bg-white/[0.05] flex items-center justify-center shrink-0"
                  style={{ borderColor: pilar.border }}
                >
                  <PillarIcon id={pilar.id} color={pilar.accent} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{pilar.label}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{pilar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. LOS PLANETAS DEL CONOCIMIENTO CON SUS FIGURAS 3D */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D8B4FE] block">
              Sistema planetario
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Los planetas del conocimiento
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planetasInfo.map((p) => (
              <LiquidGlass
                key={p.nombre}
                blur={8}
                refraction={14}
                bezel={0.24}
                className={`rounded-3xl ${p.bgClass} p-6 flex flex-col items-center text-center justify-between gap-5`}
                style={{ borderColor: p.border }}
              >
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: p.accent }}
                    >
                      {p.materia}
                    </span>
                    <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-white/80">
                      {p.badge}
                    </span>
                  </div>

                  <div className="w-36 h-36 flex items-center justify-center mx-auto">
                    <div className="scale-[0.80]">
                      <PlanetVisual name={p.nombre} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-white">{p.nombre}</h3>
                    <p className="text-sm text-white/75 leading-relaxed">{p.desc}</p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="glance min-h-[44px] w-full inline-flex items-center justify-center rounded-full border text-xs font-bold uppercase tracking-[0.14em] text-white transition-all hover:brightness-115"
                  style={{
                    borderColor: p.border,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  Ir al panel para jugar
                </Link>
              </LiquidGlass>
            ))}
          </div>
        </section>

        {/* Botones finales */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="min-h-[46px] inline-flex items-center justify-center rounded-full bg-white hover:bg-white/90 text-black text-sm font-semibold px-7 transition-colors"
          >
            Entrar a mi espacio
          </Link>
          <Link
            href="/"
            className="glance min-h-[46px] inline-flex items-center justify-center rounded-full border border-white/15 bg-[#070c1b]/80 hover:bg-white/[0.12] text-xs font-bold uppercase tracking-widest text-white px-6 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
