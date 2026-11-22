import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  consultarOllamaCloud,
  crearPreguntaNuevaConIA,
  evaluarRespuestaConTutorIA,
  generarResumenPorCadaEstudiante,
  generarRetoBossNumerixConIA,
  prepararRetosTableroConIA,
  type EntradaEvaluacionTutorIA,
  type NivelDificultadIA,
  type PlanetaTutorIA,
  type PreguntaGeneradaIA,
  type ResumenReporteProfesor,
} from '../../../lib/ai-tutor';
import type { RetoArmilarBoss } from '../../../lib/preguntas-numerix';
import type {
  RetoGuardianBoss,
  RetoIntruso,
  RetoPuenteSintactico,
  RetoTormenta,
} from '../../../lib/preguntas-letralia';

const JSON_FILE_PATH = path.join(process.cwd(), 'data', 'preguntas-ia.json');
const TMP_JSON_FILE_PATH = '/tmp/preguntas-ia.json';

let memoriaPreguntasCache: PreguntaGeneradaIA[] | null = null;
const memoriaReportesCache: ResumenReporteProfesor[] = [];

async function leerArchivoPreguntasJSON(): Promise<PreguntaGeneradaIA[]> {
  if (memoriaPreguntasCache) {
    return memoriaPreguntasCache;
  }

  try {
    const rawTmp = await fs.readFile(/*turbopackIgnore: true*/ TMP_JSON_FILE_PATH, 'utf8');
    const parsedTmp = JSON.parse(rawTmp);
    if (Array.isArray(parsedTmp)) {
      memoriaPreguntasCache = parsedTmp as PreguntaGeneradaIA[];
      return memoriaPreguntasCache;
    }
  } catch {}

  try {
    const rawFile = await fs.readFile(JSON_FILE_PATH, 'utf8');
    const parsedFile = JSON.parse(rawFile);
    if (Array.isArray(parsedFile)) {
      memoriaPreguntasCache = parsedFile as PreguntaGeneradaIA[];
      return memoriaPreguntasCache;
    }
  } catch {}

  memoriaPreguntasCache = [];
  return memoriaPreguntasCache;
}

async function guardarNuevaPreguntaEnJSON(
  nuevaPregunta: PreguntaGeneradaIA,
): Promise<{ totalGuardadas: number; guardadaEnDisco: boolean }> {
  const actuales = await leerArchivoPreguntasJSON();
  const sinDuplicado = actuales.filter(
    (p) => p.enunciado.trim().toLowerCase() !== nuevaPregunta.enunciado.trim().toLowerCase(),
  );
  const actualizadas = [nuevaPregunta, ...sinDuplicado].slice(0, 120);
  memoriaPreguntasCache = actualizadas;

  const jsonFormatted = JSON.stringify(actualizadas, null, 2);
  let guardadaEnDisco = false;

  try {
    await fs.mkdir(path.dirname(JSON_FILE_PATH), { recursive: true });
    await fs.writeFile(JSON_FILE_PATH, jsonFormatted, 'utf8');
    guardadaEnDisco = true;
  } catch {
    try {
      await fs.writeFile(/*turbopackIgnore: true*/ TMP_JSON_FILE_PATH, jsonFormatted, 'utf8');
      guardadaEnDisco = true;
    } catch {
      guardadaEnDisco = false;
    }
  }

  return { totalGuardadas: actualizadas.length, guardadaEnDisco };
}

function getSlugPlaneta(planeta: PlanetaTutorIA): 'numerix' | 'letralia' | 'naturae' {
  if (planeta === 'Letralia') return 'letralia';
  if (planeta === 'Naturae') return 'naturae';
  return 'numerix';
}

function formatearBloqueNumerixTS(preguntas: PreguntaGeneradaIA[]): string {
  const items = preguntas.slice(0, 12).map((p, idx) => {
    const op = p.operador || '+';
    const idNum = 1000 + idx + 1;
    return [
      '  {',
      `    id: ${idNum},`,
      `    operador: ${JSON.stringify(op)},`,
      `    enunciado: ${JSON.stringify(p.enunciado)},`,
      `    opciones: ${JSON.stringify(p.opciones)},`,
      `    indiceRespuestaCorrecta: ${p.indiceRespuestaCorrecta},`,
      `    pista: ${JSON.stringify(p.pista)},`,
      `    explicacionBreve: ${JSON.stringify(p.explicacionBreve)},`,
      '  },',
    ].join('\n');
  });

  if (items.length === 0) {
    return '  // === IA_PREGUNTAS_NUMERIX_START ===\n  // === IA_PREGUNTAS_NUMERIX_END ===';
  }

  return [
    '  // === IA_PREGUNTAS_NUMERIX_START ===',
    ...items,
    '  // === IA_PREGUNTAS_NUMERIX_END ===',
  ].join('\n');
}

function formatearBloqueBossNumerixTS(retos: RetoArmilarBoss[]): string {
  const items = retos.slice(0, 10).map((r, idx) => {
    return [
      '  {',
      `    id: ${JSON.stringify(`ia-arm-${idx + 1}`)},`,
      `    enunciado: ${JSON.stringify(r.enunciado)},`,
      `    opciones: ${JSON.stringify(r.opciones)},`,
      `    indiceCorrecto: ${r.indiceCorrecto},`,
      `    pista: ${JSON.stringify(r.pista)},`,
      `    explicacion: ${JSON.stringify(r.explicacion)},`,
      '  },',
    ].join('\n');
  });

  if (items.length === 0) {
    return '  // === IA_BOSS_NUMERIX_START ===\n  // === IA_BOSS_NUMERIX_END ===';
  }

  return [
    '  // === IA_BOSS_NUMERIX_START ===',
    ...items,
    '  // === IA_BOSS_NUMERIX_END ===',
  ].join('\n');
}

function formatearBloqueLetraliaTS(retos: RetoIntruso[]): string {
  const items = retos.slice(0, 10).map((r, idx) => {
    return [
      '  {',
      `    id: ${JSON.stringify(`ia-int-${idx + 1}`)},`,
      `    categoria: ${JSON.stringify(r.categoria)},`,
      `    palabras: ${JSON.stringify(r.palabras)},`,
      `    indiceIntruso: ${r.indiceIntruso},`,
      `    opciones: ${JSON.stringify(r.opciones)},`,
      `    correcta: ${JSON.stringify(r.correcta)},`,
      `    pista: ${JSON.stringify(r.pista)},`,
      `    explicacion: ${JSON.stringify(r.explicacion)},`,
      '  },',
    ].join('\n');
  });

  if (items.length === 0) {
    return '  // === IA_RETOS_LETRALIA_START ===\n  // === IA_RETOS_LETRALIA_END ===';
  }

  return [
    '  // === IA_RETOS_LETRALIA_START ===',
    ...items,
    '  // === IA_RETOS_LETRALIA_END ===',
  ].join('\n');
}

function formatearBloquePuentesTS(retos: RetoPuenteSintactico[]): string {
  const items = retos.slice(0, 8).map((r, idx) => {
    return [
      '  {',
      `    id: ${JSON.stringify(`ia-pue-${idx + 1}`)},`,
      `    enfoque: ${JSON.stringify(r.enfoque)},`,
      `    ordenCorrecto: ${JSON.stringify(r.ordenCorrecto)},`,
      `    pista: ${JSON.stringify(r.pista)},`,
      `    explicacion: ${JSON.stringify(r.explicacion)},`,
      '  },',
    ].join('\n');
  });

  if (items.length === 0) {
    return '  // === IA_PUENTES_LETRALIA_START ===\n  // === IA_PUENTES_LETRALIA_END ===';
  }

  return [
    '  // === IA_PUENTES_LETRALIA_START ===',
    ...items,
    '  // === IA_PUENTES_LETRALIA_END ===',
  ].join('\n');
}

function formatearBloqueTormentaTS(retos: RetoTormenta[]): string {
  const items = retos.slice(0, 8).map((r, idx) => {
    return [
      '  {',
      `    id: ${JSON.stringify(`ia-tor-${idx + 1}`)},`,
      `    tipo: ${JSON.stringify(r.tipo)},`,
      `    consigna: ${JSON.stringify(r.consigna)},`,
      `    palabras: ${JSON.stringify(r.palabras)},`,
      `    correctas: ${JSON.stringify(r.correctas)},`,
      `    segundos: ${r.segundos || 18},`,
      `    pista: ${JSON.stringify(r.pista)},`,
      `    explicacion: ${JSON.stringify(r.explicacion)},`,
      '  },',
    ].join('\n');
  });

  if (items.length === 0) {
    return '  // === IA_TORMENTA_LETRALIA_START ===\n  // === IA_TORMENTA_LETRALIA_END ===';
  }

  return [
    '  // === IA_TORMENTA_LETRALIA_START ===',
    ...items,
    '  // === IA_TORMENTA_LETRALIA_END ===',
  ].join('\n');
}

function formatearBloqueBossLetraliaTS(retos: RetoGuardianBoss[]): string {
  const items = retos.slice(0, 6).map((r, idx) => {
    return [
      '  {',
      `    id: ${JSON.stringify(`ia-bos-${idx + 1}`)},`,
      `    titulo: ${JSON.stringify(r.titulo)},`,
      `    relato: ${JSON.stringify(r.relato)},`,
      `    fases: ${JSON.stringify(r.fases, null, 6).replace(/\n/g, '\n    ')},`,
      '  },',
    ].join('\n');
  });

  if (items.length === 0) {
    return '  // === IA_BOSS_LETRALIA_START ===\n  // === IA_BOSS_LETRALIA_END ===';
  }

  return [
    '  // === IA_BOSS_LETRALIA_START ===',
    ...items,
    '  // === IA_BOSS_LETRALIA_END ===',
  ].join('\n');
}

interface ExtrasPlanetaSync {
  nuevoRetoBossNumerix?: RetoArmilarBoss;
  nuevoRetoLetralia?: RetoIntruso;
  nuevoRetoPuenteLetralia?: RetoPuenteSintactico;
  nuevoRetoTormentaLetralia?: RetoTormenta;
  nuevoRetoBossLetralia?: RetoGuardianBoss;
}

async function sincronizarPreguntaEnArchivoPlaneta(
  planeta: PlanetaTutorIA,
  nuevaPregunta?: PreguntaGeneradaIA,
  extras: ExtrasPlanetaSync = {},
): Promise<{ archivoPlaneta: string; actualizado: boolean }> {
  const slug = getSlugPlaneta(planeta);
  const rutaRelativaJson = `data/planetas/${slug}.json`;
  const rutaPlanetaJson = path.join(process.cwd(), 'data', 'planetas', `${slug}.json`);
  let actualizado = false;

  let existentesPlaneta: PreguntaGeneradaIA[] = [];
  let bossNumerixGuardados: RetoArmilarBoss[] = [];
  let retosLetraliaGuardados: RetoIntruso[] = [];
  let puentesLetraliaGuardados: RetoPuenteSintactico[] = [];
  let tormentasLetraliaGuardadas: RetoTormenta[] = [];
  let bossLetraliaGuardados: RetoGuardianBoss[] = [];

  try {
    const raw = await fs.readFile(/*turbopackIgnore: true*/ rutaPlanetaJson, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existentesPlaneta = parsed as PreguntaGeneradaIA[];
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.preguntas)) existentesPlaneta = parsed.preguntas;
      if (Array.isArray(parsed.retosBossNumerix)) bossNumerixGuardados = parsed.retosBossNumerix;
      if (Array.isArray(parsed.retosLetralia)) retosLetraliaGuardados = parsed.retosLetralia;
      if (Array.isArray(parsed.retosPuente)) puentesLetraliaGuardados = parsed.retosPuente;
      if (Array.isArray(parsed.retosTormenta)) tormentasLetraliaGuardadas = parsed.retosTormenta;
      if (Array.isArray(parsed.retosBossLetralia)) bossLetraliaGuardados = parsed.retosBossLetralia;
    }
  } catch {}

  if (nuevaPregunta) {
    const sinDup = existentesPlaneta.filter(
      (p) => p.enunciado.trim().toLowerCase() !== nuevaPregunta.enunciado.trim().toLowerCase(),
    );
    existentesPlaneta = [nuevaPregunta, ...sinDup].slice(0, 40);
  }

  if (extras.nuevoRetoBossNumerix) {
    const r = extras.nuevoRetoBossNumerix;
    const sinDup = bossNumerixGuardados.filter(
      (x) => x.enunciado.trim().toLowerCase() !== r.enunciado.trim().toLowerCase(),
    );
    bossNumerixGuardados = [r, ...sinDup].slice(0, 15);
  }

  if (extras.nuevoRetoLetralia) {
    const firma = extras.nuevoRetoLetralia.palabras.join(' ').toLowerCase();
    const sinDup = retosLetraliaGuardados.filter(
      (x) => x.palabras.join(' ').toLowerCase() !== firma,
    );
    retosLetraliaGuardados = [extras.nuevoRetoLetralia, ...sinDup].slice(0, 15);
  }

  if (extras.nuevoRetoPuenteLetralia) {
    const firma = extras.nuevoRetoPuenteLetralia.ordenCorrecto.join(' ').toLowerCase();
    const sinDup = puentesLetraliaGuardados.filter(
      (x) => x.ordenCorrecto.join(' ').toLowerCase() !== firma,
    );
    puentesLetraliaGuardados = [extras.nuevoRetoPuenteLetralia, ...sinDup].slice(0, 12);
  }

  if (extras.nuevoRetoTormentaLetralia) {
    const firma = extras.nuevoRetoTormentaLetralia.consigna.toLowerCase();
    const sinDup = tormentasLetraliaGuardadas.filter((x) => x.consigna.toLowerCase() !== firma);
    tormentasLetraliaGuardadas = [extras.nuevoRetoTormentaLetralia, ...sinDup].slice(0, 12);
  }

  if (extras.nuevoRetoBossLetralia) {
    const firma = extras.nuevoRetoBossLetralia.titulo.toLowerCase();
    const sinDup = bossLetraliaGuardados.filter((x) => x.titulo.toLowerCase() !== firma);
    bossLetraliaGuardados = [extras.nuevoRetoBossLetralia, ...sinDup].slice(0, 8);
  }

  const payloadPlaneta =
    slug === 'letralia'
      ? {
          planeta: 'Letralia',
          actualizadoEn: new Date().toISOString(),
          preguntas: existentesPlaneta,
          retosLetralia: retosLetraliaGuardados,
          retosPuente: puentesLetraliaGuardados,
          retosTormenta: tormentasLetraliaGuardadas,
          retosBossLetralia: bossLetraliaGuardados,
        }
      : slug === 'numerix'
        ? {
            planeta: 'Numérix',
            actualizadoEn: new Date().toISOString(),
            preguntas: existentesPlaneta,
            retosBossNumerix: bossNumerixGuardados,
          }
        : {
            planeta: 'Naturae',
            actualizadoEn: new Date().toISOString(),
            preguntas: existentesPlaneta,
          };

  try {
    await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(rutaPlanetaJson), { recursive: true });
    await fs.writeFile(
      /*turbopackIgnore: true*/ rutaPlanetaJson,
      JSON.stringify(payloadPlaneta, null, 2),
      'utf8',
    );
    actualizado = true;
  } catch {
    try {
      await fs.writeFile(
        /*turbopackIgnore: true*/ `/tmp/planeta-${slug}.json`,
        JSON.stringify(payloadPlaneta, null, 2),
        'utf8',
      );
      actualizado = true;
    } catch {}
  }

  // Sincronización directa en los archivos TypeScript del planeta cuando hay disco escribible
  if (slug === 'numerix') {
    const rutaTs = path.join(process.cwd(), 'lib', 'preguntas-numerix.ts');
    try {
      let contenido = await fs.readFile(/*turbopackIgnore: true*/ rutaTs, 'utf8');
      let cambio = false;

      if (existentesPlaneta.length > 0) {
        const regexReg =
          /[ \t]*\/\/ === IA_PREGUNTAS_NUMERIX_START ===[\s\S]*?\/\/ === IA_PREGUNTAS_NUMERIX_END ===/;
        if (regexReg.test(contenido)) {
          contenido = contenido.replace(regexReg, formatearBloqueNumerixTS(existentesPlaneta));
          cambio = true;
        }
      }

      if (bossNumerixGuardados.length > 0) {
        const regexBoss =
          /[ \t]*\/\/ === IA_BOSS_NUMERIX_START ===[\s\S]*?\/\/ === IA_BOSS_NUMERIX_END ===/;
        if (regexBoss.test(contenido)) {
          contenido = contenido.replace(
            regexBoss,
            formatearBloqueBossNumerixTS(bossNumerixGuardados),
          );
          cambio = true;
        }
      }

      if (cambio) {
        await fs.writeFile(/*turbopackIgnore: true*/ rutaTs, contenido, 'utf8');
        return { archivoPlaneta: 'lib/preguntas-numerix.ts', actualizado: true };
      }
    } catch {}
  }

  if (slug === 'letralia') {
    const rutaTs = path.join(process.cwd(), 'lib', 'preguntas-letralia.ts');
    try {
      let contenido = await fs.readFile(/*turbopackIgnore: true*/ rutaTs, 'utf8');
      let cambio = false;

      if (retosLetraliaGuardados.length > 0) {
        const regexInt =
          /[ \t]*\/\/ === IA_RETOS_LETRALIA_START ===[\s\S]*?\/\/ === IA_RETOS_LETRALIA_END ===/;
        if (regexInt.test(contenido)) {
          contenido = contenido.replace(
            regexInt,
            formatearBloqueLetraliaTS(retosLetraliaGuardados),
          );
          cambio = true;
        }
      }

      if (puentesLetraliaGuardados.length > 0) {
        const regexPue =
          /[ \t]*\/\/ === IA_PUENTES_LETRALIA_START ===[\s\S]*?\/\/ === IA_PUENTES_LETRALIA_END ===/;
        if (regexPue.test(contenido)) {
          contenido = contenido.replace(
            regexPue,
            formatearBloquePuentesTS(puentesLetraliaGuardados),
          );
          cambio = true;
        }
      }

      if (tormentasLetraliaGuardadas.length > 0) {
        const regexTor =
          /[ \t]*\/\/ === IA_TORMENTA_LETRALIA_START ===[\s\S]*?\/\/ === IA_TORMENTA_LETRALIA_END ===/;
        if (regexTor.test(contenido)) {
          contenido = contenido.replace(
            regexTor,
            formatearBloqueTormentaTS(tormentasLetraliaGuardadas),
          );
          cambio = true;
        }
      }

      if (bossLetraliaGuardados.length > 0) {
        const regexBos =
          /[ \t]*\/\/ === IA_BOSS_LETRALIA_START ===[\s\S]*?\/\/ === IA_BOSS_LETRALIA_END ===/;
        if (regexBos.test(contenido)) {
          contenido = contenido.replace(
            regexBos,
            formatearBloqueBossLetraliaTS(bossLetraliaGuardados),
          );
          cambio = true;
        }
      }

      if (cambio) {
        await fs.writeFile(/*turbopackIgnore: true*/ rutaTs, contenido, 'utf8');
        return { archivoPlaneta: 'lib/preguntas-letralia.ts', actualizado: true };
      }
    } catch {}
  }

  return { archivoPlaneta: rutaRelativaJson, actualizado };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planeta = searchParams.get('planeta');
  const nivel = searchParams.get('nivel');

  const todas = await leerArchivoPreguntasJSON();
  const filtradas = todas.filter((p) => {
    const coincidePlaneta = !planeta || p.planeta.toLowerCase() === planeta.toLowerCase();
    const coincideNivel = !nivel || p.nivelDificultad === Number(nivel);
    return coincidePlaneta && coincideNivel;
  });

  const tieneGeminiKey = Boolean(
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim(),
  );

  return NextResponse.json({
    ok: true,
    modelo: tieneGeminiKey ? 'gemma-4-31b-it' : process.env.OLLAMA_MODEL || 'gemma4:31b',
    proveedorActivo: tieneGeminiKey ? 'google-ai-studio-cloud' : 'gemma4-adaptive-cloud',
    archivoJson: 'data/preguntas-ia.json',
    totalPreguntas: filtradas.length,
    preguntas: filtradas,
    ultimosReportes: memoriaReportesCache.slice(0, 25),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Acción 0: Precargar retos frescos creados por la IA al abrir un tablero (incluyendo Jefes Finales y todas las mecánicas de Letralia)
    if (body?.action === 'preparar-tablero') {
      const planeta: PlanetaTutorIA =
        body.planeta === 'Letralia' || body.planeta === 'Naturae'
          ? body.planeta
          : 'Numérix';
      const nivelNum = Number(body.nivelActual) || 1;
      const nivel: NivelDificultadIA =
        nivelNum <= 1 ? 1 : nivelNum >= 3 ? 3 : 2;

      const evitarTextos = Array.isArray(body?.evitarTextos)
        ? body.evitarTextos.map((x: unknown) => String(x))
        : [];
      const pack = await prepararRetosTableroConIA(planeta, nivel, evitarTextos);

      await sincronizarPreguntaEnArchivoPlaneta(
        planeta,
        pack.preguntasNumerix?.[0],
        {
          nuevoRetoBossNumerix: pack.retosBossNumerix?.[0],
          nuevoRetoLetralia: pack.retosIntrusoLetralia?.[0],
          nuevoRetoPuenteLetralia: pack.retosPuenteLetralia?.[0],
          nuevoRetoTormentaLetralia: pack.retosTormentaLetralia?.[0],
          nuevoRetoBossLetralia: pack.retosBossLetralia?.[0],
        },
      );

      return NextResponse.json({
        ok: true,
        ...pack,
      });
    }

    // Acción 1: Crear un reto nuevo del Jefe Final de Numérix en vivo con la IA
    if (body?.action === 'generar-boss-numerix') {
      const nivelNum = Number(body.nivelActual) || 1;
      const nivel: NivelDificultadIA =
        nivelNum <= 1 ? 1 : nivelNum >= 3 ? 3 : 2;

      const { reto, modelo, proveedor } = await generarRetoBossNumerixConIA(nivel);
      const { archivoPlaneta, actualizado } = await sincronizarPreguntaEnArchivoPlaneta(
        'Numérix',
        undefined,
        { nuevoRetoBossNumerix: reto },
      );

      return NextResponse.json({
        ok: true,
        modelo,
        proveedor,
        nuevoRetoBossNumerix: reto,
        archivoPlanetaActualizado: archivoPlaneta,
        planetaSincronizado: actualizado,
      });
    }

    // Acción 2: Crear una pregunta nueva calibrada para un planeta (uso interno / tablero)
    if (body?.action === 'generar-pregunta') {
      const planeta: PlanetaTutorIA =
        body.planeta === 'Letralia' || body.planeta === 'Naturae'
          ? body.planeta
          : 'Numérix';
      const nivelNum = Number(body.nivelActual) || 1;
      const nivel: NivelDificultadIA =
        nivelNum <= 1 ? 1 : nivelNum >= 3 ? 3 : 2;

      const { pregunta, modelo, proveedor } = await crearPreguntaNuevaConIA(
        planeta,
        nivel,
      );
      const { totalGuardadas, guardadaEnDisco } =
        await guardarNuevaPreguntaEnJSON(pregunta);
      const { archivoPlaneta, actualizado } =
        await sincronizarPreguntaEnArchivoPlaneta(planeta, pregunta);

      return NextResponse.json({
        ok: true,
        modelo,
        proveedor,
        nuevaPregunta: pregunta,
        archivoJson: 'data/preguntas-ia.json',
        archivoPlanetaActualizado: archivoPlaneta,
        planetaSincronizado: actualizado,
        totalPreguntasEnJson: totalGuardadas,
        guardadaEnDisco,
      });
    }

    // Acción 3: Diagnóstico grupal + Resumen IA de CADA estudiante + Datos listos para Reporte PDF
    if (body?.action === 'reporte-profesor') {
      const tutorNombre = String(body.tutorNombre || 'Docente');
      const totalNiveles = Number(body.totalNiveles) || 12;
      const estudiantes: Array<{
        id?: string;
        nombre: string;
        usuario: string;
        correo?: string;
        nivelesCompletados: number;
        estrellasTotales: number;
        ultimaSesion: string | null;
      }> = Array.isArray(body.estudiantes) ? body.estudiantes : [];

      const totalEstudiantes = estudiantes.length;
      const totalEstrellas = estudiantes.reduce(
        (acc, e) => acc + (Number(e.estrellasTotales) || 0),
        0,
      );
      const totalNivelesCompletados = estudiantes.reduce(
        (acc, e) => acc + (Number(e.nivelesCompletados) || 0),
        0,
      );
      const promedioEstrellas =
        totalEstudiantes > 0
          ? Number((totalEstrellas / totalEstudiantes).toFixed(1))
          : 0;

      const { resumenes: resumenesPorEstudiante, modelo, proveedor } =
        await generarResumenPorCadaEstudiante(estudiantes, totalNiveles);

      const promptGrupo = JSON.stringify({
        tarea:
          'Generar diagnóstico pedagógico ejecutivo en español para el Reporte PDF del Profesor',
        tutorNombre,
        totalEstudiantes,
        totalEstrellas,
        totalNivelesCompletados,
        promedioEstrellas,
        estudiantes: estudiantes.map((e) => ({
          nombre: e.nombre,
          niveles: e.nivelesCompletados,
          estrellas: e.estrellasTotales,
        })),
      });

      const { texto } = await consultarOllamaCloud(
        promptGrupo,
        'Eres Gemma 4 en la nube, asistente pedagógico para docentes de primaria (10 a 12 años) en Universo del Conocimiento. Redacta un diagnóstico ejecutivo claro, positivo y accionable de máximo 2 párrafos breves sin bloques markdown.',
      );

      const destacado = [...estudiantes].sort(
        (a, b) => b.estrellasTotales - a.estrellasTotales,
      )[0];
      const requiereApoyo = [...estudiantes].sort(
        (a, b) => a.nivelesCompletados - b.nivelesCompletados,
      )[0];

      const diagnosticoPorDefecto =
        totalEstudiantes === 0
          ? `El grupo del tutor ${tutorNombre} aún no registra estudiantes asignados. Una vez vinculados desde el panel de Asignaciones, Gemma 4 generará métricas detalladas por planeta y nivel adaptativo.`
          : `El grupo a cargo de ${tutorNombre} cuenta con ${totalEstudiantes} ${
              totalEstudiantes === 1 ? 'estudiante activo' : 'estudiantes activos'
            }, acumulando ${totalEstrellas} estrellas y ${totalNivelesCompletados} niveles completados (promedio de ${promedioEstrellas} estrellas por estudiante). ${
              destacado
                ? `Se destaca el avance de ${destacado.nombre} con ${destacado.estrellasTotales} estrellas.`
                : ''
            } ${
              requiereApoyo && requiereApoyo.id !== destacado?.id
                ? `Se sugiere acompañar con retos de Nivel 1 y 2 a ${requiereApoyo.nombre} para fortalecer su ritmo en Numérix y Letralia.`
                : 'Se recomienda mantener el ritmo progresivo de retos en los tableros de Numérix y Letralia para consolidar el aprendizaje.'
            }`;

      const preguntasGuardadas = await leerArchivoPreguntasJSON();

      return NextResponse.json({
        ok: true,
        modelo,
        proveedor,
        resumenPDF: {
          tituloReporte:
            'Reporte Pedagógico e Inteligencia Adaptativa · Universo del Conocimiento',
          tutorNombre,
          fechaEmision: new Date().toISOString(),
          totalEstudiantes,
          totalEstrellas,
          totalNivelesCompletados,
          promedioEstrellas,
          totalPreguntasGeneradasIA: preguntasGuardadas.length,
          diagnosticoIA: (texto || diagnosticoPorDefecto)
            .replace(/```[a-z]*|```/gi, '')
            .trim(),
          recomendacionesClave: [
            'Alternar sesiones en los tableros de Numérix (cálculo) y Letralia (lenguaje) para mantener la motivación.',
            'Dejar que el motor adaptativo suba la dificultad de forma gradual solo cuando el estudiante demuestre dominio.',
            'Acompañar los intentos fallidos manteniendo el mismo nivel de práctica sin castigos ni retrocesos.',
          ],
          resumenesPorEstudiante,
          ultimasPreguntasIA: preguntasGuardadas.slice(0, 6),
          historialIndividual: memoriaReportesCache.slice(0, 15),
        },
      });
    }

    // Acción 4 (por defecto, usada en los tableros durante el juego y en Jefes Finales):
    const entrada: EntradaEvaluacionTutorIA = {
      estudianteNombre: body?.estudianteNombre,
      planeta: body?.planeta,
      nivelActual: Number(body?.nivelActual) || 1,
      esCorrecta: Boolean(body?.esCorrecta),
      rachaAciertos: Number(body?.rachaAciertos) || 0,
      aciertos: Number(body?.aciertos) || 0,
      totalPreguntas: Number(body?.totalPreguntas) || 1,
      preguntaActual: body?.preguntaActual,
      respuestaEstudiante: body?.respuestaEstudiante,
      respuestaCorrecta: body?.respuestaCorrecta,
      consultaLibre: body?.consultaLibre,
      modeloPreferido: body?.modeloPreferido,
      evitarTextos: Array.isArray(body?.evitarTextos)
        ? body.evitarTextos.map((x: unknown) => String(x))
        : [],
    };

    const resultado = await evaluarRespuestaConTutorIA(entrada);
    const { totalGuardadas, guardadaEnDisco } = await guardarNuevaPreguntaEnJSON(
      resultado.nuevaPregunta,
    );
    const { archivoPlaneta, actualizado } = await sincronizarPreguntaEnArchivoPlaneta(
      resultado.nuevaPregunta.planeta,
      resultado.nuevaPregunta,
      {
        nuevoRetoBossNumerix: resultado.nuevoRetoBossNumerix,
        nuevoRetoLetralia: resultado.nuevoRetoLetralia,
        nuevoRetoPuenteLetralia: resultado.nuevoRetoPuenteLetralia,
        nuevoRetoTormentaLetralia: resultado.nuevoRetoTormentaLetralia,
        nuevoRetoBossLetralia: resultado.nuevoRetoBossLetralia,
      },
    );

    memoriaReportesCache.unshift(resultado.resumenProfesor);
    if (memoriaReportesCache.length > 40) {
      memoriaReportesCache.length = 40;
    }

    return NextResponse.json({
      ...resultado,
      archivoJson: 'data/preguntas-ia.json',
      archivoPlanetaActualizado: archivoPlaneta,
      planetaSincronizado: actualizado,
      totalPreguntasEnJson: totalGuardadas,
      guardadaEnDisco,
    });
  } catch (error) {
    console.error('Error en /api/tutor-ia:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'No se pudo procesar la solicitud del Tutor IA.',
      },
      { status: 500 },
    );
  }
}
