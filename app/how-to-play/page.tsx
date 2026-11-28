import Link from 'next/link';
import { LiquidGlass } from '@/components/ui/glasscn/liquid-glass';
import { KEYBOARD_SHORTCUTS_GUIDE } from '@/lib/config/navigation-config';

const STEPS = [
  {
    n: '01',
    title: 'Elige tu planeta',
    desc: 'Escoge entre Numérix (Matemáticas), Letralia (Lenguaje) o Naturae (Ciencias).',
    color: '#67E8F9',
    bg: 'rgba(103, 232, 249, 0.12)',
    border: 'rgba(103, 232, 249, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="14" fill="url(#step1Grad)" />
        <ellipse
          cx="24"
          cy="24"
          rx="21"
          ry="7"
          transform="rotate(-18 24 24)"
          stroke="#A5F3FC"
          strokeWidth="2.4"
        />
        <defs>
          <linearGradient id="step1Grad" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Lanza el dado 3D',
    desc: 'Presiona el dado para avanzar casillas por el tablero espacial hasta la meta.',
    color: '#D8B4FE',
    bg: 'rgba(216, 180, 254, 0.12)',
    border: 'rgba(216, 180, 254, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="32" height="32" rx="8" fill="#1E1035" stroke="#D8B4FE" strokeWidth="2.5" />
        <circle cx="17" cy="17" r="2.8" fill="#FDE68A" />
        <circle cx="31" cy="17" r="2.8" fill="#FDE68A" />
        <circle cx="24" cy="24" r="2.8" fill="#E9D5FF" />
        <circle cx="17" cy="31" r="2.8" fill="#FDE68A" />
        <circle cx="31" cy="31" r="2.8" fill="#FDE68A" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Resuelve con pistas',
    desc: 'Contesta preguntas divertidas. Si te equivocas, recibes una pista para lograrlo.',
    color: '#FDE68A',
    bg: 'rgba(253, 230, 138, 0.12)',
    border: 'rgba(253, 230, 138, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none" aria-hidden="true">
        <path
          d="M24 8C16.8 8 11 13.8 11 21c0 4.6 2.4 8.7 6 11v4a3 3 0 003 3h8a3 3 0 003-3v-4c3.6-2.3 6-6.4 6-11 0-7.2-5.8-13-13-13z"
          fill="#2A1D06"
          stroke="#FDE68A"
          strokeWidth="2.4"
        />
        <path d="M19 42h10" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 16v8M20 20h8" stroke="#FDE68A" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: '04',
    title: 'Gana estrellas',
    desc: 'Derrota al Guardián Final del nivel y desbloquea hasta 3 estrellas en cada mundo.',
    color: '#6EE7B7',
    bg: 'rgba(110, 231, 183, 0.12)',
    border: 'rgba(110, 231, 183, 0.35)',
    icon: (
      <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none" aria-hidden="true">
        <path
          d="M24 6l5.4 11 12.1 1.7-8.7 8.5 2 12-10.8-5.7-10.8 5.7 2-12-8.7-8.5 12.1-1.7L24 6z"
          fill="#06281E"
          stroke="#6EE7B7"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M24 13l3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.8 6.9-1L24 13z"
          fill="#6EE7B7"
          fillOpacity="0.35"
        />
      </svg>
    ),
  },
];

const PLANETS_GUIDE = [
  {
    name: 'Numérix',
    area: 'Matemáticas · 6 Niveles',
    color: '#67E8F9',
    bg: 'rgba(103, 232, 249, 0.10)',
    border: 'rgba(103, 232, 249, 0.30)',
    desc: 'Sumas, restas, multiplicaciones, fracciones, decimales y problemas diarios.',
    examples: ['Cálculo mental', 'Fracciones', 'Geometría'],
    svg: (
      <svg viewBox="0 0 64 64" className="w-14 h-14 shrink-0" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="24" fill="url(#numGrad)" />
        <ellipse cx="32" cy="32" rx="30" ry="10" transform="rotate(-16 32 32)" stroke="#A5F3FC" strokeWidth="2.5" />
        <text x="32" y="38" textAnchor="middle" fill="#041923" fontSize="18" fontWeight="900">
          123
        </text>
        <defs>
          <linearGradient id="numGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'Letralia',
    area: 'Lenguaje · 3 Niveles',
    color: '#D8B4FE',
    bg: 'rgba(216, 180, 254, 0.10)',
    border: 'rgba(216, 180, 254, 0.30)',
    desc: 'Lectura, ortografía, acentuación, sinónimos, antónimos y gramática.',
    examples: ['Ortografía', 'Comprensión', 'Vocabulario'],
    svg: (
      <svg viewBox="0 0 64 64" className="w-14 h-14 shrink-0" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="24" fill="url(#letGrad)" />
        <path
          d="M21 40c6-12 16-18 24-19-2 10-9 19-21 21l-3-2z"
          fill="#FAF5FF"
          fillOpacity="0.9"
        />
        <text x="27" y="38" textAnchor="middle" fill="#2E1065" fontSize="18" fontWeight="900">
          Aa
        </text>
        <defs>
          <linearGradient id="letGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E9D5FF" />
            <stop offset="1" stopColor="#9333EA" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'Naturae',
    area: 'Ciencias · 3 Niveles',
    color: '#6EE7B7',
    bg: 'rgba(110, 231, 183, 0.10)',
    border: 'rgba(110, 231, 183, 0.30)',
    desc: 'Cuerpo humano, ecosistemas, animales, energía, agua y sistema solar.',
    examples: ['Ecosistemas', 'Cuerpo humano', 'Espacio'],
    svg: (
      <svg viewBox="0 0 64 64" className="w-14 h-14 shrink-0" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="24" fill="url(#natGrad)" />
        <path
          d="M22 40c0-11 9-19 20-19-1 11-8 19-20 19z"
          fill="#064E3B"
          fillOpacity="0.85"
        />
        <path d="M22 40c4-5 10-10 16-14" stroke="#A7F3D0" strokeWidth="2.4" strokeLinecap="round" />
        <defs>
          <linearGradient id="natGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6EE7B7" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

const TILE_TYPES = [
  {
    label: 'Casilla Normal',
    badge: 'RETO',
    color: '#67E8F9',
    bg: 'rgba(103, 232, 249, 0.12)',
    border: 'rgba(103, 232, 249, 0.35)',
    desc: 'Resuelve una pregunta del planeta para asegurar tu posición y sumar puntos.',
    symbol: '?',
  },
  {
    label: 'Casilla de Energía',
    badge: 'BONUS',
    color: '#FDE68A',
    bg: 'rgba(253, 230, 138, 0.12)',
    border: 'rgba(253, 230, 138, 0.35)',
    desc: '¡Impulso espacial! Recibe energía extra o avanza más rápido en el tablero.',
    symbol: '⚡',
  },
  {
    label: 'Casilla de Evento',
    badge: 'SORPRESA',
    color: '#D8B4FE',
    bg: 'rgba(216, 180, 254, 0.12)',
    border: 'rgba(216, 180, 254, 0.35)',
    desc: 'Activa un minireto especial o un giro divertido en tu recorrido.',
    symbol: '✦',
  },
  {
    label: 'Guardián Final',
    badge: 'META',
    color: '#6EE7B7',
    bg: 'rgba(110, 231, 183, 0.12)',
    border: 'rgba(110, 231, 183, 0.40)',
    desc: 'Supera el desafío final del nivel para ganar tus estrellas y abrir el siguiente.',
    symbol: '★',
  },
];

const RULES = [
  {
    title: 'Con Pistas',
    badge: 'Sin miedo a fallar',
    color: '#FDE68A',
    desc: 'Si te equivocas, nunca pierdes tu progreso: recibes pistas claras y vuelves a intentarlo.',
  },
  {
    title: '3 Estrellas por Nivel',
    badge: 'Supera tu récord',
    color: '#6EE7B7',
    desc: 'Mientras mejor respondas, más estrellas consigues al vencer al Guardián Final.',
  },
  {
    title: 'Guardado Automático',
    badge: 'Con y sin internet',
    color: '#67E8F9',
    desc: 'Tu avance se guarda en tu dispositivo y se sincroniza en la nube cuando vuelves a conectarte.',
  },
];

const ROLES = [
  {
    role: 'Estudiante',
    badge: 'Explorador espacial',
    color: '#6EE7B7',
    bg: 'rgba(110, 231, 183, 0.10)',
    border: 'rgba(110, 231, 183, 0.30)',
    desc: 'Juega en los 3 mundos, lanza el dado, usa pistas cuando las necesites y colecciona estrellas.',
  },
  {
    role: 'Tutor / Docente',
    badge: 'Puente de Mando',
    color: '#67E8F9',
    bg: 'rgba(103, 232, 249, 0.10)',
    border: 'rgba(103, 232, 249, 0.30)',
    desc: 'Supervisa en tiempo real las estrellas, niveles completados y progreso de cada estudiante.',
  },
];

function BoardFlowDiagram() {
  const nodes = [
    { x: 52, label: 'Salida', fill: '#FFFFFF', text: '#0B1221', badge: 'INICIO' },
    { x: 184, label: 'Normal', fill: '#67E8F9', text: '#041923', badge: 'RETO' },
    { x: 316, label: 'Energía', fill: '#FDE68A', text: '#261A03', badge: 'BONUS' },
    { x: 448, label: 'Evento', fill: '#D8B4FE', text: '#1F0B36', badge: 'SORPRESA' },
    { x: 580, label: 'Guardián', fill: '#6EE7B7', text: '#042419', badge: 'META ★' },
  ];

  return (
    <svg
      viewBox="0 0 640 138"
      className="w-full h-auto"
      role="img"
      aria-label="Recorrido visual del tablero desde la Salida hasta el Guardián Final"
    >
      <defs>
        <linearGradient id="boardPath" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="30%" stopColor="#67E8F9" stopOpacity="0.65" />
          <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.65" />
          <stop offset="80%" stopColor="#D8B4FE" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <path
        d="M52 54 C118 28, 120 80, 184 54 C248 28, 252 80, 316 54 C380 28, 384 80, 448 54 C512 28, 518 80, 580 54"
        fill="none"
        stroke="url(#boardPath)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="10 8"
      />

      {nodes.map((node, i) => (
        <g key={node.label}>
          <circle cx={node.x} cy={54} r="28" fill={node.fill} fillOpacity="0.16" />
          <circle cx={node.x} cy={54} r="21" fill={node.fill} />
          <text
            x={node.x}
            y={59}
            textAnchor="middle"
            fontSize="14"
            fontWeight="800"
            fill={node.text}
          >
            {i + 1}
          </text>
          <text
            x={node.x}
            y={101}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#FFFFFF"
          >
            {node.label}
          </text>
          <text
            x={node.x}
            y={119}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={node.fill}
          >
            {node.badge}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Cabecera visual */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#67E8F9]/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#67E8F9] shadow-[0_0_20px_-6px_rgba(103,232,249,0.4)]">
              <span className="h-2 w-2 rounded-full bg-[#67E8F9]" aria-hidden="true" />
              Guía interactiva · Aprende jugando
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              ¿Cómo se juega?
            </h1>
            <p className="text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed">
              Explora tres mundos educativos, lanza el dado en tableros espaciales, usa pistas cuando
              las necesites y conquista estrellas en cada nivel.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 py-3 text-sm font-bold hover:bg-white/90 transition-colors shrink-0 self-start md:self-auto"
          >
            Ir a jugar ahora →
          </Link>
        </section>

        {/* 1. 4 Pasos gráficos */}
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Tu aventura en 4 pasos
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/55">
              Fácil de empezar
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step) => (
              <LiquidGlass
                key={step.n}
                blur={7}
                refraction={10}
                bezel={0.22}
                className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="rounded-2xl p-2 border"
                    style={{ backgroundColor: step.bg, borderColor: step.border }}
                  >
                    {step.icon}
                  </div>
                  <span
                    className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{
                      color: step.color,
                      backgroundColor: step.bg,
                      borderColor: step.border,
                    }}
                  >
                    Paso {step.n}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">{step.desc}</p>
                </div>
              </LiquidGlass>
            ))}
          </div>
        </section>

        {/* 2. Mapa del tablero y tipos de casilla */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              ¿Qué encontrarás en el tablero?
            </h2>
            <p className="text-sm text-white/65 mt-1">
              Cada casilla tiene un color y una misión distinta hasta llegar al Guardián Final.
            </p>
          </div>

          <LiquidGlass
            blur={8}
            refraction={10}
            bezel={0.22}
            className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-8 space-y-6"
          >
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
              <BoardFlowDiagram />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {TILE_TYPES.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-2xl border p-4 space-y-2.5"
                  style={{ backgroundColor: tile.bg, borderColor: tile.border }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-black"
                      style={{ backgroundColor: tile.color }}
                      aria-hidden="true"
                    >
                      {tile.symbol}
                    </span>
                    <span
                      className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                      style={{ color: tile.color, borderColor: tile.border }}
                    >
                      {tile.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{tile.label}</h3>
                  <p className="text-xs text-white/75 leading-relaxed">{tile.desc}</p>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </section>

        {/* 3. Los 3 Mundos */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Los 3 mundos de aprendizaje
            </h2>
            <p className="text-sm text-white/65 mt-1">
              Cada planeta entrena un área escolar distinta con retos adaptados a tu ritmo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANETS_GUIDE.map((planet) => (
              <LiquidGlass
                key={planet.name}
                blur={7}
                refraction={10}
                bezel={0.22}
                className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 space-y-4"
              >
                <div className="flex items-center gap-3.5">
                  {planet.svg}
                  <div>
                    <span
                      className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-1"
                      style={{
                        color: planet.color,
                        backgroundColor: planet.bg,
                        borderColor: planet.border,
                      }}
                    >
                      {planet.area}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{planet.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-white/75 leading-relaxed">{planet.desc}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {planet.examples.map((ex) => (
                    <span
                      key={ex}
                      className="text-[11px] font-semibold text-white/85 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </LiquidGlass>
            ))}
          </div>
        </section>

        {/* 4. Sistema Con Pistas, Estrellas y Roles */}
        <section className="grid lg:grid-cols-5 gap-4">
          <LiquidGlass
            blur={7}
            refraction={10}
            bezel={0.22}
            className="lg:col-span-3 rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-7 space-y-4"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Sistema de recompensas y pistas
              </h2>
              <div className="flex items-center gap-1 text-[#FDE68A]" aria-label="Hasta 3 estrellas">
                <span className="text-lg">★</span>
                <span className="text-lg">★</span>
                <span className="text-lg">★</span>
              </div>
            </div>

            <div className="space-y-3">
              {RULES.map((rule) => (
                <div
                  key={rule.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/15 bg-white/[0.05]"
                        style={{ color: rule.color }}
                      >
                        {rule.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>

          <LiquidGlass
            blur={7}
            refraction={10}
            bezel={0.22}
            className="lg:col-span-2 rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-7 space-y-4"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white">Roles en la misión</h2>
            <div className="space-y-3">
              {ROLES.map((item) => (
                <div
                  key={item.role}
                  className="rounded-2xl border p-4 space-y-2"
                  style={{ backgroundColor: item.bg, borderColor: item.border }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-white">{item.role}</span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                      style={{ color: item.color, borderColor: item.border }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </section>

        {/* 5. Guía de atajos de teclado (exclusiva de Cómo jugar) */}
        <section className="space-y-5" aria-labelledby="keyboard-shortcuts-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="keyboard-shortcuts-heading" className="text-xl sm:text-2xl font-bold text-white">
                Atajos de teclado
              </h2>
              <p className="text-sm text-white/65 mt-1">
                Puedes recorrer toda la plataforma y jugar usando solo el teclado.
              </p>
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#67E8F9]/35 bg-[#67E8F9]/10 text-[#67E8F9]">
              Control por teclado
            </span>
          </div>

          <LiquidGlass
            blur={7}
            refraction={10}
            bezel={0.22}
            className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-7"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {KEYBOARD_SHORTCUTS_GUIDE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border p-4 flex flex-col justify-between gap-3"
                  style={{ backgroundColor: item.bg, borderColor: item.border }}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.keys.map((keyLabel) => (
                      <kbd
                        key={keyLabel}
                        className="inline-flex items-center justify-center min-w-[34px] h-8 px-2.5 rounded-lg border bg-slate-950/70 font-mono text-xs font-black text-white shadow-sm"
                        style={{ borderColor: item.border, color: item.accentColor }}
                      >
                        {keyLabel}
                      </kbd>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </section>

        {/* 6. Temario completo por planeta */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Temario por planeta</h2>
          <div className="space-y-3">
            <details className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <summary className="cursor-pointer font-semibold text-white">
                Planeta Numérix (Matemáticas · 6 niveles)
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm text-white/75 list-disc pl-5">
                <li>Nivel 1: Sumas y restas básicas</li>
                <li>Nivel 2: Multiplicación y cálculo mental</li>
                <li>Nivel 3: Divisiones exactas</li>
                <li>Nivel 4: Fracciones visuales</li>
                <li>Nivel 5: Decimales y medidas</li>
                <li>Nivel 6: Problemas cotidianos</li>
              </ul>
            </details>

            <details className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <summary className="cursor-pointer font-semibold text-white">
                Planeta Letralia (Lenguaje · 3 niveles)
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm text-white/75 list-disc pl-5">
                <li>Nivel 1: Sinónimos, antónimos y vocabulario</li>
                <li>Nivel 2: Ortografía y acentuación</li>
                <li>Nivel 3: Comprensión lectora y gramática</li>
              </ul>
            </details>

            <details className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <summary className="cursor-pointer font-semibold text-white">
                Planeta Naturae (Ciencias · 3 niveles)
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm text-white/75 list-disc pl-5">
                <li>Nivel 1: Cuerpo humano y seres vivos</li>
                <li>Nivel 2: Ecosistemas y cadenas alimentarias</li>
                <li>Nivel 3: Materia, energía y sistema solar</li>
              </ul>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
