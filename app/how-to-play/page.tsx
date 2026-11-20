import Link from 'next/link';

const RULES = [
  {
    icon: '⚡',
    tag: 'Energía Diaria',
    title: 'Combustible de Reactor',
    desc: 'Cada intento consume una unidad de combustible. El tanque se recarga cada 24 horas. Cuando se agota, el estudiante debe esperar para volver a jugar.',
    accent: '#facc15',
    tint: 'rgba(250, 204, 21, 0.1)',
  },
  {
    icon: '🎲',
    tag: 'Movimiento Orbital',
    title: 'Dado 3D',
    desc: 'Lanza el dado para avanzar por la ruta perimetral. Cada número determina cuántas casillas avanzas.',
    accent: '#00f5ff',
    tint: 'rgba(0, 245, 255, 0.1)',
  },
  {
    icon: '💊',
    tag: 'Retos Adaptativos',
    title: 'Cápsulas de Conocimiento',
    desc: 'Son las casillas de pregunta. La IA genera preguntas adaptativas según tu historial. Si la IA no responde a tiempo, un banco local de preguntas toma el control.',
    accent: '#bf40ff',
    tint: 'rgba(191, 64, 255, 0.1)',
  },
  {
    icon: '🕳️',
    tag: 'Cero Castigos',
    title: 'Retroceso (sin frustración)',
    desc: 'Si respondes mal, retrocedes 3 casillas. NUNCA te expulsan ni borran tu progreso. ¡El error es parte del aprendizaje!',
    accent: '#f43f5e',
    tint: 'rgba(244, 63, 94, 0.1)',
  },
  {
    icon: '🪐',
    tag: 'Casillas Dinámicas',
    title: 'Eventos especiales',
    desc: 'Durante tu viaje espacial encontrarás diferentes tipos de casillas: Normales (retos), Especiales (minijuegos de calibración y escudos), Trampas y el Guardián.',
    accent: '#00ff88',
    tint: 'rgba(0, 255, 136, 0.1)',
  },
  {
    icon: '🏆',
    tag: 'Jefe de Estación',
    title: 'Comandante del Planeta',
    desc: 'Al llegar al final del tablero, enfrentarás un desafío contrarreloj. Usa comodines (Materia Oscura, Distorsión Temporal, Salto Hiperespacial) para ganar.',
    accent: '#ec4899',
    tint: 'rgba(236, 72, 153, 0.1)',
  },
];

const ROLES = [
  {
    icon: '👨‍🚀',
    badge: 'Explorador',
    title: 'Estudiante',
    desc: 'Juega, aprende, gana estrellas y avanza por los planetas.',
    accent: '#00f5ff',
    tint: 'rgba(0, 245, 255, 0.1)',
  },
  {
    icon: '👩‍🏫',
    badge: 'Guía Espacial',
    title: 'Tutor / Maestro',
    desc: 'Supervisa el progreso de tus estudiantes, ve reportes y accede a la guía pedagógica de cada nivel.',
    accent: '#bf40ff',
    tint: 'rgba(191, 64, 255, 0.1)',
  },
  {
    icon: '🛠️',
    badge: 'Control Central',
    title: 'Administrador',
    desc: 'Gestiona los usuarios del sistema y asigna roles (tutor o estudiante).',
    accent: '#f43f5e',
    tint: 'rgba(244, 63, 94, 0.1)',
  },
];

const STEPS = [
  { step: '1', title: 'Elige tu mundo', text: 'Inicia sesión y selecciona un planeta (Numérix, Letralia o Naturae).' },
  { step: '2', title: 'Selecciona misión', text: 'Elige un nivel o estación orbital disponible.' },
  { step: '3', title: 'Micro-Clase', text: 'Mira la transmisión "Base Tierra" con la explicación del tema.' },
  { step: '4', title: 'Lanza el Dado 3D', text: 'Avanza por las casillas de la Ruta Perimetral.' },
  { step: '5', title: 'Supera los retos', text: 'Responde las preguntas. Si aciertas, ganas estrellas; si fallas, retrocedes sin perder.' },
  { step: '6', title: 'Vence al Comandante', text: 'Al llegar al final, supera el reto final para desbloquear la siguiente estación.' },
];

export default function HowToPlayPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 pb-24 space-y-12">
        {/* Encabezado en Doble Encapsulado Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-3xl p-4 sm:p-5">
          <div className="liquid-glass rounded-2xl p-7 sm:p-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              <span>✦</span> Guía de Exploración <span>✦</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight cosmic-title">
              🚀 Cómo Jugar
            </h1>
            <p className="text-base md:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed">
              Conviértete en un astronauta del conocimiento y explora el Universo.
              ¡Cada planeta es una aventura nueva!
            </p>
          </div>
        </section>

        {/* Mecánicas y Reglas en Doble Encapsulado Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-3xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300/85 block">
                Mecánicas del Tablero
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                🎮 Reglas de la Misión
              </h2>
            </div>
            <span className="liquid-glass-pill px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-cyan-200">
              6 Sistemas Clave
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {RULES.map((rule) => (
              <div
                key={rule.title}
                className="liquid-glass rounded-3xl p-4 flex flex-col justify-between"
                style={{
                  background: `linear-gradient(155deg, ${rule.tint} 0%, rgba(14,18,34,0.48) 55%, rgba(8,10,22,0.6) 100%)`,
                  borderColor: `${rule.accent}40`,
                }}
              >
                {/* Cápsula interior Liquid Glass (doble encapsulado) */}
                <div className="liquid-glass-pill rounded-2xl p-5 h-full flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl liquid-glass flex items-center justify-center text-2xl shrink-0">
                      {rule.icon}
                    </div>
                    <span
                      className="liquid-glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: rule.accent, borderColor: `${rule.accent}45` }}
                    >
                      {rule.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-1.5 tracking-wide">{rule.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flujo del juego en Doble Encapsulado Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-3xl p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300/85">
              Paso a Paso
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              📋 Flujo del juego
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="liquid-glass rounded-2xl p-3">
                <div className="liquid-glass-pill rounded-xl p-4 h-full flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-[0_0_12px_rgba(0,245,255,0.3)]">
                    {s.step}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                      {s.title}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-medium">
                      {s.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roles en la Plataforma en Doble Encapsulado Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-3xl p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300/85">
              Tripulación Espacial
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              👥 Roles en la Plataforma
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {ROLES.map((role) => (
              <div
                key={role.title}
                className="liquid-glass rounded-3xl p-4 flex flex-col justify-between"
                style={{
                  background: `linear-gradient(155deg, ${role.tint} 0%, rgba(14,18,34,0.48) 55%, rgba(8,10,22,0.6) 100%)`,
                  borderColor: `${role.accent}40`,
                }}
              >
                <div className="liquid-glass-pill rounded-2xl p-5 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl liquid-glass flex items-center justify-center text-3xl mb-3.5">
                    {role.icon}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
                    style={{ color: role.accent }}
                  >
                    {role.badge}
                  </span>
                  <h3 className="text-lg font-black text-white mb-2 tracking-wide">{role.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <Link
            href="/"
            className="liquid-glass-pill hover:bg-white/15 text-xs font-bold uppercase tracking-widest text-cyan-300 hover:text-cyan-200 px-6 py-3 rounded-2xl transition-all"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
