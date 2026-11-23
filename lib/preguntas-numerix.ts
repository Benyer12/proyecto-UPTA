export interface PreguntaMatematica {
  id: number;
  enunciado: string;
  opciones: string[];
  indiceRespuestaCorrecta: number;
  explicacionBreve: string;
  pista?: string;
  operador?: '+' | '−' | '×' | '÷';
}

export interface RetoArmilarBoss {
  id: string;
  enunciado: string;
  opciones: [string, string, string];
  indiceCorrecto: 0 | 1 | 2;
  pista: string;
  explicacion: string;
}

export const PREGUNTAS_NUMERIX: PreguntaMatematica[] = [
  // ── Sumas y Restas sencillas ──
  {
    id: 1,
    operador: '+',
    enunciado: '¿Cuánto es 48 + 37?',
    opciones: ['85', '75', '84', '95'],
    indiceRespuestaCorrecta: 0,
    pista: 'Suma primero las decenas (40 + 30) y luego las unidades (8 + 7).',
    explicacionBreve: 'Primero sumamos 40 + 30 = 70. Luego 8 + 7 = 15. Por último, 70 + 15 = 85.',
  },
  {
    id: 2,
    operador: '−',
    enunciado: 'Calcula rápidamente: 120 − 45',
    opciones: ['85', '65', '75', '80'],
    indiceRespuestaCorrecta: 2,
    pista: 'Quítale primero 40 a 120 y al resultado réstale 5.',
    explicacionBreve: 'A 120 le restamos 40 y nos quedan 80. Luego le restamos 5 más, llegando a 75.',
  },
  {
    id: 3,
    operador: '−',
    enunciado: 'Tu nave tenía 85 litros de energía y gastó 29 al cruzar un asteroide. ¿Cuántos litros quedan?',
    opciones: ['54', '66', '64', '56'],
    indiceRespuestaCorrecta: 3,
    pista: 'Restar 29 es como restar 30 y luego devolver 1.',
    explicacionBreve: '85 menos 30 son 55; como debíamos restar 29, devolvemos 1 y nos da 56.',
  },
  {
    id: 4,
    operador: '−',
    enunciado: 'Recogiste 90 cristales cuánticos y usaste 35 para el reactor. ¿Cuántos te quedan?',
    opciones: ['65', '55', '45', '60'],
    indiceRespuestaCorrecta: 1,
    pista: 'A 90 quítale 30 (quedan 60) y luego quítale 5.',
    explicacionBreve: '90 − 30 = 60, y 60 − 5 = 55 cristales.',
  },
  {
    id: 5,
    operador: '+',
    enunciado: 'El propulsor izquierdo generó 34 de energía y el derecho 26. ¿Cuánta energía hay en total?',
    opciones: ['50', '70', '60', '64'],
    indiceRespuestaCorrecta: 2,
    pista: 'Suma 30 + 20 y luego suma 4 + 6.',
    explicacionBreve: '30 + 20 = 50 y 4 + 6 = 10. En total: 50 + 10 = 60.',
  },
  {
    id: 6,
    operador: '+',
    enunciado: 'Reto rápido de energía: 50 + 30 − 20',
    opciones: ['60', '50', '70', '40'],
    indiceRespuestaCorrecta: 0,
    pista: 'Suma 50 + 30 primero y luego quita 20.',
    explicacionBreve: '50 + 30 son 80. Si a 80 le restamos 20, nos quedan 60.',
  },
  {
    id: 7,
    operador: '−',
    enunciado: 'Un satélite está a 78 km de altura. Si nuestra sonda ya subió 25 km, ¿cuántos kilómetros faltan?',
    opciones: ['43', '55', '63', '53'],
    indiceRespuestaCorrecta: 3,
    pista: 'Resta decenas con decenas (70 − 20) y unidades con unidades (8 − 5).',
    explicacionBreve: '70 − 20 = 50 y 8 − 5 = 3. Nos faltan 53 km.',
  },
  {
    id: 8,
    operador: '+',
    enunciado: 'Un explorador recolecta 45 estrellas y luego encuentra 25 más. ¿Cuántas estrellas tiene ahora?',
    opciones: ['65', '70', '75', '60'],
    indiceRespuestaCorrecta: 1,
    pista: '45 + 5 son 50; luego súmale los 20 restantes.',
    explicacionBreve: '45 + 5 = 50, y 50 + 20 = 70 estrellas en total.',
  },

  // ── Multiplicación sencilla (1 y 2 cifras fáciles) ──
  {
    id: 9,
    operador: '×',
    enunciado: '¿Cuánto es 6 × 7?',
    opciones: ['42', '36', '48', '49'],
    indiceRespuestaCorrecta: 0,
    pista: '6 × 6 es 36; súmale 6 más.',
    explicacionBreve: '6 por 6 es 36, más 6 nos da 42 (6 × 7 = 42).',
  },
  {
    id: 10,
    operador: '×',
    enunciado: 'Cada cápsula cuántica guarda 12 cristales. Si tienes 3 cápsulas, ¿cuántos cristales hay en total?',
    opciones: ['32', '34', '36', '42'],
    indiceRespuestaCorrecta: 2,
    pista: 'Multiplica 10 × 3 y súmale 2 × 3.',
    explicacionBreve: '10 × 3 = 30 y 2 × 3 = 6. Al sumarlos obtenemos 36 cristales.',
  },
  {
    id: 11,
    operador: '×',
    enunciado: 'Calcula el impulso del reactor: 15 × 2',
    opciones: ['25', '35', '20', '30'],
    indiceRespuestaCorrecta: 3,
    pista: 'El doble de 15 es 15 + 15.',
    explicacionBreve: '15 + 15 = 30, así que 15 × 2 = 30.',
  },
  {
    id: 12,
    operador: '×',
    enunciado: 'Una flota de 5 naves espaciales lleva 8 tripulantes en cada nave. ¿Cuántos tripulantes van en total?',
    opciones: ['45', '40', '35', '48'],
    indiceRespuestaCorrecta: 1,
    pista: 'Cuenta de 5 en 5 ocho veces.',
    explicacionBreve: '5 × 8 = 40 tripulantes en total.',
  },
  {
    id: 13,
    operador: '×',
    enunciado: 'Resuelve en la cámara cuántica: 21 × 3',
    opciones: ['63', '61', '53', '66'],
    indiceRespuestaCorrecta: 0,
    pista: 'Multiplica 20 × 3 y súmale 1 × 3.',
    explicacionBreve: '20 × 3 = 60 y 1 × 3 = 3. En total: 60 + 3 = 63.',
  },
  {
    id: 14,
    operador: '×',
    enunciado: 'El escudo activa 9 torres láser y cada torre dispara 4 rayos. ¿Cuántos rayos se disparan?',
    opciones: ['32', '40', '36', '27'],
    indiceRespuestaCorrecta: 2,
    pista: 'Piensa en la tabla del 4: 4 × 9.',
    explicacionBreve: '9 × 4 = 36 rayos láser.',
  },

  // ── División exacta sencilla ──
  {
    id: 15,
    operador: '÷',
    enunciado: 'Reparte 36 células de energía en partes iguales entre 4 reactores: 36 ÷ 4',
    opciones: ['8', '7', '6', '9'],
    indiceRespuestaCorrecta: 3,
    pista: '¿Qué número multiplicado por 4 da 36?',
    explicacionBreve: 'Como 4 × 9 = 36, al dividir 36 entre 4 cada reactor recibe 9 células.',
  },
  {
    id: 16,
    operador: '÷',
    enunciado: '¿Cuánto es 45 ÷ 5?',
    opciones: ['9', '8', '7', '10'],
    indiceRespuestaCorrecta: 0,
    pista: 'Cuenta de 5 en 5 hasta llegar a 45.',
    explicacionBreve: '5 × 9 = 45, por lo tanto 45 ÷ 5 = 9.',
  },
  {
    id: 17,
    operador: '÷',
    enunciado: 'Tienes 24 cristales para colocar en 6 pedestales en partes iguales. ¿Cuántos van en cada uno?',
    opciones: ['3', '5', '4', '6'],
    indiceRespuestaCorrecta: 2,
    pista: 'Piensa en la tabla del 6: 6 × ? = 24.',
    explicacionBreve: '6 × 4 = 24, así que en cada pedestal van 4 cristales.',
  },
  {
    id: 18,
    operador: '÷',
    enunciado: 'Calcula mentalmente la división: 40 ÷ 8',
    opciones: ['4', '5', '6', '8'],
    indiceRespuestaCorrecta: 1,
    pista: '¿Por cuánto multiplicas 8 para obtener 40?',
    explicacionBreve: 'Como 8 × 5 = 40, entonces 40 ÷ 8 = 5.',
  },
  {
    id: 19,
    operador: '÷',
    enunciado: 'Un puente cuántico mide 48 metros y está formado por 2 tramos iguales. ¿Cuánto mide cada tramo?',
    opciones: ['22', '26', '28', '24'],
    indiceRespuestaCorrecta: 3,
    pista: 'Halla la mitad de 40 y la mitad de 8.',
    explicacionBreve: 'La mitad de 40 es 20 y la mitad de 8 es 4. En total: 24 metros.',
  },
  {
    id: 20,
    operador: '÷',
    enunciado: 'Si 32 meteoritos se dividen en 4 grupos iguales, ¿cuántos meteoritos hay en cada grupo?',
    opciones: ['8', '6', '7', '9'],
    indiceRespuestaCorrecta: 0,
    pista: 'Recuerda cuánto es 4 × 8.',
    explicacionBreve: 'Como 4 × 8 = 32, entonces 32 ÷ 4 = 8 meteoritos por grupo.',
  },
  // === IA_PREGUNTAS_NUMERIX_START ===
  {
    id: 1001,
    operador: "+",
    enunciado: "Si en la base espacial teníamos 134 cristales y recolectamos 58 más, ¿cuántos cristales tenemos ahora?",
    opciones: ["182","192","172","188"],
    indiceRespuestaCorrecta: 0,
    pista: "Suma primero las unidades (4 + 8) y lleva una decena.",
    explicacionBreve: "134 + 58 = 182. Sumamos unidades, decenas y centenas cuidadosamente.",
  },
  {
    id: 1002,
    operador: "+",
    enunciado: "¿Cuánto es 56 + 28?",
    opciones: ["84","74","82","94"],
    indiceRespuestaCorrecta: 0,
    pista: "Suma primero las unidades (6 + 8) y lleva una decena.",
    explicacionBreve: "56 + 28 = 84. Sumamos 6 + 8 = 14 (ponemos 4 y llevamos 1) y 5 + 2 + 1 = 8.",
  },
  {
    id: 1003,
    operador: "+",
    enunciado: "¿Cuánto es 35 + 24?",
    opciones: ["59","69","58","49"],
    indiceRespuestaCorrecta: 0,
    pista: "Suma primero las unidades (5 + 4) y luego las decenas (3 + 2).",
    explicacionBreve: "Al sumar 35 + 24, sumamos 5+4=9 y 30+20=50, lo que nos da 59.",
  },
  {
    id: 1004,
    operador: "÷",
    enunciado: "En el planeta Numérix, el Profesor Cero organizó una fiesta de cumpleaños y repartió 48 caramelos cuánticos en partes iguales entre sus 6 amigos alienígenas. ¿Cuántos caramelos se comió cada extraterrestre?",
    opciones: ["6 caramelos","7 caramelos","8 caramelos","9 caramelos"],
    indiceRespuestaCorrecta: 2,
    pista: "Piensa en qué operación reparte una cantidad total en partes iguales. ¡Tienes que dividir 48 entre 6!",
    explicacionBreve: "Al dividir 48 caramelos entre los 6 amigos, el resultado es 8 (porque 6 × 8 = 48). ¡A cada uno le tocaron 8 deliciosos caramelos cuánticos!",
  },
  {
    id: 1005,
    operador: "+",
    enunciado: "En el planeta Numérix, el robot Zubi recolecta 15 cristales de energía azules cada mañana. Si por la tarde encuentra el doble de esa cantidad, ¿cuántos cristales recolecta en total al final del día?",
    opciones: ["30 cristales","45 cristales","60 cristales","15 cristales"],
    indiceRespuestaCorrecta: 1,
    pista: "Primero calcula cuánto es el doble de 15, y luego súmaselo a los 15 de la mañana (o multiplica 15 por 3).",
    explicacionBreve: "Por la mañana recolecta 15 y por la tarde el doble (30). En total: 15 + 30 = 45 cristales.",
  },
  {
    id: 1006,
    operador: "×",
    enunciado: "Si tu base espacial recibió 145 cristales de energía y usaste 68 para encender los motores, ¿cuántos cristales te quedan?",
    opciones: ["77","87","67","75"],
    indiceRespuestaCorrecta: 0,
    pista: "Recuerda prestar una decena si el número de arriba es menor al restar.",
    explicacionBreve: "145 menos 68 da como resultado 77 cristales.",
  },
  {
    id: 1007,
    operador: "+",
    enunciado: "¿Cuánto es 65 + 28?",
    opciones: ["83","93","92","85"],
    indiceRespuestaCorrecta: 1,
    pista: "Suma primero las unidades (5 + 8) y luego las decenas.",
    explicacionBreve: "5 + 8 = 13 (pones 3 y llevas 1). 6 + 2 + 1 = 9. El resultado es 93.",
  },
  {
    id: 1008,
    operador: "+",
    enunciado: "En el planeta Numérix, el robot Zubi colecciona cristales cuánticos. Si tenía 15 cristales y en una fiesta espacial le regalaron otros 23, ¿cuántos cristales brillantes tiene ahora para iluminar su nave?",
    opciones: ["35 cristales","38 cristales","40 cristales","318 cristales"],
    indiceRespuestaCorrecta: 1,
    pista: "Tienes que juntar los cristales que ya tenía con los que le regalaron. ¡Suma las unidades y luego las decenas!",
    explicacionBreve: "Sumamos 15 + 23. Primero las unidades (5 + 3 = 8) y luego las decenas (1 + 2 = 3), lo que nos da un total de 38 cristales.",
  },
  {
    id: 1009,
    operador: "+",
    enunciado: "En el planeta Numérix, el robot Zubi recolectó 45 cristales de energía brillante en la Cueva del Eco y luego encontró otros 37 cristales flotando en el Río Cuántico. ¿Cuántos cristales tiene Zubi en total para encender su nave espacial?",
    opciones: ["72 cristales","82 cristales","92 cristales","78 cristales"],
    indiceRespuestaCorrecta: 1,
    pista: "Tienes que juntar (sumar) los cristales de la cueva con los del río.",
    explicacionBreve: "Sumamos 45 (de la cueva) + 37 (del río), lo que nos da un total de 82 cristales cósmicos.",
  },
  {
    id: 1010,
    operador: "×",
    enunciado: "Para recargar los propulsores, Numérix necesita calcular: 74 + 58. ¿Cuál es el resultado?",
    opciones: ["132","122","142","128"],
    indiceRespuestaCorrecta: 0,
    pista: "Suma primero las unidades (4 + 8) y lleva una decena.",
    explicacionBreve: "Al sumar 74 + 58, 4 + 8 = 12 (escribimos 2 y llevamos 1). Luego 7 + 5 + 1 = 13, obteniendo 132.",
  },
  {
    id: 1011,
    operador: "+",
    enunciado: "En el planeta Numérix, el robot Zubi colecciona cristales espaciales. Si tenía 15 cristales brillantes, encontró 8 en un cráter y luego regaló 5 a su amigo Bip, ¿cuántos cristales le quedan a Zubi?",
    opciones: ["18","20","28","15"],
    indiceRespuestaCorrecta: 0,
    pista: "Primero suma los cristales que encontró a los que ya tenía, y luego réstale los que regaló.",
    explicacionBreve: "Sumamos los 15 iniciales más los 8 encontrados (15 + 8 = 23) y restamos los 5 que regaló (23 - 5 = 18).",
  },
  {
    id: 1012,
    operador: "÷",
    enunciado: "En el planeta Numérix, el maestro Zog reparte 48 cristales mágicos en partes iguales entre sus 6 alumnos alienígenas. ¿Cuántos cristales brillantes le toca a cada uno?",
    opciones: ["6 cristales","7 cristales","8 cristales","9 cristales"],
    indiceRespuestaCorrecta: 2,
    pista: "Piensa en qué tabla de multiplicar da como resultado 48 al multiplicarlo por 6.",
    explicacionBreve: "Para repartir en partes iguales usamos la división: 48 ÷ 6 = 8.",
  },
  // === IA_PREGUNTAS_NUMERIX_END ===
];

/**
 * Banco de retos sencillos para el Guardián del Nivel (Núcleo Armilar).
 * Si el jugador se equivoca, se cambia a otro reto distinto del banco.
 */
export const RETOS_ARMILAR_BOSS: RetoArmilarBoss[] = [
  {
    id: 'arm-01',
    enunciado: 'La Esfera Armilar tiene 3 anillos y cada anillo lleva 8 cristales. ¿Cuántos cristales hay en total?',
    opciones: ['24', '18', '21'],
    indiceCorrecto: 0,
    pista: 'Multiplica 3 × 8 (o suma 8 + 8 + 8).',
    explicacion: '8 + 8 + 8 = 24, es decir, 3 × 8 = 24 cristales.',
  },
  {
    id: 'arm-02',
    enunciado: 'Para encender el primer anillo necesitas 50 de energía y ya tienes 32. ¿Cuánto te falta?',
    opciones: ['28', '22', '18'],
    indiceCorrecto: 2,
    pista: 'A 50 quítale 30 (quedan 20) y luego quítale 2.',
    explicacion: '50 − 30 = 20, y 20 − 2 = 18 de energía.',
  },
  {
    id: 'arm-03',
    enunciado: 'El núcleo reparte 30 rayos de luz en partes iguales entre los 3 anillos. ¿Cuántos rayos recibe cada anillo?',
    opciones: ['12', '10', '8'],
    indiceCorrecto: 1,
    pista: 'Divide 30 entre 3: ¿qué número multiplicado por 3 da 30?',
    explicacion: 'Como 3 × 10 = 30, cada anillo recibe 10 rayos.',
  },
  {
    id: 'arm-04',
    enunciado: 'Un anillo gira 15 grados y luego gira 25 grados más. ¿Cuántos grados giró en total?',
    opciones: ['40°', '35°', '45°'],
    indiceCorrecto: 0,
    pista: 'Suma 15 + 5 para llegar a 20 y luego añade 20 más.',
    explicacion: '15 + 25 = 40 grados en total.',
  },
  {
    id: 'arm-05',
    enunciado: 'Cada uno de los 4 núcleos cuánticos aporta 6 MW de potencia. ¿Cuánta potencia juntan entre los 4?',
    opciones: ['20 MW', '28 MW', '24 MW'],
    indiceCorrecto: 2,
    pista: 'Multiplica 4 × 6.',
    explicacion: '4 × 6 = 24 MW de potencia total.',
  },
  {
    id: 'arm-06',
    enunciado: 'Se reparten 20 chispas doradas en partes iguales entre 4 pilares del altar. ¿Cuántas van en cada pilar?',
    opciones: ['4', '5', '6'],
    indiceCorrecto: 1,
    pista: 'Piensa en la tabla del 4: 4 × ? = 20.',
    explicacion: 'Como 4 × 5 = 20, cada pilar recibe 5 chispas.',
  },
  {
    id: 'arm-07',
    enunciado: 'El Guardián tenía 60 sellos de luz y se activaron 25. ¿Cuántos sellos faltan por activar?',
    opciones: ['35', '45', '30'],
    indiceCorrecto: 0,
    pista: 'A 60 réstale 20 (quedan 40) y luego réstale 5.',
    explicacion: '60 − 20 = 40, y 40 − 5 = 35 sellos.',
  },
  {
    id: 'arm-08',
    enunciado: 'Si un anillo da 2 vueltas por minuto, ¿cuántas vueltas dará en 9 minutos?',
    opciones: ['16', '20', '18'],
    indiceCorrecto: 2,
    pista: 'Calcula el doble de 9 (2 × 9).',
    explicacion: '2 × 9 = 18 vueltas en total.',
  },
  {
    id: 'arm-09',
    enunciado: 'El altar suma 27 pulsos del anillo exterior y 13 del anillo interior. ¿Cuántos pulsos hay en total?',
    opciones: ['30', '40', '50'],
    indiceCorrecto: 1,
    pista: 'Suma 27 + 3 (da 30) y luego añade 10.',
    explicacion: '27 + 3 = 30, más 10 nos da 40 pulsos.',
  },
  {
    id: 'arm-10',
    enunciado: 'Hay 18 estrellas orbitando repartidas en 3 anillos por igual. ¿Cuántas estrellas tiene cada anillo?',
    opciones: ['6', '5', '7'],
    indiceCorrecto: 0,
    pista: '¿Qué número multiplicado por 3 da 18?',
    explicacion: 'Como 3 × 6 = 18, cada anillo tiene 6 estrellas.',
  },
  // === IA_BOSS_NUMERIX_START ===
  {
    id: "ia-arm-1",
    enunciado: "El Núcleo Armilar emite 4 haces de luz al día. ¿Cuántos haces emitirá exactamente en una semana (7 días)?",
    opciones: ["28","24","32"],
    indiceCorrecto: 0,
    pista: "Multiplica la cantidad de haces diarios por el número de días que tiene una semana.",
    explicacion: "Para saber el total en una semana, multiplicamos 4 haces por los 7 días de la semana, lo que nos da 4 x 7 = 28 haces de luz.",
  },
  {
    id: "ia-arm-2",
    enunciado: "El Núcleo Armilar gira 4 veces por minuto. ¿Cuántas vueltas dará exactamente en 6 minutos?",
    opciones: ["20","24","28"],
    indiceCorrecto: 1,
    pista: "Multiplica el número de vueltas por minuto por la cantidad total de minutos.",
    explicacion: "Para saber el total de vueltas, multiplicas 4 vueltas por los 6 minutos, lo que da 4 x 6 = 24 vueltas.",
  },
  {
    id: "ia-arm-3",
    enunciado: "El Núcleo Armilar necesita completar 4 niveles de energía. Si cada nivel requiere 15 esferas de luz, ¿cuántas esferas se necesitan en total?",
    opciones: ["60","45","50"],
    indiceCorrecto: 0,
    pista: "Multiplica la cantidad de niveles por las esferas que pide cada uno.",
    explicacion: "Para saber el total, multiplicamos 4 niveles por 15 esferas cada uno: 4 x 15 = 60.",
  },
  {
    id: "ia-arm-4",
    enunciado: "El Núcleo Armilar gira sobre su eje 4 veces por minuto. ¿Cuántas vueltas dará exactamente en 6 minutos?",
    opciones: ["20","24","28"],
    indiceCorrecto: 1,
    pista: "Multiplica el número de vueltas por minuto por la cantidad total de minutos.",
    explicacion: "Para saber el total de vueltas, multiplicamos 4 vueltas por los 6 minutos, lo que nos da 4 x 6 = 24 vueltas.",
  },
  {
    id: "ia-arm-5",
    enunciado: "El Núcleo Armilar gira sobre su eje 4 veces por minuto. ¿Cuántas vueltas dará exactamente en 15 minutos?",
    opciones: ["50","60","45"],
    indiceCorrecto: 1,
    pista: "Multiplica la cantidad de vueltas por minuto por el total de minutos.",
    explicacion: "Para saber el total de vueltas, multiplicamos 4 vueltas por los 15 minutos, lo que nos da 4 x 15 = 60 vueltas.",
  },
  {
    id: "ia-arm-6",
    enunciado: "El Núcleo Armilar gira 4 veces por minuto. ¿Cuántas vueltas dará exactamente en 10 minutos?",
    opciones: ["40","14","30"],
    indiceCorrecto: 0,
    pista: "Multiplica las vueltas de un minuto por el total de minutos.",
    explicacion: "Si el núcleo da 4 vueltas en un minuto, en 10 minutos dará 4 x 10 = 40 vueltas en total.",
  },
  {
    id: "ia-arm-7",
    enunciado: "El Núcleo Armilar enciende 3 anillos y cada uno lleva 4 gemas de luz. ¿Cuántas gemas brillan en total?",
    opciones: ["6","15","12"],
    indiceCorrecto: 2,
    pista: "Multiplica 3 × 4.",
    explicacion: "3 × 4 = 12 gemas de luz.",
  },
  {
    id: "ia-arm-8",
    enunciado: "El primer anillo gira 25 grados y el segundo gira 22 grados más. ¿Cuántos grados giraron entre los dos?",
    opciones: ["44°","52°","47°"],
    indiceCorrecto: 2,
    pista: "Suma 25 + 22.",
    explicacion: "25 + 22 = 47 grados en total.",
  },
  {
    id: "ia-arm-9",
    enunciado: "El Guardián reparte 32 rayos de energía en partes iguales entre 4 anillos. ¿Cuántos rayos recibe cada anillo?",
    opciones: ["12","8","4"],
    indiceCorrecto: 1,
    pista: "Divide 32 ÷ 4.",
    explicacion: "Como 4 × 8 = 32, cada anillo recibe 8 rayos.",
  },
  {
    id: "ia-arm-10",
    enunciado: "Un sello armilar necesita 62 pulsos y ya acumuló 42. ¿Cuántos pulsos le faltan?",
    opciones: ["20","26","15"],
    indiceCorrecto: 0,
    pista: "Resta 62 − 42.",
    explicacion: "62 − 42 = 20 pulsos faltantes.",
  },
  // === IA_BOSS_NUMERIX_END ===
];

/** Baraja las opciones de una pregunta matemática para que la respuesta correcta quede en posición aleatoria. */
export function barajarOpcionesPregunta(p: PreguntaMatematica): PreguntaMatematica {
  const respuestaCorrecta = p.opciones[p.indiceRespuestaCorrecta];
  const mezcladas = [...p.opciones];
  for (let i = mezcladas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
  }
  return {
    ...p,
    opciones: mezcladas,
    indiceRespuestaCorrecta: mezcladas.indexOf(respuestaCorrecta),
  };
}

/** Baraja las 3 opciones de un reto del Guardián para que la respuesta correcta nunca esté fija en el centro. */
export function barajarRetoBoss(r: RetoArmilarBoss): RetoArmilarBoss {
  const respuestaCorrecta = r.opciones[r.indiceCorrecto];
  const mezcladas = [...r.opciones] as [string, string, string];
  for (let i = mezcladas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
  }
  return {
    ...r,
    opciones: mezcladas,
    indiceCorrecto: mezcladas.indexOf(respuestaCorrecta) as 0 | 1 | 2,
  };
}

export function getRandomPregunta(excludeIds?: Set<number>): PreguntaMatematica {
  const disponibles = excludeIds
    ? PREGUNTAS_NUMERIX.filter((p) => !excludeIds.has(p.id))
    : PREGUNTAS_NUMERIX;
  const pool = disponibles.length > 0 ? disponibles : PREGUNTAS_NUMERIX;
  const elegida = pool[Math.floor(Math.random() * pool.length)];
  return barajarOpcionesPregunta(elegida);
}

export function getRandomRetoBoss(excludeIds?: Set<string>): RetoArmilarBoss {
  const disponibles = excludeIds
    ? RETOS_ARMILAR_BOSS.filter((r) => !excludeIds.has(r.id))
    : RETOS_ARMILAR_BOSS;
  const pool = disponibles.length > 0 ? disponibles : RETOS_ARMILAR_BOSS;
  const elegido = pool[Math.floor(Math.random() * pool.length)];
  return barajarRetoBoss(elegido);
}
