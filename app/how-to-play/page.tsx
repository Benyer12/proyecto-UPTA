import Link from 'next/link';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';

const RULES = [
  {
    id: 'fuel',
    tag: 'Energía diaria',
    title: 'Combustible de Reactor',
    desc: 'Cada intento consume una unidad de combustible. El tanque se recarga cada 24 horas para fomentar sesiones equilibradas de estudio.',
    accent: '#FDE68A',
    tint: 'rgba(250, 204, 21, 0.08)',
  },
  {
    id: 'dice',
    tag: 'Movimiento orbital',
    title: 'Dado 3D',
    desc: 'Lanza el dado para avanzar por la ruta del planeta. El número obtenido determina cuántas casillas recorres en cada turno.',
    accent: '#67E8F9',
    tint: 'rgba(0, 245, 255, 0.08)',
  },
  {
    id: 'capsules',
    tag: 'Retos adaptativos',
    title: 'Cápsulas de Conocimiento',
    desc: 'Casillas con preguntas ajustadas al tema del nivel. Cada respuesta incluye una pista opcional y explicación formativa.',
    accent: '#D8B4FE',
    tint: 'rgba(191, 64, 255, 0.08)',
  },
  {
    id: 'retry',
    tag: 'Cero castigos',
    title: 'Retroceso sin frustración',
    desc: 'Si fallas una respuesta, retrocedes algunas casillas para practicar de nuevo. Nunca se borra tu avance ni se expulsa al estudiante.',
    accent: '#FDA4AF',
    tint: 'rgba(244, 63, 94, 0.08)',
  },
  {
    id: 'events',
    tag: 'Casillas dinámicas',
    title: 'Eventos especiales',
    desc: 'Durante el recorrido encontrarás retos regulares, minijuegos de calibración, escudos defensivos y llaves de avance.',
    accent: '#6EE7B7',
    tint: 'rgba(0, 255, 136, 0.08)',
  },
  {
    id: 'boss',
    tag: 'Desafío de cierre',
    title: 'Guardián del Planeta',
    desc: 'Al llegar a la meta enfrentas un desafío final en tres fases para completar la estación y sumar estrellas de bonificación.',
    accent: '#F0ABFC',
    tint: 'rgba(236, 72, 153, 0.08)',
  },
] as const;

const ROLES = [
  {
    id: 'student',
    badge: 'Explorador',
    title: 'Estudiante',
    desc: 'Juega los tableros, resuelve desafíos, acumula estrellas y desbloquea nuevos niveles.',
    accent: '#67E8F9',
    tint: 'rgba(0, 245, 255, 0.08)',
  },
  {
    id: 'tutor',
    badge: 'Guía académico',
    title: 'Tutor / Maestro',
    desc: 'Supervisa el avance de sus estudiantes asignados, revisa estrellas obtenidas y acompaña el aprendizaje.',
    accent: '#D8B4FE',
    tint: 'rgba(191, 64, 255, 0.08)',
  },
  {
    id: 'admin',
    badge: 'Control central',
    title: 'Administrador',
    desc: 'Aprueba solicitudes nuevas, edita cuentas activas, asigna roles y vincula tutores con estudiantes.',
    accent: '#FDA4AF',
    tint: 'rgba(244, 63, 94, 0.08)',
  },
] as const;

const STEPS = [
  { step: '01', title: 'Elige tu mundo', text: 'Inicia sesión y selecciona un planeta: Numérix, Letralia o Naturae.' },
  { step: '02', title: 'Selecciona misión', text: 'Abre el mapa del planeta y entra a un nivel habilitado.' },
  { step: '03', title: 'Revisa el objetivo', text: 'Consulta la guía rápida del tablero para conocer las casillas especiales.' },
  { step: '04', title: 'Lanza el Dado 3D', text: 'Avanza paso a paso por las casillas de la ruta orbital.' },
  { step: '05', title: 'Supera los retos', text: 'Responde cada desafío con apoyo de pistas para reunir llaves y estrellas.' },
  { step: '06', title: 'Vence al Guardián', text: 'Resuelve las tres fases finales para completar el nivel y registrar tu puntaje.' },
];

function BoardFlowDiagram() {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      className="w-full h-auto max-w-[320px] mx-auto select-none"
      role="img"
      aria-label="Diagrama del ciclo de misión: dado, casillas, retos y guardián final"
    >
      <path
        d="M42 142 C85 142 100 64 160 64 C220 64 235 132 278 132"
        stroke="#67E8F9"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        strokeDasharray="6 6"
      />
      {/* Nodo 1: Dado */}
      <g transform="translate(42 142)">
        <rect x="-18" y="-18" width="36" height="36" rx="9" fill="#0B132B" stroke="#67E8F9" strokeWidth="1.6" />
        <circle cx="-6" cy="-6" r="2.2" fill="#67E8F9" />
        <circle cx="0" cy="0" r="2.2" fill="#F8FAFC" />
        <circle cx="6" cy="6" r="2.2" fill="#67E8F9" />
        <text x="0" y="34" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="700">
          DADO
        </text>
      </g>
      {/* Nodo 2: Retos */}
      <g transform="translate(160 64)">
        <polygon points="0,-22 20,-10 20,10 0,22 -20,10 -20,-10" fill="#171235" stroke="#D8B4FE" strokeWidth="1.6" />
        <path d="M-5 1L-1 5L6 -4" stroke="#D8B4FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="0" y="-32" textAnchor="middle" fill="#E9D5FF" fontSize="10" fontWeight="700">
          RETOS Y LLAVES
        </text>
      </g>
      {/* Nodo 3: Guardián */}
      <g transform="translate(278 132)">
        <circle r="20" fill="#07221D" stroke="#6EE7B7" strokeWidth="1.6" />
        <ellipse rx="27" ry="9" transform="rotate(-24)" stroke="#6EE7B7" strokeOpacity="0.65" strokeWidth="1.2" />
        <circle r="6" fill="#6EE7B7" />
        <text x="0" y="36" textAnchor="middle" fill="#D1FAE5" fontSize="10" fontWeight="700">
          GUARDIÁN
        </text>
      </g>
    </svg>
  );
}

function RuleIcon({ id, color }: { id: (typeof RULES)[number]['id']; color: string }) {
  switch (id) {
    case 'fuel':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="6" y="4" width="12" height="16" rx="3" stroke={color} strokeWidth="1.7" />
          <path d="M9.5 14H14.5M9.5 10H14.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'dice':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth="1.7" />
          <circle cx="9" cy="9" r="1.4" fill={color} />
          <circle cx="15" cy="9" r="1.4" fill={color} />
          <circle cx="12" cy="12" r="1.4" fill={color} />
          <circle cx="9" cy="15" r="1.4" fill={color} />
          <circle cx="15" cy="15" r="1.4" fill={color} />
        </svg>
      );
    case 'capsules':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6.5C4 5.4 4.9 4.5 6 4.5H18C19.1 4.5 20 5.4 20 6.5V17.5C20 18.6 19.1 19.5 18 19.5H6C4.9 19.5 4 18.6 4 17.5V6.5Z" stroke={color} strokeWidth="1.7" />
          <path d="M8 9.5H16M8 13.5H13" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'retry':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4.5 12A7.5 7.5 0 1 1 7 17.6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M4.5 7.5V12H9" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'events':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <polygon points="12,3 19.5,7.5 19.5,16.5 12,21 4.5,16.5 4.5,7.5" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.5" fill={color} />
        </svg>
      );
    case 'boss':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.7" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-28 12 12)" stroke={color} strokeWidth="1.4" />
          <circle cx="12" cy="12" r="2.5" fill={color} />
        </svg>
      );
  }
}

function RoleIcon({ id, color }: { id: (typeof ROLES)[number]['id']; color: string }) {
  if (id === 'student') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8.5" r="3.5" stroke={color} strokeWidth="1.7" />
        <path d="M5.5 19.5C6.5 16 9 14.5 12 14.5C15 14.5 17.5 16 18.5 19.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'tutor') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3.5 9.5L12 5L20.5 9.5L12 14L3.5 9.5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M7 11.5V16.5C7 17.8 9.2 19 12 19C14.8 19 17 17.8 17 16.5V11.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L5 6V11.5C5 16 8 19.8 12 21C16 19.8 19 16 19 11.5V6L12 3Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="11.5" r="2.2" fill={color} />
    </svg>
  );
}

export default function HowToPlayPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 pb-24 space-y-10 sm:space-y-12">
        {/* Encabezado asimétrico en Liquid Glass */}
        <LiquidGlass
          blur={2}
          refraction={22}
          bezel={0.36}
          saturation={1.65}
          className="rounded-3xl bg-[#050a18]/[0.36] border-white/[0.15] p-6 sm:p-9 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),inset_0_-14px_26px_-12px_rgba(180,220,255,0.16)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center rounded-full border border-[#67E8F9]/35 bg-white/[0.05] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#67E8F9]">
                Guía de exploración
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight cosmic-title leading-tight">
                Cómo jugar una misión
              </h1>
              <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
                Cada tablero combina movimiento con dado, retos por materia y un guardián final para
                reforzar lo aprendido sin presiones innecesarias.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
                <BoardFlowDiagram />
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* Mecánicas y Reglas */}
        <LiquidGlass
          blur={2}
          refraction={22}
          bezel={0.34}
          saturation={1.65}
          className="rounded-3xl bg-[#050a18]/[0.38] border-white/[0.15] p-6 sm:p-8 space-y-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#67E8F9] block">
                Mecánicas del tablero
              </span>
              <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight mt-0.5">
                Reglas de la misión
              </h2>
            </div>
            <span className="liquid-glass-inset px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#CBD5E1]">
              6 sistemas principales
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {RULES.map((rule) => (
              <article
                key={rule.title}
                className="rounded-xl liquid-glass-inset p-5 flex flex-col justify-between gap-3.5"
                style={{
                  background: `linear-gradient(155deg, ${rule.tint} 0%, rgba(255, 255, 255, 0.02) 60%)`,
                  borderColor: `${rule.accent}2B`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="w-11 h-11 rounded-xl bg-[#080D1C] border flex items-center justify-center shrink-0"
                    style={{ borderColor: `${rule.accent}45` }}
                  >
                    <RuleIcon id={rule.id} color={rule.accent} />
                  </div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#080D1C] border"
                    style={{ color: rule.accent, borderColor: `${rule.accent}40` }}
                  >
                    {rule.tag}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-[#F8FAFC]">{rule.title}</h3>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">{rule.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </LiquidGlass>

        {/* Flujo del juego: 6 pasos en secuencia ordenada */}
        <LiquidGlass
          blur={2}
          refraction={22}
          bezel={0.34}
          saturation={1.65}
          className="rounded-3xl bg-[#050a18]/[0.38] border-white/[0.15] p-6 sm:p-8 space-y-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#94A3B8] block">
              Secuencia completa
            </span>
            <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
              Flujo de una partida
            </h2>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <li key={s.step} className="rounded-xl liquid-glass-inset p-5 flex items-start gap-3.5">
                <span className="w-9 h-9 rounded-lg bg-[#0B132B] border border-cyan-400/45 flex items-center justify-center text-[#67E8F9] text-xs font-black shrink-0 tabular-nums">
                  {s.step}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[#F8FAFC]">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </LiquidGlass>

        {/* Roles en la Plataforma */}
        <LiquidGlass
          blur={2}
          refraction={22}
          bezel={0.34}
          saturation={1.65}
          className="rounded-3xl bg-[#050a18]/[0.38] border-white/[0.15] p-6 sm:p-8 space-y-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#94A3B8] block">
              Perfiles de acceso
            </span>
            <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
              Roles en la plataforma
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {ROLES.map((role) => (
              <article
                key={role.title}
                className="rounded-xl liquid-glass-inset p-5 flex flex-col gap-3.5"
                style={{
                  background: `linear-gradient(155deg, ${role.tint} 0%, rgba(255, 255, 255, 0.02) 65%)`,
                  borderColor: `${role.accent}2B`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="w-11 h-11 rounded-xl bg-[#080D1C] border flex items-center justify-center shrink-0"
                    style={{ borderColor: `${role.accent}45` }}
                  >
                    <RoleIcon id={role.id} color={role.accent} />
                  </div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: role.accent }}
                  >
                    {role.badge}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[#F8FAFC]">{role.title}</h3>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">{role.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </LiquidGlass>

        <div className="flex justify-center pt-2">
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center justify-center liquid-glass-pill hover:bg-white/15 text-xs font-bold uppercase tracking-widest text-[#67E8F9] hover:text-white px-6 py-3 rounded-xl transition-colors"
          >
            Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
