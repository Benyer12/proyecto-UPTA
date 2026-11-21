import Link from 'next/link';

const planetasInfo = [
  {
    id: 1,
    nombre: 'Numérix',
    materia: 'Matemáticas',
    desc: 'Números, operaciones, geometría y razonamiento lógico aplicados a retos paso a paso.',
    accent: '#67E8F9',
    tint: 'rgba(0, 245, 255, 0.08)',
    badge: '6 niveles · 2 cursos',
  },
  {
    id: 2,
    nombre: 'Letralia',
    materia: 'Lenguas',
    desc: 'Gramática, vocabulario, ortografía y comprensión lectora mediante desafíos interactivos.',
    accent: '#D8B4FE',
    tint: 'rgba(191, 64, 255, 0.08)',
    badge: '3 niveles · 1 curso',
  },
  {
    id: 3,
    nombre: 'Naturae',
    materia: 'Ciencias',
    desc: 'Seres vivos, ecosistemas, energía y el universo con recorridos exploratorios.',
    accent: '#6EE7B7',
    tint: 'rgba(0, 255, 136, 0.08)',
    badge: '3 niveles · 1 curso',
  },
];

const PILARES = [
  {
    id: 'sync',
    label: 'Modo Offline y Online',
    desc: 'Sincronización entre el dispositivo y la nube para conservar el avance de cada sesión.',
  },
  {
    id: 'safe',
    label: 'Aprendizaje sin castigos',
    desc: 'Equivocarse entrega pistas formativas y nunca borra el progreso acumulado.',
  },
  {
    id: 'age',
    label: 'Primaria de 10 a 12 años',
    desc: 'Ejercicios y lecturas calibrados para los últimos grados de educación básica.',
  },
] as const;

function MissionCompassIllustration() {
  return (
    <svg
      viewBox="0 0 300 220"
      fill="none"
      className="w-full h-auto max-w-[300px] mx-auto select-none"
      role="img"
      aria-label="Ilustración vectorial de una brújula orbital conectando matemáticas, lenguaje y ciencias"
    >
      <defs>
        <radialGradient id="aboutHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#818CF8" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="110" r="88" fill="url(#aboutHalo)" />
      <circle cx="150" cy="110" r="72" stroke="#94A3B8" strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="4 6" />
      <ellipse cx="150" cy="110" rx="108" ry="42" transform="rotate(-18 150 110)" stroke="#67E8F9" strokeOpacity="0.55" strokeWidth="1.4" />
      <ellipse cx="150" cy="110" rx="102" ry="38" transform="rotate(20 150 110)" stroke="#D8B4FE" strokeOpacity="0.5" strokeWidth="1.4" />
      <path d="M150 62L160 100L198 110L160 120L150 158L140 120L102 110L140 100L150 62Z" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.4" />
      <circle cx="150" cy="110" r="9" fill="#67E8F9" />
      <circle cx="64" cy="142" r="8" fill="#67E8F9" fillOpacity="0.85" stroke="#E0F2FE" strokeWidth="1.4" />
      <circle cx="236" cy="78" r="8" fill="#D8B4FE" fillOpacity="0.85" stroke="#F3E8FF" strokeWidth="1.4" />
      <circle cx="226" cy="154" r="7.5" fill="#6EE7B7" fillOpacity="0.85" stroke="#D1FAE5" strokeWidth="1.4" />
    </svg>
  );
}

function PillarIcon({ id }: { id: 'sync' | 'safe' | 'age' }) {
  if (id === 'sync') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 11A8 8 0 0 0 6.3 5.3L4 7.5" stroke="#67E8F9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4V7.5H7.5" stroke="#67E8F9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 13A8 8 0 0 0 17.7 18.7L20 16.5" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 20V16.5H16.5" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === 'safe') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3L5 6V11.5C5 16 8 19.8 12 21C16 19.8 19 16 19 11.5V6L12 3Z" stroke="#6EE7B7" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12L11 14L15.2 9.8" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="#D8B4FE" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="#D8B4FE" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.4" fill="#D8B4FE" />
    </svg>
  );
}

function PlanetMark({ id, color }: { id: number; color: string }) {
  if (id === 1) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke={color} strokeWidth="1.7" />
        <path d="M8.5 8.5H15.5L11.5 12L15.5 15.5H8.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === 2) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M19.5 4.5C13.5 5 8.5 9.5 6.8 16.2L5 19.5L8.3 17.7C15 16 19 11 19.5 4.5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M6.5 18L15 9.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 5C12.5 5 7.5 8.8 6.5 17C14.5 16 19 11.5 19 5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M6.5 17C9 13.5 12 11 15.5 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 pb-24 space-y-10 sm:space-y-12">
        {/* Encabezado asimétrico en Liquid Glass */}
        <section className="liquid-glass liquid-glass-panel rounded-2xl p-6 sm:p-9">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#67E8F9] block">
                Nuestra misión educativa
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight cosmic-title leading-tight">
                Universo del Conocimiento
              </h1>
              <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
                Una plataforma educativa gamificada que transforma el refuerzo escolar en un{' '}
                <strong className="text-[#F8FAFC]">recorrido espacial interactivo</strong> diseñado
                para estudiantes de 10 a 12 años.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-xl liquid-glass-inset p-4">
                <MissionCompassIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* Historia del proyecto y pilares pedagógicos */}
        <section className="liquid-glass liquid-glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#67E8F9] block">
                Origen y propósito
              </span>
              <h2 className="text-2xl font-black text-[#F8FAFC] tracking-tight mt-0.5">
                ¿Cómo nació este proyecto?
              </h2>
            </div>
            <span className="liquid-glass-inset px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#6EE7B7] border border-emerald-400/35">
              Acceso gratuito
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="liquid-glass-inset rounded-xl p-5 sm:p-6 space-y-2.5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#67E8F9]">
                Educación y gamificación
              </h3>
              <p className="text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                Este proyecto nace de la necesidad de formar jóvenes mediante técnicas dinámicas,
                combinando contenidos escolares con mecánicas de tablero para lograr un aprendizaje
                atractivo y constante.
              </p>
            </div>

            <div className="liquid-glass-inset rounded-xl p-5 sm:p-6 space-y-2.5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#D8B4FE]">
                Inclusivo y sin frustración
              </h3>
              <p className="text-[#CBD5E1] text-sm sm:text-base leading-relaxed">
                La meta es ofrecer una herramienta <strong className="text-[#F8FAFC]">gratuita, accesible y sin castigos</strong>{' '}
                que ayude a estudiantes de primaria a fortalecer Matemática, Lenguaje y Ciencias
                Naturales a su propio ritmo.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3.5 pt-1">
            {PILARES.map((pilar) => (
              <div key={pilar.label} className="liquid-glass rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg liquid-glass-inset flex items-center justify-center shrink-0">
                  <PillarIcon id={pilar.id} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#F8FAFC]">{pilar.label}</h3>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">{pilar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Los planetas del conocimiento en lista estructurada */}
        <section className="liquid-glass liquid-glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#94A3B8] block">
              Sistema planetario
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              Los planetas del conocimiento
            </h2>
          </div>

          <div className="space-y-4">
            {planetasInfo.map((p) => (
              <article
                key={p.nombre}
                className="rounded-xl liquid-glass-inset p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  background: `linear-gradient(150deg, ${p.tint} 0%, rgba(8, 12, 26, 0.85) 60%)`,
                  borderColor: `${p.accent}38`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl bg-[#080D1C] flex items-center justify-center shrink-0 border"
                    style={{ borderColor: `${p.accent}45` }}
                  >
                    <PlanetMark id={p.id} color={p.accent} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-black text-[#F8FAFC]">{p.nombre}</h3>
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: p.accent }}
                      >
                        {p.materia}
                      </span>
                    </div>
                    <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-xl">{p.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-bold text-[#CBD5E1] px-3 py-1.5 rounded-md bg-[#080D1C] border border-white/12">
                    {p.badge}
                  </span>
                  <Link
                    href={`/planeta/${p.id}`}
                    className="min-h-[44px] inline-flex items-center justify-center liquid-glass-pill hover:bg-white/15 text-xs font-bold text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Abrir planeta
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

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
