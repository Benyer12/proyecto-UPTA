'use client';

import preguntasJsonRaw from '../data/preguntas-ia.json';
import {
  PREGUNTAS_NUMERIX,
  RETOS_ARMILAR_BOSS,
  type PreguntaMatematica,
  type RetoArmilarBoss,
} from './preguntas-numerix';
import {
  RETOS_INTRUSO,
  RETOS_PUENTE,
  RETOS_TORMENTA,
  RETOS_GUARDIAN,
  type RetoGuardianBoss,
  type RetoIntruso,
  type RetoPuenteSintactico,
  type RetoTormenta,
} from './preguntas-letralia';
import {
  guardarPreguntaEnCacheLocal,
  leerPreguntasDeCacheLocal,
} from './offline-sync';

export interface PreguntaCienciasNaturae {
  id?: number;
  pregunta: string;
  tema: string;
  opciones: string[];
  correcta: number;
  pista: string;
  explicacionBreve?: string;
}

interface PreguntaJsonArchivo {
  id: number;
  planeta: string;
  materia?: string;
  nivelDificultad?: number;
  etiquetaNivel?: string;
  operador?: '+' | '−' | '×' | '÷';
  enunciado: string;
  opciones: string[];
  indiceRespuestaCorrecta: number;
  pista?: string;
  explicacionBreve?: string;
}

const bancoJsonEstatico = (Array.isArray(preguntasJsonRaw)
  ? preguntasJsonRaw
  : []) as PreguntaJsonArchivo[];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function obtenerBancoOfflineNumerix(): Promise<{
  regulares: PreguntaMatematica[];
  bosses: RetoArmilarBoss[];
}> {
  const cacheadas = await leerPreguntasDeCacheLocal<PreguntaMatematica>('Numérix', 'regular');
  const bossesCache = await leerPreguntasDeCacheLocal<RetoArmilarBoss>('Numérix', 'boss');

  const desdeJson: PreguntaMatematica[] = bancoJsonEstatico
    .filter((p) => p.planeta === 'Numérix' && p.enunciado && Array.isArray(p.opciones))
    .map((p) => ({
      id: p.id,
      operador: p.operador || '+',
      enunciado: p.enunciado,
      opciones: p.opciones,
      indiceRespuestaCorrecta: Number(p.indiceRespuestaCorrecta) || 0,
      pista: p.pista || 'Resuelve paso a paso.',
      explicacionBreve: p.explicacionBreve || '',
    }));

  const vistos = new Set<string>();
  const regulares: PreguntaMatematica[] = [];
  for (const item of [...cacheadas, ...desdeJson, ...shuffle(PREGUNTAS_NUMERIX)]) {
    const clave = item.enunciado.trim().toLowerCase();
    if (!vistos.has(clave)) {
      vistos.add(clave);
      regulares.push(item);
    }
  }

  const bossesVistos = new Set<string>();
  const bosses: RetoArmilarBoss[] = [];
  for (const b of [...bossesCache, ...shuffle(RETOS_ARMILAR_BOSS)]) {
    const clave = b.enunciado.trim().toLowerCase();
    if (!bossesVistos.has(clave)) {
      bossesVistos.add(clave);
      bosses.push(b);
    }
  }

  return { regulares, bosses };
}

export async function obtenerBancoOfflineLetralia(): Promise<{
  intrusos: RetoIntruso[];
  puentes: RetoPuenteSintactico[];
  tormentas: RetoTormenta[];
  bosses: RetoGuardianBoss[];
}> {
  const [intrusosCache, puentesCache, tormentasCache, bossesCache] = await Promise.all([
    leerPreguntasDeCacheLocal<RetoIntruso>('Letralia', 'intruso'),
    leerPreguntasDeCacheLocal<RetoPuenteSintactico>('Letralia', 'puente'),
    leerPreguntasDeCacheLocal<RetoTormenta>('Letralia', 'tormenta'),
    leerPreguntasDeCacheLocal<RetoGuardianBoss>('Letralia', 'boss'),
  ]);

  return {
    intrusos: [...intrusosCache, ...shuffle(RETOS_INTRUSO)],
    puentes: [...puentesCache, ...shuffle(RETOS_PUENTE)],
    tormentas: [...tormentasCache, ...shuffle(RETOS_TORMENTA)],
    bosses: [...bossesCache, ...shuffle(RETOS_GUARDIAN)],
  };
}

export async function obtenerBancoOfflineNaturae(
  bancoBaseNivel: PreguntaCienciasNaturae[],
): Promise<PreguntaCienciasNaturae[]> {
  const cacheadas = await leerPreguntasDeCacheLocal<PreguntaCienciasNaturae>(
    'Naturae',
    'regular',
  );

  const desdeJson: PreguntaCienciasNaturae[] = bancoJsonEstatico
    .filter((p) => p.planeta === 'Naturae' && p.enunciado && Array.isArray(p.opciones))
    .map((p) => ({
      id: p.id,
      pregunta: p.enunciado,
      tema: p.etiquetaNivel || 'Ciencias Naturales',
      opciones: p.opciones,
      correcta: Number(p.indiceRespuestaCorrecta) || 0,
      pista: p.pista || 'Observa las pistas científicas de la pregunta.',
      explicacionBreve: p.explicacionBreve || '',
    }));

  const vistos = new Set<string>();
  const lista: PreguntaCienciasNaturae[] = [];
  for (const item of [...cacheadas, ...desdeJson, ...bancoBaseNivel]) {
    const clave = item.pregunta.trim().toLowerCase();
    if (!vistos.has(clave)) {
      vistos.add(clave);
      lista.push(item);
    }
  }
  return lista;
}

export async function cachearPackIAOffline(
  planeta: 'Numérix' | 'Letralia' | 'Naturae',
  data: any,
) {
  if (!data || !data.ok) return;

  if (planeta === 'Numérix') {
    if (Array.isArray(data.preguntasNumerix)) {
      for (const p of data.preguntasNumerix) {
        if (p?.enunciado) {
          await guardarPreguntaEnCacheLocal(
            String(p.id || p.enunciado.slice(0, 24)),
            'Numérix',
            'regular',
            Number(p.nivelDificultad) || 1,
            p,
          );
        }
      }
    }
    if (data.nuevaPregunta?.enunciado) {
      await guardarPreguntaEnCacheLocal(
        String(data.nuevaPregunta.id || data.nuevaPregunta.enunciado.slice(0, 24)),
        'Numérix',
        'regular',
        Number(data.nuevaPregunta.nivelDificultad) || 1,
        data.nuevaPregunta,
      );
    }
    if (Array.isArray(data.retosBossNumerix)) {
      for (const b of data.retosBossNumerix) {
        if (b?.enunciado) {
          await guardarPreguntaEnCacheLocal(
            String(b.id || b.enunciado.slice(0, 24)),
            'Numérix',
            'boss',
            1,
            b,
          );
        }
      }
    }
    if (data.nuevoRetoBossNumerix?.enunciado) {
      await guardarPreguntaEnCacheLocal(
        String(data.nuevoRetoBossNumerix.id || Date.now()),
        'Numérix',
        'boss',
        1,
        data.nuevoRetoBossNumerix,
      );
    }
  }

  if (planeta === 'Letralia') {
    const intrusos = [
      ...(Array.isArray(data.retosIntrusoLetralia) ? data.retosIntrusoLetralia : []),
      ...(data.nuevoRetoLetralia ? [data.nuevoRetoLetralia] : []),
    ];
    for (const r of intrusos) {
      if (r?.palabras?.length) {
        await guardarPreguntaEnCacheLocal(String(r.id || Date.now()), 'Letralia', 'intruso', 1, r);
      }
    }

    const puentes = [
      ...(Array.isArray(data.retosPuenteLetralia) ? data.retosPuenteLetralia : []),
      ...(data.nuevoRetoPuenteLetralia ? [data.nuevoRetoPuenteLetralia] : []),
    ];
    for (const p of puentes) {
      if (p?.ordenCorrecto?.length) {
        await guardarPreguntaEnCacheLocal(String(p.id || Date.now()), 'Letralia', 'puente', 1, p);
      }
    }

    const tormentas = [
      ...(Array.isArray(data.retosTormentaLetralia) ? data.retosTormentaLetralia : []),
      ...(data.nuevoRetoTormentaLetralia ? [data.nuevoRetoTormentaLetralia] : []),
    ];
    for (const t of tormentas) {
      if (t?.palabras?.length) {
        await guardarPreguntaEnCacheLocal(String(t.id || Date.now()), 'Letralia', 'tormenta', 1, t);
      }
    }

    const bosses = [
      ...(Array.isArray(data.retosBossLetralia) ? data.retosBossLetralia : []),
      ...(data.nuevoRetoBossLetralia ? [data.nuevoRetoBossLetralia] : []),
    ];
    for (const b of bosses) {
      if (b?.fases?.length) {
        await guardarPreguntaEnCacheLocal(String(b.id || Date.now()), 'Letralia', 'boss', 1, b);
      }
    }
  }

  if (planeta === 'Naturae') {
    const lista = [
      ...(Array.isArray(data.preguntasNaturae) ? data.preguntasNaturae : []),
      ...(data.nuevaPregunta ? [data.nuevaPregunta] : []),
    ];
    for (const p of lista) {
      const enunciado = p?.enunciado || p?.pregunta;
      if (enunciado && Array.isArray(p?.opciones)) {
        const normalizada: PreguntaCienciasNaturae = {
          id: Number(p.id) || Date.now(),
          pregunta: enunciado,
          tema: p.etiquetaNivel || p.tema || 'Ciencias Naturales (Tutor IA)',
          opciones: p.opciones,
          correcta: Number(p.indiceRespuestaCorrecta ?? p.correcta) || 0,
          pista: p.pista || 'Analiza cada pista científica con atención.',
          explicacionBreve: p.explicacionBreve || '',
        };
        await guardarPreguntaEnCacheLocal(
          String(normalizada.id),
          'Naturae',
          'regular',
          Number(p.nivelDificultad) || 1,
          normalizada,
        );
      }
    }
  }
}
