'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
} from '../components/LiquidGlassToast';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';

interface UsuarioDB {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  role: 'student' | 'tutor' | 'admin' | string;
  status?: boolean | null;
}

function ordenarPorRolYNombre<T extends { role: string; nombre: string }>(lista: T[]): T[] {
  const pesoRol = (role: string) => (role === 'tutor' || role === 'docente' ? 0 : 1);
  return [...lista].sort((a, b) => {
    const diffRol = pesoRol(a.role) - pesoRol(b.role);
    if (diffRol !== 0) return diffRol;
    return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
  });
}

function getInitials(nombre: string, usuario: string): string {
  const source = (nombre || usuario || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function EmptyActiveUsersIllustration() {
  return (
    <svg
      viewBox="0 0 180 110"
      fill="none"
      className="w-40 h-24 mx-auto mb-3"
      role="img"
      aria-label="Ilustración de panel sin usuarios activos"
    >
      <ellipse
        cx="90"
        cy="64"
        rx="68"
        ry="19"
        stroke="#67E8F9"
        strokeOpacity="0.3"
        strokeWidth="1.4"
        strokeDasharray="4 5"
      />
      <rect
        x="62"
        y="32"
        width="56"
        height="40"
        rx="10"
        fill="#0B1226"
        stroke="#94A3B8"
        strokeWidth="1.6"
      />
      <line x1="74" y1="47" x2="106" y2="47" stroke="#67E8F9" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="74" y1="57" x2="96" y2="57" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="38" cy="48" r="2.8" fill="#67E8F9" fillOpacity="0.7" />
      <circle cx="146" cy="40" r="2.2" fill="#D8B4FE" fillOpacity="0.7" />
    </svg>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const assignRole = useAuthStore((s: any) => s.assignRole);

  const [mounted, setMounted] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<LiquidGlassToastData | null>(null);

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
      cargarUsuarios();
    }
  }, [user, router, mounted]);

  const cargarUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, usuario, correo, role, status')
      .in('role', ['student', 'tutor'])
      .or('status.is.null,status.eq.true')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar usuarios desde Supabase:', error.message);
    } else if (data) {
      setUsuarios(ordenarPorRolYNombre(data));
    }
    setLoading(false);
  };

  const cambiarRol = async (u: UsuarioDB) => {
    const nuevoRol = u.role === 'student' ? 'tutor' : 'student';
    setUpdatingId(u.id);

    const { error } = await supabase
      .from('usuarios')
      .update({ role: nuevoRol })
      .eq('id', u.id)
      .in('role', ['student', 'tutor']);

    if (error) {
      console.error('Error al actualizar el rol:', error.message);
      setToast({
        id: Date.now(),
        variant: 'error',
        eyebrow: 'ERROR DE ACTUALIZACIÓN',
        title: 'No se pudo cambiar el rol',
        message: `Ocurrió un error al actualizar el rol de ${u.nombre}. Intenta nuevamente.`,
      });
    } else {
      setUsuarios((prev) =>
        ordenarPorRolYNombre(
          prev.map((item) => (item.id === u.id ? { ...item, role: nuevoRol } : item))
        )
      );

      if (assignRole) {
        assignRole(u.id, nuevoRol);
      }

      const rolLegible = nuevoRol === 'tutor' ? 'Tutor' : 'Estudiante';
      setToast({
        id: Date.now(),
        variant: 'saved',
        eyebrow: 'ROL ACTUALIZADO',
        title: `Rol asignado: ${rolLegible}`,
        message: `${u.nombre} ahora cuenta con permisos de ${rolLegible} en la plataforma.`,
      });
    }

    setUpdatingId(null);
  };

  if (!mounted || !user || user.role !== 'admin') return null;

  const totalTutores = usuarios.filter(
    (u) => u.role === 'tutor' || u.role === 'docente',
  ).length;
  const totalEstudiantes = usuarios.length - totalTutores;

  return (
    <div className="relative min-h-screen px-4 sm:px-6 py-10 sm:py-12">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <LiquidGlassToast toast={toast} onClose={() => setToast(null)} />

        {/* Encabezado Liquid Glass */}
        <section
          aria-labelledby="admin-roles-heading"
          className="rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <LiquidGlass
              blur={4}
              refraction={10}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[#67E8F9]"
            >
              <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
                <path
                  d="M9 2.2L15 4.9V9.2C15 12.6 12.5 15.2 9 16C5.5 15.2 3 12.6 3 9.2V4.9L9 2.2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Control del Sistema</span>
            </LiquidGlass>
            <h1
              id="admin-roles-heading"
              className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight"
            >
              Panel de Administración
            </h1>
            <p className="text-sm sm:text-base text-[#CBD5E1] max-w-xl leading-relaxed">
              Gestiona los roles de los usuarios activos registrados como Estudiante o Tutor.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 self-start md:self-center shrink-0">
            <div className="rounded-2xl liquid-glass-inset px-4 py-3 text-center min-w-[104px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#67E8F9]">
                Tutores
              </div>
              <div className="text-2xl font-black text-[#F8FAFC] mt-0.5 tabular-nums">
                {totalTutores}
              </div>
            </div>
            <div className="rounded-2xl liquid-glass-inset px-4 py-3 text-center min-w-[104px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6EE7B7]">
                Estudiantes
              </div>
              <div className="text-2xl font-black text-[#F8FAFC] mt-0.5 tabular-nums">
                {totalEstudiantes}
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="active-users-heading" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2
              id="active-users-heading"
              className="text-lg font-black text-[#F8FAFC] tracking-tight tabular-nums"
            >
              Usuarios activos ({usuarios.length})
            </h2>
            <span className="text-xs font-medium text-[#94A3B8] hidden sm:inline">
              Ordenados por rol: tutores primero
            </span>
          </div>

          {loading ? (
            <div className="liquid-glass rounded-3xl p-8 text-center" role="status">
              <p className="text-sm text-[#CBD5E1] font-medium">
                Cargando usuarios...
              </p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="liquid-glass liquid-glass-panel rounded-3xl p-10 text-center">
              <EmptyActiveUsersIllustration />
              <p className="text-base text-[#F8FAFC] font-bold">
                No hay usuarios activos registrados.
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Cuando apruebes cuentas nuevas aparecerán aquí para asignar su rol.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {usuarios.map((u) => {
                const isTutor = u.role === 'tutor' || u.role === 'docente';
                const isUpdating = updatingId === u.id;

                return (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl liquid-glass liquid-glass-interactive"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-11 h-11 rounded-2xl liquid-glass-inset flex items-center justify-center font-black text-sm shrink-0 text-[#F8FAFC]"
                        style={{
                          borderColor: isTutor
                            ? 'rgba(103, 232, 249, 0.42)'
                            : 'rgba(110, 231, 183, 0.42)',
                          background: isTutor
                            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(11, 16, 34, 0.9))'
                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(11, 16, 34, 0.9))',
                        }}
                      >
                        {getInitials(u.nombre, u.usuario)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-sm sm:text-base text-[#F8FAFC] font-bold truncate">
                            {u.nombre}
                          </span>
                          <span
                            className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                              isTutor
                                ? 'border-[#67E8F9]/45 bg-cyan-500/15 text-[#67E8F9]'
                                : 'border-[#6EE7B7]/45 bg-emerald-500/15 text-[#6EE7B7]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <div className="text-xs text-[#CBD5E1] mt-0.5 truncate">
                          @{u.usuario} · {u.correo}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => cambiarRol(u)}
                        disabled={isUpdating}
                        className="min-h-[44px] inline-flex items-center justify-center text-xs font-bold liquid-glass-pill hover:bg-white/15 disabled:opacity-50 text-[#F8FAFC] px-4 py-2.5 rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                      >
                        {isUpdating
                          ? 'Guardando...'
                          : `Cambiar a ${u.role === 'student' ? 'Tutor' : 'Estudiante'}`}
                      </button>
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
