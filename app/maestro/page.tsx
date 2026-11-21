'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';

const PLANET_DATA = [
  {
    nombre: 'Numérix',
    materia: 'Matemáticas',
    icon: 'numerix',
    niveles: 6,
    accent: '#67E8F9',
    border: 'rgba(103, 232, 249, 0.36)',
    tint: 'rgba(0, 245, 255, 0.08)',
  },
  {
    nombre: 'Letralia',
    materia: 'Lenguas',
    icon: 'letralia',
    niveles: 3,
    accent: '#D8B4FE',
    border: 'rgba(216, 180, 254, 0.36)',
    tint: 'rgba(191, 64, 255, 0.08)',
  },
  {
    nombre: 'Naturae',
    materia: 'Ciencias',
    icon: 'naturae',
    niveles: 3,
    accent: '#6EE7B7',
    border: 'rgba(110, 231, 183, 0.36)',
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

function PlanetDisciplineIcon({ kind, color }: { kind: string; color: string }) {
  if (kind === 'numerix') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" stroke={color} strokeWidth="1.7" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" stroke={color} strokeWidth="1.7" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" stroke={color} strokeWidth="1.7" />
        <path
          d="M17 14V20M14 17H20"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === 'letralia') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
        <path
          d="M4.5 5.5C4.5 4.67 5.17 4 6 4H10.5C11.33 4 12 4.67 12 5.5V19.5C12 18.67 11.33 18 10.5 18H6C5.17 18 4.5 18.67 4.5 19.5V5.5Z"
          stroke={color}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M19.5 5.5C19.5 4.67 18.83 4 18 4H13.5C12.67 4 12 4.67 12 5.5V19.5C12 18.67 12.67 18 13.5 18H18C18.83 18 19.5 18.67 19.5 19.5V5.5Z"
          stroke={color}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
      <path
        d="M5.5 18.5C5.5 11.5 10.5 5.5 18.5 5.5C18.5 13.5 13.5 18.5 5.5 18.5Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 18.5L13.5 10.5"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconStar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.4L12.35 7.16L17.6 7.92L13.8 11.62L14.7 16.85L10 14.38L5.3 16.85L6.2 11.62L2.4 7.92L7.65 7.16L10 2.4Z"
        fill="#FDE68A"
        stroke="#F59E0B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyClassroomIllustration() {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      className="w-44 h-24 mx-auto mb-3"
      role="img"
      aria-label="Ilustración de tripulación sin estudiantes asignados"
    >
      <ellipse
        cx="100"
        cy="66"
        rx="74"
        ry="22"
        stroke="#67E8F9"
        strokeOpacity="0.3"
        strokeWidth="1.4"
        strokeDasharray="4 5"
      />
      <circle cx="100" cy="48" r="14" stroke="#94A3B8" strokeWidth="1.8" fill="#0B1226" />
      <path
        d="M74 88C74 75.85 85.64 66 100 66C114.36 66 126 75.85 126 88"
        stroke="#94A3B8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="42" cy="52" r="3" fill="#67E8F9" fillOpacity="0.65" />
      <circle cx="160" cy="44" r="2.5" fill="#D8B4FE" fillOpacity="0.7" />
      <circle cx="150" cy="84" r="2" fill="#6EE7B7" fillOpacity="0.7" />
    </svg>
  );
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
    <div className="relative min-h-screen px-4 sm:px-6 py-10 sm:py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Encabezado Liquid Glass */}
        <section
          aria-labelledby="tutor-heading"
          className="rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#67E8F9]">
              <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="9,4.2 11.4,9 9,13.8 6.6,9" fill="currentColor" />
              </svg>
              <span>Panel Docente</span>
            </span>
            <h1
              id="tutor-heading"
              className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight"
            >
              Puente de Mando
            </h1>
            <p className="text-[#CBD5E1] text-sm sm:text-base max-w-2xl leading-relaxed">
              Bienvenido, <strong className="text-white">{user.name}</strong>. Supervisa el
              rendimiento, las estrellas obtenidas y el avance por nivel de tus estudiantes
              asignados.
            </p>
          </div>

          <div className="rounded-2xl liquid-glass-inset px-5 py-4 flex items-center gap-4 self-start lg:self-center shrink-0">
            <div className="w-11 h-11 rounded-xl bg-[#00F5FF]/15 border border-[#67E8F9]/35 flex items-center justify-center text-[#67E8F9]">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                <path
                  d="M16 19V17.5C16 15.57 14.43 14 12.5 14H7.5C5.57 14 4 15.57 4 17.5V19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M19.5 19V17.5C19.5 16.05 18.62 14.81 17.36 14.28"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M15.2 5.45C16.52 5.95 17.45 7.22 17.45 8.7C17.45 10.18 16.52 11.45 15.2 11.95"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Grupo asignado
              </div>
              <div className="text-lg font-black text-[#F8FAFC] tabular-nums">
                {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
              </div>
            </div>
          </div>
        </section>

        {/* Tarjetas de métricas globales Liquid Glass */}
        <section aria-label="Resumen de métricas del grupo">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Estudiantes
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-1.5 tabular-nums">
                {students.length}
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Planetas
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-1.5 tabular-nums">
                {PLANET_DATA.length}
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Niveles totales
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-1.5 tabular-nums">
                {totalNiveles}
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Completados
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#67E8F9] mt-1.5 tabular-nums">
                {totalCompletados}
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-5 col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                <IconStar className="w-3.5 h-3.5 shrink-0" />
                <span>Estrellas</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#FDE68A] mt-1.5 tabular-nums">
                {totalEstrellas}
              </div>
            </div>
          </div>
        </section>

        {/* Planes de estudio */}
        <section aria-labelledby="curriculum-heading" className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl liquid-glass-pill flex items-center justify-center text-[#67E8F9]">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                <path
                  d="M3.5 5C3.5 4.17 4.17 3.5 5 3.5H15C15.83 3.5 16.5 4.17 16.5 5V15.5L10 12.5L3.5 15.5V5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h2
                id="curriculum-heading"
                className="text-xl font-black text-[#F8FAFC] tracking-tight"
              >
                Planes de estudio
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Distribución actual de materias y niveles disponibles en la plataforma.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANET_DATA.map((p) => (
              <article
                key={p.nombre}
                className="liquid-glass rounded-3xl p-6 flex flex-col justify-between gap-4"
                style={{
                  background: `linear-gradient(155deg, ${p.tint} 0%, rgba(11, 16, 34, 0.72) 55%, rgba(8, 12, 26, 0.86) 100%)`,
                  borderColor: p.border,
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl liquid-glass-inset flex items-center justify-center"
                      style={{ borderColor: p.border }}
                    >
                      <PlanetDisciplineIcon kind={p.icon} color={p.accent} />
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full bg-[#080D1C]/85 border tabular-nums"
                      style={{ color: p.accent, borderColor: p.border }}
                    >
                      {p.niveles} niveles
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#F8FAFC] tracking-tight">{p.nombre}</h3>
                  <p
                    className="text-xs font-bold uppercase tracking-[0.18em] mt-0.5 mb-3"
                    style={{ color: p.accent }}
                  >
                    {p.materia}
                  </p>
                  <p className="text-sm text-[#CBD5E1] font-medium leading-relaxed">
                    {p.niveles} niveles organizados en cursos progresivos.
                  </p>
                </div>

                <p className="text-xs text-[#94A3B8] pt-3 border-t border-white/10 leading-relaxed">
                  Cada nivel refuerza competencias específicas alineadas con el currículo de
                  educación primaria.
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Mis estudiantes */}
        <section aria-labelledby="students-heading" className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl liquid-glass-pill flex items-center justify-center text-[#6EE7B7]">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                  <circle cx="10" cy="6.8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M4.2 16.5C4.2 13.7 6.8 11.8 10 11.8C13.2 11.8 15.8 13.7 15.8 16.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h2
                id="students-heading"
                className="text-xl font-black text-[#F8FAFC] tracking-tight"
              >
                Mis estudiantes
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="liquid-glass rounded-3xl p-10 text-center" role="status">
              <p className="text-[#CBD5E1] text-sm font-medium">
                Cargando datos de los estudiantes...
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="liquid-glass liquid-glass-panel rounded-3xl p-10 sm:p-12 text-center">
              <EmptyClassroomIllustration />
              <p className="text-[#F8FAFC] text-base font-bold">
                No tienes estudiantes asignados.
              </p>
              <p className="text-[#94A3B8] text-sm mt-1.5 max-w-md mx-auto">
                Contacta al administrador para que te asigne estudiantes en el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {students.map((s) => {
                const pct =
                  totalNiveles > 0
                    ? Math.min(100, Math.round((s.nivelesCompletados / totalNiveles) * 100))
                    : 0;

                return (
                  <div
                    key={s.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 liquid-glass rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#0B152E] border border-[#67E8F9]/35 flex items-center justify-center text-[#F8FAFC] text-sm font-black uppercase shrink-0">
                        {s.nombre ? s.nombre.charAt(0) : 'E'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-[#F8FAFC] leading-snug truncate">
                          {s.nombre}
                        </div>
                        <div className="text-xs text-[#CBD5E1] truncate">
                          @{s.usuario} · {s.correo}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="w-28 hidden sm:block">
                        <div className="flex justify-between text-[11px] font-semibold text-[#94A3B8] mb-1">
                          <span>Avance</span>
                          <span className="tabular-nums text-[#F8FAFC]">{pct}%</span>
                        </div>
                        <div
                          role="progressbar"
                          aria-label={`Avance de ${s.nombre}`}
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
                        >
                          <div
                            className="h-full rounded-full bg-[#67E8F9]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {s.ultimaSesion && (
                        <span className="text-[#CBD5E1] px-3 py-1.5 rounded-xl bg-[#080D1C]/80 border border-white/10">
                          Última sesión: {new Date(s.ultimaSesion).toLocaleDateString()}
                        </span>
                      )}

                      <span className="liquid-glass-inset border-[#67E8F9]/35 text-[#67E8F9] px-3.5 py-1.5 rounded-xl font-semibold tabular-nums">
                        Completados:{' '}
                        <strong className="text-[#F8FAFC] font-black">
                          {s.nivelesCompletados}
                        </strong>{' '}
                        / {totalNiveles}
                      </span>

                      <span className="inline-flex items-center gap-1.5 liquid-glass-inset border-amber-300/35 text-[#FDE68A] px-3.5 py-1.5 rounded-xl font-semibold tabular-nums">
                        <IconStar className="w-3.5 h-3.5 shrink-0" />
                        <strong className="text-[#F8FAFC] font-black">{s.estrellasTotales}</strong>
                        <span>estrellas</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
