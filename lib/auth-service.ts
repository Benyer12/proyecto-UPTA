import { db } from './powersync';
// IMPORTANTE: Asegúrate de que la ruta de importación coincida con donde tienes tu cliente de supabase
import { supabase } from './powersync-connector'; 

// 1. Definimos los dos caminos posibles para que TypeScript no se confunda
type LoginResult = 
  | { success: true; usuario: any }
  | { success: false; message: string };

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
    // 1. Buscamos al usuario directamente en la NUBE (Supabase), NO en PowerSync (db.get)
    const { data: usuarioNube, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('usuario', usuario) // ilike evita fallos por mayúsculas/minúsculas
      .single();

    if (errorBusqueda || !usuarioNube) {
      return { success: false, message: 'Usuario no encontrado en la nube.' };
    }

    // 2. Autenticamos en Supabase Auth con el correo recuperado de la nube
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: usuarioNube.correo,
      password: contrasena,
    });

    if (authError) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    // 3. Al autenticar con éxito, Supabase genera el token.
    // PowerSync lo detectará automáticamente e iniciará la sincronización local.
    return { success: true, usuario: usuarioNube };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
};