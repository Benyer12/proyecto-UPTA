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
    console.log('✅ Usuario guardado exitosamente en la BD local y en Supabase Auth.');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error de SQL al guardar usuario:', error);
    return { success: false, message: error.message };
  }
};

// 2. Le asignamos el tipo : Promise<LoginResult> a la función de verificación
export const verificarCredenciales = async (usuario: string, contrasena: string): Promise<LoginResult> => {
  try {
    // 1. Buscar en la BD local primero para obtener el correo del usuario
    const resultado = await db.get(
      'SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?',
      [usuario, contrasena]
    );

    if (resultado) {
      // PASO NUEVO: 2. Iniciar sesión silenciosamente en Supabase Auth usando el correo obtenido
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: (resultado as any).correo, // <--- Aquí está el truco
        password: contrasena,
      });

      if (authError) {
         console.warn('⚠️ Login local exitoso, pero no se pudo iniciar sesión en Supabase Auth:', authError.message);
      } else {
         console.log('✅ Sesión iniciada en Supabase Auth correctamente');
      }

      console.log('✅ Usuario encontrado en la BD local:', resultado);
      return { success: true, usuario: resultado };
    } else {
      console.log('❌ Credenciales incorrectas o usuario no existe.');
      return { success: false, message: 'Usuario o contraseña incorrectos.' };
    }
  } catch (error: any) {
    console.error('❌ Error al consultar la BD local:', error);
    return { success: false, message: error.message };
  }
};