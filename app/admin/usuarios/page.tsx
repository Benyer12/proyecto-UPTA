'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '../../../lib/auth-store';
import { supabase } from '../../../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
  type LiquidGlassToastVariant,
} from '../../components/LiquidGlassToast';
import { LiquidGlass } from '../../../components/ui/glasscn/liquid-glass';

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
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IconEdit({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M13.7 3.8L16.2 6.3L7.1 15.4L4 16L4.6 12.9L13.7 3.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
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

function IconAlert({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6.2V10.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="13.8" r="1" fill="currentColor" />
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

function IconRoleMark({ role }: { role: EditableRole }) {
  if (role === 'student') {
    return (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
        <path
          d="M9 3L16 6.5L9 10L2 6.5L9 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M4.8 8.2V12.2C4.8 13.4 6.7 14.4 9 14.4C11.3 14.4 13.2 13.4 13.2 12.2V8.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="9,4.6 11.2,9 9,13.4 6.8,9" fill="currentColor" />
    </svg>
  );
}

function EmptyUsersSearchIllustration() {
  return (
    <svg
      viewBox="0 0 180 110"
      fill="none"
      className="w-40 h-24 mx-auto mb-2"
      role="img"
      aria-label="Ilustración de búsqueda sin coincidencias"
    >
      <ellipse
        cx="90"
        cy="66"
        rx="68"
        ry="19"
        stroke="#67E8F9"
        strokeOpacity="0.28"
        strokeWidth="1.4"
        strokeDasharray="4 5"
      />
      <circle cx="84" cy="52" r="17" fill="#0B1226" stroke="#94A3B8" strokeWidth="1.8" />
      <path d="M97 65L110 78" stroke="#67E8F9" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="42" cy="46" r="2.6" fill="#D8B4FE" fillOpacity="0.7" />
      <circle cx="144" cy="44" r="2.4" fill="#6EE7B7" fillOpacity="0.7" />
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
        <section
          aria-labelledby="manage-users-heading"
          className="rounded-3xl liquid-glass liquid-glass-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
        >
          <div className="space-y-2">
            <LiquidGlass
              blur={4}
              refraction={10}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[#67E8F9]"
            >
              <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
                <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M3.5 15.2C3.5 12.6 6 10.8 9 10.8C12 10.8 14.5 12.6 14.5 15.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Administración de Cuentas</span>
            </LiquidGlass>
            <h1
              id="manage-users-heading"
              className="text-2xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight"
            >
              Editar Estudiantes y Tutores
            </h1>
            <p className="text-sm text-[#CBD5E1] max-w-xl leading-relaxed">
              Edita nombre, usuario, correo, contraseña, rol y estado de todas las cuentas con rol{' '}
              <span className="text-[#6EE7B7] font-semibold">student</span> y{' '}
              <span className="text-[#D8B4FE] font-semibold">tutor</span> directamente en la tabla{' '}
              <code className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-[#67E8F9]">
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
              className="min-h-[44px] inline-flex items-center justify-center liquid-glass-btn text-[#F8FAFC] text-xs font-bold tracking-wider uppercase px-5 py-2.5 rounded-xl disabled:opacity-50 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
            >
              {loading ? 'Sincronizando...' : 'Actualizar lista'}
            </button>
          </div>
        </section>

        {/* ── TARJETAS RESUMEN (KPIs) ── */}
        <section aria-label="Resumen de cuentas registradas">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="rounded-2xl liquid-glass p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#67E8F9]">
                Total gestionables
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-1 tabular-nums">
                {stats.total}
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">Solo student y tutor</p>
            </div>

            <div className="rounded-2xl liquid-glass p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6EE7B7]">
                Estudiantes
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-1 tabular-nums">
                {stats.estudiantes}
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">Rol: student</p>
            </div>

            <div className="rounded-2xl liquid-glass p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D8B4FE]">
                Tutores
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-1 tabular-nums">
                {stats.tutores}
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">Rol: tutor</p>
            </div>

            <div className="rounded-2xl liquid-glass p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#CBD5E1]">
                Estado
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#6EE7B7] tabular-nums">
                  {stats.activos}
                </span>
                <span className="text-xs text-[#CBD5E1] font-semibold tabular-nums">
                  activos · {stats.inactivos} inactivos
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">Columna status</p>
            </div>
          </div>
        </section>

        {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
        <div className="rounded-2xl liquid-glass p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar usuarios por nombre, usuario o correo"
              placeholder="Buscar por nombre, @usuario o correo..."
              className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por rol */}
            <div
              role="group"
              aria-label="Filtrar por rol"
              className="inline-flex p-1 rounded-xl liquid-glass-inset gap-1"
            >
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
                  aria-pressed={filtroRol === opt.id}
                  onClick={() => setFiltroRol(opt.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                    filtroRol === opt.id
                      ? 'liquid-glass-btn text-[#F8FAFC]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Filtro por estado */}
            <div
              role="group"
              aria-label="Filtrar por estado"
              className="inline-flex p-1 rounded-xl liquid-glass-inset gap-1"
            >
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
                  aria-pressed={filtroEstado === opt.id}
                  onClick={() => setFiltroEstado(opt.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                    filtroEstado === opt.id
                      ? 'bg-white/15 text-[#F8FAFC]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── LISTADO DE USUARIOS ── */}
        <section aria-labelledby="registered-users-heading" className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2
              id="registered-users-heading"
              className="text-base sm:text-lg font-black text-[#F8FAFC] tracking-tight tabular-nums"
            >
              Usuarios registrados ({usuariosFiltrados.length}
              {usuariosFiltrados.length !== usuarios.length ? ` de ${usuarios.length}` : ''})
            </h2>
            <span className="text-xs text-[#94A3B8] hidden sm:inline">
              Las cuentas con rol <code className="text-[#D8B4FE]">admin</code> están protegidas
            </span>
          </div>

          {loading ? (
            <div className="liquid-glass rounded-3xl p-10 text-center" role="status">
              <p className="text-sm text-[#CBD5E1] font-medium">
                Cargando estudiantes y tutores desde Supabase...
              </p>
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="liquid-glass rounded-3xl p-8 text-center space-y-4 border-rose-400/40"
            >
              <p className="inline-flex items-center justify-center gap-2 text-sm text-rose-200 font-semibold">
                <IconAlert className="w-4 h-4 shrink-0" />
                <span>{loadError}</span>
              </p>
              <div>
                <button
                  type="button"
                  onClick={cargarUsuarios}
                  className="min-h-[44px] liquid-glass-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#F8FAFC] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                >
                  Reintentar carga
                </button>
              </div>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="liquid-glass liquid-glass-panel rounded-3xl p-10 text-center space-y-3">
              <EmptyUsersSearchIllustration />
              <p className="text-sm text-[#F8FAFC] font-bold">
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
                  className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-xl liquid-glass-pill text-xs font-bold text-[#67E8F9] hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                >
                  Limpiar filtros activos
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
                        ? ({
                            '--glass-caustic': 'rgba(244, 63, 94, 0.24)',
                            borderColor: 'rgba(251, 113, 133, 0.34)',
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Avatar con iniciales */}
                      <div
                        className="w-11 h-11 rounded-2xl liquid-glass-inset flex items-center justify-center font-black text-sm shrink-0 text-[#F8FAFC]"
                        style={{
                          background: isTutor
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(11, 16, 34, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(11, 16, 34, 0.9) 100%)',
                          borderColor: isTutor
                            ? 'rgba(216, 180, 254, 0.42)'
                            : 'rgba(110, 231, 183, 0.42)',
                        }}
                      >
                        {getInitials(u.nombre, u.usuario)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base text-[#F8FAFC] font-bold truncate">
                            {u.nombre}
                          </span>

                          {/* Etiqueta de rol */}
                          <span
                            className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                              isTutor
                                ? 'border-[#D8B4FE]/45 bg-purple-500/15 text-[#E9D5FF]'
                                : 'border-[#6EE7B7]/45 bg-emerald-500/15 text-[#A7F3D0]'
                            }`}
                          >
                            {u.role}
                          </span>

                          {/* Etiqueta de estado */}
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                              isActivo
                                ? 'border-[#67E8F9]/35 bg-sky-500/10 text-[#67E8F9]'
                                : 'border-rose-400/45 bg-rose-500/15 text-rose-200'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActivo ? 'bg-[#67E8F9]' : 'bg-rose-400'
                              }`}
                            />
                            <span>
                              {u.status === true
                                ? 'Activo'
                                : u.status === false
                                  ? 'Inactivo'
                                  : 'Activo'}
                            </span>
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

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleEstadoRapido(u)}
                        disabled={isToggling}
                        className={`min-h-[44px] inline-flex items-center justify-center text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9] ${
                          isActivo
                            ? 'liquid-glass-pill text-[#E2E8F0] hover:bg-rose-500/20 hover:text-rose-200'
                            : 'liquid-glass-pill text-[#A7F3D0] border-[#6EE7B7]/45 bg-emerald-500/15 hover:bg-emerald-500/25'
                        }`}
                        title={isActivo ? 'Marcar usuario como inactivo' : 'Reactivar usuario'}
                      >
                        {isToggling ? 'Guardando...' : isActivo ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirEditor(u)}
                        className="min-h-[44px] text-xs font-bold liquid-glass-btn text-[#F8FAFC] px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
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
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            onClick={cerrarEditor}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, rgba(15, 23, 52, 0.8) 0%, rgba(4, 7, 18, 0.92) 80%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-user-modal-title"
              initial={prefersReducedMotion ? false : { scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl liquid-glass-modal p-3 sm:p-4 my-auto"
              style={{
                borderColor: 'rgba(103, 232, 249, 0.3)',
              }}
            >
              {/* Cápsula interior Liquid Glass */}
              <form
                onSubmit={handleGuardarEdicion}
                className="rounded-2xl liquid-glass-inset p-5 sm:p-7 space-y-5"
                style={{
                  borderColor: 'rgba(216, 180, 254, 0.24)',
                }}
              >
                {/* Cabecera del Modal */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center font-black text-base text-[#F8FAFC] shrink-0"
                      style={{
                        background:
                          form.role === 'tutor'
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.38) 0%, rgba(11, 16, 34, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.36) 0%, rgba(11, 16, 34, 0.9) 100%)',
                      }}
                    >
                      {getInitials(form.nombre, form.usuario)}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#67E8F9]">
                        Editar registro · public.usuarios
                      </span>
                      <h3
                        id="edit-user-modal-title"
                        className="text-lg sm:text-xl font-black text-[#F8FAFC] truncate"
                      >
                        {editingUser.nombre}
                      </h3>
                      <p className="text-[11px] text-[#94A3B8] font-mono truncate">
                        ID: {editingUser.id}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarEditor}
                    disabled={saving}
                    aria-label="Cerrar editor de usuario"
                    className="liquid-glass-pill min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[#CBD5E1] hover:text-white cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                    title="Cerrar editor"
                  >
                    <IconClose className="w-4 h-4" />
                  </button>
                </div>

                {/* Campos editables de public.usuarios */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-nombre"
                      className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="edit-nombre"
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                      className="w-full min-h-[44px] liquid-glass-input rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]"
                      placeholder="Nombre completo del usuario"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-usuario"
                      className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5"
                    >
                      Usuario
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm font-bold">
                        @
                      </span>
                      <input
                        id="edit-usuario"
                        type="text"
                        value={form.usuario}
                        onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                        className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-8 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]"
                        placeholder="Usuario sin espacios"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-correo"
                      className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="edit-correo"
                      type="email"
                      value={form.correo}
                      onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                      className="w-full min-h-[44px] liquid-glass-input rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]"
                      placeholder="correo@dominio.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-contrasena"
                      className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5"
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="edit-contrasena"
                        type={showPassword ? 'text' : 'password'}
                        value={form.contrasena}
                        onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
                        className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-4 pr-12 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]"
                        placeholder="Contraseña de la cuenta"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg text-[#CBD5E1] hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-[#67E8F9]"
                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <IconEye hidden={showPassword} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selectores visuales de Rol y Estado */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                      Rol del usuario (role)
                    </span>
                    <div
                      role="group"
                      aria-label="Seleccionar rol"
                      className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl liquid-glass-pill"
                    >
                      <button
                        type="button"
                        aria-pressed={form.role === 'student'}
                        onClick={() => setForm((f) => ({ ...f, role: 'student' }))}
                        className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                          form.role === 'student'
                            ? 'bg-emerald-500/25 border border-[#6EE7B7]/60 text-[#A7F3D0]'
                            : 'text-[#CBD5E1] hover:text-white'
                        }`}
                      >
                        <IconRoleMark role="student" />
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={form.role === 'tutor'}
                        onClick={() => setForm((f) => ({ ...f, role: 'tutor' }))}
                        className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                          form.role === 'tutor'
                            ? 'bg-purple-500/25 border border-[#D8B4FE]/60 text-[#E9D5FF]'
                            : 'text-[#CBD5E1] hover:text-white'
                        }`}
                      >
                        <IconRoleMark role="tutor" />
                        <span>Tutor</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                      Estado de la cuenta (status)
                    </span>
                    <div
                      role="group"
                      aria-label="Seleccionar estado de la cuenta"
                      className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl liquid-glass-pill"
                    >
                      <button
                        type="button"
                        aria-pressed={form.status}
                        onClick={() => setForm((f) => ({ ...f, status: true }))}
                        className={`min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                          form.status
                            ? 'bg-sky-500/25 border border-[#67E8F9]/60 text-[#E0F2FE]'
                            : 'text-[#CBD5E1] hover:text-white'
                        }`}
                      >
                        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#67E8F9]" />
                        <span>Activo</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={!form.status}
                        onClick={() => setForm((f) => ({ ...f, status: false }))}
                        className={`min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#67E8F9] ${
                          !form.status
                            ? 'bg-rose-500/25 border border-rose-300/60 text-rose-100'
                            : 'text-[#CBD5E1] hover:text-white'
                        }`}
                      >
                        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-rose-400" />
                        <span>Inactivo</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Aviso informativo cuando se modifica correo o contraseña */}
                {cambioCredenciales && (
                  <div className="rounded-xl px-4 py-3 liquid-glass-pill border-[#D8B4FE]/35 text-xs text-[#E2E8F0] leading-relaxed">
                    <strong className="text-[#D8B4FE]">Nota:</strong> Los cambios de correo y
                    contraseña se actualizan directamente en la tabla{' '}
                    <code className="text-[#67E8F9]">public.usuarios</code>. Si el usuario inicia
                    sesión con Supabase Auth, asegúrate de sincronizar sus credenciales allí también.
                  </div>
                )}

                {/* Error de validación / Supabase */}
                {formError && (
                  <div
                    role="alert"
                    className="rounded-xl px-4 py-3 liquid-glass-pill border-rose-400/50 bg-rose-500/15 text-rose-200 text-xs font-semibold flex items-center gap-2"
                  >
                    <IconAlert className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Botones del Modal */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={cerrarEditor}
                    disabled={saving}
                    className="min-h-[44px] liquid-glass-pill hover:bg-white/15 text-[#E2E8F0] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hayCambiosEnFormulario}
                    className="min-h-[44px] bg-[#00F5FF] text-[#06101F] hover:opacity-90 text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-xl cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
                  >
                    {saving ? 'Guardando en Supabase...' : 'Guardar cambios'}
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
