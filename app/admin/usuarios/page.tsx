'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../../../lib/auth-store';
import { supabase } from '../../../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
  type LiquidGlassToastVariant,
} from '../../components/LiquidGlassToast';

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

export default function AdminUsuariosPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const assignRole = useAuthStore((s) => s.assignRole);

  const [mounted, setMounted] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioEditableDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<'all' | EditableRole>('all');
  const [filtroEstado, setFiltroEstado] = useState<'all' | 'active' | 'inactive'>('all');

  // Estado del modal de edición
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

  // Cambio rápido de estado (status)
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  // Notificación flotante profesional en Liquid Glass
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

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, usuario, correo, contrasena, role, status')
      .in('role', ['student', 'tutor'])
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar usuarios desde Supabase:', error.message);
      setLoadError('No se pudieron cargar los usuarios desde Supabase. Verifica la conexión e intenta nuevamente.');
    } else if (data) {
      const lista = ordenarPorRolYNombre(data as UsuarioEditableDB[]);
      setUsuarios(lista);

      // Si se abrió con ?edit=<id> desde /admin, abrimos el editor automáticamente
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

  // Cerrar modal con tecla Escape
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

    const { data, error } = await supabase
      .from('usuarios')
      .update({ status: nuevoStatus })
      .eq('id', u.id)
      .in('role', ['student', 'tutor'])
      .select('id, status')
      .single();

    if (error || !data) {
      console.error('Error al actualizar status:', error?.message);
      mostrarToast({
        variant: 'error',
        eyebrow: 'ERROR DE SINCRONIZACIÓN',
        title: 'No se pudo actualizar el estado',
        message: `Ocurrió un inconveniente al modificar el acceso de ${u.nombre}. Intenta nuevamente.`,
      });
    } else {
      setUsuarios((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: data.status } : item)),
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('admin-pending-updated'));
      }
      if (nuevoStatus) {
        mostrarToast({
          variant: 'activated',
          eyebrow: 'ESTADO ACTUALIZADO · ACTIVO',
          title: 'Cuenta habilitada',
          message: `${u.nombre} ahora se encuentra activo y cuenta con acceso habilitado a la plataforma.`,
        });
      } else {
        mostrarToast({
          variant: 'deactivated',
          eyebrow: 'ESTADO ACTUALIZADO · INACTIVO',
          title: 'Cuenta suspendida',
          message: `${u.nombre} ahora está inactivo. Su inicio de sesión ha sido restringido hasta nueva reactivación.`,
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
      // 1. Verificar que el nombre de usuario no exista en otro registro (incluyendo admins)
      const { data: dupUsuario, error: errDupUser } = await supabase
        .from('usuarios')
        .select('id')
        .ilike('usuario', cleanUsuario)
        .neq('id', editingUser.id)
        .limit(1);

      if (errDupUser) throw errDupUser;
      if (dupUsuario && dupUsuario.length > 0) {
        setFormError(`El usuario "@${cleanUsuario}" ya está en uso por otra cuenta.`);
        setSaving(false);
        return;
      }

      // 2. Verificar que el correo no exista en otro registro
      const { data: dupCorreo, error: errDupEmail } = await supabase
        .from('usuarios')
        .select('id')
        .ilike('correo', cleanCorreo)
        .neq('id', editingUser.id)
        .limit(1);

      if (errDupEmail) throw errDupEmail;
      if (dupCorreo && dupCorreo.length > 0) {
        setFormError(`El correo "${cleanCorreo}" ya está registrado en otra cuenta.`);
        setSaving(false);
        return;
      }

      // 3. Actualizar la fila en public.usuarios protegiendo los registros admin
      const { data: actualizado, error: errUpdate } = await supabase
        .from('usuarios')
        .update({
          nombre: cleanNombre,
          usuario: cleanUsuario,
          correo: cleanCorreo,
          contrasena: cleanContrasena,
          role: form.role,
          status: form.status,
        })
        .eq('id', editingUser.id)
        .in('role', ['student', 'tutor'])
        .select('id, nombre, usuario, correo, contrasena, role, status')
        .single();

      if (errUpdate) throw errUpdate;

      if (actualizado) {
        setUsuarios((prev) =>
          ordenarPorRolYNombre(
            prev.map((item) =>
              item.id === editingUser.id ? (actualizado as UsuarioEditableDB) : item,
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
              eyebrow: 'PERFIL ACTUALIZADO · ACTIVO',
              title: 'Cambios guardados y cuenta habilitada',
              message: `Los datos de ${cleanNombre} se guardaron y su acceso a la plataforma fue reactivado.`,
            });
          } else {
            mostrarToast({
              variant: 'deactivated',
              eyebrow: 'PERFIL ACTUALIZADO · INACTIVO',
              title: 'Cambios guardados y cuenta suspendida',
              message: `Los datos de ${cleanNombre} se guardaron y su cuenta quedó inactiva para iniciar sesión.`,
            });
          }
        } else {
          mostrarToast({
            variant: 'saved',
            eyebrow: 'REGISTRO SINCRONIZADO',
            title: 'Perfil actualizado',
            message: `La información de ${cleanNombre} se actualizó correctamente en la base de datos.`,
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
    <div className="relative min-h-screen px-4 sm:px-6 py-10 sm:py-12">
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* ── NOTIFICACIÓN PROFESIONAL EN LIQUID GLASS ── */}
        <LiquidGlassToast toast={toast} onClose={() => setToast(null)} />

        {/* ── ENCABEZADO PRINCIPAL LIQUID GLASS ── */}
        <div className="rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#93C5FD] mb-2">
              <span>✦</span> Administración de Cuentas
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Editar Estudiantes y Tutores
            </h1>
            <p className="text-sm text-slate-300/90 mt-1.5 max-w-xl">
              Edita nombre, usuario, correo, contraseña, rol y estado de todas las cuentas con rol{' '}
              <span className="text-emerald-300 font-semibold">student</span> y{' '}
              <span className="text-purple-300 font-semibold">tutor</span> directamente en la tabla{' '}
              <code className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-[#BFDBFE]">
                usuarios
              </code>
              .
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              onClick={cargarUsuarios}
              disabled={loading}
              className="inline-flex items-center justify-center liquid-glass-btn text-white text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Sincronizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* ── TARJETAS RESUMEN (KPIs) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="rounded-2xl liquid-glass p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#93C5FD]">
              Total Gestionables
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{stats.total}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Solo student y tutor</p>
          </div>

          <div className="rounded-2xl liquid-glass p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Estudiantes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.estudiantes}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Rol: student</p>
          </div>

          <div className="rounded-2xl liquid-glass p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-300">
              Tutores
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{stats.tutores}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Rol: tutor</p>
          </div>

          <div className="rounded-2xl liquid-glass p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BFDBFE]">
              Estado
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                {stats.activos}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                activos · {stats.inactivos} inactivos
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Columna status</p>
          </div>
        </div>

        {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
        <div className="rounded-2xl liquid-glass p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, @usuario o correo..."
              className="w-full liquid-glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por rol */}
            <div className="inline-flex p-1 rounded-xl liquid-glass-pill gap-1">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'student', label: 'Estudiantes' },
                  { id: 'tutor', label: 'Tutores' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFiltroRol(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroRol === opt.id
                      ? 'liquid-glass-btn text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Filtro por estado */}
            <div className="inline-flex p-1 rounded-xl liquid-glass-pill gap-1">
              {(
                [
                  { id: 'all', label: 'Cualquier estado' },
                  { id: 'active', label: 'Activos' },
                  { id: 'inactive', label: 'Inactivos' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFiltroEstado(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroEstado === opt.id
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── LISTADO DE USUARIOS ── */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              Usuarios registrados ({usuariosFiltrados.length}
              {usuariosFiltrados.length !== usuarios.length ? ` de ${usuarios.length}` : ''})
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Las cuentas con rol <code className="text-[#C4B5FD]">admin</code> están protegidas
            </span>
          </div>

          {loading ? (
            <div className="liquid-glass rounded-3xl p-10 text-center">
              <p className="text-sm text-slate-300 font-medium">
                Cargando estudiantes y tutores desde Supabase...
              </p>
            </div>
          ) : loadError ? (
            <div className="liquid-glass rounded-3xl p-8 text-center space-y-4 border-rose-400/35">
              <p className="text-sm text-rose-200 font-semibold">⚠️ {loadError}</p>
              <button
                type="button"
                onClick={cargarUsuarios}
                className="liquid-glass-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-10 text-center space-y-2">
              <p className="text-sm text-slate-300 font-semibold">
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
                  className="text-xs font-bold text-[#93C5FD] hover:text-white underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {usuariosFiltrados.map((u) => {
                const isTutor = u.role === 'tutor';
                const isActivo = u.status !== false;
                const isToggling = togglingStatusId === u.id;

                return (
                  <div
                    key={u.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl liquid-glass liquid-glass-interactive"
                    style={
                      !isActivo
                        ? {
                            borderColor: 'rgba(251, 113, 133, 0.28)',
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Avatar con iniciales */}
                      <div
                        className="w-11 h-11 rounded-2xl liquid-glass-pill flex items-center justify-center font-black text-sm shrink-0"
                        style={{
                          background: isTutor
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(59, 130, 246, 0.28) 100%)'
                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.32) 0%, rgba(59, 130, 246, 0.22) 100%)',
                          borderColor: isTutor
                            ? 'rgba(196, 181, 253, 0.45)'
                            : 'rgba(110, 231, 183, 0.45)',
                          color: '#F0F6FF',
                        }}
                      >
                        {getInitials(u.nombre, u.usuario)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base text-white font-bold truncate">
                            {u.nombre}
                          </span>

                          {/* Etiqueta de rol */}
                          <span
                            className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${
                              isTutor
                                ? 'border-purple-400/45 bg-purple-500/15 text-purple-200'
                                : 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200'
                            }`}
                          >
                            {u.role}
                          </span>

                          {/* Etiqueta de estado */}
                          <span
                            className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${
                              isActivo
                                ? 'border-sky-400/35 bg-sky-500/10 text-[#BFDBFE]'
                                : 'border-rose-400/45 bg-rose-500/15 text-rose-200'
                            }`}
                          >
                            {u.status === true
                              ? '● Activo'
                              : u.status === false
                                ? '○ Inactivo'
                                : '● Activo'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300/85 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          <span className="font-medium text-[#BFDBFE]">@{u.usuario}</span>
                          <span className="text-slate-500">·</span>
                          <span className="truncate">{u.correo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleEstadoRapido(u)}
                        disabled={isToggling}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
                          isActivo
                            ? 'liquid-glass-pill text-slate-200 hover:bg-rose-500/20 hover:text-rose-200'
                            : 'liquid-glass-pill text-emerald-200 border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-500/25'
                        }`}
                        title={isActivo ? 'Marcar usuario como inactivo' : 'Reactivar usuario'}
                      >
                        {isToggling ? '...' : isActivo ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirEditor(u)}
                        className="text-xs font-bold liquid-glass-btn text-white px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ════════════════════ MODAL DE EDICIÓN EN DOBLE ENCAPSULADO LIQUID GLASS ════════════════════ */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrarEditor}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, rgba(15, 23, 52, 0.78) 0%, rgba(4, 7, 18, 0.9) 80%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 14, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 14, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl liquid-glass-modal p-3 sm:p-4 my-auto"
              style={{
                borderColor: 'rgba(191, 219, 254, 0.32)',
              }}
            >
              {/* Cápsula interior Liquid Glass */}
              <form
                onSubmit={handleGuardarEdicion}
                className="rounded-2xl liquid-glass p-5 sm:p-7 space-y-5"
                style={{
                  borderColor: 'rgba(196, 181, 253, 0.22)',
                }}
              >
                {/* Cabecera del Modal */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center font-black text-base text-white shrink-0"
                      style={{
                        background:
                          form.role === 'tutor'
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.45) 0%, rgba(59, 130, 246, 0.35) 100%)'
                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.42) 0%, rgba(59, 130, 246, 0.28) 100%)',
                      }}
                    >
                      {getInitials(form.nombre, form.usuario)}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#93C5FD]">
                        Editar Registro · public.usuarios
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white truncate">
                        {editingUser.nombre}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        ID: {editingUser.id}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarEditor}
                    disabled={saving}
                    className="liquid-glass-pill w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white text-sm font-bold cursor-pointer shrink-0"
                    title="Cerrar editor"
                  >
                    ✕
                  </button>
                </div>

                {/* Campos editables de public.usuarios */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-nombre"
                      className="block text-xs font-bold uppercase tracking-wider text-[#BFDBFE] mb-1.5"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="edit-nombre"
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                      className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500"
                      placeholder="Ej: Benyer Medina"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-usuario"
                      className="block text-xs font-bold uppercase tracking-wider text-[#BFDBFE] mb-1.5"
                    >
                      Usuario
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                        @
                      </span>
                      <input
                        id="edit-usuario"
                        type="text"
                        value={form.usuario}
                        onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                        className="w-full liquid-glass-input rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-500"
                        placeholder="Ej: Benyer12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-correo"
                      className="block text-xs font-bold uppercase tracking-wider text-[#BFDBFE] mb-1.5"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="edit-correo"
                      type="email"
                      value={form.correo}
                      onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                      className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-contrasena"
                      className="block text-xs font-bold uppercase tracking-wider text-[#BFDBFE] mb-1.5"
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="edit-contrasena"
                        type={showPassword ? 'text' : 'password'}
                        value={form.contrasena}
                        onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
                        className="w-full liquid-glass-input rounded-xl pl-4 pr-11 py-2.5 text-sm text-white placeholder-slate-500"
                        placeholder="Contraseña de la cuenta"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-xs text-slate-300 hover:text-white cursor-pointer"
                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selectores visuales de Rol y Estado */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#BFDBFE] mb-1.5">
                      Rol del usuario (role)
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl liquid-glass-pill">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: 'student' }))}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          form.role === 'student'
                            ? 'bg-emerald-500/30 border border-emerald-300/60 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.28)]'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        🎓 Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: 'tutor' }))}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          form.role === 'tutor'
                            ? 'bg-purple-500/30 border border-purple-300/60 text-purple-100 shadow-[0_0_16px_rgba(168,85,247,0.28)]'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        🧭 Tutor
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#BFDBFE] mb-1.5">
                      Estado de la cuenta (status)
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl liquid-glass-pill">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, status: true }))}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          form.status
                            ? 'bg-sky-500/25 border border-sky-300/60 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        ● Activo
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, status: false }))}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !form.status
                            ? 'bg-rose-500/25 border border-rose-300/60 text-rose-100 shadow-[0_0_16px_rgba(244,63,94,0.25)]'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        ○ Inactivo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Aviso informativo cuando se modifica correo o contraseña */}
                {cambioCredenciales && (
                  <div className="rounded-xl px-4 py-2.5 liquid-glass-pill border-purple-300/35 text-[11px] sm:text-xs text-[#E2EEFF] leading-relaxed">
                    <strong className="text-[#C4B5FD]">Nota:</strong> Los cambios de correo y
                    contraseña se actualizan directamente en la tabla{' '}
                    <code className="text-[#93C5FD]">public.usuarios</code>. Si el usuario inicia
                    sesión con Supabase Auth, asegúrate de sincronizar sus credenciales allí también.
                  </div>
                )}

                {/* Error de validación / Supabase */}
                {formError && (
                  <div className="rounded-xl px-4 py-2.5 liquid-glass-pill border-rose-400/50 bg-rose-500/15 text-rose-200 text-xs font-semibold">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Botones del Modal */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={cerrarEditor}
                    disabled={saving}
                    className="liquid-glass-pill hover:bg-white/15 text-slate-200 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hayCambiosEnFormulario}
                    className="liquid-glass-btn text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(79, 70, 229, 0.8) 0%, rgba(168, 85, 247, 0.72) 52%, rgba(16, 185, 129, 0.68) 100%)',
                    }}
                  >
                    {saving ? 'Guardando en Supabase...' : 'Guardar Cambios'}
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
