'use client';

import {
  asegurarPowerSyncListo,
  conectarPowerSyncBridge,
  desconectarPowerSync,
} from './powersync';
import { supabase, supabaseKey, supabaseUrl } from './powersync-connector';
import { MOCK_PLANETS, MOCK_PROGRESS } from './mock-data';
import type { Planet, StudentProgress } from '../shared/types';
import { actualizarProgresoUsuario } from '../app/actions/progress';
import { isLocalDbEnabled } from './settings-store';

export interface SyncStatusState {
  online: boolean;
  pendingCount: number;
  syncing: boolean;
  lastSyncedAt: string | null;
  lastMessage: string | null;
}

export interface LocalUsuarioRow {
  id: string;
  nombre: string;
  correo: string;
  usuario: string;
  contrasena: string;
  role: string;
  status: boolean | null;
}

export interface LocalProgresoRow {
  id: string;
  usuario_id: string;
  nivel_id: number;
  completado: boolean;
  estrellas: number;
  ultima_sesion: string | null;
}

export interface LocalRelacionTutorRow {
  id: string | number;
  tutor_id: string;
  estudiante_id: string;
  fecha_asignacion: string | null;
}

interface OutboxRow {
  id: string;
  tabla: string;
  operacion: string;
  row_id: string;
  payload_json: string;
  created_at: string;
}

let currentStatus: SyncStatusState = {
  online: true,
  pendingCount: 0,
  syncing: false,
  lastSyncedAt: null,
  lastMessage: null,
};

let realOnlineVerified: boolean = true;
let probePromise: Promise<boolean> | null = null;
let syncMutex: Promise<{ syncedCount: number; remainingCount: number }> | null = null;
let lastDepositTimestamp = 0;

function notifySyncListeners(patch?: Partial<SyncStatusState>) {
  if (patch) {
    currentStatus = { ...currentStatus, ...patch };
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('universo-sync-status', { detail: currentStatus }),
    );
  }
}

export function marcarConexionReal(isOnline: boolean) {
  realOnlineVerified = isOnline;
  if (currentStatus.online !== isOnline) {
    notifySyncListeners({ online: isOnline });
  }
}

/**
 * Verifica conectividad real haciendo ping HTTP a Supabase (sin depender de navigator.onLine,
 * que en Windows con VPNs o adaptadores virtuales suele reportar false falsamente).
 */
export async function comprobarConexionReal(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  if (probePromise) return probePromise;

  probePromise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/usuarios?select=id&limit=1`,
        {
          method: 'GET',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: 'no-store',
          signal: controller.signal,
        },
      );
      clearTimeout(timer);
      const isOnline = res.status > 0;
      marcarConexionReal(isOnline);
      return isOnline;
    } catch {
      clearTimeout(timer);
      marcarConexionReal(false);
      return false;
    } finally {
      probePromise = null;
    }
  })();

  return probePromise;
}

export function obtenerEstadoSyncActual(): SyncStatusState {
  return {
    ...currentStatus,
    online: realOnlineVerified,
  };
}

export function hayConexionInternet(): boolean {
  if (typeof window === 'undefined') return true;
  return realOnlineVerified;
}

export function esErrorDeRed(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : String(error || '');
  const lower = msg.toLowerCase();
  const esRed =
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed') ||
    lower.includes('err_internet_disconnected') ||
    lower.includes('fetch failed') ||
    lower.includes('timeout') ||
    lower.includes('aborterror');

  if (esRed) {
    marcarConexionReal(false);
  }
  return esRed;
}

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `loc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function refreshPendingCount() {
  const db = await asegurarPowerSyncListo();
  if (!db) return 0;
  try {
    const row = await db.getOptional<{ total: number }>(
      'SELECT COUNT(*) as total FROM local_outbox',
    );
    const total = Number(row?.total) || 0;
    notifySyncListeners({
      online: hayConexionInternet(),
      pendingCount: total,
    });
    return total;
  } catch {
    return currentStatus.pendingCount;
  }
}

async function enqueueOutbox(
  tabla: 'usuarios' | 'progreso_usuario' | 'tutor_estudiantes',
  operacion: 'PUT' | 'PATCH' | 'DELETE' | 'UPSERT' | 'ASSIGN' | 'UNASSIGN',
  rowId: string,
  payload: Record<string, any>,
) {
  if (!isLocalDbEnabled()) return;
  const db = await asegurarPowerSyncListo();
  if (!db) return;

  const now = new Date().toISOString();
  await db.writeTransaction(async (tx) => {
    const existing = await tx.getOptional<OutboxRow>(
      'SELECT * FROM local_outbox WHERE tabla = ? AND row_id = ? LIMIT 1',
      [tabla, rowId],
    );

    if (existing) {
      let mergedPayload = payload;
      let mergedOp = operacion;

      if (operacion === 'PATCH' && existing.operacion !== 'DELETE') {
        try {
          const prev = JSON.parse(existing.payload_json || '{}');
          mergedPayload = { ...prev, ...payload };
          mergedOp = existing.operacion as typeof operacion;
        } catch {
          mergedPayload = payload;
        }
      }

      await tx.execute(
        'UPDATE local_outbox SET operacion = ?, payload_json = ?, created_at = ? WHERE id = ?',
        [mergedOp, JSON.stringify(mergedPayload), now, existing.id],
      );
    } else {
      await tx.execute(
        'INSERT INTO local_outbox (id, tabla, operacion, row_id, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [makeUuid(), tabla, operacion, rowId, JSON.stringify(payload), now],
      );
    }
  });

  await refreshPendingCount();
}

export async function sincronizarPendientesASupabase(): Promise<{
  syncedCount: number;
  remainingCount: number;
}> {
  if (!isLocalDbEnabled()) return { syncedCount: 0, remainingCount: 0 };
  if (syncMutex) return syncMutex;

  syncMutex = (async () => {
    const db = await asegurarPowerSyncListo();
    if (!db) return { syncedCount: 0, remainingCount: 0 };

    if (!hayConexionInternet()) {
      const remainingCount = await refreshPendingCount();
      notifySyncListeners({ online: false, syncing: false, pendingCount: remainingCount });
      return { syncedCount: 0, remainingCount };
    }

    const items = await db.getAll<OutboxRow>(
      'SELECT * FROM local_outbox ORDER BY created_at ASC',
    );

    // Regla clave: si NO hay datos nuevos locales, la BD local NO envía nada a Supabase
    if (!items || items.length === 0) {
      notifySyncListeners({ online: true, syncing: false, pendingCount: 0 });
      return { syncedCount: 0, remainingCount: 0 };
    }

    notifySyncListeners({ online: true, syncing: true, pendingCount: items.length });

    // Ordenamos por dependencias: usuarios -> tutor_estudiantes -> progreso_usuario
    const priority: Record<string, number> = {
      usuarios: 0,
      tutor_estudiantes: 1,
      progreso_usuario: 2,
    };
    const ordered = [...items].sort(
      (a, b) => (priority[a.tabla] ?? 9) - (priority[b.tabla] ?? 9),
    );

    let syncedCount = 0;

    for (const item of ordered) {
      let payload: Record<string, any> = {};
      try {
        payload = JSON.parse(item.payload_json || '{}');
      } catch {
        payload = {};
      }

      try {
        if (item.tabla === 'usuarios') {
          if (item.operacion === 'PATCH') {
            const updatePayload: Record<string, any> = {};
            for (const key of ['nombre', 'usuario', 'correo', 'contrasena', 'role', 'status']) {
              if (payload[key] !== undefined) updatePayload[key] = payload[key];
            }
            if (Object.keys(updatePayload).length > 0) {
              const { error } = await supabase
                .from('usuarios')
                .update(updatePayload)
                .eq('id', item.row_id);
              if (error) throw error;
            }
          } else if (item.operacion === 'DELETE') {
            const { error } = await supabase
              .from('usuarios')
              .delete()
              .eq('id', item.row_id);
            if (error) throw error;
          } else if (item.operacion === 'PUT') {
            const { error } = await supabase
              .from('usuarios')
              .upsert({ id: item.row_id, ...payload }, { onConflict: 'id' });
            if (error) throw error;
          }
        } else if (item.tabla === 'tutor_estudiantes') {
          const estudianteId = String(payload.estudiante_id || item.row_id);
          const tutorId = String(payload.tutor_id || '');
          if (item.operacion === 'UNASSIGN') {
            const q = supabase
              .from('tutor_estudiantes')
              .delete()
              .eq('estudiante_id', estudianteId);
            const { error } = tutorId ? await q.eq('tutor_id', tutorId) : await q;
            if (error) throw error;
          } else if (item.operacion === 'ASSIGN' && tutorId) {
            await supabase
              .from('tutor_estudiantes')
              .delete()
              .eq('estudiante_id', estudianteId);
            const { error } = await supabase.from('tutor_estudiantes').insert({
              tutor_id: tutorId,
              estudiante_id: estudianteId,
              fecha_asignacion: payload.fecha_asignacion || new Date().toISOString(),
            });
            if (error) throw error;
          }
        } else if (item.tabla === 'progreso_usuario') {
          const usuarioId = String(payload.usuario_id || '');
          const nivelId = Number(payload.nivel_id);
          const completado = Boolean(payload.completado);
          const estrellas = Number(payload.estrellas) || 0;
          const ultimaSesion = String(payload.ultima_sesion || new Date().toISOString());

          if (usuarioId && Number.isFinite(nivelId)) {
            const { data: existente, error: errFind } = await supabase
              .from('progreso_usuario')
              .select('id, estrellas')
              .eq('usuario_id', usuarioId)
              .eq('nivel_id', nivelId)
              .maybeSingle();

            if (errFind) throw errFind;

            const estrellasFinales = Math.max(Number(existente?.estrellas) || 0, estrellas);

            if (existente?.id) {
              const { error: errUpd } = await supabase
                .from('progreso_usuario')
                .update({
                  completado,
                  estrellas: estrellasFinales,
                  ultima_sesion: ultimaSesion,
                })
                .eq('id', existente.id);
              if (errUpd) throw errUpd;
            } else {
              const { error: errIns } = await supabase.from('progreso_usuario').insert({
                usuario_id: usuarioId,
                nivel_id: nivelId,
                completado,
                estrellas: estrellasFinales,
                ultima_sesion: ultimaSesion,
              });
              if (errIns) throw errIns;
            }
          }
        }

        await db.execute('DELETE FROM local_outbox WHERE id = ?', [item.id]);
        syncedCount += 1;
      } catch (err) {
        if (esErrorDeRed(err)) {
          break;
        }
        console.warn('Error al sincronizar operación pendiente:', item.tabla, err);
        break;
      }
    }

    const remainingCount = await refreshPendingCount();
    notifySyncListeners({
      online: hayConexionInternet(),
      syncing: false,
      pendingCount: remainingCount,
      lastSyncedAt: syncedCount > 0 ? new Date().toISOString() : currentStatus.lastSyncedAt,
      lastMessage:
        syncedCount > 0
          ? `${syncedCount} ${syncedCount === 1 ? 'cambio local subido' : 'cambios locales subidos'} a Supabase.`
          : currentStatus.lastMessage,
    });

    return { syncedCount, remainingCount };
  })().finally(() => {
    syncMutex = null;
  });

  return syncMutex;
}

async function seedPlanetasYNivelesLocalesSiVacio(
  supabasePlanetas?: any[] | null,
  supabaseNiveles?: any[] | null,
) {
  if (!isLocalDbEnabled()) return;
  const db = await asegurarPowerSyncListo();
  if (!db) return;

  await db.writeTransaction(async (tx) => {
    if (supabasePlanetas && supabasePlanetas.length > 0) {
      await tx.execute('DELETE FROM local_planetas');
      for (const p of supabasePlanetas) {
        await tx.execute(
          'INSERT INTO local_planetas (id, nombre, descripcion, materia, color, icono, orden, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            String(p.id),
            p.nombre || p.name || '',
            p.descripcion || p.description || '',
            p.materia || p.short_description || p.shortDescription || '',
            p.color || '#00f5ff',
            p.icono || p.icon || '',
            Number(p.orden ?? p.order ?? p.id) || 0,
            JSON.stringify(p),
          ],
        );
      }
    } else {
      const existing = await tx.getOptional<{ total: number }>(
        'SELECT COUNT(*) as total FROM local_planetas',
      );
      if (!existing || Number(existing.total) === 0) {
        for (const p of MOCK_PLANETS) {
          await tx.execute(
            'INSERT INTO local_planetas (id, nombre, descripcion, materia, color, icono, orden, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              String(p.id),
              p.name,
              p.description,
              p.shortDescription,
              p.color,
              p.icon,
              p.order,
              JSON.stringify(p),
            ],
          );
        }
      }
    }

    if (supabaseNiveles && supabaseNiveles.length > 0) {
      await tx.execute('DELETE FROM local_niveles');
      for (const n of supabaseNiveles) {
        await tx.execute(
          'INSERT INTO local_niveles (id, planeta_id, curso_nombre, nombre, descripcion, orden, es_jefe, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            String(n.id),
            Number(n.planeta_id ?? n.planet_id ?? 1) || 1,
            n.curso_nombre || n.course_name || '',
            n.nombre || n.name || `Nivel ${n.id}`,
            n.descripcion || n.description || '',
            Number(n.orden ?? n.order ?? n.id) || 0,
            n.es_jefe || n.is_boss ? 1 : 0,
            JSON.stringify(n),
          ],
        );
      }
    } else {
      const existingNiv = await tx.getOptional<{ total: number }>(
        'SELECT COUNT(*) as total FROM local_niveles',
      );
      if (!existingNiv || Number(existingNiv.total) === 0) {
        for (const p of MOCK_PLANETS) {
          for (const c of p.courses) {
            for (const lvl of c.levels) {
              await tx.execute(
                'INSERT INTO local_niveles (id, planeta_id, curso_nombre, nombre, descripcion, orden, es_jefe, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                  String(lvl.id),
                  p.id,
                  c.name,
                  lvl.name,
                  lvl.description,
                  lvl.order,
                  lvl.isBoss ? 1 : 0,
                  JSON.stringify(lvl),
                ],
              );
            }
          }
        }
      }
    }
  });
}

async function getPendingTablesSet(): Promise<Set<string>> {
  const db = await asegurarPowerSyncListo();
  const pending = new Set<string>();
  if (!db) return pending;
  try {
    const rows = await db.getAll<{ tabla: string }>(
      'SELECT DISTINCT tabla FROM local_outbox',
    );
    rows.forEach((r) => pending.add(r.tabla));
  } catch {}
  return pending;
}

async function cacheUsuariosInLocal(rows: LocalUsuarioRow[]) {
  const db = await asegurarPowerSyncListo();
  if (!db) return;
  const pendingTables = await getPendingTablesSet();
  if (pendingTables.has('usuarios')) return;

  await db.writeTransaction(async (tx) => {
    await tx.execute('DELETE FROM local_usuarios');
    for (const u of rows) {
      await tx.execute(
        'INSERT INTO local_usuarios (id, nombre, correo, usuario, contrasena, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          String(u.id),
          u.nombre || '',
          u.correo || '',
          u.usuario || '',
          u.contrasena || '',
          u.role || 'student',
          u.status === false ? 0 : 1,
        ],
      );
    }
  });
}

async function cacheProgresoInLocal(
  rows: LocalProgresoRow[],
  scopeUserId?: string,
) {
  const db = await asegurarPowerSyncListo();
  if (!db) return;
  const pendingTables = await getPendingTablesSet();
  if (pendingTables.has('progreso_usuario')) return;

  await db.writeTransaction(async (tx) => {
    if (scopeUserId) {
      await tx.execute('DELETE FROM local_progreso_usuario WHERE usuario_id = ?', [
        scopeUserId,
      ]);
    } else {
      await tx.execute('DELETE FROM local_progreso_usuario');
    }

    for (const p of rows) {
      await tx.execute(
        'INSERT INTO local_progreso_usuario (id, usuario_id, nivel_id, completado, estrellas, ultima_sesion) VALUES (?, ?, ?, ?, ?, ?)',
        [
          String(p.id),
          String(p.usuario_id),
          Number(p.nivel_id) || 0,
          p.completado ? 1 : 0,
          Number(p.estrellas) || 0,
          p.ultima_sesion || null,
        ],
      );
    }
  });
}

async function cacheAsignacionesInLocal(rows: LocalRelacionTutorRow[]) {
  const db = await asegurarPowerSyncListo();
  if (!db) return;
  const pendingTables = await getPendingTablesSet();
  if (pendingTables.has('tutor_estudiantes')) return;

  await db.writeTransaction(async (tx) => {
    await tx.execute('DELETE FROM local_tutor_estudiantes');
    for (const r of rows) {
      await tx.execute(
        'INSERT INTO local_tutor_estudiantes (id, tutor_id, estudiante_id, fecha_asignacion) VALUES (?, ?, ?, ?)',
        [
          String(r.id),
          String(r.tutor_id),
          String(r.estudiante_id),
          r.fecha_asignacion || null,
        ],
      );
    }
  });
}

/**
 * Descarga las 5 tablas de Supabase y las deposita en la BD secundaria local (PowerSync SQLite en IndexedDB).
 * Siempre sube pendientes locales primero; si no hay pendientes, solo descarga sin enviar datos a Supabase.
 */
export async function depositarSupabaseEnLocal(options?: {
  usuarioId?: string;
  force?: boolean;
}) {
  if (!isLocalDbEnabled()) return;
  await seedPlanetasYNivelesLocalesSiVacio();

  if (!hayConexionInternet()) {
    notifySyncListeners({ online: false });
    return;
  }

  const nowMs = Date.now();
  if (!options?.force && nowMs - lastDepositTimestamp < 4000) {
    return;
  }

  await sincronizarPendientesASupabase();

  const pendingAfter = await getPendingTablesSet();

  try {
    const [resPlanetas, resNiveles, resUsuarios, resRelaciones, resProgreso] =
      await Promise.all([
        supabase.from('planetas').select('*'),
        supabase.from('niveles').select('*'),
        pendingAfter.has('usuarios')
          ? Promise.resolve({ data: null, error: null })
          : supabase
              .from('usuarios')
              .select('id, nombre, correo, usuario, contrasena, role, status'),
        pendingAfter.has('tutor_estudiantes')
          ? Promise.resolve({ data: null, error: null })
          : supabase
              .from('tutor_estudiantes')
              .select('id, tutor_id, estudiante_id, fecha_asignacion'),
        pendingAfter.has('progreso_usuario')
          ? Promise.resolve({ data: null, error: null })
          : options?.usuarioId
            ? supabase
                .from('progreso_usuario')
                .select('id, usuario_id, nivel_id, completado, estrellas, ultima_sesion')
                .eq('usuario_id', options.usuarioId)
            : supabase
                .from('progreso_usuario')
                .select('id, usuario_id, nivel_id, completado, estrellas, ultima_sesion'),
      ]);

    await seedPlanetasYNivelesLocalesSiVacio(
      resPlanetas.data as any[] | null,
      resNiveles.data as any[] | null,
    );

    if (resUsuarios.data) {
      await cacheUsuariosInLocal(resUsuarios.data as LocalUsuarioRow[]);
    }
    if (resRelaciones.data) {
      await cacheAsignacionesInLocal(resRelaciones.data as LocalRelacionTutorRow[]);
    }
    if (resProgreso.data) {
      await cacheProgresoInLocal(
        resProgreso.data as LocalProgresoRow[],
        options?.usuarioId,
      );
    }

    lastDepositTimestamp = Date.now();
    await conectarPowerSyncBridge();

    const db = await asegurarPowerSyncListo();
    if (db) {
      await db.execute(
        'INSERT OR REPLACE INTO local_sync_meta (id, clave, valor, updated_at) VALUES (?, ?, ?, ?)',
        ['last_deposit', 'last_deposit', new Date().toISOString(), new Date().toISOString()],
      );
    }

    notifySyncListeners({
      online: true,
      lastSyncedAt: currentStatus.lastSyncedAt || new Date().toISOString(),
    });
  } catch (err) {
    if (!esErrorDeRed(err)) {
      console.warn('Aviso al depositar datos de Supabase en BD local:', err);
    }
  }
}

export async function sincronizarAlIniciarSesion(usuarioNube: Record<string, any>) {
  if (!isLocalDbEnabled()) return;
  const db = await asegurarPowerSyncListo();
  if (db && usuarioNube?.id) {
    try {
      await db.writeTransaction(async (tx) => {
        await tx.execute(
          'INSERT OR REPLACE INTO local_usuarios (id, nombre, correo, usuario, contrasena, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            String(usuarioNube.id),
            String(usuarioNube.nombre || ''),
            String(usuarioNube.correo || ''),
            String(usuarioNube.usuario || ''),
            String(usuarioNube.contrasena || ''),
            String(usuarioNube.role || 'student'),
            usuarioNube.status === false ? 0 : 1,
          ],
        );
      });
    } catch {}
  }

  const isStaff = usuarioNube?.role === 'admin' || usuarioNube?.role === 'tutor' || usuarioNube?.role === 'docente';
  void depositarSupabaseEnLocal({
    usuarioId: isStaff ? undefined : String(usuarioNube.id),
    force: true,
  });
}

/* ════════════════════════ AUTH OFFLINE ════════════════════════ */

export async function verificarCredencialesLocalOffline(
  usuario: string,
  contrasena: string,
): Promise<
  | { success: true; usuario: LocalUsuarioRow }
  | {
      success: false;
      code: 'INACTIVE_ACCOUNT' | 'INVALID_CREDENTIALS' | 'NOT_FOUND';
      message: string;
      usuarioNombre?: string;
      usuarioRol?: string;
    }
> {
  const db = await asegurarPowerSyncListo();
  const cleanUser = usuario.trim().toLowerCase();

  if (!db) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Sin conexión a internet y la base de datos local aún no tiene usuarios guardados.',
    };
  }

  let found = await db.getOptional<{
    id: string;
    nombre: string;
    correo: string;
    usuario: string;
    contrasena: string;
    role: string;
    status: number | null;
  }>('SELECT * FROM local_usuarios WHERE LOWER(usuario) = ? LIMIT 1', [cleanUser]);

  if (!found) {
    found = await db.getOptional(
      'SELECT * FROM usuarios WHERE LOWER(usuario) = ? LIMIT 1',
      [cleanUser],
    );
  }

  if (!found) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message:
        'No tienes conexión a internet y este usuario no está guardado localmente todavía. Inicia sesión una vez con internet para habilitarlo sin conexión.',
    };
  }

  if (found.role !== 'admin' && Number(found.status ?? 1) === 0) {
    return {
      success: false,
      code: 'INACTIVE_ACCOUNT',
      usuarioNombre: found.nombre,
      usuarioRol: found.role,
      message: `La cuenta de ${found.nombre} está desactivada actualmente.`,
    };
  }

  if (String(found.contrasena || '') !== contrasena) {
    return {
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Contraseña incorrecta.',
    };
  }

  return {
    success: true,
    usuario: {
      id: String(found.id),
      nombre: found.nombre,
      correo: found.correo,
      usuario: found.usuario,
      contrasena: found.contrasena,
      role: found.role || 'student',
      status: Number(found.status ?? 1) !== 0,
    },
  };
}

/* ════════════════════════ PROGRESO Y MUNDOS (HIBRIDO) ════════════════════════ */

function buildProgressMap(rows: Array<{ nivel_id: number; completado: boolean | number; estrellas: number }>) {
  const progressMap: Record<number, StudentProgress> = { ...MOCK_PROGRESS };
  let totalStars = 0;

  rows.forEach((row) => {
    const nivelId = Number(row.nivel_id);
    const stars = Number(row.estrellas) || 0;
    const isCompleted = Boolean(Number(row.completado ?? 0)) && row.completado !== false;

    const prev = progressMap[nivelId];
    const mergedStars = prev ? Math.max(prev.stars, stars) : stars;
    const mergedStatus =
      isCompleted || prev?.status === 'completed' ? 'completed' : 'unlocked';

    progressMap[nivelId] = {
      levelId: nivelId,
      status: mergedStatus,
      score: mergedStars * 100,
      stars: mergedStars,
    };
  });

  // Desbloquear automáticamente el siguiente nivel dentro de cada curso cuando el anterior está completado
  for (const planet of MOCK_PLANETS) {
    for (const course of planet.courses) {
      for (let i = 0; i < course.levels.length - 1; i++) {
        const curr = course.levels[i];
        const next = course.levels[i + 1];
        if (progressMap[curr.id]?.status === 'completed' && !progressMap[next.id]) {
          progressMap[next.id] = {
            levelId: next.id,
            status: 'unlocked',
            score: 0,
            stars: 0,
          };
        }
      }
    }
  }

  Object.values(progressMap).forEach((entry) => {
    totalStars += Number(entry.stars) || 0;
  });

  return { progressMap, totalStars };
}

export async function obtenerProgresoEstudianteHibrido(userId: string): Promise<{
  progressMap: Record<number, StudentProgress>;
  totalStars: number;
  offlineMode: boolean;
  errorMessage: string | null;
}> {
  const localEnabled = isLocalDbEnabled();
  if (localEnabled) {
    await seedPlanetasYNivelesLocalesSiVacio();
  }

  if (!localEnabled) {
    try {
      const { data, error } = await supabase
        .from('progreso_usuario')
        .select('id, usuario_id, nivel_id, completado, estrellas, ultima_sesion')
        .eq('usuario_id', userId);

      if (!error && data) {
        marcarConexionReal(true);
        const { progressMap, totalStars } = buildProgressMap(data);
        return {
          progressMap,
          totalStars,
          offlineMode: false,
          errorMessage: null,
        };
      }
      if (error) esErrorDeRed(error);
    } catch (err) {
      esErrorDeRed(err);
    }
    const { progressMap, totalStars } = buildProgressMap([]);
    return {
      progressMap,
      totalStars,
      offlineMode: !hayConexionInternet(),
      errorMessage:
        'Modo Solo en la Nube activo: se requiere conexión a internet para consultar tu progreso en Supabase.',
    };
  }

  if (hayConexionInternet()) {
    try {
      await sincronizarPendientesASupabase();

      const { data, error } = await supabase
        .from('progreso_usuario')
        .select('id, usuario_id, nivel_id, completado, estrellas, ultima_sesion')
        .eq('usuario_id', userId);

      if (!error && data) {
        await cacheProgresoInLocal(data as LocalProgresoRow[], userId);
        // Depositar resto de tablas en segundo plano para uso sin conexión
        void depositarSupabaseEnLocal({ usuarioId: userId });

        const { progressMap, totalStars } = buildProgressMap(data);
        return {
          progressMap,
          totalStars,
          offlineMode: false,
          errorMessage: null,
        };
      }
      if (error && !esErrorDeRed(error)) {
        // Fallback a local si RLS o fallo transitorio
        console.warn('Aviso al consultar progreso en nube:', error.message);
      }
    } catch (err) {
      if (!esErrorDeRed(err)) {
        console.warn('Error consultando progreso remoto:', err);
      }
    }
  }

  // Lectura desde BD secundaria local (PowerSync SQLite en IndexedDB)
  const db = await asegurarPowerSyncListo();
  let localRows: Array<{ nivel_id: number; completado: number; estrellas: number }> = [];
  if (db) {
    try {
      localRows = await db.getAll(
        'SELECT nivel_id, completado, estrellas FROM local_progreso_usuario WHERE usuario_id = ?',
        [userId],
      );
      if (localRows.length === 0) {
        localRows = await db.getAll(
          'SELECT nivel_id, completado, estrellas FROM progreso_usuario WHERE usuario_id = ?',
          [userId],
        );
      }
    } catch {}
  }

  const { progressMap, totalStars } = buildProgressMap(localRows);
  return {
    progressMap,
    totalStars,
    offlineMode: !hayConexionInternet(),
    errorMessage: null,
  };
}

export async function guardarProgresoHibrido(
  userId: string,
  nivelId: number,
  completado: boolean,
  estrellas: number,
): Promise<{ ok: boolean; syncedToCloud: boolean }> {
  const ahora = new Date().toISOString();
  const localEnabled = isLocalDbEnabled();
  const db = localEnabled ? await asegurarPowerSyncListo() : null;

  let estrellasGuardadas = estrellas;

  if (db) {
    try {
      await db.writeTransaction(async (tx) => {
        const existing = await tx.getOptional<{ id: string; estrellas: number }>(
          'SELECT id, estrellas FROM local_progreso_usuario WHERE usuario_id = ? AND nivel_id = ? LIMIT 1',
          [userId, nivelId],
        );

        const prevEstrellas = Number(existing?.estrellas) || 0;
        estrellasGuardadas = completado
          ? prevEstrellas + Math.max(0, Number(estrellas) || 0)
          : Math.max(prevEstrellas, Number(estrellas) || 0);

        if (existing?.id) {
          await tx.execute(
            'UPDATE local_progreso_usuario SET completado = ?, estrellas = ?, ultima_sesion = ? WHERE id = ?',
            [completado ? 1 : 0, estrellasGuardadas, ahora, existing.id],
          );
        } else {
          await tx.execute(
            'INSERT INTO local_progreso_usuario (id, usuario_id, nivel_id, completado, estrellas, ultima_sesion) VALUES (?, ?, ?, ?, ?, ?)',
            [makeUuid(), userId, nivelId, completado ? 1 : 0, estrellasGuardadas, ahora],
          );
        }
      });
    } catch (err) {
      console.warn('Error escribiendo progreso en BD local:', err);
    }
  }

  if (!localEnabled || hayConexionInternet()) {
    try {
      const { data: existente, error: errSelect } = await supabase
        .from('progreso_usuario')
        .select('id, estrellas')
        .eq('usuario_id', userId)
        .eq('nivel_id', nivelId)
        .maybeSingle();

      if (errSelect) throw errSelect;

      const prevRemotas = Number(existente?.estrellas) || 0;
      const estrellasFinales = completado
        ? Math.max(estrellasGuardadas, prevRemotas + Math.max(0, Number(estrellas) || 0))
        : Math.max(prevRemotas, estrellasGuardadas);

      if (db && estrellasFinales !== estrellasGuardadas) {
        try {
          await db.execute(
            'UPDATE local_progreso_usuario SET estrellas = ? WHERE usuario_id = ? AND nivel_id = ?',
            [estrellasFinales, userId, nivelId],
          );
        } catch {}
      }

      if (existente?.id) {
        const { error: errUpd } = await supabase
          .from('progreso_usuario')
          .update({
            completado,
            estrellas: estrellasFinales,
            ultima_sesion: ahora,
          })
          .eq('id', existente.id);
        if (errUpd) throw errUpd;
      } else {
        const { error: errIns } = await supabase.from('progreso_usuario').insert({
          usuario_id: userId,
          nivel_id: nivelId,
          completado,
          estrellas: estrellasFinales,
          ultima_sesion: ahora,
        });
        if (errIns) throw errIns;
      }

      marcarConexionReal(true);

      try {
        await actualizarProgresoUsuario(userId, nivelId, completado, estrellasFinales);
      } catch {}

      return { ok: true, syncedToCloud: true };
    } catch (err) {
      if (!localEnabled) {
        esErrorDeRed(err);
        return { ok: false, syncedToCloud: false };
      }
      if (!esErrorDeRed(err)) {
        console.warn('Guardado remoto falló, encolando en local_outbox:', err);
      }
    }
  }

  if (!localEnabled) {
    return { ok: false, syncedToCloud: false };
  }

  await enqueueOutbox('progreso_usuario', 'UPSERT', `${userId}:${nivelId}`, {
    usuario_id: userId,
    nivel_id: nivelId,
    completado,
    estrellas: estrellasGuardadas,
    ultima_sesion: ahora,
  });

  return { ok: true, syncedToCloud: false };
}

export async function obtenerPlanetasLocales(): Promise<Planet[]> {
  await seedPlanetasYNivelesLocalesSiVacio();
  return MOCK_PLANETS;
}

/* ════════════════════════ USUARIOS, ROLES Y ASIGNACIONES (HIBRIDO) ════════════════════════ */

export async function obtenerUsuariosHibrido(filtro?: {
  roles?: string[];
  soloActivos?: boolean;
  soloInactivos?: boolean;
}): Promise<{ usuarios: LocalUsuarioRow[]; offlineMode: boolean }> {
  const applyFilter = (lista: LocalUsuarioRow[]) =>
    lista.filter((u) => {
      if (filtro?.roles?.length && !filtro.roles.includes(u.role)) return false;
      if (filtro?.soloActivos && u.status === false) return false;
      if (filtro?.soloInactivos && u.status !== false) return false;
      return true;
    });

  const localEnabled = isLocalDbEnabled();

  if (!localEnabled) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, usuario, correo, contrasena, role, status')
        .neq('role', 'admin')
        .order('nombre', { ascending: true });

      if (!error && data) {
        marcarConexionReal(true);
        const normalizados: LocalUsuarioRow[] = data.map((u: any) => ({
          id: String(u.id),
          nombre: String(u.nombre || ''),
          usuario: String(u.usuario || ''),
          correo: String(u.correo || ''),
          contrasena: String(u.contrasena || ''),
          role: String(u.role || 'student'),
          status: u.status === false ? false : true,
        }));
        return { usuarios: applyFilter(normalizados), offlineMode: false };
      }
      if (error) esErrorDeRed(error);
    } catch (err) {
      esErrorDeRed(err);
    }
    return { usuarios: [], offlineMode: !hayConexionInternet() };
  }

  if (hayConexionInternet()) {
    try {
      await sincronizarPendientesASupabase();

      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, usuario, correo, contrasena, role, status')
        .neq('role', 'admin')
        .order('nombre', { ascending: true });

      if (!error && data) {
        const normalizados: LocalUsuarioRow[] = data.map((u: any) => ({
          id: String(u.id),
          nombre: String(u.nombre || ''),
          usuario: String(u.usuario || ''),
          correo: String(u.correo || ''),
          contrasena: String(u.contrasena || ''),
          role: String(u.role || 'student'),
          status: u.status === false ? false : true,
        }));
        await cacheUsuariosInLocal(normalizados);
        return { usuarios: applyFilter(normalizados), offlineMode: false };
      }
    } catch (err) {
      if (!esErrorDeRed(err)) {
        console.warn('Error consultando usuarios en Supabase:', err);
      }
    }
  }

  const db = await asegurarPowerSyncListo();
  let rows: any[] = [];
  if (db) {
    try {
      rows = await db.getAll(
        'SELECT * FROM local_usuarios ORDER BY LOWER(nombre) ASC',
      );
      if (rows.length === 0) {
        rows = await db.getAll(
          'SELECT * FROM usuarios ORDER BY LOWER(nombre) ASC',
        );
      }
    } catch {}
  }

  const normalizados: LocalUsuarioRow[] = rows.map((u) => ({
    id: String(u.id),
    nombre: String(u.nombre || ''),
    usuario: String(u.usuario || ''),
    correo: String(u.correo || ''),
    contrasena: String(u.contrasena || ''),
    role: String(u.role || 'student'),
    status: Number(u.status ?? 1) !== 0,
  }));

  return { usuarios: applyFilter(normalizados), offlineMode: !hayConexionInternet() };
}

export async function actualizarUsuarioHibrido(
  userId: string,
  patch: Partial<{
    nombre: string;
    usuario: string;
    correo: string;
    contrasena: string;
    role: string;
    status: boolean;
  }>,
): Promise<{ ok: boolean; syncedToCloud: boolean; errorMessage?: string }> {
  const localEnabled = isLocalDbEnabled();
  const db = localEnabled ? await asegurarPowerSyncListo() : null;
  if (db) {
    const sets: string[] = [];
    const params: any[] = [];
    if (patch.nombre !== undefined) {
      sets.push('nombre = ?');
      params.push(patch.nombre);
    }
    if (patch.usuario !== undefined) {
      sets.push('usuario = ?');
      params.push(patch.usuario);
    }
    if (patch.correo !== undefined) {
      sets.push('correo = ?');
      params.push(patch.correo);
    }
    if (patch.contrasena !== undefined) {
      sets.push('contrasena = ?');
      params.push(patch.contrasena);
    }
    if (patch.role !== undefined) {
      sets.push('role = ?');
      params.push(patch.role);
    }
    if (patch.status !== undefined) {
      sets.push('status = ?');
      params.push(patch.status ? 1 : 0);
    }
    if (sets.length > 0) {
      params.push(userId);
      await db.execute(
        `UPDATE local_usuarios SET ${sets.join(', ')} WHERE id = ?`,
        params,
      );
    }
  }

  if (!localEnabled || hayConexionInternet()) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(patch)
        .eq('id', userId);
      if (error) {
        if (!localEnabled || !esErrorDeRed(error)) {
          return { ok: false, syncedToCloud: false, errorMessage: error.message };
        }
        throw error;
      }
      marcarConexionReal(true);
      return { ok: true, syncedToCloud: true };
    } catch (err) {
      if (!localEnabled) {
        esErrorDeRed(err);
        return {
          ok: false,
          syncedToCloud: false,
          errorMessage: 'Modo Solo en la Nube activo: se requiere internet para actualizar usuarios en Supabase.',
        };
      }
      if (!esErrorDeRed(err)) {
        return {
          ok: false,
          syncedToCloud: false,
          errorMessage: err instanceof Error ? err.message : String(err),
        };
      }
    }
  }

  if (!localEnabled) {
    return {
      ok: false,
      syncedToCloud: false,
      errorMessage: 'Modo Solo en la Nube activo: se requiere internet.',
    };
  }

  await enqueueOutbox('usuarios', 'PATCH', userId, patch as Record<string, any>);
  return { ok: true, syncedToCloud: false };
}

export async function eliminarUsuarioHibrido(
  userId: string,
): Promise<{ ok: boolean; syncedToCloud: boolean; errorMessage?: string }> {
  const localEnabled = isLocalDbEnabled();
  const db = localEnabled ? await asegurarPowerSyncListo() : null;
  if (db) {
    await db.execute('DELETE FROM local_usuarios WHERE id = ?', [userId]);
  }

  if (!localEnabled || hayConexionInternet()) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);
      if (error) {
        if (!localEnabled || !esErrorDeRed(error)) {
          return { ok: false, syncedToCloud: false, errorMessage: error.message };
        }
        throw error;
      }
      marcarConexionReal(true);
      return { ok: true, syncedToCloud: true };
    } catch (err) {
      if (!localEnabled) {
        esErrorDeRed(err);
        return {
          ok: false,
          syncedToCloud: false,
          errorMessage: 'Modo Solo en la Nube activo: se requiere internet para eliminar usuarios en Supabase.',
        };
      }
    }
  }

  if (!localEnabled) {
    return {
      ok: false,
      syncedToCloud: false,
      errorMessage: 'Modo Solo en la Nube activo: se requiere internet.',
    };
  }

  await enqueueOutbox('usuarios', 'DELETE', userId, { id: userId });
  return { ok: true, syncedToCloud: false };
}

export async function obtenerAsignacionesHibrido(): Promise<{
  usuarios: LocalUsuarioRow[];
  relaciones: LocalRelacionTutorRow[];
  offlineMode: boolean;
}> {
  const localEnabled = isLocalDbEnabled();

  if (!localEnabled) {
    try {
      const [resU, resR] = await Promise.all([
        supabase
          .from('usuarios')
          .select('id, nombre, usuario, correo, contrasena, role, status')
          .neq('role', 'admin')
          .order('nombre', { ascending: true }),
        supabase
          .from('tutor_estudiantes')
          .select('id, tutor_id, estudiante_id, fecha_asignacion'),
      ]);

      if (!resU.error && !resR.error && resU.data && resR.data) {
        marcarConexionReal(true);
        const users: LocalUsuarioRow[] = resU.data.map((u: any) => ({
          id: String(u.id),
          nombre: String(u.nombre || ''),
          usuario: String(u.usuario || ''),
          correo: String(u.correo || ''),
          contrasena: String(u.contrasena || ''),
          role: String(u.role || 'student'),
          status: u.status === false ? false : true,
        }));
        const rels: LocalRelacionTutorRow[] = resR.data.map((r: any) => ({
          id: r.id,
          tutor_id: String(r.tutor_id),
          estudiante_id: String(r.estudiante_id),
          fecha_asignacion: r.fecha_asignacion || null,
        }));
        return { usuarios: users, relaciones: rels, offlineMode: false };
      }
    } catch (err) {
      esErrorDeRed(err);
    }
    return { usuarios: [], relaciones: [], offlineMode: !hayConexionInternet() };
  }

  if (hayConexionInternet()) {
    try {
      await sincronizarPendientesASupabase();
      const [resU, resR] = await Promise.all([
        supabase
          .from('usuarios')
          .select('id, nombre, usuario, correo, contrasena, role, status')
          .neq('role', 'admin')
          .order('nombre', { ascending: true }),
        supabase
          .from('tutor_estudiantes')
          .select('id, tutor_id, estudiante_id, fecha_asignacion'),
      ]);

      if (!resU.error && !resR.error && resU.data && resR.data) {
        const users: LocalUsuarioRow[] = resU.data.map((u: any) => ({
          id: String(u.id),
          nombre: String(u.nombre || ''),
          usuario: String(u.usuario || ''),
          correo: String(u.correo || ''),
          contrasena: String(u.contrasena || ''),
          role: String(u.role || 'student'),
          status: u.status === false ? false : true,
        }));
        const rels: LocalRelacionTutorRow[] = resR.data.map((r: any) => ({
          id: r.id,
          tutor_id: String(r.tutor_id),
          estudiante_id: String(r.estudiante_id),
          fecha_asignacion: r.fecha_asignacion || null,
        }));
        await cacheUsuariosInLocal(users);
        await cacheAsignacionesInLocal(rels);
        return { usuarios: users, relaciones: rels, offlineMode: false };
      }
    } catch {}
  }

  const db = await asegurarPowerSyncListo();
  const { usuarios } = await obtenerUsuariosHibrido();
  let relRows: any[] = [];
  if (db) {
    try {
      relRows = await db.getAll('SELECT * FROM local_tutor_estudiantes');
      if (relRows.length === 0) {
        relRows = await db.getAll('SELECT * FROM tutor_estudiantes');
      }
    } catch {}
  }

  return {
    usuarios,
    relaciones: relRows.map((r) => ({
      id: r.id,
      tutor_id: String(r.tutor_id),
      estudiante_id: String(r.estudiante_id),
      fecha_asignacion: r.fecha_asignacion || null,
    })),
    offlineMode: !hayConexionInternet(),
  };
}

export async function guardarAsignacionHibrido(
  tutorId: string,
  estudianteId: string,
  accion: 'ASSIGN' | 'UNASSIGN',
): Promise<{ ok: boolean; syncedToCloud: boolean; nuevaRelacion?: LocalRelacionTutorRow }> {
  const fecha = new Date().toISOString();
  const localEnabled = isLocalDbEnabled();
  const db = localEnabled ? await asegurarPowerSyncListo() : null;
  const localId = makeUuid();

  if (db) {
    await db.writeTransaction(async (tx) => {
      await tx.execute(
        'DELETE FROM local_tutor_estudiantes WHERE estudiante_id = ?',
        [estudianteId],
      );
      if (accion === 'ASSIGN') {
        await tx.execute(
          'INSERT INTO local_tutor_estudiantes (id, tutor_id, estudiante_id, fecha_asignacion) VALUES (?, ?, ?, ?)',
          [localId, tutorId, estudianteId, fecha],
        );
      }
    });
  }

  if (!localEnabled || hayConexionInternet()) {
    try {
      if (accion === 'UNASSIGN') {
        const { error } = await supabase
          .from('tutor_estudiantes')
          .delete()
          .eq('estudiante_id', estudianteId)
          .eq('tutor_id', tutorId);
        if (error) throw error;
        marcarConexionReal(true);
        return { ok: true, syncedToCloud: true };
      } else {
        await supabase
          .from('tutor_estudiantes')
          .delete()
          .eq('estudiante_id', estudianteId);

        const { data, error } = await supabase
          .from('tutor_estudiantes')
          .insert([{ tutor_id: tutorId, estudiante_id: estudianteId, fecha_asignacion: fecha }])
          .select('id, tutor_id, estudiante_id, fecha_asignacion')
          .single();

        if (error) throw error;
        marcarConexionReal(true);
        return {
          ok: true,
          syncedToCloud: true,
          nuevaRelacion: data as LocalRelacionTutorRow,
        };
      }
    } catch (err) {
      if (!localEnabled) {
        esErrorDeRed(err);
        return { ok: false, syncedToCloud: false };
      }
      if (!esErrorDeRed(err)) {
        return { ok: false, syncedToCloud: false };
      }
    }
  }

  if (!localEnabled) {
    return { ok: false, syncedToCloud: false };
  }

  await enqueueOutbox('tutor_estudiantes', accion, estudianteId, {
    tutor_id: tutorId,
    estudiante_id: estudianteId,
    fecha_asignacion: fecha,
  });

  return {
    ok: true,
    syncedToCloud: false,
    nuevaRelacion:
      accion === 'ASSIGN'
        ? { id: localId, tutor_id: tutorId, estudiante_id: estudianteId, fecha_asignacion: fecha }
        : undefined,
  };
}

export async function obtenerDatosMaestroHibrido(tutorId: string): Promise<{
  totalNiveles: number;
  estudiantes: LocalUsuarioRow[];
  progreso: LocalProgresoRow[];
  offlineMode: boolean;
}> {
  const localEnabled = isLocalDbEnabled();

  if (!localEnabled || hayConexionInternet()) {
    try {
      if (localEnabled) {
        await sincronizarPendientesASupabase();
      }
      const { data: asignaciones, error: errAsig } = await supabase
        .from('tutor_estudiantes')
        .select('id, tutor_id, estudiante_id, fecha_asignacion')
        .eq('tutor_id', tutorId);

      if (errAsig) throw errAsig;

      const idsAsignados = (asignaciones || []).map((a) => String(a.estudiante_id));
      const { count: conteoNiveles } = await supabase
        .from('niveles')
        .select('*', { count: 'exact', head: true });

      if (idsAsignados.length === 0) {
        marcarConexionReal(true);
        return {
          totalNiveles: conteoNiveles && conteoNiveles > 0 ? conteoNiveles : 12,
          estudiantes: [],
          progreso: [],
          offlineMode: false,
        };
      }

      const [resU, resP] = await Promise.all([
        supabase
          .from('usuarios')
          .select('id, nombre, usuario, correo, contrasena, role, status')
          .eq('role', 'student')
          .in('id', idsAsignados)
          .order('nombre', { ascending: true }),
        supabase
          .from('progreso_usuario')
          .select('id, usuario_id, nivel_id, completado, estrellas, ultima_sesion')
          .in('usuario_id', idsAsignados),
      ]);

      if (resU.error) throw resU.error;
      if (resP.error) throw resP.error;

      marcarConexionReal(true);

      // Depositar también todas las tablas en background solo si Modo PLUS está activo
      if (localEnabled) {
        void depositarSupabaseEnLocal({ force: true });
      }

      return {
        totalNiveles: conteoNiveles && conteoNiveles > 0 ? conteoNiveles : 12,
        estudiantes: (resU.data || []) as LocalUsuarioRow[],
        progreso: (resP.data || []) as LocalProgresoRow[],
        offlineMode: false,
      };
    } catch (err) {
      if (!localEnabled) {
        esErrorDeRed(err);
        return {
          totalNiveles: 12,
          estudiantes: [],
          progreso: [],
          offlineMode: true,
        };
      }
      if (!esErrorDeRed(err)) {
        console.warn('Error cargando datos del tutor en Supabase:', err);
      }
    }
  }

  const db = await asegurarPowerSyncListo();
  let totalNiveles = 12;
  let estudiantes: LocalUsuarioRow[] = [];
  let progreso: LocalProgresoRow[] = [];

  if (db) {
    try {
      const lvlCount = await db.getOptional<{ total: number }>(
        'SELECT COUNT(*) as total FROM local_niveles',
      );
      if (lvlCount?.total && Number(lvlCount.total) > 0) {
        totalNiveles = Number(lvlCount.total);
      }

      const rels = await db.getAll<{ estudiante_id: string }>(
        'SELECT estudiante_id FROM local_tutor_estudiantes WHERE tutor_id = ?',
        [tutorId],
      );
      const ids = new Set(rels.map((r) => String(r.estudiante_id)));

      if (ids.size > 0) {
        const allUsers = await db.getAll<any>(
          'SELECT * FROM local_usuarios WHERE role = ? ORDER BY LOWER(nombre) ASC',
          ['student'],
        );
        estudiantes = allUsers
          .filter((u) => ids.has(String(u.id)))
          .map((u) => ({
            id: String(u.id),
            nombre: String(u.nombre || ''),
            usuario: String(u.usuario || ''),
            correo: String(u.correo || ''),
            contrasena: String(u.contrasena || ''),
            role: String(u.role || 'student'),
            status: Number(u.status ?? 1) !== 0,
          }));

        const allProg = await db.getAll<any>('SELECT * FROM local_progreso_usuario');
        progreso = allProg
          .filter((p) => ids.has(String(p.usuario_id)))
          .map((p) => ({
            id: String(p.id),
            usuario_id: String(p.usuario_id),
            nivel_id: Number(p.nivel_id) || 0,
            completado: Number(p.completado ?? 0) !== 0,
            estrellas: Number(p.estrellas) || 0,
            ultima_sesion: p.ultima_sesion || null,
          }));
      }
    } catch {}
  }

  return {
    totalNiveles,
    estudiantes,
    progreso,
    offlineMode: true,
  };
}

/* ════════════════════════ CACHE LOCAL DE PREGUNTAS JSON ════════════════════════ */

export async function guardarPreguntaEnCacheLocal(
  id: string,
  planeta: 'Numérix' | 'Letralia' | 'Naturae',
  tipo: 'regular' | 'boss' | 'intruso' | 'puente' | 'tormenta',
  nivelDificultad: number,
  payload: unknown,
) {
  if (!isLocalDbEnabled()) return;
  const db = await asegurarPowerSyncListo();
  if (!db) return;
  try {
    await db.execute(
      'INSERT OR REPLACE INTO local_preguntas_json (id, planeta, tipo, nivel_dificultad, payload_json, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        `${planeta}:${tipo}:${id}`,
        planeta,
        tipo,
        nivelDificultad,
        JSON.stringify(payload),
        new Date().toISOString(),
      ],
    );
  } catch {}
}

export async function leerPreguntasDeCacheLocal<T = any>(
  planeta: 'Numérix' | 'Letralia' | 'Naturae',
  tipo: 'regular' | 'boss' | 'intruso' | 'puente' | 'tormenta',
): Promise<T[]> {
  if (!isLocalDbEnabled()) return [];
  const db = await asegurarPowerSyncListo();
  if (!db) return [];
  try {
    const rows = await db.getAll<{ payload_json: string }>(
      'SELECT payload_json FROM local_preguntas_json WHERE planeta = ? AND tipo = ? ORDER BY updated_at DESC',
      [planeta, tipo],
    );
    return rows
      .map((r) => {
        try {
          return JSON.parse(r.payload_json) as T;
        } catch {
          return null;
        }
      })
      .filter((x): x is T => x !== null);
  } catch {
    return [];
  }
}

/* ════════════════════════ CONTROL ADMIN: MODO NUBE vs MODO PLUS ════════════════════════ */

export async function desactivarRecursosLocalesModoNube(): Promise<void> {
  await desconectarPowerSync();

  if (typeof window !== 'undefined') {
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.allSettled(regs.map((r) => r.unregister()));
      } catch {}
    }

    if ('caches' in window) {
      try {
        const keys = await window.caches.keys();
        await Promise.allSettled(
          keys
            .filter((k) => k.startsWith('universo-offline'))
            .map((k) => window.caches.delete(k)),
        );
      } catch {}
    }
  }

  notifySyncListeners({
    syncing: false,
    pendingCount: 0,
    lastMessage: 'Modo Solo en la Nube activo (BD local desactivada).',
  });
}

export async function descargarTodoModoPlus(
  onProgress?: (step: string, percent: number) => void,
): Promise<{
  ok: boolean;
  rutasCacheadas: number;
  fecha: string;
  error?: string;
}> {
  const fecha = new Date().toISOString();

  if (typeof window === 'undefined') {
    return { ok: false, rutasCacheadas: 0, fecha, error: 'Solo disponible en navegador.' };
  }

  if (!isLocalDbEnabled()) {
    return {
      ok: false,
      rutasCacheadas: 0,
      fecha,
      error: 'Activa primero el Modo PLUS antes de descargar los recursos y la BD local.',
    };
  }

  onProgress?.('Verificando conexión con Supabase y servidor...', 10);
  const onlineReal = await comprobarConexionReal();
  if (!onlineReal) {
    return {
      ok: false,
      rutasCacheadas: 0,
      fecha,
      error: 'No se detectó conexión a internet para descargar la página y la BD de Supabase.',
    };
  }

  let rutasCacheadas = 0;

  if ('serviceWorker' in navigator) {
    onProgress?.('Activando motor sin conexión (Service Worker)...', 25);
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch {}
  }

  if ('caches' in window) {
    onProgress?.('Descargando páginas, imágenes y scripts en el navegador...', 45);
    try {
      const cache = await window.caches.open('universo-offline-v3');
      const staticUrls = new Set<string>([
        '/',
        '/about',
        '/how-to-play',
        '/minijuegos',
        '/configuracion',
        '/dashboard',
        '/planeta/1',
        '/planeta/2',
        '/planeta/3',
        '/juego/1/1',
        '/juego/2/7',
        '/juego/3/10',
        '/maestro',
        '/maestro/ia',
        '/admin',
        '/admin/pendientes',
        '/admin/usuarios',
        '/asignaciones',
        '/manifest.webmanifest',
        '/api/minijuegos',
        '/api/system-config',
        '/images/liquid-prism-bg.jpg',
        '/images/liquid-prism-light-bg.jpg',
        '/images/numerix-board-bg.jpg',
        '/images/letralia-board-bg.jpg',
        '/images/naturae-board-bg.jpg',
      ]);

      document.querySelectorAll('script[src]').forEach((el) => {
        const src = el.getAttribute('src');
        if (src && src.startsWith('/')) staticUrls.add(src);
      });
      document.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
        const href = el.getAttribute('href');
        if (href && href.startsWith('/')) staticUrls.add(href);
      });

      const list = Array.from(staticUrls);
      const batchSize = 6;
      for (let i = 0; i < list.length; i += batchSize) {
        const batch = list.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(async (url) => {
            const res = await fetch(url, { cache: 'reload' });
            if (res.ok) {
              await cache.put(url, res);
              rutasCacheadas += 1;
            }
          }),
        );
        const pct = Math.min(78, 45 + Math.round(((i + batch.length) / list.length) * 33));
        onProgress?.(`Guardando recursos locales (${rutasCacheadas} archivos)...`, pct);
      }
    } catch {}
  }

  onProgress?.('Respaldando base de datos Supabase en PowerSync SQLite local...', 85);
  await asegurarPowerSyncListo();
  await depositarSupabaseEnLocal({ force: true });

  try {
    window.localStorage.setItem('universo-plus-last-download', fecha);
    window.localStorage.setItem('universo-plus-cached-count', String(rutasCacheadas));
  } catch {}

  onProgress?.('Modo PLUS descargado y listo para funcionar sin conexión.', 100);
  return { ok: true, rutasCacheadas, fecha };
}
