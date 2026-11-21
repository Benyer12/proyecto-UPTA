'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';

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

function IconCheckCircle({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.2 8.2L7.1 10.1L10.9 6.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

  const estudiantesOrdenados = [...estudiantes].sort((a, b) => {
    const aAsignado = relaciones.some(
      (r) => r.estudiante_id === a.id && r.tutor_id === tutorSeleccionadoId
    );
    const bAsignado = relaciones.some(
      (r) => r.estudiante_id === b.id && r.tutor_id === tutorSeleccionadoId
    );
    if (aAsignado !== bAsignado) return aAsignado ? -1 : 1;
    return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
  });

  return (
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Cabecera abierta */}
        <section
          aria-labelledby="assignments-heading"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-white/10"
        >
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
              Gestión académica · Vínculos
            </div>
            <h1
              id="assignments-heading"
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              Asignaciones de Tutores
            </h1>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed">
              Elige un tutor en el panel izquierdo y administra los estudiantes a su cargo en el
              panel derecho. Los asignados aparecen primero.
            </p>
          </div>

          <LiquidGlass
            blur={6}
            refraction={12}
            className="rounded-2xl bg-[#070c1b]/[0.76] border-white/[0.12] self-start md:self-auto shrink-0"
          >
            <div className="grid grid-cols-3 divide-x divide-white/10">
              <div className="px-4 py-3 text-center">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#67E8F9]">
                  Tutores
                </div>
                <div className="text-lg font-bold text-white tabular-nums">{tutores.length}</div>
              </div>
              <div className="px-4 py-3 text-center">
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                  Estudiantes
                </div>
                <div className="text-lg font-bold text-white tabular-nums">{estudiantes.length}</div>
              </div>
              <div className="px-4 py-3 text-center">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#6EE7B7]">
                  Vínculos
                </div>
                <div className="text-lg font-bold text-white tabular-nums">{relaciones.length}</div>
              </div>
            </div>
          </LiquidGlass>
        </section>

        {loading ? (
          <LiquidGlass blur={3} refraction={10} className="rounded-3xl bg-white/[0.03] p-12 text-center">
            <p className="text-sm text-white/55" role="status">
              Cargando tutores y estudiantes...
            </p>
          </LiquidGlass>
        ) : tutores.length === 0 ? (
          <LiquidGlass blur={3} refraction={10} className="rounded-3xl bg-white/[0.03] p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-[#FDE68A]">
              No hay usuarios con el rol de Tutor.
            </p>
            <p className="text-xs text-white/55">
              Ve al Panel de Administración y asigna al menos un Tutor para vincular estudiantes.
            </p>
          </LiquidGlass>
        ) : (
          /* Nuevo diseño maestro-detalle en 2 columnas cristalinas */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Panel Izquierdo: Lista de Tutores */}
            <section aria-labelledby="select-tutor-heading" className="lg:col-span-4">
              <LiquidGlass
                blur={8}
                refraction={12}
                bezel={0.22}
                className="rounded-3xl bg-[#070c1b]/[0.78] border-white/[0.12]"
              >
                <div className="px-5 py-4 border-b border-white/[0.08] bg-white/[0.02]">
                  <h2
                    id="select-tutor-heading"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 tabular-nums"
                  >
                    1. Tutores ({tutores.length})
                  </h2>
                </div>

                <div className="divide-y divide-white/[0.07]">
                  {tutores.map((t) => {
                    const cantidadAsignados = relaciones.filter(
                      (r) => r.tutor_id === t.id
                    ).length;
                    const activo = t.id === tutorSeleccionadoId;

                    return (
                      <button
                        type="button"
                        key={t.id}
                        aria-pressed={activo}
                        onClick={() => setTutorSeleccionadoId(t.id)}
                        className={`w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          activo ? 'bg-white/[0.09]' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                activo ? 'bg-[#67E8F9]' : 'bg-white/25'
                              }`}
                            />
                            <span className="text-sm font-semibold text-white truncate">
                              {t.nombre}
                            </span>
                          </div>
                          <div className="text-xs text-white/45 mt-0.5 pl-4 truncate">
                            @{t.usuario}
                          </div>
                        </div>

                        <span className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-white/12 bg-white/[0.04] text-white/80 shrink-0 tabular-nums">
                          {cantidadAsignados}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </LiquidGlass>
            </section>

            {/* Panel Derecho: Estudiantes para el tutor seleccionado */}
            <section aria-labelledby="students-for-tutor-heading" className="lg:col-span-8">
              <LiquidGlass
                blur={8}
                refraction={12}
                bezel={0.22}
                className="rounded-3xl bg-[#070c1b]/[0.78] border-white/[0.12]"
              >
                <div className="px-5 sm:px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between gap-2">
                  <h2
                    id="students-for-tutor-heading"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/65 tabular-nums truncate"
                  >
                    2. Estudiantes para {tutorActivo?.nombre} ({estudiantes.length})
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#6EE7B7] hidden sm:inline">
                    Asignados primero
                  </span>
                </div>

                {estudiantes.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-white/55">
                      No hay usuarios con el rol de estudiante registrados.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.07]">
                    {estudiantesOrdenados.map((est) => {
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
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 transition-colors ${
                            esDeEsteTutor ? 'bg-emerald-500/[0.06]' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                aria-hidden="true"
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  esDeEsteTutor
                                    ? 'bg-[#6EE7B7]'
                                    : otroTutor
                                      ? 'bg-[#FDE68A]'
                                      : 'bg-white/25'
                                }`}
                              />
                              <span className="text-sm font-semibold text-white">
                                {est.nombre}
                              </span>
                              <span className="text-xs text-white/45">
                                @{est.usuario}
                              </span>
                            </div>

                            <div className="text-xs mt-1 pl-4">
                              {esDeEsteTutor ? (
                                <span className="inline-flex items-center gap-1.5 text-[#6EE7B7] font-medium">
                                  <IconCheckCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    Asignado a {tutorActivo?.nombre}
                                    {relacion?.fecha_asignacion &&
                                      ` (${new Date(
                                        relacion.fecha_asignacion
                                      ).toLocaleDateString()})`}
                                  </span>
                                </span>
                              ) : otroTutor ? (
                                <span className="text-[#FDE68A]/90">
                                  Asignado actualmente a: {otroTutor.nombre}
                                </span>
                              ) : (
                                <span className="text-white/40">Sin tutor asignado</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleAsignacion(est.id)}
                              disabled={isUpdating}
                              className={`min-h-[38px] text-xs px-4 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50 cursor-pointer ${
                                esDeEsteTutor
                                  ? 'border border-rose-400/35 bg-rose-500/12 hover:bg-rose-500/25 text-rose-200'
                                  : 'bg-white hover:bg-white/90 text-black font-semibold'
                              }`}
                            >
                              {isUpdating
                                ? 'Guardando...'
                                : esDeEsteTutor
                                  ? 'Quitar'
                                  : otroTutor
                                    ? 'Transferir aquí'
                                    : 'Asignar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </LiquidGlass>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
