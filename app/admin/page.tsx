'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
} from '../components/LiquidGlassToast';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import ThemeTogglePill from '../../components/ThemeTogglePill';
import RoleAvatar from '../../components/RoleAvatar';

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
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <LiquidGlassToast toast={toast} onClose={() => setToast(null)} />

        {/* Cabecera arquitectónica abierta sobre partículas */}
        <section
          aria-labelledby="admin-roles-heading"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-white/10"
        >
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
              Control del sistema · Roles
            </div>
            <h1
              id="admin-roles-heading"
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              Panel de Administración
            </h1>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed">
              Gestiona los permisos de los usuarios activos registrados como Tutor o Estudiante.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start md:self-auto shrink-0">
            <ThemeTogglePill showLabels />

            <LiquidGlass
              blur={2}
              refraction={20}
              bezel={0.36}
              saturation={1.65}
              className="rounded-2xl bg-[#050a18]/[0.38] border-white/[0.15] shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
            >
              <div className="grid grid-cols-3 divide-x divide-white/10">
                <div className="px-4 py-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                    Activos
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">{usuarios.length}</div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#67E8F9]">
                    Tutores
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">{totalTutores}</div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#6EE7B7]">
                    Estudiantes
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">{totalEstudiantes}</div>
                </div>
              </div>
            </LiquidGlass>
          </div>
        </section>

        {/* Hoja cristalina unificada de usuarios activos */}
        <section aria-labelledby="active-users-heading">
          <LiquidGlass
            blur={2.5}
            refraction={20}
            bezel={0.32}
            saturation={1.62}
            className="rounded-3xl bg-[#050a18]/[0.44] border-white/[0.15] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-14px_28px_-12px_rgba(180,220,255,0.14)]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
              <h2
                id="active-users-heading"
                className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/60 tabular-nums"
              >
                Usuarios activos ({usuarios.length})
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 hidden sm:inline">
                Tutores primero
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center" role="status">
                <p className="text-sm text-white/55">Cargando usuarios...</p>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="p-12 text-center space-y-1.5">
                <p className="text-sm font-semibold text-white">No hay usuarios activos registrados.</p>
                <p className="text-xs text-white/50">
                  Cuando apruebes nuevas solicitudes aparecerán aquí para asignar su rol.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.07]">
                {usuarios.map((u) => {
                  const isTutor = u.role === 'tutor' || u.role === 'docente';
                  const isUpdating = updatingId === u.id;

                  return (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <RoleAvatar role={u.role} name={u.nombre || u.usuario} size={44} />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">
                              {u.nombre}
                            </span>
                            <span
                              className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                isTutor
                                  ? 'border-[#67E8F9]/35 bg-[#67E8F9]/[0.08] text-[#67E8F9]'
                                  : 'border-[#6EE7B7]/35 bg-[#6EE7B7]/[0.08] text-[#6EE7B7]'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <div className="text-xs text-white/50 mt-0.5 truncate">
                            @{u.usuario} · {u.correo}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => cambiarRol(u)}
                          disabled={isUpdating}
                          className="glance min-h-[40px] inline-flex items-center justify-center text-xs font-medium border border-white/15 bg-white/[0.05] hover:bg-white hover:text-black disabled:opacity-50 text-white px-4 py-2 rounded-full transition-colors cursor-pointer"
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
          </LiquidGlass>
        </section>
      </div>
    </div>
  );
}
