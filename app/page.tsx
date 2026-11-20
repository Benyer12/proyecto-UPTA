'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
    cursos: [
      { name: 'Cinturón de Asteroides', description: 'Sumas y restas básicas', levels: [{ id: 1, name: 'Sumas básicas', description: '' }, { id: 2, name: 'Restas básicas', description: '' }, { id: 3, name: 'Reto del Cinturón', description: '' }] },
      { name: 'Campo de Cometas', description: 'Multiplicación y división', levels: [{ id: 4, name: 'Tablas de multiplicar', description: '' }, { id: 5, name: 'Multiplicación', description: '' }, { id: 6, name: 'Reto del Cometa', description: '' }] },
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
    cursos: [
      { name: 'Tormenta de Sílabas', description: 'Separación silábica y acentuación', levels: [{ id: 1, name: 'Separación silábica', description: '' }, { id: 2, name: 'Acentuación', description: '' }, { id: 3, name: 'Reto de la Tormenta', description: '' }] },
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
    cursos: [
      { name: 'Bosque Cósmico', description: 'Seres vivos y reinos de la naturaleza', levels: [{ id: 1, name: 'Seres vivos', description: '' }, { id: 2, name: 'Reinos naturales', description: '' }, { id: 3, name: 'Reto del Bosque', description: '' }] },
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <section className="relative z-10 flex flex-col items-center justify-center pt-12 pb-16 min-h-[78vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 mb-6">
            <span>✦</span> Aventura Educativa Espacial <span>✦</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 cosmic-title">
            UNIVERSO DEL CONOCIMIENTO
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200/90 max-w-2xl mx-auto mb-5 leading-relaxed font-normal">
            Una plataforma educativa gamificada que convierte el aprendizaje
            en un viaje espacial para niños de 10 a 12 años.
          </p>

          <p className="text-sm md:text-base text-cyan-300/80 font-semibold tracking-[0.18em] uppercase mb-10">
            ✦ Explora · Aprende · Brilla como una estrella ✦
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="liquid-glass-btn text-white font-bold px-8 py-3.5 rounded-2xl text-sm tracking-widest uppercase"
            >
              COMENZAR VIAJE
            </Link>
            <Link
              href="/about"
              className="liquid-glass-pill hover:bg-white/15 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all text-sm tracking-widest uppercase"
            >
              MÁS INFORMACIÓN
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 pb-28">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
              Explora los mundos del conocimiento
            </h2>
            <p className="text-slate-300/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Cada planeta contiene cursos y niveles adaptados al ritmo de aprendizaje del estudiante.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANETAS_PREVIEW.map((p, i) => (
              <motion.div
                key={p.nombre}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative group flex"
              >
                <div
                  className="liquid-glass rounded-3xl p-4 text-center flex flex-col justify-between w-full"
                  style={{
                    borderColor: `${p.glow}38`,
                    boxShadow: `0 18px 42px -10px rgba(0,0,0,0.65), 0 0 28px -8px ${p.glow}22, inset 0 1.5px 1px rgba(255,255,255,0.28)`,
                  }}
                >
                  <div className="liquid-glass-pill rounded-2xl p-6 flex flex-col justify-between h-full">
                    <div className="flex justify-center mb-3">
                      <Planeta
                        planetId={p.id}
                        nombre={p.nombre}
                        materia={p.materia}
                        gradient={p.gradient}
                        glow={p.glow}
                        glowColor={p.glowColor}
                        delay={i * 0.5}
                        cursos={p.cursos}
                      />
                    </div>
                    <p className="text-sm md:text-base text-slate-200/90 leading-relaxed mt-3 font-medium">
                      {p.descripcion}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
