'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  barajar,
  validarPuente,
  type RetoIntruso,
  type RetoPuenteSintactico,
  type RetoTormenta,
  type RetoGuardianBoss,
} from '../../../lib/preguntas-letralia';

export type ModalRetoActivo =
  | { tipo: 'intruso'; reto: RetoIntruso; otorgaSilaba?: string | null }
  | { tipo: 'puente'; reto: RetoPuenteSintactico; esPortal?: boolean; otorgaSilaba?: string | null }
  | { tipo: 'tormenta'; reto: RetoTormenta }
  | { tipo: 'boss'; reto: RetoGuardianBoss };

export interface ResultadoAltar {
  exito: boolean;
  /** +1 en tormenta superada, -1 en tormenta fallida, 0 en el resto */
  desplazamientoExtra?: number;
  silabaObtenida?: string | null;
  esBossFinal?: boolean;
}

interface AltarDecodificacionProps {
  modal: ModalRetoActivo;
  estrellasActuales: number;
  silabasRecolectadas: number;
  onCompletar: (res: ResultadoAltar) => void;
}

const RUNAS_HORIZONTALES = 'R P N Γ R   ⌖   Λ Ψ Ω Δ Σ Φ   ⌖   P M H ⨉ B Δ Σ R N Ω';
const RUNAS_VERTICALES = ['P', 'M', 'K', 'L', 'R', 'P', 'N', 'M', '⌖', 'N', 'M', 'P', 'L', 'K', 'R', 'M'];

const CHISPAS = [
  { x: '16%', y: '30%', s: 4, d: 0 },
  { x: '25%', y: '22%', s: 3, d: 0.4 },
  { x: '36%', y: '44%', s: 3.5, d: 0.8 },
  { x: '48%', y: '20%', s: 4.5, d: 1.1 },
  { x: '58%', y: '42%', s: 3, d: 0.3 },
  { x: '68%', y: '24%', s: 4, d: 0.9 },
  { x: '79%', y: '34%', s: 3.5, d: 1.4 },
  { x: '84%', y: '48%', s: 3, d: 0.6 },
  { x: '20%', y: '54%', s: 3, d: 1.2 },
  { x: '74%', y: '54%', s: 4, d: 0.2 },
];

const ROTACIONES_TABLILLA = [-5, 3.5, -2, 4.5, -4, 2.5];

/** Pluma estelar luminosa de los costados del marco del Altar */
function PlumaEstelar({ lado }: { lado: 'izq' | 'der' }) {
  return (
    <svg
      width="82"
      height="158"
      viewBox="0 0 76 150"
      className="overflow-visible select-none pointer-events-none"
    >
      <defs>
        <linearGradient id={`plumaGrad-${lado}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="38%" stopColor="#7DD3FC" />
          <stop offset="72%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#DDD6FE" />
        </linearGradient>
        <filter id={`plumaGlow-${lado}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        transform={lado === 'der' ? 'translate(76, 0) scale(-1, 1)' : undefined}
        filter={`url(#plumaGlow-${lado})`}
      >
        <path
          d="M12 12 C29 16 53 38 61 76 C53 72 44 68 38 64 C47 76 55 90 61 108 C45 103 33 93 26 82 C33 96 42 110 55 122 C35 116 20 98 14 72 C10 52 9 30 12 12 Z"
          fill={`url(#plumaGrad-${lado})`}
          stroke="#FFFFFF"
          strokeWidth="1.6"
        />
        {/* Venas luminosas internas de la pluma */}
        <path
          d="M21 38 L42 46 M26 56 L49 66 M33 78 L54 88"
          stroke="#FFFFFF"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M14 16 C28 45 45 84 66 138"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/** Tablilla de pergamino crema con bisel 3D cálido y propiedades de borde separadas (React 19 safe). */
function TablillaPergamino({
  texto,
  inclinacion = 0,
  seleccionada = false,
  usadaEnPuente = false,
  estado = 'normal',
  compacta = false,
  onClick,
  disabled = false,
}: {
  texto: string;
  inclinacion?: number;
  seleccionada?: boolean;
  usadaEnPuente?: boolean;
  estado?: 'normal' | 'intruso' | 'correcta' | 'error';
  compacta?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const estilosEstado = {
    normal: {
      bg: seleccionada
        ? 'linear-gradient(180deg, #FFFBEB 0%, #FDE68A 65%, #FCD34D 100%)'
        : 'linear-gradient(180deg, #FFFFFF 0%, #FDF6E3 65%, #EFE0C2 100%)',
      border: seleccionada ? '#F59E0B' : '#DFC8A2',
      bevel: seleccionada ? '#B45309' : '#A98E63',
      text: '#1E1B4B',
      glow: seleccionada
        ? '0 0 24px rgba(251, 191, 36, 0.8), 0 8px 18px rgba(15, 23, 42, 0.42)'
        : '0 8px 18px rgba(15, 23, 42, 0.38), inset 0 1px 0 #FFFFFF',
    },
    intruso: {
      bg: 'linear-gradient(180deg, #FFF1F2 0%, #FFE4E6 68%, #FECDD3 100%)',
      border: '#FDA4AF',
      bevel: '#E11D48',
      text: '#881337',
      glow: '0 0 24px rgba(253, 164, 175, 0.8)',
    },
    correcta: {
      bg: 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 68%, #A7F3D0 100%)',
      border: '#6EE7B7',
      bevel: '#059669',
      text: '#064E3B',
      glow: '0 0 26px rgba(110, 231, 183, 0.88)',
    },
    error: {
      bg: 'linear-gradient(180deg, #FFF1F2 0%, #FECDD3 100%)',
      border: '#FB7185',
      bevel: '#BE123C',
      text: '#881337',
      glow: '0 0 20px rgba(251, 113, 133, 0.7)',
    },
  }[estado];

  return (
    <motion.button
      type="button"
      layout
      whileHover={disabled ? undefined : { scale: 1.06, y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{
        opacity: usadaEnPuente ? 0.32 : 1,
        scale: seleccionada && !usadaEnPuente ? 1.05 : 1,
        rotate: inclinacion,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative group select-none rounded-xl transition-shadow ${
        compacta
          ? 'px-3.5 py-2 text-sm sm:text-base'
          : 'px-5 py-2.5 sm:px-6 sm:py-3 text-base sm:text-xl'
      } font-extrabold tracking-tight ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      style={{
        background: estilosEstado.bg,
        borderTopWidth: '2px',
        borderRightWidth: '2px',
        borderLeftWidth: '2px',
        borderBottomWidth: '6px',
        borderStyle: 'solid',
        borderTopColor: estilosEstado.border,
        borderRightColor: estilosEstado.border,
        borderLeftColor: estilosEstado.border,
        borderBottomColor: estilosEstado.bevel,
        color: estilosEstado.text,
        boxShadow: estilosEstado.glow,
      }}
    >
      {/* Muescas decorativas tipo tablilla antigua */}
      <span
        className="pointer-events-none absolute top-0 left-3 w-2 h-1 rounded-b-sm opacity-45"
        style={{ background: estilosEstado.bevel }}
      />
      <span
        className="pointer-events-none absolute bottom-0 right-4 w-2 h-1 rounded-t-sm opacity-45"
        style={{ background: estilosEstado.bevel }}
      />
      <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
        {texto}
      </span>
    </motion.button>
  );
}

/** Ranura luminosa sobre el puente del Altar (Verde Menta a la izquierda, Azul Celeste a la derecha). */
function RanuraAltar({
  indice,
  total,
  contenido,
  resaltada = false,
  estado = 'normal',
  onClick,
  etiquetaVacia,
}: {
  indice: number;
  total: number;
  contenido: string | null;
  resaltada?: boolean;
  estado?: 'normal' | 'correcta' | 'intruso' | 'error';
  onClick?: () => void;
  etiquetaVacia?: string;
}) {
  const esMenta = indice < Math.ceil(total / 2);
  const colorBase =
    estado === 'error' || estado === 'intruso'
      ? '#FDA4AF'
      : estado === 'correcta'
        ? '#6EE7B7'
        : esMenta
          ? '#6EE7B7'
          : '#7DD3FC';

  const colorFondo =
    estado === 'error' || estado === 'intruso'
      ? 'linear-gradient(180deg, #FFE4E6 0%, #FDA4AF 100%)'
      : esMenta
        ? 'linear-gradient(180deg, #D1FAE5 0%, #6EE7B7 100%)'
        : 'linear-gradient(180deg, #E0F2FE 0%, #7DD3FC 100%)';

  const centro = (total - 1) / 2;
  const dist = indice - centro;
  const rotacion = dist * 2.2;
  const elevacion = Math.abs(dist) * 3.5;

  const colorBordeInterior = contenido
    ? estado === 'correcta'
      ? '#34D399'
      : estado === 'intruso' || estado === 'error'
        ? '#FB7185'
        : '#D8C29D'
    : '#FFFFFF';

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        transform: `translateY(${elevacion}px) rotate(${rotacion}deg)`,
      }}
    >
      {/* Haz de luz ascendente desde la ranura */}
      <div
        className="pointer-events-none absolute -top-14 w-20 sm:w-24 h-16 opacity-75 transition-opacity duration-300"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${colorBase}44 55%, ${colorBase}99 100%)`,
          clipPath: 'polygon(16% 0%, 84% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Marco de piedra tallada de la ranura */}
      <motion.div
        whileHover={onClick ? { scale: 1.04, y: -2 } : undefined}
        whileTap={onClick ? { scale: 0.96 } : undefined}
        onClick={onClick}
        className={`relative z-10 min-w-[82px] sm:min-w-[108px] md:min-w-[120px] h-[46px] sm:h-[54px] px-2.5 rounded-xl flex items-center justify-center transition-all ${
          onClick ? 'cursor-pointer' : ''
        }`}
        style={{
          background: 'linear-gradient(180deg, #C7B092 0%, #9E8566 100%)',
          borderTopWidth: '2px',
          borderRightWidth: '2px',
          borderBottomWidth: '2px',
          borderLeftWidth: '2px',
          borderStyle: 'solid',
          borderColor: resaltada ? '#FEF08A' : '#8A7256',
          boxShadow: `0 4px 0 #665038, 0 0 22px ${colorBase}66`,
        }}
      >
        {/* Interior luminoso del receptáculo */}
        <div
          className="w-full h-[34px] sm:h-[40px] rounded-lg flex items-center justify-center px-2.5 transition-all"
          style={{
            background: contenido
              ? estado === 'intruso' || estado === 'error'
                ? 'linear-gradient(180deg, #FFF1F2 0%, #FECDD3 100%)'
                : estado === 'correcta'
                  ? 'linear-gradient(180deg, #ECFDF5 0%, #A7F3D0 100%)'
                  : 'linear-gradient(180deg, #FFFFFF 0%, #FDF6E3 72%, #EAD7B7 100%)'
              : colorFondo,
            borderTopWidth: '2px',
            borderRightWidth: '2px',
            borderBottomWidth: '2px',
            borderLeftWidth: '2px',
            borderStyle: 'solid',
            borderColor: colorBordeInterior,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 12px ${colorBase}88, 0 0 14px ${colorBase}66`,
          }}
        >
          {contenido ? (
            <span
              className="font-extrabold text-xs sm:text-sm md:text-base tracking-tight truncate max-w-[130px]"
              style={{
                color:
                  estado === 'intruso' || estado === 'error'
                    ? '#9F1239'
                    : estado === 'correcta'
                      ? '#065F46'
                      : '#1E1B4B',
              }}
            >
              {contenido}
            </span>
          ) : (
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950/55 select-none">
              {etiquetaVacia ?? ''}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AltarDecodificacion({
  modal,
  estrellasActuales,
  silabasRecolectadas,
  onCompletar,
}: AltarDecodificacionProps) {
  const [mostrarPista, setMostrarPista] = useState(false);
  const [explicacionActiva, setExplicacionActiva] = useState<string | null>(null);
  const [mensajeApoyo, setMensajeApoyo] = useState<string | null>(null);
  const [resueltoExito, setResueltoExito] = useState<boolean | null>(null);

  /* ── Estado Mecánica 1: Caza del Intruso ── */
  const [intrusoDetectado, setIntrusoDetectado] = useState(false);
  const [indiceTocado, setIndiceTocado] = useState<number | null>(null);
  const [reemplazoElegido, setReemplazoElegido] = useState<string | null>(null);

  const opcionesIntruso = useMemo(() => {
    if (modal.tipo !== 'intruso') return [];
    return barajar(modal.reto.opciones);
  }, [modal]);

  /* ── Estado Mecánica 2: Constructor de Puentes ── */
  const fichasInicialesPuente = useMemo(() => {
    if (modal.tipo !== 'puente') return [];
    const base = modal.reto.ordenCorrecto.map((texto, idx) => ({ id: `f-${idx}`, texto }));
    let mezcladas = barajar(base);
    if (mezcladas.every((f, i) => f.texto === base[i].texto) && mezcladas.length > 1) {
      mezcladas = [...mezcladas.slice(1), mezcladas[0]];
    }
    return mezcladas;
  }, [modal]);

  const [ranurasPuente, setRanurasPuente] = useState<({ id: string; texto: string } | null)[]>([]);

  useEffect(() => {
    if (modal.tipo === 'puente') {
      setRanurasPuente(Array(modal.reto.ordenCorrecto.length).fill(null));
    }
  }, [modal]);

  /* ── Estado Mecánica 3: Tormenta de Meteoritos Acústicos ── */
  const fichasTormenta = useMemo(() => {
    if (modal.tipo !== 'tormenta') return [];
    return barajar(modal.reto.palabras);
  }, [modal]);

  const [seleccionTormenta, setSeleccionTormenta] = useState<string[]>([]);
  const [segundosRestantes, setSegundosRestantes] = useState(
    modal.tipo === 'tormenta' ? modal.reto.segundos : 18,
  );

  /* ── Estado Mecánica 4: Guardián del Vórtice (Boss Final) ── */
  const [faseBoss, setFaseBoss] = useState<0 | 1 | 2>(0);
  const [respuestasBoss, setRespuestasBoss] = useState<[string | null, string | null, string | null]>([
    null,
    null,
    null,
  ]);
  const [opcionBossActual, setOpcionBossActual] = useState<string | null>(null);

  const opcionesFaseBoss = useMemo(() => {
    if (modal.tipo !== 'boss') return [];
    return barajar(modal.reto.fases[faseBoss].opciones);
  }, [modal, faseBoss]);

  // Reiniciar estados al cambiar de reto
  useEffect(() => {
    setMostrarPista(false);
    setExplicacionActiva(null);
    setMensajeApoyo(null);
    setResueltoExito(null);
    setIntrusoDetectado(false);
    setIndiceTocado(null);
    setReemplazoElegido(null);
    setSeleccionTormenta([]);
    setFaseBoss(0);
    setRespuestasBoss([null, null, null]);
    setOpcionBossActual(null);
    if (modal.tipo === 'tormenta') {
      setSegundosRestantes(modal.reto.segundos);
    }
  }, [modal]);

  // Temporizador amigable de 18s para la Tormenta Acústica
  useEffect(() => {
    if (modal.tipo !== 'tormenta' || resueltoExito !== null) return;
    if (segundosRestantes <= 0) {
      setResueltoExito(false);
      setExplicacionActiva(
        `¡Pasó la tormenta! Las 3 palabras correctas eran: ${modal.reto.correctas.join(', ')}. ${modal.reto.explicacion}`,
      );
      return;
    }
    const timer = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [modal, segundosRestantes, resueltoExito]);

  /* ── Pista según mecánica ── */
  const pistaTexto = useMemo(() => {
    if (modal.tipo === 'intruso') return modal.reto.pista;
    if (modal.tipo === 'puente') return modal.reto.pista;
    if (modal.tipo === 'tormenta') return modal.reto.pista;
    return modal.reto.fases[faseBoss].enunciado;
  }, [modal, faseBoss]);

  /* ── Manejadores de interacción ── */

  const handleTocarPalabraOracion = (idx: number) => {
    if (modal.tipo !== 'intruso' || resueltoExito !== null) return;
    setIndiceTocado(idx);
    if (idx === modal.reto.indiceIntruso) {
      setIntrusoDetectado(true);
      setMensajeApoyo('¡Encontraste la palabra intrusa! Ahora elige la tablilla correcta para repararla.');
    } else {
      setMensajeApoyo(`«${modal.reto.palabras[idx]}» está bien escrita. ¡Busca otra palabra que tenga un error!`);
    }
  };

  const handleColocarFichaPuente = (ficha: { id: string; texto: string }) => {
    if (resueltoExito !== null) return;
    setMensajeApoyo(null);
    const yaColocadaIdx = ranurasPuente.findIndex((r) => r?.id === ficha.id);
    if (yaColocadaIdx !== -1) {
      const copia = [...ranurasPuente];
      copia[yaColocadaIdx] = null;
      setRanurasPuente(copia);
      return;
    }
    const huecoIdx = ranurasPuente.findIndex((r) => r === null);
    if (huecoIdx !== -1) {
      const copia = [...ranurasPuente];
      copia[huecoIdx] = ficha;
      setRanurasPuente(copia);
    }
  };

  const handleQuitarDeRanuraPuente = (idx: number) => {
    if (resueltoExito !== null) return;
    setMensajeApoyo(null);
    const copia = [...ranurasPuente];
    copia[idx] = null;
    setRanurasPuente(copia);
  };

  const handleTogglePalabraTormenta = (palabra: string) => {
    if (resueltoExito !== null) return;
    setMensajeApoyo(null);
    setSeleccionTormenta((prev) => {
      if (prev.includes(palabra)) return prev.filter((p) => p !== palabra);
      if (prev.length >= 3) return prev;
      return [...prev, palabra];
    });
  };

  const handleComprobarOContinuar = useCallback(() => {
    if (resueltoExito !== null) {
      if (modal.tipo === 'intruso') {
        onCompletar({
          exito: resueltoExito,
          silabaObtenida: resueltoExito ? modal.otorgaSilaba ?? null : null,
        });
      } else if (modal.tipo === 'puente') {
        onCompletar({
          exito: resueltoExito,
          silabaObtenida: resueltoExito ? modal.otorgaSilaba ?? null : null,
        });
      } else if (modal.tipo === 'tormenta') {
        onCompletar({
          exito: resueltoExito,
          desplazamientoExtra: resueltoExito ? 1 : -1,
        });
      } else if (modal.tipo === 'boss') {
        if (faseBoss < 2) {
          setFaseBoss((f) => (f + 1) as 0 | 1 | 2);
          setOpcionBossActual(null);
          setResueltoExito(null);
          setExplicacionActiva(null);
          setMensajeApoyo(null);
          return;
        }
        onCompletar({
          exito: true,
          esBossFinal: true,
        });
      }
      return;
    }

    if (modal.tipo === 'intruso') {
      if (!intrusoDetectado) {
        setMensajeApoyo('Primero toca la tablilla de la oración que tiene un error ortográfico o de tilde.');
        return;
      }
      if (!reemplazoElegido) {
        setMensajeApoyo('Toca una de las 3 tablillas de reemplazo para reparar la oración.');
        return;
      }
      if (reemplazoElegido === modal.reto.correcta) {
        setResueltoExito(true);
        setMensajeApoyo(null);
        setExplicacionActiva(modal.reto.explicacion);
      } else {
        setMensajeApoyo(`«${reemplazoElegido}» no es la forma correcta. Pista: ${modal.reto.pista}`);
      }
      return;
    }

    if (modal.tipo === 'puente') {
      if (ranurasPuente.some((r) => r === null)) {
        setMensajeApoyo('Coloca todas las tablillas de pergamino en las ranuras luminosas del Altar.');
        return;
      }
      const palabrasOrdenadas = ranurasPuente.map((r) => r!.texto);
      if (validarPuente(modal.reto, palabrasOrdenadas)) {
        setResueltoExito(true);
        setMensajeApoyo(null);
        setExplicacionActiva(modal.reto.explicacion);
      } else {
        setMensajeApoyo('La oración aún no suena coherente. ¡Toca una tablilla del puente para cambiarla de lugar!');
      }
      return;
    }

    if (modal.tipo === 'tormenta') {
      if (seleccionTormenta.length < 3) {
        setMensajeApoyo('Selecciona 3 tablillas para activar las 3 ranuras del escudo del Altar.');
        return;
      }
      const aciertos = seleccionTormenta.every((p) => modal.reto.correctas.includes(p));
      setResueltoExito(aciertos);
      setMensajeApoyo(null);
      setExplicacionActiva(
        aciertos
          ? `¡Escudo Astral activado (+1 casilla de impulso)! ${modal.reto.explicacion}`
          : `La tormenta te hace retroceder 1 casilla. Las 3 correctas eran: ${modal.reto.correctas.join(', ')}. ${modal.reto.explicacion}`,
      );
      return;
    }

    if (modal.tipo === 'boss') {
      const fase = modal.reto.fases[faseBoss];
      if (!opcionBossActual) {
        setMensajeApoyo('Elige una tablilla para desencriptar el sello actual del códice.');
        return;
      }
      if (opcionBossActual === fase.correcta) {
        const nuevas: [string | null, string | null, string | null] = [...respuestasBoss];
        nuevas[faseBoss] = opcionBossActual;
        setRespuestasBoss(nuevas);
        setResueltoExito(true);
        setMensajeApoyo(null);
        setExplicacionActiva(fase.explicacion);
      } else {
        setMensajeApoyo('Esa pieza no encaja en el códice del Guardián. ¡Lee con atención el relato e inténtalo de nuevo!');
      }
    }
  }, [
    resueltoExito,
    modal,
    intrusoDetectado,
    reemplazoElegido,
    ranurasPuente,
    seleccionTormenta,
    faseBoss,
    opcionBossActual,
    respuestasBoss,
    onCompletar,
  ]);

  const renderRelatoGuardian = () => {
    if (modal.tipo !== 'boss') return null;
    const partes = modal.reto.relato.split(/(\{\d\})/g);
    return (
      <div
        className="rounded-2xl p-4 sm:p-5 text-[#1E1B4B] max-w-2xl mx-auto mb-4 leading-relaxed text-sm sm:text-base font-medium"
        style={{
          background: 'linear-gradient(180deg, #FFFDF7 0%, #FDF6E3 70%, #F4E4C6 100%)',
          border: '2.5px solid #D5BE97',
          boxShadow: '0 10px 26px rgba(15, 23, 42, 0.35), inset 0 1px 0 #FFFFFF',
        }}
      >
        <div className="flex items-center justify-between border-b border-[#E6D5B8] pb-2 mb-2.5">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-900/75">
            ✦ Códice del Guardián: {modal.reto.titulo}
          </span>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-violet-200 border border-violet-300 text-indigo-950">
            Sello {faseBoss + 1} de 3
          </span>
        </div>
        <p className="text-indigo-950 leading-7">
          {partes.map((fragmento, idx) => {
            const match = /^\{(\d)\}$/.exec(fragmento);
            if (!match) return <span key={idx}>{fragmento}</span>;
            const numSello = Number(match[1]) as 0 | 1 | 2;
            const valorResuelto = respuestasBoss[numSello];
            const esActual = numSello === faseBoss;
            const preview = esActual && opcionBossActual ? opcionBossActual : null;
            return (
              <span
                key={idx}
                className={`inline-flex items-center mx-1 px-2.5 py-0.5 rounded-lg font-extrabold text-xs sm:text-sm border-2 transition-all ${
                  valorResuelto
                    ? 'bg-emerald-200 border-emerald-500 text-emerald-950 shadow-[0_0_12px_rgba(110,231,183,0.7)]'
                    : esActual
                      ? 'bg-sky-200 border-sky-400 text-indigo-950 animate-pulse shadow-[0_0_12px_rgba(125,211,252,0.8)]'
                      : 'bg-violet-100 border-violet-300 text-indigo-900/60'
                }`}
              >
                {valorResuelto ?? preview ?? `Sello ${numSello + 1}`}
              </span>
            );
          })}
        </p>
      </div>
    );
  };

  const segmentosEnergia =
    modal.tipo === 'tormenta'
      ? Math.max(0, Math.ceil((segundosRestantes / modal.reto.segundos) * 4))
      : 4;

  const textoBotonPrincipal = useMemo(() => {
    if (resueltoExito === null) return 'COMPROBAR';
    if (modal.tipo === 'boss' && faseBoss < 2) return 'SIGUIENTE SELLO ✦';
    if (modal.tipo === 'boss' && faseBoss === 2) return 'RESTAURAR ARCHIVO ✦';
    return 'CONTINUAR ✦';
  }, [resueltoExito, modal.tipo, faseBoss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto select-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(44, 60, 108, 0.85) 0%, rgba(22, 31, 60, 0.92) 70%, rgba(12, 18, 38, 0.96) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Estrellas y chispas mágicas de fondo ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CHISPAS.map((c, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: c.x,
              top: c.y,
              width: c.s * 2,
              height: c.s * 2,
              background: i % 2 === 0 ? '#FEF08A' : '#DDD6FE',
              boxShadow: `0 0 12px ${i % 2 === 0 ? '#FDE047' : '#A78BFA'}`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.3, 0.85] }}
            transition={{ duration: 2.4 + (i % 3) * 0.6, repeat: Infinity, delay: c.d }}
          />
        ))}
      </div>

      {/* ══════════ CONTENEDOR PRINCIPAL DEL ALTAR DE DECODIFICACIÓN ══════════ */}
      <div className="relative flex items-center justify-center w-full max-w-[960px] my-auto">
        <motion.div
          initial={{ scale: 0.93, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="relative w-full max-w-[850px] rounded-[28px] p-[18px] sm:p-[24px]"
          style={{
            background:
              'linear-gradient(180deg, #D1DCFB 0%, #B4C3F2 45%, #96A7E6 100%)',
            borderTopWidth: '3px',
            borderRightWidth: '3px',
            borderBottomWidth: '4px',
            borderLeftWidth: '3px',
            borderStyle: 'solid',
            borderTopColor: '#F1F5FF',
            borderLeftColor: '#E2E8F0',
            borderRightColor: '#E2E8F0',
            borderBottomColor: '#6D7EC2',
            boxShadow:
              '0 28px 80px rgba(10, 16, 36, 0.8), 0 0 45px rgba(165, 180, 252, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.9)',
          }}
        >
          {/* ── Inscripciones rúnicas del marco ── */}
          <div className="pointer-events-none absolute top-1 left-9 right-9 h-4 flex items-center justify-between text-[10px] font-mono font-bold tracking-[0.35em] text-[#3B4882] overflow-hidden opacity-85">
            <span>{RUNAS_HORIZONTALES}</span>
            <span>{RUNAS_HORIZONTALES}</span>
          </div>
          <div className="pointer-events-none absolute bottom-1 left-9 right-9 h-4 flex items-center justify-between text-[10px] font-mono font-bold tracking-[0.35em] text-[#3B4882] overflow-hidden opacity-85">
            <span>{RUNAS_HORIZONTALES}</span>
            <span>{RUNAS_HORIZONTALES}</span>
          </div>
          <div className="pointer-events-none absolute top-8 bottom-8 left-1.5 w-4 flex flex-col items-center justify-between text-[10px] font-mono font-bold text-[#3B4882] opacity-85">
            {RUNAS_VERTICALES.map((r, i) => (
              <span key={i}>{r}</span>
            ))}
          </div>
          <div className="pointer-events-none absolute top-8 bottom-8 right-1.5 w-4 flex flex-col items-center justify-between text-[10px] font-mono font-bold text-[#3B4882] opacity-85">
            {RUNAS_VERTICALES.map((r, i) => (
              <span key={i}>{r}</span>
            ))}
          </div>

          {/* 4 Esquinas rúnicas cuadradas */}
          {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map(
            (pos, i) => (
              <div
                key={i}
                className={`pointer-events-none absolute ${pos} w-5 h-5 rounded-md bg-[#97A8E8] border border-[#4F5D99] shadow-inner flex items-center justify-center text-[10px] font-bold text-[#263163]`}
              >
                ⋈
              </div>
            ),
          )}

          {/* ── Plumas Estelares Flotantes a Izquierda y Derecha ── */}
          <motion.div
            className="hidden sm:block absolute -left-11 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
            animate={{ y: [-6, 6, -6], rotate: [-4, 2, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PlumaEstelar lado="izq" />
          </motion.div>
          <motion.div
            className="hidden sm:block absolute -right-11 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
            animate={{ y: [6, -6, 6], rotate: [4, -2, 4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PlumaEstelar lado="der" />
          </motion.div>

          {/* ── Placa Superior "ALTAR DE DECODIFICACIÓN" ── */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[540px]">
            <div
              className="relative px-6 py-2.5 sm:py-3 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #FEF08A 0%, #FBBF24 48%, #D97706 100%)',
                borderTopWidth: '2px',
                borderRightWidth: '2px',
                borderBottomWidth: '3px',
                borderLeftWidth: '2px',
                borderStyle: 'solid',
                borderTopColor: '#FFFBEB',
                borderLeftColor: '#FEF3C7',
                borderRightColor: '#FEF3C7',
                borderBottomColor: '#92400E',
                boxShadow:
                  '0 10px 26px rgba(15, 23, 42, 0.52), 0 0 22px rgba(251, 191, 36, 0.35)',
              }}
            >
              <div className="hidden sm:flex absolute -left-3.5 w-7 h-7 rotate-45 rounded-xs bg-[#FDE68A] border-2 border-[#B45309] items-center justify-center shadow-md">
                <div className="w-3.5 h-3.5 bg-[#7DD3FC] border border-white shadow-[0_0_8px_#7DD3FC]" />
              </div>
              <div className="hidden sm:flex absolute -right-3.5 w-7 h-7 rotate-45 rounded-xs bg-[#FDE68A] border-2 border-[#B45309] items-center justify-center shadow-md">
                <div className="w-3.5 h-3.5 bg-[#7DD3FC] border border-white shadow-[0_0_8px_#7DD3FC]" />
              </div>

              <div
                className="w-full py-1.5 px-4 rounded-xl text-center"
                style={{
                  background: 'linear-gradient(180deg, #F5F3FF 0%, #E4DDFe 58%, #C4B5FD 100%)',
                  borderTopWidth: '1.5px',
                  borderRightWidth: '1.5px',
                  borderBottomWidth: '2px',
                  borderLeftWidth: '1.5px',
                  borderStyle: 'solid',
                  borderColor: '#A78BFA',
                  boxShadow: 'inset 0 1px 0 #FFFFFF',
                }}
              >
                <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-wider text-[#1E1B4B] drop-shadow-[0_1px_0_rgba(255,255,255,0.95)]">
                  ALTAR DE DECODIFICACIÓN
                </h2>
              </div>
            </div>
          </div>

          {/* ── Interior Azul Crepúsculo Luminoso del Altar ── */}
          <div
            className="relative rounded-[20px] pt-10 pb-12 px-4 sm:px-8 min-h-[450px] sm:min-h-[500px] flex flex-col justify-between overflow-hidden"
            style={{
              background:
                'radial-gradient(ellipse at 50% 58%, #46629E 0%, #2D3E6B 56%, #1C2747 100%)',
              borderTopWidth: '2px',
              borderRightWidth: '2px',
              borderBottomWidth: '2px',
              borderLeftWidth: '2px',
              borderStyle: 'solid',
              borderColor: '#7C8EC4',
              boxShadow: 'inset 0 0 55px rgba(15, 23, 42, 0.55)',
            }}
          >
            {/* Nebulosas de luz ambiental dentro del Altar */}
            <div
              className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-55"
              style={{
                background: 'radial-gradient(circle, rgba(196, 181, 253, 0.45) 0%, transparent 70%)',
              }}
            />
            <div
              className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-55"
              style={{
                background: 'radial-gradient(circle, rgba(125, 211, 252, 0.42) 0%, transparent 70%)',
              }}
            />
            <div
              className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-44 rounded-full blur-3xl opacity-65"
              style={{
                background:
                  'radial-gradient(ellipse, rgba(110, 231, 183, 0.28) 0%, rgba(253, 230, 138, 0.22) 50%, transparent 80%)',
              }}
            />

            {/* ── Barra de estado interna ── */}
            <div className="relative z-20 flex items-center justify-between gap-2 mb-3">
              <div
                className="flex items-center gap-2 rounded-full px-3.5 py-1.5 shadow-md"
                style={{
                  background: 'rgba(38, 52, 92, 0.88)',
                  border: '1.5px solid rgba(165, 180, 252, 0.6)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              >
                <span className="w-6 h-6 rounded-full bg-amber-400/25 border border-amber-300 flex items-center justify-center text-amber-300 text-xs font-bold">
                  ⚡
                </span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-3.5 rounded-xs transition-all duration-300"
                      style={{
                        background: i < segmentosEnergia ? '#FACC15' : 'rgba(255,255,255,0.18)',
                        boxShadow: i < segmentosEnergia ? '0 0 8px #FACC15' : 'none',
                      }}
                    />
                  ))}
                </div>
                {modal.tipo === 'tormenta' && (
                  <span
                    className={`ml-1 text-xs font-black tracking-wide ${
                      segundosRestantes <= 5 ? 'text-rose-300 animate-pulse' : 'text-amber-200'
                    }`}
                  >
                    {segundosRestantes}s
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarPista((v) => !v)}
                  className="lg:hidden flex items-center gap-1.5 bg-violet-400/30 hover:bg-violet-400/45 border border-violet-200 rounded-full px-3.5 py-1 text-xs font-extrabold text-white cursor-pointer shadow"
                >
                  <span>🪶</span>
                  <span>AYUDA</span>
                </button>
                {estrellasActuales > 0 && (
                  <div
                    className="hidden sm:inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 shadow-md"
                    style={{
                      background: 'rgba(38, 52, 92, 0.88)',
                      border: '1.5px solid rgba(253, 224, 71, 0.55)',
                    }}
                  >
                    <span className="text-amber-300 text-xs">⭐</span>
                    <span className="text-xs font-black text-amber-100">{estrellasActuales}</span>
                  </div>
                )}
                <div
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 shadow-md"
                  style={{
                    background: 'rgba(38, 52, 92, 0.88)',
                    border: '1.5px solid rgba(165, 180, 252, 0.6)',
                  }}
                >
                  <span className="text-sky-300 text-sm">💎</span>
                  <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                    {silabasRecolectadas}/4
                  </span>
                </div>
              </div>
            </div>

            {/* ── Consigna / Instrucción Pedagógica ── */}
            <div className="relative z-20 text-center mb-3">
              {modal.tipo === 'intruso' && (
                <>
                  <span
                    className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full text-violet-100 mb-1.5"
                    style={{
                      background: 'rgba(139, 92, 246, 0.28)',
                      border: '1.5px solid rgba(221, 214, 254, 0.55)',
                    }}
                  >
                    ✦ Mecánica 1 · Caza del Intruso ({modal.reto.categoria})
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-[#FFFDF7] drop-shadow-[0_2px_8px_rgba(15,23,42,0.5)]">
                    {!intrusoDetectado
                      ? 'Toca la palabra intrusa que tiene un error:'
                      : '¡Elige la tablilla correcta para reparar el Altar!'}
                  </h3>
                </>
              )}

              {modal.tipo === 'puente' && (
                <>
                  <span
                    className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full text-emerald-100 mb-1.5"
                    style={{
                      background: 'rgba(16, 185, 129, 0.28)',
                      border: '1.5px solid rgba(167, 243, 208, 0.55)',
                    }}
                  >
                    {modal.esPortal
                      ? '✦ Portal de Convergencia · 4.ª Sílaba Clave'
                      : '✦ Mecánica 2 · Constructor de Puentes Sintácticos'}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-[#FFFDF7] drop-shadow-[0_2px_8px_rgba(15,23,42,0.5)]">
                    Decodifica el mensaje:
                  </h3>
                </>
              )}

              {modal.tipo === 'tormenta' && (
                <>
                  <span
                    className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full text-rose-100 mb-1.5"
                    style={{
                      background: 'rgba(244, 63, 94, 0.28)',
                      border: '1.5px solid rgba(254, 205, 211, 0.55)',
                    }}
                  >
                    ✦ Mecánica 3 · Tormenta de Meteoritos Acústicos
                  </span>
                  <h3 className="text-base sm:text-xl font-black text-[#FFFDF7] drop-shadow max-w-xl mx-auto">
                    {modal.reto.consigna}
                  </h3>
                </>
              )}

              {modal.tipo === 'boss' && (
                <>
                  <span
                    className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full text-sky-100 mb-1.5"
                    style={{
                      background: 'rgba(56, 189, 248, 0.28)',
                      border: '1.5px solid rgba(186, 230, 253, 0.55)',
                    }}
                  >
                    ✦ Guardián del Vórtice Gramatical · {modal.reto.fases[faseBoss].titulo}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#FFFDF7] drop-shadow max-w-2xl mx-auto">
                    {modal.reto.fases[faseBoss].enunciado}
                  </h3>
                </>
              )}
            </div>

            {/* ── Pista Desplegable (cuando se pulsa AYUDA) ── */}
            <AnimatePresence>
              {mostrarPista && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative z-30 mx-auto mb-3 max-w-xl bg-[#FFFDF7] border-2 border-[#A78BFA] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-[#1E1B4B] shadow-lg flex items-center gap-2.5"
                >
                  <span className="text-lg">🪶</span>
                  <span>
                    <strong>Pista Astral:</strong> {pistaTexto}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Zona Central: Tablillas Flotantes (Arriba) ── */}
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center my-1">
              {modal.tipo === 'intruso' && (
                <div className="min-h-[82px] flex flex-wrap items-center justify-center gap-4 px-2">
                  {!intrusoDetectado ? (
                    <p
                      className="text-xs sm:text-sm font-bold text-[#FFFDF7] px-5 py-2.5 rounded-full"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(30, 41, 75, 0.78) 0%, rgba(49, 46, 129, 0.72) 100%)',
                        border: '1.5px solid rgba(186, 230, 253, 0.5)',
                        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                      }}
                    >
                      👇 Toca directamente sobre el puente la tablilla que contiene el error
                    </p>
                  ) : (
                    opcionesIntruso.map((op, i) => (
                      <TablillaPergamino
                        key={op}
                        texto={op}
                        inclinacion={ROTACIONES_TABLILLA[i % ROTACIONES_TABLILLA.length]}
                        seleccionada={reemplazoElegido === op}
                        estado={
                          reemplazoElegido === op
                            ? resueltoExito
                              ? 'correcta'
                              : 'normal'
                            : 'normal'
                        }
                        onClick={() => {
                          if (resueltoExito !== null) return;
                          setReemplazoElegido(op);
                          setMensajeApoyo(null);
                        }}
                      />
                    ))
                  )}
                </div>
              )}

              {modal.tipo === 'puente' && (
                <div className="min-h-[96px] flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-2 max-w-2xl">
                  {fichasInicialesPuente.map((ficha, i) => {
                    const usada = ranurasPuente.some((r) => r?.id === ficha.id);
                    return (
                      <TablillaPergamino
                        key={ficha.id}
                        texto={ficha.texto}
                        inclinacion={ROTACIONES_TABLILLA[i % ROTACIONES_TABLILLA.length]}
                        usadaEnPuente={usada}
                        onClick={() => handleColocarFichaPuente(ficha)}
                      />
                    );
                  })}
                </div>
              )}

              {modal.tipo === 'tormenta' && (
                <div className="min-h-[104px] flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-2 max-w-2xl">
                  {fichasTormenta.map((palabra, i) => {
                    const elegida = seleccionTormenta.includes(palabra);
                    return (
                      <motion.div
                        key={palabra}
                        animate={{
                          y: [i % 2 === 0 ? -5 : 5, i % 2 === 0 ? 5 : -5, i % 2 === 0 ? -5 : 5],
                        }}
                        transition={{
                          duration: 2.2 + (i % 3) * 0.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <TablillaPergamino
                          texto={palabra}
                          inclinacion={ROTACIONES_TABLILLA[i % ROTACIONES_TABLILLA.length]}
                          seleccionada={elegida}
                          usadaEnPuente={elegida}
                          onClick={() => handleTogglePalabraTormenta(palabra)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {modal.tipo === 'boss' && (
                <div className="w-full flex flex-col items-center">
                  {renderRelatoGuardian()}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-2">
                    {opcionesFaseBoss.map((op, i) => (
                      <TablillaPergamino
                        key={op}
                        texto={op}
                        compacta={op.length > 22}
                        inclinacion={ROTACIONES_TABLILLA[i % ROTACIONES_TABLILLA.length]}
                        seleccionada={opcionBossActual === op}
                        estado={
                          opcionBossActual === op
                            ? resueltoExito
                              ? 'correcta'
                              : 'normal'
                            : 'normal'
                        }
                        onClick={() => {
                          if (resueltoExito !== null) return;
                          setOpcionBossActual(op);
                          setMensajeApoyo(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── PUENTE ARQUEADO DEL ALTAR Y RANURAS LUMINOSAS ── */}
            <div className="relative z-20 mt-4 pt-3 pb-1 flex flex-col items-center">
              <div
                className="relative w-full max-w-[740px] px-3 py-3.5 rounded-[28px]"
                style={{
                  background:
                    'linear-gradient(180deg, #E2CFAF 0%, #C5AC87 52%, #9B805D 100%)',
                  border: '2.5px solid #F7EBDA',
                  boxShadow:
                    '0 10px 0 #614D36, 0 18px 34px rgba(10, 16, 36, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.65)',
                }}
              >
                <span className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-8 rounded bg-[#A78D6A] border border-[#6E583F] items-center justify-center text-xs font-bold text-[#4A3A28] shadow-inner">
                  ϟ
                </span>
                <span className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-8 rounded bg-[#A78D6A] border border-[#6E583F] items-center justify-center text-xs font-bold text-[#4A3A28] shadow-inner">
                  ϟ
                </span>

                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 px-2 sm:px-6">
                  {modal.tipo === 'intruso' &&
                    modal.reto.palabras.map((pal, idx) => {
                      const esIntruso = idx === modal.reto.indiceIntruso;
                      const mostrarReemplazo = esIntruso && reemplazoElegido ? reemplazoElegido : pal;
                      const estadoSlot =
                        esIntruso && resueltoExito
                          ? 'correcta'
                          : esIntruso && intrusoDetectado
                            ? 'intruso'
                            : indiceTocado === idx && !esIntruso
                              ? 'error'
                              : 'normal';
                      return (
                        <RanuraAltar
                          key={idx}
                          indice={idx}
                          total={modal.reto.palabras.length}
                          contenido={mostrarReemplazo}
                          resaltada={esIntruso && intrusoDetectado}
                          estado={estadoSlot}
                          onClick={() => handleTocarPalabraOracion(idx)}
                        />
                      );
                    })}

                  {modal.tipo === 'puente' &&
                    ranurasPuente.map((slot, idx) => (
                      <RanuraAltar
                        key={idx}
                        indice={idx}
                        total={ranurasPuente.length}
                        contenido={slot?.texto ?? null}
                        estado={resueltoExito ? 'correcta' : 'normal'}
                        etiquetaVacia={`${idx + 1}`}
                        onClick={() => slot && handleQuitarDeRanuraPuente(idx)}
                      />
                    ))}

                  {modal.tipo === 'tormenta' &&
                    [0, 1, 2].map((idx) => {
                      const pal = seleccionTormenta[idx] ?? null;
                      return (
                        <RanuraAltar
                          key={idx}
                          indice={idx}
                          total={3}
                          contenido={pal}
                          estado={
                            resueltoExito === null
                              ? 'normal'
                              : pal && modal.reto.correctas.includes(pal)
                                ? 'correcta'
                                : 'error'
                          }
                          etiquetaVacia={`Escudo ${idx + 1}`}
                          onClick={() => pal && handleTogglePalabraTormenta(pal)}
                        />
                      );
                    })}

                  {modal.tipo === 'boss' &&
                    [0, 1, 2].map((idx) => {
                      const num = idx as 0 | 1 | 2;
                      const textoSello =
                        respuestasBoss[num] ?? (num === faseBoss ? opcionBossActual : null);
                      return (
                        <RanuraAltar
                          key={idx}
                          indice={idx}
                          total={3}
                          contenido={textoSello}
                          resaltada={num === faseBoss}
                          estado={
                            respuestasBoss[num]
                              ? 'correcta'
                              : num === faseBoss && resueltoExito
                                ? 'correcta'
                                : 'normal'
                          }
                          etiquetaVacia={`Sello ${idx + 1}`}
                        />
                      );
                    })}
                </div>
              </div>

              {/* ── Pedestal Circular "Altar" con Círculo Mágico Luminoso ── */}
              <div className="relative -mt-1 flex flex-col items-center">
                <div
                  className="pointer-events-none absolute -top-11 w-56 h-16 opacity-75"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 80%, rgba(254, 240, 138, 0.75) 0%, rgba(125, 211, 252, 0.45) 55%, transparent 80%)',
                  }}
                />
                <div
                  className="relative w-46 sm:w-54 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #C7B9A8 0%, #87776A 100%)',
                    border: '2px solid #EFE4D4',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 #FFFFFF',
                  }}
                >
                  <div
                    className="w-34 sm:w-38 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'radial-gradient(circle, #FFFBEB 0%, #BAE6FD 52%, #38BDF8 100%)',
                      boxShadow: '0 0 22px #7DD3FC, inset 0 0 10px #FEF08A',
                    }}
                  >
                    <div className="w-22 h-3.5 rounded-full border border-amber-300/90" />
                  </div>
                  <span className="absolute -bottom-2 px-3.5 py-0.5 rounded-md bg-[#7E6E61] border border-[#E6D7C3] text-[11px] font-black tracking-wider text-[#FFFDF7] shadow">
                    Altar
                  </span>
                </div>
              </div>
            </div>

            {/* ── Mensajes de apoyo o Explicación Formativa al Resolver ── */}
            <AnimatePresence mode="wait">
              {explicacionActiva ? (
                <motion.div
                  key="explicacion"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`relative z-30 mt-3 mx-auto max-w-2xl rounded-2xl p-3.5 sm:p-4 border-2 shadow-xl flex items-start gap-3 ${
                    resueltoExito
                      ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#064E3B]'
                      : 'bg-[#FFF1F2] border-[#FDA4AF] text-[#881337]'
                  }`}
                >
                  <span className="text-2xl shrink-0">{resueltoExito ? '✨' : '💫'}</span>
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <p className="font-black uppercase tracking-wider mb-0.5">
                      {resueltoExito
                        ? modal.tipo !== 'tormenta' && modal.tipo !== 'boss' && modal.otorgaSilaba
                          ? `¡Excelente! Ganaste el Cristal de Sílaba «${modal.otorgaSilaba}»`
                          : '¡Decodificación Correcta!'
                        : 'Nota del Archivo Astral'}
                    </p>
                    <p className="font-semibold">{explicacionActiva}</p>
                  </div>
                </motion.div>
              ) : mensajeApoyo ? (
                <motion.div
                  key="apoyo"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="relative z-30 mt-3 mx-auto max-w-xl rounded-xl px-4 py-2 bg-[#FEF3C7] border-2 border-[#FCD34D] text-[#78350F] text-xs sm:text-sm font-bold text-center shadow"
                >
                  {mensajeApoyo}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* ── Botón Inferior Central "COMPROBAR" ── */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleComprobarOContinuar}
              className="relative px-10 sm:px-13 py-3 rounded-2xl font-black text-base sm:text-lg tracking-wider text-[#1E1B4B] cursor-pointer"
              style={{
                background:
                  resueltoExito !== null
                    ? 'linear-gradient(180deg, #A7F3D0 0%, #34D399 55%, #059669 100%)'
                    : 'linear-gradient(180deg, #FEF08A 0%, #FBBF24 45%, #D97706 100%)',
                borderTopWidth: '3px',
                borderRightWidth: '3px',
                borderBottomWidth: '3px',
                borderLeftWidth: '3px',
                borderStyle: 'solid',
                borderColor: '#FFFBEB',
                boxShadow:
                  resueltoExito !== null
                    ? '0 5px 0 #065F46, 0 10px 26px rgba(16, 185, 129, 0.55), inset 0 1px 0 #FFFFFF'
                    : '0 5px 0 #92400E, 0 10px 26px rgba(245, 158, 11, 0.5), inset 0 1px 0 #FFFFFF',
              }}
            >
              {textoBotonPrincipal}
            </motion.button>
          </div>
        </motion.div>

        {/* ── Botón Exterior Derecho "AYUDA" con Pluma Estelar ── */}
        <div className="hidden lg:flex flex-col items-center ml-5 z-30">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setMostrarPista((v) => !v)}
            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{
              background:
                mostrarPista
                  ? 'radial-gradient(circle, #7C3AED 0%, #4C1D95 100%)'
                  : 'radial-gradient(circle, #5164A3 0%, #2D3C6B 100%)',
              border: '2.5px solid #C4B5FD',
              boxShadow:
                '0 0 26px rgba(167, 139, 250, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
            }}
            title="Mostrar pista pedagógica"
          >
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <path
                d="M28 6 C18 8 11 15 8 26 L6 30 L10 28 C18 25 25 18 28 6 Z"
                fill="#DDD6FE"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M7 29 L24 12" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </motion.button>
          <span className="mt-1.5 text-xs font-black tracking-widest text-[#F1F5FF] drop-shadow">
            AYUDA
          </span>
        </div>
      </div>
    </motion.div>
  );
}
