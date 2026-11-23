/**
 * Banco pedagÃ³gico de Letralia / Verbum â€” Nivel 1 (Archivo Astral)
 * PÃºblico: niÃ±os de 10 a 12 aÃ±os (5.Âº y 6.Âº de primaria).
 *
 * Contiene las 4 mecÃ¡nicas del "Altar de DecodificaciÃ³n":
 *  1. Caza del Intruso            â†’ ortografÃ­a, acentuaciÃ³n y concordancia.
 *  2. Constructor de Puentes       â†’ sintaxis, sujeto/predicado y conectores.
 *  3. Tormenta de Meteoritos       â†’ agudas/graves/esdrÃºjulas, sinÃ³nimos/antÃ³nimos.
 *  4. GuardiÃ¡n del VÃ³rtice (Boss)  â†’ tilde diacrÃ­tica, conectores e inferencia.
 */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Tipos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export type CategoriaIntruso = 'ortografia' | 'acentuacion' | 'concordancia';

export interface RetoIntruso {
  id: string;
  categoria: CategoriaIntruso;
  /** OraciÃ³n dividida en bloques (tablillas). */
  palabras: string[];
  /** PosiciÃ³n de la palabra con error dentro de `palabras`. */
  indiceIntruso: number;
  /** Tres piezas de reemplazo (se barajan al mostrarse). */
  opciones: [string, string, string];
  /** Pieza correcta (debe estar incluida en `opciones`). */
  correcta: string;
  /** Pista breve para el botÃ³n AYUDA. */
  pista: string;
  /** ExplicaciÃ³n formativa que aparece al resolver. */
  explicacion: string;
}

export type EnfoquePuente = 'sujeto-predicado' | 'conectores' | 'coherencia';

export interface RetoPuenteSintactico {
  id: string;
  enfoque: EnfoquePuente;
  /** Tablillas en el orden correcto (4 a 6). */
  ordenCorrecto: string[];
  /** Otros Ã³rdenes tambiÃ©n vÃ¡lidos y coherentes. */
  ordenesAlternativas?: string[][];
  pista: string;
  explicacion: string;
}

export type TipoTormenta = 'agudas' | 'graves' | 'esdrujulas' | 'sinonimos' | 'antonimos';

export interface RetoTormenta {
  id: string;
  tipo: TipoTormenta;
  /** Consigna que aparece arriba del altar. */
  consigna: string;
  /** Seis tablillas flotantes. */
  palabras: string[];
  /** Las tres correctas (incluidas en `palabras`). */
  correctas: [string, string, string];
  /** Segundos disponibles. */
  segundos: number;
  pista: string;
  explicacion: string;
}

export interface FaseGuardian {
  titulo: string;
  /** Consigna de la fase. */
  enunciado: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
}

export interface RetoGuardianBoss {
  id: string;
  titulo: string;
  /**
   * Relato con tres ranuras selladas: {0}, {1} y {2}.
   * {0} = tilde diacrÃ­tica Â· {1} = conector lÃ³gico Â· {2} = conclusiÃ³n/moraleja.
   */
  relato: string;
  fases: [FaseGuardian, FaseGuardian, FaseGuardian];
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MecÃ¡nica 1 Â· Caza del Intruso â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const RETOS_INTRUSO: RetoIntruso[] = [
  {
    id: 'int-01',
    categoria: 'ortografia',
    palabras: ['El', 'explorador', 'hayÃ³', 'un', 'antiguo', 'cÃ³dice.'],
    indiceIntruso: 2,
    opciones: ['hallÃ³', 'allÃ³', 'hayo'],
    correcta: 'hallÃ³',
    pista: 'Piensa en el verbo Â«hallarÂ», que significa encontrar.',
    explicacion:
      'Â«HallÃ³Â» viene del verbo hallar (encontrar) y se escribe con h y ll. Â«HayaÂ», con y, pertenece al verbo haber.',
  },
  {
    id: 'int-02',
    categoria: 'ortografia',
    palabras: ['MaÃ±ana', 'iremos', 'a', 'la', 'viblioteca', 'estelar.'],
    indiceIntruso: 4,
    opciones: ['biblioteca', 'vivlioteca', 'bibloteca'],
    correcta: 'biblioteca',
    pista: 'Las palabras que empiezan por Â«biblio-Â» tienen que ver con los libros.',
    explicacion:
      'Las palabras que comienzan con Â«biblio-Â» (libro) se escriben con b: biblioteca, bibliografÃ­a, bibliotecario.',
  },
  {
    id: 'int-03',
    categoria: 'ortografia',
    palabras: ['La', 'nave', 'aterrizÃ³', 'sobre', 'una', 'superfisie', 'rocosa.'],
    indiceIntruso: 5,
    opciones: ['superficie', 'superfizie', 'superfice'],
    correcta: 'superficie',
    pista: 'FÃ­jate en cÃ³mo termina: Â«-icieÂ».',
    explicacion:
      'Las palabras terminadas en Â«-icieÂ» se escriben con c: superficie, planicie, calvicie.',
  },
  {
    id: 'int-04',
    categoria: 'acentuacion',
    palabras: ['Mi', 'hermano', 'y', 'yo', 'jugÃ¡bamos', 'en', 'el', 'jardin.'],
    indiceIntruso: 7,
    opciones: ['jardÃ­n', 'jÃ¡rdin', 'jardÃ­m'],
    correcta: 'jardÃ­n',
    pista: 'Pronuncia la palabra en voz alta: Â¿dÃ³nde suena mÃ¡s fuerte?',
    explicacion:
      'Â«JardÃ­nÂ» es aguda (la fuerza va en la Ãºltima sÃ­laba) y termina en n. Las agudas terminadas en n, s o vocal llevan tilde.',
  },
  {
    id: 'int-05',
    categoria: 'concordancia',
    palabras: ['Las', 'estrellas', 'brillaba', 'sobre', 'el', 'ocÃ©ano.'],
    indiceIntruso: 2,
    opciones: ['brillaban', 'brillabas', 'brillamos'],
    correcta: 'brillaban',
    pista: 'Â¿CuÃ¡ntas estrellas hay? Â¿Una o muchas?',
    explicacion:
      'El sujeto Â«las estrellasÂ» estÃ¡ en plural, asÃ­ que el verbo tambiÃ©n debe ir en plural: brillaban.',
  },
  {
    id: 'int-06',
    categoria: 'ortografia',
    palabras: ['El', 'astronauta', 'recojiÃ³', 'muestras', 'de', 'polvo', 'lunar.'],
    indiceIntruso: 2,
    opciones: ['recogiÃ³', 'recohiÃ³', 'recoxiÃ³'],
    correcta: 'recogiÃ³',
    pista: 'El verbo original es Â«recogerÂ».',
    explicacion:
      'Los verbos terminados en Â«-gerÂ» y Â«-girÂ» (recoger, elegir) conservan la g delante de e, i: recogiÃ³, eligiÃ³.',
  },
  {
    id: 'int-07',
    categoria: 'acentuacion',
    palabras: ['Â¿Donde', 'guardaste', 'el', 'mapa', 'estelar?'],
    indiceIntruso: 0,
    opciones: ['Â¿DÃ³nde', 'Â¿DondÃ©', 'Â¿Dhonde'],
    correcta: 'Â¿DÃ³nde',
    pista: 'Es una pregunta. Â¿QuÃ© pasa con las palabras que preguntan?',
    explicacion:
      'Las palabras interrogativas y exclamativas (quÃ©, cÃ³mo, dÃ³nde, cuÃ¡ndo, quiÃ©n) llevan tilde: Â¿DÃ³nde?',
  },
  {
    id: 'int-08',
    categoria: 'ortografia',
    palabras: ['El', 'cohete', 'despegÃ³', 'a', 'gran', 'belocidad.'],
    indiceIntruso: 5,
    opciones: ['velocidad', 'belosidad', 'velozidad'],
    correcta: 'velocidad',
    pista: 'Busca una palabra de la misma familia: algo que va muy rÃ¡pido es...',
    explicacion:
      'Â«VelocidadÂ» se escribe con v, igual que Â«velozÂ», que es de su misma familia de palabras.',
  },
  {
    id: 'int-09',
    categoria: 'ortografia',
    palabras: ['Un', 'cometa', 'atravezÃ³', 'el', 'cielo', 'nocturno.'],
    indiceIntruso: 2,
    opciones: ['atravesÃ³', 'atrabesÃ³', 'atravezo'],
    correcta: 'atravesÃ³',
    pista: 'Viene de la palabra Â«travÃ©sÂ».',
    explicacion:
      'Â«AtravesarÂ» viene de Â«travÃ©sÂ» y se escribe con s. Por eso decimos: atravesÃ³, atravesamos.',
  },
  {
    id: 'int-10',
    categoria: 'ortografia',
    palabras: ['Los', 'niÃ±os', 'estaban', 'muy', 'felises', 'con', 'el', 'viaje.'],
    indiceIntruso: 4,
    opciones: ['felices', 'felizes', 'felÃ­ces'],
    correcta: 'felices',
    pista: 'El singular es Â«felizÂ». Â¿QuÃ© le pasa a la z en el plural?',
    explicacion:
      'Cuando una palabra termina en z, al formar el plural la z cambia a c: feliz â†’ felices, lÃ¡piz â†’ lÃ¡pices.',
  },
  {
    id: 'int-11',
    categoria: 'concordancia',
    palabras: ['Nosotros', 'llegÃ³', 'temprano', 'al', 'planetario.'],
    indiceIntruso: 1,
    opciones: ['llegamos', 'llegaron', 'llegaste'],
    correcta: 'llegamos',
    pista: 'Â¿QuiÃ©nes llegaron? Mira el sujeto de la oraciÃ³n.',
    explicacion:
      'Con el sujeto Â«nosotrosÂ», el verbo debe ir en primera persona del plural: nosotros llegamos.',
  },
  {
    id: 'int-12',
    categoria: 'ortografia',
    palabras: ['El', 'guardiÃ¡n', 'nos', 'saludÃ³', 'con', 'un', 'jesto', 'amable.'],
    indiceIntruso: 6,
    opciones: ['gesto', 'jestto', 'guesto'],
    correcta: 'gesto',
    pista: 'Piensa en Â«gesticularÂ», mover las manos al hablar.',
    explicacion:
      'Â«GestoÂ» se escribe con g, como gesticular. Antes de e, la g suena igual que la j.',
  },
  {
    id: 'int-13',
    categoria: 'ortografia',
    palabras: ['La', 'lechuza', 'caza', 'de', 'noche', 'en', 'silensio.'],
    indiceIntruso: 6,
    opciones: ['silencio', 'cilencio', 'silenzio'],
    correcta: 'silencio',
    pista: 'FÃ­jate en la terminaciÃ³n Â«-encioÂ».',
    explicacion:
      'Las palabras terminadas en Â«-encioÂ» y Â«-enciaÂ» se escriben con c: silencio, paciencia, ciencia.',
  },
  {
    id: 'int-14',
    categoria: 'acentuacion',
    palabras: ['El', 'arbol', 'mÃ¡s', 'alto', 'tiene', 'mil', 'aÃ±os.'],
    indiceIntruso: 1,
    opciones: ['Ã¡rbol', 'arbÃ³l', 'Ã¡rbÃ³l'],
    correcta: 'Ã¡rbol',
    pista: 'Es una palabra grave (llana). Â¿En quÃ© letra termina?',
    explicacion:
      'Â«ÃrbolÂ» es grave y termina en l (no en n, s ni vocal); por eso lleva tilde en la sÃ­laba Ã¡r-.',
  },
  {
    id: 'int-15',
    categoria: 'ortografia',
    palabras: ['Hoy', 'hechamos', 'las', 'cartas', 'al', 'buzÃ³n', 'espacial.'],
    indiceIntruso: 1,
    opciones: ['echamos', 'echÃ¡mos', 'hecamos'],
    correcta: 'echamos',
    pista: 'Â¿Viene del verbo Â«hacerÂ» o del verbo Â«echarÂ»?',
    explicacion:
      'Â«EcharÂ» (lanzar, meter) se escribe sin h: echamos. Â«HechoÂ», con h, viene del verbo hacer.',
  },
  {
    id: 'int-16',
    categoria: 'concordancia',
    palabras: ['La', 'nave', 'plateado', 'llegÃ³', 'a', 'Letralia.'],
    indiceIntruso: 2,
    opciones: ['plateada', 'plateados', 'plateadas'],
    correcta: 'plateada',
    pista: 'Â«NaveÂ» es femenino y singular. El adjetivo debe acompaÃ±arla.',
    explicacion:
      'El adjetivo concuerda en gÃ©nero y nÃºmero con el sustantivo: Â«la naveÂ» (femenino, singular) â†’ plateada.',
  },
  // === IA_RETOS_LETRALIA_START ===
  {
    id: "ia-int-1",
    categoria: "concordancia",
    palabras: ["Unos","planetas","lejana","giran","alrededor","del","Sol."],
    indiceIntruso: 2,
    opciones: ["lejanos","lejano","lejanas"],
    correcta: "lejanos",
    pista: "«Planetas» es masculino y plural.",
    explicacion: "El adjetivo debe concordar en género y número: «planetas lejanos».",
  },
  // === IA_RETOS_LETRALIA_END ===
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MecÃ¡nica 2 Â· Constructor de Puentes SintÃ¡cticos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const RETOS_PUENTE: RetoPuenteSintactico[] = [
  {
    id: 'pue-01',
    enfoque: 'sujeto-predicado',
    ordenCorrecto: ['El', 'archivo', 'mÃ¡gico', 'de Letralia', 'guarda', 'secretos'],
    ordenesAlternativas: [['El', 'mÃ¡gico', 'archivo', 'de Letralia', 'guarda', 'secretos']],
    pista: 'Empieza por la palabra con mayÃºscula y piensa: Â¿quiÃ©n guarda secretos?',
    explicacion:
      'Sujeto: Â«El archivo mÃ¡gico de LetraliaÂ» (de quiÃ©n se habla). Predicado: Â«guarda secretosÂ» (lo que hace).',
  },
  {
    id: 'pue-02',
    enfoque: 'sujeto-predicado',
    ordenCorrecto: ['El espacio', 'estÃ¡', 'lleno', 'de estrellas', 'brillantes'],
    pista: 'Primero el sujeto (Â¿quÃ© estÃ¡ lleno?) y despuÃ©s lo que se dice de Ã©l.',
    explicacion:
      'El sujeto es Â«El espacioÂ». El predicado Â«estÃ¡ lleno de estrellas brillantesÂ» describe cÃ³mo es.',
  },
  {
    id: 'pue-03',
    enfoque: 'conectores',
    ordenCorrecto: ['EstudiÃ©', 'mucho;', 'por lo tanto,', 'aprobÃ©', 'el examen'],
    pista: 'Â«Por lo tantoÂ» anuncia una consecuencia. Â¿QuÃ© pasÃ³ gracias a estudiar?',
    explicacion:
      'Â«Por lo tantoÂ» une una causa (estudiÃ© mucho) con su consecuencia (aprobÃ© el examen).',
  },
  {
    id: 'pue-04',
    enfoque: 'conectores',
    ordenCorrecto: ['LlovÃ­a', 'con fuerza;', 'sin embargo,', 'salimos', 'a explorar'],
    pista: 'Â«Sin embargoÂ» une dos ideas que parecen opuestas.',
    explicacion:
      'Â«Sin embargoÂ» presenta una idea contraria a lo esperado: llovÃ­a, pero aun asÃ­ salimos a explorar.',
  },
  {
    id: 'pue-05',
    enfoque: 'conectores',
    ordenCorrecto: ['La viajera', 'lee cuentos', 'y,', 'ademÃ¡s,', 'escribe', 'poemas'],
    ordenesAlternativas: [['La viajera', 'escribe', 'poemas', 'y,', 'ademÃ¡s,', 'lee cuentos']],
    pista: 'Â«AdemÃ¡sÂ» suma una idea nueva a otra que ya dijiste.',
    explicacion:
      'Â«AdemÃ¡sÂ» es un conector de adiciÃ³n: agrega una acciÃ³n mÃ¡s (escribir poemas) a la primera (leer cuentos).',
  },
  {
    id: 'pue-06',
    enfoque: 'coherencia',
    ordenCorrecto: ['Los planetas', 'giran', 'sin parar', 'alrededor', 'del Sol'],
    ordenesAlternativas: [['Los planetas', 'giran', 'alrededor', 'del Sol', 'sin parar']],
    pista: 'Â¿QuÃ© hacen los planetas? Â¿Alrededor de quÃ©?',
    explicacion:
      'Sujeto: Â«Los planetasÂ». Verbo: Â«giranÂ». Â«Alrededor del SolÂ» y Â«sin pararÂ» indican dÃ³nde y cÃ³mo giran.',
  },
  {
    id: 'pue-07',
    enfoque: 'sujeto-predicado',
    ordenCorrecto: ['Mi abuela', 'me regalÃ³', 'un libro', 'de aventuras', 'espaciales'],
    pista: 'Â¿QuiÃ©n hizo el regalo? Empieza por ahÃ­.',
    explicacion:
      'El sujeto Â«Mi abuelaÂ» realiza la acciÃ³n. Â«Me regalÃ³ un libro de aventuras espacialesÂ» es el predicado.',
  },
  {
    id: 'pue-08',
    enfoque: 'conectores',
    ordenCorrecto: ['No encontraba', 'la llave;', 'por eso,', 'pedÃ­ ayuda', 'al guardiÃ¡n'],
    pista: 'Â«Por esoÂ» introduce lo que hiciste a causa de un problema.',
    explicacion:
      'Primero estÃ¡ el problema (no encontraba la llave) y Â«por esoÂ» introduce la consecuencia (pedÃ­ ayuda).',
  },
  {
    id: 'pue-09',
    enfoque: 'coherencia',
    ordenCorrecto: ['Aunque', 'estaba cansado,', 'el explorador', 'siguiÃ³', 'caminando'],
    pista: 'Â«AunqueÂ» va al inicio y presenta una dificultad.',
    explicacion:
      'Â«AunqueÂ» introduce un obstÃ¡culo (estaba cansado) que no impide la acciÃ³n principal (siguiÃ³ caminando).',
  },
  {
    id: 'pue-10',
    enfoque: 'coherencia',
    ordenCorrecto: ['Las ballenas', 'cantan', 'bajo el mar', 'para comunicarse'],
    ordenesAlternativas: [['Las ballenas', 'cantan', 'para comunicarse', 'bajo el mar']],
    pista: 'Â¿QuiÃ©nes cantan? Â¿DÃ³nde? Â¿Para quÃ©?',
    explicacion:
      'La oraciÃ³n responde: Â¿quiÃ©n? (las ballenas), Â¿quÃ© hacen? (cantan), Â¿dÃ³nde? (bajo el mar) y Â¿para quÃ©? (para comunicarse).',
  },
  // === IA_PUENTES_LETRALIA_START ===
  {
    id: "ia-pue-1",
    enfoque: "sujeto-predicado",
    ordenCorrecto: ["La brújula","astral","guía","a los viajeros","por el cielo"],
    pista: "Empieza por el sujeto con mayúscula: ¿qué guía a los viajeros?",
    explicacion: "Sujeto: «La brújula astral». Predicado: «guía a los viajeros por el cielo».",
  },
  // === IA_PUENTES_LETRALIA_END ===
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MecÃ¡nica 3 Â· Tormenta de Meteoritos AcÃºsticos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const RETOS_TORMENTA: RetoTormenta[] = [
  {
    id: 'tor-01',
    tipo: 'esdrujulas',
    consigna: 'Â¡Activa en el Altar las 3 palabras ESDRÃšJULAS antes de que pase la tormenta!',
    palabras: ['brÃºjula', 'camino', 'cÃ¡ntico', 'reloj', 'pÃ¡jaro', 'papel'],
    correctas: ['brÃºjula', 'cÃ¡ntico', 'pÃ¡jaro'],
    segundos: 18,
    pista: 'Las esdrÃºjulas suenan fuerte en la antepenÃºltima sÃ­laba y SIEMPRE llevan tilde.',
    explicacion:
      'BrÃº-ju-la, cÃ¡n-ti-co y pÃ¡-ja-ro son esdrÃºjulas: la fuerza estÃ¡ en la antepenÃºltima sÃ­laba y siempre llevan tilde.',
  },
  {
    id: 'tor-02',
    tipo: 'agudas',
    consigna: 'Â¡Atrapa las 3 palabras AGUDAS antes de que pase la tormenta!',
    palabras: ['canciÃ³n', 'mesa', 'reloj', 'Ã¡rbol', 'cafÃ©', 'libro'],
    correctas: ['canciÃ³n', 'reloj', 'cafÃ©'],
    segundos: 18,
    pista: 'En las agudas, la fuerza de la voz cae en la ÃšLTIMA sÃ­laba.',
    explicacion:
      'Can-CIÃ“N, re-LOJ y ca-FÃ‰ son agudas. Â«RelojÂ» no lleva tilde porque termina en j (no en n, s o vocal).',
  },
  {
    id: 'tor-03',
    tipo: 'graves',
    consigna: 'Â¡Encaja las 3 palabras GRAVES (llanas) en el escudo del Altar!',
    palabras: ['lÃ¡piz', 'sofÃ¡', 'fÃ¡cil', 'murciÃ©lago', 'cama', 'balÃ³n'],
    correctas: ['lÃ¡piz', 'fÃ¡cil', 'cama'],
    segundos: 18,
    pista: 'En las graves, la fuerza cae en la PENÃšLTIMA sÃ­laba.',
    explicacion:
      'LÃ-piz, FÃ-cil y CA-ma son graves. Â«CamaÂ» no lleva tilde porque las graves terminadas en vocal no la llevan.',
  },
  {
    id: 'tor-04',
    tipo: 'sinonimos',
    consigna: 'Â¡Encuentra 3 SINÃ“NIMOS de Â«alegreÂ» antes de que pase la tormenta!',
    palabras: ['contento', 'triste', 'feliz', 'enojado', 'dichoso', 'cansado'],
    correctas: ['contento', 'feliz', 'dichoso'],
    segundos: 18,
    pista: 'Un sinÃ³nimo significa lo MISMO o casi lo mismo.',
    explicacion:
      'Contento, feliz y dichoso significan casi lo mismo que Â«alegreÂ»: son sinÃ³nimos.',
  },
  {
    id: 'tor-05',
    tipo: 'antonimos',
    consigna: 'Â¡Atrapa 3 ANTÃ“NIMOS de Â«valienteÂ» antes de que pase la tormenta!',
    palabras: ['miedoso', 'audaz', 'cobarde', 'temeroso', 'heroico', 'osado'],
    correctas: ['miedoso', 'cobarde', 'temeroso'],
    segundos: 18,
    pista: 'Un antÃ³nimo significa lo CONTRARIO.',
    explicacion:
      'Miedoso, cobarde y temeroso expresan lo contrario de Â«valienteÂ». Audaz, heroico y osado son sinÃ³nimos.',
  },
  {
    id: 'tor-06',
    tipo: 'esdrujulas',
    consigna: 'Â¡Rescata las 3 palabras ESDRÃšJULAS de la lluvia de meteoritos!',
    palabras: ['mÃºsica', 'planeta', 'cÃ¡mara', 'nÃºmero', 'estrella', 'nave'],
    correctas: ['mÃºsica', 'cÃ¡mara', 'nÃºmero'],
    segundos: 18,
    pista: 'Busca las que tienen tilde en la antepenÃºltima sÃ­laba.',
    explicacion:
      'MÃš-si-ca, CÃ-ma-ra y NÃš-me-ro son esdrÃºjulas. Planeta, estrella y nave son graves.',
  },
  {
    id: 'tor-07',
    tipo: 'sinonimos',
    consigna: 'Â¡Encuentra 3 SINÃ“NIMOS de Â«rÃ¡pidoÂ» antes de que pase la tormenta!',
    palabras: ['veloz', 'lento', 'ligero', 'pesado', 'raudo', 'tranquilo'],
    correctas: ['veloz', 'ligero', 'raudo'],
    segundos: 18,
    pista: 'Â¿QuÃ© palabras describen algo que se mueve muy deprisa?',
    explicacion:
      'Veloz, ligero y raudo significan casi lo mismo que Â«rÃ¡pidoÂ». Lento y pesado son sus contrarios.',
  },
  {
    id: 'tor-08',
    tipo: 'agudas',
    consigna: 'Â¡Activa las 3 palabras AGUDAS en el escudo del Altar!',
    palabras: ['compÃ¡s', 'lunes', 'jabÃ³n', 'crÃ¡ter', 'sillÃ³n', 'Marte'],
    correctas: ['compÃ¡s', 'jabÃ³n', 'sillÃ³n'],
    segundos: 18,
    pista: 'Lee cada palabra en voz alta y fÃ­jate si la fuerza cae al final.',
    explicacion:
      'Com-PÃS, ja-BÃ“N y si-LLÃ“N son agudas terminadas en s o n, por eso llevan tilde.',
  },
  {
    id: 'tor-09',
    tipo: 'antonimos',
    consigna: 'Â¡Atrapa 3 ANTÃ“NIMOS de Â«oscuroÂ» antes de que pase la tormenta!',
    palabras: ['claro', 'sombrÃ­o', 'luminoso', 'negro', 'brillante', 'tenebroso'],
    correctas: ['claro', 'luminoso', 'brillante'],
    segundos: 18,
    pista: 'Busca palabras relacionadas con la luz.',
    explicacion:
      'Claro, luminoso y brillante son lo contrario de Â«oscuroÂ». SombrÃ­o y tenebroso son sus sinÃ³nimos.',
  },
  // === IA_TORMENTA_LETRALIA_START ===
  {
    id: "ia-tor-1",
    tipo: "esdrujulas",
    consigna: "¡Atrapa las 3 palabras ESDRÚJULAS antes de que pase la tormenta!",
    palabras: ["sábado","nube","lámpara","sol","médico","camino"],
    correctas: ["sábado","lámpara","médico"],
    segundos: 18,
    pista: "Todas las esdrújulas llevan tilde en la antepenúltima sílaba.",
    explicacion: "SÁ-ba-do, LÁM-pa-ra y MÉ-di-co son esdrújulas.",
  },
  // === IA_TORMENTA_LETRALIA_END ===
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MecÃ¡nica 4 Â· El GuardiÃ¡n del VÃ³rtice Gramatical â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const RETOS_GUARDIAN: RetoGuardianBoss[] = [
  {
    id: 'bos-01',
    titulo: 'Las semillas de estrellas',
    relato:
      'Â«Viajero, {0} has demostrado valor al llegar hasta aquÃ­Â», dijo el GuardiÃ¡n con voz de trueno suave. Â«Hace mucho, los habitantes de Letralia dejaron de leer; {1}, las palabras se apagaron una a una como velas al viento. Pero tÃº las has despertado. Recuerda siempre: las palabras son semillas de estrellasÂ». Moraleja: {2}.',
    fases: [
      {
        titulo: 'Sello 1 Â· Tilde diacrÃ­tica',
        enunciado: 'Elige la pieza correcta para la primera ranura del cÃ³dice.',
        opciones: ['tÃº', 'tu'],
        correcta: 'tÃº',
        explicacion:
          'Â«TÃºÂ» con tilde es un pronombre: seÃ±ala a la persona (tÃº has demostrado). Â«TuÂ» sin tilde indica pertenencia: tu mochila.',
      },
      {
        titulo: 'Sello 2 Â· Conector lÃ³gico',
        enunciado: 'Dejar de leer provocÃ³ que las palabras se apagaran. Â¿QuÃ© conector une la causa con su consecuencia?',
        opciones: ['por eso', 'sin embargo', 'aunque'],
        correcta: 'por eso',
        explicacion:
          'Â«Por esoÂ» introduce una consecuencia: como dejaron de leer, las palabras se apagaron.',
      },
      {
        titulo: 'Sello 3 Â· ComprensiÃ³n e inferencia',
        enunciado: 'Â¿QuÃ© quiere decir el GuardiÃ¡n con Â«las palabras son semillas de estrellasÂ»?',
        opciones: [
          'al cuidar las palabras, crecen las ideas y el conocimiento',
          'las estrellas nacen de semillas de plantas',
          'las palabras solo sirven para hablar del cielo',
        ],
        correcta: 'al cuidar las palabras, crecen las ideas y el conocimiento',
        explicacion:
          'Es una metÃ¡fora: asÃ­ como una semilla crece, las palabras que leemos y cuidamos hacen crecer nuestras ideas.',
      },
    ],
  },
  {
    id: 'bos-02',
    titulo: 'El faro que nunca duerme',
    relato:
      'El GuardiÃ¡n cerrÃ³ el gran libro y sonriÃ³. Â«Yo no {0} quiÃ©n escribiÃ³ este cÃ³dice, pero estoy seguro de que cada lector le aÃ±ade un poco de luz. Has resuelto todos los acertijos del camino; {1}, mereces la llave del Archivo. Desde hoy, el Archivo Astral serÃ¡ un faro que nunca dormirÃ¡Â». ConclusiÃ³n: {2}.',
    fases: [
      {
        titulo: 'Sello 1 Â· Tilde diacrÃ­tica',
        enunciado: 'Elige la pieza correcta para la primera ranura del cÃ³dice.',
        opciones: ['sÃ©', 'se'],
        correcta: 'sÃ©',
        explicacion:
          'Â«SÃ©Â» con tilde es del verbo saber (yo no sÃ©). Â«SeÂ» sin tilde es un pronombre: el libro se cerrÃ³.',
      },
      {
        titulo: 'Sello 2 Â· Conector lÃ³gico',
        enunciado: 'Resolver los acertijos tiene como resultado ganar la llave. Â¿QuÃ© conector lo expresa?',
        opciones: ['por lo tanto', 'sin embargo', 'aunque'],
        correcta: 'por lo tanto',
        explicacion:
          'Â«Por lo tantoÂ» presenta una consecuencia lÃ³gica: resolviste los acertijos y, como resultado, mereces la llave.',
      },
      {
        titulo: 'Sello 3 Â· ComprensiÃ³n e inferencia',
        enunciado: 'Â¿QuÃ© significa que Â«el Archivo Astral serÃ¡ un faro que nunca dormirÃ¡Â»?',
        opciones: [
          'seguirÃ¡ guiando e iluminando a quienes quieran aprender',
          'el Archivo se convertirÃ¡ en una torre junto al mar',
          'el GuardiÃ¡n ya no podrÃ¡ dormir nunca',
        ],
        correcta: 'seguirÃ¡ guiando e iluminando a quienes quieran aprender',
        explicacion:
          'Un faro guÃ­a a los barcos en la oscuridad. El Archivo, como un faro, guiarÃ¡ siempre a los lectores con su conocimiento.',
      },
    ],
  },
  {
    id: 'bos-03',
    titulo: 'El rÃ­o de tinta',
    relato:
      'Cuando el viajero tocÃ³ la puerta de cristal, el GuardiÃ¡n abriÃ³ los ojos. Â«Un sabio antiguo escribiÃ³ este cÃ³dice, y {0} lo guardÃ³ aquÃ­ para ti. Muchos quisieron rendirse en el camino; {1}, tÃº seguiste adelante. Tus pasos dejaron un rÃ­o de tinta que otros podrÃ¡n seguirÂ». Significado: {2}.',
    fases: [
      {
        titulo: 'Sello 1 Â· Tilde diacrÃ­tica',
        enunciado: 'Elige la pieza correcta para la primera ranura del cÃ³dice.',
        opciones: ['Ã©l', 'el'],
        correcta: 'Ã©l',
        explicacion:
          'Â«Ã‰lÂ» con tilde es un pronombre que reemplaza a una persona (el sabio). Â«ElÂ» sin tilde es un artÃ­culo: el libro.',
      },
      {
        titulo: 'Sello 2 Â· Conector lÃ³gico',
        enunciado: 'Otros se rindieron, pero el viajero no. Â¿QuÃ© conector muestra esa oposiciÃ³n?',
        opciones: ['sin embargo', 'por eso', 'ademÃ¡s'],
        correcta: 'sin embargo',
        explicacion:
          'Â«Sin embargoÂ» une dos ideas opuestas: muchos se rindieron, pero el viajero siguiÃ³ adelante.',
      },
      {
        titulo: 'Sello 3 Â· ComprensiÃ³n e inferencia',
        enunciado: 'Â¿QuÃ© significa Â«tus pasos dejaron un rÃ­o de tinta que otros podrÃ¡n seguirÂ»?',
        opciones: [
          'su esfuerzo y lo aprendido servirÃ¡n de guÃ­a a otros',
          'el viajero derramÃ³ tinta por todo el camino',
          'en Letralia existe un rÃ­o de color azul',
        ],
        correcta: 'su esfuerzo y lo aprendido servirÃ¡n de guÃ­a a otros',
        explicacion:
          'Es lenguaje figurado: el Â«rÃ­o de tintaÂ» representa el camino de aprendizaje que el viajero deja como ejemplo.',
      },
    ],
  },
  // === IA_BOSS_LETRALIA_START ===
  {
    id: "ia-bos-1",
    titulo: "La constelación de los cuentos",
    relato: "El Guardián encendió una linterna azul. «Cada historia que lees vive dentro de {0}, joven explorador», susurró. «Muchos pasaron con prisa sin leer los mapas; {1}, no encontraron la puerta secreta. Quien lee con atención abre puertas invisibles». Enseñanza: {2}.",
    fases: [
          {
                "titulo": "Sello 1 · Tilde diacrítica",
                "enunciado": "Elige la palabra correcta para completar el primer espacio.",
                "opciones": [
                      "ti",
                      "tí"
                ],
                "correcta": "ti",
                "explicacion": "El pronombre «ti» nunca lleva tilde porque no existe otra palabra igual con distinto significado."
          },
          {
                "titulo": "Sello 2 · Conector lógico",
                "enunciado": "Pasar con prisa causó que no encontraran la puerta. ¿Qué conector une esa causa con su consecuencia?",
                "opciones": [
                      "por eso",
                      "aunque",
                      "además"
                ],
                "correcta": "por eso",
                "explicacion": "«Por eso» presenta la consecuencia directa de pasar sin leer los mapas."
          },
          {
                "titulo": "Sello 3 · Comprensión lectora",
                "enunciado": "¿Qué significa que «quien lee con atención abre puertas invisibles»?",
                "opciones": [
                      "leer con cuidado nos permite descubrir ideas y oportunidades nuevas",
                      "los libros tienen llaves escondidas dentro del papel",
                      "las puertas del santuario no se pueden ver nunca"
                ],
                "correcta": "leer con cuidado nos permite descubrir ideas y oportunidades nuevas",
                "explicacion": "Es una metáfora: leer atentamente nos abre caminos de aprendizaje."
          }
    ],
  },
  // === IA_BOSS_LETRALIA_END ===
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SÃ­labas Clave â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/** Cada partida elige una palabra de 4 sÃ­labas que forma la llave del GuardiÃ¡n. */
export const PALABRAS_LLAVE: { palabra: string; silabas: [string, string, string, string] }[] = [
  { palabra: 'ESDRÃšJULA', silabas: ['ES', 'DRÃš', 'JU', 'LA'] },
  { palabra: 'METÃFORA', silabas: ['ME', 'TÃ', 'FO', 'RA'] },
  { palabra: 'GRAMÃTICA', silabas: ['GRA', 'MÃ', 'TI', 'CA'] },
  { palabra: 'BIBLIOTECA', silabas: ['BI', 'BLIO', 'TE', 'CA'] },
  { palabra: 'ORTOGRAFÃA', silabas: ['OR', 'TO', 'GRA', 'FÃA'] },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Utilidades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function barajar<T>(arr: readonly T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Selector sin repeticiÃ³n: devuelve un elemento al azar que no se haya usado
 * todavÃ­a (filtrado opcional). Cuando se agotan, reinicia el ciclo.
 */
export function elegirSinRepetir<T extends { id: string }>(
  banco: readonly T[],
  usados: Set<string>,
  filtro?: (r: T) => boolean,
): T {
  const candidatos = banco.filter((r) => (!filtro || filtro(r)) && !usados.has(r.id));
  let pool = candidatos;
  if (pool.length === 0) {
    banco.forEach((r) => {
      if (!filtro || filtro(r)) usados.delete(r.id);
    });
    pool = banco.filter((r) => !filtro || filtro(r));
    if (pool.length === 0) pool = [...banco];
  }
  const elegido = pool[Math.floor(Math.random() * pool.length)];
  usados.add(elegido.id);
  return elegido;
}

/** Comprueba si un orden de tablillas forma una oraciÃ³n vÃ¡lida. */
export function validarPuente(reto: RetoPuenteSintactico, orden: string[]): boolean {
  const unir = (a: string[]) => a.join(' ').replace(/\s+/g, ' ').trim();
  const intento = unir(orden);
  return [reto.ordenCorrecto, ...(reto.ordenesAlternativas ?? [])].some((o) => unir(o) === intento);
}


