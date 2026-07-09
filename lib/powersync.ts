
import { PowerSyncDatabase, Schema, Table, column } from '@powersync/web';

// 1. Definimos la tabla con la sintaxis moderna de objetos
// PowerSync gestiona el 'id' automáticamente, no necesitas declararlo aquí
const usuarios = new Table({
  nombre: column.text,
  correo: column.text,
  usuario: column.text,
  contrasena: column.text,
  role: column.text
});

// 2. Definimos el esquema
export const AppSchema = new Schema({
  usuarios
});

// 3. Instancia de la base de datos
export const db = new PowerSyncDatabase({
  database: {
    dbFilename: 'universo_conocimiento.sqlite'
  },
  schema: AppSchema
});

// 4. Función de inicialización
export const inicializarBaseDatos = async () => {
  try {
    await db.init();
    console.log('🌌 Base de datos local inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar PowerSync:', error);
  }
};