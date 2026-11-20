import Link from 'next/link';

const planetasInfo = [
  {
    nombre: 'Numérix',
    icon: '🔢',
    materia: 'Matemáticas',
    desc: 'Números, operaciones, geometría y razonamiento lógico.',
    accent: '#00f5ff',
    tint: 'rgba(0, 245, 255, 0.1)',
    badge: '6 niveles · 2 cursos',
  },
  {
    nombre: 'Letralia',
    icon: '📖',
    materia: 'Lenguas',
    desc: 'Gramática, vocabulario, ortografía y comprensión lectora.',
    accent: '#bf40ff',
    tint: 'rgba(191, 64, 255, 0.1)',
    badge: '3 niveles · 1 curso',
  },
  {
    nombre: 'Naturae',
    icon: '🌿',
    materia: 'Ciencias',
    desc: 'Seres vivos, ecosistemas, energía y el universo.',
    accent: '#00ff88',
    tint: 'rgba(0, 255, 136, 0.1)',
    badge: '3 niveles · 1 curso',
  },
];

const PILARES = [
  { icon: '🛰️', label: 'Modo Offline & Online', desc: 'Sincronización inteligente sin perder progreso.' },
  { icon: '🛡️', label: 'Aprendizaje sin castigos', desc: 'Equivocarse es parte de la exploración espacial.' },
  { icon: '🎯', label: 'Adaptado de 10 a 12 años', desc: 'Retos alineados al currículo de educación primaria.' },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 pb-24 space-y-12">
        {/* Encabezado en Doble Encapsulado Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-3xl p-4 sm:p-5">
          <div className="liquid-glass rounded-2xl p-7 sm:p-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              <span>✦</span> Nuestra Misión Educativa <span>✦</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight cosmic-title">
              🌌 Universo del Conocimiento
            </h1>
            <p className="text-base md:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed">
              Una plataforma educativa gamificada que convierte el refuerzo escolar
              en un <strong className="text-cyan-300">viaje espacial interactivo</strong> para niños de 10 a 12 años.
            </p>
          </div>
        </section>

        {/* Sección: ¿Cómo nació este proyecto? con Doble Encapsulado Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-3xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl liquid-glass-pill flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300/85 block">
                  Origen & Propósito
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  ¿Cómo nació este proyecto?
                </h2>
              </div>
            </div>
            <span className="liquid-glass-pill px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-emerald-300">
              ● 100% Gratuito
            </span>
          </div>

          {/* Cápsula interior Liquid Glass para la narrativa */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="liquid-glass rounded-2xl p-6 space-y-2.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <span>✨</span> Educación + Gamificación
              </div>
              <p className="text-slate-200/90 text-sm sm:text-base leading-relaxed">
                Este proyecto nace de la necesidad de formar jóvenes mediante técnicas
                poco convencionales, combinando la educación con dinámicas de juego para
                hacer del aprendizaje una experiencia atractiva y significativa.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 space-y-2.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <span>🚀</span> Inclusivo y Sin Frustración
              </div>
              <p className="text-slate-200/90 text-sm sm:text-base leading-relaxed">
                La meta es ofrecer una herramienta <strong className="text-cyan-300">offline, gratuita y sin castigos</strong> que
                ayude a niños de educación primaria a reforzar Matemática, Lengua y Ciencias Naturales.
              </p>
            </div>
          </div>

          {/* Mini cápsulas de pilares dentro del contenedor principal */}
          <div className="grid sm:grid-cols-3 gap-3">
            {PILARES.map((pilar) => (
              <div key={pilar.label} className="liquid-glass-pill rounded-2xl p-4 flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{pilar.icon}</span>
                <div>
                  <div className="text-xs font-extrabold text-white tracking-wide">{pilar.label}</div>
                  <div className="text-[11px] text-slate-300/80 leading-snug mt-0.5">{pilar.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="liquid-glass-pill rounded-2xl px-5 py-3.5 text-center">
            <p className="text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
              ✦ Porque aprender puede ser tan emocionante como explorar el espacio 🚀 ✦
            </p>
          </div>
        </section>

        {/* Sección: Los planetas del conocimiento con Doble Encapsulado Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-3xl p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300/85">
              Sistema Planetario
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              🪐 Los planetas del conocimiento
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {planetasInfo.map((p) => (
              <div
                key={p.nombre}
                className="liquid-glass rounded-3xl p-4 flex flex-col justify-between"
                style={{
                  background: `linear-gradient(155deg, ${p.tint} 0%, rgba(14,18,34,0.48) 55%, rgba(8,10,22,0.6) 100%)`,
                  borderColor: `${p.accent}40`,
                }}
              >
                {/* Cápsula interior del planeta (doble encapsulado) */}
                <div className="liquid-glass-pill rounded-2xl p-5 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl liquid-glass flex items-center justify-center text-4xl mb-3.5">
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-wide">{p.nombre}</h3>
                  <p
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
                    style={{ color: p.accent }}
                  >
                    {p.materia}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">{p.desc}</p>
                </div>

                <div className="mt-3 liquid-glass-pill rounded-xl py-2 px-3 text-center">
                  <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: p.accent }}>
                    ✦ {p.badge}
                  </span>
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
