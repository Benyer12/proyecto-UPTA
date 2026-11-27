'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/auth-store';
import {
  obtenerDatosMaestroHibrido,
  type LocalProgresoRow,
} from '../../../lib/offline-sync';
import RoleAvatar from '../../../components/RoleAvatar';
import TeacherReportIACard, {
  type EstudianteParaReporte,
} from '../../../components/TeacherReportIACard';
import GlassTooltip from '../../../components/ui/GlassTooltip';
import { AdminPanelSkeleton, TutorIASkeleton } from '../../../components/ui/PanelSkeletons';
import LottieAnimation from '../../../components/ui/LottieAnimation';

const TOTAL_NIVELES_DEFAULT = 12;

export default function MaestroIAPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<EstudianteParaReporte[]>([]);
  const [totalNiveles, setTotalNiveles] = useState<number>(TOTAL_NIVELES_DEFAULT);

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
      cargarDatosIA();
    }
  }, [user, router, mounted]);

  const cargarDatosIA = async () => {
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

      const listaEstudiantes: EstudianteParaReporte[] = usuariosData.map((est) => {
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
    } catch (error) {
      console.error('Error al cargar datos para Copiloto IA:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <AdminPanelSkeleton label="Cargando Copiloto IA..." />;
  if (!user || (user.role !== 'tutor' && user.role !== 'docente')) return null;

  return (
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <section
          aria-labelledby="tutor-ia-heading"
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 border-b border-white/10"
        >
          <div className="flex items-start gap-4">
            <RoleAvatar role="tutor" name={user.name} size={56} className="mt-1" />
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8B4FE]/35 bg-[#D8B4FE]/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#E9D5FF] shadow-[0_0_20px_-6px_rgba(216,180,254,0.4)]">
                <LottieAnimation preset="sparkle" size={18} />
                <span>Copiloto IA · Reportes y Mejora</span>
              </div>
              <h1
                id="tutor-ia-heading"
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              >
                Asistente Pedagógico IA
              </h1>
              <p className="text-sm text-white/65 max-w-2xl leading-relaxed">
                Genera diagnósticos creativos, métodos de mejora personalizados y reportes PDF para
                tus {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}.
              </p>
            </div>
          </div>

          <GlassTooltip label="Regresar al resumen de estudiantes" placement="left">
            <Link
              href="/maestro"
              className="min-h-[42px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black text-white text-xs font-semibold px-5 transition-colors self-start lg:self-auto shrink-0"
            >
              ← Volver a Mis Estudiantes
            </Link>
          </GlassTooltip>
        </section>

        {loading ? (
          <TutorIASkeleton />
        ) : (
          <TeacherReportIACard
            tutorName={user.name || 'Tutor'}
            students={students}
            totalNiveles={totalNiveles}
          />
        )}
      </div>
    </div>
  );
}
