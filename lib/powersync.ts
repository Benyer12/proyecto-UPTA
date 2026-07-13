

import { PowerSyncDatabase, Schema, Table, column, WASQLiteOpenFactory } from '@powersync/web';
import { AppSyncConnector } from './powersync-connector';

// 1. Definimos la tabla sin declarar el 'id'
// PowerSync lo inyecta y gestiona de forma 100% invisible y automática
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
    // 1. Inicializa la base de datos local
    await db.init();
    console.log('🌌 Base de datos local inicializada.');

    // 2. Crea la instancia de tu conector
    const connector = new AppSyncConnector(db);

    // 3. Conecta PowerSync a la nube
    await db.connect(connector);
    console.log('🔗 PowerSync conectado y listo para sincronizar.');

  } catch (error) {
    console.error('Error al inicializar PowerSync:', error);
  }
};

