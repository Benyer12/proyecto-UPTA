import { db } from './powersync';
// IMPORTANTE: Asegúrate de que la ruta de importación coincida con donde tienes tu cliente de supabase
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
    // PASO NUEVO: 1. Registrar al usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: datos.correo,
      password: datos.contrasena,
    });

    if (authError) {
      console.error('❌ Error de Supabase Auth al registrar:', authError.message);
      return { success: false, message: 'Error en la nube: ' + authError.message };
    }

    if (!db) return { success: false, message: 'Base de datos no disponible.' };

    // 2. Guardar en la BD local de PowerSync
    await db.execute(
      'INSERT INTO usuarios (id, nombre, correo, usuario, contrasena, role) VALUES (uuid(), ?, ?, ?, ?, ?)',
      [
        datos.nombre,
        datos.correo,
        datos.usuario,
        datos.contrasena,
        datos.role || 'student'
      ]
    );
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