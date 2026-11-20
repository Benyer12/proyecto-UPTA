'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';

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
      const { data: usuariosData, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, usuario, correo, role')
        .neq('role', 'admin')
        .order('nombre', { ascending: true });

      if (errUsuarios) throw errUsuarios;

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
        if (relacionActual) {
          await supabase
            .from('tutor_estudiantes')
            .delete()
            .eq('estudiante_id', estudianteId);
        }

        const nuevaFecha = new Date().toISOString();

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
    <div className="relative min-h-screen px-6 py-12">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Encabezado Liquid Glass */}
        <div className="rounded-3xl liquid-glass liquid-glass-panel p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-2">
              <span>✦</span> Gestión Académica
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Asignación de Tutores y Estudiantes
            </h1>
            <p className="text-sm text-slate-300/90 mt-1">
              Selecciona un tutor y elige los estudiantes que estarán a su cargo.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center liquid-glass-pill hover:bg-white/15 text-white text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-2xl transition-all whitespace-nowrap"
          >
            ← Volver al Panel Admin
          </Link>
        </div>

        {loading ? (
          <div className="liquid-glass rounded-3xl p-8 text-center">
            <p className="text-sm text-slate-300 font-medium">
              Cargando tutores y estudiantes...
            </p>
          </div>
        ) : tutores.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-8 text-center border-yellow-400/30">
            <p className="text-sm text-yellow-300 font-semibold">
              No hay usuarios con el rol de Tutor. Ve al Panel Admin y asigna al menos un Tutor.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Selección de Tutor */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-white tracking-wide">
                1. Selecciona un Tutor ({tutores.length})
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tutores.map((t) => {
                  const cantidadAsignados = relaciones.filter(
                    (r) => r.tutor_id === t.id
                  ).length;
                  const activo = t.id === tutorSeleccionadoId;

                  return (
                    <button
                      key={t.id}
                      onClick={() => setTutorSeleccionadoId(t.id)}
                      className={`text-left p-5 rounded-2xl liquid-glass liquid-glass-interactive cursor-pointer ${
                        activo
                          ? 'border-cyan-400/70 shadow-[0_0_28px_rgba(0,245,255,0.22)]'
                          : ''
                      }`}
                      style={
                        activo
                          ? {
                              background:
                                'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(59, 130, 246, 0.1) 100%)',
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-bold text-white">
                          {t.nombre}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            activo
                              ? 'bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]'
                              : 'bg-blue-400/60'
                          }`}
                        />
                      </div>
                      <div className="text-xs text-slate-300/80 mb-3.5">
                        @{t.usuario}
                      </div>
                      <div className="text-[11px] font-bold text-cyan-200 liquid-glass-pill inline-block px-3 py-1 rounded-lg">
                        {cantidadAsignados} estudiante
                        {cantidadAsignados === 1 ? '' : 's'} a cargo
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Lista de Estudiantes */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-white tracking-wide">
                2. Estudiantes para {tutorActivo?.nombre} ({estudiantes.length})
              </h2>

              {estudiantes.length === 0 ? (
                <div className="liquid-glass rounded-3xl p-8 text-center">
                  <p className="text-sm text-slate-400 font-medium">
                    No hay usuarios con el rol de estudiante registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl liquid-glass liquid-glass-interactive"
                        style={
                          esDeEsteTutor
                            ? {
                                background:
                                  'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(255, 255, 255, 0.03) 100%)',
                                borderColor: 'rgba(52, 211, 153, 0.45)',
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              esDeEsteTutor
                                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                                : otroTutor
                                ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                                : 'bg-slate-500'
                            }`}
                          />
                          <div>
                            <div className="text-sm sm:text-base text-white font-bold">
                              {est.nombre}
                              <span className="text-xs text-slate-300/80 font-normal ml-2">
                                @{est.usuario} · {est.correo}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              {esDeEsteTutor ? (
                                <span className="text-emerald-300 font-semibold">
                                  ✓ Asignado a {tutorActivo?.nombre}
                                  {relacion?.fecha_asignacion &&
                                    ` (${new Date(
                                      relacion.fecha_asignacion
                                    ).toLocaleDateString()})`}
                                </span>
                              ) : otroTutor ? (
                                <span className="text-yellow-300/90 font-medium">
                                  Asignado actualmente a: {otroTutor.nombre}
                                </span>
                              ) : (
                                <span className="text-slate-400">
                                  Sin tutor asignado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-center">
                          <button
                            onClick={() => toggleAsignacion(est.id)}
                            disabled={isUpdating}
                            className={`text-xs px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer ${
                              esDeEsteTutor
                                ? 'bg-red-500/20 hover:bg-red-500/35 text-red-200 border border-red-400/40 backdrop-blur-md'
                                : 'liquid-glass-btn text-white'
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
