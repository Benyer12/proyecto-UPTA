import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verificarCredenciales, registrarUsuario } from './auth-service';
import type { LoginData, RegisterData } from '../shared/types';

interface LoginErrorInfo {
  code?: 'INACTIVE_ACCOUNT' | 'INVALID_CREDENTIALS' | 'NOT_FOUND' | 'ERROR';
  message: string;
  usuarioNombre?: string;
  usuarioRol?: string;
}

interface AuthState {
  user: {
    id: string | number;
    name: string;
    usuario: string;
    role: string;
    correo?: string;
  } | null;
  token: string | null;
  lastLoginError: LoginErrorInfo | null;
  lastRegisterError: string | null;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearLoginError: () => void;
  getRedirect: () => string;
  assignRole: (userId: string | number, newRole: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      lastLoginError: null,
      lastRegisterError: null,

      // 1. LOGIN GLOBAL (Conectado a Supabase vía auth-service)
      login: async (data: LoginData) => {
        set({ lastLoginError: null });
        const resultado = await verificarCredenciales(data.username, data.password);

        if (resultado.success && resultado.usuario) {
          if (resultado.usuario.role !== 'admin' && resultado.usuario.status === false) {
            set({
              lastLoginError: {
                code: 'INACTIVE_ACCOUNT',
                message:
                  'Tu cuenta se encuentra inactiva. Comunícate con un administrador para habilitar tu acceso.',
                usuarioNombre: resultado.usuario.nombre,
                usuarioRol: resultado.usuario.role,
              },
            });
            return false;
          }

          set({
            user: {
              id: resultado.usuario.id,
              name: resultado.usuario.nombre,
              usuario: resultado.usuario.usuario,
              role: resultado.usuario.role || 'student',
              correo: resultado.usuario.correo,
            },
            token: 'token-local-simulado',
            lastLoginError: null,
          });
          return true;
        }

        set({
          lastLoginError: !resultado.success
            ? {
                code: resultado.code,
                message: resultado.message,
                usuarioNombre: resultado.usuarioNombre,
                usuarioRol: resultado.usuarioRol,
              }
            : {
                code: 'INVALID_CREDENTIALS',
                message: 'Usuario o contraseña incorrectos.',
              },
        });
        return false;
      },

      // 2. REGISTRO GLOBAL (Conectado a Supabase vía auth-service)
      register: async (data: RegisterData) => {
        set({ lastRegisterError: null });
        const resultado = await registrarUsuario({
          nombre: data.name,
          correo: data.email,
          usuario: data.username,
          contrasena: data.password,
          role: 'student',
        });
        if (!resultado.success) {
          set({
            lastRegisterError:
              resultado.message || 'Error al crear la cuenta. Intenta con otro usuario.',
          });
        }
        return resultado.success;
      },

      logout: () => {
        set({ user: null, token: null, lastLoginError: null });
      },

      clearLoginError: () => {
        set({ lastLoginError: null });
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