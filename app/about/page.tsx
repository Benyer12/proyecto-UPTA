'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import PlanetVisual from '../components/PlanetVisual';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import { useThemeStore } from '../../lib/theme-store';

const PLANETAS_INFO = [
  {
    id: 1,
    nombre: 'Numérix',
    materia: 'Matemáticas',
    desc: 'Números, operaciones y lógica.',
    accent: '#67E8F9',
    lightAccent: '#0369A1',
    border: 'rgba(103, 232, 249, 0.36)',
    lightBorder: 'rgba(2, 132, 199, 0.38)',
    bgClass: 'bg-[#031524]/[0.34]',
    badge: '6 niveles',
  },
  {
    id: 2,
    nombre: 'Letralia',
    materia: 'Lenguaje',
    desc: 'Lectura, palabras y ortografía.',
    accent: '#D8B4FE',
    lightAccent: '#7E22CE',
    border: 'rgba(216, 180, 254, 0.38)',
    lightBorder: 'rgba(147, 51, 234, 0.36)',
    bgClass: 'bg-[#160726]/[0.36]',
    badge: '3 niveles',
  },
  {
    id: 3,
    nombre: 'Naturae',
    materia: 'Ciencias',
    desc: 'Naturaleza, energía y universo.',
    accent: '#6EE7B7',
    lightAccent: '#047857',
    border: 'rgba(110, 231, 183, 0.36)',
    lightBorder: 'rgba(5, 150, 105, 0.38)',
    bgClass: 'bg-[#031B14]/[0.34]',
    badge: '3 niveles',
  },
];

const DETALLES_PROYECTO = [
  {
    titulo: 'Educación y gamificación',
    texto: 'Combina contenidos de primaria con mecánicas de tablero para aprender jugando.',
  },
  {
    titulo: 'Inclusivo y sin castigos',
    texto: 'Equivocarse entrega pistas y nuevas oportunidades sin borrar el progreso.',
  },
  {
    titulo: 'Sincronización Online y Offline',
    texto: 'Guarda estrellas en el dispositivo y sincroniza el avance en la nube.',
  },
];

function JoyfulUniverseHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <svg
        viewBox="0 0 360 210"
        fill="none"
        className="w-full max-w-[330px] h-auto select-none"
        role="img"
        aria-label="Sistema solar educativo con Numérix, Letralia y Naturae"
      >
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="180" cy="108" rx="146" ry="58" stroke="#67E8F9" strokeOpacity="0.3" strokeWidth="1.3" strokeDasharray="5 6" />
        <ellipse cx="180" cy="108" rx="106" ry="42" stroke="#D8B4FE" strokeOpacity="0.28" strokeWidth="1.2" />

        <circle cx="48" cy="36" r="3" fill="#FDE68A" />
        <circle cx="314" cy="44" r="2.5" fill="#67E8F9" />
        <circle cx="298" cy="178" r="3" fill="#6EE7B7" />
        <circle cx="64" cy="170" r="2.5" fill="#D8B4FE" />

        <circle cx="180" cy="108" r="44" fill="url(#sunGlow)" opacity="0.55" />
        <circle cx="180" cy="108" r="22" fill="#FACC15" stroke="#FEF9C3" strokeWidth="2" />
        <path
          d="M180 96L183 105L192 108L183 111L180 120L177 111L168 108L177 105L180 96Z"
          fill="#FFFFFF"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-6">
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [-5, 5, -5] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="scale-[0.42] origin-center -ml-6"
        >
          <PlanetVisual name="Numérix" />
        </motion.div>

        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [5, -6, 5] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="scale-[0.42] origin-center mt-16"
        >
          <PlanetVisual name="Letralia" />
        </motion.div>

        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [-4, 6, -4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="scale-[0.42] origin-center -mr-6"
        >
          <PlanetVisual name="Naturae" />
        </motion.div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion();
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12 pb-20 space-y-10">
        {/* 1. HERO COMPACTO EN LIQUID GLASS */}
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <LiquidGlass
            blur={2}
            refraction={24}
            bezel={0.36}
            saturation={1.68}
            className="rounded-3xl bg-[#050a18]/[0.36] border-white/[0.16] p-6 sm:p-9 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-16px_30px_-14px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#041724]/80 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">
                  <span className="size-2 rounded-full bg-[#67E8F9]" aria-hidden="true" />
                  <span>Acerca del proyecto</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.06] bg-gradient-to-r from-white via-[#BAE6FD] to-[#D8B4FE] bg-clip-text text-transparent">
                  Universo del Conocimiento
                </h1>

                <p className="text-base sm:text-lg text-white/80 max-w-lg">
                  Refuerzo escolar gamificado para estudiantes de primaria.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-[#6EE7B7]/35 bg-[#041B14]/80 px-3.5 py-1.5 text-xs font-semibold text-[#6EE7B7]">
                    Gratis
                  </span>
                  <span className="rounded-full border border-[#D8B4FE]/35 bg-[#160828]/80 px-3.5 py-1.5 text-xs font-semibold text-[#D8B4FE]">
                    Sin castigos
                  </span>
                  <span className="rounded-full border border-[#FDE68A]/35 bg-[#1C1405]/80 px-3.5 py-1.5 text-xs font-semibold text-[#FDE68A]">
                    10 a 12 años
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <JoyfulUniverseHero />
              </div>
            </div>
          </LiquidGlass>
        </motion.section>

        {/* 2. LOS 3 PLANETAS (VISUAL, CON POCO TEXTO) */}
        <section className="mwg-defer-section space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sistema planetario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANETAS_INFO.map((p) => (
              <LiquidGlass
                key={p.nombre}
                blur={2}
                refraction={24}
                bezel={0.38}
                saturation={1.68}
                className={`mwg-scroll-reveal rounded-3xl ${p.bgClass} p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-12px_rgba(180,220,255,0.18),0_26px_76px_-30px_rgba(0,0,0,0.78)]`}
                style={{
                  borderColor: isLight ? p.lightBorder : p.border,
                  backgroundImage:
                    'radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.22) 100%)',
                }}
              >
                <article className="flex flex-col items-center text-center gap-4">
                  <div className="w-full flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: isLight ? p.lightAccent : p.accent }}
                    >
                      {p.materia}
                    </span>
                    <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-white/80">
                      {p.badge}
                    </span>
                  </div>

                  <div className="w-40 h-40 flex items-center justify-center">
                    <div className="scale-[0.86]">
                      <PlanetVisual name={p.nombre} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight">{p.nombre}</h3>
                  <p className="text-sm text-white/75">{p.desc}</p>
                </article>
              </LiquidGlass>
            ))}
          </div>
        </section>

        {/* 3. DETALLES SECUNDARIOS COLAPSABLES (DIVULGACIÓN PROGRESIVA CON <details>) */}
        <section aria-label="Más detalles del proyecto" className="mwg-defer-section">
          <LiquidGlass
            blur={2}
            refraction={20}
            bezel={0.34}
            saturation={1.62}
            className="rounded-3xl bg-[#050a18]/[0.36] border-white/[0.15] divide-y divide-white/10"
          >
            {DETALLES_PROYECTO.map((item) => (
              <details key={item.titulo} className="mwg-details px-6 py-4">
                <summary className="text-sm sm:text-base font-bold text-white">
                  {item.titulo}
                </summary>
                <p className="pt-2.5 pl-6 text-sm text-white/75">{item.texto}</p>
              </details>
            ))}
          </LiquidGlass>
        </section>

        {/* 4. BOTONES DE SALIDA LIMPIOS */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link
            href="/dashboard"
            className="min-h-[46px] inline-flex items-center justify-center rounded-full bg-white text-black hover:bg-white/90 px-7 text-sm font-bold transition-colors"
          >
            Ir a mi espacio
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
              className="glance min-h-[46px] inline-flex items-center justify-center rounded-full px-6 text-sm font-semibold text-white hover:bg-white/[0.06] transition-colors"
            >
              Cómo jugar
            </Link>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}
