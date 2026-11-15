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
    <div className="min-h-screen bg-[#00000a] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-sm text-slate-400">
              Gestiona los roles de los usuarios registrados para que accedan como Estudiante o Tutor.
            </p>
          </div>

          <Link
            href="/asignaciones"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            Asignar Tutores a Estudiantes →
          </Link>
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-4">
            Usuarios del sistema ({usuarios.length})
          </h2>

          {loading ? (
            <p className="text-sm text-slate-400 bg-white/5 rounded-xl p-6 border border-white/10">
              Cargando usuarios...
            </p>
          ) : usuarios.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white/5 rounded-xl p-6 border border-white/10">
              No hay usuarios registrados.
            </p>
          ) : (
            <div className="space-y-2">
              {usuarios.map((u) => {
                const isTutor = u.role === 'tutor' || u.role === 'docente';
                const isUpdating = updatingId === u.id;

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isTutor ? 'bg-blue-400' : 'bg-green-400'
                        }`}
                      />
                      <div>
                        <span className="text-sm text-white font-medium">{u.nombre}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          @{u.usuario} · {u.correo}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase text-slate-500 font-semibold">
                        {u.role}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => cambiarRol(u.id, u.role)}
                        disabled={isUpdating}
                        className="text-[10px] bg-white/10 hover:bg-white/20 disabled:opacity-50 text-slate-300 px-3 py-1.5 rounded transition-colors"
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