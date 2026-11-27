'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '../../../lib/auth-store';
import {
  actualizarUsuarioHibrido,
  obtenerUsuariosHibrido,
} from '../../../lib/offline-sync';
import LiquidGlassToast, {
  type LiquidGlassToastData,
} from '../../components/LiquidGlassToast';
import { LiquidGlass } from '../../../components/ui/glasscn/liquid-glass';
import RoleAvatar from '../../../components/RoleAvatar';
import GlassTooltip from '../../../components/ui/GlassTooltip';
import { AdminPanelSkeleton, OrbitalSpinner, UserListSkeleton } from '../../../components/ui/PanelSkeletons';

type ApprovalRole = 'student' | 'tutor';

interface UsuarioPendiente {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  role: string;
  status: boolean | null;
}

function getInitials(nombre: string, usuario: string): string {
  const source = (nombre || usuario || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function ordenarPorRolYNombre<T extends { role: string; nombre: string }>(lista: T[]): T[] {
  const pesoRol = (role: string) => (role === 'tutor' || role === 'docente' ? 0 : 1);
  return [...lista].sort((a, b) => {
    const diffRol = pesoRol(a.role) - pesoRol(b.role);
    if (diffRol !== 0) return diffRol;
    return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
  });
}

export default function AdminPendientesPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const assignRole = useAuthStore((s) => s.assignRole);

  const [mounted, setMounted] = useState(false);
  const [pendientes, setPendientes] = useState<UsuarioPendiente[]>([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<Record<string, ApprovalRole>>({});
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toast, setToast] = useState<LiquidGlassToastData | null>(null);

  const cargarPendientes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const { usuarios: data } = await obtenerUsuariosHibrido({
        roles: ['student', 'tutor'],
        soloInactivos: true,
      });
      const lista = ordenarPorRolYNombre(data as UsuarioPendiente[]);
      setPendientes(lista);
      setRolesSeleccionados((prev) => {
        const next: Record<string, ApprovalRole> = { ...prev };
        for (const item of lista) {
          if (!next[item.id]) {
            next[item.id] = item.role === 'tutor' ? 'tutor' : 'student';
          }
        }
        return next;
      });
    } catch (err: any) {
      console.error('Error al cargar pendientes:', err?.message || err);
      setLoadError('No se pudieron cargar las solicitudes pendientes.');
    }

    setLoading(false);
  }, []);

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
      cargarPendientes();
    }
  }, [user, router, mounted, cargarPendientes]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pendientes;
    return pendientes.filter(
      (u) =>
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.usuario || '').toLowerCase().includes(q) ||
        (u.correo || '').toLowerCase().includes(q),
    );
  }, [pendientes, busqueda]);

  const handleAprobar = async (u: UsuarioPendiente) => {
    const rolFinal: ApprovalRole = rolesSeleccionados[u.id] ?? (u.role === 'tutor' ? 'tutor' : 'student');
    setApprovingId(u.id);

    const res = await actualizarUsuarioHibrido(u.id, {
      status: true,
      role: rolFinal,
    });

    if (!res.ok) {
      setToast({
        id: Date.now(),
        variant: 'error',
        eyebrow: 'ERROR DE APROBACIÓN',
        title: 'No se pudo aprobar la cuenta',
        message: `Ocurrió un inconveniente al habilitar el acceso de ${u.nombre}. Intenta nuevamente.`,
      });
    } else {
      setPendientes((prev) => prev.filter((item) => item.id !== u.id));
      if (assignRole) {
        assignRole(u.id, rolFinal);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('admin-pending-updated'));
      }
      const rolLegible = rolFinal === 'tutor' ? 'Tutor' : 'Estudiante';
      setToast({
        id: Date.now(),
        variant: 'activated',
        eyebrow: res.syncedToCloud ? 'ACCESO APROBADO · ACTIVO' : 'APROBADO EN BD LOCAL · SIN CONEXIÓN',
        title: 'Usuario aprobado correctamente',
        message: res.syncedToCloud
          ? `${u.nombre} ahora está activo como ${rolLegible} y ya puede iniciar sesión en la plataforma.`
          : `${u.nombre} quedó aprobado localmente como ${rolLegible} y se sincronizará al reconectar.`,
      });
    }

    setApprovingId(null);
  };

  if (!mounted) return <AdminPanelSkeleton label="Cargando solicitudes pendientes..." />;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <LiquidGlassToast toast={toast} onClose={() => setToast(null)} />

        {/* Cabecera abierta sobre partículas */}
        <section
          aria-labelledby="pending-heading"
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-7 border-b border-white/10"
        >
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FDE68A]/40 bg-[#FDE68A]/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#FDE68A] shadow-[0_0_20px_-6px_rgba(253,230,138,0.4)]">
              <span className="h-2 w-2 rounded-full bg-[#FDE68A]" aria-hidden="true" />
              Control de ingresos · Cola de Aprobación
            </div>
            <h1
              id="pending-heading"
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              Pendientes por aprobar
            </h1>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed">
              Revisa las cuentas registradas en estado inactivo, define su rol y habilita su acceso.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
            <div className="min-h-[42px] inline-flex items-center rounded-full border border-amber-300/30 bg-amber-400/[0.08] px-4 text-xs font-semibold text-[#FDE68A] tabular-nums">
              {pendientes.length} {pendientes.length === 1 ? 'solicitud' : 'solicitudes'}
            </div>
            <GlassTooltip label="Sincronizar solicitudes pendientes desde Supabase / BD local" placement="bottom">
              <button
                type="button"
                onClick={cargarPendientes}
                disabled={loading}
                className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black text-white text-xs font-semibold px-5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading && <OrbitalSpinner size="xs" />}
                <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </GlassTooltip>
          </div>
        </section>

        {/* Hoja cristalina unificada con buscador integrado */}
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
          {pendientes.length > 0 && (
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center gap-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/45 shrink-0"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Filtrar solicitudes pendientes"
                placeholder="Filtrar por nombre, @usuario o correo..."
                className="w-full min-h-[38px] bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
              />
            </div>
          )}

          {loading ? (
            <UserListSkeleton rows={4} actionButtons={2} />
          ) : loadError ? (
            <div role="alert" className="p-10 text-center space-y-4">
              <p className="text-sm text-rose-200 font-medium">{loadError}</p>
              <button
                type="button"
                onClick={cargarPendientes}
                className="min-h-[42px] rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] px-5 text-xs font-semibold text-white cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-2.5">
              <div className="w-11 h-11 rounded-full border border-emerald-400/35 bg-emerald-500/10 flex items-center justify-center text-[#6EE7B7]">
                <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
                  <path
                    d="M5 10.5L8.4 13.8L15.2 6.8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white">
                {busqueda
                  ? 'No hay coincidencias con tu búsqueda'
                  : 'No hay usuarios pendientes por aprobar'}
              </h2>
              <p className="text-xs sm:text-sm text-white/55 max-w-md">
                {busqueda
                  ? 'Prueba con otro nombre, usuario o correo electrónico.'
                  : 'Todas las cuentas de estudiantes y tutores registradas se encuentran aprobadas y al día.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.07]">
              <AnimatePresence>
                {filtrados.map((u) => {
                  const rolElegido =
                    rolesSeleccionados[u.id] ?? (u.role === 'tutor' ? 'tutor' : 'student');
                  const isApproving = approvingId === u.id;

                  return (
                    <motion.div
                      key={u.id}
                      layout={!prefersReducedMotion}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <RoleAvatar role={u.role} name={u.nombre || u.usuario} size={44} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">
                              {u.nombre}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-300/35 bg-amber-400/10 text-[#FDE68A]">
                              Pendiente
                            </span>
                          </div>
                          <div className="text-xs text-white/50 mt-0.5 truncate">
                            @{u.usuario} · {u.correo}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0">
                        <div
                          role="group"
                          aria-label={`Seleccionar rol para ${u.nombre}`}
                          className="inline-flex p-1 rounded-full border border-white/10 bg-white/[0.04] gap-0.5"
                        >
                          <button
                            type="button"
                            disabled={isApproving}
                            aria-pressed={rolElegido === 'student'}
                            onClick={() =>
                              setRolesSeleccionados((prev) => ({ ...prev, [u.id]: 'student' }))
                            }
                            className={`min-h-[34px] px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                              rolElegido === 'student'
                                ? 'bg-white text-black font-semibold'
                                : 'text-white/65 hover:text-white'
                            }`}
                          >
                            Estudiante
                          </button>
                          <button
                            type="button"
                            disabled={isApproving}
                            aria-pressed={rolElegido === 'tutor'}
                            onClick={() =>
                              setRolesSeleccionados((prev) => ({ ...prev, [u.id]: 'tutor' }))
                            }
                            className={`min-h-[34px] px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                              rolElegido === 'tutor'
                                ? 'bg-white text-black font-semibold'
                                : 'text-white/65 hover:text-white'
                            }`}
                          >
                            Tutor
                          </button>
                        </div>

                        <GlassTooltip label={`Habilitar cuenta como ${rolElegido === 'tutor' ? 'Tutor' : 'Estudiante'}`} placement="top">
                          <button
                            type="button"
                            onClick={() => handleAprobar(u)}
                            disabled={isApproving}
                            className="min-h-[40px] inline-flex items-center justify-center gap-2 rounded-full bg-[#6EE7B7] hover:bg-[#A7F3D0] text-black text-xs font-semibold px-5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isApproving && <OrbitalSpinner size="xs" />}
                            <span>{isApproving ? 'Aprobando...' : 'Aprobar acceso'}</span>
                          </button>
                        </GlassTooltip>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </LiquidGlass>
      </div>
    </div>
  );
}
