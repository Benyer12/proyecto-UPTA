import Link from 'next/link';

const RULES = [
  {
    icon: '⚡',
    title: 'Combustible de Reactor',
    desc: 'Cada intento consume una unidad de combustible. El tanque se recarga cada 24 horas. Cuando se agota, el estudiante debe esperar para volver a jugar.',
    accent: '#facc15',
    tint: 'rgba(250, 204, 21, 0.08)',
  },
  {
    icon: '🎲',
    title: 'Dado 3D',
    desc: 'Lanza el dado para avanzar por la ruta perimetral. Cada número determina cuántas casillas avanzas.',
    accent: '#00f5ff',
    tint: 'rgba(0, 245, 255, 0.08)',
  },
  {
    icon: '💊',
    title: 'Cápsulas de Conocimiento',
    desc: 'Son las casillas de pregunta. La IA genera preguntas adaptativas según tu historial. Si la IA no responde a tiempo, un banco local de preguntas toma el control.',
    accent: '#bf40ff',
    tint: 'rgba(191, 64, 255, 0.08)',
  },
  {
    icon: '🕳️',
    title: 'Retroceso (sin frustración)',
    desc: 'Si respondes mal, retrocedes 3 casillas. NUNCA te expulsan ni borran tu progreso. ¡El error es parte del aprendizaje!',
    accent: '#f43f5e',
    tint: 'rgba(244, 63, 94, 0.08)',
  },
  {
    icon: '🪐',
    title: 'Eventos especiales',
    desc: 'Durante tu viaje espacial encontrarás diferentes tipos de casillas: Normales (retos matemáticos), Especiales (minijuegos de calibración y escudos), Trampas (desvíos peligrosos) y la casilla final del Guardián.',
    accent: '#00ff88',
    tint: 'rgba(0, 255, 136, 0.08)',
  },
  {
    icon: '🏆',
    title: 'Comandante del Planeta',
    desc: 'Al llegar al final del tablero, enfrentarás un desafío contrarreloj. Usa comodines (Materia Oscura, Distorsión Temporal, Salto Hiperespacial) para ganar.',
    accent: '#ec4899',
    tint: 'rgba(236, 72, 153, 0.08)',
  },
];

const ROLES = [
  {
    icon: '👨‍🚀',
    title: 'Estudiante',
    desc: 'Juega, aprende, gana estrellas y avanza por los planetas.',
    accent: '#00f5ff',
    tint: 'rgba(0, 245, 255, 0.08)',
  },
  {
    icon: '👩‍🏫',
    title: 'Tutor / Maestro',
    desc: 'Supervisa el progreso de tus estudiantes, ve reportes y accede a la guía pedagógica de cada nivel.',
    accent: '#bf40ff',
    tint: 'rgba(191, 64, 255, 0.08)',
  },
  {
    icon: '🛠️',
    title: 'Administrador',
    desc: 'Gestiona los usuarios del sistema y asigna roles (tutor o estudiante).',
    accent: '#f43f5e',
    tint: 'rgba(244, 63, 94, 0.08)',
  },
];

const STEPS = [
  { step: '1', text: 'Inicia sesión y selecciona un planeta (Numérix, Letralia o Naturae).' },
  { step: '2', text: 'Elige un nivel o estación orbital disponible.' },
  { step: '3', text: 'Mira la Micro-Clase "Transmisión Base Tierra" con la explicación del tema.' },
  { step: '4', text: 'Lanza el dado para avanzar en la Ruta Perimetral.' },
  { step: '5', text: 'Responde las preguntas de la IA. Si aciertas, ganas Stardust. Si fallas, retrocedes.' },
  { step: '6', text: 'Al llegar al final, enfréntate al Comandante del Planeta para desbloquear la siguiente estación.' },
];

export default function HowToPlayPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="text-center space-y-4">
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
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            {RULES.map((rule) => (
              <div
                key={rule.title}
                className="liquid-glass liquid-glass-interactive rounded-3xl p-7"
                style={{
                  background: `linear-gradient(145deg, ${rule.tint} 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.01) 100%)`,
                  borderColor: `${rule.accent}38`,
                }}
              >
                <div className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center text-2xl mb-4">
                  {rule.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-2 tracking-wide">{rule.title}</h3>
                <p className="text-sm md:text-base text-slate-200/90 leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </section>

          <section className="liquid-glass rounded-3xl p-8 sm:p-10">
            <h2 className="text-2xl font-black text-white mb-7 text-center tracking-tight">
              📋 Flujo del juego
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STEPS.map((s) => (
                <div
                  key={s.step}
                  className="flex gap-3.5 items-start liquid-glass-pill rounded-2xl p-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-[0_0_12px_rgba(0,245,255,0.3)]">
                    {s.step}
                  </div>
                  <p className="text-sm text-slate-200/90 leading-relaxed font-medium">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
              👥 Roles en la Plataforma
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {ROLES.map((role) => (
                <div
                  key={role.title}
                  className="liquid-glass liquid-glass-interactive rounded-3xl p-7 text-center"
                  style={{
                    background: `linear-gradient(145deg, ${role.tint} 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.01) 100%)`,
                    borderColor: `${role.accent}38`,
                  }}
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl liquid-glass-pill flex items-center justify-center text-3xl mb-4">
                    {role.icon}
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 tracking-wide">{role.title}</h3>
                  <p className="text-sm text-slate-200/90 leading-relaxed">{role.desc}</p>
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
    </div>
  );
}
