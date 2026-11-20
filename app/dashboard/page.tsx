'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PlanetVisual from '../components/PlanetVisual';
import { useAuthStore } from '../../lib/auth-store';
import { MOCK_PLANETS } from '../../lib/mock-data';
import type { Planet, StudentProgress } from '../../shared/types';
import { createBrowserClient } from '@supabase/ssr';

async function obtenerProgresoDelEstudiante(userId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('progreso_usuario')
    .select('*')
    .eq('usuario_id', userId);

  if (error) {
    console.error('Error al obtener progreso:', error);
    return { progressMap: {}, totalStars: 0 };
  }

  const progressMap: Record<number, any> = {};
  let totalStars = 0;
  
  data.forEach((row) => {
    progressMap[row.nivel_id] = {
      status: row.completado ? 'completed' : 'unlocked',
      stars: row.estrellas,
      completed: row.completado
    };
    totalStars += row.estrellas || 0;
  });

  return { progressMap, totalStars };
}

function StudentView({ planets, progress, user, totalStars }: { planets: Planet[]; progress: Record<number, StudentProgress>; user?: any; totalStars: number }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  const getPlanetStyles = (name: string) => {
    if (name.includes('Numérix')) return { color: '#00f5ff', tint: 'rgba(0, 245, 255, 0.08)' };
    if (name.includes('Letralia')) return { color: '#bf40ff', tint: 'rgba(191, 64, 255, 0.08)' };
    if (name.includes('Naturae')) return { color: '#00ff88', tint: 'rgba(0, 255, 136, 0.08)' };
    return { color: '#80f0ff', tint: 'rgba(128, 240, 255, 0.08)' };
  };

  return (
    <div className="space-y-10">
      {/* Banner Superior de Bienvenida Liquid Glass */}
      <div className="max-w-5xl mx-auto rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl liquid-glass-pill flex items-center justify-center text-3xl shadow-[0_0_24px_rgba(0,245,255,0.28)] border border-cyan-400/40">
            👩‍🚀
          </div>
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/80 block mb-0.5">
              Centro de Exploración
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
              ¡Hola, {user?.name || 'Explorador'}!
            </h2>
          </div>
        </div>
        <div className="liquid-glass-pill px-6 py-3 rounded-2xl border border-cyan-400/30 flex items-center gap-3.5 relative z-10">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(250,204,21,0.85)]">⭐</span>
          <div>
            <div className="text-[11px] text-slate-300 uppercase tracking-widest font-bold">Estrellas</div>
            <div className="text-xl font-black text-white leading-tight">{totalStars}</div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight cosmic-title">
          MAPAS ESTELARES
        </h1>
        <p className="text-slate-300/90 font-medium text-base md:text-lg">
          Selecciona un planeta para comenzar tu misión
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-7 max-w-5xl mx-auto">
        {planets.map((planet) => {
          const styles = getPlanetStyles(planet.name);
          return (
            <motion.div
              key={planet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: planet.order * 0.1 }}
              className="rounded-3xl liquid-glass liquid-glass-interactive overflow-hidden relative group flex flex-col justify-between"
              style={{
                background: `linear-gradient(155deg, ${styles.tint} 0%, rgba(14,18,34,0.44) 50%, rgba(8,10,22,0.56) 100%)`,
                borderColor: `${styles.color}38`,
                boxShadow: `0 18px 42px -10px rgba(0,0,0,0.68), 0 0 24px -6px ${styles.color}20, inset 0 1.5px 1px rgba(255,255,255,0.28), inset 0 -3px 8px rgba(0,0,0,0.45)`
              }}
            >
              <div className="p-7 text-center relative z-10 flex-1 flex flex-col">
                <div className="mb-4 flex justify-center scale-75 transform-origin-top">
                  <PlanetVisual name={planet.name} />
                </div>
                
                <h2
                  className="text-2xl font-black text-white mb-2 tracking-wide"
                  style={{ textShadow: `0 0 14px ${styles.color}65` }}
                >
                  {planet.name}
                </h2>
                <p className="text-xs text-slate-200/80 uppercase tracking-[0.16em] mb-6 font-semibold min-h-[2.25rem] flex items-center justify-center">
                  {planet.shortDescription}
                </p>
                
                <div className="mt-auto space-y-3">
                  <button
                    onClick={() => router.push(`/planeta/${planet.id}`)}
                    className="w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${styles.color}28, ${styles.color}14)`,
                      border: `1px solid ${styles.color}75`,
                      color: '#fff',
                      boxShadow: `0 6px 20px -4px ${styles.color}25, inset 0 1px 1px rgba(255,255,255,0.3)`,
                      textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 24px ${styles.color}55, inset 0 1px 1.5px rgba(255,255,255,0.45)`;
                      e.currentTarget.style.background = `linear-gradient(135deg, ${styles.color}45, ${styles.color}25)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 6px 20px -4px ${styles.color}25, inset 0 1px 1px rgba(255,255,255,0.3)`;
                      e.currentTarget.style.background = `linear-gradient(135deg, ${styles.color}28, ${styles.color}14)`;
                    }}
                  >
                    🚀 Explorar Planeta
                  </button>

                  <button
                    onClick={() => setExpanded(expanded === planet.id ? null : planet.id)}
                    className="text-xs font-bold transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto py-1 cursor-pointer opacity-90 hover:opacity-100"
                    style={{ color: styles.color }}
                  >
                    {expanded === planet.id ? '▲ Ocultar cursos' : '▼ Ver cursos'}
                  </button>
                </div>
              </div>

              {expanded === planet.id && (
                <div
                  className="px-6 pb-6 space-y-3.5 pt-4 bg-black/35 backdrop-blur-xl relative z-10"
                  style={{ borderTop: `1px solid ${styles.color}30` }}
                >
                  {planet.courses.map((course) => (
                    <div key={course.id} className="space-y-1.5">
                      <h3 className="text-sm font-bold text-white">{course.name}</h3>
                      <p className="text-xs text-slate-300/80">{course.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {course.levels.map((level) => {
                          const prog = progress[level.id];
                          const isLocked = !prog || prog.status === 'locked';
                          return (
                            <span
                              key={level.id}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${
                                isLocked
                                  ? 'border-white/10 text-slate-400 bg-white/5'
                                  : prog.status === 'completed'
                                    ? 'border-emerald-400/50 text-emerald-200 bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                    : 'text-white'
                              }`}
                              style={!isLocked && prog.status !== 'completed' ? { backgroundColor: `${styles.color}28`, borderColor: `${styles.color}80` } : {}}
                            >
                              {isLocked ? '🔒' : prog.status === 'completed' ? '✅' : '🔓'} {level.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<Record<number, StudentProgress>>({});
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const userId = (user as any)?.id;
    if (mounted && userId) {
      obtenerProgresoDelEstudiante(userId).then(({ progressMap, totalStars }) => {
        setProgress(progressMap);
        setTotalStars(totalStars);
      });
    }
  }, [mounted, user]);

  useEffect(() => {
    if (mounted && user?.role) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'tutor' || user.role === 'docente') {
        router.push('/docente');
      }
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <div className="relative min-h-screen" />
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="relative z-10 text-center max-w-md w-full mx-auto p-8 rounded-3xl liquid-glass liquid-glass-panel">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-wide">Mapa Estelar</h1>
          <p className="text-sm text-slate-300 mb-7 leading-relaxed">
            Inicia sesión para explorar los planetas y guardar tu progreso espacial.
          </p>
          <button
            onClick={() => router.push('/')}
            className="liquid-glass-btn px-8 py-3 rounded-2xl text-xs font-bold tracking-widest text-white uppercase cursor-pointer"
          >
            IR AL INICIO
          </button>
        </div>
      </div>
    );
  }

  if (user.role === 'admin' || user.role === 'tutor' || user.role === 'docente') return null;

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 px-6 py-12">
        {user.role === 'student' && (
          <StudentView planets={MOCK_PLANETS} progress={progress} user={user} totalStars={totalStars} />
        )}
      </div>
    </div>
  );
}
