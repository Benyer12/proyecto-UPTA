'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '../../../lib/auth-store';
import { supabase } from '../../../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
} from '../../components/LiquidGlassToast';
import { LiquidGlass } from '../../../components/ui/glasscn/liquid-glass';

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

function AllClearOrbitIllustration() {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      className="w-44 h-24 mx-auto"
      role="img"
      aria-label="Ilustración de verificación completada sin solicitudes pendientes"
    >
      <ellipse
        cx="100"
        cy="62"
        rx="74"
        ry="22"
        stroke="#6EE7B7"
        strokeOpacity="0.32"
        strokeWidth="1.4"
        strokeDasharray="4 5"
      />
      <path
        d="M100 26L74 37.5V59C74 75.5 85.1 90.2 100 95C114.9 90.2 126 75.5 126 59V37.5L100 26Z"
        fill="#0B1424"
        stroke="#6EE7B7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M89.5 60.5L96.8 67.8L111.5 53.1"
        stroke="#A7F3D0"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="54" r="3" fill="#6EE7B7" fillOpacity="0.7" />
      <circle cx="164" cy="48" r="2.5" fill="#67E8F9" fillOpacity="0.7" />
      <circle cx="148" cy="86" r="2" fill="#FDE68A" fillOpacity="0.75" />
    </svg>
  );
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
        <section
          aria-labelledby="pending-heading"
          className="rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        >
          <div className="space-y-2">
            <LiquidGlass
              blur={4}
              refraction={10}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[#FDE68A]"
            >
              <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
                <circle cx="9" cy="9" r="6.8" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M9 5.5V9.3L11.6 10.8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Control de Ingresos</span>
            </LiquidGlass>
            <h1
              id="pending-heading"
              className="text-2xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight"
            >
              Pendientes por aprobar
            </h1>
            <p className="text-sm text-[#CBD5E1] max-w-xl leading-relaxed">
              Revisa las cuentas registradas en estado inactivo, asigna su rol y habilita su acceso
              a la plataforma.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
            <div className="min-h-[44px] inline-flex items-center liquid-glass-inset border-amber-300/35 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase text-[#FDE68A] whitespace-nowrap tabular-nums">
              {pendientes.length}{' '}
              {pendientes.length === 1 ? 'solicitud' : 'solicitudes'}
            </div>
            <button
              type="button"
              onClick={cargarPendientes}
              disabled={loading}
              className="min-h-[44px] inline-flex items-center justify-center liquid-glass-btn text-[#F8FAFC] text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl disabled:opacity-50 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
            >
              {loading ? 'Actualizando...' : 'Actualizar lista'}
            </button>
          </div>
        </section>

        {/* ── BUSCADOR (solo si hay solicitudes) ── */}
        {pendientes.length > 0 && (
          <div className="rounded-2xl liquid-glass p-3.5 sm:p-4 flex items-center gap-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#94A3B8] shrink-0 ml-1"
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
              aria-label="Filtrar solicitudes pendientes"
              placeholder="Filtrar solicitudes por nombre, @usuario o correo..."
              className="w-full min-h-[44px] bg-transparent text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none"
            />
          </div>
        )}

        {/* ── LISTADO DE PENDIENTES ── */}
        <section aria-label="Solicitudes de acceso pendientes" className="space-y-3.5">
          {loading ? (
            <div className="liquid-glass rounded-3xl p-10 text-center" role="status">
              <p className="text-sm text-[#CBD5E1] font-medium">
                Consultando usuarios pendientes por aprobar...
              </p>
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="liquid-glass rounded-3xl p-8 text-center space-y-4 border-rose-400/40"
            >
              <p className="text-sm text-rose-200 font-semibold">{loadError}</p>
              <button
                type="button"
                onClick={cargarPendientes}
                className="min-h-[44px] liquid-glass-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#F8FAFC] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
              >
                Reintentar carga
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="liquid-glass liquid-glass-panel rounded-3xl p-10 sm:p-12 text-center flex flex-col items-center gap-3">
              <AllClearOrbitIllustration />
              <h2 className="text-lg font-bold text-[#F8FAFC]">
                {busqueda
                  ? 'No hay coincidencias con tu búsqueda'
                  : 'No hay usuarios pendientes por aprobar'}
              </h2>
              <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-md leading-relaxed">
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
                      layout={!prefersReducedMotion}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, x: 24, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl liquid-glass liquid-glass-interactive"
                      style={
                        {
                          '--glass-caustic': 'rgba(251, 191, 36, 0.22)',
                          borderColor: 'rgba(253, 230, 138, 0.28)',
                        } as CSSProperties
                      }
                    >
                      {/* Información del usuario */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl liquid-glass-inset flex items-center justify-center font-black text-sm shrink-0 text-[#FEF3C7]"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(139, 92, 246, 0.24) 100%)',
                            borderColor: 'rgba(253, 230, 138, 0.45)',
                          }}
                        >
                          {getInitials(u.nombre, u.usuario)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base text-[#F8FAFC] font-bold truncate">
                              {u.nombre}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border border-amber-300/45 bg-amber-500/15 text-[#FDE68A]">
                              Pendiente
                            </span>
                          </div>
                          <div className="text-xs text-[#CBD5E1] mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                            <span className="font-semibold text-[#67E8F9]">@{u.usuario}</span>
                            <span className="text-[#94A3B8]" aria-hidden="true">
                              ·
                            </span>
                            <span className="truncate">{u.correo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Selector de rol + Botón Aprobar */}
                      <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0">
                        <div
                          role="group"
                          aria-label={`Seleccionar rol para ${u.nombre}`}
                          className="inline-flex p-1 rounded-xl liquid-glass-inset gap-1"
                        >
                          <button
                            type="button"
                            disabled={isApproving}
                            aria-pressed={rolElegido === 'student'}
                            onClick={() =>
                              setRolesSeleccionados((prev) => ({ ...prev, [u.id]: 'student' }))
                            }
                            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                              rolElegido === 'student'
                                ? 'bg-emerald-500/25 border border-[#6EE7B7]/60 text-[#A7F3D0]'
                                : 'text-[#CBD5E1] hover:text-white'
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
                            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                              rolElegido === 'tutor'
                                ? 'bg-purple-500/25 border border-[#D8B4FE]/60 text-[#E9D5FF]'
                                : 'text-[#CBD5E1] hover:text-white'
                            }`}
                          >
                            Tutor
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAprobar(u)}
                          disabled={isApproving}
                          className="min-h-[44px] inline-flex items-center justify-center text-[#06101F] bg-[#00FF88] hover:opacity-90 text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
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
