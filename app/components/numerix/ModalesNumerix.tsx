'use client';

import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PreguntaMatematica, RetoArmilarBoss } from '../../../lib/preguntas-numerix';
import { WHITEBOARD_LABELS } from '../../../lib/config/whiteboard-config';
import { HINT_SHORTCUT_LABELS } from '../../../lib/config/modal-safety-config';
import { useModalEscape } from '../../../lib/hooks/useModalEscape';
import { useHintShortcut } from '../../../lib/hooks/useHintShortcut';
import { playStep } from '../../../lib/sound-engine';
import PizarraHolografica from '../shared-game/PizarraHolografica';
import BotonSalidaMinijuego from '../shared-game/BotonSalidaMinijuego';

/* ════════════════════════ COMPONENTES LIQUID GLASS COMPARTIDOS ════════════════════════ */

/** Esfera Armilar luminosa en paleta Azul Crema, Morado Amatista y Verde Esmeralda. */
function EsferaArmilarMini() {
  return (
    <svg width="50" height="50" viewBox="0 0 64 64" className="overflow-visible select-none pointer-events-none shrink-0">
      <defs>
        <radialGradient id="miniArmilarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#02152E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="miniArmilarRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#00F5FF" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#miniArmilarGlow)" />
      <g transform="translate(32 32)">
        <ellipse rx="22" ry="21" fill="none" stroke="url(#miniArmilarRing)" strokeWidth="3" />
        <ellipse rx="21" ry="10.5" transform="rotate(-30)" fill="none" stroke="#F0F6FF" strokeOpacity="0.95" strokeWidth="2.4" />
        <ellipse rx="19" ry="9" transform="rotate(35)" fill="none" stroke="#6EE7B7" strokeOpacity="0.95" strokeWidth="2.2" />
        <circle r="7" fill="#312E81" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle r="3.8" fill="#6EE7B7" />
        <circle r="1.8" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/** Botón Pista Cuántica en Liquid Glass con iluminación viva. */
function BotonPistaCuantica({
  activa,
  onClick,
}: {
  activa: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      aria-label={HINT_SHORTCUT_LABELS.ariaLabel}
      data-keep-compact="true"
      className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase cursor-pointer transition-all shrink-0"
      style={{
        background: activa
          ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.7) 0%, rgba(0, 245, 255, 0.55) 100%)'
          : 'linear-gradient(135deg, rgba(7, 89, 133, 0.72) 0%, rgba(12, 74, 110, 0.62) 100%)',
        borderColor: activa ? 'rgba(0, 245, 255, 0.9)' : 'rgba(125, 211, 252, 0.55)',
        color: '#FFFFFF',
        boxShadow: activa
          ? '0 0 18px rgba(0, 245, 255, 0.55), inset 0 1px 1px rgba(255,255,255,0.45)'
          : '0 0 14px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255,255,255,0.3)',
      }}
      title={HINT_SHORTCUT_LABELS.ariaLabel}
    >
      <span aria-hidden="true">💡</span>
      <span>{activa ? HINT_SHORTCUT_LABELS.hideText : HINT_SHORTCUT_LABELS.buttonText}</span>
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-950/60 border border-cyan-200/35 text-[10px] font-mono font-bold text-cyan-100 leading-none">
        {HINT_SHORTCUT_LABELS.shortcutHint}
      </kbd>
    </button>
  );
}

/** Botón para abrir o cerrar la Pizarra Holográfica de Cálculo en Numérix. */
function BotonPizarraCalculo({
  activa,
  onClick,
}: {
  activa: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      aria-label={activa ? WHITEBOARD_LABELS.closeButton : WHITEBOARD_LABELS.openButton}
      title={WHITEBOARD_LABELS.openButton}
      className="liquid-glass-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide cursor-pointer transition-all shrink-0"
      style={{
        background: activa
          ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.72) 0%, rgba(16, 185, 129, 0.52) 100%)'
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(12, 74, 110, 0.65) 100%)',
        borderColor: activa ? 'rgba(34, 211, 238, 0.95)' : 'rgba(103, 232, 249, 0.5)',
        color: '#FFFFFF',
        boxShadow: activa
          ? '0 0 18px rgba(34, 211, 238, 0.5), inset 0 1px 1px rgba(255,255,255,0.4)'
          : '0 0 12px rgba(34, 211, 238, 0.2), inset 0 1px 1px rgba(255,255,255,0.25)',
      }}
    >
      <svg viewBox="0 0 18 18" fill="none" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
        <path
          d="M12.5 2.8L15.2 5.5L6.5 14.2L3 15L3.8 11.5L12.5 2.8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span>{WHITEBOARD_LABELS.openButton}</span>
    </button>
  );
}

type TonoCubo = 'crema' | 'amatista' | 'esmeralda' | 'magenta';

/** Cubo Cuántico 3D Cristalino y Luminoso en estilo Liquid Glass (sin líneas punteadas internas). */
function CuboCuantico3D({
  texto,
  tono = 'crema',
  seleccionado = false,
  estado = 'normal',
  inclinacion = 0,
  compacto = false,
  onClick,
  disabled = false,
}: {
  texto: string;
  tono?: TonoCubo;
  seleccionado?: boolean;
  estado?: 'normal' | 'correcto' | 'error';
  inclinacion?: number;
  compacto?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const w = compacto ? 106 : 118;
  const h = compacto ? 106 : 118;

  const paletaTono = {
    crema: {
      topStart: '#F0F9FF',
      topEnd: '#60A5FA',
      leftStart: '#3B82F6',
      leftEnd: '#1E3A8A',
      rightStart: '#2563EB',
      rightEnd: '#172554',
      topStroke: '#FFFFFF',
      sideStroke: '#BFDBFE',
      aura: 'rgba(147, 197, 253, 0.62)',
      orb: '#93C5FD',
    },
    amatista: {
      topStart: '#E0F2FE',
      topEnd: '#38BDF8',
      leftStart: '#0284C7',
      leftEnd: '#075985',
      rightStart: '#0369A1',
      rightEnd: '#082F49',
      topStroke: '#FFFFFF',
      sideStroke: '#BAE6FD',
      aura: 'rgba(56, 189, 248, 0.65)',
      orb: '#38BDF8',
    },
    esmeralda: {
      topStart: '#ECFDF5',
      topEnd: '#2DD4BF',
      leftStart: '#0D9488',
      leftEnd: '#115E59',
      rightStart: '#0F766E',
      rightEnd: '#134E4A',
      topStroke: '#FFFFFF',
      sideStroke: '#99F6E4',
      aura: 'rgba(45, 212, 191, 0.62)',
      orb: '#5EEAD4',
    },
    magenta: {
      topStart: '#ECFEFF',
      topEnd: '#00F5FF',
      leftStart: '#06B6D4',
      leftEnd: '#155E75',
      rightStart: '#0891B2',
      rightEnd: '#164E63',
      topStroke: '#FFFFFF',
      sideStroke: '#A5F3FC',
      aura: 'rgba(0, 245, 255, 0.64)',
      orb: '#67E8F9',
    },
  }[tono];

  const configVisual =
    estado === 'correcto'
      ? {
          topStart: '#ECFDF5',
          topEnd: '#10B981',
          leftStart: '#10B981',
          leftEnd: '#065F46',
          rightStart: '#059669',
          rightEnd: '#064E3B',
          topStroke: '#FFFFFF',
          sideStroke: '#A7F3D0',
          glow: '0 0 32px rgba(52, 211, 153, 0.9)',
          orb: '#6EE7B7',
        }
      : estado === 'error'
        ? {
            topStart: '#FFF1F2',
            topEnd: '#FB7185',
            leftStart: '#F43F5E',
            leftEnd: '#881337',
            rightStart: '#E11D48',
            rightEnd: '#4C0519',
            topStroke: '#FFFFFF',
            sideStroke: '#FECDD3',
            glow: '0 0 28px rgba(244, 63, 94, 0.85)',
            orb: '#FDA4AF',
          }
        : seleccionado
          ? {
              ...paletaTono,
              topStroke: '#FFFFFF',
              sideStroke: '#6EE7B7',
              glow: '0 0 34px rgba(110, 231, 183, 0.85), 0 0 20px rgba(192, 132, 252, 0.75)',
            }
          : {
              ...paletaTono,
              glow: `0 10px 26px ${paletaTono.aura}`,
            };

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -6, scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      animate={{ rotate: inclinacion }}
      onClick={onClick}
      disabled={disabled}
      className={`relative group select-none rounded-2xl focus-visible:outline-2 focus-visible:outline-cyan-300 focus-visible:outline-offset-4 transition-transform ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
      style={{
        width: w,
        height: h,
        filter: `drop-shadow(${configVisual.glow})`,
      }}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`top-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={configVisual.topStart} stopOpacity="0.95" />
            <stop offset="100%" stopColor={configVisual.topEnd} stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id={`left-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={configVisual.leftStart} stopOpacity="0.95" />
            <stop offset="100%" stopColor={configVisual.leftEnd} stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id={`right-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={configVisual.rightStart} stopOpacity="0.95" />
            <stop offset="100%" stopColor={configVisual.rightEnd} stopOpacity="0.98" />
          </linearGradient>
          <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={configVisual.orb} stopOpacity="0.55" />
            <stop offset="100%" stopColor={configVisual.orb} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Resplandor energético detrás del cubo */}
        <circle cx="60" cy="62" r="54" fill={`url(#halo-${uid})`} />

        {/* Halo exterior de selección */}
        {seleccionado && (
          <polygon
            points="60,5 113,34 60,115 7,34"
            fill="none"
            stroke="#6EE7B7"
            strokeWidth="2.4"
            strokeOpacity="0.95"
          />
        )}

        {/* Cara Izquierda cristalina */}
        <polygon
          points="14,38 60,62 60,108 14,84"
          fill={`url(#left-${uid})`}
          stroke={configVisual.sideStroke}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />

        {/* Brillo vertical interno izquierdo */}
        <polygon
          points="18,43 56,63 56,82 18,62"
          fill="#FFFFFF"
          fillOpacity="0.14"
        />

        {/* Cara Derecha cristalina */}
        <polygon
          points="106,38 60,62 60,108 106,84"
          fill={`url(#right-${uid})`}
          stroke={configVisual.sideStroke}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />

        {/* Brillo diagonal derecho */}
        <polygon
          points="64,63 102,43 102,58 64,78"
          fill="#FFFFFF"
          fillOpacity="0.10"
        />

        {/* Cara Superior iluminada */}
        <polygon
          points="60,14 106,38 60,62 14,38"
          fill={`url(#top-${uid})`}
          stroke={configVisual.topStroke}
          strokeWidth={seleccionado ? 2.6 : 2}
          strokeLinejoin="round"
        />

        {/* Reflejo especular Liquid Glass en la cara superior */}
        <polygon
          points="60,17 98,37 60,44 22,37"
          fill="#FFFFFF"
          fillOpacity="0.32"
        />

        {/* Arista central luminosa */}
        <line
          x1="60"
          y1="62"
          x2="60"
          y2="107"
          stroke="#FFFFFF"
          strokeOpacity="0.65"
          strokeWidth="1.6"
        />

        {/* Valor numérico / opción centrada con contraste nítido */}
        <text
          x="60"
          y={texto.length > 5 ? '39' : '38'}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#0F172A"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          paintOrder="stroke"
          fontSize={texto.length > 7 ? '14' : texto.length > 4 ? '18' : '25'}
          fontWeight="900"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            filter: 'drop-shadow(0 2px 6px rgba(15, 23, 42, 0.45))',
          }}
        >
          {texto}
        </text>
      </svg>
    </motion.button>
  );
}

/** Base del Reactor Cuántico luminosa con núcleo de plasma y 4 cápsulas de energía Liquid Glass. */
function BaseReactorCuantico({
  ranuras,
  onSlotClick,
}: {
  ranuras: (string | null)[];
  onSlotClick?: (idx: number) => void;
}) {
  const slots = [0, 1, 2, 3].map((i) => ranuras[i] ?? null);

  const posRanuras = [
    { left: '14%', top: '8%', rot: -6, accent: '#93C5FD' },
    { left: '38%', top: '0%', rot: -2, accent: '#C084FC' },
    { left: '62%', top: '0%', rot: 2, accent: '#6EE7B7' },
    { left: '86%', top: '8%', rot: 6, accent: '#E879F9' },
  ];

  return (
    <div className="relative w-full max-w-[660px] h-40 sm:h-46 mx-auto select-none flex items-end justify-center">
      {/* Resplandor volumétrico ascendente del reactor */}
      <div
        className="pointer-events-none absolute inset-x-10 bottom-2 h-32 rounded-full blur-2xl opacity-85"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(110, 231, 183, 0.42) 0%, rgba(192, 132, 252, 0.38) 45%, rgba(59, 130, 246, 0.15) 75%, transparent 100%)',
        }}
      />

      {/* Plataforma Elíptica del Reactor Cuántico */}
      <svg viewBox="0 0 680 185" className="w-full h-36 sm:h-40 overflow-visible">
        <defs>
          <radialGradient id="reactorOuterFloor" cx="50%" cy="48%" r="55%">
            <stop offset="0%" stopColor="#312E81" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#1E3A8A" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.96" />
          </radialGradient>
          <radialGradient id="reactorInnerChamber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#581C87" />
            <stop offset="55%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#090D24" />
          </radialGradient>
          <linearGradient id="reactorRimBright" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="35%" stopColor="#E879F9" />
            <stop offset="70%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#BFDBFE" />
          </linearGradient>
          <radialGradient id="reactorCoreBright" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#6EE7B7" />
            <stop offset="70%" stopColor="#C084FC" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra proyectada y halo exterior */}
        <ellipse cx="340" cy="126" rx="315" ry="54" fill="rgba(15, 23, 42, 0.75)" />
        <ellipse
          cx="340"
          cy="120"
          rx="304"
          ry="52"
          fill="none"
          stroke="url(#reactorRimBright)"
          strokeOpacity="0.55"
          strokeWidth="2.5"
        />

        {/* Anillo principal iluminado */}
        <ellipse
          cx="340"
          cy="115"
          rx="282"
          ry="49"
          fill="url(#reactorOuterFloor)"
          stroke="url(#reactorRimBright)"
          strokeWidth="3"
        />

        {/* Anillo intermedio con segmentos de energía */}
        <ellipse
          cx="340"
          cy="111"
          rx="238"
          ry="40"
          fill="url(#reactorInnerChamber)"
          stroke="#E2EEFF"
          strokeOpacity="0.8"
          strokeWidth="2.2"
        />

        {/* Pista de energía segmentada */}
        <ellipse
          cx="340"
          cy="110"
          rx="192"
          ry="31"
          fill="none"
          stroke="#6EE7B7"
          strokeOpacity="0.85"
          strokeWidth="2"
          strokeDasharray="16 10"
        />
        <ellipse
          cx="340"
          cy="110"
          rx="145"
          ry="23"
          fill="none"
          stroke="#E879F9"
          strokeOpacity="0.8"
          strokeWidth="1.8"
          strokeDasharray="10 8"
        />

        {/* Rayos radiales hacia el núcleo */}
        <line x1="160" y1="110" x2="275" y2="110" stroke="#93C5FD" strokeOpacity="0.55" strokeWidth="2.2" />
        <line x1="405" y1="110" x2="520" y2="110" stroke="#6EE7B7" strokeOpacity="0.55" strokeWidth="2.2" />

        {/* Nodos luminosos orbitales */}
        <circle cx="96" cy="115" r="5" fill="#93C5FD" />
        <circle cx="215" cy="148" r="4.5" fill="#E879F9" />
        <circle cx="465" cy="148" r="4.5" fill="#6EE7B7" />
        <circle cx="584" cy="115" r="5" fill="#C084FC" />

        {/* Núcleo central de plasma cuántico */}
        <ellipse
          cx="340"
          cy="108"
          rx="68"
          ry="19"
          fill="#312E81"
          stroke="#FFFFFF"
          strokeOpacity="0.85"
          strokeWidth="2"
        />
        <ellipse cx="340" cy="107" rx="52" ry="15" fill="url(#reactorCoreBright)" />
        <ellipse cx="340" cy="106" rx="22" ry="6.5" fill="#FFFFFF" />
      </svg>

      {/* 4 Ranuras en Cápsulas Liquid Glass Luminosas */}
      {slots.map((valor, idx) => {
        const cfg = posRanuras[idx % 4];
        const lleno = Boolean(valor);
        return (
          <div
            key={idx}
            onClick={() => onSlotClick?.(idx)}
            style={{
              left: cfg.left,
              top: cfg.top,
              transform: `translate(-50%, 0) rotate(${cfg.rot}deg)`,
            }}
            className={`absolute flex flex-col items-center ${
              lleno && onSlotClick ? 'cursor-pointer' : ''
            }`}
          >
            {/* Haz de luz holográfico hacia el cubo */}
            <div
              className="pointer-events-none absolute -top-12 w-20 sm:w-24 h-14"
              style={{
                background: lleno
                  ? 'linear-gradient(180deg, transparent 0%, rgba(110,231,183,0.32) 45%, rgba(110,231,183,0.82) 100%)'
                  : 'linear-gradient(180deg, transparent 0%, rgba(192,132,252,0.22) 50%, rgba(147,197,253,0.62) 100%)',
                clipPath: 'polygon(16% 0%, 84% 0%, 100% 100%, 0% 100%)',
              }}
            />
            <div
              className="w-18 sm:w-24 h-10 sm:h-12 rounded-xl flex items-center justify-center transition-all liquid-glass-pill"
              style={{
                background: lleno
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(139, 92, 246, 0.78) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.42) 0%, rgba(88, 28, 135, 0.52) 100%)',
                borderColor: lleno ? '#A7F3D0' : 'rgba(191, 219, 254, 0.65)',
                boxShadow: lleno
                  ? '0 0 24px rgba(52, 211, 153, 0.7), inset 0 1px 2px rgba(255,255,255,0.65)'
                  : '0 0 16px rgba(147, 197, 253, 0.32), inset 0 1px 2px rgba(255,255,255,0.35)',
              }}
            >
              <span
                className="font-black text-xs sm:text-base tracking-wider"
                style={{
                  color: lleno ? '#FFFFFF' : '#E2EEFF',
                  fontFamily: "'Orbitron', sans-serif",
                  textShadow: lleno
                    ? '0 0 10px rgba(255,255,255,0.75)'
                    : '0 0 8px rgba(147,197,253,0.55)',
                }}
              >
                {valor ?? `◈ 0${idx + 1}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════ TARJETA 1: REACTOR DE PROPULSIÓN / CÁMARA DE CÁLCULO ════════════════════════ */

interface ModalReactorProps {
  modo: 'secuencia' | 'pregunta';
  estrellas: number;
  nucleosActivos: number;
  secuencia?: number[];
  seleccionSecuencia?: number[];
  estadoSecuencia?: 'idle' | 'correct' | 'incorrect';
  onToggleNumeroSecuencia?: (num: number) => void;
  onConfirmarSecuencia?: () => void;
  pregunta?: PreguntaMatematica;
  opcionSeleccionada?: number | null;
  estadoPregunta?: 'idle' | 'correct' | 'incorrect';
  onSeleccionarOpcion?: (idx: number) => void;
  onConfirmarPregunta?: () => void;
  onSafeExit: () => void;
}

export function ModalReactorCuantico({
  modo,
  estrellas,
  nucleosActivos,
  secuencia = [],
  seleccionSecuencia = [],
  estadoSecuencia = 'idle',
  onToggleNumeroSecuencia,
  onConfirmarSecuencia,
  pregunta,
  opcionSeleccionada = null,
  estadoPregunta = 'idle',
  onSeleccionarOpcion,
  onConfirmarPregunta,
  onSafeExit,
}: ModalReactorProps) {
  const esSecuencia = modo === 'secuencia';
  const estadoActual = esSecuencia ? estadoSecuencia : estadoPregunta;
  const tonosCubos: TonoCubo[] = ['crema', 'amatista', 'esmeralda', 'magenta'];
  const retoKey = esSecuencia ? `seq-${secuencia.join('-')}` : `preg-${pregunta?.id ?? ''}`;

  const [pistaKey, setPistaKey] = useState<string | null>(null);
  const [pizarraKey, setPizarraKey] = useState<string | null>(null);
  const mostrarPista = pistaKey === retoKey;
  const mostrarPizarra = pizarraKey === retoKey;

  useModalEscape({
    isOpen: true,
    onEscape: onSafeExit,
    priority: 'modal',
  });

  useHintShortcut({
    isOpen: true,
    onToggle: () => setPistaKey((prev) => (prev === retoKey ? null : retoKey)),
    disabled: mostrarPizarra,
  });

  const handleTogglePista = () => {
    setPistaKey((prev) => (prev === retoKey ? null : retoKey));
  };

  const handleTogglePizarra = () => {
    setPizarraKey((prev) => {
      const nextOpen = prev !== retoKey;
      if (nextOpen) playStep();
      return nextOpen ? retoKey : null;
    });
  };

  const textoPista = esSecuencia
    ? 'Compara las decenas de cada cubo y colócalos del número más pequeño al más grande.'
    : pregunta?.pista ??
      pregunta?.explicacionBreve ??
      'Descompón los números en decenas y unidades para calcular con facilidad.';

  const ranurasReactor: (string | null)[] = esSecuencia
    ? [0, 1, 2, 3].map((i) =>
        seleccionSecuencia[i] !== undefined ? String(seleccionSecuencia[i]) : null,
      )
    : [0, 1, 2, 3].map((i) =>
        opcionSeleccionada === i && pregunta ? pregunta.opciones[i] : null,
      );

  const resumenPizarra = esSecuencia
    ? `Ordena de menor a mayor: ${secuencia.join(', ')}`
    : pregunta?.enunciado;

  return (
    <>
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={esSecuencia ? 'Reactor de Propulsión Cuántica' : 'Cámara de Cálculo Cuántico'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(23, 37, 84, 0.72) 0%, rgba(6, 10, 26, 0.86) 78%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-[850px] rounded-3xl liquid-glass-modal p-3.5 sm:p-4 my-auto"
        style={{
          background:
            'linear-gradient(145deg, rgba(30, 58, 138, 0.45) 0%, rgba(49, 46, 129, 0.48) 50%, rgba(15, 23, 42, 0.75) 100%)',
          borderColor: 'rgba(191, 219, 254, 0.55)',
          boxShadow:
            '0 25px 70px rgba(2, 6, 23, 0.75), 0 0 50px rgba(139, 92, 246, 0.28), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
        }}
      >
        {/* Cápsula Interior en Doble Encapsulado Liquid Glass Luminoso */}
        <div
          className="relative rounded-2xl liquid-glass px-5 sm:px-8 py-6 sm:py-7 flex flex-col justify-between gap-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 50% 18%, rgba(79, 70, 229, 0.45) 0%, rgba(30, 58, 138, 0.52) 45%, rgba(15, 23, 52, 0.82) 100%)',
            borderColor: 'rgba(226, 238, 255, 0.42)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.35)',
          }}
        >
          {/* Nebulosas de luz ambiental para dar vida y color al fondo del modal */}
          <div
            className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, transparent 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.45) 0%, transparent 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[480px] h-56 rounded-full blur-3xl opacity-75"
            style={{
              background:
                'radial-gradient(ellipse, rgba(52, 211, 153, 0.38) 0%, rgba(168, 85, 247, 0.28) 55%, transparent 80%)',
            }}
          />

          {/* ── CABECERA LUMINOSA LIQUID GLASS ── */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20">
            <div className="flex items-center gap-3.5">
              <EsferaArmilarMini />
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#6EE7B7]">
                  {esSecuencia ? '✦ Módulo de Propulsión' : '✦ Cámara de Precisión'}
                </span>
                <h2
                  className="text-base sm:text-xl font-black tracking-wide uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E2EEFF 45%, #E9D5FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Orbitron', sans-serif",
                    filter: 'drop-shadow(0 2px 10px rgba(192, 132, 252, 0.45))',
                  }}
                >
                  {esSecuencia ? 'REACTOR DE PROPULSIÓN CUÁNTICA' : 'CÁMARA DE CÁLCULO CUÁNTICO'}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <BotonPizarraCalculo activa={mostrarPizarra} onClick={handleTogglePizarra} />
              <BotonPistaCuantica activa={mostrarPista} onClick={handleTogglePista} />

              <div
                className="liquid-glass-pill inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-black text-white"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(16, 185, 129, 0.42) 0%, rgba(30, 58, 138, 0.6) 100%)',
                  borderColor: 'rgba(110, 231, 183, 0.65)',
                  boxShadow: '0 0 14px rgba(52, 211, 153, 0.3)',
                }}
              >
                <span className="text-[#6EE7B7]">◈</span>
                <span>{nucleosActivos}/4</span>
              </div>

              {estrellas > 0 && (
                <div
                  className="liquid-glass-pill inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-black text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(168, 85, 247, 0.48) 0%, rgba(16, 185, 129, 0.42) 100%)',
                    borderColor: 'rgba(233, 213, 255, 0.65)',
                  }}
                >
                  <span>⭐</span>
                  <span>{estrellas}</span>
                </div>
              )}

              <BotonSalidaMinijuego onSafeExit={onSafeExit} />
            </div>
          </div>

          <div className="relative z-20 flex flex-col justify-between gap-4">

          {/* ── CONSIGNA / ENUNCIADO LUMINOSO ── */}
          <div className="relative z-20 text-center px-1">
            {esSecuencia ? (
              <div
                className="max-w-2xl mx-auto px-5 py-3.5 rounded-2xl liquid-glass-pill"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(67, 56, 202, 0.52) 0%, rgba(16, 185, 129, 0.32) 100%)',
                  borderColor: 'rgba(167, 243, 208, 0.55)',
                  boxShadow: '0 0 25px rgba(99, 102, 241, 0.28)',
                }}
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#A7F3D0] mb-1">
                  ✦ Secuencia de Propulsión · Ordena de Menor a Mayor ✦
                </p>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Calcula y encaja la energía
                </h3>
              </div>
            ) : (
              <div
                className="max-w-2xl mx-auto px-6 py-4 rounded-2xl liquid-glass-pill"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(55, 48, 163, 0.62) 0%, rgba(30, 64, 175, 0.55) 50%, rgba(109, 40, 217, 0.48) 100%)',
                  borderColor: 'rgba(191, 219, 254, 0.55)',
                  boxShadow:
                    '0 10px 30px rgba(15, 23, 42, 0.45), 0 0 24px rgba(147, 197, 253, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                }}
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#6EE7B7] mb-1.5">
                  🛰️ Reto de Cálculo Cuántico {pregunta?.operador ? `· ${pregunta.operador}` : ''}
                </p>
                <h3 className="text-base sm:text-xl font-black text-white leading-snug drop-shadow-[0_2px_8px_rgba(15,23,42,0.6)]">
                  {pregunta?.enunciado}
                </h3>
              </div>
            )}
          </div>

          {/* ── PISTA CUÁNTICA DESPLEGABLE ── */}
          <AnimatePresence>
            {mostrarPista && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="relative z-30 mx-auto max-w-xl rounded-2xl px-4 py-2.5 liquid-glass-pill text-white text-xs sm:text-sm font-semibold text-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(147, 51, 234, 0.58) 0%, rgba(30, 58, 138, 0.78) 100%)',
                  borderColor: 'rgba(233, 213, 255, 0.72)',
                  boxShadow: '0 0 22px rgba(192, 132, 252, 0.45)',
                }}
              >
                💡 <strong className="text-[#A7F3D0]">Pista Cuántica:</strong> {textoPista}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 4 CUBOS CUÁNTICOS CRISTALINOS MULTICOLOR ── */}
          <div className="relative z-20 flex flex-wrap items-center justify-center gap-3.5 sm:gap-7 py-1">
            {esSecuencia &&
              secuencia.map((num, idx) => {
                const yaElegido = seleccionSecuencia.includes(num);
                const inclinaciones = [-6, -2, 2, 6];
                return (
                  <CuboCuantico3D
                    key={num}
                    texto={String(num)}
                    tono={tonosCubos[idx % 4]}
                    seleccionado={yaElegido}
                    estado={
                      estadoSecuencia === 'correct'
                        ? 'correcto'
                        : estadoSecuencia === 'incorrect' && yaElegido
                          ? 'error'
                          : 'normal'
                    }
                    inclinacion={inclinaciones[idx % 4]}
                    onClick={() => onToggleNumeroSecuencia?.(num)}
                    disabled={estadoSecuencia !== 'idle'}
                  />
                );
              })}

            {!esSecuencia &&
              pregunta?.opciones.map((opt, idx) => {
                const elegida = opcionSeleccionada === idx;
                const esCorrecta = idx === pregunta.indiceRespuestaCorrecta;
                const inclinaciones = [-5, -1.5, 1.5, 5];
                return (
                  <CuboCuantico3D
                    key={idx}
                    texto={opt}
                    tono={tonosCubos[idx % 4]}
                    seleccionado={elegida}
                    estado={
                      estadoPregunta === 'idle'
                        ? 'normal'
                        : esCorrecta
                          ? 'correcto'
                          : elegida
                            ? 'error'
                            : 'normal'
                    }
                    inclinacion={inclinaciones[idx % 4]}
                    onClick={() => onSeleccionarOpcion?.(idx)}
                    disabled={estadoPregunta !== 'idle'}
                  />
                );
              })}
          </div>

          {/* ── BASE DEL REACTOR ORBITAL LUMINOSA ── */}
          <div className="relative z-10 -my-1">
            <BaseReactorCuantico
              ranuras={ranurasReactor}
              onSlotClick={(slotIdx) => {
                if (esSecuencia && seleccionSecuencia[slotIdx] !== undefined) {
                  onToggleNumeroSecuencia?.(seleccionSecuencia[slotIdx]);
                }
              }}
            />
          </div>

          {/* ── RETROALIMENTACIÓN / EXPLICACIÓN ── */}
          <AnimatePresence>
            {estadoActual !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="relative z-30 mx-auto max-w-2xl rounded-2xl px-5 py-3 liquid-glass-pill text-xs sm:text-sm font-semibold text-center"
                style={{
                  background:
                    estadoActual === 'correct'
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.52) 0%, rgba(6, 78, 59, 0.88) 100%)'
                      : 'linear-gradient(135deg, rgba(244, 63, 94, 0.48) 0%, rgba(136, 19, 55, 0.88) 100%)',
                  borderColor:
                    estadoActual === 'correct'
                      ? 'rgba(167, 243, 208, 0.85)'
                      : 'rgba(253, 164, 175, 0.8)',
                  color: '#FFFFFF',
                  boxShadow:
                    estadoActual === 'correct'
                      ? '0 0 24px rgba(52, 211, 153, 0.45)'
                      : '0 0 24px rgba(244, 63, 94, 0.4)',
                }}
              >
                {esSecuencia ? (
                  estadoSecuencia === 'correct' ? (
                    <span>
                      🚀 <strong>¡PROPULSIÓN CUÁNTICA ACTIVADA!</strong> Orden correcto de menor a
                      mayor ({[...secuencia].sort((a, b) => a - b).join(' → ')}). ¡Avanzas +2
                      casillas y activas un Núcleo Cuántico!
                    </span>
                  ) : (
                    <span>
                      ⚠️ <strong>Secuencia descalibrada.</strong> El orden correcto de menor a
                      mayor era: {[...secuencia].sort((a, b) => a - b).join(' → ')}.
                    </span>
                  )
                ) : estadoPregunta === 'correct' ? (
                  <span>
                    ✨ <strong>¡CÁLCULO EXACTO!</strong> {pregunta?.explicacionBreve}
                  </span>
                ) : (
                  <span>
                    ⚠️ <strong>Sistema descalibrado:</strong> {pregunta?.explicacionBreve}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── BOTÓN DE ACCIÓN PRINCIPAL RADIANTE EN LIQUID GLASS ── */}
          <div className="relative z-20 flex justify-center pt-1">
            <button
              type="button"
              onClick={esSecuencia ? onConfirmarSecuencia : onConfirmarPregunta}
              className="liquid-glass-btn px-10 sm:px-14 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-[0.22em] text-white uppercase cursor-pointer"
              style={{
                background:
                  estadoActual !== 'idle'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.88) 0%, rgba(52, 211, 153, 0.78) 100%)'
                    : 'linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(168, 85, 247, 0.85) 50%, rgba(16, 185, 129, 0.82) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.75)',
                boxShadow:
                  '0 0 28px rgba(168, 85, 247, 0.55), 0 0 18px rgba(52, 211, 153, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
              }}
            >
              {estadoActual !== 'idle'
                ? 'CONTINUAR ✦'
                : esSecuencia
                  ? 'ACTIVAR PROPULSIÓN'
                  : 'COMPROBAR CÁLCULO'}
            </button>
          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>

    <AnimatePresence>
      {mostrarPizarra && (
        <PizarraHolografica
          key={retoKey}
          preguntaResumen={resumenPizarra}
          onClose={() => setPizarraKey(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}

/* ════════════════════════ TARJETA 2: ALERTA DE IMPACTO — ESCUDO ANTIMATERIA ════════════════════════ */

export interface CondicionAsteroide {
  etiqueta: string;
  explicacion: string;
  cumple: (n: number) => boolean;
}

interface ModalAlertaImpactoProps {
  asteroides: number[];
  condicion: CondicionAsteroide;
  seleccionadoIdx: number | null;
  estado: 'idle' | 'correct' | 'incorrect';
  onDisparar: (idx: number) => void;
  onCerrar: () => void;
  onSafeExit: () => void;
}

/** Asteroide Espacial 3D luminoso con cristales en paleta Azul Crema, Morado y Esmeralda + mira [ ]. */
function AsteroideCristalSVG({
  numero,
  variante,
  seleccionado,
  estado,
  esCorrecto,
  onClick,
  disabled,
}: {
  numero: number;
  variante: 'crema' | 'magenta' | 'esmeralda';
  seleccionado: boolean;
  estado: 'idle' | 'correct' | 'incorrect';
  esCorrecto: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const cfg = {
    crema: {
      c1: '#BFDBFE',
      c2: '#3B82F6',
      rockTop: '#3B82F6',
      rockBase: '#1E3A8A',
      glow: 'rgba(147, 197, 253, 0.72)',
      bracket: '#E0F2FE',
    },
    magenta: {
      c1: '#F5D0FE',
      c2: '#C026D3',
      rockTop: '#9333EA',
      rockBase: '#4C1D95',
      glow: 'rgba(232, 121, 249, 0.72)',
      bracket: '#F5D0FE',
    },
    esmeralda: {
      c1: '#A7F3D0',
      c2: '#10B981',
      rockTop: '#059669',
      rockBase: '#064E3B',
      glow: 'rgba(52, 211, 153, 0.72)',
      bracket: '#A7F3D0',
    },
  }[variante];

  const colorMira =
    estado !== 'idle' && esCorrecto
      ? '#6EE7B7'
      : estado === 'incorrect' && seleccionado
        ? '#FB7185'
        : seleccionado
          ? '#FFFFFF'
          : cfg.bracket;

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -5, scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl flex items-center justify-center select-none focus-visible:outline-2 focus-visible:outline-cyan-300 focus-visible:outline-offset-4 ${
        disabled ? 'cursor-default' : 'cursor-crosshair'
      }`}
      style={{
        filter: `drop-shadow(0 0 24px ${cfg.glow})`,
      }}
    >
      <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible">
        {/* Mira táctica luminosa [ ] */}
        <g stroke={colorMira} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M 18 36 V 18 H 36" />
          <path d="M 142 36 V 18 H 124" />
          <path d="M 18 124 V 142 H 36" />
          <path d="M 142 124 V 142 H 124" />
        </g>

        {/* Cuerpo rocoso 3D iluminado */}
        <polygon
          points="80,16 122,28 144,66 134,114 96,142 52,138 20,108 18,58 44,24"
          fill={cfg.rockBase}
          stroke={cfg.c1}
          strokeOpacity="0.85"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <polygon points="80,16 122,28 106,58 64,46" fill={cfg.rockTop} fillOpacity="0.65" />
        <polygon points="20,108 52,138 96,142 134,114 102,94 48,96" fill="#0F172A" fillOpacity="0.55" />

        {/* Cristales incrustados brillantes */}
        <polygon points="80,22 100,52 80,68 60,52" fill={cfg.c1} stroke="#FFFFFF" strokeWidth="1.4" />
        <polygon points="40,56 68,72 52,100 30,82" fill={cfg.c2} stroke={cfg.c1} strokeWidth="1.4" />
        <polygon points="118,58 130,88 102,100 92,72" fill={cfg.c1} stroke="#FFFFFF" strokeWidth="1.4" />
        <polygon points="78,96 100,120 76,134 56,116" fill={cfg.c1} stroke="#FFFFFF" strokeWidth="1.4" />

        {/* Núcleo central luminoso con el número */}
        <circle cx="80" cy="82" r="35" fill="#1E1B4B" stroke="#FFFFFF" strokeWidth="2.4" />
        <circle cx="80" cy="82" r="29" fill={cfg.c2} fillOpacity="0.35" />
        <text
          x="80"
          y="83"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="36"
          fontWeight="900"
          fill="#FFFFFF"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            filter: 'drop-shadow(0 2px 8px rgba(2,6,23,0.95))',
          }}
        >
          {numero}
        </text>
      </svg>
    </motion.button>
  );
}

/** Torreta / Cañón Deflector de Escudo Antimateria luminoso. */
function TorretaAntimateriaSVG({ angulo }: { angulo: number }) {
  return (
    <div className="relative w-44 h-30 flex items-center justify-center select-none pointer-events-none">
      <svg viewBox="0 0 180 130" className="w-full h-full overflow-visible">
        <ellipse cx="90" cy="112" rx="58" ry="14" fill="#1E3A8A" stroke="#BFDBFE" strokeWidth="2.2" />
        <ellipse cx="90" cy="106" rx="42" ry="10" fill="#4C1D95" stroke="#E9D5FF" strokeWidth="1.8" />

        <g transform={`translate(90 96) rotate(${angulo})`}>
          {/* Conductos de plasma morado/esmeralda */}
          <path
            d="M -25 -6 C -44 -12, -44 16, -21 12"
            fill="none"
            stroke="#E879F9"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M 25 -6 C 44 -12, 44 16, 21 12"
            fill="none"
            stroke="#6EE7B7"
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          {/* Chasis central */}
          <rect x="-24" y="-26" width="48" height="36" rx="10" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="-15" y="-19" width="30" height="22" rx="5" fill="#7E22CE" stroke="#F0F6FF" strokeWidth="1.5" />

          {/* Cañón anillado */}
          {[-34, -44, -54, -64].map((ky, i) => (
            <rect
              key={i}
              x={-13 + i * 1.4}
              y={ky}
              width={26 - i * 2.8}
              height="6.5"
              rx="2.5"
              fill={i % 2 === 0 ? '#BFDBFE' : '#C084FC'}
              stroke="#1E1B4B"
              strokeWidth="1.1"
            />
          ))}
          <circle cx="0" cy="-72" r="7.5" fill="#FFFFFF" stroke="#6EE7B7" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}

export function ModalAlertaImpacto({
  asteroides,
  condicion,
  seleccionadoIdx,
  estado,
  onDisparar,
  onCerrar,
  onSafeExit,
}: ModalAlertaImpactoProps) {
  const angulos = [-34, 0, 34];
  const anguloTorreta = seleccionadoIdx !== null ? angulos[seleccionadoIdx] ?? 0 : 0;
  const alertaKey = `${condicion.etiqueta}-${asteroides.join('-')}`;
  const [pizarraKey, setPizarraKey] = useState<string | null>(null);
  const mostrarPizarra = pizarraKey === alertaKey;

  useModalEscape({
    isOpen: true,
    onEscape: onSafeExit,
    priority: 'modal',
  });

  const handleTogglePizarra = () => {
    setPizarraKey((prev) => {
      const nextOpen = prev !== alertaKey;
      if (nextOpen) playStep();
      return nextOpen ? alertaKey : null;
    });
  };

  const resumenPizarra = `Dispara al asteroide ${condicion.etiqueta}: ${asteroides.join(' · ')}`;

  return (
    <>
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Alerta de Impacto Escudo Antimateria"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(46, 16, 101, 0.72) 0%, rgba(6, 10, 26, 0.88) 78%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-[850px] rounded-3xl liquid-glass-modal p-3.5 sm:p-4 my-auto"
        style={{
          background:
            'linear-gradient(145deg, rgba(109, 40, 217, 0.45) 0%, rgba(30, 58, 138, 0.48) 50%, rgba(15, 23, 42, 0.78) 100%)',
          borderColor: 'rgba(240, 171, 252, 0.6)',
          boxShadow:
            '0 25px 70px rgba(2, 6, 23, 0.75), 0 0 50px rgba(217, 70, 239, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
        }}
      >
        {/* Consola Interior Liquid Glass Luminosa */}
        <div
          className="relative rounded-2xl liquid-glass px-5 sm:px-8 py-6 sm:py-7 flex flex-col justify-between gap-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(126, 34, 206, 0.45) 0%, rgba(30, 58, 138, 0.52) 52%, rgba(15, 23, 52, 0.84) 100%)',
            borderColor: 'rgba(245, 208, 254, 0.45)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.35)',
          }}
        >
          {/* Nebulosas de luz ambiental */}
          <div
            className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl opacity-75"
            style={{
              background: 'radial-gradient(circle, rgba(232, 121, 249, 0.45) 0%, transparent 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 right-0 w-80 h-72 rounded-full blur-3xl opacity-75"
            style={{
              background: 'radial-gradient(circle, rgba(52, 211, 153, 0.42) 0%, transparent 70%)',
            }}
          />

          {/* Radar Holográfico Luminoso */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-[310px] h-[310px] rounded-full border-2 border-[#E879F9] flex items-center justify-center">
              <div className="w-[215px] h-[215px] rounded-full border border-[#93C5FD] flex items-center justify-center">
                <div className="w-[125px] h-[125px] rounded-full border-2 border-dashed border-[#6EE7B7]" />
              </div>
            </div>
            <div className="absolute w-[350px] h-px bg-[#BFDBFE]/60" />
            <div className="absolute h-[350px] w-px bg-[#BFDBFE]/60" />
          </div>

          {/* Cabecera */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center text-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(192, 38, 211, 0.55) 0%, rgba(79, 70, 229, 0.55) 100%)',
                  borderColor: 'rgba(245, 208, 254, 0.75)',
                }}
              >
                🛡️
              </div>
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#F5D0FE]">
                  ✦ Escudo Antimateria
                </span>
                <h2
                  className="text-base sm:text-xl font-black tracking-wide uppercase text-white"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    filter: 'drop-shadow(0 2px 10px rgba(232, 121, 249, 0.5))',
                  }}
                >
                  ALERTA DE IMPACTO
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <BotonPizarraCalculo activa={mostrarPizarra} onClick={handleTogglePizarra} />
              <span
                className="liquid-glass-pill px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-white"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(192, 38, 211, 0.55) 0%, rgba(16, 185, 129, 0.45) 100%)',
                  borderColor: 'rgba(245, 208, 254, 0.75)',
                }}
              >
                ● Radar Activo
              </span>
              <BotonSalidaMinijuego onSafeExit={onSafeExit} />
            </div>
          </div>

          <div className="relative z-20 flex flex-col justify-between gap-4">

          {/* Consigna dinámica */}
          <div className="relative z-20 text-center max-w-xl mx-auto px-2">
            <p className="text-sm sm:text-lg font-extrabold text-white leading-relaxed">
              ¡Dispara al asteroide con número{' '}
              <span
                className="inline-block mx-1 px-4 py-1 rounded-xl font-black text-white liquid-glass-pill"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(168, 85, 247, 0.85) 0%, rgba(16, 185, 129, 0.78) 100%)',
                  borderColor: '#FFFFFF',
                  boxShadow: '0 0 20px rgba(192, 132, 252, 0.6)',
                }}
              >
                {condicion.etiqueta}
              </span>{' '}
              para activar el escudo!
            </p>
          </div>

          {/* 3 Asteroides Cristalinos 3D */}
          <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 sm:gap-8 my-1">
            {asteroides.map((num, idx) => {
              const variantes: ('crema' | 'magenta' | 'esmeralda')[] = [
                'crema',
                'magenta',
                'esmeralda',
              ];
              return (
                <AsteroideCristalSVG
                  key={idx}
                  numero={num}
                  variante={variantes[idx % 3]}
                  seleccionado={seleccionadoIdx === idx}
                  estado={estado}
                  esCorrecto={condicion.cumple(num)}
                  onClick={() => onDisparar(idx)}
                  disabled={estado !== 'idle'}
                />
              );
            })}
          </div>

          {/* Torreta + Láser */}
          <div className="relative z-20 flex flex-col items-center -mb-2">
            <AnimatePresence>
              {seleccionadoIdx !== null && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    transformOrigin: 'bottom center',
                    rotate: `${anguloTorreta}deg`,
                  }}
                  className="pointer-events-none absolute bottom-24 w-2.5 h-36 rounded-full bg-white shadow-[0_0_22px_#6EE7B7,0_0_40px_#E879F9]"
                />
              )}
            </AnimatePresence>

            <TorretaAntimateriaSVG angulo={anguloTorreta} />
          </div>

          {/* Retroalimentación */}
          <AnimatePresence>
            {estado !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-30 mx-auto max-w-xl rounded-2xl px-5 py-3.5 liquid-glass-pill flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{
                  background:
                    estado === 'correct'
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.55) 0%, rgba(6, 78, 59, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(244, 63, 94, 0.52) 0%, rgba(136, 19, 55, 0.9) 100%)',
                  borderColor:
                    estado === 'correct'
                      ? 'rgba(167, 243, 208, 0.85)'
                      : 'rgba(253, 164, 175, 0.85)',
                  color: '#FFFFFF',
                }}
              >
                <div className="text-xs sm:text-sm font-semibold text-center sm:text-left">
                  {estado === 'correct' ? (
                    <span>
                      🛡️ <strong>¡ESCUDO ANTIMATERIA ACTIVADO!</strong> {condicion.explicacion}
                    </span>
                  ) : (
                    <span>
                      💥 <strong>¡IMPACTO EN EL ESCUDO!</strong> Retrocedes 2 casillas.{' '}
                      {condicion.explicacion}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onCerrar}
                  className="shrink-0 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider liquid-glass-btn text-white cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(16, 185, 129, 0.85) 100%)',
                    borderColor: '#FFFFFF',
                  }}
                >
                  CONTINUAR ✦
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>

    <AnimatePresence>
      {mostrarPizarra && (
        <PizarraHolografica
          key={alertaKey}
          preguntaResumen={resumenPizarra}
          onClose={() => setPizarraKey(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}

/* ════════════════════════ TARJETA 3: GUARDIÁN DEL NIVEL — NÚCLEO ARMILAR ════════════════════════ */

interface ModalGuardianArmilarProps {
  reto: RetoArmilarBoss;
  faseActual: 1 | 2 | 3;
  nucleos: boolean[];
  estrellas: number;
  opcionElegida: number | null;
  estado: 'idle' | 'correct' | 'incorrect';
  onElegirOpcion: (idx: number) => void;
  onAlinearAnillo: () => void;
  onSafeExit: () => void;
}

export function ModalGuardianArmilar({
  reto,
  faseActual,
  nucleos,
  estrellas,
  opcionElegida,
  estado,
  onElegirOpcion,
  onAlinearAnillo,
  onSafeExit,
}: ModalGuardianArmilarProps) {
  const tonosBoss: TonoCubo[] = ['crema', 'amatista', 'esmeralda'];
  const bossKey = `${reto.id}-${faseActual}`;
  const [pistaKey, setPistaKey] = useState<string | null>(null);
  const [pizarraKey, setPizarraKey] = useState<string | null>(null);
  const mostrarPista = pistaKey === bossKey;
  const mostrarPizarra = pizarraKey === bossKey;

  useModalEscape({
    isOpen: true,
    onEscape: onSafeExit,
    priority: 'modal',
  });

  useHintShortcut({
    isOpen: true,
    onToggle: () => setPistaKey((prev) => (prev === bossKey ? null : bossKey)),
    disabled: mostrarPizarra,
  });

  const handleTogglePista = () => {
    setPistaKey((prev) => (prev === bossKey ? null : bossKey));
  };

  const handleTogglePizarra = () => {
    setPizarraKey((prev) => {
      const nextOpen = prev !== bossKey;
      if (nextOpen) playStep();
      return nextOpen ? bossKey : null;
    });
  };

  const ranurasBoss: (string | null)[] = [0, 1, 2].map((i) =>
    opcionElegida === i ? reto.opciones[i] : null,
  );

  return (
    <>
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Guardián del Nivel Núcleo Armilar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(30, 27, 75, 0.75) 0%, rgba(6, 10, 26, 0.88) 78%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-[870px] rounded-3xl liquid-glass-modal p-3.5 sm:p-4 my-auto"
        style={{
          background:
            'linear-gradient(145deg, rgba(67, 56, 202, 0.48) 0%, rgba(109, 40, 217, 0.45) 50%, rgba(15, 23, 42, 0.78) 100%)',
          borderColor: 'rgba(221, 214, 254, 0.6)',
          boxShadow:
            '0 25px 70px rgba(2, 6, 23, 0.75), 0 0 55px rgba(168, 85, 247, 0.32), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
        }}
      >
        {/* Interior en Doble Encapsulado Liquid Glass Luminoso */}
        <div
          className="relative rounded-2xl liquid-glass px-5 sm:px-8 py-6 sm:py-7 flex flex-col justify-between gap-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 54% 35%, rgba(91, 33, 182, 0.48) 0%, rgba(30, 58, 138, 0.52) 50%, rgba(15, 23, 52, 0.84) 100%)',
            borderColor: 'rgba(233, 213, 255, 0.45)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.35)',
          }}
        >
          {/* Nebulosas de luz ambiental */}
          <div
            className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl opacity-75"
            style={{
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, transparent 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute -top-12 right-0 w-72 h-72 rounded-full blur-3xl opacity-75"
            style={{
              background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, transparent 70%)',
            }}
          />

          {/* Cabecera */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20">
            <div className="flex items-center gap-3.5">
              <EsferaArmilarMini />
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#6EE7B7]">
                  ✦ Desafío Final · Sellos Armilares ({faseActual}/3)
                </span>
                <h2
                  className="text-base sm:text-xl font-black tracking-wide uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E9D5FF 50%, #A7F3D0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Orbitron', sans-serif",
                    filter: 'drop-shadow(0 2px 10px rgba(192, 132, 252, 0.45))',
                  }}
                >
                  GUARDIÁN DEL NIVEL · NÚCLEO ARMILAR
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <BotonPizarraCalculo activa={mostrarPizarra} onClick={handleTogglePizarra} />
              <BotonPistaCuantica activa={mostrarPista} onClick={handleTogglePista} />
              {estrellas > 0 && (
                <div
                  className="liquid-glass-pill inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-black text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(16, 185, 129, 0.45) 100%)',
                    borderColor: 'rgba(233, 213, 255, 0.7)',
                  }}
                >
                  <span>⭐</span>
                  <span>{estrellas}</span>
                </div>
              )}
              <BotonSalidaMinijuego onSafeExit={onSafeExit} />
            </div>
          </div>

          <div className="relative z-20 flex flex-col justify-between gap-4">

          {/* Barra de Núcleos y Progreso de Fases */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(['+', '−', '×', '÷'] as const).map((op, i) => {
                const activo = nucleos[i] ?? true;
                return (
                  <div
                    key={op}
                    className="w-9 h-9 rounded-xl liquid-glass-pill flex items-center justify-center font-black text-sm"
                    style={{
                      background: activo
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.55) 0%, rgba(79, 70, 229, 0.55) 100%)'
                        : 'rgba(15, 23, 42, 0.6)',
                      color: activo ? '#FFFFFF' : '#94A3B8',
                      borderColor: activo ? '#A7F3D0' : 'rgba(255,255,255,0.2)',
                      boxShadow: activo ? '0 0 14px rgba(52, 211, 153, 0.45)' : 'none',
                    }}
                  >
                    {op}
                  </div>
                );
              })}
            </div>

            <div
              className="flex items-center gap-3 px-4 py-1.5 rounded-full liquid-glass-pill"
              style={{
                background: 'rgba(30, 41, 82, 0.75)',
                borderColor: 'rgba(191, 219, 254, 0.5)',
              }}
            >
              <div className="w-24 sm:w-32 h-3 rounded-full bg-[#090D24] border border-white/25 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(faseActual / 3) * 100}%`,
                    background: 'linear-gradient(90deg, #60A5FA 0%, #E879F9 50%, #34D399 100%)',
                    boxShadow: '0 0 12px rgba(110, 231, 183, 0.8)',
                  }}
                />
              </div>
              <span className="text-xs font-extrabold tracking-wider text-white uppercase whitespace-nowrap">
                FASE {faseActual}/3
              </span>
            </div>
          </div>

          {/* Pista Cuántica */}
          <AnimatePresence>
            {mostrarPista && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="relative z-30 mx-auto max-w-xl rounded-2xl px-4 py-2.5 liquid-glass-pill text-white text-xs sm:text-sm font-semibold text-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(147, 51, 234, 0.58) 0%, rgba(30, 58, 138, 0.78) 100%)',
                  borderColor: 'rgba(233, 213, 255, 0.72)',
                }}
              >
                💡 <strong className="text-[#A7F3D0]">Pista Cuántica:</strong> {reto.pista}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visor del Problema + Gran Esfera Armilar Luminosa */}
          <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            <div
              className="md:col-span-6 liquid-glass-pill rounded-2xl p-5"
              style={{
                background:
                  'linear-gradient(145deg, rgba(55, 48, 163, 0.65) 0%, rgba(30, 64, 175, 0.58) 55%, rgba(109, 40, 217, 0.52) 100%)',
                borderColor: 'rgba(221, 214, 254, 0.6)',
                boxShadow:
                  '0 10px 28px rgba(15, 23, 42, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
              }}
            >
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#A7F3D0] mb-1.5">
                ◈ Anillo Armilar #{faseActual}
              </span>
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                {reto.enunciado}
              </p>
            </div>

            <div className="md:col-span-6 flex items-center justify-center">
              <svg width="215" height="195" viewBox="0 0 240 220" className="overflow-visible">
                <defs>
                  <radialGradient id="bossCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E879F9" stopOpacity="0.72" />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="bossRingGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#E879F9" />
                    <stop offset="100%" stopColor="#6EE7B7" />
                  </linearGradient>
                </defs>
                <circle cx="120" cy="110" r="98" fill="url(#bossCenterGlow)" />

                <g transform="translate(120 110)">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0;360"
                      dur="18s"
                      repeatCount="indefinite"
                    />
                    <ellipse
                      rx="78"
                      ry="74"
                      fill="none"
                      stroke={faseActual > 1 || estado === 'correct' ? '#6EE7B7' : 'url(#bossRingGrad)'}
                      strokeWidth="8.5"
                    />
                    <ellipse
                      rx="78"
                      ry="74"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeDasharray="6 8"
                    />
                  </g>

                  <g transform="rotate(-32)">
                    <ellipse
                      rx="72"
                      ry="38"
                      fill="none"
                      stroke={faseActual > 2 ? '#6EE7B7' : '#F0F6FF'}
                      strokeOpacity="0.95"
                      strokeWidth="7"
                    />
                  </g>

                  <g transform="rotate(36)">
                    <ellipse
                      rx="66"
                      ry="34"
                      fill="none"
                      stroke="#E879F9"
                      strokeOpacity="0.95"
                      strokeWidth="6.5"
                    />
                  </g>

                  <circle r="26" fill="#312E81" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle r="17" fill="#C084FC" opacity="0.85" />
                  <circle r="9.5" fill="#6EE7B7" />
                  <circle r="4.5" fill="#FFFFFF" />
                </g>
              </svg>
            </div>
          </div>

          {/* 3 Cubos + Base Orbital */}
          <div className="relative z-20 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 -mb-8 relative z-30">
              {reto.opciones.map((op, idx) => {
                const elegida = opcionElegida === idx;
                const esCorrecta = idx === reto.indiceCorrecto;
                const inclinaciones = [-4, 0, 4];
                return (
                  <CuboCuantico3D
                    key={op}
                    texto={op}
                    tono={tonosBoss[idx % 3]}
                    compacto
                    seleccionado={elegida}
                    estado={
                      estado === 'idle'
                        ? 'normal'
                        : esCorrecta
                          ? 'correcto'
                          : elegida
                            ? 'error'
                            : 'normal'
                    }
                    inclinacion={inclinaciones[idx % 3]}
                    onClick={() => onElegirOpcion(idx)}
                    disabled={estado !== 'idle'}
                  />
                );
              })}
            </div>

            <div className="w-full -my-1">
              <BaseReactorCuantico ranuras={[ranurasBoss[0], ranurasBoss[1], ranurasBoss[2], null]} />
            </div>
          </div>

          {/* Explicación */}
          <AnimatePresence>
            {estado !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="relative z-30 mx-auto max-w-2xl rounded-2xl px-5 py-3 liquid-glass-pill text-xs sm:text-sm font-semibold text-center"
                style={{
                  background:
                    estado === 'correct'
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.55) 0%, rgba(6, 78, 59, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(244, 63, 94, 0.52) 0%, rgba(136, 19, 55, 0.9) 100%)',
                  borderColor:
                    estado === 'correct'
                      ? 'rgba(167, 243, 208, 0.85)'
                      : 'rgba(253, 164, 175, 0.85)',
                  color: '#FFFFFF',
                }}
              >
                {estado === 'correct' ? (
                  <span>
                    ✨ <strong>¡Anillo Armilar #{faseActual} alineado!</strong> {reto.explicacion}
                  </span>
                ) : (
                  <span>
                    ⚠️ <strong>Frecuencia incorrecta:</strong> {reto.explicacion}{' '}
                    <span className="text-[#F5D0FE]">
                      (¡Intenta alinear este anillo con una nueva pregunta!)
                    </span>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón Principal */}
          <div className="relative z-20 flex justify-center pt-1">
            <button
              type="button"
              onClick={onAlinearAnillo}
              className="liquid-glass-btn px-10 sm:px-14 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-[0.22em] text-white uppercase cursor-pointer"
              style={{
                background:
                  estado === 'correct'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.88) 0%, rgba(52, 211, 153, 0.78) 100%)'
                    : 'linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(168, 85, 247, 0.85) 50%, rgba(16, 185, 129, 0.82) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.75)',
                boxShadow:
                  '0 0 28px rgba(168, 85, 247, 0.55), 0 0 18px rgba(52, 211, 153, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
              }}
            >
              {estado === 'correct'
                ? faseActual < 3
                  ? `PASAR A FASE ${faseActual + 1} ✦`
                  : 'COMPLETAR NÚCLEO ARMILAR ✦'
                : estado === 'incorrect'
                  ? 'REINTENTAR ANILLO ↻'
                  : 'ALINEAR ANILLO ARMILAR'}
            </button>
          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>

    <AnimatePresence>
      {mostrarPizarra && (
        <PizarraHolografica
          key={bossKey}
          preguntaResumen={reto.enunciado}
          onClose={() => setPizarraKey(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
