'use client';

import { type CSSProperties, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useAuthStore } from '../../lib/auth-store';
import {
  playCorrect,
  playDiceLand,
  playDiceRoll,
  playIncorrect,
  playStarWin,
  playStep,
} from '../../lib/sound-engine';
import SoundTogglePill from '../../components/SoundTogglePill';
import { actualizarProgresoUsuario } from '../actions/progress';
import Dado3D from './Dado3D';
import MapaMontañaCuantica, {
  ESPECIALES_IDX,
  NODOS_NUMERIX,
  TRAMPAS_IDX,
} from './numerix/MapaMontañaCuantica';
import {
  ModalReactorCuantico,
  ModalAlertaImpacto,
  ModalGuardianArmilar,
  type CondicionAsteroide,
} from './numerix/ModalesNumerix';
import {
  barajarRetoBoss,
  getRandomPregunta,
  getRandomRetoBoss,
  type PreguntaMatematica,
  type RetoArmilarBoss,
} from '../../lib/preguntas-numerix';

interface Props {
  planetColor?: string;
  planetGlow?: string;
  onPositionChange?: (pos: number) => void;
}

const TOTAL = 20;
const BONUS_JEFE_FINAL = 4;

const OPERADORES_NUCLEO: { op: '+' | '−' | '×' | '÷'; nombre: string; color: string; glow: string }[] = [
  { op: '+', nombre: 'Adición', color: '#E0F2FE', glow: 'rgba(224, 242, 254, 0.55)' },
  { op: '−', nombre: 'Sustracción', color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.6)' },
  { op: '×', nombre: 'Producto', color: '#00F5FF', glow: 'rgba(0, 245, 255, 0.6)' },
  { op: '÷', nombre: 'Cociente', color: '#2DD4BF', glow: 'rgba(45, 212, 191, 0.55)' },
];

const CONDICIONES_TRAMPA: {
  etiqueta: string;
  generar: () => { asteroides: number[]; condicion: CondicionAsteroide };
}[] = [
  {
    etiqueta: 'PAR',
    generar: () => {
      const par = (Math.floor(Math.random() * 40) + 6) * 2;
      const imp1 = (Math.floor(Math.random() * 40) + 5) * 2 + 1;
      let imp2 = (Math.floor(Math.random() * 40) + 5) * 2 + 1;
      if (imp2 === imp1) imp2 += 2;
      const asteroides = [par, imp1, imp2].sort(() => Math.random() - 0.5);
      return {
        asteroides,
        condicion: {
          etiqueta: 'PAR',
          explicacion: `El número ${par} es PAR porque termina en cifra par (${par % 10}) y es divisible exactamente entre 2.`,
          cumple: (n) => n % 2 === 0,
        },
      };
    },
  },
  {
    etiqueta: 'IMPAR',
    generar: () => {
      const impar = (Math.floor(Math.random() * 35) + 5) * 2 + 1;
      const par1 = (Math.floor(Math.random() * 35) + 6) * 2;
      let par2 = (Math.floor(Math.random() * 35) + 6) * 2;
      if (par2 === par1) par2 += 2;
      const asteroides = [impar, par1, par2].sort(() => Math.random() - 0.5);
      return {
        asteroides,
        condicion: {
          etiqueta: 'IMPAR',
          explicacion: `El número ${impar} es IMPAR porque al dividirlo entre 2 sobra 1 (termina en ${impar % 10}).`,
          cumple: (n) => n % 2 !== 0,
        },
      };
    },
  },
  {
    etiqueta: 'MÚLTIPLO DE 5',
    generar: () => {
      const mult5 = (Math.floor(Math.random() * 16) + 3) * 5;
      const n1 = mult5 + 2;
      const n2 = mult5 + 3;
      const asteroides = [mult5, n1, n2].sort(() => Math.random() - 0.5);
      return {
        asteroides,
        condicion: {
          etiqueta: 'MÚLTIPLO DE 5',
          explicacion: `El número ${mult5} es múltiplo de 5 porque termina en 0 o en 5.`,
          cumple: (n) => n % 5 === 0,
        },
      };
    },
  },
];

/** Calcula las estrellas regulares (1, 2 o 3) según el porcentaje de aciertos */
function calcularEstrellasPorPorcentaje(aciertos: number, totalPreguntas: number): number {
  if (totalPreguntas <= 0) return 3; // Si llegó al final sin caer en preguntas regulares
  const porcentaje = (aciertos / totalPreguntas) * 100;
  if (porcentaje >= 90) return 3;
  if (porcentaje >= 70) return 2;
  return 1;
}

/** Cápsula Tecnológica Vertical para los 4 Núcleos Cuánticos (+, −, ×, ÷) del HUD */
function CapsulaNucleo({
  operador,
  activo,
  color,
  glow,
}: {
  operador: string;
  activo: boolean;
  color: string;
  glow: string;
}) {
  return (
    <motion.div
      animate={activo ? { scale: [1, 1.05, 1] } : undefined}
      className="relative h-[76px] rounded-2xl p-1.5 flex flex-col items-center justify-between transition-all liquid-glass-pill"
      style={{
        background: activo
          ? `linear-gradient(165deg, ${color}24 0%, rgba(16, 24, 52, 0.78) 100%)`
          : 'linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(7, 11, 24, 0.72) 100%)',
        borderColor: activo ? `${color}75` : 'rgba(147, 197, 253, 0.14)',
        boxShadow: activo ? `0 0 18px ${glow}` : 'inset 0 2px 6px rgba(0,0,0,0.45)',
      }}
    >
      <div
        className="w-6 h-1.5 rounded-full"
        style={{
          background: activo ? color : 'rgba(148, 163, 184, 0.22)',
          opacity: activo ? 0.9 : 0.45,
        }}
      />

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg transition-all"
        style={{
          background: activo
            ? `radial-gradient(circle, ${color}28 0%, rgba(12, 18, 40, 0.85) 100%)`
            : 'rgba(10, 15, 32, 0.65)',
          border: activo ? `1.5px solid ${color}88` : '1px solid rgba(148, 163, 184, 0.16)',
          color: activo ? color : '#64748B',
          textShadow: activo ? `0 0 10px ${color}` : 'none',
        }}
      >
        {activo ? operador : '?'}
      </div>

      <div
        className="w-6 h-1.5 rounded-full"
        style={{
          background: activo ? color : 'rgba(148, 163, 184, 0.22)',
          opacity: activo ? 0.9 : 0.45,
        }}
      />
    </motion.div>
  );
}

export default function TableroIsometrico({ onPositionChange }: Props) {
  const router = useRouter();
  const params = useParams<{ planetId?: string; levelId?: string }>();
  const { user } = useAuthStore();
  const levelId = params?.levelId ? parseInt(params.levelId, 10) : 1;

  /* ── Posición en el recorrido lineal de 20 cubos (0..19 = Casilla 01..20) ── */
  const [pos, setPos] = useState(0);
  const [caminando, setCaminando] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(1);

  /* ── Contadores para el Cálculo de Estrellas por Porcentaje + Jefe Final ── */
  const [aciertos, setAciertos] = useState(0);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [stars, setStars] = useState(0);
  const [estrellasRegularesFinal, setEstrellasRegularesFinal] = useState(3);
  const [guardandoBD, setGuardandoBD] = useState(false);

  /* ── Estado del Tutor IA Google Gemini (nivel adaptativo 1..3 + cola de preguntas JSON) ── */
  const [nivelIA, setNivelIA] = useState<1 | 2 | 3>(1);
  const [etiquetaNivelIA, setEtiquetaNivelIA] = useState('Nivel 1 · Base (Default)');
  const [rachaIA, setRachaIA] = useState(0);
  const [mensajeTutorIA, setMensajeTutorIA] = useState(
    'Tutor IA Google Gemini conectado: creo preguntas en este tablero y subo el nivel gradualmente si vas muy bien.',
  );
  const colaPreguntasIARef = useRef<PreguntaMatematica[]>([]);
  const colaBossIARef = useRef<RetoArmilarBoss[]>([]);

  useEffect(() => {
    void fetch('/api/tutor-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'preparar-tablero',
        planeta: 'Numérix',
        nivelActual: 1,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) return;
        if (Array.isArray(data.preguntasNumerix)) {
          data.preguntasNumerix.forEach((p: PreguntaMatematica) => {
            if (p?.enunciado) colaPreguntasIARef.current.push(p);
          });
        }
        if (Array.isArray(data.retosBossNumerix)) {
          data.retosBossNumerix.forEach((b: RetoArmilarBoss) => {
            if (b?.enunciado) colaBossIARef.current.push(barajarRetoBoss(b));
          });
        }
      })
      .catch(() => {});
  }, []);

  /* ── 4 Núcleos Cuánticos (+, −, ×, ÷) ── */
  const [collectedCores, setCollectedCores] = useState<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);

  /* ── Mensaje dinámico de la píldora inferior ── */
  const [avisoFlotante, setAvisoFlotante] = useState(
    '¡Lanza el dado cuántico para avanzar por los cubos de Numérix!',
  );

  /* ── Estado de Pregunta Matemática (Cámara de Cálculo Cuántico) ── */
  const [question, setQuestion] = useState<PreguntaMatematica | null>(null);
  const [qStatus, setQStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const usadasRef = useRef<Set<number>>(new Set());

  /* ── Estado de Minijuego A: Secuencia de Propulsión (Casillas Especiales 04, 08, 12, 16) ── */
  const [specialSequence, setSpecialSequence] = useState<number[]>([]);
  const [specialSelection, setSpecialSelection] = useState<number[]>([]);
  const [specialStatus, setSpecialStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  /* ── Estado de Minijuego B: Alerta de Impacto / Escudo Antimateria (Casillas Trampa 06, 10, 14) ── */
  const [trapAsteroids, setTrapAsteroids] = useState<number[]>([]);
  const [trapCondition, setTrapCondition] = useState<CondicionAsteroide | null>(null);
  const [trapStatus, setTrapStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [trapSelected, setTrapSelected] = useState<number | null>(null);

  /* ── Estado del Guardián del Nivel: Núcleo Armilar (Casilla 20) ── */
  const [bossBattleActive, setBossBattleActive] = useState(false);
  const [bossPhase, setBossPhase] = useState<1 | 2 | 3>(1);
  const [bossReto, setBossReto] = useState<RetoArmilarBoss>(() => getRandomRetoBoss());
  const [bossSelectedOpt, setBossSelectedOpt] = useState<number | null>(null);
  const [bossStatus, setBossStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const usadosBossRef = useRef<Set<string>>(new Set());

  /* ── Modal de Fórmulas y Guía + Victoria ── */
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => {
    onPositionChange?.(pos);
  }, [pos, onPositionChange]);

  const nucleosActivosCount = useMemo(
    () => collectedCores.filter(Boolean).length,
    [collectedCores],
  );
  const llaveLista = nucleosActivosCount === 4;
  const progresoPct = Math.round((pos / (TOTAL - 1)) * 100);

  const modalAbierto =
    question !== null ||
    specialSequence.length > 0 ||
    trapAsteroids.length > 0 ||
    bossBattleActive ||
    showWin;

  /**
   * Función asíncrona que calcula (Estrellas Regulares por %) + (4 Estrellas Jefe Final)
   * y actualiza/inserta el registro en la tabla `progreso_usuario` de Supabase.
   */
  const guardarProgresoEnSupabase = useCallback(
    async (aciertosActuales: number, totalActuales: number) => {
      const estrellasRegulares = calcularEstrellasPorPorcentaje(aciertosActuales, totalActuales);
      const estrellasTotales = estrellasRegulares + BONUS_JEFE_FINAL;

      setEstrellasRegularesFinal(estrellasRegulares);
      setStars(estrellasTotales);

      const userId = (user as any)?.id;
      if (!userId || typeof userId !== 'string') {
        console.error('❌ No se puede guardar en Supabase: Usuario sin ID válido.');
        return estrellasTotales;
      }

      setGuardandoBD(true);
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const fechaActual = new Date().toISOString();

        // 1. Verificamos si ya existe la fila para este usuario y nivel (ej. id 54)
        const { data: existente, error: errSelect } = await supabase
          .from('progreso_usuario')
          .select('id')
          .eq('usuario_id', userId)
          .eq('nivel_id', levelId)
          .maybeSingle();

        if (errSelect) {
          console.error('Error consultando progreso_usuario:', errSelect.message);
        }

        if (existente?.id) {
          // 2A. Actualizamos la fila existente
          const { error: errUpdate } = await supabase
            .from('progreso_usuario')
            .update({
              completado: true,
              estrellas: estrellasTotales,
              ultima_sesion: fechaActual,
            })
            .eq('id', existente.id);

          if (errUpdate) console.error('Error en update cliente:', errUpdate.message);
        } else {
          // 2B. Insertamos nuevo registro si no existía
          const { error: errInsert } = await supabase.from('progreso_usuario').insert({
            usuario_id: userId,
            nivel_id: levelId,
            completado: true,
            estrellas: estrellasTotales,
            ultima_sesion: fechaActual,
          });

          if (errInsert) console.error('Error en insert cliente:', errInsert.message);
        }

        // 3. Ejecutamos también el Server Action para revalidar caché de Next.js
        await actualizarProgresoUsuario(userId, levelId, true, estrellasTotales);

        console.log(
          `✅ Guardado exitoso en Supabase -> Nivel ${levelId}: ${estrellasRegulares} (regulares) + ${BONUS_JEFE_FINAL} (jefe) = ${estrellasTotales} ⭐`,
        );
      } catch (error) {
        console.error('❌ Error guardando el progreso en Supabase:', error);
      } finally {
        setGuardandoBD(false);
      }

      return estrellasTotales;
    },
    [user, levelId],
  );

  /* ── Registrar respuesta regular y actualizar vista previa de estrellas (1 a 3) + Tutor IA Google Gemini ── */
  const registrarDesempenoRegular = useCallback(
    (esCorrecta: boolean, enunciadoActual?: string, respEstudiante?: string, respCorrecta?: string) => {
      const nuevosAciertos = esCorrecta ? aciertos + 1 : aciertos;
      const nuevoTotal = totalPreguntas + 1;
      const nuevaRacha = esCorrecta ? rachaIA + 1 : 0;
      setAciertos(nuevosAciertos);
      setTotalPreguntas(nuevoTotal);
      setRachaIA(nuevaRacha);
      setStars(calcularEstrellasPorPorcentaje(nuevosAciertos, nuevoTotal));

      void fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteNombre: user?.name || 'Explorador',
          planeta: 'Numérix',
          nivelActual: nivelIA,
          esCorrecta,
          rachaAciertos: nuevaRacha,
          aciertos: nuevosAciertos,
          totalPreguntas: nuevoTotal,
          preguntaActual: enunciadoActual || '',
          respuestaEstudiante: respEstudiante || '',
          respuestaCorrecta: respCorrecta || '',
          modeloPreferido: 'gemini-4-hydrogen',
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.ok) {
            setNivelIA(data.nuevoNivel);
            setEtiquetaNivelIA(data.etiquetaNivel);
            setMensajeTutorIA(data.mensajeTutor);
            if (data.nuevaPregunta?.enunciado) {
              colaPreguntasIARef.current.unshift({
                id: data.nuevaPregunta.id,
                operador: data.nuevaPregunta.operador || '+',
                enunciado: data.nuevaPregunta.enunciado,
                opciones: data.nuevaPregunta.opciones,
                indiceRespuestaCorrecta: data.nuevaPregunta.indiceRespuestaCorrecta,
                pista: data.nuevaPregunta.pista,
                explicacionBreve: data.nuevaPregunta.explicacionBreve,
              });
            }
            if (data.nuevoRetoBossNumerix?.enunciado) {
              colaBossIARef.current.push(barajarRetoBoss(data.nuevoRetoBossNumerix as RetoArmilarBoss));
            }
            try {
              const prevRaw = window.localStorage.getItem('universo-reportes-ia');
              const prev = prevRaw ? JSON.parse(prevRaw) : [];
              const next = [data.resumenProfesor, ...(Array.isArray(prev) ? prev : [])].slice(0, 20);
              window.localStorage.setItem('universo-reportes-ia', JSON.stringify(next));
            } catch {}
          }
        })
        .catch(() => {});
    },
    [aciertos, totalPreguntas, rachaIA, user?.name, nivelIA],
  );

  /* ── Otorgar Núcleo Cuántico correspondiente según el avance ── */
  const desbloquearNucleoPorPosicion = useCallback((indiceCasilla: number) => {
    setCollectedCores((prev) => {
      const nuevo: [boolean, boolean, boolean, boolean] = [...prev];
      if (indiceCasilla >= 3 && !nuevo[0]) nuevo[0] = true;
      else if (indiceCasilla >= 7 && !nuevo[1]) nuevo[1] = true;
      else if (indiceCasilla >= 11 && !nuevo[2]) nuevo[2] = true;
      else if (indiceCasilla >= 15 && !nuevo[3]) nuevo[3] = true;
      return nuevo;
    });
  }, []);

  /* ── Caminar paso a paso por los cubos ── */
  const moverPasoAPaso = useCallback(
    (desde: number, hasta: number, alTerminar: (posFinal: number) => void) => {
      if (desde === hasta) {
        alTerminar(hasta);
        return;
      }
      setCaminando(true);
      const dir = hasta > desde ? 1 : -1;
      let actual = desde;

      const iv = setInterval(() => {
        actual += dir;
        setPos(actual);
        playStep();
        if (actual === hasta) {
          clearInterval(iv);
          setCaminando(false);
          alTerminar(actual);
        }
      }, 290);
    },
    [],
  );

  /* ── Iniciar Minijuego A: Reactor de Propulsión Cuántica (Secuencia) ── */
  const startSpecialMinigame = useCallback(() => {
    const pasosPosibles = [6, 8, 9, 11, 12, 14, 15];
    const paso = pasosPosibles[Math.floor(Math.random() * pasosPosibles.length)];
    const base = Math.floor(Math.random() * 3 + 1) * paso;
    const ordenada = [base, base + paso, base + paso * 2, base + paso * 3];
    let desordenada = [...ordenada].sort(() => Math.random() - 0.5);
    if (desordenada.every((n, i) => n === ordenada[i])) {
      desordenada = [ordenada[2], ordenada[0], ordenada[3], ordenada[1]];
    }
    setSpecialSequence(desordenada);
    setSpecialSelection([]);
    setSpecialStatus('idle');
    setAvisoFlotante('¡Casilla Especial! Ordena los 4 cubos cuánticos de menor a mayor en el reactor.');
  }, []);

  /* ── Iniciar Minijuego B: Alerta de Impacto — Escudo Antimateria ── */
  const startTrapMinigame = useCallback(() => {
    const generador = CONDICIONES_TRAMPA[Math.floor(Math.random() * CONDICIONES_TRAMPA.length)];
    const { asteroides, condicion } = generador.generar();
    setTrapAsteroids(asteroides);
    setTrapCondition(condicion);
    setTrapSelected(null);
    setTrapStatus('idle');
    setAvisoFlotante(`¡Alerta de impacto! Dispara al asteroide con número ${condicion.etiqueta}.`);
  }, []);

  /* ── Iniciar Duelo del Guardián Armilar en la Casilla 20 ── */
  const startBossBattle = useCallback(() => {
    setCollectedCores([true, true, true, true]);
    const retoIA = colaBossIARef.current.shift();
    const primerReto = retoIA ?? getRandomRetoBoss(usadosBossRef.current);
    usadosBossRef.current.add(primerReto.id);
    setBossReto(primerReto);
    setBossPhase(1);
    setBossSelectedOpt(null);
    setBossStatus('idle');
    setBossBattleActive(true);
    setAvisoFlotante('¡Has llegado a la cima! Alinea los 3 anillos de la Esfera Armilar Dorada.');

    // Precarga un reto extra del Jefe Final con la IA para las siguientes fases
    void fetch('/api/tutor-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generar-boss-numerix',
        nivelActual: nivelIA,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.nuevoRetoBossNumerix?.enunciado) {
          colaBossIARef.current.push(barajarRetoBoss(data.nuevoRetoBossNumerix as RetoArmilarBoss));
        }
      })
      .catch(() => {});
  }, [nivelIA]);

  /* ── Activar evento de la casilla donde aterriza el astronauta ── */
  const activarEventoCasilla = useCallback(
    (indiceDestino: number) => {
      if (indiceDestino >= TOTAL - 1) {
        setTimeout(() => startBossBattle(), 380);
      } else if (ESPECIALES_IDX.includes(indiceDestino)) {
        setTimeout(() => startSpecialMinigame(), 380);
      } else if (TRAMPAS_IDX.includes(indiceDestino)) {
        setTimeout(() => startTrapMinigame(), 380);
      } else {
        setTimeout(() => {
          const pregIA = colaPreguntasIARef.current.shift();
          const preg = pregIA ?? getRandomPregunta(usadasRef.current);
          usadasRef.current.add(preg.id);
          setQuestion(preg);
          setQStatus('idle');
          setSelectedOpt(null);
          setAvisoFlotante(`Casilla ${String(indiceDestino + 1).padStart(2, '0')}: Resuelve el cálculo cuántico.`);
        }, 380);
      }
    },
    [startBossBattle, startSpecialMinigame, startTrapMinigame],
  );

  /* ── Lanzar el Dado 3D Cuántico ── */
  const handleIniciarSalto = useCallback(() => {
    if (rolling || caminando || modalAbierto) return;
    if (pos >= TOTAL - 1) {
      startBossBattle();
      return;
    }
    const resultado = Math.floor(Math.random() * 6) + 1;
    setDiceResult(resultado);
    setRolling(true);
    playDiceRoll();
    setAvisoFlotante('Calculando vector de salto cuántico...');
  }, [rolling, caminando, modalAbierto, pos, startBossBattle]);

  const handleRollComplete = useCallback(() => {
    setRolling(false);
    playDiceLand();
    const destino = Math.min(TOTAL - 1, pos + diceResult);
    setAvisoFlotante(`¡Salto cuántico de +${diceResult} ${diceResult === 1 ? 'cubo' : 'cubos'}!`);
    moverPasoAPaso(pos, destino, (posFinal) => {
      activarEventoCasilla(posFinal);
    });
  }, [pos, diceResult, moverPasoAPaso, activarEventoCasilla]);

  /* ── Interacción en Tarjeta 1 (Modo Secuencia de Propulsión) ── */
  const handleToggleNumeroSecuencia = useCallback(
    (num: number) => {
      if (specialStatus !== 'idle') return;
      setSpecialSelection((prev) =>
        prev.includes(num) ? prev.filter((n) => n !== num) : prev.length < 4 ? [...prev, num] : prev,
      );
    },
    [specialStatus],
  );

  const handleConfirmarSecuencia = useCallback(() => {
    if (specialStatus !== 'idle') {
      const fueCorrecto = specialStatus === 'correct';
      setSpecialSequence([]);
      setSpecialSelection([]);
      setSpecialStatus('idle');
      if (fueCorrecto) {
        const destinoImpulso = Math.min(TOTAL - 1, pos + 2);
        setAvisoFlotante('¡Propulsión activada! Avanzas +2 cubos adicionales.');
        moverPasoAPaso(pos, destinoImpulso, (posFinal) => {
          desbloquearNucleoPorPosicion(posFinal);
          if (posFinal >= TOTAL - 1) {
            setTimeout(() => startBossBattle(), 400);
          }
        });
      }
      return;
    }

    if (specialSelection.length < 4) {
      setAvisoFlotante('Encaja los 4 cubos cuánticos en las ranuras del reactor antes de activar.');
      return;
    }

    const ordenada = [...specialSequence].sort((a, b) => a - b);
    const esCorrecta = specialSelection.every((val, i) => val === ordenada[i]);
    registrarDesempenoRegular(esCorrecta);

    if (esCorrecta) {
      setSpecialStatus('correct');
      desbloquearNucleoPorPosicion(pos);
      playCorrect();
    } else {
      setSpecialStatus('incorrect');
      playIncorrect();
    }
  }, [
    specialStatus,
    specialSelection,
    specialSequence,
    pos,
    moverPasoAPaso,
    desbloquearNucleoPorPosicion,
    startBossBattle,
    registrarDesempenoRegular,
  ]);

  /* ── Interacción en Tarjeta 1 (Modo Pregunta Matemática) ── */
  const handleConfirmarPregunta = useCallback(() => {
    if (!question) return;
    if (qStatus !== 'idle') {
      setQuestion(null);
      setQStatus('idle');
      setSelectedOpt(null);
      return;
    }
    if (selectedOpt === null) return;

    const esCorrecta = selectedOpt === question.indiceRespuestaCorrecta;
    registrarDesempenoRegular(esCorrecta);

    if (esCorrecta) {
      setQStatus('correct');
      desbloquearNucleoPorPosicion(pos);
      playCorrect();
      setAvisoFlotante('¡Cálculo verificado! Precisión cuántica actualizada.');
    } else {
      setQStatus('incorrect');
      playIncorrect();
      setAvisoFlotante('Revisa la explicación del reactor y prepárate para el próximo salto.');
    }
  }, [question, qStatus, selectedOpt, pos, desbloquearNucleoPorPosicion, registrarDesempenoRegular]);

  /* ── Interacción en Tarjeta 2 (Alerta de Impacto — Escudo Antimateria) ── */
  const handleDispararAsteroide = useCallback(
    (idx: number) => {
      if (trapStatus !== 'idle' || !trapCondition) return;
      setTrapSelected(idx);
      const numero = trapAsteroids[idx];
      const esCorrecta = trapCondition.cumple(numero);
      registrarDesempenoRegular(esCorrecta);

      if (esCorrecta) {
        setTrapStatus('correct');
        desbloquearNucleoPorPosicion(pos);
        playCorrect();
      } else {
        setTrapStatus('incorrect');
        playIncorrect();
      }
    },
    [trapStatus, trapCondition, trapAsteroids, pos, desbloquearNucleoPorPosicion, registrarDesempenoRegular],
  );

  const handleCerrarAlertaImpacto = useCallback(() => {
    const fallo = trapStatus === 'incorrect';
    setTrapAsteroids([]);
    setTrapCondition(null);
    setTrapSelected(null);
    setTrapStatus('idle');

    if (fallo) {
      const destinoRetroceso = Math.max(0, pos - 2);
      setAvisoFlotante('El impacto del asteroide te hizo retroceder 2 casillas.');
      moverPasoAPaso(pos, destinoRetroceso, () => {});
    } else {
      setAvisoFlotante('¡Escudo antimateria intacto! Lanza el dado para continuar.');
    }
  }, [trapStatus, pos, moverPasoAPaso]);

  /* ── Interacción en Tarjeta 3 (Guardián del Nivel — Núcleo Armilar) ── */
  const handleAlinearAnillo = useCallback(async () => {
    const pedirSiguienteBossIA = (nivelObj: number) => {
      void fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generar-boss-numerix',
          nivelActual: nivelObj,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.ok && data.nuevoRetoBossNumerix?.enunciado) {
            colaBossIARef.current.push(
              barajarRetoBoss(data.nuevoRetoBossNumerix as RetoArmilarBoss),
            );
          }
        })
        .catch(() => {});
    };

    if (bossStatus === 'correct') {
      if (bossPhase < 3) {
        const retoIA = colaBossIARef.current.shift();
        const siguienteReto = retoIA ?? getRandomRetoBoss(usadosBossRef.current);
        usadosBossRef.current.add(siguienteReto.id);
        setBossReto(siguienteReto);
        setBossPhase((f) => (f + 1) as 1 | 2 | 3);
        setBossSelectedOpt(null);
        setBossStatus('idle');
        pedirSiguienteBossIA(nivelIA);
      } else {
        // ¡Jefe Final Superado! Calculamos (Regulares por % + 4 del Jefe) y guardamos en Supabase
        setBossBattleActive(false);
        await guardarProgresoEnSupabase(aciertos, totalPreguntas);
        setShowWin(true);
        playStarWin();
        setAvisoFlotante('¡Núcleo Armilar de Numérix restaurado al 100%!');
      }
      return;
    }

    if (bossStatus === 'incorrect') {
      const retoIA = colaBossIARef.current.shift();
      const nuevoReto = retoIA ?? getRandomRetoBoss(usadosBossRef.current);
      usadosBossRef.current.add(nuevoReto.id);
      setBossReto(nuevoReto);
      setBossSelectedOpt(null);
      setBossStatus('idle');
      pedirSiguienteBossIA(nivelIA);
      return;
    }

    if (bossSelectedOpt === null) return;
    if (bossSelectedOpt === bossReto.indiceCorrecto) {
      setBossStatus('correct');
      playCorrect();
      pedirSiguienteBossIA(nivelIA);
    } else {
      setBossStatus('incorrect');
      playIncorrect();
      pedirSiguienteBossIA(nivelIA);
    }
  }, [
    bossStatus,
    bossPhase,
    bossSelectedOpt,
    bossReto,
    guardarProgresoEnSupabase,
    aciertos,
    totalPreguntas,
    nivelIA,
  ]);

  /* ── Finalizar y redirigir al Dashboard ── */
  const handleIrAlDashboard = useCallback(async () => {
    await guardarProgresoEnSupabase(aciertos, totalPreguntas);
    router.refresh();
    router.push('/dashboard');
  }, [guardarProgresoEnSupabase, aciertos, totalPreguntas, router]);

  /* ── Reiniciar partida ── */
  const handleRestart = useCallback(() => {
    setPos(0);
    setAciertos(0);
    setTotalPreguntas(0);
    setStars(0);
    setCollectedCores([false, false, false, false]);
    setQuestion(null);
    setSpecialSequence([]);
    setTrapAsteroids([]);
    setBossBattleActive(false);
    setShowWin(false);
    usadasRef.current.clear();
    usadosBossRef.current.clear();
    setAvisoFlotante('¡Nueva misión en Numérix! Lanza el dado cuántico para avanzar.');
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col lg:flex-row overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(ellipse at 42% 48%, #041944 0%, #010D24 56%, #000612 100%)',
      }}
    >
      {/* Fondo de curvas 3D tornasol azul eléctrico de Numérix debajo del mapa */}
      <img
        src="/images/numerix-board-bg.jpg"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-95 mix-blend-screen"
      />

      {/* Destellos estelares finos en el cosmos profundo */}
      {[
        { x: '8%', y: '18%', size: 6, color: 'rgba(103, 232, 249, 0.9)', dur: '5.8s', delay: '-1.1s' },
        { x: '42%', y: '8%', size: 6, color: 'rgba(255, 255, 255, 0.9)', dur: '6.6s', delay: '-3.4s' },
        { x: '70%', y: '14%', size: 6, color: 'rgba(147, 197, 253, 0.9)', dur: '6.2s', delay: '-2.0s' },
        { x: '7%', y: '82%', size: 6, color: 'rgba(56, 189, 248, 0.9)', dur: '7.1s', delay: '-4.2s' },
      ].map((g, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="tornasol-glint tornasol-glint-star"
          style={
            {
              left: g.x,
              top: g.y,
              width: `${g.size}px`,
              height: `${g.size}px`,
              '--glint-color': g.color,
              '--glint-peak': 0.55,
              '--glint-dur': g.dur,
              '--glint-delay': g.delay,
              background: `radial-gradient(circle, #FFFFFF 0%, ${g.color} 32%, transparent 74%)`,
            } as CSSProperties
          }
        />
      ))}
      {/* ════════════════════ ESCENARIO PRINCIPAL: MONTAÑA CUÁNTICA (IZQUIERDA / CENTRO) ════════════════════ */}
      <div className="relative flex-1 h-[62vh] lg:h-full overflow-hidden flex items-center justify-center">
        {/* ── Arriba a la Izquierda: Botón Cápsula Liquid Glass "← Mapa" ── */}
        <div className="absolute top-3.5 left-4 z-30 flex items-center">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="liquid-glass-pill flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm text-[#E0F2FE] hover:text-white cursor-pointer"
          >
            <span className="text-[#38BDF8]">←</span>
            <span>Mapa</span>
          </button>
        </div>

        {/* ── Arriba al Centro: Píldora Cristal Líquido "⚡ SALTO CUÁNTICO ✦" ── */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center pointer-events-none">
          <div
            className="liquid-glass-pill px-6 sm:px-8 py-2 rounded-full flex items-center gap-3 backdrop-blur-md"
            style={{
              background:
                'linear-gradient(135deg, rgba(4, 18, 52, 0.55) 0%, rgba(6, 44, 108, 0.42) 50%, rgba(2, 14, 42, 0.62) 100%)',
              borderColor: 'rgba(186, 230, 253, 0.48)',
              boxShadow:
                '0 12px 32px -12px rgba(0, 0, 0, 0.72), inset 0 0 16px rgba(103, 232, 249, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="text-xs text-[#FDE047]">✦</span>
            <span
              className="text-xs sm:text-sm font-black tracking-[0.22em] text-white uppercase"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                textShadow: '0 0 14px rgba(0, 245, 255, 0.9)',
              }}
            >
              SALTO CUÁNTICO
            </span>
            <span className="text-xs text-[#00FF88]">✦</span>
          </div>
        </div>

        {/* ── Lienzo SVG de la Montaña 3D y los Cubos Holográficos ── */}
        <div className="w-full h-full flex items-center justify-center px-3 sm:px-5 pt-11 pb-11">
          <div className="w-full h-full max-w-[1140px] flex items-center justify-center mx-auto">
            <MapaMontañaCuantica
              pos={pos}
              caminando={caminando}
              santuarioDesbloqueado={llaveLista}
            />
          </div>
        </div>

        {/* ── Abajo al Centro: Píldora Flotante de Instrucciones en Liquid Glass ── */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 max-w-[92%] sm:max-w-lg pointer-events-none">
          <div
            className="px-6 py-2.5 rounded-full liquid-glass-pill backdrop-blur-md flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#E0F2FE] text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(3, 14, 38, 0.62) 0%, rgba(4, 24, 62, 0.52) 100%)',
              borderColor: 'rgba(186, 230, 253, 0.36)',
              boxShadow: '0 14px 34px -14px rgba(0, 0, 0, 0.78), inset 0 0 14px rgba(103, 232, 249, 0.1)',
            }}
          >
            <span className="text-[#00F5FF]">✦</span>
            <span>{avisoFlotante}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════ HUD LATERAL DERECHO EN LIQUID GLASS OBSIDIANA 3D ════════════════════ */}
      <aside className="relative z-30 w-full lg:w-[335px] xl:w-[355px] lg:h-full p-2.5 sm:p-3.5 flex flex-col justify-center shrink-0">
        <div
          className="relative w-full h-full max-h-[820px] rounded-3xl liquid-glass liquid-glass-panel p-4 sm:p-5 flex flex-col justify-between overflow-x-clip overflow-y-auto backdrop-blur-lg"
          style={{
            background:
              'linear-gradient(165deg, rgba(4, 18, 52, 0.62) 0%, rgba(2, 12, 36, 0.72) 55%, rgba(1, 7, 22, 0.82) 100%)',
            borderColor: 'rgba(186, 230, 253, 0.38)',
            boxShadow:
              '0 24px 70px -24px rgba(0, 0, 0, 0.85), inset 0 0 24px rgba(103, 232, 249, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.22)',
          }}
        >
          {/* ── 1. CABECERA: NUMÉRIX — TABLERO CUÁNTICO ── */}
          <div className="relative text-center pt-0.5 pb-3 border-b border-sky-300/15">
            <div className="absolute right-0 top-0">
              <SoundTogglePill />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-wider leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #7DD3FC 48%, #00F5FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 16px rgba(0, 245, 255, 0.38))',
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              NUMÉRIX
            </h1>
            <p className="mt-1.5 text-[10px] font-bold tracking-[0.26em] text-[#7DD3FC] uppercase">
              TABLERO CUÁNTICO
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#00F5FF]/40 bg-[#03203A]/85 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#67E8F9]">
              <span>Tutor IA · {etiquetaNivelIA}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#BAE6FD]/90 leading-snug line-clamp-2">
              {mensajeTutorIA}
            </p>
          </div>

          {/* ── 2. CAJA DEL DADO 3D CUÁNTICO EN CÁPSULA LIQUID GLASS ── */}
          <div
            className="relative my-2.5 py-4 rounded-2xl liquid-glass-pill flex flex-col items-center justify-center overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(14, 165, 233, 0.24) 0%, rgba(4, 22, 62, 0.56) 68%, rgba(2, 10, 32, 0.76) 100%)',
              borderColor: 'rgba(186, 230, 253, 0.34)',
              boxShadow: 'inset 0 0 22px rgba(103, 232, 249, 0.12)',
            }}
          >
            <span className="pointer-events-none absolute top-2.5 left-3.5 text-[#38BDF8]/80 text-xs">✦</span>
            <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[#00F5FF]/80 text-xs">✦</span>

            <div
              className="pointer-events-none absolute bottom-2 w-28 h-5 rounded-full opacity-55"
              style={{
                background: 'radial-gradient(ellipse, #00F5FF 0%, transparent 75%)',
              }}
            />

            <div
              onClick={handleIniciarSalto}
              className={
                rolling || caminando || modalAbierto
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }
              title="Haz clic para iniciar el salto cuántico"
            >
              <Dado3D
                size={88}
                rolling={rolling}
                result={diceResult}
                onRollComplete={handleRollComplete}
                faceColor="#0044B8"
                borderColor="#7DD3FC"
                pipColor="#E0F2FE"
              />
            </div>
          </div>

          {/* ── 3. PANEL DE TELEMETRÍA EN CÁPSULA LIQUID GLASS ── */}
          <div
            className="relative rounded-2xl liquid-glass p-3.5 sm:p-4 my-1"
            style={{
              background:
                'linear-gradient(160deg, rgba(14, 165, 233, 0.1) 0%, rgba(3, 18, 52, 0.54) 100%)',
              borderColor: 'rgba(186, 230, 253, 0.28)',
            }}
          >
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold tracking-[0.18em] text-[#E0F2FE] uppercase">
                  PROGRESO
                </span>
                <span className="text-xs font-black text-[#38BDF8]">
                  {progresoPct}% ({pos + 1}/{TOTAL})
                </span>
              </div>

              <div className="relative h-4 rounded-full bg-[#020B1C]/90 border border-sky-300/20 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.max(6, progresoPct)}%`,
                    background: 'linear-gradient(90deg, #0284C7 0%, #0EA5E9 48%, #00F5FF 100%)',
                    boxShadow: '0 0 14px rgba(0, 245, 255, 0.58)',
                  }}
                />
                {[32, 66, 95].map((pct, idx) => {
                  const alcanzada = progresoPct >= pct;
                  return (
                    <span
                      key={idx}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{
                        left: `${pct}%`,
                        background: alcanzada ? '#00F5FF' : '#062044',
                        color: alcanzada ? '#021526' : '#7DD3FC',
                        border: alcanzada ? '1.5px solid #E0F2FE' : '1px solid rgba(56, 189, 248, 0.4)',
                        boxShadow: alcanzada ? '0 0 12px rgba(0, 245, 255, 0.72)' : 'none',
                      }}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold tracking-[0.16em] text-[#E0F2FE] uppercase">
                  NÚCLEOS CUÁNTICOS
                </span>
                <span className="text-[10px] font-bold text-[#67E8F9] liquid-glass-pill px-2.5 py-0.5 rounded-full">
                  {nucleosActivosCount}/4 Cristales
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {OPERADORES_NUCLEO.map((item, idx) => (
                  <CapsulaNucleo
                    key={item.op}
                    operador={item.op}
                    activo={collectedCores[idx]}
                    color={item.color}
                    glow={item.glow}
                  />
                ))}
              </div>

              <div
                className="mt-3 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 liquid-glass-pill transition-all"
                style={{
                  background: llaveLista
                    ? 'linear-gradient(90deg, rgba(14,165,233,0.28) 0%, rgba(0,245,255,0.24) 100%)'
                    : 'rgba(3, 18, 40, 0.74)',
                  borderColor: llaveLista ? 'rgba(0, 245, 255, 0.65)' : 'rgba(56, 189, 248, 0.22)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rotate-45 rounded-[2px] shrink-0" style={{ background: llaveLista ? '#00F5FF' : '#64748B' }} />
                  <p className="text-xs font-black uppercase tracking-wider text-[#F0F9FF] truncate">
                    LLAVE DEL GUARDIÁN
                  </p>
                </div>
                {stars > 0 && (
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-xs font-black text-cyan-100 bg-cyan-400/18 border border-cyan-300/45 px-2.5 py-1 rounded-full leading-none">
                    <span>★</span>
                    <span>{stars}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── 4. DOS BOTONES GRANDES INFERIORES EN LIQUID GLASS ── */}
          <div className="flex flex-col gap-2.5 mt-2">
            <button
              type="button"
              onClick={handleIniciarSalto}
              disabled={rolling || caminando || modalAbierto}
              className="w-full py-3 rounded-2xl font-black text-sm tracking-[0.18em] uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 liquid-glass-btn text-white"
              style={{
                background:
                  'linear-gradient(135deg, rgba(2, 132, 199, 0.78) 0%, rgba(14, 165, 233, 0.68) 52%, rgba(0, 245, 255, 0.52) 100%)',
                borderColor: 'rgba(186, 230, 253, 0.65)',
                boxShadow: '0 0 22px rgba(14, 165, 233, 0.38)',
              }}
            >
              <span>
                {rolling
                  ? 'CALCULANDO...'
                  : caminando
                    ? 'SALTANDO...'
                    : 'INICIAR SALTO'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMostrarGuia(true)}
              className="w-full py-2.5 rounded-2xl font-bold text-xs tracking-[0.18em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 liquid-glass-pill text-[#E0F2FE] hover:text-white"
            >
              <span>FÓRMULAS Y GUÍA</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════════ MODALES DE LAS MECÁNICAS DE NUMÉRIX ════════════════════ */}

      <AnimatePresence>
        {specialSequence.length > 0 && (
          <ModalReactorCuantico
            modo="secuencia"
            estrellas={stars}
            nucleosActivos={nucleosActivosCount}
            secuencia={specialSequence}
            seleccionSecuencia={specialSelection}
            estadoSecuencia={specialStatus}
            onToggleNumeroSecuencia={handleToggleNumeroSecuencia}
            onConfirmarSecuencia={handleConfirmarSecuencia}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {question && !bossBattleActive && (
          <ModalReactorCuantico
            modo="pregunta"
            estrellas={stars}
            nucleosActivos={nucleosActivosCount}
            pregunta={question}
            opcionSeleccionada={selectedOpt}
            estadoPregunta={qStatus}
            onSeleccionarOpcion={setSelectedOpt}
            onConfirmarPregunta={handleConfirmarPregunta}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trapAsteroids.length > 0 && trapCondition && (
          <ModalAlertaImpacto
            asteroides={trapAsteroids}
            condicion={trapCondition}
            seleccionadoIdx={trapSelected}
            estado={trapStatus}
            onDisparar={handleDispararAsteroide}
            onCerrar={handleCerrarAlertaImpacto}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bossBattleActive && (
          <ModalGuardianArmilar
            reto={bossReto}
            faseActual={bossPhase}
            nucleos={collectedCores}
            estrellas={stars}
            opcionElegida={bossSelectedOpt}
            estado={bossStatus}
            onElegirOpcion={setBossSelectedOpt}
            onAlinearAnillo={handleAlinearAnillo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarGuia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[115] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setMostrarGuia(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl p-6 liquid-glass-modal text-[#E2EEFF]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h3 className="text-lg sm:text-xl font-black tracking-wider text-[#F0F6FF]">
                  Manual Cuántico de Numérix
                </h3>
                <button
                  type="button"
                  onClick={() => setMostrarGuia(false)}
                  className="w-8 h-8 rounded-xl liquid-glass-pill font-black text-slate-200 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl liquid-glass-pill">
                  <p className="font-black text-[#BFDBFE] mb-0.5">◈ Cubos Azul Crema (Cálculo):</p>
                  <p className="text-slate-200/90">
                    Activan la <strong>Cámara de Cálculo Cuántico</strong> con retos de suma, resta,
                    multiplicación y división exacta.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl liquid-glass-pill">
                  <p className="font-black text-emerald-300 mb-0.5">
                    ★ Cubos Esmeralda (Casillas 04, 08, 12 y 16 — Propulsión):
                  </p>
                  <p className="text-slate-200/90">
                    Ordena los 4 cubos de menor a mayor en el <strong>Reactor de Propulsión</strong>{' '}
                    para avanzar <strong>+2 casillas</strong> y encender uno de los{' '}
                    <strong>4 Núcleos Cuánticos</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl liquid-glass-pill">
                  <p className="font-black text-amber-300 mb-0.5">
                    Cubos Ámbar Plasma (Casillas 06, 10 y 14 · Alerta de Impacto):
                  </p>
                  <p className="text-slate-200/90">
                    Dispara con el cañón al asteroide que cumpla la condición (Par, Impar o Múltiplo)
                    para activar el escudo y evitar retroceder 2 casillas.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl liquid-glass-pill">
                  <p className="font-black text-cyan-300 mb-0.5">
                    Cima Casilla 20 (Guardián del Nivel · Núcleo Armilar):
                  </p>
                  <p className="text-slate-200/90">
                    Resuelve las 3 fases para alinear los 3 anillos de la Esfera Armilar y
                    obtener la bonificación fija de <strong>+4 estrellas</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarGuia(false)}
                  className="px-6 py-2.5 rounded-xl liquid-glass-btn text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pantalla de Victoria Cuántica */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.86, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center liquid-glass-modal text-white"
            >
              <div className="flex justify-center gap-3 mb-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15 + i * 0.15, type: 'spring', stiffness: 300 }}
                    className="text-4xl sm:text-5xl text-amber-300 drop-shadow-[0_0_14px_rgba(110,231,183,0.75)]"
                  >
                    ★
                  </motion.span>
                ))}
              </div>

              <span className="inline-block px-4 py-1 rounded-full liquid-glass-pill text-xs font-black uppercase tracking-widest text-[#C4B5FD] mb-2">
                ¡Núcleo Armilar Restaurado!
              </span>

              <h2
                className="text-2xl sm:text-3xl font-black text-[#F0F6FF] mb-2"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                ¡VICTORIA EN NUMÉRIX!
              </h2>
              <p className="text-sm sm:text-base text-[#BFDBFE]/90 mb-4">
                Alineaste los 3 anillos de la Esfera Armilar y activaste los 4 Núcleos
                Cuánticos de la montaña.
              </p>

              {/* Desglose de Estrellas según reglas de negocio */}
              <div className="liquid-glass-pill rounded-2xl p-4 mb-5 text-xs sm:text-sm space-y-1.5">
                <div className="flex justify-between text-[#E2EEFF]">
                  <span>
                    Preguntas Regulares (
                    {totalPreguntas > 0 ? Math.round((aciertos / totalPreguntas) * 100) : 100}% aciertos):
                  </span>
                  <span className="font-black text-emerald-300">+{estrellasRegularesFinal} ★</span>
                </div>
                <div className="flex justify-between text-[#E2EEFF]">
                  <span>Bonificación Jefe Final:</span>
                  <span className="font-black text-purple-300">+{BONUS_JEFE_FINAL} ★</span>
                </div>
                <div className="border-t border-white/10 pt-1.5 mt-1.5 flex justify-between text-base font-black text-[#F0F6FF]">
                  <span>Estrellas Totales del Nivel:</span>
                  <span className="text-emerald-300">★ {stars}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {OPERADORES_NUCLEO.map((n) => (
                  <span
                    key={n.op}
                    className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center font-black text-xl"
                    style={{ color: n.color, borderColor: `${n.color}66` }}
                  >
                    {n.op}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider liquid-glass-pill text-[#E2EEFF] hover:text-white cursor-pointer"
                >
                  Jugar de Nuevo
                </button>
                <button
                  type="button"
                  disabled={guardandoBD}
                  onClick={handleIrAlDashboard}
                  className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider liquid-glass-btn text-white cursor-pointer disabled:opacity-50"
                >
                  {guardandoBD ? 'Guardando...' : 'Ir al Dashboard'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}