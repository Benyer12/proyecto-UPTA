import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verificarCredenciales, registrarUsuario } from './auth-service';
import type { LoginData, RegisterData } from '../shared/types';

interface AuthState {
  user: {
    id: string | number;
    name: string;
    usuario: string;
    role: string;
    correo?: string;
  } | null;
  token: string | null;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  getRedirect: () => string;
  assignRole: (userId: string | number, newRole: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      // 1. LOGIN GLOBAL (Conectado a Supabase vía auth-service)
      login: async (data: LoginData) => {
        const resultado = await verificarCredenciales(data.username, data.password);

        if (resultado.success && resultado.usuario) {
          set({
            user: {
              id: resultado.usuario.id,
              name: resultado.usuario.nombre,
              usuario: resultado.usuario.usuario,
              role: resultado.usuario.role || 'student',
              correo: resultado.usuario.correo,
            },
            token: 'token-local-simulado',
          });
          return true;
        }

        return false;
      },

      // 2. REGISTRO GLOBAL (Conectado a Supabase vía auth-service)
      register: async (data: RegisterData) => {
        const resultado = await registrarUsuario({
          nombre: data.name,
          correo: data.email,
          usuario: data.username,
          contrasena: data.password,
          role: 'student',
        });
        return resultado.success;
      },

      logout: () => {
        set({ user: null, token: null });
      },

      // Si el usuario modificado tiene sesión activa en este navegador, actualiza su rol
      assignRole: (userId: string | number, newRole: string) => {
        const currentUser = get().user;
        if (currentUser && currentUser.id === userId) {
          set({ user: { ...currentUser, role: newRole } });
        }
      },

      getRedirect: () => {
        const usuarioActual = get().user;
        if (!usuarioActual) return '/';
        if (usuarioActual.role === 'admin') return '/admin';
        if (usuarioActual.role === 'tutor' || usuarioActual.role === 'docente') return '/maestro';
        return '/dashboard';
      },
    }),
    {
      name: 'universo-auth-storage',
      // Solo persistimos la sesión del usuario actual para no guardar datos basura en caché
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);