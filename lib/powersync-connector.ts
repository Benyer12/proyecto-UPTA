import { PowerSyncBackendConnector, PowerSyncCredentials } from '@powersync/common';
import { PowerSyncDatabase } from '@powersync/web';
import { createClient } from '@supabase/supabase-js';

// 1. Inicializa Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lxwbytvbnytmtegdqtxc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4d2J5dHZibnl0bXRlZ2RxdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzc3NTMsImV4cCI6MjA5NzY1Mzc1M30.oJvbAQwPgjZJrVi-YTKR4Ad1dumDnSUZED-kiNPnJqM';
export const supabase = createClient(supabaseUrl, supabaseKey);

export class AppSyncConnector implements PowerSyncBackendConnector {
  constructor(private db: PowerSyncDatabase) {}

  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!session) {
      console.warn("No hay sesión activa en Supabase. El usuario debe iniciar sesión.");
      return null; 
    }

    return {
      endpoint: 'https://6a4c67b449dca2d8a4177d63.powersync.journeyapps.com', 
      token: session.access_token
    };
  }

  // AQUÍ SE PROCESA LA SUBIDA FILTRADA
  async uploadData(database: any): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) return; 

    try {
      for (let op of transaction.crud) {
        const tabla = op.table; // 'usuarios'

        // SOLUCIÓN 2: Filtramos op.opData para enviar TODOS los datos que importan
        const dataToSync: any = {};
        if (op.opData.nombre !== undefined) dataToSync.nombre = op.opData.nombre;
        if (op.opData.usuario !== undefined) dataToSync.usuario = op.opData.usuario;
        if (op.opData.correo !== undefined) dataToSync.correo = op.opData.correo;
        if (op.opData.contrasena !== undefined) dataToSync.contrasena = op.opData.contrasena;
        if (op.opData.role !== undefined) dataToSync.role = op.opData.role;

        if (op.op === 'PUT') {
          // CORRECCIÓN CLAVE: Usar 'id' en vez de 'uuid'
          const { error } = await supabase.from(tabla).insert({
            id: op.id, 
            ...dataToSync
          });
          if (error) throw error;

        } else if (op.op === 'PATCH') {
          // CORRECCIÓN CLAVE: Buscar por 'id'
          const { error } = await supabase.from(tabla).update(dataToSync).eq('id', op.id);
          if (error) throw error;

        } else if (op.op === 'DELETE') {
          // CORRECCIÓN CLAVE: Eliminar buscando por 'id'
          const { error } = await supabase.from(tabla).delete().eq('id', op.id);
          if (error) throw error;
        }
      }

      // Si el lote se procesa de forma exitosa, cerramos la transacción
      await transaction.complete();
      console.log("✅ Datos sincronizados con Supabase correctamente.");

    } catch (error) {
        console.warn("Sincronización pausada: Error de subida a la base de datos remota.", error);
    }
  }
}