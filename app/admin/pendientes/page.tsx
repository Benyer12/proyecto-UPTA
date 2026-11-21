'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../../../lib/auth-store';
import { supabase } from '../../../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
} from '../../components/LiquidGlassToast';

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

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, usuario, correo, role, status')
      .in('role', ['student', 'tutor'])
      .eq('status', false)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar pendientes:', error.message);
      setLoadError('No se pudieron cargar las solicitudes pendientes desde Supabase.');
    } else if (data) {
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

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        status: true,
        role: rolFinal,
      })
      .eq('id', u.id)
      .in('role', ['student', 'tutor'])
      .select('id, role, status')
      .single();

    if (error || !data) {
      console.error('Error al aprobar usuario:', error?.message);
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
        eyebrow: 'ACCESO APROBADO · ACTIVO',
        title: 'Usuario aprobado correctamente',
        message: `${u.nombre} ahora está activo como ${rolLegible} y ya puede iniciar sesión en la plataforma.`,
      });
    }

    setApprovingId(null);
  };

  if (!mounted || !user || user.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen px-4 sm:px-6 py-10 sm:py-12">
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <LiquidGlassToast toast={toast} onClose={() => setToast(null)} />

        {/* ── ENCABEZADO LIQUID GLASS ── */}
        <div className="rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300/95 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
              Control de Ingresos
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Pendientes por aprobar
            </h1>
            <p className="text-sm text-slate-300/90 mt-1.5 max-w-xl">
              Revisa las cuentas registradas en estado inactivo, asigna su rol y habilita su acceso
              a la plataforma.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="liquid-glass-pill px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wider uppercase text-amber-200 whitespace-nowrap">
              {pendientes.length}{' '}
              {pendientes.length === 1 ? 'solicitud' : 'solicitudes'}
            </div>
            <button
              type="button"
              onClick={cargarPendientes}
              disabled={loading}
              className="liquid-glass-btn text-white text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-2xl disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* ── BUSCADOR (solo si hay solicitudes) ── */}
        {pendientes.length > 0 && (
          <div className="rounded-2xl liquid-glass p-4 flex items-center gap-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-400 shrink-0 ml-1"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M16.5 16.5L21 21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar solicitudes por nombre, @usuario o correo..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        )}

        {/* ── LISTADO DE PENDIENTES ── */}
        <section className="space-y-3.5">
          {loading ? (
            <div className="liquid-glass rounded-3xl p-10 text-center">
              <p className="text-sm text-slate-300 font-medium">
                Consultando usuarios pendientes por aprobar...
              </p>
            </div>
          ) : loadError ? (
            <div className="liquid-glass rounded-3xl p-8 text-center space-y-4 border-rose-400/35">
              <p className="text-sm text-rose-200 font-semibold">{loadError}</p>
              <button
                type="button"
                onClick={cargarPendientes}
                className="liquid-glass-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-10 sm:p-12 text-center flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)',
                  border: '1px solid rgba(110, 231, 183, 0.45)',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 2.75L4.75 5.85V11.6C4.75 16.25 7.82 20.42 12 21.75C16.18 20.42 19.25 16.25 19.25 11.6V5.85L12 2.75Z"
                    stroke="#6EE7B7"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.75 12.1L10.95 14.3L15.45 9.8"
                    stroke="#A7F3D0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">
                {busqueda
                  ? 'No hay coincidencias con tu búsqueda'
                  : 'No hay usuarios pendientes por aprobar'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/80 max-w-md">
                {busqueda
                  ? 'Prueba con otro nombre, usuario o correo electrónico.'
                  : 'Todas las cuentas de estudiantes y tutores registradas se encuentran aprobadas y al día.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtrados.map((u) => {
                  const rolElegido =
                    rolesSeleccionados[u.id] ?? (u.role === 'tutor' ? 'tutor' : 'student');
                  const isApproving = approvingId === u.id;

                  return (
                    <motion.div
                      key={u.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl liquid-glass liquid-glass-interactive"
                      style={{
                        borderColor: 'rgba(251, 191, 36, 0.24)',
                      }}
                    >
                      {/* Información del usuario */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl liquid-glass-pill flex items-center justify-center font-black text-sm shrink-0 text-amber-100"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(139, 92, 246, 0.28) 100%)',
                            borderColor: 'rgba(253, 230, 138, 0.45)',
                          }}
                        >
                          {getInitials(u.nombre, u.usuario)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base text-white font-bold truncate">
                              {u.nombre}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border border-amber-400/45 bg-amber-500/15 text-amber-200">
                              Pendiente
                            </span>
                          </div>
                          <div className="text-xs text-slate-300/85 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span className="font-medium text-[#BFDBFE]">@{u.usuario}</span>
                            <span className="text-slate-500">·</span>
                            <span className="truncate">{u.correo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Selector de rol + Botón Aprobar */}
                      <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0">
                        <div className="inline-flex p-1 rounded-xl liquid-glass-pill gap-1">
                          <button
                            type="button"
                            disabled={isApproving}
                            onClick={() =>
                              setRolesSeleccionados((prev) => ({ ...prev, [u.id]: 'student' }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              rolElegido === 'student'
                                ? 'bg-emerald-500/30 border border-emerald-300/60 text-emerald-100'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            Estudiante
                          </button>
                          <button
                            type="button"
                            disabled={isApproving}
                            onClick={() =>
                              setRolesSeleccionados((prev) => ({ ...prev, [u.id]: 'tutor' }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              rolElegido === 'tutor'
                                ? 'bg-purple-500/30 border border-purple-300/60 text-purple-100'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            Tutor
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAprobar(u)}
                          disabled={isApproving}
                          className="liquid-glass-btn text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(16, 185, 129, 0.72) 0%, rgba(5, 150, 105, 0.65) 100%)',
                            borderColor: 'rgba(110, 231, 183, 0.6)',
                          }}
                        >
                          {isApproving ? 'Aprobando...' : 'Aprobar acceso'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
