import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  DEFAULT_MINIJUEGOS_CATALOG,
  type MinijuegosDatabase,
  type ProgresoMinijuegoUsuario,
} from '../../../lib/minijuegos-types';

const DB_PATH = path.join(process.cwd(), 'data', 'minijuegos-db.json');

function crearBaseInicial(): MinijuegosDatabase {
  return {
    version: '1.0.0',
    ultimaActualizacion: new Date().toISOString(),
    minijuegos: DEFAULT_MINIJUEGOS_CATALOG.map((item) => ({
      ...item,
      estadisticasGlobales: { ...item.estadisticasGlobales },
    })),
    progresoUsuarios: {},
  };
}

async function leerBaseDatos(): Promise<MinijuegosDatabase> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<MinijuegosDatabase>;

    const base = crearBaseInicial();
    const minijuegosExistentes = new Map(
      (Array.isArray(parsed.minijuegos) ? parsed.minijuegos : []).map((m) => [m.id, m]),
    );

    const minijuegos = base.minijuegos.map((def) => {
      const guardado = minijuegosExistentes.get(def.id);
      if (!guardado) return def;
      return {
        ...guardado,
        ...def,
        estadisticasGlobales: {
          ...def.estadisticasGlobales,
          ...(guardado.estadisticasGlobales || {}),
        },
      };
    });

    return {
      version: parsed.version || '1.0.0',
      ultimaActualizacion: parsed.ultimaActualizacion || new Date().toISOString(),
      minijuegos,
      progresoUsuarios:
        parsed.progresoUsuarios && typeof parsed.progresoUsuarios === 'object'
          ? parsed.progresoUsuarios
          : {},
    };
  } catch {
    return crearBaseInicial();
  }
}

async function guardarBaseDatos(db: MinijuegosDatabase): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[minijuegos-db] No se pudo escribir en disco (modo lectura):', err);
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = (searchParams.get('userId') || '').trim();

  const db = await leerBaseDatos();
  const progresoUsuario = userId
    ? db.progresoUsuarios[userId]?.juegos || {}
    : {};

  return NextResponse.json({
    ok: true,
    version: db.version,
    ultimaActualizacion: db.ultimaActualizacion,
    minijuegos: db.minijuegos,
    progresoUsuario,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body?.userId || '').trim();
    const userName = String(body?.userName || 'Jugador').trim() || 'Jugador';
    const role = String(body?.role || 'student').trim().toLowerCase();
    const minijuegoId = String(body?.minijuegoId || '').trim();
    const puntaje = Math.max(0, Math.floor(Number(body?.puntaje) || 0));
    const detalleExtra = Math.max(0, Math.floor(Number(body?.detalleExtra) || 0));
    const modo = String(body?.modo || 'arcade').trim();
    const duracionSegundos = Math.max(0, Math.floor(Number(body?.duracionSegundos) || 0));

    if (!userId || !minijuegoId) {
      return NextResponse.json(
        { ok: false, error: 'Faltan userId o minijuegoId para guardar progreso.' },
        { status: 400 },
      );
    }

    const db = await leerBaseDatos();
    const idxJuego = db.minijuegos.findIndex((m) => m.id === minijuegoId);
    if (idxJuego === -1) {
      return NextResponse.json(
        { ok: false, error: `Minijuego "${minijuegoId}" no encontrado.` },
        { status: 404 },
      );
    }

    const ahora = new Date().toISOString();

    if (!db.progresoUsuarios[userId]) {
      db.progresoUsuarios[userId] = {
        usuarioId: userId,
        usuarioNombre: userName,
        rol: role,
        juegos: {},
      };
    }

    db.progresoUsuarios[userId].usuarioNombre = userName;
    db.progresoUsuarios[userId].rol = role;

    const prev: ProgresoMinijuegoUsuario = db.progresoUsuarios[userId].juegos[minijuegoId] || {
      intentos: 0,
      recordPersonal: 0,
      ultimoPuntaje: 0,
      mejorDetalle: 0,
      ultimaModo: modo,
      tiempoTotalSegundos: 0,
      primeraPartida: ahora,
      ultimaPartida: ahora,
    };

    const nuevoRecordPersonal = puntaje > prev.recordPersonal;
    const actualizado: ProgresoMinijuegoUsuario = {
      intentos: prev.intentos + 1,
      recordPersonal: Math.max(prev.recordPersonal, puntaje),
      ultimoPuntaje: puntaje,
      mejorDetalle: Math.max(prev.mejorDetalle, detalleExtra),
      ultimaModo: modo,
      tiempoTotalSegundos: prev.tiempoTotalSegundos + duracionSegundos,
      primeraPartida: prev.primeraPartida || ahora,
      ultimaPartida: ahora,
    };

    db.progresoUsuarios[userId].juegos[minijuegoId] = actualizado;

    const statsGlobales = db.minijuegos[idxJuego].estadisticasGlobales;
    const nuevoRecordGlobal = puntaje > statsGlobales.recordGlobal;
    statsGlobales.totalIntentos += 1;
    if (nuevoRecordGlobal) {
      statsGlobales.recordGlobal = puntaje;
      statsGlobales.poseedorRecord = userName;
    }

    db.ultimaActualizacion = ahora;
    const persistedToDisk = await guardarBaseDatos(db);

    return NextResponse.json({
      ok: true,
      persistedToDisk,
      nuevoRecordPersonal,
      nuevoRecordGlobal,
      progresoJuego: actualizado,
      estadisticasGlobales: statsGlobales,
    });
  } catch (err) {
    console.error('[api/minijuegos] Error guardando partida:', err);
    return NextResponse.json(
      { ok: false, error: 'Error interno al guardar progreso de minijuego.' },
      { status: 500 },
    );
  }
}
