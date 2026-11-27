'use client';

import { type CSSProperties, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../lib/auth-store';
import { useSettingsStore } from '../../lib/settings-store';
import { getPlanetById } from '../../lib/mock-data';
import {
  guardarProgresoHibrido,
  hayConexionInternet,
} from '../../lib/offline-sync';
import {
  cachearPackIAOffline,
  obtenerBancoOfflineLetralia,
} from '../../lib/offline-questions';
import {
  playCorrect,
  playDiceLand,
  playDiceRoll,
  playIncorrect,
  playStarWin,
  playStep,
} from '../../lib/sound-engine';
import SoundTogglePill from '../../components/SoundTogglePill';
import Dado3D from './Dado3D';
import MapaAstral from './letralia/MapaAstral';
import AltarDecodificacion, {
  type ModalRetoActivo,
  type ResultadoAltar,
} from './letralia/AltarDecodificacion';
import {
  CASILLA_BOSS,
  CASILLAS_RAMA,
  CASILLAS_START,
  INFO_RAMA,
  ORIGEN_G,
  ORIGEN_S,
  TOTAL_RECORRIDO,
  construirRuta,
  type Casilla,
  type Pt,
  type Rama,
} from './letralia/mapa';
import {
  PALABRAS_LLAVE,
  RETOS_GUARDIAN,
  RETOS_INTRUSO,
  RETOS_PUENTE,
  RETOS_TORMENTA,
  elegirSinRepetir,
  type RetoGuardianBoss,
  type RetoIntruso,
  type RetoPuenteSintactico,
  type RetoTormenta,
} from '../../lib/preguntas-letralia';

interface TableroLetraliaProps {
  onPositionChange?: (pos: number) => void;
}

const BONUS_JEFE_FINAL = 4;

const COLORES_CRISTAL = [
  { nombre: 'Celeste', top: '#7DD3FC', mid: '#38BDF8', dark: '#0284C7', bg: '#E0F2FE' },
  { nombre: 'Coral-Ámbar', top: '#FDBA74', mid: '#FB923C', dark: '#C2410C', bg: '#FFEDD5' },
  { nombre: 'Lavanda', top: '#C4B5FD', mid: '#A78BFA', dark: '#6D28D9', bg: '#EDE9FE' },
  { nombre: 'Menta', top: '#6EE7B7', mid: '#34D399', dark: '#047857', bg: '#D1FAE5' },
];

/** Calcula las estrellas regulares (1, 2 o 3) según el porcentaje de aciertos */
function calcularEstrellasPorPorcentaje(aciertos: number, totalPreguntas: number): number {
  if (totalPreguntas <= 0) return 3;
  const porcentaje = (aciertos / totalPreguntas) * 100;
  if (porcentaje >= 90) return 3;
  if (porcentaje >= 70) return 2;
  return 1;
}

/** Icono SVG de cristal facetado para las 4 ranuras de Sílabas Clave */
function IconoCristal({
  indice,
  activo,
}: {
  indice: number;
  activo: boolean;
}) {
  const c = COLORES_CRISTAL[indice % COLORES_CRISTAL.length];
  return (
    <svg width="36" height="38" viewBox="0 0 36 38" className="overflow-visible select-none">
      <g opacity={activo ? 1 : 0.28}>
        <ellipse cx="18" cy="34" rx="10" ry="2.8" fill="#1E1B4B" opacity="0.22" />
        <polygon
          points="18,3 27,13 23,31 13,31 9,13"
          fill={c.mid}
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <polygon points="18,3 27,13 18,17 9,13" fill={c.top} />
        <polygon points="18,3 18,17 9,13" fill="#FFFFFF" opacity="0.55" />
        <polygon
          points="28,15 33,21 30,31 24,31 25,21"
          fill={c.top}
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="8,17 12,22 11,31 6,31 5,22"
          fill={c.dark}
          opacity="0.75"
          stroke="#FFFFFF"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export default function TableroLetralia({ onPositionChange }: TableroLetraliaProps) {
  const router = useRouter();
  const params = useParams<{ planetId?: string; levelId?: string }>();
  const { user } = useAuthStore();

  // Resolvemos el ID real del nivel en mock-data (ej. en Letralia Nivel 1 tiene id: 7, order: 1)
  const resolvedLevelId = useMemo(() => {
    const rawPlanetId = params?.planetId ? parseInt(params.planetId, 10) : 2;
    const rawLevelId = params?.levelId ? parseInt(params.levelId, 10) : 7;
    const planet = getPlanetById(rawPlanetId);
    if (planet) {
      for (const c of planet.courses) {
        const found = c.levels.find((l) => l.id === rawLevelId || l.order === rawLevelId);
        if (found) return found.id; // Devuelve 7, 8 o 9 para coincidir con el Dashboard
      }
    }
    return rawLevelId || 7;
  }, [params]);

  /* ── Palabra Llave de 4 sílabas para esta partida ── */
  const [indicePalabraLlave, setIndicePalabraLlave] = useState(0);
  const palabraActual = PALABRAS_LLAVE[indicePalabraLlave % PALABRAS_LLAVE.length];

  /* ── Estado del recorrido sobre el mapa de 36 casillas ── */
  const [ramaElegida, setRamaElegida] = useState<Rama | null>(null);
  const [casillaActual, setCasillaActual] = useState<Casilla | null>(null);
  const [posPantalla, setPosPantalla] = useState<Pt>(ORIGEN_S);
  const [rastroG, setRastroG] = useState<Pt[]>([ORIGEN_G]);
  const [visitadas, setVisitadas] = useState<Set<string>>(() => new Set());
  const [completadas, setCompletadas] = useState<Set<string>>(() => new Set());

  /* ── Animación de El Viajero y el Dado ── */
  const [rodandoDado, setRodandoDado] = useState(false);
  const [resultadoDado, setResultadoDado] = useState(1);
  const [caminando, setCaminando] = useState(false);
  const [mirando, setMirando] = useState<1 | -1>(1);
  const [saltoKey, setSaltoKey] = useState(0);
  const [turno, setTurno] = useState(1);

  /* ── Encrucijada Astral en `start_5` ── */
  const [eligiendoRama, setEligiendoRama] = useState(false);
  const [pasosRestantesTrasRama, setPasosRestantesTrasRama] = useState(0);

  /* ── Inventario de 4 Sílabas Clave y contadores de desempeño ── */
  const [silabasObtenidas, setSilabasObtenidas] = useState<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);
  const [aciertosTotales, setAciertosTotales] = useState(0);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [estrellasRegularesFinal, setEstrellasRegularesFinal] = useState(3);
  const [estrellasTotalesFinal, setEstrellasTotalesFinal] = useState(7);
  const [guardandoBD, setGuardandoBD] = useState(false);

  /* ── Estado del Tutor IA Google Gemini en Letralia ── */
  const [nivelIA, setNivelIA] = useState<1 | 2 | 3>(1);
  const [etiquetaNivelIA, setEtiquetaNivelIA] = useState('Nivel 1 · Base');
  const [rachaIA, setRachaIA] = useState(0);
  const [mensajeTutorIA, setMensajeTutorIA] = useState(
    'Tutor IA Google Gemini activo: creo retos en este tablero y subo el nivel gradualmente si vas muy bien.',
  );
  const colaRetosIARef = useRef<RetoIntruso[]>([]);
  const colaPuentesIARef = useRef<RetoPuenteSintactico[]>([]);
  const colaTormentasIARef = useRef<RetoTormenta[]>([]);
  const colaBossLetraliaIARef = useRef<RetoGuardianBoss[]>([]);
  const firmasUsadasIARef = useRef<Set<string>>(new Set());

  const encolarSinDuplicado = useCallback(
    <T,>(cola: T[], item: T, getFirma: (x: T) => string) => {
      const firma = getFirma(item).trim().toLowerCase();
      if (!firma) return;
      if (firmasUsadasIARef.current.has(firma)) return;
      if (cola.some((q) => getFirma(q).trim().toLowerCase() === firma)) return;
      cola.push(item);
    },
    [],
  );

  const tomarDeColaSinRepetir = useCallback(
    <T,>(cola: T[], getFirma: (x: T) => string): T | null => {
      while (cola.length > 0) {
        const next = cola.shift()!;
        const firma = getFirma(next).trim().toLowerCase();
        if (!firmasUsadasIARef.current.has(firma)) {
          firmasUsadasIARef.current.add(firma);
          return next;
        }
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    const cargarBancoOffline = async () => {
      const bank = await obtenerBancoOfflineLetralia();
      bank.intrusos.forEach((r) =>
        encolarSinDuplicado(colaRetosIARef.current, r, (x) => x.palabras.join(' ')),
      );
      bank.puentes.forEach((r) =>
        encolarSinDuplicado(colaPuentesIARef.current, r, (x) => x.ordenCorrecto.join(' ')),
      );
      bank.tormentas.forEach((r) =>
        encolarSinDuplicado(colaTormentasIARef.current, r, (x) => x.consigna),
      );
      bank.bosses.forEach((r) =>
        encolarSinDuplicado(colaBossLetraliaIARef.current, r, (x) => x.titulo),
      );
      setMensajeTutorIA(
        'Modo sin internet activo: usando retos de lectura guardados en JSON y tu BD local.',
      );
    };

    if (!hayConexionInternet()) {
      void cargarBancoOffline();
      return;
    }

    void fetch('/api/tutor-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'preparar-tablero',
        planeta: 'Letralia',
        nivelActual: 1,
        evitarTextos: Array.from(firmasUsadasIARef.current),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) {
          void cargarBancoOffline();
          return;
        }
        void cachearPackIAOffline('Letralia', data);
        if (Array.isArray(data.retosIntrusoLetralia)) {
          data.retosIntrusoLetralia.forEach((r: RetoIntruso) => {
            if (r?.palabras?.length) encolarSinDuplicado(colaRetosIARef.current, r, (x) => x.palabras.join(' '));
          });
        }
        if (Array.isArray(data.retosPuenteLetralia)) {
          data.retosPuenteLetralia.forEach((r: RetoPuenteSintactico) => {
            if (r?.ordenCorrecto?.length) encolarSinDuplicado(colaPuentesIARef.current, r, (x) => x.ordenCorrecto.join(' '));
          });
        }
        if (Array.isArray(data.retosTormentaLetralia)) {
          data.retosTormentaLetralia.forEach((r: RetoTormenta) => {
            if (r?.palabras?.length) encolarSinDuplicado(colaTormentasIARef.current, r, (x) => x.consigna);
          });
        }
        if (Array.isArray(data.retosBossLetralia)) {
          data.retosBossLetralia.forEach((r: RetoGuardianBoss) => {
            if (r?.fases?.length) encolarSinDuplicado(colaBossLetraliaIARef.current, r, (x) => x.titulo);
          });
        }
      })
      .catch(() => {
        void cargarBancoOffline();
      });
  }, [encolarSinDuplicado]);

  const [avisoFlotante, setAvisoFlotante] = useState<string | null>(
    '¡Lanza el dado astral para comenzar tu viaje por Letralia!',
  );

  /* ── Modal "Altar de Decodificación" y Códice ── */
  const [modalActivo, setModalActivo] = useState<ModalRetoActivo | null>(null);
  const [mostrarCodice, setMostrarCodice] = useState(false);
  const [victoriaFinal, setVictoriaFinal] = useState(false);

  /* ── Bancos de preguntas usados para no repetir ── */
  const usadosIntruso = useRef<Set<string>>(new Set());
  const usadosPuente = useRef<Set<string>>(new Set());
  const usadosTormenta = useRef<Set<string>>(new Set());
  const usadosGuardian = useRef<Set<string>>(new Set());

  // Ruta activa según la rama elegida
  const rutaActiva = useMemo(() => construirRuta(ramaElegida), [ramaElegida]);

  // Índice efectivo (0..16)
  const indiceEfectivo = useMemo(() => {
    if (!casillaActual) return 0;
    const idx = rutaActiva.findIndex((c) => c.id === casillaActual.id);
    return idx === -1 ? 0 : idx + 1;
  }, [casillaActual, rutaActiva]);

  useEffect(() => {
    onPositionChange?.(Math.max(0, indiceEfectivo - 1));
  }, [indiceEfectivo, onPositionChange]);

  const cantidadSilabas = useMemo(
    () => silabasObtenidas.filter(Boolean).length,
    [silabasObtenidas],
  );
  const santuarioAbierto = cantidadSilabas === 4;
  const progresoPct = Math.min(100, Math.round((indiceEfectivo / TOTAL_RECORRIDO) * 100));

  /**
   * Guarda en Supabase la suma: (Estrellas Regulares por %) + (4 Estrellas Fijas del Guardián Final)
   */
  const guardarProgresoLetralia = useCallback(
    async (aciertosActuales: number, totalActuales: number) => {
      const estrellasRegulares = calcularEstrellasPorPorcentaje(aciertosActuales, totalActuales);
      const estrellasTotales = estrellasRegulares + BONUS_JEFE_FINAL;

      setEstrellasRegularesFinal(estrellasRegulares);
      setEstrellasTotalesFinal(estrellasTotales);

      const userId = (user as any)?.id;
      if (!userId || typeof userId !== 'string') {
        console.error('❌ No se puede guardar en Supabase: Usuario sin ID válido.');
        return estrellasTotales;
      }

      setGuardandoBD(true);
      try {
        await guardarProgresoHibrido(userId, resolvedLevelId, true, estrellasTotales);
      } catch (error) {
        console.error('❌ Error al guardar progreso en Letralia:', error);
      } finally {
        setGuardandoBD(false);
      }

      return estrellasTotales;
    },
    [user, resolvedLevelId],
  );

  /* ── Determinar qué Sílaba Clave corresponde otorgar según el tramo ── */
  const determinarSilabaPendiente = useCallback(
    (destino: Casilla, estadoSilabas: [boolean, boolean, boolean, boolean]): { slot: 0 | 1 | 2 | 3; texto: string } | null => {
      if (destino.tramo === 'start' && !estadoSilabas[0]) {
        return { slot: 0, texto: palabraActual.silabas[0] };
      }
      if (destino.tramo !== 'start' && destino.tramo !== 'boss') {
        if (!estadoSilabas[0]) {
          return { slot: 0, texto: palabraActual.silabas[0] };
        }
        if (destino.indice >= 3 && !estadoSilabas[1]) {
          return { slot: 1, texto: palabraActual.silabas[1] };
        }
        if (destino.indice >= 6 && !estadoSilabas[2]) {
          return { slot: 2, texto: palabraActual.silabas[2] };
        }
        if (destino.indice === 10 && !estadoSilabas[3]) {
          return { slot: 3, texto: palabraActual.silabas[3] };
        }
      }
      return null;
    },
    [palabraActual],
  );

  /* ── Abrir el reto correspondiente a una casilla ── */
  const activarRetoCasilla = useCallback(
    (casilla: Casilla, estadoSilabasActual: [boolean, boolean, boolean, boolean]) => {
      const silabaInfo = determinarSilabaPendiente(casilla, estadoSilabasActual);

      if (casilla.tipo === 'encrucijada') {
        setEligiendoRama(true);
        setAvisoFlotante('¡Llegaste a la Encrucijada Astral! Haz clic en una de las 3 flechas para elegir tu sendero.');
        return;
      }

      if (casilla.tipo === 'boss') {
        const faltaIdx = estadoSilabasActual.findIndex((s) => !s);
        if (faltaIdx !== -1) {
          const puenteIA = tomarDeColaSinRepetir(colaPuentesIARef.current, (x) => x.ordenCorrecto.join(' '));
          const retoPuente = puenteIA ?? elegirSinRepetir(RETOS_PUENTE, usadosPuente.current);
          firmasUsadasIARef.current.add(retoPuente.ordenCorrecto.join(' ').toLowerCase());
          setAvisoFlotante(`¡Decodifica la sílaba faltante «${palabraActual.silabas[faltaIdx]}» para abrir el Santuario!`);
          setModalActivo({
            tipo: 'puente',
            reto: retoPuente,
            esPortal: true,
            otorgaSilaba: palabraActual.silabas[faltaIdx],
          });
          return;
        }
        const bossIA = tomarDeColaSinRepetir(colaBossLetraliaIARef.current, (x) => x.titulo);
        const retoBoss = bossIA ?? elegirSinRepetir(RETOS_GUARDIAN, usadosGuardian.current);
        firmasUsadasIARef.current.add(retoBoss.titulo.toLowerCase());
        setModalActivo({ tipo: 'boss', reto: retoBoss });
        return;
      }

      if (casilla.mecanica === 'tormenta') {
        const filtro =
          ramaElegida === 'left'
            ? (r: (typeof RETOS_TORMENTA)[number]) =>
                r.tipo === 'agudas' || r.tipo === 'graves' || r.tipo === 'esdrujulas'
            : ramaElegida === 'right'
              ? (r: (typeof RETOS_TORMENTA)[number]) => r.tipo === 'sinonimos' || r.tipo === 'antonimos'
              : undefined;
        const tormentaIA = tomarDeColaSinRepetir(colaTormentasIARef.current, (x) => x.consigna);
        const retoTormenta = tormentaIA ?? elegirSinRepetir(RETOS_TORMENTA, usadosTormenta.current, filtro);
        firmasUsadasIARef.current.add(retoTormenta.consigna.toLowerCase());
        setModalActivo({ tipo: 'tormenta', reto: retoTormenta });
        return;
      }

      if (casilla.mecanica === 'puente' || casilla.mecanica === 'portal') {
        const puenteIA = tomarDeColaSinRepetir(colaPuentesIARef.current, (x) => x.ordenCorrecto.join(' '));
        const retoPuente = puenteIA ?? elegirSinRepetir(RETOS_PUENTE, usadosPuente.current);
        firmasUsadasIARef.current.add(retoPuente.ordenCorrecto.join(' ').toLowerCase());
        setModalActivo({
          tipo: 'puente',
          reto: retoPuente,
          esPortal: casilla.tipo === 'portal',
          otorgaSilaba: silabaInfo?.texto ?? null,
        });
        return;
      }

      const retoIA = tomarDeColaSinRepetir(colaRetosIARef.current, (x) => x.palabras.join(' '));
      const retoIntruso = retoIA ?? elegirSinRepetir(RETOS_INTRUSO, usadosIntruso.current);
      firmasUsadasIARef.current.add(retoIntruso.palabras.join(' ').toLowerCase());
      setModalActivo({
        tipo: 'intruso',
        reto: retoIntruso,
        otorgaSilaba: silabaInfo?.texto ?? null,
      });
    },
    [determinarSilabaPendiente, palabraActual, ramaElegida, tomarDeColaSinRepetir],
  );

  /* ── Animación paso a paso de El Viajero sobre una secuencia de casillas ── */
  const caminarSecuencia = useCallback(
    (secuencia: Casilla[], alFinalizar: (ultima: Casilla) => void) => {
      if (secuencia.length === 0) return;
      setCaminando(true);
      let idx = 0;

      const darPaso = () => {
        const destino = secuencia[idx];
        setPosPantalla((prev) => {
          const dx = destino.s.x - prev.x;
          if (Math.abs(dx) > 2) setMirando(dx >= 0 ? 1 : -1);
          return destino.s;
        });
        setSaltoKey((k) => k + 1);
        setCasillaActual(destino);
        setVisitadas((prev) => {
          const nuevo = new Set(prev);
          nuevo.add(destino.id);
          return nuevo;
        });
        playStep();
        setRastroG((prev) => {
          const ultimo = prev[prev.length - 1];
          if (ultimo && Math.hypot(ultimo.x - destino.g.x, ultimo.y - destino.g.y) < 2) {
            return prev;
          }
          return [...prev, destino.g];
        });

        idx++;
        if (idx < secuencia.length) {
          setTimeout(darPaso, 350);
        } else {
          setTimeout(() => {
            setCaminando(false);
            alFinalizar(destino);
          }, 360);
        }
      };

      darPaso();
    },
    [],
  );

  /* ── Lanzar el Dado ── */
  const handleLanzarDado = useCallback(() => {
    if (rodandoDado || caminando || eligiendoRama || modalActivo !== null || victoriaFinal) return;
    if (casillaActual?.id === 'start_5' && !ramaElegida) {
      setEligiendoRama(true);
      return;
    }
    const tirada = Math.floor(Math.random() * 6) + 1;
    setResultadoDado(tirada);
    setRodandoDado(true);
    playDiceRoll();
    setAvisoFlotante('Rodando el dado astral...');
  }, [rodandoDado, caminando, eligiendoRama, modalActivo, victoriaFinal, casillaActual, ramaElegida]);

  /* ── Cuando el Dado 3D termina de girar ── */
  const handleDadoCompletado = useCallback(() => {
    setRodandoDado(false);
    playDiceLand();
    setTurno((t) => t + 1);

    if (!ramaElegida) {
      const idxActual = casillaActual
        ? CASILLAS_START.findIndex((c) => c.id === casillaActual.id)
        : -1;
      const idxDestino = idxActual + resultadoDado;

      if (idxDestino >= 4) {
        const pasosHastaEncrucijada = CASILLAS_START.slice(idxActual + 1, 5);
        const sobrantes = Math.max(0, idxDestino - 4);
        setPasosRestantesTrasRama(sobrantes);

        caminarSecuencia(pasosHastaEncrucijada, () => {
          setEligiendoRama(true);
          setAvisoFlotante(
            sobrantes > 0
              ? `¡Encrucijada Astral! Elige una flecha para continuar tus ${sobrantes} paso${sobrantes === 1 ? '' : 's'} restante${sobrantes === 1 ? '' : 's'}.`
              : '¡Encrucijada Astral! Haz clic en una de las 3 flechas flotantes para elegir tu camino.',
          );
        });
      } else {
        const pasos = CASILLAS_START.slice(idxActual + 1, idxDestino + 1);
        caminarSecuencia(pasos, (ultima) => {
          activarRetoCasilla(ultima, silabasObtenidas);
        });
      }
      return;
    }

    const ruta = construirRuta(ramaElegida);
    const idxActual = casillaActual ? ruta.findIndex((c) => c.id === casillaActual.id) : 4;
    let idxDestino = Math.min(ruta.length - 1, idxActual + resultadoDado);

    if (idxActual < 14 && idxDestino > 14 && !silabasObtenidas[3]) {
      idxDestino = 14;
    }

    const pasos = ruta.slice(idxActual + 1, idxDestino + 1);
    if (pasos.length === 0) {
      activarRetoCasilla(CASILLA_BOSS, silabasObtenidas);
      return;
    }

    caminarSecuencia(pasos, (ultima) => {
      activarRetoCasilla(ultima, silabasObtenidas);
    });
  }, [
    ramaElegida,
    casillaActual,
    resultadoDado,
    caminarSecuencia,
    activarRetoCasilla,
    silabasObtenidas,
  ]);

  /* ── Elegir una de las 3 Flechas en `start_5` ── */
  const handleElegirRama = useCallback(
    (rama: Rama) => {
      setRamaElegida(rama);
      setEligiendoRama(false);
      const info = INFO_RAMA[rama];

      if (pasosRestantesTrasRama > 0) {
        const cant = Math.min(10, pasosRestantesTrasRama);
        const pasosRama = CASILLAS_RAMA[rama].slice(0, cant);
        setPasosRestantesTrasRama(0);
        setAvisoFlotante(`Elegiste: ${info.nombre}. ¡Continuando recorrido!`);
        caminarSecuencia(pasosRama, (ultima) => {
          activarRetoCasilla(ultima, silabasObtenidas);
        });
      } else {
        setAvisoFlotante(`Sendero elegido: ${info.nombre}. ¡Lanza el dado para avanzar!`);
      }
    },
    [pasosRestantesTrasRama, caminarSecuencia, activarRetoCasilla, silabasObtenidas],
  );

  /* ── Procesar resultado al cerrar el modal "Altar de Decodificación" ── */
  const handleCompletarReto = useCallback(
    async (res: ResultadoAltar) => {
      setModalActivo(null);

      // Si NO es el jefe final, contabilizamos la pregunta regular para el porcentaje
      let nuevosAciertos = aciertosTotales;
      let nuevoTotal = totalPreguntas;

      if (!res.esBossFinal) {
        nuevoTotal = totalPreguntas + 1;
        setTotalPreguntas(nuevoTotal);
        if (res.exito) {
          nuevosAciertos = aciertosTotales + 1;
          setAciertosTotales(nuevosAciertos);
          playCorrect();
        } else {
          playIncorrect();
        }

        const nuevaRacha = res.exito ? rachaIA + 1 : 0;
        setRachaIA(nuevaRacha);

        if (hayConexionInternet()) {
          void fetch('/api/tutor-ia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              estudianteNombre: user?.name || 'Explorador',
              planeta: 'Letralia',
              nivelActual: nivelIA,
              esCorrecta: res.exito,
              rachaAciertos: nuevaRacha,
              aciertos: nuevosAciertos,
              totalPreguntas: nuevoTotal,
              modeloPreferido: 'gemini-4-hydrogen',
              evitarTextos: Array.from(firmasUsadasIARef.current),
            }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data?.ok) {
                void cachearPackIAOffline('Letralia', data);
                setNivelIA(data.nuevoNivel);
                setEtiquetaNivelIA(data.etiquetaNivel);
                setMensajeTutorIA(data.mensajeTutor);
                if (data.nuevoRetoLetralia?.palabras?.length) {
                  encolarSinDuplicado(colaRetosIARef.current, data.nuevoRetoLetralia as RetoIntruso, (x) => x.palabras.join(' '));
                }
                if (data.nuevoRetoPuenteLetralia?.ordenCorrecto?.length) {
                  encolarSinDuplicado(colaPuentesIARef.current, data.nuevoRetoPuenteLetralia as RetoPuenteSintactico, (x) => x.ordenCorrecto.join(' '));
                }
                if (data.nuevoRetoTormentaLetralia?.palabras?.length) {
                  encolarSinDuplicado(colaTormentasIARef.current, data.nuevoRetoTormentaLetralia as RetoTormenta, (x) => x.consigna);
                }
                if (data.nuevoRetoBossLetralia?.fases?.length) {
                  encolarSinDuplicado(colaBossLetraliaIARef.current, data.nuevoRetoBossLetralia as RetoGuardianBoss, (x) => x.titulo);
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
        } else {
          setMensajeTutorIA(
            res.exito
              ? '¡Muy bien! Reto completado en modo sin conexión.'
              : 'Buen intento. Seguimos practicando lectura sin conexión.',
          );
        }
      }

      if (res.exito && casillaActual) {
        setCompletadas((prev) => {
          const nuevo = new Set(prev);
          nuevo.add(casillaActual.id);
          return nuevo;
        });
      }

      // Actualizar Sílabas Clave si obtuvo una
      const nuevasSilabas = [...silabasObtenidas] as [boolean, boolean, boolean, boolean];
      if (res.exito && res.silabaObtenida) {
        const idxSilaba = palabraActual.silabas.findIndex(
          (s, i) => s === res.silabaObtenida && !nuevasSilabas[i],
        );
        if (idxSilaba !== -1) {
          nuevasSilabas[idxSilaba] = true;
          setSilabasObtenidas(nuevasSilabas);
          setAvisoFlotante(
            `¡Obtuviste el Cristal de Sílaba «${res.silabaObtenida}» (${
              nuevasSilabas.filter(Boolean).length
            }/4)!`,
          );
        }
      }

      // Si completó el duelo del Guardián Final -> Calculamos estrellas y guardamos en Supabase
      if (res.esBossFinal && res.exito) {
        await guardarProgresoLetralia(nuevosAciertos, nuevoTotal);
        setVictoriaFinal(true);
        playStarWin();
        setAvisoFlotante('¡Has restaurado el Archivo Astral de Letralia!');
        return;
      }

      // Si estaba en `boss_36` desbloqueando una sílaba pendiente y ya completó las 4, abrir el duelo del Guardián
      if (casillaActual?.id === 'boss_36' && nuevasSilabas.every(Boolean)) {
        setTimeout(() => {
          const bossIA = colaBossLetraliaIARef.current.shift();
          const retoBoss = bossIA ?? elegirSinRepetir(RETOS_GUARDIAN, usadosGuardian.current);
          setModalActivo({ tipo: 'boss', reto: retoBoss });
        }, 450);
        return;
      }

      // Si hubo desplazamiento extra por Tormenta Acústica (+1 o -1 casilla)
      if (res.desplazamientoExtra && ramaElegida && casillaActual) {
        const ruta = construirRuta(ramaElegida);
        const idxActual = ruta.findIndex((c) => c.id === casillaActual.id);
        const nuevoIdx = Math.max(0, Math.min(ruta.length - 1, idxActual + res.desplazamientoExtra));
        if (nuevoIdx !== idxActual) {
          const destinoExtra = ruta[nuevoIdx];
          setAvisoFlotante(
            res.desplazamientoExtra > 0
              ? '¡Impulso de Escudo Astral! Avanzas +1 casilla extra.'
              : 'La tormenta acústica te hizo retroceder 1 casilla.',
          );
          setTimeout(() => {
            caminarSecuencia([destinoExtra], (ult) => {
              if (ult.tipo === 'portal' && !nuevasSilabas[3]) {
                activarRetoCasilla(ult, nuevasSilabas);
              }
            });
          }, 320);
        }
      }
    },
    [
      aciertosTotales,
      totalPreguntas,
      casillaActual,
      silabasObtenidas,
      palabraActual,
      ramaElegida,
      caminarSecuencia,
      activarRetoCasilla,
      guardarProgresoLetralia,
    ],
  );

  /* ── Guardar y redirigir al Dashboard ── */
  const handleIrAlDashboard = useCallback(async () => {
    await guardarProgresoLetralia(aciertosTotales, totalPreguntas);
    router.refresh();
    router.push('/dashboard');
  }, [guardarProgresoLetralia, aciertosTotales, totalPreguntas, router]);

  /* ── Reiniciar partida con nueva palabra llave ── */
  const handleNuevaPartida = useCallback(() => {
    setIndicePalabraLlave((i) => i + 1);
    setRamaElegida(null);
    setCasillaActual(null);
    setPosPantalla(ORIGEN_S);
    setRastroG([ORIGEN_G]);
    setVisitadas(new Set());
    setCompletadas(new Set());
    setSilabasObtenidas([false, false, false, false]);
    setEligiendoRama(false);
    setPasosRestantesTrasRama(0);
    setTurno(1);
    setAciertosTotales(0);
    setTotalPreguntas(0);
    setVictoriaFinal(false);
    setModalActivo(null);
    setAvisoFlotante('¡Nueva expedición iniciada! Lanza el dado astral.');
  }, []);

  const nombreTramoActual = useMemo(() => {
    if (!casillaActual || casillaActual.tramo === 'start') return 'Camino Principal Inicial';
    if (casillaActual.tramo === 'boss') return 'Santuario del Guardián';
    return INFO_RAMA[casillaActual.tramo].corto;
  }, [casillaActual]);

  const estrellasVistaPrevia = useMemo(
    () =>
       victoriaFinal
        ? estrellasTotalesFinal
        : totalPreguntas > 0
          ? calcularEstrellasPorPorcentaje(aciertosTotales, totalPreguntas)
          : 0,
    [victoriaFinal, estrellasTotalesFinal, totalPreguntas, aciertosTotales],
  );

  const isEco = useSettingsStore((s) => s.designMode === 'eco');

  return (
    <div
      data-game-board="true"
      className="relative w-full h-full flex flex-col lg:flex-row overflow-hidden select-none"
      style={{
        background: isEco
          ? '#0A0E2A'
          : 'radial-gradient(ellipse at 42% 44%, #1A204E 0%, #0D1134 58%, #070922 100%)',
      }}
    >
      {/* Fondo de curvas 3D tornasol amatista/oro de Letralia debajo del mapa */}
      <img
        src="/images/letralia-board-bg.jpg"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-center ${
          isEco ? 'opacity-80' : 'opacity-95 mix-blend-screen'
        }`}
      />

      {/* Destellos estelares finos en el cielo crepuscular (omitidos en Modo Ahorro) */}
      {!isEco && [
        { x: '8%', y: '14%', size: 6, color: 'rgba(192, 132, 252, 0.9)', dur: '6.0s', delay: '-1.0s' },
        { x: '70%', y: '14%', size: 6, color: 'rgba(253, 224, 171, 0.9)', dur: '6.8s', delay: '-2.9s' },
        { x: '12%', y: '82%', size: 6, color: 'rgba(167, 139, 250, 0.9)', dur: '5.7s', delay: '-4.1s' },
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
      {/* ════════════════════ ÁREA PRINCIPAL DEL MAPA ASTRAL (IZQUIERDA/CENTRO) ════════════════════ */}
      <div className="relative flex-1 h-[62vh] lg:h-full overflow-hidden flex items-center justify-center">
        {/* ── Botón Flotante Superior Izquierda: Volver al Mapa ── */}
        <div className="absolute top-3.5 left-3.5 z-30 flex items-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm text-[#1E1B4B] cursor-pointer transition-shadow"
            style={{
              background: 'linear-gradient(180deg, #FFFDF7 0%, #F7E8CA 70%, #EAD3AB 100%)',
              border: '2px solid #9A7B56',
              boxShadow: '0 3px 0 #6E543C, 0 8px 20px rgba(15, 23, 42, 0.35), inset 0 1px 0 #FFFFFF',
            }}
          >
            <span>←</span>
            <span className="hidden sm:inline">Mapa</span>
          </motion.button>
        </div>

        {/* ── Cartel Central Superior "TURNO ↻" ── */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
          <div className="flex items-start">
            <div
              className="hidden sm:flex h-8 w-10 items-center justify-center rounded-bl-xl border-b-2 border-l-2 border-[#8B7CC0]"
              style={{
                background: 'linear-gradient(180deg, #EDE9FE 0%, #C4B5FD 100%)',
                transform: 'skewX(18deg)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
              }}
            >
              <span className="text-[11px] text-white drop-shadow" style={{ transform: 'skewX(-18deg)' }}>
                ✦
              </span>
            </div>

            <div
              className="px-7 sm:px-9 py-1.5 rounded-b-2xl border-x-2 border-b-2 border-[#9A7B56] flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(180deg, #FFFDF7 0%, #F6E4C4 100%)',
                boxShadow: '0 4px 0 #7C6143, 0 10px 24px rgba(15, 23, 42, 0.4), inset 0 1px 0 #FFFFFF',
              }}
            >
              <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-[#2E2546]">
                TURNO {turno}
              </span>
              <span className="w-5 h-5 rounded-full bg-[#EAD2AE] border border-[#9A7B56] flex items-center justify-center text-xs font-black text-[#2E2546] shadow-inner">
                ↻
              </span>
            </div>

            <div
              className="hidden sm:flex h-8 w-10 items-center justify-center rounded-br-xl border-b-2 border-r-2 border-[#8B7CC0]"
              style={{
                background: 'linear-gradient(180deg, #EDE9FE 0%, #C4B5FD 100%)',
                transform: 'skewX(-18deg)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
              }}
            >
              <span className="text-[11px] text-white drop-shadow" style={{ transform: 'skewX(18deg)' }}>
                ✦
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            {[0, 1, 2, 3].map((i) => {
              const activo = (turno - 1) % 4 === i;
              return (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: activo ? '#FDBA74' : 'rgba(226, 232, 240, 0.65)',
                    boxShadow: activo ? '0 0 10px #FDBA74' : 'none',
                    transform: activo ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ── Lienzo SVG del Mapa Astral de 36 casillas ── */}
        <div className="w-full h-full flex items-center justify-center p-1 sm:p-3">
          <MapaAstral
            rama={ramaElegida}
            posS={posPantalla}
            rastroG={rastroG}
            visitadas={visitadas}
            completadas={completadas}
            activaId={casillaActual?.id ?? null}
            eligiendo={eligiendoRama}
            onElegir={handleElegirRama}
            caminando={caminando}
            mirando={mirando}
            saltoKey={saltoKey}
            santuarioAbierto={santuarioAbierto}
          />
        </div>

        {/* ── Banner de aviso/guía inferior sobre el mapa ── */}
        <div className="pointer-events-none absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 w-max max-w-[92%] sm:max-w-lg">
          <AnimatePresence mode="wait">
            {avisoFlotante && (
              <motion.div
                key={avisoFlotante}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`px-5 py-2 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#FDF6E3] text-center ${isEco ? '' : 'backdrop-blur-md'}`}
                style={{
                  background: isEco
                    ? 'rgba(35, 47, 82, 0.96)'
                    : 'linear-gradient(135deg, rgba(35, 47, 82, 0.92) 0%, rgba(49, 46, 129, 0.88) 100%)',
                  border: '2px solid rgba(196, 181, 253, 0.8)',
                  boxShadow: isEco
                    ? '0 6px 16px rgba(15, 23, 42, 0.45)'
                    : '0 10px 28px rgba(15, 23, 42, 0.55), 0 0 18px rgba(167, 139, 250, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
                }}
              >
                <span className="text-[#7DD3FC]">✦</span>
                <span>{avisoFlotante}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ════════════════════ HUD ESPACIAL LATERAL DERECHO EN CRISTAL ASTRAL ════════════════════ */}
      <aside className="relative z-30 w-full lg:w-[334px] xl:w-[354px] lg:h-full p-2 sm:p-3 flex flex-col justify-center shrink-0">
        <div
          className={`relative w-full h-full max-h-[830px] rounded-[30px] p-3.5 sm:p-4 flex flex-col justify-between overflow-y-auto ${isEco ? '' : 'backdrop-blur-lg'}`}
          style={{
            background: isEco
              ? 'rgba(238, 233, 253, 0.95)'
              : 'linear-gradient(180deg, rgba(246, 242, 255, 0.84) 0%, rgba(232, 224, 252, 0.78) 52%, rgba(216, 204, 248, 0.82) 100%)',
            border: '2px solid rgba(221, 214, 254, 0.85)',
            boxShadow: isEco
              ? '0 12px 24px -10px rgba(8, 11, 32, 0.55)'
              : 'inset 0 0 24px rgba(255, 255, 255, 0.75), inset 0 0 0 1px rgba(253, 230, 138, 0.35), 0 24px 64px -18px rgba(8, 11, 32, 0.75)',
          }}
        >
          <div className="hidden lg:flex absolute left-1.5 top-1/2 -translate-y-1/2 text-[#7C6BC9] text-xs font-black select-none">
            ◀
          </div>

          {/* ── 1. CABECERA: LETRALIA — ARCHIVO ASTRAL ── */}
          <div className="relative text-center pt-0.5 pb-2.5 border-b-2 border-[#C4B5FD]/80">
            <div className="absolute right-0 top-0">
              <SoundTogglePill />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-wider leading-none select-none"
              style={{
                color: '#EDE9FE',
                WebkitTextStroke: '1.5px #312E81',
                textShadow: '0 3px 0 #312E81, 0 5px 12px rgba(49, 46, 129, 0.32)',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              LETRALIA
            </h1>
            <p className="mt-1 text-[11px] font-black tracking-[0.24em] text-[#312E81] uppercase">
              ARCHIVO ASTRAL
            </p>
            <div
              className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#1E1B4B]"
              style={{
                background: 'linear-gradient(180deg, #F5F3FF 0%, #DDD6FE 100%)',
                border: '1.5px solid #A78BFA',
                boxShadow: 'inset 0 1px 0 #FFFFFF, 0 2px 6px rgba(109, 40, 217, 0.12)',
              }}
            >
              <span className="text-[#6D28D9]">◈</span>
              <span>{nombreTramoActual}</span>
            </div>
            <div className="mt-1.5 text-[10px] font-bold text-[#4C1D95]">
              Tutor IA · {etiquetaNivelIA}
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-[#1E1B4B] leading-snug line-clamp-2">
              {mensajeTutorIA}
            </p>
          </div>

          {/* ── 2. CUENCO DEL DADO 3D ASTRAL ── */}
          <div
            className="relative my-2 py-3.5 rounded-2xl flex flex-col items-center justify-center overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, #9EB2E2 0%, #748BC2 58%, #576CA4 100%)',
              border: '2.5px solid #B6C5EE',
              boxShadow:
                'inset 0 4px 16px rgba(30, 41, 59, 0.38), 0 4px 12px rgba(49, 46, 129, 0.16)',
            }}
          >
            {/* Halo luminoso detrás del dado */}
            <div
              className="pointer-events-none absolute w-32 h-32 rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(237, 233, 254, 0.72) 0%, rgba(237, 233, 254, 0.2) 45%, transparent 72%)',
              }}
            />
            <span className="pointer-events-none absolute top-2 left-3.5 text-white/85 text-xs drop-shadow">
              ✦
            </span>
            <span className="pointer-events-none absolute top-2.5 right-4 text-amber-200/80 text-[10px]">
              ★
            </span>
            <span className="pointer-events-none absolute bottom-2 left-4 text-sky-100/75 text-[10px]">
              ✧
            </span>
            <span className="pointer-events-none absolute bottom-2 right-3.5 text-white/85 text-xs drop-shadow">
              ✦
            </span>
            <div
              onClick={handleLanzarDado}
              className={`relative z-10 ${
                rodandoDado || caminando || eligiendoRama
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              title="Haz clic para lanzar el dado"
            >
              <Dado3D
                size={84}
                rolling={rodandoDado}
                result={resultadoDado}
                onRollComplete={handleDadoCompletado}
                faceColor="#F5F3FF"
                borderColor="#A78BFA"
                pipColor="#312E81"
              />
            </div>
          </div>

          {/* ── 3. CUERPO DE PERGAMINO: PROGRESO + 4 RANURAS DE SÍLABAS CLAVE ── */}
          <div
            className="relative rounded-2xl p-3 sm:p-3.5 my-1"
            style={{
              background: 'linear-gradient(180deg, #FFFDF7 0%, #FBF1DC 55%, #F3E2C3 100%)',
              border: '2.5px solid #D2B88F',
              boxShadow:
                'inset 0 1px 0 #FFFFFF, 0 6px 16px rgba(92, 68, 40, 0.14)',
            }}
          >
            <span className="hidden sm:block absolute -left-1.5 top-8 w-3 h-3 rotate-45 bg-[#E5DEFC] border-r-2 border-t-2 border-[#D2B88F]" />
            <span className="hidden sm:block absolute -right-1.5 top-16 w-3 h-3 rotate-45 bg-[#E5DEFC] border-l-2 border-b-2 border-[#D2B88F]" />

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black tracking-wider text-[#2E2546] uppercase">
                  PROGRESO
                </span>
                <span className="text-xs font-extrabold text-[#4C1D95]">
                  {progresoPct}% ({indiceEfectivo}/{TOTAL_RECORRIDO})
                </span>
              </div>
              <div className="relative h-5 rounded-full bg-[#E2CEAA] border-2 border-[#8C6D53] p-0.5 shadow-inner">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.max(6, progresoPct)}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    background:
                      'linear-gradient(90deg, #A78BFA 0%, #F472B6 52%, #FBBF24 100%)',
                    boxShadow: '0 0 8px rgba(244, 114, 182, 0.45)',
                  }}
                />
                {[31, 68, 96].map((posPct, idx) => {
                  const alcanzada = progresoPct >= posPct;
                  return (
                    <span
                      key={idx}
                      className="absolute -bottom-2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shadow"
                      style={{
                        left: `${posPct}%`,
                        background: alcanzada ? '#FDE68A' : '#EDE9FE',
                        color: alcanzada ? '#92400E' : '#6D5BA8',
                        border: '1.5px solid #6D5BA8',
                      }}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black tracking-wider text-[#2E2546] uppercase">
                  SÍLABAS CLAVE
                </span>
                <span className="text-[11px] font-extrabold text-[#065F46] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full border border-[#34D399] shadow-2xs">
                  {cantidadSilabas}/4 Cristales
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {palabraActual.silabas.map((sil, idx) => {
                  const obtenida = silabasObtenidas[idx];
                  return (
                    <motion.div
                      key={idx}
                      animate={obtenida ? { scale: [1, 1.08, 1] } : undefined}
                      className="relative rounded-xl p-1.5 flex flex-col items-center justify-between min-h-[76px] transition-all"
                      style={{
                        background: obtenida
                          ? 'linear-gradient(180deg, #FFFFFF 0%, #FEF3C7 100%)'
                          : 'linear-gradient(180deg, #EFE0C4 0%, #E4D0AE 100%)',
                        border: obtenida ? '2px solid #38BDF8' : '2px solid #C8B28E',
                        boxShadow: obtenida
                          ? '0 0 14px rgba(56, 189, 248, 0.45), inset 0 1px 0 #FFFFFF'
                          : 'inset 0 2px 4px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <IconoCristal indice={idx} activo={obtenida} />
                      <span
                        className={`mt-0.5 text-xs font-black tracking-wide px-1.5 py-0.5 rounded ${
                          obtenida
                            ? 'bg-[#312E81] text-[#FDF6E3] shadow-2xs'
                            : 'text-[#8C6D53]/75'
                        }`}
                      >
                        {obtenida ? sil : `?`}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div
                className="mt-2.5 rounded-xl px-3 py-2 flex items-center justify-between gap-2 border-2 transition-all"
                style={{
                  background: santuarioAbierto
                    ? 'linear-gradient(90deg, #D1FAE5 0%, #E0F2FE 100%)'
                    : 'linear-gradient(180deg, #F5E8CE 0%, #EAD8B8 100%)',
                  borderColor: santuarioAbierto ? '#34D399' : '#D5C3A1',
                  boxShadow: santuarioAbierto
                    ? '0 0 16px rgba(52, 211, 153, 0.5)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rotate-45 rounded-[2px] shrink-0"
                    style={{ background: santuarioAbierto ? '#10B981' : '#8C6D53' }}
                  />
                  <div className="leading-tight min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B]">
                      {santuarioAbierto ? '¡Llave del Guardián Activa!' : 'Llave del Santuario'}
                    </p>
                    <p className="text-[11px] font-extrabold text-[#4C1D95] truncate">
                      {santuarioAbierto
                        ? palabraActual.silabas.join(' · ')
                        : 'Reúne las 4 sílabas en el camino'}
                    </p>
                  </div>
                </div>
                {estrellasVistaPrevia > 0 && (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-xs font-black text-amber-950 bg-amber-200 border border-amber-400 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <span>★</span>
                    <span>{estrellasVistaPrevia}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── 4. BOTONES DE ACCIÓN INFERIORES ── */}
          <div className="flex flex-col gap-2.5 mt-2">
            <motion.button
              type="button"
              whileHover={
                rodandoDado || caminando || eligiendoRama ? undefined : { scale: 1.02, y: -1 }
              }
              whileTap={
                rodandoDado || caminando || eligiendoRama ? undefined : { scale: 0.97 }
              }
              onClick={handleLanzarDado}
              disabled={rodandoDado || caminando || eligiendoRama}
              className="w-full py-3 rounded-2xl font-black text-sm sm:text-base tracking-widest uppercase transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(180deg, #FFF5E4 0%, #F6DCA9 52%, #E5BE83 100%)',
                border: '2.5px solid #6E5648',
                boxShadow: '0 4px 0 #6E5648, inset 0 1px 0 #FFFFFF',
                color: '#2E2546',
              }}
            >
              {rodandoDado
                ? 'RODANDO...'
                : caminando
                  ? 'AVANZANDO...'
                  : eligiendoRama
                    ? 'ELIGE TU CAMINO'
                    : 'LANZAR DADO'}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMostrarCodice(true)}
              className="w-full py-2.5 rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #F3EFFE 0%, #DDD6FE 52%, #C4B5FD 100%)',
                border: '2.5px solid #62519E',
                boxShadow: '0 4px 0 #62519E, inset 0 1px 0 #FFFFFF',
                color: '#2E2546',
              }}
            >
              SÍLABAS Y GUÍA
            </motion.button>
          </div>
        </div>
      </aside>

      {/* ════════════════════ MODAL "ALTAR DE DECODIFICACIÓN" ════════════════════ */}
      <AnimatePresence>
        {modalActivo && (
          <AltarDecodificacion
            modal={modalActivo}
            estrellasActuales={estrellasVistaPrevia}
            silabasRecolectadas={cantidadSilabas}
            onCompletar={handleCompletarReto}
          />
        )}
      </AnimatePresence>

      {/* ════════════════════ MODAL CÓDICE / GUÍA DEL ARCHIVO ASTRAL ════════════════════ */}
      <AnimatePresence>
        {mostrarCodice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setMostrarCodice(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl p-6 bg-[#FDF6E3] border-4 border-[#A5B4FC] text-[#1E1B4B] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b-2 border-[#E6D5B8] pb-3 mb-4">
                <h3 className="text-lg sm:text-xl font-black tracking-wide">
                  Códice del Viajero — Letralia
                </h3>
                <button
                  type="button"
                  onClick={() => setMostrarCodice(false)}
                  className="w-8 h-8 rounded-full bg-violet-200 hover:bg-violet-300 font-black text-indigo-950 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-[#F4E6C8] border border-[#D5BE97]">
                  <p className="font-black text-indigo-950 mb-1">
                    Palabra Llave en decodificación ({cantidadSilabas}/4):
                  </p>
                  <div className="flex gap-2 mt-1">
                    {palabraActual.silabas.map((s, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-lg font-black text-sm border ${
                          silabasObtenidas[i]
                            ? 'bg-emerald-200 border-emerald-500 text-emerald-950'
                            : 'bg-white/70 border-[#C8B28E] text-indigo-950/50'
                        }`}
                      >
                        {silabasObtenidas[i] ? s : '???'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-violet-100 border border-violet-300">
                  <p className="font-black">◈ Losas de Pergamino (A, Ñ, Ω):</p>
                  <p className="text-indigo-950/80">
                    Activan <strong>Caza del Intruso</strong> (ortografía, tildes y concordancia).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300">
                  <p className="font-black">◈ Hexágonos de Cristal (Casillas 3, 6 y Portal 10):</p>
                  <p className="text-indigo-950/80">
                    Activan el <strong>Constructor de Puentes Sintácticos</strong> y entregan una{' '}
                    <strong>Sílaba Clave</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-100 border border-rose-300">
                  <p className="font-black">◈ Hexágonos Coral (Casillas 5 y 9):</p>
                  <p className="text-indigo-950/80">
                    Activan la <strong>Tormenta de Meteoritos Acústicos</strong> (+1 casilla si
                    aciertas las 3 palabras; -1 casilla si fallas).
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarCodice(false)}
                  className="px-6 py-2 rounded-xl bg-[#4C1D95] text-white font-extrabold text-sm cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ PANTALLA DE VICTORIA CON DESGLOSE DE ESTRELLAS ════════════════════ */}
      <AnimatePresence>
        {victoriaFinal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg rounded-[32px] p-6 sm:p-8 text-center bg-[#FDF6E3] border-4 border-[#A5B4FC] text-[#1E1B4B] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            >
              <div className="flex justify-center gap-3 mb-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15 + i * 0.15, type: 'spring', stiffness: 300 }}
                    className="text-4xl sm:text-5xl text-amber-500 drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]"
                  >
                    ★
                  </motion.span>
                ))}
              </div>

              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-200 border border-emerald-400 text-xs font-black uppercase tracking-widest text-emerald-950 mb-2">
                ¡Archivo Astral Restaurado!
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] mb-2">
                ¡Victoria en Letralia!
              </h2>
              <p className="text-sm sm:text-base font-medium text-indigo-950/80 mb-4">
                Superaste el duelo del Guardián del Vórtice Gramatical y reuniste las 4 Sílabas
                Clave del códice:
              </p>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EDE9FE] border-2 border-[#A78BFA] mb-4">
                {palabraActual.silabas.map((sil, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-[#312E81] text-[#FDF6E3] font-black text-base sm:text-lg"
                  >
                    {sil}
                  </span>
                ))}
              </div>

              {/* Desglose de Estrellas según reglas de negocio */}
              <div className="bg-[#F4E6C8] border-2 border-[#D5BE97] rounded-2xl p-3.5 mb-6 text-xs sm:text-sm space-y-1 text-[#1E1B4B]">
                <div className="flex justify-between font-semibold">
                  <span>
                    Preguntas Regulares (
                    {totalPreguntas > 0
                      ? Math.round((aciertosTotales / totalPreguntas) * 100)
                      : 100}
                    % aciertos):
                  </span>
                  <span className="font-black text-amber-800">+{estrellasRegularesFinal} ★</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Bonificación Guardián Final:</span>
                  <span className="font-black text-indigo-900">+{BONUS_JEFE_FINAL} ★</span>
                </div>
                <div className="border-t border-[#D5BE97] pt-1.5 mt-1.5 flex justify-between text-base font-black text-[#4C1D95]">
                  <span>Estrellas Totales del Nivel:</span>
                  <span>★ {estrellasTotalesFinal}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleNuevaPartida}
                  className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-b from-[#FDE68A] to-[#F59E0B] border-2 border-[#92400E] text-[#1E1B4B] shadow-[0_4px_0_#92400E] cursor-pointer"
                >
                  Nueva Partida
                </button>
                <button
                  type="button"
                  disabled={guardandoBD}
                  onClick={handleIrAlDashboard}
                  className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-b from-[#DDD6FE] to-[#A78BFA] border-2 border-[#4C1D95] text-[#1E1B4B] shadow-[0_4px_0_#4C1D95] cursor-pointer disabled:opacity-50"
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