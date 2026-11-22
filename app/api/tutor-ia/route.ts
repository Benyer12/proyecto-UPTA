import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  consultarOllamaCloud,
  crearPreguntaNuevaConIA,
  evaluarRespuestaConTutorIA,
  generarResumenPorCadaEstudiante,
  type EntradaEvaluacionTutorIA,
  type NivelDificultadIA,
  type PlanetaTutorIA,
  type PreguntaGeneradaIA,
  type ResumenReporteProfesor,
} from '../../../lib/ai-tutor';

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
      await fs.writeFile(TMP_JSON_FILE_PATH, jsonFormatted, 'utf8');
      guardadaEnDisco = true;
    } catch {
      guardadaEnDisco = false;
    }
  }

  return { totalGuardadas: actualizadas.length, guardadaEnDisco };
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

    // Acción 1: Crear una pregunta nueva bajo demanda con la IA y guardarla en data/preguntas-ia.json
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

      return NextResponse.json({
        ok: true,
        modelo,
        proveedor,
        nuevaPregunta: pregunta,
        archivoJson: 'data/preguntas-ia.json',
        totalPreguntasEnJson: totalGuardadas,
        guardadaEnDisco,
      });
    }

    // Acción 2: Diagnóstico grupal + Resumen IA de CADA estudiante + Datos listos para Reporte PDF
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
                : 'Se recomienda habilitar retos de Nivel 2 y 3 para consolidar el razonamiento lógico y la comprensión lectora.'
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
            'Alternar sesiones de Numérix (cálculo mental) con Letralia (comprensión y ortografía) cada 20 minutos.',
            'Utilizar las preguntas adaptativas guardadas en data/preguntas-ia.json para reforzar niveles con menor puntaje.',
            'Premiar la constancia de intentos sin penalizar errores para sostener la motivación del grupo.',
          ],
          resumenesPorEstudiante,
          ultimasPreguntasIA: preguntasGuardadas.slice(0, 6),
          historialIndividual: memoriaReportesCache.slice(0, 15),
        },
      });
    }

    // Acción 3 (por defecto): Evaluar respuesta del niño, subir/bajar nivel, responder como tutor, guardar nueva pregunta en .json y devolver resumen PDF
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
    };

    const resultado = await evaluarRespuestaConTutorIA(entrada);
    const { totalGuardadas, guardadaEnDisco } = await guardarNuevaPreguntaEnJSON(
      resultado.nuevaPregunta,
    );

    memoriaReportesCache.unshift(resultado.resumenProfesor);
    if (memoriaReportesCache.length > 40) {
      memoriaReportesCache.length = 40;
    }

    return NextResponse.json({
      ...resultado,
      archivoJson: 'data/preguntas-ia.json',
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
