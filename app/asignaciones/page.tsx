'use client';

import type { CSSProperties } from 'react';
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

function EmptyAssignmentIllustration({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 190 110"
      fill="none"
      className="w-40 h-24 mx-auto mb-3"
      role="img"
      aria-label={label}
    >
      <ellipse
        cx="95"
        cy="62"
        rx="70"
        ry="20"
        stroke="#67E8F9"
        strokeOpacity="0.3"
        strokeWidth="1.4"
        strokeDasharray="4 5"
      />
      <circle cx="66" cy="54" r="14" fill="#0B1226" stroke="#67E8F9" strokeOpacity="0.65" strokeWidth="1.6" />
      <circle cx="124" cy="54" r="14" fill="#0B1226" stroke="#6EE7B7" strokeOpacity="0.65" strokeWidth="1.6" />
      <line
        x1="80"
        y1="54"
        x2="110"
        y2="54"
        stroke="#94A3B8"
        strokeWidth="1.6"
        strokeDasharray="3 4"
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
    <div className="relative min-h-screen px-4 sm:px-6 py-10 sm:py-12">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Encabezado Liquid Glass */}
        <section
          aria-labelledby="assignments-heading"
          className="rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5"
        >
          <div className="space-y-2">
            <LiquidGlass
              blur={4}
              refraction={10}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[#67E8F9]"
            >
              <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
                <circle cx="5" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="13" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7.5 9H10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>Gestión Académica</span>
            </LiquidGlass>
            <h1
              id="assignments-heading"
              className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight"
            >
              Asignación de Tutores y Estudiantes
            </h1>
            <p className="text-sm text-[#CBD5E1] max-w-xl leading-relaxed">
              Selecciona un tutor y elige los estudiantes que estarán a su cargo. Los estudiantes
              asignados al tutor seleccionado aparecen primero.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 self-start md:self-center shrink-0">
            <div className="rounded-2xl liquid-glass-inset px-4 py-3 text-center min-w-[96px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#67E8F9]">
                Tutores
              </div>
              <div className="text-2xl font-black text-[#F8FAFC] mt-0.5 tabular-nums">
                {tutores.length}
              </div>
            </div>
            <div className="rounded-2xl liquid-glass-inset px-4 py-3 text-center min-w-[96px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6EE7B7]">
                Vínculos
              </div>
              <div className="text-2xl font-black text-[#F8FAFC] mt-0.5 tabular-nums">
                {relaciones.length}
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="liquid-glass rounded-3xl p-8 text-center" role="status">
            <p className="text-sm text-[#CBD5E1] font-medium">
              Cargando tutores y estudiantes...
            </p>
          </div>
        ) : tutores.length === 0 ? (
          <div className="liquid-glass liquid-glass-panel rounded-3xl p-10 text-center border-amber-300/35">
            <EmptyAssignmentIllustration label="Ilustración sin tutores registrados" />
            <p className="text-sm sm:text-base text-[#FDE68A] font-bold">
              No hay usuarios con el rol de Tutor.
            </p>
            <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1.5 max-w-md mx-auto">
              Ve al Panel de Administración y asigna al menos un Tutor para vincular estudiantes.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Selección de Tutor */}
            <section aria-labelledby="select-tutor-heading" className="space-y-4">
              <h2
                id="select-tutor-heading"
                className="text-lg font-black text-[#F8FAFC] tracking-tight tabular-nums"
              >
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
                      type="button"
                      key={t.id}
                      aria-pressed={activo}
                      onClick={() => setTutorSeleccionadoId(t.id)}
                      className={`text-left p-5 rounded-2xl liquid-glass liquid-glass-interactive cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9] ${
                        activo
                          ? 'border-[#67E8F9]/70 shadow-[0_0_26px_rgba(0,245,255,0.2)]'
                          : 'hover:border-white/25'
                      }`}
                      style={
                        activo
                          ? ({
                              '--glass-caustic': 'rgba(0, 245, 255, 0.28)',
                              '--glass-tint': 'rgba(103, 232, 249, 0.22)',
                            } as CSSProperties)
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-base font-bold text-[#F8FAFC] truncate">
                          {t.nombre}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            activo
                              ? 'bg-[#67E8F9] shadow-[0_0_10px_rgba(103,232,249,0.9)]'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div className="text-xs text-[#CBD5E1] mb-3.5 truncate">
                        @{t.usuario}
                      </div>
                      <div className="text-xs font-bold text-[#67E8F9] liquid-glass-inset inline-block px-3 py-1.5 rounded-lg tabular-nums">
                        {cantidadAsignados} estudiante
                        {cantidadAsignados === 1 ? '' : 's'} a cargo
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Lista de Estudiantes */}
            <section aria-labelledby="students-for-tutor-heading" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h2
                  id="students-for-tutor-heading"
                  className="text-lg font-black text-[#F8FAFC] tracking-tight tabular-nums"
                >
                  2. Estudiantes para {tutorActivo?.nombre} ({estudiantes.length})
                </h2>
                <span className="text-xs font-medium text-[#94A3B8]">
                  Asignados a este tutor primero
                </span>
              </div>

              {estudiantes.length === 0 ? (
                <div className="liquid-glass liquid-glass-panel rounded-3xl p-10 text-center">
                  <EmptyAssignmentIllustration label="Ilustración sin estudiantes registrados" />
                  <p className="text-sm text-[#CBD5E1] font-medium">
                    No hay usuarios con el rol de estudiante registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl liquid-glass liquid-glass-interactive"
                        style={
                          esDeEsteTutor
                            ? ({
                                '--glass-caustic': 'rgba(16, 185, 129, 0.26)',
                                '--glass-tint': 'rgba(110, 231, 183, 0.18)',
                                borderColor: 'rgba(110, 231, 183, 0.48)',
                              } as CSSProperties)
                            : undefined
                        }
                      >
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <span
                            aria-hidden="true"
                            className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 sm:mt-0 ${
                              esDeEsteTutor
                                ? 'bg-[#6EE7B7] shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                                : otroTutor
                                  ? 'bg-[#FDE68A] shadow-[0_0_10px_rgba(250,204,21,0.75)]'
                                  : 'bg-slate-500'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-sm sm:text-base text-[#F8FAFC] font-bold flex flex-wrap items-baseline gap-x-2">
                              <span>{est.nombre}</span>
                              <span className="text-xs text-[#CBD5E1] font-normal">
                                @{est.usuario} · {est.correo}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              {esDeEsteTutor ? (
                                <span className="inline-flex items-center gap-1.5 text-[#6EE7B7] font-semibold">
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
                                <span className="text-[#FDE68A] font-medium">
                                  Asignado actualmente a: {otroTutor.nombre}
                                </span>
                              ) : (
                                <span className="text-[#94A3B8]">
                                  Sin tutor asignado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleAsignacion(est.id)}
                            disabled={isUpdating}
                            className={`min-h-[44px] text-xs px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9] ${
                              esDeEsteTutor
                                ? 'bg-rose-500/20 hover:bg-rose-500/35 text-rose-100 border border-rose-400/50 backdrop-blur-md'
                                : 'liquid-glass-btn text-[#F8FAFC]'
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
