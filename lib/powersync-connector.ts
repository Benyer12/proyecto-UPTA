import { PowerSyncBackendConnector, PowerSyncCredentials } from '@powersync/common';
import type { PowerSyncDatabase } from '@powersync/web';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lxwbytvbnytmtegdqtxc.supabase.co';
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4d2J5dHZibnl0bXRlZ2RxdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzc3NTMsImV4cCI6MjA5NzY1Mzc1M30.oJvbAQwPgjZJrVi-YTKR4Ad1dumDnSUZED-kiNPnJqM';

const globalForSupabase = globalThis as unknown as {
  __universoSupabaseClient?: SupabaseClient;
};

export const supabase =
  globalForSupabase.__universoSupabaseClient ?? createClient(supabaseUrl, supabaseKey);

globalForSupabase.__universoSupabaseClient = supabase;

const POWERSYNC_ENDPOINT =
  process.env.NEXT_PUBLIC_POWERSYNC_URL || 'https://6a4c67b449dca2d8a4177d63.powersync.journeyapps.com';

const ALLOWED_COLUMNS: Record<string, string[]> = {
  usuarios: ['nombre', 'usuario', 'correo', 'contrasena', 'role', 'status'],
  planetas: ['nombre', 'descripcion', 'total_niveles', 'materia', 'color', 'icono', 'orden'],
  niveles: ['planeta_id', 'numero_nivel', 'titulo', 'contenido', 'curso_nombre', 'nombre', 'descripcion', 'orden', 'es_jefe'],
  progreso_usuario: ['usuario_id', 'nivel_id', 'completado', 'estrellas', 'ultima_sesion'],
  tutor_estudiantes: ['tutor_id', 'estudiante_id', 'fecha_asignacion'],
};

function normalizePayloadForSupabase(table: string, opData: Record<string, any> | undefined) {
  const result: Record<string, any> = {};
  if (!opData) return result;

  const allowed = ALLOWED_COLUMNS[table] || Object.keys(opData);
  for (const key of allowed) {
    if (opData[key] === undefined) continue;
    if (table === 'usuarios' && key === 'status') {
      result.status = Boolean(Number(opData.status ?? 0)) && opData.status !== false && opData.status !== 0;
    } else if (table === 'progreso_usuario' && key === 'completado') {
      result.completado = Boolean(Number(opData.completado ?? 0)) && opData.completado !== false && opData.completado !== 0;
    } else if (table === 'niveles' && key === 'es_jefe') {
      result.es_jefe = Boolean(Number(opData.es_jefe ?? 0)) && opData.es_jefe !== false && opData.es_jefe !== 0;
    } else {
      result[key] = opData[key];
    }
  }
  return result;
}

export class AppSyncConnector implements PowerSyncBackendConnector {
  constructor(private db: PowerSyncDatabase) {}

  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    return {
      endpoint: POWERSYNC_ENDPOINT,
      token: session.access_token,
    };
  }

  async uploadData(database: any): Promise<void> {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
        const tabla = op.table;
        if (!ALLOWED_COLUMNS[tabla]) continue;

        const dataToSync = normalizePayloadForSupabase(tabla, op.opData);

        if (op.op === 'PUT') {
          if (tabla === 'progreso_usuario' && dataToSync.usuario_id && dataToSync.nivel_id !== undefined) {
            const { data: existente } = await supabase
              .from('progreso_usuario')
              .select('id')
              .eq('usuario_id', dataToSync.usuario_id)
              .eq('nivel_id', dataToSync.nivel_id)
              .maybeSingle();

            if (existente?.id) {
              const { error } = await supabase
                .from('progreso_usuario')
                .update(dataToSync)
                .eq('id', existente.id);
              if (error) throw error;
            } else {
              const { error } = await supabase.from('progreso_usuario').insert(dataToSync);
              if (error) throw error;
            }
          } else {
            const { error } = await supabase.from(tabla).insert({
              id: op.id,
              ...dataToSync,
            });
            if (error) throw error;
          }
        } else if (op.op === 'PATCH') {
          if (Object.keys(dataToSync).length > 0) {
            const { error } = await supabase.from(tabla).update(dataToSync).eq('id', op.id);
            if (error) throw error;
          }
        } else if (op.op === 'DELETE') {
          const { error } = await supabase.from(tabla).delete().eq('id', op.id);
          if (error) throw error;
        }
      }

      await transaction.complete();
    } catch (error) {
      console.warn('Sincronización PowerSync pausada hasta recuperar conexión:', error);
      throw error;
    }
  }
}
