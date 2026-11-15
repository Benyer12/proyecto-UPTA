'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase'; // Verifica que coincida con la ruta de tu cliente Supabase

const PLANET_DATA = [
  {
    nombre: 'Numérix',
    materia: 'Matemáticas',
    icon: '🔢',
    niveles: 6,
    color: 'border-cyan-500/30',
    bg: 'from-cyan-950/20',
  },
  {
    nombre: 'Letralia',
    materia: 'Lenguas',
    icon: '📖',
    niveles: 3,
    color: 'border-purple-500/30',
    bg: 'from-purple-950/20',
  },
  {
    nombre: 'Naturae',
    materia: 'Ciencias',
    icon: '🌿',
    niveles: 3,
    color: 'border-green-500/30',
    bg: 'from-green-950/20',
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
      // 1. Consultar en 'tutor_estudiantes' los IDs de estudiantes asignados a este tutor
      const { data: asignaciones, error: errAsig } = await supabase
        .from('tutor_estudiantes')
        .select('estudiante_id')
        .eq('tutor_id', String(user.id));

      if (errAsig) throw errAsig;

      const idsAsignados = (asignaciones || []).map((a) => a.estudiante_id);

      // 2. Contar cuántos niveles existen en la tabla 'niveles'
      const { count: conteoNiveles } = await supabase
        .from('niveles')
        .select('*', { count: 'exact', head: true });

      if (conteoNiveles && conteoNiveles > 0) {
        setTotalNiveles(conteoNiveles);
      }

      // Si el tutor aún no tiene estudiantes asignados, dejamos las listas en 0
      if (idsAsignados.length === 0) {
        setStudents([]);
        setTotalCompletados(0);
        setTotalEstrellas(0);
        setLoading(false);
        return;
      }

      // 3. Obtener de 'usuarios' únicamente los estudiantes asignados con rol 'student'
      const { data: usuariosData, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, usuario, correo, role')
        .eq('role', 'student')
        .in('id', idsAsignados)
        .order('nombre', { ascending: true });

      if (errUsuarios) throw errUsuarios;

      // 4. Obtener el progreso de esos estudiantes en 'progreso_usuario'
      const { data: progresoData, error: errProgreso } = await supabase
        .from('progreso_usuario')
        .select('id, usuario_id, nivel_id, completado, estrellas, ultima_sesion')
        .in('usuario_id', idsAsignados);

      if (errProgreso) throw errProgreso;

      const registrosProgreso = (progresoData || []) as ProgresoRegistro[];

      // 5. Cruzar progreso y estrellas de cada estudiante asignado
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
    <div className="min-h-screen bg-[#00000a] px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            🚀 Puente de Mando
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Bienvenido, {user.name}. Aquí puedes supervisar el progreso de tus estudiantes.
          </p>
        </div>

        {/* Tarjetas de métricas globales */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{students.length}</div>
            <div className="text-xs text-slate-400">Estudiantes</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{PLANET_DATA.length}</div>
            <div className="text-xs text-slate-400">Planetas</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{totalNiveles}</div>
            <div className="text-xs text-slate-400">Niveles totales</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-cyan-400">{totalCompletados}</div>
            <div className="text-xs text-slate-400">Completados</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">⭐ {totalEstrellas}</div>
            <div className="text-xs text-slate-400">Total de estrellas</div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">📚 Planes de estudio</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANET_DATA.map((p) => (
              <div
                key={p.nombre}
                className={`bg-gradient-to-br ${p.bg} to-transparent border ${p.color} rounded-xl p-6`}
              >
                <div className="text-3xl mb-2">{p.icon}</div>
                <h3 className="text-lg font-bold text-white">{p.nombre}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                  {p.materia}
                </p>
                <p className="text-sm text-slate-300">
                  {p.niveles} niveles organizados en cursos progresivos.
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  Cada nivel refuerza competencias específicas alineadas con el currículo de educación primaria.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">👨‍🎓 Mis estudiantes</h2>
          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm">Cargando datos de los estudiantes...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm">No tienes estudiantes asignados.</p>
              <p className="text-slate-600 text-xs mt-1">
                Contacta al administrador para que te asigne estudiantes.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {s.nombre ? s.nombre.charAt(0) : 'E'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{s.nombre}</div>
                      <div className="text-xs text-slate-400">
                        @{s.usuario} · {s.correo}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {s.ultimaSesion && (
                      <span className="text-slate-500">
                        Última sesión: {new Date(s.ultimaSesion).toLocaleDateString()}
                      </span>
                    )}
                    <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg">
                      Completados: <strong>{s.nivelesCompletados}</strong> / {totalNiveles}
                    </span>
                    <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-3 py-1 rounded-lg">
                      ⭐ <strong>{s.estrellasTotales}</strong> estrellas
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