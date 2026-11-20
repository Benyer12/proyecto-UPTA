'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';

const PLANET_DATA = [
  {
    nombre: 'Numérix',
    materia: 'Matemáticas',
    icon: '🔢',
    niveles: 6,
    accent: '#00f5ff',
    tint: 'rgba(0, 245, 255, 0.08)',
  },
  {
    nombre: 'Letralia',
    materia: 'Lenguas',
    icon: '📖',
    niveles: 3,
    accent: '#bf40ff',
    tint: 'rgba(191, 64, 255, 0.08)',
  },
  {
    nombre: 'Naturae',
    materia: 'Ciencias',
    icon: '🌿',
    niveles: 3,
    accent: '#00ff88',
    tint: 'rgba(0, 255, 136, 0.08)',
  },
];

interface ProgresoRegistro {
  id: number;
  usuario_id: string;
  nivel_id: number;
  completado: boolean;
  estrellas: number;
  ultima_sesion: string | null;
}

interface EstudianteConProgreso {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  role: string;
  nivelesCompletados: number;
  estrellasTotales: number;
  ultimaSesion: string | null;
}

export default function MaestroPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<EstudianteConProgreso[]>([]);
  const [totalNiveles, setTotalNiveles] = useState<number>(
    PLANET_DATA.reduce((a, p) => a + p.niveles, 0)
  );
  const [totalCompletados, setTotalCompletados] = useState<number>(0);
  const [totalEstrellas, setTotalEstrellas] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/');
    } else if (user.role !== 'tutor' && user.role !== 'docente') {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      cargarDatosPanel();
    }
  }, [user, router, mounted]);

  const cargarDatosPanel = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: asignaciones, error: errAsig } = await supabase
        .from('tutor_estudiantes')
        .select('estudiante_id')
        .eq('tutor_id', String(user.id));

      if (errAsig) throw errAsig;

      const idsAsignados = (asignaciones || []).map((a) => a.estudiante_id);

      const { count: conteoNiveles } = await supabase
        .from('niveles')
        .select('*', { count: 'exact', head: true });

      if (conteoNiveles && conteoNiveles > 0) {
        setTotalNiveles(conteoNiveles);
      }

      if (idsAsignados.length === 0) {
        setStudents([]);
        setTotalCompletados(0);
        setTotalEstrellas(0);
        setLoading(false);
        return;
      }

      const { data: usuariosData, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, usuario, correo, role')
        .eq('role', 'student')
        .in('id', idsAsignados)
        .order('nombre', { ascending: true });

      if (errUsuarios) throw errUsuarios;

      const { data: progresoData, error: errProgreso } = await supabase
        .from('progreso_usuario')
        .select('id, usuario_id, nivel_id, completado, estrellas, ultima_sesion')
        .in('usuario_id', idsAsignados);

      if (errProgreso) throw errProgreso;

      const registrosProgreso = (progresoData || []) as ProgresoRegistro[];

      const listaEstudiantes: EstudianteConProgreso[] = (usuariosData || []).map((est) => {
        const misRegistros = registrosProgreso.filter(
          (p) => p.usuario_id === est.id
        );

        const nivelesUnicosCompletados = new Set(
          misRegistros.filter((p) => p.completado === true).map((p) => p.nivel_id)
        );

        const estrellasTotales = misRegistros.reduce(
          (acc, p) => acc + (Number(p.estrellas) || 0),
          0
        );

        const ultimaSesion =
          misRegistros
            .map((p) => p.ultima_sesion)
            .filter(Boolean)
            .sort()
            .reverse()[0] || null;

        return {
          ...est,
          nivelesCompletados: nivelesUnicosCompletados.size,
          estrellasTotales,
          ultimaSesion,
        };
      });

      setStudents(listaEstudiantes);
      setTotalCompletados(
        listaEstudiantes.reduce((acc, s) => acc + s.nivelesCompletados, 0)
      );
      setTotalEstrellas(
        listaEstudiantes.reduce((acc, s) => acc + s.estrellasTotales, 0)
      );
    } catch (error) {
      console.error('Error al cargar datos del panel de tutor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !user || (user.role !== 'tutor' && user.role !== 'docente')) return null;

  return (
    <div className="relative min-h-screen px-6 py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Encabezado Liquid Glass */}
        <div className="rounded-3xl liquid-glass liquid-glass-panel p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-2">
              <span>✦</span> Panel Docente
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              🚀 Puente de Mando
            </h1>
            <p className="text-slate-300/90 text-sm md:text-base mt-1.5">
              Bienvenido, <strong className="text-white">{user.name}</strong>. Supervisa el rendimiento y progreso espacial de tus estudiantes.
            </p>
          </div>
        </div>

        {/* Tarjetas de métricas globales Liquid Glass */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5">
            <div className="text-2xl md:text-3xl font-black text-white">{students.length}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Estudiantes</div>
          </div>
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5">
            <div className="text-2xl md:text-3xl font-black text-white">{PLANET_DATA.length}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Planetas</div>
          </div>
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5">
            <div className="text-2xl md:text-3xl font-black text-white">{totalNiveles}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Niveles totales</div>
          </div>
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5">
            <div className="text-2xl md:text-3xl font-black text-cyan-300">{totalCompletados}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Completados</div>
          </div>
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5 col-span-2 md:col-span-1">
            <div className="text-2xl md:text-3xl font-black text-yellow-300">⭐ {totalEstrellas}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-1">Total estrellas</div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-black text-white mb-5 tracking-wide flex items-center gap-2">
            <span>📚</span> Planes de estudio
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANET_DATA.map((p) => (
              <div
                key={p.nombre}
                className="liquid-glass liquid-glass-interactive rounded-3xl p-6"
                style={{
                  background: `linear-gradient(155deg, ${p.tint} 0%, rgba(14,18,34,0.44) 52%, rgba(8,10,22,0.56) 100%)`,
                  borderColor: `${p.accent}35`,
                }}
              >
                <div className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center text-2xl mb-4">
                  {p.icon}
                </div>
                <h3 className="text-xl font-black text-white tracking-wide">{p.nombre}</h3>
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em] mb-3 mt-0.5"
                  style={{ color: p.accent }}
                >
                  {p.materia}
                </p>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {p.niveles} niveles organizados en cursos progresivos.
                </p>
                <p className="text-xs text-slate-300/75 mt-3 leading-relaxed">
                  Cada nivel refuerza competencias específicas alineadas con el currículo de educación primaria.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-white mb-5 tracking-wide flex items-center gap-2">
            <span>👨‍🎓</span> Mis estudiantes
          </h2>
          {loading ? (
            <div className="liquid-glass rounded-3xl p-10 text-center">
              <p className="text-slate-300 text-sm font-medium">Cargando datos de los estudiantes...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-10 text-center">
              <p className="text-slate-200 text-base font-bold">No tienes estudiantes asignados.</p>
              <p className="text-slate-400 text-xs mt-1.5">
                Contacta al administrador para que te asigne estudiantes en el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 liquid-glass liquid-glass-interactive rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400/80 to-purple-600/80 border border-white/25 flex items-center justify-center text-white text-sm font-black uppercase shadow-[0_0_15px_rgba(0,245,255,0.25)]">
                      {s.nombre ? s.nombre.charAt(0) : 'E'}
                    </div>
                    <div>
                      <div className="text-base font-bold text-white leading-snug">{s.nombre}</div>
                      <div className="text-xs text-slate-300/80">
                        @{s.usuario} · {s.correo}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    {s.ultimaSesion && (
                      <span className="text-slate-300/80 px-2.5 py-1 rounded-lg bg-white/5">
                        Última sesión: {new Date(s.ultimaSesion).toLocaleDateString()}
                      </span>
                    )}
                    <span className="liquid-glass-pill border-cyan-400/35 text-cyan-200 px-3.5 py-1.5 rounded-xl font-medium">
                      Completados: <strong className="text-white font-black">{s.nivelesCompletados}</strong> / {totalNiveles}
                    </span>
                    <span className="liquid-glass-pill border-yellow-400/35 text-yellow-200 px-3.5 py-1.5 rounded-xl font-medium">
                      ⭐ <strong className="text-white font-black">{s.estrellasTotales}</strong> estrellas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
