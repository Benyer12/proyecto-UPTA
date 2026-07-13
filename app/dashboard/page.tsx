'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../lib/auth-store';
import { MOCK_PLANETS, MOCK_PROGRESS } from '../../lib/mock-data';

const FondoCosmico = dynamic(() => import('../FondoCosmico'), { ssr: false });
import type { Planet, StudentProgress } from '../../shared/types';

function StudentView({ planets, progress }: { planets: Planet[]; progress: Record<number, StudentProgress> }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-wide text-center" style={{
        background: 'linear-gradient(135deg, #fff, #80f0ff, #c080ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        MAPA ESTELAR
      </h1>
      <p className="text-center text-slate-400 text-sm">Selecciona un planeta para comenzar tu misión</p>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {planets.map((planet) => (
          <motion.div
            key={planet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: planet.order * 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <button
                onClick={() => router.push(`/planeta/${planet.id}`)}
                className="w-full text-center"
              >
                <div className="text-4xl mb-3">{planet.icon}</div>
                <h2 className="text-xl font-bold text-white">{planet.name}</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest">{planet.shortDescription}</p>
              </button>

              <button
                onClick={() => setExpanded(expanded === planet.id ? null : planet.id)}
                className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {expanded === planet.id ? '▲ Ocultar cursos' : '▼ Ver cursos'}
              </button>
            </div>

            {expanded === planet.id && (
              <div className="px-6 pb-6 space-y-3 border-t border-white/10 pt-4">
                {planet.courses.map((course) => (
                  <div key={course.id} className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">{course.name}</h3>
                    <p className="text-xs text-slate-400">{course.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {course.levels.map((level) => {
                        const prog = progress[level.id];
                        const isLocked = !prog || prog.status === 'locked';
                        return (
                          <span
                            key={level.id}
                            className={`text-[10px] px-2 py-1 rounded-full border ${
                              isLocked
                                ? 'border-slate-700 text-slate-600'
                                : prog.status === 'completed'
                                  ? 'border-green-600/50 text-green-400 bg-green-950/30'
                                  : 'border-cyan-600/50 text-cyan-400 bg-cyan-950/30'
                            }`}
                          >
                            {isLocked ? '🔒' : prog.status === 'completed' ? '✅' : '🔓'} {level.name}
                          </span>
                        );
                      })}
                    </div>
                    {course.tutorDescription && (
                      <details className="mt-2">
                        <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300">
                          📋 Explicación para el tutor
                        </summary>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {course.tutorDescription}
                        </p>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TutorView({ planets }: { planets: Planet[] }) {
  const users = useAuthStore((s: any) => s.users ?? []);
  const myStudents = users.filter((u: { role: string }) => u.role === 'student');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-wide text-center" style={{
        background: 'linear-gradient(135deg, #fff, #80f0ff, #c080ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        PUENTE DE MANDO
      </h1>
      <p className="text-center text-slate-400 text-sm">Visualiza el progreso de tus astronautas</p>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Planetas</h2>
          {planets.map((planet) => (
            <details key={planet.id} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <summary className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{planet.icon}</span>
                  <div>
                    <span className="text-white font-semibold">{planet.name}</span>
                    <span className="text-xs text-slate-400 ml-2 uppercase">{planet.shortDescription}</span>
                  </div>
                </div>
              </summary>
              <div className="px-4 pb-4 space-y-3">
                {planet.courses.map((course) => (
                  <div key={course.id} className="pl-4 border-l border-white/10">
                    <h3 className="text-sm font-medium text-white">{course.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{course.tutorDescription}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {course.levels.map((l) => (
                        <span key={l.id} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-400">
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Mis estudiantes ({myStudents.length})</h2>
          {myStudents.length === 0 ? (
            <p className="text-sm text-slate-500">No hay estudiantes asignados todavía.</p>
          ) : (
            <div className="space-y-2">
              {myStudents.map((s: { id: string; name: string; username: string }) => (
                <div key={s.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white font-medium">{s.name}</div>
                    <div className="text-xs text-slate-400">@{s.username}</div>
                  </div>
                  <span className="text-xs text-slate-500">Progreso: —</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <div className="relative min-h-screen" style={{ background: '#00000a' }} />
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" style={{ background: '#00000a' }}>
        <FondoCosmico />
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-2xl font-black text-white mb-2">Mapa Estelar</h1>
          <p className="text-sm text-slate-400 mb-6">Inicia sesión para explorar los planetas y ver tu progreso.</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 rounded-full text-sm font-bold tracking-widest border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all"
          >
            IR AL INICIO
          </button>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') return null;

  return (
    <div className="relative min-h-screen" style={{ background: '#00000a' }}>
      <FondoCosmico />

      <div className="relative z-10 px-6 py-12">
        {user.role === 'student' && (
          <StudentView planets={MOCK_PLANETS} progress={MOCK_PROGRESS} />
        )}
        {user.role === 'tutor' && (
          <TutorView planets={MOCK_PLANETS} />
        )}
      </div>
    </div>
  );
}