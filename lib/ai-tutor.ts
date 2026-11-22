import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import {
  PREGUNTAS_NUMERIX,
  RETOS_ARMILAR_BOSS,
  type RetoArmilarBoss,
} from './preguntas-numerix';
import {
  RETOS_INTRUSO,
  RETOS_PUENTE,
  RETOS_TORMENTA,
  RETOS_GUARDIAN,
  type RetoIntruso,
  type RetoPuenteSintactico,
  type RetoTormenta,
  type RetoGuardianBoss,
} from './preguntas-letralia';

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
  evitarTextos?: string[];
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
  nuevoRetoBossNumerix?: RetoArmilarBoss;
  nuevoRetoLetralia?: RetoIntruso;
  nuevoRetoPuenteLetralia?: RetoPuenteSintactico;
  nuevoRetoTormentaLetralia?: RetoTormenta;
  nuevoRetoBossLetralia?: RetoGuardianBoss;
  resumenProfesor: ResumenReporteProfesor;
}

export const ETIQUETAS_NIVEL_IA: Record<NivelDificultadIA, string> = {
  1: 'Nivel 1 · Base (Default)',
  2: 'Nivel 2 · Desafío Moderado',
  3: 'Nivel 3 · Reto Avanzado',
};

export function obtenerMateriaPorPlaneta(
  planeta: PlanetaTutorIA,
): 'Matemáticas' | 'Lenguaje' | 'Ciencias' {
  if (planeta === 'Letralia') return 'Lenguaje';
  if (planeta === 'Naturae') return 'Ciencias';
  return 'Matemáticas';
}

/**
 * Sube la dificultad gradualmente (1 -> 2 -> 3) solo cuando el niño responde muy bien
 * (racha >= 2 aciertos seguidos y buena precisión). Si falla, se mantiene en el mismo nivel.
 */
export function calcularNuevoNivelAdaptativo(
  nivelActualRaw: number,
  esCorrecta: boolean,
  rachaAciertos = 0,
  precisionPorcentaje = 100,
): {
  nivelAnterior: NivelDificultadIA;
  nuevoNivel: NivelDificultadIA;
  cambioNivel: 'subio' | 'bajo' | 'mantuvo';
} {
  const nivelAnterior: NivelDificultadIA =
    nivelActualRaw <= 1 ? 1 : nivelActualRaw >= 3 ? 3 : 2;

  let nuevoNivel: NivelDificultadIA = nivelAnterior;

  if (esCorrecta && rachaAciertos >= 2 && precisionPorcentaje >= 75 && nivelAnterior < 3) {
    nuevoNivel = (nivelAnterior + 1) as NivelDificultadIA;
  }

  const cambioNivel = nuevoNivel > nivelAnterior ? 'subio' : 'mantuvo';

  return { nivelAnterior, nuevoNivel, cambioNivel };
}

function elegirSinDuplicar<T>(
  nivel: NivelDificultadIA,
  bancoPorNivel: Record<NivelDificultadIA, T[]>,
  getFirma: (item: T) => string,
  evitarTextos: string[] = [],
): T {
  const evitarSet = new Set(evitarTextos.map((t) => t.trim().toLowerCase()));
  const delNivel = bancoPorNivel[nivel].filter(
    (item) => !evitarSet.has(getFirma(item).trim().toLowerCase()),
  );
  if (delNivel.length > 0) {
    return delNivel[Math.floor(Math.random() * delNivel.length)];
  }
  const todos: T[] = [...bancoPorNivel[1], ...bancoPorNivel[2], ...bancoPorNivel[3]];
  const restantes = todos.filter(
    (item) => !evitarSet.has(getFirma(item).trim().toLowerCase()),
  );
  const pool = restantes.length > 0 ? restantes : bancoPorNivel[nivel];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Genera un RetoIntruso nativo para Letralia guiado por el estilo y dificultad default de RETOS_INTRUSO,
 * evitando repetir retos ya mostrados en la partida.
 */
export function generarRetoLetraliaAdaptativo(
  nivel: NivelDificultadIA,
  evitarTextos: string[] = [],
): RetoIntruso {
  const id = `int-ia-${Date.now().toString(36)}-${Math.floor(Math.random() * 90 + 10)}`;
  const bancoPorNivel: Record<NivelDificultadIA, Omit<RetoIntruso, 'id'>[]> = {
    1: [
      {
        categoria: 'ortografia',
        palabras: ['La', 'nave', 'viaja', 'con', 'mucha', 'rapides', 'espacial.'],
        indiceIntruso: 5,
        opciones: ['rapidez', 'rapidéz', 'rrapidez'],
        correcta: 'rapidez',
        pista: 'Las palabras terminadas en -ez que vienen de adjetivos (rápido) se escriben con z.',
        explicacion: '«Rapidez» se escribe con z al final, igual que «timidez» o «sencillez».',
      },
      {
        categoria: 'concordancia',
        palabras: ['Las', 'estrellas', 'brillante', 'iluminan', 'el', 'mapa.'],
        indiceIntruso: 2,
        opciones: ['brillantes', 'brillanta', 'brillamos'],
        correcta: 'brillantes',
        pista: '«Estrellas» está en plural; el adjetivo debe coincidir en número.',
        explicacion: 'Como «estrellas» es plural, el adjetivo correcto es «brillantes».',
      },
      {
        categoria: 'ortografia',
        palabras: ['El', 'explorador', 'vio', 'una', 'nube', 'vlanca', 'en', 'el', 'cielo.'],
        indiceIntruso: 5,
        opciones: ['blanca', 'blamca', 'vlanka'],
        correcta: 'blanca',
        pista: 'Antes de la letra L siempre se escribe B, nunca V.',
        explicacion: '«Blanca» se escribe con b porque va seguida de l (bl).',
      },
      {
        categoria: 'concordancia',
        palabras: ['Unos', 'planetas', 'lejana', 'giran', 'alrededor', 'del', 'Sol.'],
        indiceIntruso: 2,
        opciones: ['lejanos', 'lejano', 'lejanas'],
        correcta: 'lejanos',
        pista: '«Planetas» es masculino y plural.',
        explicacion: 'El adjetivo debe concordar en género y número: «planetas lejanos».',
      },
      {
        categoria: 'ortografia',
        palabras: ['Mi', 'amigo', 'toca', 'el', 'tanbor', 'en', 'la', 'fiesta.'],
        indiceIntruso: 4,
        opciones: ['tambor', 'tamvor', 'tanvor'],
        correcta: 'tambor',
        pista: 'Antes de B o P siempre se escribe M, nunca N.',
        explicacion: '«Tambor» lleva m antes de b por regla ortográfica.',
      },
    ],
    2: [
      {
        categoria: 'acentuacion',
        palabras: ['El', 'astronauta', 'revisó', 'la', 'brujula', 'antes', 'de', 'salir.'],
        indiceIntruso: 4,
        opciones: ['brújula', 'brujúla', 'brujulá'],
        correcta: 'brújula',
        pista: 'Separa en sílabas: brú-ju-la. La fuerza va en la antepenúltima sílaba.',
        explicacion: '«Brújula» es esdrújula y todas las palabras esdrújulas siempre llevan tilde.',
      },
      {
        categoria: 'ortografia',
        palabras: ['Nuestro', 'equipo', 'desidió', 'explorar', 'el', 'bosque', 'cercano.'],
        indiceIntruso: 2,
        opciones: ['decidió', 'desidio', 'decidio'],
        correcta: 'decidió',
        pista: 'Viene de «decidir» (con c) y lleva tilde en la última sílaba.',
        explicacion: '«Decidió» se escribe con c y tilde en la o por ser aguda terminada en vocal.',
      },
      {
        categoria: 'acentuacion',
        palabras: ['Escuchamos', 'una', 'musica', 'suave', 'dentro', 'del', 'santuario.'],
        indiceIntruso: 2,
        opciones: ['música', 'musíca', 'musicá'],
        correcta: 'música',
        pista: 'Mú-si-ca lleva la fuerza en la antepenúltima sílaba.',
        explicacion: '«Música» es esdrújula y siempre lleva tilde en la ú.',
      },
      {
        categoria: 'ortografia',
        palabras: ['La', 'viajera', 'hiso', 'un', 'dibujo', 'del', 'cometa.'],
        indiceIntruso: 2,
        opciones: ['hizo', 'izo', 'hisó'],
        correcta: 'hizo',
        pista: 'Viene del verbo «hacer» y se escribe con h y con z.',
        explicacion: '«Hizo» es pasado de hacer y siempre lleva h y z.',
      },
      {
        categoria: 'concordancia',
        palabras: ['La', 'linterna', 'mágico', 'iluminó', 'todo', 'el', 'sendero.'],
        indiceIntruso: 2,
        opciones: ['mágica', 'mágicos', 'mágicas'],
        correcta: 'mágica',
        pista: '«Linterna» es femenino singular.',
        explicacion: 'El adjetivo concuerda con «la linterna»: «mágica».',
      },
    ],
    3: [
      {
        categoria: 'acentuacion',
        palabras: ['Solo', 'tu', 'puedes', 'activar', 'el', 'portal', 'estelar.'],
        indiceIntruso: 1,
        opciones: ['tú', 'tus', 'tuvo'],
        correcta: 'tú',
        pista: 'Cuando reemplaza el nombre de la persona, es pronombre personal y lleva tilde.',
        explicacion: '«Tú» lleva tilde diacrítica cuando funciona como pronombre personal («tú puedes»).',
      },
      {
        categoria: 'ortografia',
        palabras: ['El', 'piloto', 'tubo', 'que', 'calibrar', 'los', 'motores.'],
        indiceIntruso: 2,
        opciones: ['tuvo', 'túvo', 'tuvoo'],
        correcta: 'tuvo',
        pista: 'Piensa si se refiere a un cilindro hueco o al verbo «tener» en pasado.',
        explicacion: '«Tuvo» con v viene del verbo «tener»; «tubo» con b es un objeto cilíndrico.',
      },
      {
        categoria: 'acentuacion',
        palabras: ['Yo', 'se', 'donde', 'guardaron', 'la', 'llave', 'dorada.'],
        indiceIntruso: 1,
        opciones: ['sé', 'sed', 'ser'],
        correcta: 'sé',
        pista: 'Cuando viene del verbo saber (yo sé), lleva tilde diacrítica.',
        explicacion: '«Sé» con tilde es del verbo saber; «se» sin tilde es pronombre.',
      },
      {
        categoria: 'ortografia',
        palabras: ['Mañana', 'habra', 'una', 'lluvia', 'de', 'meteoritos', 'azules.'],
        indiceIntruso: 1,
        opciones: ['habrá', 'abrá', 'hávra'],
        correcta: 'habrá',
        pista: 'Viene del verbo «haber» (con h y b) y es aguda terminada en vocal.',
        explicacion: '«Habrá» lleva h, b y tilde en la última sílaba.',
      },
      {
        categoria: 'ortografia',
        palabras: ['El', 'guardián', 'hechó', 'polvo', 'de', 'estrellas', 'al', 'altar.'],
        indiceIntruso: 2,
        opciones: ['echó', 'echò', 'hecho'],
        correcta: 'echó',
        pista: 'El verbo «echar» (lanzar o arrojar) nunca lleva h.',
        explicacion: '«Echó» viene del verbo echar y se escribe sin h.',
      },
    ],
  };

  const elegido = elegirSinDuplicar(
    nivel,
    bancoPorNivel,
    (r) => r.palabras.join(' '),
    evitarTextos,
  );
  return { id, ...elegido };
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

    const divisor = Math.floor(Math.random() * 4) + 3;
    const cociente = Math.floor(Math.random() * 6) + 5;
    const extra = Math.floor(Math.random() * 8) + 4;
    const dividendo = divisor * cociente;
    const correcta = cociente + extra;
    const opciones: [string, string, string, string] = [
      String(correcta - 2),
      String(correcta + 3),
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
      enunciado: `Repartes ${dividendo} baterías entre ${divisor} naves por igual y tu nave recibe ${extra} baterías más. ¿Cuántas tiene tu nave?`,
      opciones,
      indiceRespuestaCorrecta: 2,
      pista: `Primero divide ${dividendo} ÷ ${divisor} y al resultado súmale ${extra}.`,
      explicacionBreve: `Al dividir ${dividendo} ÷ ${divisor} cada nave recibe ${cociente}. Sumando ${extra}: ${cociente} + ${extra} = ${correcta}.`,
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
    precisionPorcentaje,
  );
  const etiquetaNivel = ETIQUETAS_NIVEL_IA[nuevoNivel];

  // Referencia real de las preguntas default escritas en el planeta para calibrar la dificultad sin exagerar
  const ejemplosDefault =
    planeta === 'Numérix'
      ? PREGUNTAS_NUMERIX.slice(0, 3).map((p) => ({
          enunciado: p.enunciado,
          operador: p.operador,
          opciones: p.opciones,
        }))
      : planeta === 'Letralia'
        ? RETOS_INTRUSO.slice(0, 3).map((r) => ({
            categoria: r.categoria,
            oracion: r.palabras.join(' '),
            correcta: r.correcta,
          }))
        : [
            {
              enunciado: '¿Qué proceso usan las plantas para fabricar su alimento con la luz del Sol?',
              respuesta: 'Fotosíntesis',
            },
          ];

  const promptIA = JSON.stringify({
    tarea:
      'Evaluar respuesta de un niño de primaria (10 a 12 años) DURANTE el tablero de juego. Guíate con ejemplosDefault para conocer la dificultad base (Nivel 1). Si nuevoNivel subió (2 o 3), incrementa la dificultad de forma moderada y gradual, NUNCA exagerada ni de secundaria.',
    reglaProgresion:
      'Si el estudiante respondió bien con buena racha, sube un paso suave; si falló, se mantiene en el mismo nivel para reforzar sin castigo.',
    estudianteNombre,
    planeta,
    materia,
    esCorrecta,
    nivelAnterior,
    nuevoNivel,
    cambioNivel,
    precisionPorcentaje,
    ejemplosDefaultDelPlaneta: ejemplosDefault,
    preguntaActual: entrada.preguntaActual || '',
    respuestaEstudiante: entrada.respuestaEstudiante || '',
    respuestaCorrecta: entrada.respuestaCorrecta || '',
    formatoSalidaJSON: {
      mensajeTutor: 'string (mensaje cálido y breve del tutor IA en el tablero, máx 180 caracteres)',
      consejoBreve: 'string (pista corta)',
      nuevaPregunta: {
        enunciado: 'string',
        opciones: ['op1', 'op2', 'op3', 'op4'],
        indiceRespuestaCorrecta: 0,
        pista: 'string',
        explicacionBreve: 'string',
        operador: '+ | − | × | ÷ (solo Numérix)',
      },
      resumenProfesor: {
        fortalezas: ['string'],
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
      ? `¡Vas excelente! Subimos suavemente a ${etiquetaNivel}.`
      : `Seguimos en ${etiquetaNivel} para afianzar a tu ritmo.`;

  const evitar = Array.isArray(entrada.evitarTextos) ? entrada.evitarTextos : [];

  const nuevoRetoBossNumerix =
    planeta === 'Numérix' ? generarRetoBossNumerixAdaptativo(nuevoNivel) : undefined;

  const nuevoRetoLetralia =
    planeta === 'Letralia' ? generarRetoLetraliaAdaptativo(nuevoNivel, evitar) : undefined;
  const nuevoRetoPuenteLetralia =
    planeta === 'Letralia' ? generarRetoPuenteLetraliaAdaptativo(nuevoNivel, evitar) : undefined;
  const nuevoRetoTormentaLetralia =
    planeta === 'Letralia' ? generarRetoTormentaLetraliaAdaptativo(nuevoNivel, evitar) : undefined;
  const nuevoRetoBossLetralia =
    planeta === 'Letralia' ? generarRetoBossLetraliaAdaptativo(nuevoNivel, evitar) : undefined;

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
    nuevoRetoBossNumerix,
    nuevoRetoLetralia,
    nuevoRetoPuenteLetralia,
    nuevoRetoTormentaLetralia,
    nuevoRetoBossLetralia,
    resumenProfesor,
  };
}

/**
 * Genera un reto calibrado y nuevo para el Jefe Final de Numérix (Núcleo Armilar)
 * tomando como referencia la dificultad default de RETOS_ARMILAR_BOSS.
 */
export function generarRetoBossNumerixAdaptativo(
  nivel: NivelDificultadIA,
): RetoArmilarBoss {
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const tipo = rand(0, 3);
  let enunciado = '';
  let correctoNum = 0;
  let unidad = '';
  let pista = '';
  let explicacion = '';

  if (nivel === 1) {
    if (tipo === 0) {
      const anillos = rand(3, 6);
      const cristales = rand(4, 8);
      correctoNum = anillos * cristales;
      enunciado = `El Núcleo Armilar enciende ${anillos} anillos y cada uno lleva ${cristales} gemas de luz. ¿Cuántas gemas brillan en total?`;
      pista = `Multiplica ${anillos} × ${cristales}.`;
      explicacion = `${anillos} × ${cristales} = ${correctoNum} gemas de luz.`;
    } else if (tipo === 1) {
      const meta = rand(45, 75);
      const actual = rand(18, meta - 12);
      correctoNum = meta - actual;
      enunciado = `Un sello armilar necesita ${meta} pulsos y ya acumuló ${actual}. ¿Cuántos pulsos le faltan?`;
      pista = `Resta ${meta} − ${actual}.`;
      explicacion = `${meta} − ${actual} = ${correctoNum} pulsos faltantes.`;
    } else if (tipo === 2) {
      const grupos = rand(3, 5);
      const porGrupo = rand(5, 9);
      const total = grupos * porGrupo;
      correctoNum = porGrupo;
      enunciado = `El Guardián reparte ${total} rayos de energía en partes iguales entre ${grupos} anillos. ¿Cuántos rayos recibe cada anillo?`;
      pista = `Divide ${total} ÷ ${grupos}.`;
      explicacion = `Como ${grupos} × ${porGrupo} = ${total}, cada anillo recibe ${porGrupo} rayos.`;
    } else {
      const a = rand(18, 36);
      const b = rand(14, 29);
      correctoNum = a + b;
      unidad = '°';
      enunciado = `El primer anillo gira ${a} grados y el segundo gira ${b} grados más. ¿Cuántos grados giraron entre los dos?`;
      pista = `Suma ${a} + ${b}.`;
      explicacion = `${a} + ${b} = ${correctoNum} grados en total.`;
    }
  } else if (nivel === 2) {
    if (tipo === 0) {
      const nodos = rand(5, 9);
      const mw = rand(6, 9);
      correctoNum = nodos * mw;
      unidad = ' MW';
      enunciado = `Cada uno de los ${nodos} núcleos armilares genera ${mw} MW de potencia. ¿Cuánta potencia producen juntos?`;
      pista = `Calcula ${nodos} × ${mw}.`;
      explicacion = `${nodos} × ${mw} = ${correctoNum} MW en total.`;
    } else if (tipo === 1) {
      const total = rand(80, 125);
      const usados = rand(28, 56);
      correctoNum = total - usados;
      enunciado = `La Esfera Armilar tenía ${total} cargas y consumió ${usados} al abrir el portal. ¿Cuántas cargas quedan disponibles?`;
      pista = `Resta ${total} − ${usados} descomponiendo en decenas y unidades.`;
      explicacion = `${total} − ${usados} = ${correctoNum} cargas disponibles.`;
    } else if (tipo === 2) {
      const pilares = rand(4, 8);
      const chispas = rand(6, 9);
      const total = pilares * chispas;
      correctoNum = chispas;
      enunciado = `Hay ${total} chispas doradas distribuidas por igual en ${pilares} pilares del altar. ¿Cuántas chispas hay en cada pilar?`;
      pista = `Busca qué número multiplicado por ${pilares} da ${total}.`;
      explicacion = `${total} ÷ ${pilares} = ${chispas} chispas por pilar.`;
    } else {
      const a = rand(38, 65);
      const b = rand(24, 48);
      correctoNum = a + b;
      enunciado = `El anillo exterior suma ${a} impulsos y el interior aporta ${b}. ¿Cuántos impulsos activan el sello?`;
      pista = `Suma primero las decenas y luego las unidades de ${a} + ${b}.`;
      explicacion = `${a} + ${b} = ${correctoNum} impulsos en total.`;
    }
  } else {
    // Nivel 3: 2 pasos suaves (sin exagerar)
    if (tipo === 0) {
      const anillos = rand(4, 7);
      const gemas = rand(6, 9);
      const extra = rand(5, 12);
      correctoNum = anillos * gemas + extra;
      enunciado = `El Guardián activa ${anillos} anillos con ${gemas} gemas cada uno y añade ${extra} gemas de reserva. ¿Cuántas gemas hay en total?`;
      pista = `Primero multiplica ${anillos} × ${gemas} y luego suma ${extra}.`;
      explicacion = `${anillos} × ${gemas} = ${anillos * gemas}, más ${extra} = ${correctoNum} gemas.`;
    } else if (tipo === 1) {
      const bloques = rand(5, 8);
      const valor = rand(7, 9);
      const gasto = rand(6, 15);
      correctoNum = bloques * valor - gasto;
      unidad = ' MW';
      enunciado = `Tienes ${bloques} celdas de ${valor} MW cada una y el escudo consume ${gasto} MW. ¿Cuántos MW quedan libres?`;
      pista = `Calcula ${bloques} × ${valor} y réstale ${gasto}.`;
      explicacion = `${bloques} × ${valor} = ${bloques * valor}, menos ${gasto} = ${correctoNum} MW.`;
    } else {
      const grupos = rand(4, 6);
      const base = rand(8, 12);
      const total = grupos * base;
      correctoNum = base + 4;
      enunciado = `Se reparten ${total} cristales entre ${grupos} anillos iguales y luego tu anillo recibe 4 cristales extra. ¿Cuántos cristales reúne tu anillo?`;
      pista = `Divide ${total} ÷ ${grupos} y suma 4.`;
      explicacion = `${total} ÷ ${grupos} = ${base}, y ${base} + 4 = ${correctoNum} cristales.`;
    }
  }

  const d1 = correctoNum + rand(2, 6);
  const d2 = Math.max(1, correctoNum - rand(2, 6));
  const correctaStr = `${correctoNum}${unidad}`;
  const opcionesRaw = [correctaStr, `${d1}${unidad}`, `${d2 === correctoNum ? correctoNum + 8 : d2}${unidad}`];
  const barajadas = [...opcionesRaw].sort(() => Math.random() - 0.5) as [string, string, string];

  return {
    id: `ia-arm-${Date.now()}-${rand(10, 99)}`,
    enunciado,
    opciones: barajadas,
    indiceCorrecto: barajadas.indexOf(correctaStr) as 0 | 1 | 2,
    pista,
    explicacion,
  };
}

/**
 * Genera un reto nuevo de Puente Sintáctico para Letralia calibrado por nivel (1..3)
 */
export function generarRetoPuenteLetraliaAdaptativo(
  nivel: NivelDificultadIA,
  evitarTextos: string[] = [],
): RetoPuenteSintactico {
  const bancos: Record<NivelDificultadIA, Array<Omit<RetoPuenteSintactico, 'id'>>> = {
    1: [
      {
        enfoque: 'sujeto-predicado',
        ordenCorrecto: ['La brújula', 'astral', 'guía', 'a los viajeros', 'por el cielo'],
        pista: 'Empieza por el sujeto con mayúscula: ¿qué guía a los viajeros?',
        explicacion: 'Sujeto: «La brújula astral». Predicado: «guía a los viajeros por el cielo».',
      },
      {
        enfoque: 'sujeto-predicado',
        ordenCorrecto: ['El cometa', 'luminoso', 'cruza', 'el cielo', 'de Letralia'],
        pista: 'Primero identifica quién realiza la acción (El cometa luminoso).',
        explicacion: '«El cometa luminoso» es el sujeto y «cruza el cielo de Letralia» el predicado.',
      },
      {
        enfoque: 'coherencia',
        ordenCorrecto: ['Los estudiantes', 'descubren', 'palabras nuevas', 'en cada isla'],
        pista: 'Piensa en orden: ¿quiénes?, ¿qué hacen?, ¿qué descubren?, ¿dónde?',
        explicacion: 'La oración completa mantiene sujeto, verbo, complemento y lugar en orden claro.',
      },
      {
        enfoque: 'sujeto-predicado',
        ordenCorrecto: ['El telescopio', 'de cristal', 'muestra', 'planetas', 'lejanos'],
        pista: 'Busca primero el objeto con mayúscula y después la acción que realiza.',
        explicacion: 'Sujeto: «El telescopio de cristal». Predicado: «muestra planetas lejanos».',
      },
      {
        enfoque: 'coherencia',
        ordenCorrecto: ['Mi hermana', 'escribe', 'cuentos divertidos', 'en su cuaderno'],
        pista: 'Empieza por quién escribe y termina diciendo dónde lo hace.',
        explicacion: 'El orden sujeto + verbo + objeto + lugar hace la frase completamente clara.',
      },
    ],
    2: [
      {
        enfoque: 'conectores',
        ordenCorrecto: ['Leímos', 'la pista;', 'por lo tanto,', 'encontramos', 'la respuesta'],
        pista: '«Por lo tanto» une una acción con su resultado.',
        explicacion: 'Leer la pista es la causa y «por lo tanto» introduce la consecuencia.',
      },
      {
        enfoque: 'conectores',
        ordenCorrecto: ['El camino', 'era largo;', 'sin embargo,', 'llegamos', 'al santuario'],
        pista: '«Sin embargo» conecta una dificultad con un logro inesperado.',
        explicacion: '«Sin embargo» muestra contraste entre un camino largo y lograr llegar.',
      },
      {
        enfoque: 'coherencia',
        ordenCorrecto: ['La bibliotecaria', 'ordenó', 'los códices', 'antes del', 'amanecer'],
        pista: 'Coloca primero quién actuó, luego el verbo y al final cuándo ocurrió.',
        explicacion: 'Sujeto (La bibliotecaria) + acción (ordenó los códices) + tiempo (antes del amanecer).',
      },
      {
        enfoque: 'conectores',
        ordenCorrecto: ['Practicamos', 'las tildes;', 'por eso,', 'mejoramos', 'nuestra escritura'],
        pista: '«Por eso» anuncia el resultado positivo de practicar.',
        explicacion: 'Practicar las tildes es la causa y mejorar la escritura es su consecuencia.',
      },
      {
        enfoque: 'sujeto-predicado',
        ordenCorrecto: ['Las naves', 'de papel', 'volaron', 'muy alto', 'sobre el patio'],
        pista: 'Primero coloca de qué hablamos y después qué hicieron.',
        explicacion: 'Sujeto: «Las naves de papel». Predicado: «volaron muy alto sobre el patio».',
      },
    ],
    3: [
      {
        enfoque: 'conectores',
        ordenCorrecto: ['Aunque', 'soplaba viento,', 'el puente', 'de sílabas', 'se mantuvo firme'],
        pista: '«Aunque» va al inicio para anunciar un obstáculo que no impide el resultado.',
        explicacion: '«Aunque» introduce la dificultad (soplaba viento) antes de la idea principal.',
      },
      {
        enfoque: 'conectores',
        ordenCorrecto: ['Cuidamos', 'la ortografía', 'y,', 'además,', 'revisamos', 'cada acento'],
        pista: '«Además» suma una segunda acción relacionada con la primera.',
        explicacion: 'El conector «además» enlaza dos acciones que se complementan.',
      },
      {
        enfoque: 'coherencia',
        ordenCorrecto: ['Los exploradores', 'escriben', 'su diario', 'para recordar', 'cada descubrimiento'],
        pista: 'Ubica quién escribe, qué escribe y al final con qué propósito.',
        explicacion: 'La estructura sujeto + verbo + objeto + finalidad da claridad total a la idea.',
      },
      {
        enfoque: 'conectores',
        ordenCorrecto: ['El mapa', 'estaba roto;', 'no obstante,', 'logramos', 'hallar la ruta'],
        pista: '«No obstante» funciona igual que «sin embargo» para unir ideas opuestas.',
        explicacion: 'A pesar de que el mapa estaba roto, lograron hallar la ruta.',
      },
      {
        enfoque: 'coherencia',
        ordenCorrecto: ['Antes de', 'despegar,', 'la capitana', 'revisó', 'todos los motores'],
        pista: 'Empieza por la frase de tiempo con mayúscula y luego quién actuó.',
        explicacion: 'El complemento temporal «Antes de despegar» ordena cuándo ocurrió la acción.',
      },
    ],
  };

  const elegido = elegirSinDuplicar(
    nivel,
    bancos,
    (r) => r.ordenCorrecto.join(' '),
    evitarTextos,
  );
  return {
    id: `ia-pue-${Date.now()}-${Math.floor(Math.random() * 90 + 10)}`,
    ...elegido,
  };
}

/**
 * Genera un reto nuevo de Tormenta Acústica para Letralia calibrado por nivel (1..3) sin repetir
 */
export function generarRetoTormentaLetraliaAdaptativo(
  nivel: NivelDificultadIA,
  evitarTextos: string[] = [],
): RetoTormenta {
  const bancos: Record<NivelDificultadIA, Array<Omit<RetoTormenta, 'id'>>> = {
    1: [
      {
        tipo: 'esdrujulas',
        consigna: '¡Atrapa las 3 palabras ESDRÚJULAS antes de que pase la tormenta!',
        palabras: ['sábado', 'nube', 'lámpara', 'sol', 'médico', 'camino'],
        correctas: ['sábado', 'lámpara', 'médico'],
        segundos: 18,
        pista: 'Todas las esdrújulas llevan tilde en la antepenúltima sílaba.',
        explicacion: 'SÁ-ba-do, LÁM-pa-ra y MÉ-di-co son esdrújulas.',
      },
      {
        tipo: 'sinonimos',
        consigna: '¡Activa 3 SINÓNIMOS de «grande» en el Altar!',
        palabras: ['enorme', 'chico', 'gigante', 'inmenso', 'breve', 'corto'],
        correctas: ['enorme', 'gigante', 'inmenso'],
        segundos: 18,
        pista: 'Busca palabras que signifiquen casi lo mismo que grande.',
        explicacion: 'Enorme, gigante e inmenso son sinónimos de grande.',
      },
      {
        tipo: 'antonimos',
        consigna: '¡Atrapa 3 ANTÓNIMOS de «frío» antes de que pase la tormenta!',
        palabras: ['caliente', 'helado', 'cálido', 'gélido', 'tibio', 'congelado'],
        correctas: ['caliente', 'cálido', 'tibio'],
        segundos: 18,
        pista: 'Busca palabras que expresen calor, lo contrario de frío.',
        explicacion: 'Caliente, cálido y tibio se oponen a frío.',
      },
      {
        tipo: 'agudas',
        consigna: '¡Activa las 3 palabras AGUDAS en el escudo!',
        palabras: ['mamá', 'casa', 'papel', 'nube', 'ratón', 'libro'],
        correctas: ['mamá', 'papel', 'ratón'],
        segundos: 18,
        pista: 'En las agudas la sílaba más fuerte es la última.',
        explicacion: 'Ma-MÁ, pa-PEL y ra-TÓN llevan la fuerza al final.',
      },
    ],
    2: [
      {
        tipo: 'agudas',
        consigna: '¡Atrapa las 3 palabras AGUDAS antes de que termine el conteo!',
        palabras: ['corazón', 'árbol', 'volcán', 'lápiz', 'colibrí', 'mesa'],
        correctas: ['corazón', 'volcán', 'colibrí'],
        segundos: 18,
        pista: 'En las agudas la fuerza cae en la última sílaba.',
        explicacion: 'Co-ra-ZÓN, vol-CÁN y co-li-BRÍ llevan la sílaba tónica al final.',
      },
      {
        tipo: 'antonimos',
        consigna: '¡Rescata 3 ANTÓNIMOS de «antiguo» en el escudo!',
        palabras: ['moderno', 'viejo', 'actual', 'remoto', 'nuevo', 'pasado'],
        correctas: ['moderno', 'actual', 'nuevo'],
        segundos: 18,
        pista: 'Un antónimo expresa la idea contraria.',
        explicacion: 'Moderno, actual y nuevo significan lo opuesto de antiguo.',
      },
      {
        tipo: 'sinonimos',
        consigna: '¡Encuentra 3 SINÓNIMOS de «inteligente» antes de que pase la tormenta!',
        palabras: ['listo', 'lento', 'astuto', 'sabio', 'torpe', 'distraído'],
        correctas: ['listo', 'astuto', 'sabio'],
        segundos: 18,
        pista: 'Son palabras parecidas en significado a inteligente.',
        explicacion: 'Listo, astuto y sabio son sinónimos de inteligente.',
      },
      {
        tipo: 'esdrujulas',
        consigna: '¡Rescata 3 palabras ESDRÚJULAS de la lluvia estelar!',
        palabras: ['teléfono', 'ventana', 'plátano', 'puerta', 'máquina', 'cielo'],
        correctas: ['teléfono', 'plátano', 'máquina'],
        segundos: 18,
        pista: 'Fíjate en las que llevan tilde en la antepenúltima sílaba.',
        explicacion: 'Te-LÉ-fo-no, PLÁ-ta-no y MÁ-qui-na son esdrújulas.',
      },
    ],
    3: [
      {
        tipo: 'graves',
        consigna: '¡Encaja las 3 palabras GRAVES (llanas) en el escudo astral!',
        palabras: ['cráter', 'compás', 'trébol', 'música', 'azúcar', 'balón'],
        correctas: ['cráter', 'trébol', 'azúcar'],
        segundos: 18,
        pista: 'Las graves llevan la fuerza en la penúltima sílaba; llevan tilde si no terminan en n, s o vocal.',
        explicacion: 'CRÁ-ter, TRÉ-bol y a-ZÚ-car son graves con tilde.',
      },
      {
        tipo: 'esdrujulas',
        consigna: '¡Desactiva la tormenta eligiendo las 3 palabras ESDRÚJULAS!',
        palabras: ['océano', 'estrella', 'relámpago', 'planeta', 'pirámide', 'cometa'],
        correctas: ['océano', 'relámpago', 'pirámide'],
        segundos: 18,
        pista: 'Fíjate dónde cae la tilde: antepenúltima sílaba.',
        explicacion: 'O-CÉ-a-no, re-LÁM-pa-go y pi-RÁ-mi-de son esdrújulas.',
      },
      {
        tipo: 'sinonimos',
        consigna: '¡Atrapa 3 SINÓNIMOS de «asombroso» en el Altar!',
        palabras: ['increíble', 'común', 'admirable', 'fascinante', 'aburrido', 'simple'],
        correctas: ['increíble', 'admirable', 'fascinante'],
        segundos: 18,
        pista: 'Busca adjetivos que expresen admiración o sorpresa.',
        explicacion: 'Increíble, admirable y fascinante son sinónimos de asombroso.',
      },
      {
        tipo: 'antonimos',
        consigna: '¡Activa 3 ANTÓNIMOS de «abundante» antes del impacto!',
        palabras: ['escaso', 'mucho', 'poco', 'insuficiente', 'lleno', 'sobrante'],
        correctas: ['escaso', 'poco', 'insuficiente'],
        segundos: 18,
        pista: 'Piensa en palabras que indiquen falta o poca cantidad.',
        explicacion: 'Escaso, poco e insuficiente son contrarios a abundante.',
      },
    ],
  };

  const elegido = elegirSinDuplicar(
    nivel,
    bancos,
    (r) => r.consigna,
    evitarTextos,
  );
  return {
    id: `ia-tor-${Date.now()}-${Math.floor(Math.random() * 90 + 10)}`,
    ...elegido,
  };
}

/**
 * Genera un duelo final nuevo para el Guardián de Letralia calibrado por nivel (1..3) sin repetir
 */
export function generarRetoBossLetraliaAdaptativo(
  nivel: NivelDificultadIA,
  evitarTextos: string[] = [],
): RetoGuardianBoss {
  const duelos: Record<NivelDificultadIA, Array<Omit<RetoGuardianBoss, 'id'>>> = {
    1: [
      {
        titulo: 'La constelación de los cuentos',
        relato:
          'El Guardián encendió una linterna azul. «Cada historia que lees vive dentro de {0}, joven explorador», susurró. «Muchos pasaron con prisa sin leer los mapas; {1}, no encontraron la puerta secreta. Quien lee con atención abre puertas invisibles». Enseñanza: {2}.',
        fases: [
          {
            titulo: 'Sello 1 · Tilde diacrítica',
            enunciado: 'Elige la palabra correcta para completar el primer espacio.',
            opciones: ['ti', 'tí'],
            correcta: 'ti',
            explicacion: 'El pronombre «ti» nunca lleva tilde porque no existe otra palabra igual con distinto significado.',
          },
          {
            titulo: 'Sello 2 · Conector lógico',
            enunciado: 'Pasar con prisa causó que no encontraran la puerta. ¿Qué conector une esa causa con su consecuencia?',
            opciones: ['por eso', 'aunque', 'además'],
            correcta: 'por eso',
            explicacion: '«Por eso» presenta la consecuencia directa de pasar sin leer los mapas.',
          },
          {
            titulo: 'Sello 3 · Comprensión lectora',
            enunciado: '¿Qué significa que «quien lee con atención abre puertas invisibles»?',
            opciones: [
              'leer con cuidado nos permite descubrir ideas y oportunidades nuevas',
              'los libros tienen llaves escondidas dentro del papel',
              'las puertas del santuario no se pueden ver nunca',
            ],
            correcta: 'leer con cuidado nos permite descubrir ideas y oportunidades nuevas',
            explicacion: 'Es una metáfora: leer atentamente nos abre caminos de aprendizaje.',
          },
        ],
      },
      {
        titulo: 'El jardín de las letras',
        relato:
          'Una brisa dorada abrió las páginas del libro. «Este mensaje fue escrito para {0}», dijo el Guardián. «Sembraste curiosidad en cada casilla; {1}, hoy florece el jardín de Letralia. Cada libro leído es una semilla que da luz». Idea clave: {2}.',
        fases: [
          {
            titulo: 'Sello 1 · Tilde diacrítica',
            enunciado: 'Elige la palabra correcta para el primer espacio.',
            opciones: ['mí', 'mi'],
            correcta: 'mí',
            explicacion: '«Mí» con tilde es pronombre personal (para mí). «Mi» sin tilde indica pertenencia (mi libro).',
          },
          {
            titulo: 'Sello 2 · Conector lógico',
            enunciado: 'Sembrar curiosidad produjo que el jardín floreciera. ¿Qué conector indica ese resultado?',
            opciones: ['por lo tanto', 'sin embargo', 'aunque'],
            correcta: 'por lo tanto',
            explicacion: '«Por lo tanto» une la causa (sembrar curiosidad) con su resultado (florece el jardín).',
          },
          {
            titulo: 'Sello 3 · Comprensión lectora',
            enunciado: '¿Qué quiere decir que «cada libro leído es una semilla que da luz»?',
            opciones: [
              'cada lectura hace crecer nuestro conocimiento y claridad mental',
              'los libros deben plantarse en macetas con agua',
              'las semillas brillan por la noche en la biblioteca',
            ],
            correcta: 'cada lectura hace crecer nuestro conocimiento y claridad mental',
            explicacion: 'Es lenguaje figurado para expresar cómo la lectura nos hace crecer y aprender.',
          },
        ],
      },
    ],
    2: [
      {
        titulo: 'El puente de las voces',
        relato:
          'Al abrir el pergamino, el Guardián preguntó: «¿Sabes por qué brilla este códice? Porque {0} nunca dejaste de intentar. La tormenta borró varias páginas; {1}, lograste reconstruir el mensaje completo. Hoy tus palabras son un puente hacia nuevos mundos». Idea principal: {2}.',
        fases: [
          {
            titulo: 'Sello 1 · Tilde diacrítica',
            enunciado: 'Completa el primer espacio con el pronombre personal correcto.',
            opciones: ['tú', 'tu'],
            correcta: 'tú',
            explicacion: '«Tú» con tilde señala a la persona (tú nunca dejaste de intentar).',
          },
          {
            titulo: 'Sello 2 · Conector lógico',
            enunciado: 'Hubo una tormenta difícil, pero igual reconstruiste el mensaje. ¿Qué conector marca ese contraste?',
            opciones: ['sin embargo', 'por lo tanto', 'porque'],
            correcta: 'sin embargo',
            explicacion: '«Sin embargo» expresa oposición entre la tormenta y el logro del viajero.',
          },
          {
            titulo: 'Sello 3 · Comprensión lectora',
            enunciado: '¿Qué quiere decir que «tus palabras son un puente hacia nuevos mundos»?',
            opciones: [
              'expresarnos y leer bien nos conecta con nuevos conocimientos y personas',
              'se pueden construir puentes reales hechos de hojas de cuaderno',
              'solo se puede viajar si se cruza un río de papel',
            ],
            correcta: 'expresarnos y leer bien nos conecta con nuevos conocimientos y personas',
            explicacion: 'Un puente une lugares; las palabras nos conectan con ideas y aprendizajes.',
          },
        ],
      },
    ],
    3: [
      {
        titulo: 'La brújula del archivo eterno',
        relato:
          'El Guardián elevó la llave de cristal. «Yo {0} que el camino de Letralia exige paciencia y curiosidad. Algunos creyeron que aprender ortografía era aburrido; {1}, descubriste que cada tilde cambia el sentido de una historia. Quien domina su idioma lleva una brújula para toda la vida». Conclusión: {2}.',
        fases: [
          {
            titulo: 'Sello 1 · Tilde diacrítica',
            enunciado: 'Elige la forma correcta del verbo saber para el primer espacio.',
            opciones: ['sé', 'se'],
            correcta: 'sé',
            explicacion: '«Sé» con tilde corresponde al verbo saber (yo sé).',
          },
          {
            titulo: 'Sello 2 · Conector lógico',
            enunciado: 'Algunos pensaban que era aburrido, pero tú descubriste su valor. ¿Qué conector une esas ideas opuestas?',
            opciones: ['no obstante', 'por consiguiente', 'además'],
            correcta: 'no obstante',
            explicacion: '«No obstante» funciona como «sin embargo» para contrastar dos ideas.',
          },
          {
            titulo: 'Sello 3 · Comprensión e inferencia',
            enunciado: '¿Qué representa «llevar una brújula para toda la vida»?',
            opciones: [
              'comprender y usar bien el lenguaje te orienta para aprender siempre',
              'el viajero debe cargar una brújula metálica en su mochila escolar',
              'el Archivo Astral solo abre cuando apunta hacia el norte',
            ],
            correcta: 'comprender y usar bien el lenguaje te orienta para aprender siempre',
            explicacion: 'La brújula simboliza la capacidad de orientarse y comprender cualquier texto.',
          },
        ],
      },
    ],
  };

  const elegido = elegirSinDuplicar(
    nivel,
    duelos,
    (r) => r.titulo,
    evitarTextos,
  );
  return {
    id: `ia-bos-${Date.now()}-${Math.floor(Math.random() * 90 + 10)}`,
    ...elegido,
  };
}

/**
 * Crea un reto nuevo de Jefe Final de Numérix con IA en la nube (guiado por RETOS_ARMILAR_BOSS)
 * con respaldo inmediato del generador adaptativo.
 */
export async function generarRetoBossNumerixConIA(
  nivel: NivelDificultadIA,
): Promise<{ reto: RetoArmilarBoss; modelo: string; proveedor: ProveedorTutorIA }> {
  const base = generarRetoBossNumerixAdaptativo(nivel);
  const ejemplosDefault = RETOS_ARMILAR_BOSS.slice(0, 3).map((r) => ({
    enunciado: r.enunciado,
    opciones: r.opciones,
    indiceCorrecto: r.indiceCorrecto,
  }));

  const prompt = JSON.stringify({
    tarea: 'Crear 1 reto matemático NUEVO para el Jefe Final Núcleo Armilar de Numérix (niños 10 a 12 años)',
    nivelDificultad: nivel,
    etiquetaNivel: ETIQUETAS_NIVEL_IA[nivel],
    ejemplosDefaultDelArchivo: ejemplosDefault,
    reglas: [
      'Guíate por los ejemplos default del archivo para calibrar la dificultad.',
      'En Nivel 1 usa operaciones directas; en Nivel 2 números un poco mayores; en Nivel 3 máximo 2 pasos sencillos (sin exagerar).',
      'Debe tener EXACTAMENTE 3 opciones y solo 1 correcta.',
    ],
    formatoJSON: {
      enunciado: 'string',
      opciones: ['op1', 'op2', 'op3'],
      indiceCorrecto: 0,
      pista: 'string',
      explicacion: 'string',
    },
  });

  const { texto, modeloUsado, proveedor } = await consultarOllamaCloud(
    prompt,
    'Eres Gemma 4 en la nube. Devuelve únicamente un objeto JSON válido con enunciado, opciones (exactamente 3), indiceCorrecto (0..2), pista y explicacion.',
  );

  const parsed = extraerJSONDeTexto<{
    enunciado?: string;
    opciones?: string[];
    indiceCorrecto?: number;
    pista?: string;
    explicacion?: string;
  }>(texto);

  if (parsed?.enunciado && Array.isArray(parsed.opciones) && parsed.opciones.length === 3) {
    const idx = Math.min(2, Math.max(0, Number(parsed.indiceCorrecto) || 0)) as 0 | 1 | 2;
    return {
      reto: {
        id: base.id,
        enunciado: parsed.enunciado,
        opciones: [
          String(parsed.opciones[0]),
          String(parsed.opciones[1]),
          String(parsed.opciones[2]),
        ],
        indiceCorrecto: idx,
        pista: parsed.pista || base.pista,
        explicacion: parsed.explicacion || base.explicacion,
      },
      modelo: modeloUsado,
      proveedor,
    };
  }

  return { reto: base, modelo: modeloUsado, proveedor };
}

/**
 * Precarga un paquete inicial de retos calibrados por la IA al entrar a Numérix o Letralia
 * para que desde la primera casilla y el jefe final salgan preguntas nuevas creadas por la IA.
 */
export async function prepararRetosTableroConIA(
  planeta: PlanetaTutorIA,
  nivel: NivelDificultadIA = 1,
  evitarTextos: string[] = [],
): Promise<{
  preguntasNumerix?: PreguntaGeneradaIA[];
  retosBossNumerix?: RetoArmilarBoss[];
  retosIntrusoLetralia?: RetoIntruso[];
  retosPuenteLetralia?: RetoPuenteSintactico[];
  retosTormentaLetralia?: RetoTormenta[];
  retosBossLetralia?: RetoGuardianBoss[];
  modelo: string;
  proveedor: ProveedorTutorIA;
}> {
  if (planeta === 'Letralia') {
    const vistos = [...evitarTextos];
    const intruso1 = generarRetoLetraliaAdaptativo(nivel, vistos);
    vistos.push(intruso1.palabras.join(' '));
    const intruso2 = generarRetoLetraliaAdaptativo(nivel, vistos);
    vistos.push(intruso2.palabras.join(' '));

    const puente1 = generarRetoPuenteLetraliaAdaptativo(nivel, vistos);
    vistos.push(puente1.ordenCorrecto.join(' '));
    const puente2 = generarRetoPuenteLetraliaAdaptativo(nivel, vistos);
    vistos.push(puente2.ordenCorrecto.join(' '));

    const tormenta1 = generarRetoTormentaLetraliaAdaptativo(nivel, vistos);
    vistos.push(tormenta1.consigna);
    const tormenta2 = generarRetoTormentaLetraliaAdaptativo(nivel, vistos);
    vistos.push(tormenta2.consigna);

    const boss1 = generarRetoBossLetraliaAdaptativo(nivel, vistos);

    return {
      retosIntrusoLetralia: [intruso1, intruso2],
      retosPuenteLetralia: [puente1, puente2],
      retosTormentaLetralia: [tormenta1, tormenta2],
      retosBossLetralia: [boss1],
      modelo: 'gemma-4-31b-it',
      proveedor: 'gemma4-adaptive-engine',
    };
  }

  // Numérix: 2 preguntas regulares + 3 retos de Jefe Final Núcleo Armilar (1 por cada anillo!)
  const { reto: bossIA, modelo, proveedor } = await generarRetoBossNumerixConIA(nivel);
  const boss2 = generarRetoBossNumerixAdaptativo(nivel);
  const boss3 = generarRetoBossNumerixAdaptativo(nivel);
  const preg1 = generarPreguntaAdaptativaPorNivel('Numérix', nivel);
  const preg2 = generarPreguntaAdaptativaPorNivel('Numérix', nivel);

  return {
    preguntasNumerix: [preg1, preg2],
    retosBossNumerix: [bossIA, boss2, boss3],
    modelo,
    proveedor,
  };
}
