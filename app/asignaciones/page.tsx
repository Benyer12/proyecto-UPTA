'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase'; // Ajusta la ruta si tu cliente está en otra carpeta

interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  role: string;
}

interface RelacionTutorEstudiante {
  id: number;
  tutor_id: string;
  estudiante_id: string;
  fecha_asignacion: string | null;
}

export default function AsignacionesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tutores, setTutores] = useState<Usuario[]>([]);
  const [estudiantes, setEstudiantes] = useState<Usuario[]>([]);
  const [relaciones, setRelaciones] = useState<RelacionTutorEstudiante[]>([]);
  const [tutorSeleccionadoId, setTutorSeleccionadoId] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    } else {
      cargarDatos();
    }
  }, [user, router, mounted]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // 1. Obtener tutores y estudiantes de la tabla 'usuarios'
      const { data: usuariosData, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, usuario, correo, role')
        .neq('role', 'admin')
        .order('nombre', { ascending: true });

      if (errUsuarios) throw errUsuarios;

      // 2. Obtener las relaciones actuales de 'tutor_estudiantes'
      const { data: relacionesData, error: errRelaciones } = await supabase
        .from('tutor_estudiantes')
        .select('id, tutor_id, estudiante_id, fecha_asignacion');

      if (errRelaciones) throw errRelaciones;

      if (usuariosData) {
        const listaTutores = usuariosData.filter(
          (u) => u.role === 'tutor' || u.role === 'docente'
        );
        const listaEstudiantes = usuariosData.filter(
          (u) => u.role === 'student'
        );

        setTutores(listaTutores);
        setEstudiantes(listaEstudiantes);

        if (listaTutores.length > 0 && !tutorSeleccionadoId) {
          setTutorSeleccionadoId(listaTutores[0].id);
        }
      }

      if (relacionesData) {
        setRelaciones(relacionesData);
      }
    } catch (error: any) {
      console.error('Error al cargar asignaciones:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsignacion = async (estudianteId: string) => {
    if (!tutorSeleccionadoId) return;
    setUpdatingId(estudianteId);

    const relacionActual = relaciones.find(
      (r) => r.estudiante_id === estudianteId
    );
    const yaEsDeEsteTutor =
      relacionActual && relacionActual.tutor_id === tutorSeleccionadoId;

    try {
      if (yaEsDeEsteTutor) {
        // Si ya está asignado a este tutor, eliminamos el registro en 'tutor_estudiantes'
        const { error } = await supabase
          .from('tutor_estudiantes')
          .delete()
          .eq('estudiante_id', estudianteId)
          .eq('tutor_id', tutorSeleccionadoId);

        if (error) throw error;

        setRelaciones((prev) =>
          prev.filter(
            (r) =>
              !(
                r.estudiante_id === estudianteId &&
                r.tutor_id === tutorSeleccionadoId
              )
          )
        );
      } else {
        // Si tenía otro tutor asignado, primero borramos la relación anterior
        if (relacionActual) {
          await supabase
            .from('tutor_estudiantes')
            .delete()
            .eq('estudiante_id', estudianteId);
        }

        const nuevaFecha = new Date().toISOString();

        // Insertamos la nueva relación en 'tutor_estudiantes'
        const { data: nuevaRelacion, error } = await supabase
          .from('tutor_estudiantes')
          .insert([
            {
              tutor_id: tutorSeleccionadoId,
              estudiante_id: estudianteId,
              fecha_asignacion: nuevaFecha,
            },
          ])
          .select('id, tutor_id, estudiante_id, fecha_asignacion')
          .single();

        if (error) throw error;

        if (nuevaRelacion) {
          setRelaciones((prev) => [
            ...prev.filter((r) => r.estudiante_id !== estudianteId),
            nuevaRelacion,
          ]);
        }
      }
    } catch (error: any) {
      console.error('Error al guardar en tutor_estudiantes:', error.message);
      alert('No se pudo actualizar la asignación en la base de datos.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!mounted || !user || user.role !== 'admin') return null;

  const tutorActivo = tutores.find((t) => t.id === tutorSeleccionadoId);

  return (
    <div className="min-h-screen bg-[#00000a] px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              Asignación de Tutores y Estudiantes
            </h1>
            <p className="text-sm text-slate-400">
              Selecciona un tutor y elige los estudiantes que estarán a su cargo.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            ← Volver al Panel Admin
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 bg-white/5 rounded-xl p-6 border border-white/10">
            Cargando tutores y estudiantes...
          </p>
        ) : tutores.length === 0 ? (
          <p className="text-sm text-yellow-400 bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
            No hay usuarios con el rol de Tutor. Ve al Panel Admin y asigna al menos un Tutor.
          </p>
        ) : (
          <>
            {/* 1. Selección de Tutor */}
            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                1. Selecciona un Tutor ({tutores.length})
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tutores.map((t) => {
                  const cantidadAsignados = relaciones.filter(
                    (r) => r.tutor_id === t.id
                  ).length;
                  const activo = t.id === tutorSeleccionadoId;

                  return (
                    <button
                      key={t.id}
                      onClick={() => setTutorSeleccionadoId(t.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        activo
                          ? 'bg-blue-600/20 border-blue-400 shadow-lg shadow-blue-950/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">
                          {t.nombre}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                      </div>
                      <div className="text-xs text-slate-400 mb-3">
                        @{t.usuario}
                      </div>
                      <div className="text-[11px] font-semibold text-blue-300 bg-blue-500/10 inline-block px-2.5 py-1 rounded">
                        {cantidadAsignados} estudiante
                        {cantidadAsignados === 1 ? '' : 's'} a cargo
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Lista de Estudiantes */}
            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                2. Estudiantes para {tutorActivo?.nombre} ({estudiantes.length})
              </h2>

              {estudiantes.length === 0 ? (
                <p className="text-sm text-slate-500 bg-white/5 rounded-xl p-6 border border-white/10">
                  No hay usuarios con el rol de estudiante registrados.
                </p>
              ) : (
                <div className="space-y-2">
                  {estudiantes.map((est) => {
                    const relacion = relaciones.find(
                      (r) => r.estudiante_id === est.id
                    );
                    const esDeEsteTutor =
                      relacion?.tutor_id === tutorSeleccionadoId;
                    const otroTutor = tutores.find(
                      (t) => t.id === relacion?.tutor_id
                    );
                    const isUpdating = updatingId === est.id;

                    return (
                      <div
                        key={est.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                          esDeEsteTutor
                            ? 'border-green-500/40 bg-green-950/15'
                            : 'border-white/5 bg-white/3'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              esDeEsteTutor
                                ? 'bg-green-400'
                                : otroTutor
                                ? 'bg-yellow-400'
                                : 'bg-slate-600'
                            }`}
                          />
                          <div>
                            <div className="text-sm text-white font-medium">
                              {est.nombre}
                              <span className="text-xs text-slate-400 font-normal ml-2">
                                @{est.usuario} · {est.correo}
                              </span>
                            </div>
                            <div className="text-xs mt-0.5">
                              {esDeEsteTutor ? (
                                <span className="text-green-400 font-medium">
                                  ✓ Asignado a {tutorActivo?.nombre}
                                  {relacion?.fecha_asignacion &&
                                    ` (${new Date(
                                      relacion.fecha_asignacion
                                    ).toLocaleDateString()})`}
                                </span>
                              ) : otroTutor ? (
                                <span className="text-yellow-400/90">
                                  Asignado actualmente a: {otroTutor.nombre}
                                </span>
                              ) : (
                                <span className="text-slate-500">
                                  Sin tutor asignado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAsignacion(est.id)}
                            disabled={isUpdating}
                            className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                              esDeEsteTutor
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                          >
                            {isUpdating
                              ? 'Guardando...'
                              : esDeEsteTutor
                              ? 'Quitar de este tutor'
                              : otroTutor
                              ? `Cambiar a ${tutorActivo?.nombre}`
                              : `Asignar a ${tutorActivo?.nombre}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}