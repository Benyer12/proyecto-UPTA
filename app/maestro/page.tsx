'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import {
  obtenerDatosMaestroHibrido,
  type LocalProgresoRow,
} from '../../lib/offline-sync';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import ThemeTogglePill from '../../components/ThemeTogglePill';
import RoleAvatar from '../../components/RoleAvatar';
import GlassTooltip from '../../components/ui/GlassTooltip';
import { AdminPanelSkeleton, SkeletonBar, UserListSkeleton } from '../../components/ui/PanelSkeletons';

const PLANET_DATA = [
  {
    nombre: 'Numérix',
    materia: 'Matemáticas',
    niveles: 6,
    accent: '#67E8F9',
  },
  {
    nombre: 'Letralia',
    materia: 'Lenguas',
    niveles: 3,
    accent: '#D8B4FE',
  },
  {
    nombre: 'Naturae',
    materia: 'Ciencias',
    niveles: 3,
    accent: '#6EE7B7',
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

function IconStar({ className = 'w-3.5 h-3.5' }: { className?: string }) {
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
      const {
        totalNiveles: totalNivelesBd,
        estudiantes: usuariosData,
        progreso: registrosProgreso,
      } = await obtenerDatosMaestroHibrido(String(user.id));

      if (totalNivelesBd > 0) {
        setTotalNiveles(totalNivelesBd);
      }

      if (usuariosData.length === 0) {
        setStudents([]);
        setTotalCompletados(0);
        setTotalEstrellas(0);
        setLoading(false);
        return;
      }

      const listaEstudiantes: EstudianteConProgreso[] = usuariosData.map((est) => {
        const misRegistros = (registrosProgreso as LocalProgresoRow[]).filter(
          (p) => p.usuario_id === est.id,
        );

        const nivelesUnicosCompletados = new Set(
          misRegistros.filter((p) => p.completado === true).map((p) => p.nivel_id),
        );

        const estrellasTotales = misRegistros.reduce(
          (acc, p) => acc + (Number(p.estrellas) || 0),
          0,
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
        listaEstudiantes.reduce((acc, s) => acc + s.nivelesCompletados, 0),
      );
      setTotalEstrellas(
        listaEstudiantes.reduce((acc, s) => acc + s.estrellasTotales, 0),
      );
    } catch (error) {
      console.error('Error al cargar datos del panel de tutor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <AdminPanelSkeleton label="Cargando panel docente..." />;
  if (!user || (user.role !== 'tutor' && user.role !== 'docente')) return null;

  return (
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Cabecera abierta sobre las partículas */}
        <section
          aria-labelledby="tutor-heading"
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 border-b border-white/10"
        >
          <div className="flex items-start gap-4">
            <RoleAvatar role="tutor" name={user.name} size={56} className="mt-1" />
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#67E8F9]/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#67E8F9] shadow-[0_0_20px_-6px_rgba(103,232,249,0.4)]">
                <span className="h-2 w-2 rounded-full bg-[#67E8F9]" aria-hidden="true" />
                Panel Docente · Seguimiento
              </div>
              <h1
                id="tutor-heading"
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              >
                Puente de Mando
              </h1>
              <p className="text-sm text-white/60 max-w-xl leading-relaxed">
                Bienvenido, <strong className="text-white font-semibold">{user.name}</strong>.
                Supervisa el rendimiento, estrellas y niveles completados de tu grupo.
              </p>
            </div>
          </div>

          {/* Selector de tema + Tira de métricas cristalina */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start lg:self-auto shrink-0">
            <ThemeTogglePill showLabels />

            <LiquidGlass
              blur={2}
              refraction={20}
              bezel={0.36}
              saturation={1.65}
              className="rounded-2xl bg-[#050a18]/[0.38] border-white/[0.15] shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
            >
              <div className="grid grid-cols-4 divide-x divide-white/10">
                <div className="px-4 py-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                    Estudiantes
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums flex justify-center mt-0.5">
                    {loading ? <SkeletonBar className="h-5 w-8 rounded-md" /> : students.length}
                  </div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                    Niveles
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums flex justify-center mt-0.5">
                    {loading ? <SkeletonBar className="h-5 w-8 rounded-md" /> : totalNiveles}
                  </div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#67E8F9]">
                    Completados
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums flex justify-center mt-0.5">
                    {loading ? <SkeletonBar className="h-5 w-8 rounded-md" /> : totalCompletados}
                  </div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#FDE68A]">
                    Estrellas
                  </div>
                  <div className="text-lg font-bold text-[#FDE68A] tabular-nums flex justify-center mt-0.5">
                    {loading ? <SkeletonBar className="h-5 w-10 rounded-md" /> : totalEstrellas}
                  </div>
                </div>
              </div>
            </LiquidGlass>
          </div>
        </section>

        {/* Hoja cristalina principal: Mis estudiantes (estilo esmerilado suave como tarjetas de currículo) */}
        <section aria-labelledby="students-heading">
          <LiquidGlass
            blur={5}
            refraction={8}
            bezel={0.2}
            saturation={1.12}
            className="rounded-2xl bg-white/[0.03] border-white/[0.10] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.65)]"
            style={
              {
                '--liquid-glass-rim-uniform': 'rgba(255, 255, 255, 0.13)',
              } as CSSProperties
            }
          >
            <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <h2
                id="students-heading"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/65"
              >
                Mis estudiantes ({students.length})
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 hidden sm:inline">
                Progreso sincronizado
              </span>
            </div>

            {loading ? (
              <UserListSkeleton rows={4} showProgress actionButtons={1} />
            ) : students.length === 0 ? (
              <div className="p-12 text-center space-y-1.5">
                <p className="text-sm font-semibold text-white">No tienes estudiantes asignados.</p>
                <p className="text-xs text-white/50">
                  Contacta al administrador para que te asigne estudiantes en el sistema.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.07]">
                {students.map((s) => {
                  const pct =
                    totalNiveles > 0
                      ? Math.min(100, Math.round((s.nivelesCompletados / totalNiveles) * 100))
                      : 0;

                  return (
                    <div
                      key={s.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <RoleAvatar role="student" name={s.nombre || s.usuario} size={44} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{s.nombre}</div>
                          <div className="text-xs text-white/50 truncate">
                            @{s.usuario} · {s.correo}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="w-32 hidden sm:block">
                          <div className="flex justify-between font-mono text-[10px] text-white/50 mb-1">
                            <span>Avance</span>
                            <span className="text-white/80 tabular-nums">{pct}%</span>
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
                          <span className="font-mono text-[11px] text-white/50">
                            {new Date(s.ultimaSesion).toLocaleDateString()}
                          </span>
                        )}

                        <GlassTooltip label={`${s.nivelesCompletados} de ${totalNiveles} niveles completados`} placement="top">
                          <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs text-white/80 tabular-nums">
                            {s.nivelesCompletados}/{totalNiveles} niveles
                          </span>
                        </GlassTooltip>

                        <GlassTooltip label={`Estrellas acumuladas por ${s.nombre}`} placement="top">
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/[0.08] px-3 py-1 text-xs font-semibold text-[#FDE68A] tabular-nums">
                            <IconStar className="w-3.5 h-3.5" />
                            <span>{s.estrellasTotales}</span>
                          </span>
                        </GlassTooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </LiquidGlass>
        </section>

        {/* Referencia de planes de estudio en franja minimalista */}
        <section aria-labelledby="curriculum-heading" className="space-y-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
            Planes de estudio activos
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANET_DATA.map((p) => (
              <div
                key={p.nombre}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-[4px] p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: p.accent }}
                  >
                    {p.materia}
                  </span>
                  <span className="font-mono text-[11px] text-white/55 tabular-nums">
                    {p.niveles} niveles
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">{p.nombre}</h3>
                <p className="text-xs text-white/55 leading-relaxed">
                  Cursos progresivos alineados con el currículo de educación primaria.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
