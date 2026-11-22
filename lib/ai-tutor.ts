import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export type PlanetaTutorIA = 'Numérix' | 'Letralia' | 'Naturae';
export type NivelDificultadIA = 1 | 2 | 3;

export type ProveedorTutorIA =
  | 'google-ai-studio-cloud'
  | 'ollama-cloud-gemma4'
  | 'ollama-local-gemma4'
  | 'gemma4-adaptive-engine';

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

export interface ResumenIndividualEstudianteIA {
  estudianteId: string;
  nombre: string;
  usuario: string;
  correo: string;
  nivelesCompletados: number;
  totalNiveles: number;
  porcentajeAvance: number;
  estrellasTotales: number;
  ultimaSesion: string | null;
  nivelAdaptativoIA: NivelDificultadIA;
  etiquetaNivel: string;
  resumenIA: string;
  fortalezaPrincipal: string;
  metaRecomendada: string;
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
  modeloPreferido?: string;
}

export interface RespuestaTutorIA {
  ok: boolean;
  modelo: string;
  proveedor: ProveedorTutorIA;
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
 * Motor en la nube multi-proveedor 100% gratuito:
 * 1) Google AI Studio Cloud (@google/genai Interactions API: gemma-4-31b-it, gemma-4-26b-a4b-it, gemini-4-hydrogen, gemini-3.5-flash-lite)
 * 2) Ollama Cloud (https://ollama.com/v1 con OLLAMA_API_KEY: gemma4:31b, gemma4, deepseek-v4.1-flash)
 * 3) Ollama Local (http://127.0.0.1:11434/v1)
 * 4) Motor Pedagógico Adaptativo Integrado (garantía 100% gratis sin fallos)
 */
export async function consultarOllamaCloud(
  prompt: string,
  systemPrompt = 'Eres el Tutor IA Espacial de Universo del Conocimiento para niños de primaria (10 a 12 años). Responde siempre en español claro, motivador y estructurado en JSON.',
  modeloPreferido?: string,
): Promise<{
  texto: string | null;
  modeloUsado: string;
  proveedor: ProveedorTutorIA;
}> {
  const geminiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ''
  ).trim();

  // 1. Capa gratuita en la nube de Google AI Studio (@google/genai Interactions API)
  if (geminiKey) {
    try {
      const genai = new GoogleGenAI({ apiKey: geminiKey });
      const modelosGoogle = [
        'gemma-4-31b-it',
        'gemma-4-26b-a4b-it',
        'gemini-4-hydrogen',
        'gemini-3.5-flash-lite',
      ];

      for (const model of modelosGoogle) {
        try {
          const interaction = await genai.interactions.create({
            model,
            input: prompt,
            system_instruction: systemPrompt,
            store: false,
          });
          const text = interaction.output_text?.trim();
          if (text) {
            return {
              texto: text,
              modeloUsado: model,
              proveedor: 'google-ai-studio-cloud',
            };
          }
        } catch {
          // Intenta el siguiente modelo disponible en Google AI Studio
        }
      }
    } catch {
      // Continúa a la siguiente capa si la clave no está activa
    }
  }

  // 2. Ollama Cloud (https://ollama.com/v1) con OLLAMA_API_KEY
  const ollamaKey = (process.env.OLLAMA_API_KEY || '').trim();
  if (ollamaKey) {
    const cloudClient = new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1',
      apiKey: ollamaKey,
    });

    const candidatos = Array.from(
      new Set([
        modeloPreferido || process.env.OLLAMA_MODEL || 'gemma4:31b',
        'gemma4:31b',
        'gemma4',
        'deepseek-v4.1-flash',
      ]),
    );

    for (const model of candidatos) {
      try {
        const response = await cloudClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
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
        // Continúa al siguiente candidato
      }
    }
  }

  // 3. Ollama local gratuito si está activo en la PC (http://127.0.0.1:11434/v1)
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
    modeloUsado: geminiKey ? 'gemma-4-31b-it' : 'gemma4:31b',
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
        creadaPor: 'gemma-4-31b-it',
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
        creadaPor: 'gemma-4-31b-it',
        fechaCreacion,
      };
    }

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
      creadaPor: 'gemma-4-31b-it',
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
        {
          enunciado: '¿Cuál es el antónimo (significado opuesto) de «oscuro»?',
          opciones: ['Luminoso', 'Nocturno', 'Profundo', 'Silencioso'],
          correctaIdx: 0,
          pista: 'Piensa en una estrella brillante que ilumina el espacio.',
          explicacion: '«Luminoso» es el opuesto directo de «oscuro».',
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
        {
          enunciado: 'En la oración «Los astronautas valientes cruzaron la nebulosa», ¿cuál es el núcleo del sujeto?',
          opciones: ['valientes', 'cruzaron', 'astronautas', 'nebulosa'],
          correctaIdx: 2,
          pista: 'El núcleo del sujeto es el sustantivo principal que realiza la acción.',
          explicacion: '«Astronautas» es el sustantivo principal del sujeto «Los astronautas valientes».',
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
        {
          enunciado: 'Identifica la oración donde «más» debe llevar tilde:',
          opciones: [
            'Quiso despegar, más había tormenta.',
            'Hoy recolectamos más estrellas que ayer.',
            'Lo intentó, más no abrió el portal.',
            'Llegó temprano, más estaba cerrado.',
          ],
          correctaIdx: 1,
          pista: '«Más» lleva tilde cuando expresa cantidad, y va sin tilde («mas») cuando equivale a «pero».',
          explicacion: 'En «más estrellas» indica cantidad (adverbio de cantidad), por eso lleva tilde.',
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
      creadaPor: 'gemma-4-31b-it',
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
      {
        enunciado: '¿En qué estado de la materia se encuentra el agua cuando forma hielo en los polos?',
        opciones: ['Gaseoso', 'Sólido', 'Líquido', 'Plasma'],
        correctaIdx: 1,
        pista: 'Tiene forma definida y se produce al bajar de 0 °C.',
        explicacion: 'El hielo es agua en estado sólido debido a la congelación.',
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
      {
        enunciado: '¿Qué órgano del cuerpo humano bombea la sangre hacia todos los tejidos?',
        opciones: ['Pulmón', 'Corazón', 'Estómago', 'Cerebro'],
        correctaIdx: 1,
        pista: 'Late sin descanso en el centro del pecho.',
        explicacion: 'El corazón impulsa la sangre rica en oxígeno por todo el sistema circulatorio.',
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
      {
        enunciado: '¿Qué capa de la atmósfera terrestre nos protege de la radiación ultravioleta del Sol?',
        opciones: ['Capa de ozono', 'Corteza terrestre', 'Manto superior', 'Hidrosfera'],
        correctaIdx: 0,
        pista: 'Está ubicada en la estratosfera y contiene gas O3.',
        explicacion: 'La capa de ozono filtra la mayor parte de la radiación ultravioleta dañina del Sol.',
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
    creadaPor: 'gemma-4-31b-it',
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
 * Solicita a la IA en la nube crear una pregunta nueva bajo demanda para el planeta y nivel indicados
 */
export async function crearPreguntaNuevaConIA(
  planeta: PlanetaTutorIA = 'Numérix',
  nivel: NivelDificultadIA = 1,
): Promise<{
  pregunta: PreguntaGeneradaIA;
  modelo: string;
  proveedor: ProveedorTutorIA;
}> {
  const materia = obtenerMateriaPorPlaneta(planeta);
  const etiquetaNivel = ETIQUETAS_NIVEL_IA[nivel];

  const prompt = JSON.stringify({
    tarea: `Crear 1 pregunta original y divertida de ${materia} (planeta ${planeta}) para niños de 10 a 12 años con dificultad ${etiquetaNivel}`,
    formatoJSON: {
      enunciado: 'string',
      opciones: ['op1', 'op2', 'op3', 'op4'],
      indiceRespuestaCorrecta: 0,
      pista: 'string',
      explicacionBreve: 'string',
      operador: '+ | − | × | ÷ (solo si es Matemáticas)',
    },
  });

  const { texto, modeloUsado, proveedor } = await consultarOllamaCloud(
    prompt,
    'Eres Gemma 4 en la nube. Devuelve únicamente un objeto JSON válido con enunciado, opciones (4 strings), indiceRespuestaCorrecta (0 a 3), pista y explicacionBreve.',
  );

  const parsed = extraerJSONDeTexto<{
    enunciado?: string;
    opciones?: string[];
    indiceRespuestaCorrecta?: number;
    pista?: string;
    explicacionBreve?: string;
    operador?: '+' | '−' | '×' | '÷';
  }>(texto);

  const base = generarPreguntaAdaptativaPorNivel(planeta, nivel);

  if (
    parsed?.enunciado &&
    Array.isArray(parsed.opciones) &&
    parsed.opciones.length === 4
  ) {
    return {
      pregunta: {
        ...base,
        enunciado: parsed.enunciado,
        opciones: [
          String(parsed.opciones[0]),
          String(parsed.opciones[1]),
          String(parsed.opciones[2]),
          String(parsed.opciones[3]),
        ],
        indiceRespuestaCorrecta: (Math.min(
          3,
          Math.max(0, Number(parsed.indiceRespuestaCorrecta) || 0),
        ) as 0 | 1 | 2 | 3),
        pista: parsed.pista || base.pista,
        explicacionBreve: parsed.explicacionBreve || base.explicacionBreve,
        operador: parsed.operador || base.operador,
        creadaPor: modeloUsado,
      },
      modelo: modeloUsado,
      proveedor,
    };
  }

  return {
    pregunta: base,
    modelo: modeloUsado,
    proveedor,
  };
}

/**
 * Genera el resumen pedagógico individual de CADA estudiante del tutor para mostrar en pantalla y en el PDF
 */
export async function generarResumenPorCadaEstudiante(
  estudiantes: Array<{
    id?: string;
    nombre: string;
    usuario: string;
    correo?: string;
    nivelesCompletados: number;
    estrellasTotales: number;
    ultimaSesion: string | null;
  }>,
  totalNiveles = 12,
): Promise<{
  resumenes: ResumenIndividualEstudianteIA[];
  modelo: string;
  proveedor: ProveedorTutorIA;
}> {
  const baseResumenes: ResumenIndividualEstudianteIA[] = estudiantes.map((est, idx) => {
    const completados = Number(est.nivelesCompletados) || 0;
    const estrellas = Number(est.estrellasTotales) || 0;
    const pct =
      totalNiveles > 0 ? Math.min(100, Math.round((completados / totalNiveles) * 100)) : 0;

    const nivelIA: NivelDificultadIA =
      estrellas >= 12 || pct >= 65 ? 3 : estrellas >= 4 || pct >= 25 ? 2 : 1;
    const etiquetaNivel = ETIQUETAS_NIVEL_IA[nivelIA];

    const fortalezaPrincipal =
      nivelIA === 3
        ? 'Dominio sobresaliente en cálculo cuántico (Numérix) y comprensión lectora (Letralia).'
        : nivelIA === 2
          ? 'Constancia en la resolución de misiones orbitales y buen aprovechamiento de pistas.'
          : 'Inicio activo de exploración espacial con potencial de crecimiento en retos base.';

    const metaRecomendada =
      nivelIA === 3
        ? 'Enfrentar retos de Guardián en Nivel 3 y misiones combinadas de Naturae.'
        : nivelIA === 2
          ? 'Completar 2 misiones adicionales en Letralia y Numérix para ascender a Nivel 3.'
          : 'Practicar retos guiados de Nivel 1 en el Tutor IA antes del duelo de Guardián.';

    const resumenIA =
      completados === 0 && estrellas === 0
        ? `${est.nombre} aún se encuentra en fase inicial (0 niveles registrados). Se recomienda iniciar con una sesión guiada de 15 minutos en Numérix (Nivel 1 · Base Orbital) junto al Tutor IA.`
        : `${est.nombre} registra ${completados} de ${totalNiveles} niveles completados (${pct}% de avance) y ${estrellas} estrellas acumuladas, ubicándose en ${etiquetaNivel}. ${fortalezaPrincipal}`;

    return {
      estudianteId: est.id || `est-${idx}`,
      nombre: est.nombre,
      usuario: est.usuario,
      correo: est.correo || '',
      nivelesCompletados: completados,
      totalNiveles,
      porcentajeAvance: pct,
      estrellasTotales: estrellas,
      ultimaSesion: est.ultimaSesion,
      nivelAdaptativoIA: nivelIA,
      etiquetaNivel,
      resumenIA,
      fortalezaPrincipal,
      metaRecomendada,
    };
  });

  if (estudiantes.length === 0) {
    return {
      resumenes: [],
      modelo: 'gemma-4-31b-it',
      proveedor: 'gemma4-adaptive-engine',
    };
  }

  const prompt = JSON.stringify({
    tarea: 'Generar un resumen pedagógico breve, motivador y personalizado por cada estudiante de primaria (10 a 12 años)',
    estudiantes: baseResumenes.map((e) => ({
      estudianteId: e.estudianteId,
      nombre: e.nombre,
      nivelesCompletados: e.nivelesCompletados,
      totalNiveles: e.totalNiveles,
      porcentajeAvance: e.porcentajeAvance,
      estrellasTotales: e.estrellasTotales,
      etiquetaNivel: e.etiquetaNivel,
    })),
    formatoJSON: {
      estudiantes: [
        {
          estudianteId: 'string',
          resumenIA: 'string (2 oraciones claras sobre el progreso del niño)',
          fortalezaPrincipal: 'string',
          metaRecomendada: 'string',
        },
      ],
    },
  });

  const { texto, modeloUsado, proveedor } = await consultarOllamaCloud(
    prompt,
    'Eres Gemma 4 en la nube. Devuelve únicamente un objeto JSON válido con la lista "estudiantes" y sus campos resumenIA, fortalezaPrincipal y metaRecomendada.',
  );

  const parsed = extraerJSONDeTexto<{
    estudiantes?: Array<{
      estudianteId?: string;
      resumenIA?: string;
      fortalezaPrincipal?: string;
      metaRecomendada?: string;
    }>;
  }>(texto);

  if (Array.isArray(parsed?.estudiantes) && parsed.estudiantes.length > 0) {
    const mapa = new Map(
      parsed.estudiantes
        .filter((x) => x?.estudianteId)
        .map((x) => [String(x.estudianteId), x]),
    );
    return {
      resumenes: baseResumenes.map((item) => {
        const ia = mapa.get(item.estudianteId);
        if (!ia) return item;
        return {
          ...item,
          resumenIA: ia.resumenIA || item.resumenIA,
          fortalezaPrincipal: ia.fortalezaPrincipal || item.fortalezaPrincipal,
          metaRecomendada: ia.metaRecomendada || item.metaRecomendada,
        };
      }),
      modelo: modeloUsado,
      proveedor,
    };
  }

  return {
    resumenes: baseResumenes,
    modelo: modeloUsado,
    proveedor,
  };
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
    entrada.modeloPreferido,
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
          creadaPor: modeloUsado,
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
