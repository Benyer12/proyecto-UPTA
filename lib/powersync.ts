import { PowerSyncDatabase, Schema, Table, column } from '@powersync/web';
import { AppSyncConnector, supabase } from './powersync-connector';
import { isLocalDbEnabled } from './settings-store';

// Tablas principales sincronizadas en PowerSync (espejo directo de Supabase)
const usuarios = new Table({
  nombre: column.text,
  correo: column.text,
  usuario: column.text,
  contrasena: column.text,
  role: column.text,
  status: column.integer,
});

const planetas = new Table({
  nombre: column.text,
  descripcion: column.text,
  total_niveles: column.integer,
  materia: column.text,
  color: column.text,
  icono: column.text,
  orden: column.integer,
});

const niveles = new Table({
  planeta_id: column.integer,
  numero_nivel: column.integer,
  titulo: column.text,
  contenido: column.text,
  curso_nombre: column.text,
  nombre: column.text,
  descripcion: column.text,
  orden: column.integer,
  es_jefe: column.integer,
});

const progreso_usuario = new Table(
  {
    usuario_id: column.text,
    nivel_id: column.integer,
    completado: column.integer,
    estrellas: column.integer,
    ultima_sesion: column.text,
  },
  { indexes: { by_user_level: ['usuario_id', 'nivel_id'] } },
);

const tutor_estudiantes = new Table(
  {
    tutor_id: column.text,
    estudiante_id: column.text,
    fecha_asignacion: column.text,
  },
  { indexes: { by_tutor: ['tutor_id'], by_student: ['estudiante_id'] } },
);

// Tablas locales en la misma SQLite/IndexedDB (localOnly: nunca disparan subidas automáticas si no hay cambios nuevos locales)
const local_usuarios = new Table(
  {
    nombre: column.text,
    correo: column.text,
    usuario: column.text,
    contrasena: column.text,
    role: column.text,
    status: column.integer,
  },
  { localOnly: true, indexes: { by_usuario: ['usuario'] } },
);

const local_planetas = new Table(
  {
    nombre: column.text,
    descripcion: column.text,
    materia: column.text,
    color: column.text,
    icono: column.text,
    orden: column.integer,
    raw_json: column.text,
  },
  { localOnly: true },
);

const local_niveles = new Table(
  {
    planeta_id: column.integer,
    curso_nombre: column.text,
    nombre: column.text,
    descripcion: column.text,
    orden: column.integer,
    es_jefe: column.integer,
    raw_json: column.text,
  },
  { localOnly: true, indexes: { by_planeta: ['planeta_id'] } },
);

const local_progreso_usuario = new Table(
  {
    usuario_id: column.text,
    nivel_id: column.integer,
    completado: column.integer,
    estrellas: column.integer,
    ultima_sesion: column.text,
  },
  { localOnly: true, indexes: { by_user_level: ['usuario_id', 'nivel_id'] } },
);

const local_tutor_estudiantes = new Table(
  {
    tutor_id: column.text,
    estudiante_id: column.text,
    fecha_asignacion: column.text,
  },
  { localOnly: true, indexes: { by_tutor: ['tutor_id'], by_student: ['estudiante_id'] } },
);

// Cola exclusiva de mutaciones hechas sin conexión o cuando Supabase falló por red
const local_outbox = new Table(
  {
    tabla: column.text,
    operacion: column.text,
    row_id: column.text,
    payload_json: column.text,
    created_at: column.text,
  },
  { localOnly: true, indexes: { by_tabla_row: ['tabla', 'row_id'] } },
);

// Banco local de preguntas en SQLite/IndexedDB (sincronizado desde JSON/IA para juego offline)
const local_preguntas_json = new Table(
  {
    planeta: column.text,
    tipo: column.text,
    nivel_dificultad: column.integer,
    payload_json: column.text,
    updated_at: column.text,
  },
  { localOnly: true, indexes: { by_planeta_tipo: ['planeta', 'tipo'] } },
);

const local_sync_meta = new Table(
  {
    clave: column.text,
    valor: column.text,
    updated_at: column.text,
  },
  { localOnly: true },
);

export const AppSchema = new Schema({
  usuarios,
  planetas,
  niveles,
  progreso_usuario,
  tutor_estudiantes,
  local_usuarios,
  local_planetas,
  local_niveles,
  local_progreso_usuario,
  local_tutor_estudiantes,
  local_outbox,
  local_preguntas_json,
  local_sync_meta,
});

export const db: PowerSyncDatabase | null =
  typeof window !== 'undefined'
    ? new PowerSyncDatabase({
        database: {
          dbFilename: 'universo_conocimiento.sqlite',
        },
        schema: AppSchema,
      })
    : null;

let initPromise: Promise<PowerSyncDatabase | null> | null = null;
let connectorInstance: AppSyncConnector | null = null;
let isConnectedToPowerSync = false;

export async function asegurarPowerSyncListo(): Promise<PowerSyncDatabase | null> {
  if (!db || typeof window === 'undefined' || !isLocalDbEnabled()) return null;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        await db.init();
        return db;
      } catch (error) {
        console.warn('Aviso al inicializar PowerSync SQLite local:', error);
        return null;
      }
    })();
  }

  const readyDb = await initPromise;
  if (!readyDb) {
    initPromise = null;
  }
  return readyDb;
}

export async function desconectarPowerSync() {
  isConnectedToPowerSync = false;
  if (!db || typeof window === 'undefined') return;
  try {
    await db.disconnect();
  } catch {}
}

export async function conectarPowerSyncBridge() {
  if (!isLocalDbEnabled()) {
    await desconectarPowerSync();
    return;
  }
  const readyDb = await asegurarPowerSyncListo();
  if (!readyDb || isConnectedToPowerSync) return;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    if (!connectorInstance) {
      connectorInstance = new AppSyncConnector(readyDb);
    }

    await readyDb.connect(connectorInstance);
    isConnectedToPowerSync = true;
  } catch (error) {
    console.warn('PowerSync puente en espera de conexión/sesión:', error);
  }
}

export const inicializarBaseDatos = async () => {
  if (!isLocalDbEnabled()) {
    await desconectarPowerSync();
    return;
  }
  await asegurarPowerSyncListo();
  await conectarPowerSyncBridge();
};
