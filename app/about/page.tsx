import Link from 'next/link';

const planetasInfo = [
  {
    nombre: 'Numérix',
    icon: '🔢',
    materia: 'Matemáticas',
    desc: 'Números, operaciones, geometría y razonamiento lógico.',
    accent: '#00f5ff',
    tint: 'rgba(0, 245, 255, 0.08)',
  },
  {
    nombre: 'Letralia',
    icon: '📖',
    materia: 'Lenguas',
    desc: 'Gramática, vocabulario, ortografía y comprensión lectora.',
    accent: '#bf40ff',
    tint: 'rgba(191, 64, 255, 0.08)',
  },
  {
    nombre: 'Naturae',
    icon: '🌿',
    materia: 'Ciencias',
    desc: 'Seres vivos, ecosistemas, energía y el universo.',
    accent: '#00ff88',
    tint: 'rgba(0, 255, 136, 0.08)',
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="text-center space-y-4">
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
          </section>

          <section className="liquid-glass liquid-glass-panel rounded-3xl p-8 sm:p-10">
            <h2 className="text-2xl font-black text-white mb-5 tracking-wide flex items-center gap-2.5">
              <span>📖</span> ¿Cómo nació este proyecto?
            </h2>
            <div className="space-y-4 text-slate-200/90 text-base md:text-lg leading-relaxed">
              <p>
                Este proyecto nace de la necesidad de formar jóvenes mediante técnicas
                poco convencionales, combinando la educación con dinámicas de juego para
                hacer del aprendizaje una experiencia atractiva y significativa.
              </p>
              <p>
                La meta es ofrecer una herramienta <strong className="text-cyan-300">offline, gratuita y sin castigos</strong> que
                ayude a niños de educación primaria a reforzar sus conocimientos en
                Matemática, Lengua y Ciencias Naturales, usando juegos que motivan el aprendizaje.
              </p>
              <p className="text-cyan-200/80 text-sm md:text-base pt-3 font-semibold">
                Porque aprender puede ser tan emocionante como explorar el espacio 🚀
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
              🪐 Los planetas del conocimiento
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {planetasInfo.map((p) => (
                <div
                  key={p.nombre}
                  className="liquid-glass liquid-glass-interactive rounded-3xl p-7 text-center"
                  style={{
                    background: `linear-gradient(155deg, ${p.tint} 0%, rgba(14,18,34,0.44) 52%, rgba(8,10,22,0.56) 100%)`,
                    borderColor: `${p.accent}38`,
                  }}
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl liquid-glass-pill flex items-center justify-center text-4xl mb-4">
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 tracking-wide">{p.nombre}</h3>
                  <p
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
                    style={{ color: p.accent }}
                  >
                    {p.materia}
                  </p>
                  <p className="text-sm text-slate-200/90 leading-relaxed">{p.desc}</p>
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
