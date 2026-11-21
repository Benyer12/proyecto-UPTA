import OpenAI from 'openai';

export type PlanetaTutorIA = 'Numérix' | 'Letralia' | 'Naturae';
export type NivelDificultadIA = 1 | 2 | 3;

export interface PreguntaGeneradaIA {
  id: number;
  planeta: PlanetaTutorIA;
  materia: 'Matemáticas' | 'Lenguaje' | 'Ciencias';
  nivelDificultad: NivelDificultadIA;
  etiquetaNivel: string;
  operador?: '+' | '−' | '×' | '÷';
  enunciado: string;
  opciones: [string, string, string, string];
  indiceRespuestaCorrecta: 0 | 1 | 2 | 3;
  pista: string;
  explicacionBreve: string;
  creadaPor: string;
  fechaCreacion: string;
}

export interface ResumenReporteProfesor {
  estudianteNombre: string;
  planeta: PlanetaTutorIA;
  materia: string;
  nivelAdaptativo: NivelDificultadIA;
  etiquetaNivel: string;
  cambioNivel: 'subio' | 'bajo' | 'mantuvo';
  precisionPorcentaje: number;
  aciertos: number;
  totalPreguntas: number;
  estrellasEstimadas: number;
  fortalezas: string[];
  areasDeRefuerzo: string[];
  recomendacionPedagogica: string;
  resumenEjecutivo: string;
  fechaGeneracion: string;
}

export interface EntradaEvaluacionTutorIA {
  estudianteNombre?: string;
  planeta?: PlanetaTutorIA;
  nivelActual?: number;
  esCorrecta?: boolean;
  rachaAciertos?: number;
  aciertos?: number;
  totalPreguntas?: number;
  preguntaActual?: string;
  respuestaEstudiante?: string;
  respuestaCorrecta?: string;
  consultaLibre?: string;
  modeloPreferido?: 'gemma4:31b' | 'gemma4' | 'deepseek-v4.1-flash';
}

export interface RespuestaTutorIA {
  ok: boolean;
  modelo: string;
  proveedor: 'ollama-cloud-gemma4' | 'ollama-local-gemma4' | 'gemma4-adaptive-engine';
  nivelAnterior: NivelDificultadIA;
  nuevoNivel: NivelDificultadIA;
  cambioNivel: 'subio' | 'bajo' | 'mantuvo';
  etiquetaNivel: string;
  mensajeTutor: string;
  consejoBreve: string;
  nuevaPregunta: PreguntaGeneradaIA;
  resumenProfesor: ResumenReporteProfesor;
}

export const ETIQUETAS_NIVEL_IA: Record<NivelDificultadIA, string> = {
  1: 'Nivel 1 · Base Orbital',
  2: 'Nivel 2 · Propulsión Media',
  3: 'Nivel 3 · Comandante Cuántico',
};

export function obtenerMateriaPorPlaneta(
  planeta: PlanetaTutorIA,
): 'Matemáticas' | 'Lenguaje' | 'Ciencias' {
  if (planeta === 'Letralia') return 'Lenguaje';
  if (planeta === 'Naturae') return 'Ciencias';
  return 'Matemáticas';
}

/**
 * Sube o baja el nivel (1 a 3) según las respuestas correctas o incorrectas del estudiante
 */
export function calcularNuevoNivelAdaptativo(
  nivelActualRaw: number,
  esCorrecta: boolean,
  rachaAciertos = 0,
): {
  nivelAnterior: NivelDificultadIA;
  nuevoNivel: NivelDificultadIA;
  cambioNivel: 'subio' | 'bajo' | 'mantuvo';
} {
  const nivelAnterior: NivelDificultadIA =
    nivelActualRaw <= 1 ? 1 : nivelActualRaw >= 3 ? 3 : 2;

  let nuevoNivel: NivelDificultadIA = nivelAnterior;

  if (esCorrecta) {
    if (rachaAciertos >= 1 && nivelAnterior < 3) {
      nuevoNivel = (nivelAnterior + 1) as NivelDificultadIA;
    }
  } else if (nivelAnterior > 1) {
    nuevoNivel = (nivelAnterior - 1) as NivelDificultadIA;
  }

  const cambioNivel =
    nuevoNivel > nivelAnterior
      ? 'subio'
      : nuevoNivel < nivelAnterior
        ? 'bajo'
        : 'mantuvo';

  return { nivelAnterior, nuevoNivel, cambioNivel };
}

/**
 * Cliente directo hacia Ollama Cloud (https://ollama.com/v1) usando el SDK de OpenAI
 * Compatible con gemma4:31b, gemma4 y deepseek-v4.1-flash.
 */
export async function consultarOllamaCloud(
  prompt: string,
  systemPrompt = 'Eres el Tutor IA Espacial de Universo del Conocimiento para niños de primaria (10 a 12 años). Responde siempre en español claro, motivador y estructurado en JSON.',
  modeloPreferido: string = process.env.OLLAMA_MODEL || 'gemma4:31b',
): Promise<{
  texto: string | null;
  modeloUsado: string;
  proveedor: 'ollama-cloud-gemma4' | 'ollama-local-gemma4' | 'gemma4-adaptive-engine';
}> {
  const apiKey = (process.env.OLLAMA_API_KEY || '').trim();

  // 1. Intentar Ollama Cloud oficial (https://ollama.com/v1) con gemma4 / deepseek-v4.1-flash
  if (apiKey) {
    const cloudClient = new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1',
      apiKey,
    });

    const candidatos = Array.from(
      new Set([modeloPreferido, 'gemma4:31b', 'gemma4', 'deepseek-v4.1-flash']),
    );

    for (const model of candidatos) {
      try {
        const response = await cloudClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.55,
        });

        const content = response.choices?.[0]?.message?.content?.trim();
        if (content) {
          return {
            texto: content,
            modeloUsado: model,
            proveedor: 'ollama-cloud-gemma4',
          };
        }
      } catch {
        // Continúa al siguiente candidato o motor gratuito local
      }
    }
  }

  // 2. Intentar Ollama local gratuito si está activo en la máquina (http://127.0.0.1:11434/v1)
  try {
    const localClient = new OpenAI({
      baseURL: 'http://127.0.0.1:11434/v1',
      apiKey: 'ollama-local',
    });

    const response = await localClient.chat.completions.create({
      model: 'gemma4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.55,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (content) {
      return {
        texto: content,
        modeloUsado: 'gemma4',
        proveedor: 'ollama-local-gemma4',
      };
    }
  } catch {
    // Si no hay servidor local activo, usa el motor adaptativo gratuito integrado
  }

  return {
    texto: null,
    modeloUsado: 'gemma4:31b',
    proveedor: 'gemma4-adaptive-engine',
  };
}

/**
 * Generador dinámico de preguntas nuevas adaptadas al planeta y al nivel (1, 2 o 3)
 */
export function generarPreguntaAdaptativaPorNivel(
  planeta: PlanetaTutorIA,
  nivel: NivelDificultadIA,
): PreguntaGeneradaIA {
  const id = Date.now() + Math.floor(Math.random() * 900);
  const etiquetaNivel = ETIQUETAS_NIVEL_IA[nivel];
  const materia = obtenerMateriaPorPlaneta(planeta);
  const fechaCreacion = new Date().toISOString();

  if (planeta === 'Numérix') {
    if (nivel === 1) {
      const a = Math.floor(Math.random() * 35) + 18;
      const b = Math.floor(Math.random() * 28) + 14;
      const correcta = a + b;
      const opciones: [string, string, string, string] = [
        String(correcta),
        String(correcta + 10),
        String(correcta - 2),
        String(correcta + 4),
      ];
      return {
        id,
        planeta,
        materia,
        nivelDificultad: nivel,
        etiquetaNivel,
        operador: '+',
        enunciado: `En la estación orbital recolectaste ${a} cristales de energía y luego ${b} más. ¿Cuántos cristales tienes en total?`,
        opciones,
        indiceRespuestaCorrecta: 0,
        pista: `Suma primero las decenas (${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10}) y después las unidades (${a % 10} + ${b % 10}).`,
        explicacionBreve: `Al sumar ${a} + ${b} paso a paso obtenemos ${correcta} cristales en total.`,
        creadaPor: 'gemma4',
        fechaCreacion,
      };
    }

    if (nivel === 2) {
      const a = Math.floor(Math.random() * 8) + 6;
      const b = Math.floor(Math.random() * 7) + 4;
      const correcta = a * b;
      const opciones: [string, string, string, string] = [
        String(correcta - a),
        String(correcta),
        String(correcta + b),
        String(correcta + 6),
      ];
      return {
        id,
        planeta,
        materia,
        nivelDificultad: nivel,
        etiquetaNivel,
        operador: '×',
        enunciado: `Tu nave activa ${a} paneles solares y cada panel genera ${b} unidades de impulso. ¿Cuánto impulso produces en total?`,
        opciones,
        indiceRespuestaCorrecta: 1,
        pista: `Multiplica ${a} veces ${b} (puedes descomponerlo en sumas rápidas).`,
        explicacionBreve: `${a} paneles por ${b} unidades cada uno producen ${a} × ${b} = ${correcta} unidades de impulso.`,
        creadaPor: 'gemma4',
        fechaCreacion,
      };
    }

    // Nivel 3: Operaciones combinadas / división exacta
    const divisor = Math.floor(Math.random() * 6) + 4;
    const cociente = Math.floor(Math.random() * 9) + 7;
    const extra = Math.floor(Math.random() * 12) + 5;
    const dividendo = divisor * cociente;
    const correcta = cociente + extra;
    const opciones: [string, string, string, string] = [
      String(correcta - 3),
      String(correcta + 4),
      String(correcta),
      String(cociente),
    ];
    return {
      id,
      planeta,
      materia,
      nivelDificultad: nivel,
      etiquetaNivel,
      operador: '÷',
      enunciado: `Reto Comandante: Repartes ${dividendo} baterías entre ${divisor} naves por igual y tu nave recibe ${extra} baterías extra. ¿Cuántas tiene tu nave?`,
      opciones,
      indiceRespuestaCorrecta: 2,
      pista: `Primero divide ${dividendo} ÷ ${divisor} y al resultado súmale ${extra}.`,
      explicacionBreve: `Al dividir ${dividendo} ÷ ${divisor} cada nave recibe ${cociente}. Sumando las ${extra} extra: ${cociente} + ${extra} = ${correcta}.`,
      creadaPor: 'gemma4',
      fechaCreacion,
    };
  }

  if (planeta === 'Letralia') {
    const bancoLetralia: Record<
      NivelDificultadIA,
      Array<{
        enunciado: string;
        opciones: [string, string, string, string];
        correctaIdx: 0 | 1 | 2 | 3;
        pista: string;
        explicacion: string;
      }>
    > = {
      1: [
        {
          enunciado: '¿Cuál de estas palabras está escrita con ortografía correcta?',
          opciones: ['Exploración', 'Esploración', 'Explorasion', 'Ezploración'],
          correctaIdx: 0,
          pista: 'Viene del verbo explorar (con X al inicio y C antes de -ión).',
          explicacion: 'Se escribe «Exploración» con X y con tilde en la O por ser palabra aguda terminada en N.',
        },
        {
          enunciado: 'Elige el sinónimo más adecuado para la palabra «veloz»:',
          opciones: ['Lento', 'Rápido', 'Pesado', 'Lejano'],
          correctaIdx: 1,
          pista: 'Busca la palabra que significa que se mueve con mucha rapidez.',
          explicacion: '«Rápido» y «veloz» son sinónimos porque expresan la misma idea.',
        },
      ],
      2: [
        {
          enunciado: '¿Cuál de las siguientes palabras es esdrújula?',
          opciones: ['Galaxia', 'Brújula', 'Cometa', 'Solar'],
          correctaIdx: 1,
          pista: 'Las palabras esdrújulas llevan la fuerza de voz en la antepenúltima sílaba y siempre se tildan.',
          explicacion: '«Brú-ju-la» tiene el acento en la antepenúltima sílaba, por lo que es esdrújula.',
        },
        {
          enunciado: 'Completa la oración con el conector adecuado: «Estudió el mapa estelar, ___ encontró la ruta correcta.»',
          opciones: ['por eso', 'aunque', 'sin embargo', 'jamás'],
          correctaIdx: 0,
          pista: 'Necesitas un conector que exprese consecuencia positiva.',
          explicacion: '«Por eso» introduce la consecuencia lógica de haber estudiado el mapa.',
        },
      ],
      3: [
        {
          enunciado: '¿En cuál oración se usa correctamente la tilde diacrítica?',
          opciones: [
            'Tú nave llegará lejos si confías en ti.',
            'Tu nave llegará lejos si tú confías en la misión.',
            'Tu nave llegará lejos sí tu confías.',
            'Tú nave llegará lejos si tu confías.',
          ],
          correctaIdx: 1,
          pista: '«Tú» lleva tilde cuando es pronombre personal, pero «tu» no lleva tilde cuando acompaña a un sustantivo.',
          explicacion: '«Tu nave» es posesivo (sin tilde) y «tú confías» es pronombre personal (con tilde).',
        },
      ],
    };

    const lista = bancoLetralia[nivel];
    const item = lista[Math.floor(Math.random() * lista.length)];
    return {
      id,
      planeta,
      materia,
      nivelDificultad: nivel,
      etiquetaNivel,
      enunciado: item.enunciado,
      opciones: item.opciones,
      indiceRespuestaCorrecta: item.correctaIdx,
      pista: item.pista,
      explicacionBreve: item.explicacion,
      creadaPor: 'gemma4',
      fechaCreacion,
    };
  }

  // Naturae (Ciencias)
  const bancoNaturae: Record<
    NivelDificultadIA,
    Array<{
      enunciado: string;
      opciones: [string, string, string, string];
      correctaIdx: 0 | 1 | 2 | 3;
      pista: string;
      explicacion: string;
    }>
  > = {
    1: [
      {
        enunciado: '¿Qué proceso realizan las plantas para fabricar su alimento usando la luz del Sol?',
        opciones: ['Fotosíntesis', 'Evaporación', 'Gravedad', 'Magnetismo'],
        correctaIdx: 0,
        pista: 'La palabra comienza con «foto», que significa luz.',
        explicacion: 'Mediante la fotosíntesis, las plantas transforman agua, CO2 y luz solar en energía y oxígeno.',
      },
    ],
    2: [
      {
        enunciado: '¿Cuál es el planeta más grande de nuestro Sistema Solar?',
        opciones: ['Marte', 'Tierra', 'Júpiter', 'Venus'],
        correctaIdx: 2,
        pista: 'Es un gigante gaseoso famoso por su Gran Mancha Roja.',
        explicacion: 'Júpiter es el planeta de mayor tamaño y masa de todo el Sistema Solar.',
      },
    ],
    3: [
      {
        enunciado: 'En una cadena alimenticia, ¿qué rol cumplen los hongos y bacterias que reciclan nutrientes al suelo?',
        opciones: ['Productores', 'Descomponedores', 'Herbívoros', 'Depredadores'],
        correctaIdx: 1,
        pista: 'Se encargan de descomponer la materia orgánica para que vuelva a nutrir a las plantas.',
        explicacion: 'Los descomponedores transforman restos orgánicos en nutrientes esenciales para el ecosistema.',
      },
    ],
  };

  const listaNat = bancoNaturae[nivel];
  const itemNat = listaNat[Math.floor(Math.random() * listaNat.length)];
  return {
    id,
    planeta,
    materia,
    nivelDificultad: nivel,
    etiquetaNivel,
    enunciado: itemNat.enunciado,
    opciones: itemNat.opciones,
    indiceRespuestaCorrecta: itemNat.correctaIdx,
    pista: itemNat.pista,
    explicacionBreve: itemNat.explicacion,
    creadaPor: 'gemma4',
    fechaCreacion,
  };
}

function extraerJSONDeTexto<T>(texto: string | null): T | null {
  if (!texto) return null;
  try {
    const limpio = texto
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const inicio = limpio.indexOf('{');
    const fin = limpio.lastIndexOf('}');
    if (inicio !== -1 && fin !== -1 && fin > inicio) {
      return JSON.parse(limpio.slice(inicio, fin + 1)) as T;
    }
    return JSON.parse(limpio) as T;
  } catch {
    return null;
  }
}

/**
 * Evalúa la respuesta del niño, sube o baja el nivel, genera mensaje de tutor,
 * produce una nueva pregunta adaptada y devuelve el resumen listo para el PDF del profesor.
 */
export async function evaluarRespuestaConTutorIA(
  entrada: EntradaEvaluacionTutorIA,
): Promise<RespuestaTutorIA> {
  const estudianteNombre = (entrada.estudianteNombre || 'Explorador').trim();
  const planeta: PlanetaTutorIA = entrada.planeta || 'Numérix';
  const materia = obtenerMateriaPorPlaneta(planeta);
  const esCorrecta = entrada.esCorrecta ?? true;
  const rachaAciertos = entrada.rachaAciertos ?? (esCorrecta ? 1 : 0);
  const aciertos = Math.max(0, entrada.aciertos ?? (esCorrecta ? 1 : 0));
  const totalPreguntas = Math.max(1, entrada.totalPreguntas ?? 1);
  const precisionPorcentaje = Math.min(100, Math.round((aciertos / totalPreguntas) * 100));

  const { nivelAnterior, nuevoNivel, cambioNivel } = calcularNuevoNivelAdaptativo(
    entrada.nivelActual ?? 1,
    esCorrecta,
    rachaAciertos,
  );
  const etiquetaNivel = ETIQUETAS_NIVEL_IA[nuevoNivel];

  const promptIA = JSON.stringify({
    tarea: 'Evaluar respuesta de estudiante de primaria (10 a 12 años) y generar nueva pregunta adaptada al nuevoNivel + resumen para reporte PDF del profesor',
    estudianteNombre,
    planeta,
    materia,
    esCorrecta,
    nivelAnterior,
    nuevoNivel,
    cambioNivel,
    precisionPorcentaje,
    preguntaActual: entrada.preguntaActual || '',
    respuestaEstudiante: entrada.respuestaEstudiante || '',
    respuestaCorrecta: entrada.respuestaCorrecta || '',
    consultaLibre: entrada.consultaLibre || '',
    formatoSalidaJSON: {
      mensajeTutor: 'string (mensaje cálido y motivador del tutor IA directo al niño, máx 220 caracteres)',
      consejoBreve: 'string (pista o tip práctico corto)',
      nuevaPregunta: {
        enunciado: 'string',
        opciones: ['op1', 'op2', 'op3', 'op4'],
        indiceRespuestaCorrecta: 0,
        pista: 'string',
        explicacionBreve: 'string',
      },
      resumenProfesor: {
        fortalezas: ['string', 'string'],
        areasDeRefuerzo: ['string'],
        recomendacionPedagogica: 'string',
        resumenEjecutivo: 'string',
      },
    },
  });

  const { texto, modeloUsado, proveedor } = await consultarOllamaCloud(
    promptIA,
    'Eres Gemma 4, el Tutor IA Pedagógico de Universo del Conocimiento. Devuelve únicamente un objeto JSON válido con las claves solicitadas, sin bloques markdown adicionales.',
    entrada.modeloPreferido || 'gemma4:31b',
  );

  const parsed = extraerJSONDeTexto<{
    mensajeTutor?: string;
    consejoBreve?: string;
    nuevaPregunta?: {
      enunciado?: string;
      opciones?: string[];
      indiceRespuestaCorrecta?: number;
      pista?: string;
      explicacionBreve?: string;
    };
    resumenProfesor?: {
      fortalezas?: string[];
      areasDeRefuerzo?: string[];
      recomendacionPedagogica?: string;
      resumenEjecutivo?: string;
    };
  }>(texto);

  const preguntaBase = generarPreguntaAdaptativaPorNivel(planeta, nuevoNivel);

  const nuevaPregunta: PreguntaGeneradaIA =
    parsed?.nuevaPregunta?.enunciado &&
    Array.isArray(parsed.nuevaPregunta.opciones) &&
    parsed.nuevaPregunta.opciones.length === 4
      ? {
          ...preguntaBase,
          enunciado: parsed.nuevaPregunta.enunciado,
          opciones: [
            String(parsed.nuevaPregunta.opciones[0]),
            String(parsed.nuevaPregunta.opciones[1]),
            String(parsed.nuevaPregunta.opciones[2]),
            String(parsed.nuevaPregunta.opciones[3]),
          ],
          indiceRespuestaCorrecta: (Math.min(
            3,
            Math.max(0, Number(parsed.nuevaPregunta.indiceRespuestaCorrecta) || 0),
          ) as 0 | 1 | 2 | 3),
          pista: parsed.nuevaPregunta.pista || preguntaBase.pista,
          explicacionBreve:
            parsed.nuevaPregunta.explicacionBreve || preguntaBase.explicacionBreve,
        }
      : preguntaBase;

  const mensajeCambio =
    cambioNivel === 'subio'
      ? `¡Subiste a ${etiquetaNivel}!`
      : cambioNivel === 'bajo'
        ? `Ajusté los retos a ${etiquetaNivel} para reforzar paso a paso.`
        : `Te mantienes firme en ${etiquetaNivel}.`;

  const mensajeTutorPorDefecto = entrada.consultaLibre
    ? `¡Hola, ${estudianteNombre}! En ${planeta} (${materia}), recuerda leer cada pista con calma y descomponer el reto en pasos pequeños. ${mensajeCambio}`
    : esCorrecta
      ? `¡Excelente respuesta, ${estudianteNombre}! Dominaste este reto de ${materia} en ${planeta}. ${mensajeCambio}`
      : `¡Buen intento, ${estudianteNombre}! En ${planeta} aprender de cada paso nos hace mejores exploradores. ${
          entrada.respuestaCorrecta
            ? `La respuesta esperada era «${entrada.respuestaCorrecta}». `
            : ''
        }${mensajeCambio}`;

  const consejoPorDefecto = esCorrecta
    ? `Tu precisión va en ${precisionPorcentaje}%. ¡Preparé una nueva pregunta de ${etiquetaNivel} en el banco de misiones!`
    : nuevaPregunta.pista;

  const estrellasEstimadas =
    precisionPorcentaje >= 85 ? 3 : precisionPorcentaje >= 60 ? 2 : 1;

  const resumenProfesor: ResumenReporteProfesor = {
    estudianteNombre,
    planeta,
    materia,
    nivelAdaptativo: nuevoNivel,
    etiquetaNivel,
    cambioNivel,
    precisionPorcentaje,
    aciertos,
    totalPreguntas,
    estrellasEstimadas,
    fortalezas:
      parsed?.resumenProfesor?.fortalezas?.length
        ? parsed.resumenProfesor.fortalezas
        : esCorrecta
          ? [
              `Resolución autónoma en ${materia} (${planeta})`,
              `Progreso constante hacia ${etiquetaNivel}`,
            ]
          : [
              `Persistencia activa en los tableros de ${planeta}`,
              `Uso formativo de pistas sin abandono de misión`,
            ],
    areasDeRefuerzo:
      parsed?.resumenProfesor?.areasDeRefuerzo?.length
        ? parsed.resumenProfesor.areasDeRefuerzo
        : esCorrecta
          ? [`Retos de mayor complejidad (${ETIQUETAS_NIVEL_IA[Math.min(3, nuevoNivel + 1) as NivelDificultadIA]})`]
          : [`Reforzar conceptos base de ${materia} en ${etiquetaNivel}`],
    recomendacionPedagogica:
      parsed?.resumenProfesor?.recomendacionPedagogica ||
      (precisionPorcentaje >= 80
        ? `El estudiante demuestra alto dominio (${precisionPorcentaje}%). Se recomienda mantener retos de ${etiquetaNivel} y habilitar desafíos del Guardián.`
        : `El estudiante registra ${precisionPorcentaje}% de precisión. Se recomienda acompañar con ejercicios guiados de ${etiquetaNivel} antes de subir la dificultad.`),
    resumenEjecutivo:
      parsed?.resumenProfesor?.resumenEjecutivo ||
      `${estudianteNombre} completó ${totalPreguntas} ${
        totalPreguntas === 1 ? 'intervención' : 'intervenciones'
      } en ${planeta} (${materia}) con ${aciertos} ${
        aciertos === 1 ? 'acierto' : 'aciertos'
      } (${precisionPorcentaje}% de precisión) y nivel adaptativo ${etiquetaNivel}.`,
    fechaGeneracion: new Date().toISOString(),
  };

  return {
    ok: true,
    modelo: modeloUsado,
    proveedor,
    nivelAnterior,
    nuevoNivel,
    cambioNivel,
    etiquetaNivel,
    mensajeTutor: parsed?.mensajeTutor || mensajeTutorPorDefecto,
    consejoBreve: parsed?.consejoBreve || consejoPorDefecto,
    nuevaPregunta,
    resumenProfesor,
  };
}

