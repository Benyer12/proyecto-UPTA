import { db } from './powersync';

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
    console.log('✅ Usuario guardado exitosamente en la BD local.');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error de SQL al guardar usuario:', error);
    return { success: false, message: error.message };
  }
};

// 2. Le asignamos el tipo : Promise<LoginResult> a la función de verificación
export const verificarCredenciales = async (usuario: string, contrasena: string): Promise<LoginResult> => {
  try {
    const resultado = await db.get(
      'SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?',
      [usuario, contrasena]
    );

    if (resultado) {
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