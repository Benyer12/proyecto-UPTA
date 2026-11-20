'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';

interface UsuarioDB {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  role: 'student' | 'tutor' | 'admin' | string;
}

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const assignRole = useAuthStore((s: any) => s.assignRole);

  const [mounted, setMounted] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      .select('id, nombre, usuario, correo, role')
      .neq('role', 'admin')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar usuarios desde Supabase:', error.message);
    } else if (data) {
      setUsuarios(data);
    }
    setLoading(false);
  };

  const cambiarRol = async (id: string, rolActual: string) => {
    const nuevoRol = rolActual === 'student' ? 'tutor' : 'student';
    setUpdatingId(id);

    const { error } = await supabase
      .from('usuarios')
      .update({ role: nuevoRol })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar el rol:', error.message);
      alert('No se pudo actualizar el rol en la base de datos.');
    } else {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: nuevoRol } : u))
      );

      if (assignRole) {
        assignRole(id, nuevoRol);
      }
    }

    setUpdatingId(null);
  };

  if (!mounted || !user || user.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen px-6 py-12">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Encabezado Liquid Glass */}
        <div className="rounded-3xl liquid-glass p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-2">
              <span>✦</span> Control del Sistema
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-sm md:text-base text-slate-300/90 mt-1.5">
              Gestiona los roles de los usuarios registrados para que accedan como Estudiante o Tutor.
            </p>
          </div>

          <Link
            href="/asignaciones"
            className="inline-flex items-center justify-center liquid-glass-btn text-white text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-2xl whitespace-nowrap"
          >
            Asignar Tutores a Estudiantes →
          </Link>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-white tracking-wide">
              Usuarios del sistema ({usuarios.length})
            </h2>
          </div>

          {loading ? (
            <div className="liquid-glass rounded-3xl p-8 text-center">
              <p className="text-sm text-slate-300 font-medium">
                Cargando usuarios...
              </p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-8 text-center">
              <p className="text-sm text-slate-400 font-medium">
                No hay usuarios registrados.
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
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isTutor
                            ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                            : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-sm sm:text-base text-white font-bold">{u.nombre}</span>
                          <span
                            className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${
                              isTutor
                                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
                                : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300/80 mt-0.5">
                          @{u.usuario} · {u.correo}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center">
                      <button
                        onClick={() => cambiarRol(u.id, u.role)}
                        disabled={isUpdating}
                        className="text-xs font-bold liquid-glass-pill hover:bg-white/15 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-all cursor-pointer"
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
