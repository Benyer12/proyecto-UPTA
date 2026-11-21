'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import Planeta from './components/Planeta';

const PLANETAS_PREVIEW = [
  {
    id: 1,
    nombre: 'Numérix',
    materia: 'Matemáticas',
    descripcion: 'Domina números y operaciones en un mundo de asteroides y cometas.',
    gradient: 'radial-gradient(circle at 35% 30%, #00f5ff 0%, #0080ff 40%, #0030b0 65%, #000d40 100%)',
    glow: '#00f5ff',
    glowColor: '#00e4ff',
    textAccent: '#67E8F9',
    cursos: [
      {
        name: 'Cinturón de Asteroides',
        description: 'Sumas y restas básicas',
        levels: [
          { id: 1, name: 'Sumas básicas', description: '' },
          { id: 2, name: 'Restas básicas', description: '' },
          { id: 3, name: 'Reto del Cinturón', description: '' },
        ],
      },
      {
        name: 'Campo de Cometas',
        description: 'Multiplicación y división',
        levels: [
          { id: 4, name: 'Tablas de multiplicar', description: '' },
          { id: 5, name: 'Multiplicación', description: '' },
          { id: 6, name: 'Reto del Cometa', description: '' },
        ],
      },
    ],
  },
  {
    id: 2,
    nombre: 'Letralia',
    materia: 'Lenguas',
    descripcion: 'Conquista las palabras, la gramática y la lectura en una galaxia literaria.',
    gradient: 'radial-gradient(circle at 35% 30%, #df80ff 0%, #9b30ff 35%, #5a00b0 65%, #1a0040 100%)',
    glow: '#bf40ff',
    glowColor: '#c840ff',
    textAccent: '#D8B4FE',
    cursos: [
      {
        name: 'Tormenta de Sílabas',
        description: 'Separación silábica y acentuación',
        levels: [
          { id: 1, name: 'Separación silábica', description: '' },
          { id: 2, name: 'Acentuación', description: '' },
          { id: 3, name: 'Reto de la Tormenta', description: '' },
        ],
      },
    ],
  },
  {
    id: 3,
    nombre: 'Naturae',
    materia: 'Ciencias',
    descripcion: 'Descubre los secretos de la naturaleza, los ecosistemas y el universo.',
    gradient: 'radial-gradient(circle at 35% 30%, #80ffb4 0%, #00e070 35%, #008040 65%, #001a14 100%)',
    glow: '#00ff88',
    glowColor: '#00f080',
    textAccent: '#6EE7B7',
    cursos: [
      {
        name: 'Bosque Cósmico',
        description: 'Seres vivos y reinos de la naturaleza',
        levels: [
          { id: 1, name: 'Seres vivos', description: '' },
          { id: 2, name: 'Reinos naturales', description: '' },
          { id: 3, name: 'Reto del Bosque', description: '' },
        ],
      },
    ],
  },
];

/** Ilustración vectorial propia del sistema planetario de 3 mundos */
function PlanetaryOrreryIllustration() {
  return (
    <svg
      viewBox="0 0 380 320"
      fill="none"
      className="w-full h-auto max-w-[380px] mx-auto select-none"
      role="img"
      aria-label="Diagrama orbital de los tres mundos educativos: Numérix, Letralia y Naturae"
    >
      <defs>
        <radialGradient id="orrerySun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#BAE6FD" />
          <stop offset="70%" stopColor="#6366F1" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nodeNumerix" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="45%" stopColor="#00F5FF" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
        <radialGradient id="nodeLetralia" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FAF5FF" />
          <stop offset="45%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6B21A8" />
        </radialGradient>
        <radialGradient id="nodeNaturae" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="45%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>

      {/* Órbitas concéntricas calibradas */}
      <ellipse
        cx="190"
        cy="160"
        rx="156"
        ry="74"
        transform="rotate(-14 190 160)"
        stroke="#94A3B8"
        strokeOpacity="0.32"
        strokeWidth="1.25"
        strokeDasharray="4 6"
      />
      <ellipse
        cx="190"
        cy="160"
        rx="116"
        ry="56"
        transform="rotate(12 190 160)"
        stroke="#C4B5FD"
        strokeOpacity="0.42"
        strokeWidth="1.25"
      />
      <ellipse
        cx="190"
        cy="160"
        rx="74"
        ry="36"
        transform="rotate(-8 190 160)"
        stroke="#67E8F9"
        strokeOpacity="0.5"
        strokeWidth="1.25"
      />

      {/* Estrella central del conocimiento */}
      <circle cx="190" cy="160" r="46" fill="url(#orrerySun)" />
      <circle cx="190" cy="160" r="14" fill="#F8FAFC" stroke="#67E8F9" strokeWidth="2" />
      <circle cx="190" cy="160" r="6" fill="#38BDF8" />

      {/* Planeta 1: Numérix */}
      <g transform="translate(88 102)">
        <circle r="24" fill="url(#nodeNumerix)" stroke="#BAE6FD" strokeWidth="1.5" />
        <ellipse
          rx="34"
          ry="9"
          transform="rotate(-18)"
          stroke="#67E8F9"
          strokeOpacity="0.7"
          strokeWidth="1.4"
        />
        <text
          x="0"
          y="-34"
          textAnchor="middle"
          fill="#E0F2FE"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          NUMÉRIX
        </text>
      </g>

      {/* Planeta 2: Letralia */}
      <g transform="translate(292 114)">
        <circle r="21" fill="url(#nodeLetralia)" stroke="#E9D5FF" strokeWidth="1.5" />
        <ellipse
          rx="31"
          ry="8"
          transform="rotate(20)"
          stroke="#D8B4FE"
          strokeOpacity="0.75"
          strokeWidth="1.3"
        />
        <text
          x="0"
          y="-31"
          textAnchor="middle"
          fill="#F3E8FF"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          LETRALIA
        </text>
      </g>

      {/* Planeta 3: Naturae */}
      <g transform="translate(198 236)">
        <circle r="20" fill="url(#nodeNaturae)" stroke="#A7F3D0" strokeWidth="1.5" />
        <circle r="28" stroke="#6EE7B7" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="3 4" />
        <text
          x="0"
          y="40"
          textAnchor="middle"
          fill="#D1FAE5"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          NATURAE
        </text>
      </g>

      {/* Puntos estelares de referencia */}
      <circle cx="52" cy="212" r="2" fill="#E2E8F0" opacity="0.8" />
      <circle cx="330" cy="214" r="2.2" fill="#67E8F9" opacity="0.85" />
      <circle cx="242" cy="48" r="1.8" fill="#D8B4FE" opacity="0.85" />
      <circle cx="136" cy="268" r="1.6" fill="#6EE7B7" opacity="0.8" />
    </svg>
  );
}

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [featuredPlanet, ...otherPlanets] = PLANETAS_PREVIEW;

  return (
    <div className="relative min-h-screen">
      {/* ── HERO ASIMÉTRICO EN LIQUID GLASS ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 sm:pb-20">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="rounded-2xl liquid-glass liquid-glass-panel p-6 sm:p-10 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[#67E8F9]">
                Educación primaria de 10 a 12 años
              </p>

              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.06] cosmic-title">
                Universo del Conocimiento
              </h1>

              <p className="text-base sm:text-lg text-[#CBD5E1] max-w-xl leading-relaxed">
                Refuerza matemáticas, lenguaje y ciencias naturales recorriendo tableros
                interactivos por planeta, ganando estrellas y avanzando sin castigos por equivocarte.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                <Link
                  href="/dashboard"
                  className="min-h-[48px] inline-flex items-center justify-center liquid-glass-btn text-white font-bold px-7 py-3 rounded-xl text-sm tracking-wide"
                >
                  Ir al centro de misiones
                </Link>
                <Link
                  href="/how-to-play"
                  className="min-h-[48px] inline-flex items-center justify-center liquid-glass-pill hover:bg-white/14 text-[#F8FAFC] font-semibold px-7 py-3 rounded-xl transition-colors text-sm tracking-wide"
                >
                  Ver cómo se juega
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl liquid-glass-inset p-4 sm:p-5">
                <PlanetaryOrreryIllustration />
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                  <div>
                    <div className="text-xs font-extrabold text-[#67E8F9]">Numérix</div>
                    <div className="text-[11px] text-[#94A3B8]">6 niveles</div>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#D8B4FE]">Letralia</div>
                    <div className="text-[11px] text-[#94A3B8]">3 niveles</div>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#6EE7B7]">Naturae</div>
                    <div className="text-[11px] text-[#94A3B8]">3 niveles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MUNDOS DEL CONOCIMIENTO (COMPOSICIÓN VARIADA EN 2 NIVELES) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
              Tres planetas, tres materias principales
            </h2>
            <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl leading-relaxed">
              Cada mundo organiza sus cursos en tableros temáticos con retos progresivos y un
              desafío final.
            </p>
          </div>
          <Link
            href="/about"
            className="min-h-[44px] inline-flex items-center text-sm font-bold text-[#67E8F9] hover:text-white transition-colors shrink-0"
          >
            Leer sobre el proyecto
          </Link>
        </div>

        {/* Mundo destacado en formato horizontal */}
        <motion.article
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl liquid-glass p-5 sm:p-7"
          style={{ borderColor: `${featuredPlanet.glow}40` }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <Planeta
                planetId={featuredPlanet.id}
                nombre={featuredPlanet.nombre}
                materia={featuredPlanet.materia}
                gradient={featuredPlanet.gradient}
                glow={featuredPlanet.glow}
                glowColor={featuredPlanet.glowColor}
                delay={0}
                cursos={featuredPlanet.cursos}
              />
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-1.5">
                <span
                  className="text-xs font-bold uppercase tracking-[0.16em]"
                  style={{ color: featuredPlanet.textAccent }}
                >
                  {featuredPlanet.materia} · 2 cursos activos
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
                  {featuredPlanet.nombre}
                </h3>
                <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                  {featuredPlanet.descripcion}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {featuredPlanet.cursos.map((curso) => (
                  <div key={curso.name} className="rounded-xl liquid-glass-inset p-4 space-y-1">
                    <div className="text-sm font-bold text-[#F8FAFC]">{curso.name}</div>
                    <p className="text-xs text-[#94A3B8]">{curso.description}</p>
                    <p className="text-[11px] font-semibold text-[#67E8F9] pt-1">
                      {curso.levels.length} niveles progresivos
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <Link
                  href={`/planeta/${featuredPlanet.id}`}
                  className="min-h-[44px] inline-flex items-center justify-center liquid-glass-btn text-white text-xs sm:text-sm font-bold tracking-wide px-6 py-2.5 rounded-xl"
                >
                  Abrir mapa de {featuredPlanet.nombre}
                </Link>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Mundos secundarios en rejilla de 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherPlanets.map((p, i) => (
            <motion.article
              key={p.nombre}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="rounded-2xl liquid-glass liquid-glass-interactive p-5 sm:p-6 flex flex-col justify-between gap-5"
              style={{ borderColor: `${p.glow}38` }}
            >
              <div className="rounded-xl liquid-glass-inset p-5 flex flex-col items-center text-center">
                <Planeta
                  planetId={p.id}
                  nombre={p.nombre}
                  materia={p.materia}
                  gradient={p.gradient}
                  glow={p.glow}
                  glowColor={p.glowColor}
                  delay={(i + 1) * 0.4}
                  cursos={p.cursos}
                />
                <p className="text-sm text-[#CBD5E1] leading-relaxed mt-3 max-w-md">
                  {p.descripcion}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: p.textAccent }}>
                    {p.cursos[0]?.name}
                  </div>
                  <div className="text-xs text-[#94A3B8]">{p.cursos[0]?.description}</div>
                </div>
                <Link
                  href={`/planeta/${p.id}`}
                  className="min-h-[44px] inline-flex items-center justify-center liquid-glass-pill hover:bg-white/14 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  Ver niveles
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
