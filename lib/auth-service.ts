import { supabase } from './powersync-connector';
import {
  esErrorDeRed,
  hayConexionInternet,
  sincronizarAlIniciarSesion,
  verificarCredencialesLocalOffline,
} from './offline-sync';
import { isLocalDbEnabled } from './settings-store';

export type LoginResult =
  | { success: true; usuario: any; offlineMode?: boolean }
  | {
      success: false;
      code?: 'INACTIVE_ACCOUNT' | 'INVALID_CREDENTIALS' | 'NOT_FOUND' | 'ERROR';
      message: string;
      usuarioNombre?: string;
      usuarioRol?: string;
    };

export const registrarUsuario = async (datos: {
  nombre: string;
  correo: string;
  usuario: string;
  contrasena: string;
  role: string;
}) => {
  try {
    if (!hayConexionInternet()) {
      return {
        success: false,
        message:
          'Sin conexión a internet. Necesitas internet la primera vez para registrar tu cuenta en Supabase.',
      };
    }

    const cleanNombre = datos.nombre.trim();
    const cleanCorreo = datos.correo.trim().toLowerCase();
    const cleanUsuario = datos.usuario.trim();
    const cleanContrasena = datos.contrasena;

    if (!cleanNombre || !cleanCorreo || !cleanUsuario || !cleanContrasena) {
      return { success: false, message: 'Todos los campos son obligatorios.' };
    }

    if (/\s/.test(cleanUsuario)) {
      return { success: false, message: 'El nombre de usuario no puede contener espacios.' };
    }

    const { data: dupUser } = await supabase
      .from('usuarios')
      .select('id')
      .ilike('usuario', cleanUsuario)
      .limit(1);

    if (dupUser && dupUser.length > 0) {
      return { success: false, message: 'Ese nombre de usuario ya está en uso.' };
    }

    const { data: dupEmail } = await supabase
      .from('usuarios')
      .select('id')
      .ilike('correo', cleanCorreo)
      .limit(1);

    if (dupEmail && dupEmail.length > 0) {
      return { success: false, message: 'Ese correo electrónico ya está registrado.' };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanCorreo,
      password: cleanContrasena,
    });

    if (authError) {
      console.error('Error de Supabase Auth al registrar:', authError.message);
      return { success: false, message: 'Error en la nube: ' + authError.message };
    }

    const newUserId =
      authData.user?.id ||
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : undefined);

    const payload: Record<string, any> = {
      nombre: cleanNombre,
      correo: cleanCorreo,
      usuario: cleanUsuario,
      contrasena: cleanContrasena,
      role: datos.role || 'student',
      status: false,
    };
    if (newUserId) {
      payload.id = newUserId;
    }

    const { error: insertError } = await supabase.from('usuarios').insert(payload);

    if (insertError) {
      console.error('Error al insertar usuario en Supabase:', insertError.message);
      return {
        success: false,
        message: 'No se pudo guardar el registro en la base de datos.',
      };
    }

    await supabase.auth.signOut().catch(() => {});

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const verificarCredenciales = async (
  usuario: string,
  contrasena: string,
): Promise<LoginResult> => {
  const cleanUser = usuario.trim();

  // Si no hay internet, autenticamos contra PowerSync SQLite local solo si el Modo PLUS (BD local) está activo
  if (!hayConexionInternet()) {
    if (!isLocalDbEnabled()) {
      return {
        success: false,
        code: 'ERROR',
        message:
          'Modo Solo en la Nube activo (BD local desactivada por administración). Conéctate a internet para iniciar sesión en Supabase.',
      };
    }
    const localRes = await verificarCredencialesLocalOffline(cleanUser, contrasena);
    if (localRes.success) {
      return { success: true, usuario: localRes.usuario, offlineMode: true };
    }
    return localRes;
  }

  try {
    // 1. Supabase siempre es la base principal cuando hay conexión
    const { data: usuarioNube, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('usuario', cleanUser)
      .single();

    if (errorBusqueda && esErrorDeRed(errorBusqueda)) {
      if (!isLocalDbEnabled()) {
        return {
          success: false,
          code: 'ERROR',
          message:
            'No hay conexión con Supabase y el modo Solo en la Nube tiene desactivada la base de datos local.',
        };
      }
      const localRes = await verificarCredencialesLocalOffline(cleanUser, contrasena);
      if (localRes.success) {
        return { success: true, usuario: localRes.usuario, offlineMode: true };
      }
      return localRes;
    }

    if (errorBusqueda || !usuarioNube) {
      return {
        success: false,
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado en la nube.',
      };
    }

    if (usuarioNube.role !== 'admin' && usuarioNube.status === false) {
      await supabase.auth.signOut().catch(() => {});
      const rolLegible =
        usuarioNube.role === 'tutor' || usuarioNube.role === 'docente'
          ? 'Tutor'
          : 'Estudiante';
      return {
        success: false,
        code: 'INACTIVE_ACCOUNT',
        usuarioNombre: usuarioNube.nombre,
        usuarioRol: usuarioNube.role,
        message: `La cuenta de ${rolLegible} (${usuarioNube.nombre}) está desactivada actualmente. Un administrador restringió su acceso; comunícate con administración para reactivarla.`,
      };
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: usuarioNube.correo,
      password: contrasena,
    });

    if (authError) {
      if (esErrorDeRed(authError)) {
        if (!isLocalDbEnabled()) {
          return {
            success: false,
            code: 'ERROR',
            message:
              'Error de red con Supabase. La base de datos local está desactivada (Modo Solo en la Nube).',
          };
        }
        const localRes = await verificarCredencialesLocalOffline(cleanUser, contrasena);
        if (localRes.success) {
          return { success: true, usuario: localRes.usuario, offlineMode: true };
        }
        return localRes;
      }

      return {
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Contraseña incorrecta.',
      };
    }

    const usuarioParaCache = {
      ...usuarioNube,
      contrasena: usuarioNube.contrasena || contrasena,
    };

    // Deposita inmediatamente tablas de Supabase en la BD secundaria local solo si Modo PLUS está activo
    if (isLocalDbEnabled()) {
      void sincronizarAlIniciarSesion(usuarioParaCache);
    }

    return { success: true, usuario: usuarioParaCache, offlineMode: false };
  } catch (error: any) {
    if (esErrorDeRed(error)) {
      if (!isLocalDbEnabled()) {
        return {
          success: false,
          code: 'ERROR',
          message:
            'No hay conexión con Supabase y la base de datos local está desactivada (Modo Solo en la Nube).',
        };
      }
      const localRes = await verificarCredencialesLocalOffline(cleanUser, contrasena);
      if (localRes.success) {
        return { success: true, usuario: localRes.usuario, offlineMode: true };
      }
      return localRes;
    }
    return { success: false, code: 'ERROR', message: error.message };
  }
};
