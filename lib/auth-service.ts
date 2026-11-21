// Cliente de Supabase conectado al proyecto
import { supabase } from './powersync-connector'; 

// 1. Definimos los dos caminos posibles para que TypeScript no se confunda
export type LoginResult =
  | { success: true; usuario: any }
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

    // 1. Verificar que el usuario y correo no existan previamente en public.usuarios
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

    // 2. Registrar al usuario en Supabase Auth
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

    // 3. Guardar directamente en public.usuarios con status = false por defecto (Pendiente por aprobar)
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

    // 4. Cerrar cualquier sesión temporal hasta que un administrador apruebe la cuenta
    await supabase.auth.signOut().catch(() => {});

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// 2. Le asignamos el tipo : Promise<LoginResult> a la función de verificación
export const verificarCredenciales = async (usuario: string, contrasena: string): Promise<LoginResult> => {
  try {
    const cleanUser = usuario.trim();

    // 1. Buscamos al usuario directamente en la NUBE (Supabase), NO en PowerSync (db.get)
    const { data: usuarioNube, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('usuario', cleanUser) // ilike evita fallos por mayúsculas/minúsculas
      .single();

    if (errorBusqueda || !usuarioNube) {
      return {
        success: false,
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado en la nube.',
      };
    }

    // 2. Bloquear acceso a cuentas inactivas (status === false) para todos los roles excepto admin
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

    // 3. Autenticamos en Supabase Auth con el correo recuperado de la nube
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: usuarioNube.correo,
      password: contrasena,
    });

    if (authError) {
      return {
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Contraseña incorrecta.',
      };
    }

    // 4. Al autenticar con éxito, Supabase genera el token.
    // PowerSync lo detectará automáticamente e iniciará la sincronización local.
    return { success: true, usuario: usuarioNube };

  } catch (error: any) {
    return { success: false, code: 'ERROR', message: error.message };
  }
};