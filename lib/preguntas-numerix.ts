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
    enunciado: "En el planeta Numérix, el robot Zubi colecciona cristales espaciales. Si tenía 15 cristales brillantes, encontró 8 en un cráter y luego regaló 5 a su amigo Bip, ¿cuántos cristales le quedan a Zubi?",
    opciones: ["18","20","28","15"],
    indiceRespuestaCorrecta: 0,
    pista: "Primero suma los cristales que encontró a los que ya tenía, y luego réstale los que regaló.",
    explicacionBreve: "Sumamos los 15 iniciales más los 8 encontrados (15 + 8 = 23) y restamos los 5 que regaló (23 - 5 = 18).",
  },
  {
    id: 1002,
    operador: "÷",
    enunciado: "En el planeta Numérix, el maestro Zog reparte 48 cristales mágicos en partes iguales entre sus 6 alumnos alienígenas. ¿Cuántos cristales brillantes le toca a cada uno?",
    opciones: ["6 cristales","7 cristales","8 cristales","9 cristales"],
    indiceRespuestaCorrecta: 2,
    pista: "Piensa en qué tabla de multiplicar da como resultado 48 al multiplicarlo por 6.",
    explicacionBreve: "Para repartir en partes iguales usamos la división: 48 ÷ 6 = 8.",
  },
  {
    id: 1003,
    operador: "+",
    enunciado: "En el planeta Numérix, el robot Zubi tiene 15 cristales de energía y se encuentra con un alienígena muy generoso que le regala otros 18 cristales brillantes. ¿Cuántos cristales tiene Zubi ahora en total para encender su nave?",
    opciones: ["23 cristales","33 cristales","30 cristales","43 cristales"],
    indiceRespuestaCorrecta: 1,
    pista: "Piensa en juntar o sumar los cristales que tenía Zubi con los que le regaló el alienígena.",
    explicacionBreve: "Para saber el total, sumamos los 15 cristales iniciales de Zubi más los 18 cristales que le regalaron: 15 + 18 = 33.",
  },
  {
    id: 1004,
    operador: "+",
    enunciado: "En el planeta Numérix, el robot Zubi programa sus saltos espaciales. Si da un salto de 15 metros y luego otro salto igual de largo, ¿a qué distancia llega en total?",
    opciones: ["20 metros","30 metros","25 metros","15 metros"],
    indiceRespuestaCorrecta: 1,
    pista: "Suma la distancia del primer salto con la del segundo salto.",
    explicacionBreve: "Al sumar 15 metros del primer salto más 15 metros del segundo salto, el resultado es 30 metros.",
  },
  {
    id: 1005,
    operador: "×",
    enunciado: "Tu nave tenía 90 litros de energía y gastó 35 al cruzar una nebulosa. ¿Cuántos litros quedan?",
    opciones: ["55","65","45","60"],
    indiceRespuestaCorrecta: 0,
    pista: "A 90 quítale 30 y luego resta 5 más.",
    explicacionBreve: "Al restar 35 de 90, primero restamos 30 (quedan 60) y luego 5 más, lo que da 55.",
  },
  {
    id: 1006,
    operador: "×",
    enunciado: "Tu nave recolectó 145 cristales y en la base te entregan otros 78. ¿Cuántos cristales tienes en total?",
    opciones: ["213","223","233","212"],
    indiceRespuestaCorrecta: 1,
    pista: "Suma primero las unidades (5 + 8), luego las decenas y finalmente las centenas.",
    explicacionBreve: "145 + 78 = 223. Sumamos unidades llevándonos uno, luego las decenas y centenas.",
  },
  {
    id: 1007,
    operador: "×",
    enunciado: "¿Cuánto es 75 + 48?",
    opciones: ["113","123","125","133"],
    indiceRespuestaCorrecta: 1,
    pista: "Suma primero las unidades (5 + 8) y luego las decenas.",
    explicacionBreve: "75 + 48 = 123. Sumamos 70 + 40 = 110, y 5 + 8 = 13. Al final, 110 + 13 = 123.",
  },
  {
    id: 1008,
    operador: "+",
    enunciado: "¿Cuánto es 63 + 28?",
    opciones: ["91","81","92","89"],
    indiceRespuestaCorrecta: 0,
    pista: "Suma primero las decenas (60 + 20) y luego las unidades (3 + 8).",
    explicacionBreve: "Al sumar 63 + 28, 3+8=11 (ponemos 1 y llevamos 1), y 6+2+1=9. El resultado es 91.",
  },
  {
    id: 1009,
    operador: "+",
    enunciado: "En el planeta Numérix, el Gran Monstruo de las Matemáticas se comió 15 cristales de energía de mi colección. Si ahora me quedan 27 cristales, ¿cuántos tenía antes del gran tentempié?",
    opciones: ["12 cristales","32 cristales","42 cristales","402 cristales"],
    indiceRespuestaCorrecta: 2,
    pista: "Piensa en lo que tenías al final y súmale lo que te quitó el monstruo para saber el total inicial.",
    explicacionBreve: "Para saber cuántos cristales tenías antes, debes sumar los que te quedaron (27) más los que se comió el monstruo (15). 27 + 15 = 42.",
  },
  {
    id: 1010,
    operador: "+",
    enunciado: "En el planeta Numérix, el robot Zubi colecciona cristales lunares. Si tenía 15 cristales y en su viaje por los cráteres encontró 8 más, ¿cuántos cristales tiene ahora para iluminar su taller?",
    opciones: ["21 cristales","23 cristales","25 cristales","22 cristales"],
    indiceRespuestaCorrecta: 1,
    pista: "Piensa en juntar o sumar lo que ya tenía Zubi con lo que encontró en el camino.",
    explicacionBreve: "Para saber el total de cristales, sumamos los 15 que ya tenía más los 8 nuevos: 15 + 8 = 23.",
  },
  {
    id: 1011,
    operador: "÷",
    enunciado: "En el planeta Numérix, el robot Zubi tiene 12 caramelos cuánticos y se los quiere repartir equitativamente entre sus 4 amigos extraterrestres. ¿Cuántos caramelos le toca a cada amigo?",
    opciones: ["2 caramelos","3 caramelos","4 caramelos","6 caramelos"],
    indiceRespuestaCorrecta: 1,
    pista: "Piensa en qué operación debes usar para repartir una cantidad en partes iguales.",
    explicacionBreve: "Para repartir los 12 caramelos entre los 4 amigos, debes hacer una división: 12 ÷ 4 = 3.",
  },
  {
    id: 1012,
    operador: "+",
    enunciado: "En el planeta Numérix, el Gran Monstruo de las Galletas se comió 15 galletas de chocolate y luego se comió otras 12 de fresa. ¿Cuántas galletas se devoró en total el glotón monstruo?",
    opciones: ["23 galletas","27 galletas","30 galletas","180 galletas"],
    indiceRespuestaCorrecta: 1,
    pista: "Suma las galletas de chocolate y las de fresa para saber el total.",
    explicacionBreve: "Para hallar el total, sumamos 15 (chocolate) + 12 (fresa), lo que nos da 27 galletas.",
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
    enunciado: "El Núcleo Armilar gira sobre su eje 4 veces por hora. ¿Cuántas vueltas completas da en 6 horas?",
    opciones: ["20","24","28"],
    indiceCorrecto: 1,
    pista: "Multiplica la cantidad de vueltas que da en una hora por el total de horas.",
    explicacion: "Si da 4 vueltas en 1 hora, en 6 horas da 4 × 6 = 24 vueltas en total.",
  },
  {
    id: "ia-arm-2",
    enunciado: "El Núcleo Armilar emite 15 destellos por minuto. Si brilla durante 4 minutos seguidos, ¿cuántos destellos emite en total?",
    opciones: ["60","45","50"],
    indiceCorrecto: 0,
    pista: "Multiplica la cantidad de destellos por minuto por el número total de minutos.",
    explicacion: "Para hallar el total de destellos, multiplicamos 15 destellos por los 4 minutos, lo que da como resultado 15 x 4 = 60 destellos.",
  },
  {
    id: "ia-arm-3",
    enunciado: "El Núcleo Armilar gira sobre su eje 4 veces por minuto. ¿Cuántas vueltas dará exactamente en 15 minutos?",
    opciones: ["45","60","75"],
    indiceCorrecto: 1,
    pista: "Multiplica la cantidad de vueltas que da en un minuto por los 15 minutos totales.",
    explicacion: "Si el núcleo da 4 vueltas por minuto, multiplicamos 4 por 15, lo que nos da un total de 60 vueltas.",
  },
  {
    id: "ia-arm-4",
    enunciado: "El Núcleo Armilar gira 4 veces por minuto. ¿Cuántas vueltas dará exactamente en 6 minutos?",
    opciones: ["20","24","28"],
    indiceCorrecto: 1,
    pista: "Multiplica el número de vueltas por minuto por la cantidad de minutos.",
    explicacion: "Si da 4 vueltas en un minuto, en 6 minutos da 4 x 6 = 24 vueltas en total.",
  },
  {
    id: "ia-arm-5",
    enunciado: "El anillo exterior suma 50 impulsos y el interior aporta 35. ¿Cuántos impulsos activan el sello?",
    opciones: ["83","90","85"],
    indiceCorrecto: 2,
    pista: "Suma primero las decenas y luego las unidades de 50 + 35.",
    explicacion: "50 + 35 = 85 impulsos en total.",
  },
  {
    id: "ia-arm-6",
    enunciado: "Cada uno de los 6 núcleos armilares genera 6 MW de potencia. ¿Cuánta potencia producen juntos?",
    opciones: ["36 MW","41 MW","30 MW"],
    indiceCorrecto: 0,
    pista: "Calcula 6 × 6.",
    explicacion: "6 × 6 = 36 MW en total.",
  },
  {
    id: "ia-arm-7",
    enunciado: "Cada uno de los 9 núcleos armilares genera 6 MW de potencia. ¿Cuánta potencia producen juntos?",
    opciones: ["54 MW","56 MW","49 MW"],
    indiceCorrecto: 0,
    pista: "Calcula 9 × 6.",
    explicacion: "9 × 6 = 54 MW en total.",
  },
  {
    id: "ia-arm-8",
    enunciado: "El Guardián reparte 27 rayos de energía en partes iguales entre 3 anillos. ¿Cuántos rayos recibe cada anillo?",
    opciones: ["9","14","4"],
    indiceCorrecto: 0,
    pista: "Divide 27 ÷ 3.",
    explicacion: "Como 3 × 9 = 27, cada anillo recibe 9 rayos.",
  },
  {
    id: "ia-arm-9",
    enunciado: "El Núcleo Armilar gira sobre su eje 4 veces por hora. ¿Cuántas vueltas completa en 6 horas?",
    opciones: ["10","24","28"],
    indiceCorrecto: 1,
    pista: "Multiplica el número de vueltas por hora por la cantidad total de horas.",
    explicacion: "Para saber el total de vueltas, multiplicamos 4 vueltas por cada hora por las 6 horas, lo que nos da 4 x 6 = 24 vueltas.",
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
