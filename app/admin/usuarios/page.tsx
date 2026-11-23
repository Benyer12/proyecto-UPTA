'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '../../../lib/auth-store';
import {
  actualizarUsuarioHibrido,
  hayConexionInternet,
  obtenerUsuariosHibrido,
} from '../../../lib/offline-sync';
import { supabase } from '../../../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
  type LiquidGlassToastVariant,
} from '../../components/LiquidGlassToast';
import { LiquidGlass } from '../../../components/ui/glasscn/liquid-glass';
import RoleAvatar from '../../../components/RoleAvatar';

type EditableRole = 'student' | 'tutor';

interface UsuarioEditableDB {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  contrasena: string;
  role: EditableRole;
  status: boolean | null;
}

interface EditFormState {
  nombre: string;
  usuario: string;
  correo: string;
  contrasena: string;
  role: EditableRole;
  status: boolean;
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

function IconSearch({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconClose({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEye({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
        <path
          d="M3 10C4.7 6.8 7.1 5.2 10 5.2C12.9 5.2 15.3 6.8 17 10C15.3 13.2 12.9 14.8 10 14.8C7.1 14.8 4.7 13.2 3 10Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M4 16L16 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path
        d="M3 10C4.7 6.8 7.1 5.2 10 5.2C12.9 5.2 15.3 6.8 17 10C15.3 13.2 12.9 14.8 10 14.8C7.1 14.8 4.7 13.2 3 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const assignRole = useAuthStore((s) => s.assignRole);

  const [mounted, setMounted] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioEditableDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<'all' | EditableRole>('all');
  const [filtroEstado, setFiltroEstado] = useState<'all' | 'active' | 'inactive'>('all');

  const [editingUser, setEditingUser] = useState<UsuarioEditableDB | null>(null);
  const [form, setForm] = useState<EditFormState>({
    nombre: '',
    usuario: '',
    correo: '',
    contrasena: '',
    role: 'student',
    status: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [toast, setToast] = useState<LiquidGlassToastData | null>(null);

  const mostrarToast = useCallback(
    (payload: {
      variant: LiquidGlassToastVariant;
      eyebrow?: string;
      title: string;
      message: string;
      durationMs?: number;
    }) => {
      setToast({ id: Date.now(), ...payload });
    },
    [],
  );

  const abrirEditor = useCallback((u: UsuarioEditableDB) => {
    setEditingUser(u);
    setForm({
      nombre: u.nombre ?? '',
      usuario: u.usuario ?? '',
      correo: u.correo ?? '',
      contrasena: u.contrasena ?? '',
      role: u.role === 'tutor' ? 'tutor' : 'student',
      status: u.status !== false,
    });
    setShowPassword(false);
    setFormError(null);
  }, []);

  const cerrarEditor = useCallback(() => {
    if (saving) return;
    setEditingUser(null);
    setFormError(null);
    setShowPassword(false);
  }, [saving]);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const { usuarios: data } = await obtenerUsuariosHibrido({
        roles: ['student', 'tutor'],
      });
      const lista = ordenarPorRolYNombre(data as UsuarioEditableDB[]);
      setUsuarios(lista);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
          const encontrado = lista.find((u) => u.id === editId);
          if (encontrado) {
            abrirEditor(encontrado);
            window.history.replaceState({}, '', '/admin/usuarios');
          }
        }
      }
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err?.message || err);
      setLoadError('No se pudieron cargar los usuarios.');
    }

    setLoading(false);
  }, [abrirEditor]);

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
  }, [user, router, mounted, cargarUsuarios]);

  useEffect(() => {
    if (!editingUser) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarEditor();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingUser, cerrarEditor]);

  const stats = useMemo(() => {
    const total = usuarios.length;
    const estudiantes = usuarios.filter((u) => u.role === 'student').length;
    const tutores = usuarios.filter((u) => u.role === 'tutor').length;
    const activos = usuarios.filter((u) => u.status !== false).length;
    const inactivos = total - activos;
    return { total, estudiantes, tutores, activos, inactivos };
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtroRol !== 'all' && u.role !== filtroRol) return false;
      const esActivo = u.status !== false;
      if (filtroEstado === 'active' && !esActivo) return false;
      if (filtroEstado === 'inactive' && esActivo) return false;
      if (!q) return true;
      return (
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.usuario || '').toLowerCase().includes(q) ||
        (u.correo || '').toLowerCase().includes(q)
      );
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const hayCambiosEnFormulario = useMemo(() => {
    if (!editingUser) return false;
    return (
      form.nombre.trim() !== (editingUser.nombre ?? '').trim() ||
      form.usuario.trim() !== (editingUser.usuario ?? '').trim() ||
      form.correo.trim() !== (editingUser.correo ?? '').trim() ||
      form.contrasena !== (editingUser.contrasena ?? '') ||
      form.role !== editingUser.role ||
      form.status !== (editingUser.status !== false)
    );
  }, [editingUser, form]);

  const cambioCredenciales = useMemo(() => {
    if (!editingUser) return false;
    return (
      form.correo.trim().toLowerCase() !== (editingUser.correo ?? '').trim().toLowerCase() ||
      form.contrasena !== (editingUser.contrasena ?? '')
    );
  }, [editingUser, form]);

  const handleToggleEstadoRapido = async (u: UsuarioEditableDB) => {
    const nuevoStatus = u.status === false ? true : false;
    setTogglingStatusId(u.id);

    const res = await actualizarUsuarioHibrido(u.id, { status: nuevoStatus });

    if (!res.ok) {
      mostrarToast({
        variant: 'error',
        eyebrow: 'ERROR DE SINCRONIZACIÓN',
        title: 'No se pudo actualizar el estado',
        message: `Ocurrió un inconveniente al modificar el acceso de ${u.nombre}. Intenta nuevamente.`,
      });
    } else {
      setUsuarios((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: nuevoStatus } : item)),
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('admin-pending-updated'));
      }
      if (nuevoStatus) {
        mostrarToast({
          variant: 'activated',
          eyebrow: res.syncedToCloud ? 'ESTADO ACTUALIZADO · ACTIVO' : 'GUARDADO EN BD LOCAL · ACTIVO',
          title: 'Cuenta habilitada',
          message: `${u.nombre} ahora se encuentra activo${res.syncedToCloud ? '' : ' (pendiente por subir)'}.`,
        });
      } else {
        mostrarToast({
          variant: 'deactivated',
          eyebrow: res.syncedToCloud ? 'ESTADO ACTUALIZADO · INACTIVO' : 'GUARDADO EN BD LOCAL · INACTIVO',
          title: 'Cuenta suspendida',
          message: `${u.nombre} ahora está inactivo${res.syncedToCloud ? '' : ' (pendiente por subir)'}.`,
        });
      }
    }

    setTogglingStatusId(null);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const cleanNombre = form.nombre.trim();
    const cleanUsuario = form.usuario.trim();
    const cleanCorreo = form.correo.trim();
    const cleanContrasena = form.contrasena.trim();

    if (!cleanNombre || !cleanUsuario || !cleanCorreo || !cleanContrasena) {
      setFormError('Todos los campos (nombre, usuario, correo y contraseña) son obligatorios.');
      return;
    }

    if (/\s/.test(cleanUsuario)) {
      setFormError('El nombre de usuario no puede contener espacios.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCorreo)) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    if (cleanContrasena.length < 4) {
      setFormError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const dupLocalUser = usuarios.some(
        (item) =>
          item.id !== editingUser.id &&
          (item.usuario || '').trim().toLowerCase() === cleanUsuario.toLowerCase(),
      );
      if (dupLocalUser) {
        setFormError(`El usuario "@${cleanUsuario}" ya está en uso por otra cuenta.`);
        setSaving(false);
        return;
      }

      const dupLocalCorreo = usuarios.some(
        (item) =>
          item.id !== editingUser.id &&
          (item.correo || '').trim().toLowerCase() === cleanCorreo.toLowerCase(),
      );
      if (dupLocalCorreo) {
        setFormError(`El correo "${cleanCorreo}" ya está registrado en otra cuenta.`);
        setSaving(false);
        return;
      }

      if (hayConexionInternet()) {
        const { data: dupUsuario, error: errDupUser } = await supabase
          .from('usuarios')
          .select('id')
          .ilike('usuario', cleanUsuario)
          .neq('id', editingUser.id)
          .limit(1);

        if (!errDupUser && dupUsuario && dupUsuario.length > 0) {
          setFormError(`El usuario "@${cleanUsuario}" ya está en uso por otra cuenta.`);
          setSaving(false);
          return;
        }

        const { data: dupCorreo, error: errDupEmail } = await supabase
          .from('usuarios')
          .select('id')
          .ilike('correo', cleanCorreo)
          .neq('id', editingUser.id)
          .limit(1);

        if (!errDupEmail && dupCorreo && dupCorreo.length > 0) {
          setFormError(`El correo "${cleanCorreo}" ya está registrado en otra cuenta.`);
          setSaving(false);
          return;
        }
      }

      const res = await actualizarUsuarioHibrido(editingUser.id, {
        nombre: cleanNombre,
        usuario: cleanUsuario,
        correo: cleanCorreo,
        contrasena: cleanContrasena,
        role: form.role,
        status: form.status,
      });

      if (!res.ok) {
        throw new Error(res.errorMessage || 'No se pudieron guardar los cambios.');
      }

      const actualizado: UsuarioEditableDB = {
        id: editingUser.id,
        nombre: cleanNombre,
        usuario: cleanUsuario,
        correo: cleanCorreo,
        contrasena: cleanContrasena,
        role: form.role,
        status: form.status,
      };

      if (actualizado) {
        setUsuarios((prev) =>
          ordenarPorRolYNombre(
            prev.map((item) =>
              item.id === editingUser.id ? actualizado : item,
            ),
          ),
        );

        if (assignRole && form.role !== editingUser.role) {
          assignRole(editingUser.id, form.role);
        }

        const estadoAnterior = editingUser.status !== false;
        if (form.status !== estadoAnterior) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('admin-pending-updated'));
          }
          if (form.status) {
            mostrarToast({
              variant: 'activated',
              eyebrow: res.syncedToCloud ? 'PERFIL ACTUALIZADO · ACTIVO' : 'GUARDADO LOCAL · ACTIVO',
              title: 'Cambios guardados y cuenta habilitada',
              message: `Los datos de ${cleanNombre} se guardaron y su acceso a la plataforma fue reactivado.`,
            });
          } else {
            mostrarToast({
              variant: 'deactivated',
              eyebrow: res.syncedToCloud ? 'PERFIL ACTUALIZADO · INACTIVO' : 'GUARDADO LOCAL · INACTIVO',
              title: 'Cambios guardados y cuenta suspendida',
              message: `Los datos de ${cleanNombre} se guardaron y su cuenta quedó inactiva para iniciar sesión.`,
            });
          }
        } else {
          mostrarToast({
            variant: 'saved',
            eyebrow: res.syncedToCloud ? 'REGISTRO SINCRONIZADO' : 'GUARDADO EN BD LOCAL · SIN CONEXIÓN',
            title: 'Perfil actualizado',
            message: res.syncedToCloud
              ? `La información de ${cleanNombre} se actualizó correctamente en la base de datos.`
              : `La información de ${cleanNombre} se guardó localmente y se subirá a Supabase al reconectar.`,
          });
        }
        setEditingUser(null);
      }
    } catch (err: any) {
      console.error('Error al actualizar usuario en Supabase:', err?.message || err);
      setFormError(
        err?.message || 'Ocurrió un error al guardar los cambios en la base de datos.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !user || user.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <LiquidGlassToast toast={toast} onClose={() => setToast(null)} />

        {/* Cabecera abierta sobre las partículas + resumen en tira cristalina */}
        <section
          aria-labelledby="manage-users-heading"
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 border-b border-white/10"
        >
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
              Directorio · public.usuarios
            </div>
            <h1
              id="manage-users-heading"
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              Estudiantes y Tutores
            </h1>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed">
              Edita credenciales, roles y estado de acceso de todas las cuentas gestionables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
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
              <div className="grid grid-cols-4 divide-x divide-white/10">
                <div className="px-3.5 py-2.5 text-center">
                  <div className="font-mono text-[10px] uppercase text-white/45">Total</div>
                  <div className="text-base font-bold text-white tabular-nums">{stats.total}</div>
                </div>
                <div className="px-3.5 py-2.5 text-center">
                  <div className="font-mono text-[10px] uppercase text-[#D8B4FE]">Tutores</div>
                  <div className="text-base font-bold text-white tabular-nums">{stats.tutores}</div>
                </div>
                <div className="px-3.5 py-2.5 text-center">
                  <div className="font-mono text-[10px] uppercase text-[#6EE7B7]">Estud.</div>
                  <div className="text-base font-bold text-white tabular-nums">
                    {stats.estudiantes}
                  </div>
                </div>
                <div className="px-3.5 py-2.5 text-center">
                  <div className="font-mono text-[10px] uppercase text-[#67E8F9]">Activos</div>
                  <div className="text-base font-bold text-white tabular-nums">{stats.activos}</div>
                </div>
              </div>
            </LiquidGlass>

            <button
              type="button"
              onClick={cargarUsuarios}
              disabled={loading}
              className="min-h-[42px] rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black text-white text-xs font-semibold px-4 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sincronizando...' : 'Actualizar'}
            </button>
          </div>
        </section>

        {/* Hoja cristalina unificada con barra de búsqueda y filtros integrados */}
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
          {/* Barra superior de búsqueda y filtros */}
          <div className="p-4 sm:px-6 border-b border-white/[0.08] bg-white/[0.02] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center gap-2.5">
              <IconSearch className="w-4 h-4 text-white/45 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar usuarios por nombre, usuario o correo"
                placeholder="Buscar por nombre, @usuario o correo..."
                className="w-full min-h-[38px] bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="Filtrar por rol"
                className="inline-flex p-0.5 rounded-full border border-white/10 bg-white/[0.04]"
              >
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'tutor', label: 'Tutores' },
                    { id: 'student', label: 'Estudiantes' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={filtroRol === opt.id}
                    onClick={() => setFiltroRol(opt.id)}
                    className={`min-h-[34px] px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      filtroRol === opt.id
                        ? 'bg-white text-black font-semibold'
                        : 'text-white/65 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div
                role="group"
                aria-label="Filtrar por estado"
                className="inline-flex p-0.5 rounded-full border border-white/10 bg-white/[0.04]"
              >
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'active', label: 'Activos' },
                    { id: 'inactive', label: 'Inactivos' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={filtroEstado === opt.id}
                    onClick={() => setFiltroEstado(opt.id)}
                    className={`min-h-[34px] px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      filtroEstado === opt.id
                        ? 'bg-white text-black font-semibold'
                        : 'text-white/65 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center" role="status">
              <p className="text-sm text-white/55">Cargando estudiantes y tutores...</p>
            </div>
          ) : loadError ? (
            <div role="alert" className="p-10 text-center space-y-4">
              <p className="text-sm text-rose-200 font-medium">{loadError}</p>
              <button
                type="button"
                onClick={cargarUsuarios}
                className="min-h-[40px] rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] px-5 text-xs font-semibold text-white cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-white/75 font-medium">
                No se encontraron usuarios con los filtros aplicados.
              </p>
              {(busqueda || filtroRol !== 'all' || filtroEstado !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroRol('all');
                    setFiltroEstado('all');
                  }}
                  className="min-h-[38px] rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] px-4 text-xs font-medium text-white cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.07]">
              {usuariosFiltrados.map((u) => {
                const isTutor = u.role === 'tutor';
                const isActivo = u.status !== false;
                const isToggling = togglingStatusId === u.id;

                return (
                  <div
                    key={u.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 sm:px-6 py-4 transition-colors ${
                      !isActivo ? 'bg-rose-500/[0.04]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <RoleAvatar role={u.role} name={u.nombre || u.usuario} size={44} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate">
                            {u.nombre}
                          </span>
                          <span
                            className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isTutor
                                ? 'border-[#D8B4FE]/35 bg-[#D8B4FE]/[0.08] text-[#E9D5FF]'
                                : 'border-[#6EE7B7]/35 bg-[#6EE7B7]/[0.08] text-[#A7F3D0]'
                            }`}
                          >
                            {u.role}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isActivo
                                ? 'border-white/15 bg-white/[0.04] text-white/80'
                                : 'border-rose-400/35 bg-rose-500/10 text-rose-200'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActivo ? 'bg-[#6EE7B7]' : 'bg-rose-400'
                              }`}
                            />
                            <span>{isActivo ? 'Activo' : 'Inactivo'}</span>
                          </span>
                        </div>

                        <div className="text-xs text-white/50 mt-0.5 truncate">
                          @{u.usuario} · {u.correo}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleEstadoRapido(u)}
                        disabled={isToggling}
                        className={`min-h-[38px] text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer disabled:opacity-50 ${
                          isActivo
                            ? 'border-white/12 bg-white/[0.04] text-white/75 hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-rose-200'
                            : 'border-[#6EE7B7]/35 bg-emerald-500/12 text-[#A7F3D0] hover:bg-emerald-500/25'
                        }`}
                      >
                        {isToggling ? '...' : isActivo ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirEditor(u)}
                        className="min-h-[38px] text-xs font-semibold bg-white hover:bg-white/90 text-black px-4 py-1.5 rounded-full cursor-pointer transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </LiquidGlass>
      </div>

      {/* Modal de edición en cristal estilo macOS */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            onClick={cerrarEditor}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto bg-black/65 backdrop-blur-md"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-user-modal-title"
              initial={prefersReducedMotion ? false : { scale: 0.96, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.96, y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-3xl liquid-glass-modal p-6 sm:p-7 my-auto"
            >
              <form onSubmit={handleGuardarEdicion} className="space-y-5">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2" aria-hidden="true">
                      <span className="size-2.5 rounded-full bg-[#FF5F56]" />
                      <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
                      <span className="size-2.5 rounded-full bg-[#27C93F]" />
                    </div>
                    <h3
                      id="edit-user-modal-title"
                      className="text-lg sm:text-xl font-bold text-white truncate"
                    >
                      {editingUser.nombre}
                    </h3>
                    <p className="font-mono text-[11px] text-white/45 truncate">
                      ID: {editingUser.id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarEditor}
                    disabled={saving}
                    aria-label="Cerrar editor de usuario"
                    className="w-10 h-10 rounded-full border border-white/12 bg-white/[0.05] hover:bg-white/[0.12] flex items-center justify-center text-white/70 hover:text-white cursor-pointer shrink-0 transition-colors"
                  >
                    <IconClose className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-nombre" className="block text-xs font-medium text-white/75 mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      id="edit-nombre"
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                      className="w-full min-h-[44px] liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/35"
                      placeholder="Nombre completo del usuario"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-usuario" className="block text-xs font-medium text-white/75 mb-1.5">
                      Usuario
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45 text-sm">
                        @
                      </span>
                      <input
                        id="edit-usuario"
                        type="text"
                        value={form.usuario}
                        onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                        className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-8 pr-3.5 py-2 text-sm text-white placeholder-white/35"
                        placeholder="Usuario sin espacios"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-correo" className="block text-xs font-medium text-white/75 mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      id="edit-correo"
                      type="email"
                      value={form.correo}
                      onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                      className="w-full min-h-[44px] liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/35"
                      placeholder="correo@dominio.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-contrasena" className="block text-xs font-medium text-white/75 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="edit-contrasena"
                        type={showPassword ? 'text' : 'password'}
                        value={form.contrasena}
                        onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
                        className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-3.5 pr-11 py-2 text-sm text-white placeholder-white/35"
                        placeholder="Contraseña de la cuenta"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-white/65 hover:text-white cursor-pointer"
                      >
                        <IconEye hidden={showPassword} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-white/75 mb-1.5">Rol</span>
                    <div
                      role="group"
                      aria-label="Seleccionar rol"
                      className="grid grid-cols-2 gap-1 p-1 rounded-full border border-white/10 bg-white/[0.04]"
                    >
                      <button
                        type="button"
                        aria-pressed={form.role === 'student'}
                        onClick={() => setForm((f) => ({ ...f, role: 'student' }))}
                        className={`min-h-[38px] rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          form.role === 'student'
                            ? 'bg-white text-black font-semibold'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        aria-pressed={form.role === 'tutor'}
                        onClick={() => setForm((f) => ({ ...f, role: 'tutor' }))}
                        className={`min-h-[38px] rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          form.role === 'tutor'
                            ? 'bg-white text-black font-semibold'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        Tutor
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-white/75 mb-1.5">Estado</span>
                    <div
                      role="group"
                      aria-label="Seleccionar estado de la cuenta"
                      className="grid grid-cols-2 gap-1 p-1 rounded-full border border-white/10 bg-white/[0.04]"
                    >
                      <button
                        type="button"
                        aria-pressed={form.status}
                        onClick={() => setForm((f) => ({ ...f, status: true }))}
                        className={`min-h-[38px] rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          form.status
                            ? 'bg-[#6EE7B7] text-black font-semibold'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        Activo
                      </button>
                      <button
                        type="button"
                        aria-pressed={!form.status}
                        onClick={() => setForm((f) => ({ ...f, status: false }))}
                        className={`min-h-[38px] rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          !form.status
                            ? 'bg-rose-400 text-black font-semibold'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        Inactivo
                      </button>
                    </div>
                  </div>
                </div>

                {cambioCredenciales && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/70 leading-relaxed">
                    <strong className="text-white">Nota:</strong> Los cambios de correo y contraseña
                    se actualizan directamente en{' '}
                    <code className="text-[#67E8F9]">public.usuarios</code>.
                  </div>
                )}

                {formError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-400/40 bg-rose-500/12 px-4 py-3 text-rose-200 text-xs font-medium"
                  >
                    {formError}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={cerrarEditor}
                    disabled={saving}
                    className="min-h-[42px] rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/[0.12] text-white text-xs font-medium px-5 cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hayCambiosEnFormulario}
                    className="min-h-[42px] rounded-full bg-white hover:bg-white/90 text-black text-xs font-semibold px-6 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
