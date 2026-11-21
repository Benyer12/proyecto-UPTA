'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PreguntaMatematica, RetoArmilarBoss } from '../../../lib/preguntas-numerix';

/* ════════════════════════ COMPONENTES LIQUID GLASS COMPARTIDOS ════════════════════════ */

/** Esfera Armilar elegante en paleta Azul Crema, Morado y Esmeralda. */
function EsferaArmilarMini() {
  return (
    <svg width="46" height="46" viewBox="0 0 64 64" className="overflow-visible select-none pointer-events-none shrink-0">
      <defs>
        <radialGradient id="miniArmilarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#6366F1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="miniArmilarRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0F6FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#miniArmilarGlow)" />
      <g transform="translate(32 32)">
        <ellipse rx="21" ry="20" fill="none" stroke="url(#miniArmilarRing)" strokeWidth="2.8" />
        <ellipse rx="20" ry="10" transform="rotate(-30)" fill="none" stroke="#E2EEFF" strokeOpacity="0.8" strokeWidth="2.2" />
        <ellipse rx="18" ry="8.5" transform="rotate(35)" fill="none" stroke="#6EE7B7" strokeOpacity="0.8" strokeWidth="2" />
        <circle r="6" fill="#1E1B4B" stroke="#E2EEFF" strokeWidth="1.2" />
        <circle r="3" fill="#E879F9" />
      </g>
    </svg>
  );
}

/** Botón Pista Cuántica en Liquid Glass (integrado de forma limpia). */
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
      className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase cursor-pointer transition-all shrink-0"
      style={{
        background: activa
          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.34) 0%, rgba(16, 185, 129, 0.28) 100%)'
          : 'rgba(15, 23, 52, 0.65)',
        borderColor: activa ? 'rgba(110, 231, 183, 0.65)' : 'rgba(191, 219, 254, 0.25)',
        color: activa ? '#ECFDF5' : '#E2EEFF',
      }}
      title="Mostrar Pista Cuántica"
    >
      <span>💡</span>
      <span>{activa ? 'Ocultar pista' : 'Pista'}</span>
    </button>
  );
}

/** Cubo Cuántico 3D Pulcro en estilo Liquid Glass (sin líneas punteadas internas). */
function CuboCuantico3D({
  texto,
  seleccionado = false,
  estado = 'normal',
  inclinacion = 0,
  compacto = false,
  onClick,
  disabled = false,
}: {
  texto: string;
  seleccionado?: boolean;
  estado?: 'normal' | 'correcto' | 'error';
  inclinacion?: number;
  compacto?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const w = compacto ? 100 : 112;
  const h = compacto ? 100 : 112;

  const colores = {
    normal: {
      topStroke: seleccionado ? '#FFFFFF' : '#BFDBFE',
      sideStroke: seleccionado ? '#6EE7B7' : 'rgba(147, 197, 253, 0.55)',
      topFill: seleccionado ? 'rgba(192, 132, 252, 0.42)' : 'rgba(147, 197, 253, 0.22)',
      leftFill: seleccionado ? 'rgba(67, 56, 202, 0.84)' : 'rgba(22, 36, 77, 0.88)',
      rightFill: seleccionado ? 'rgba(49, 46, 129, 0.92)' : 'rgba(13, 23, 52, 0.94)',
      text: seleccionado ? '#FFFFFF' : '#F0F6FF',
      glow: seleccionado
        ? '0 0 24px rgba(192, 132, 252, 0.65)'
        : '0 10px 22px rgba(2, 6, 23, 0.55)',
    },
    correcto: {
      topStroke: '#A7F3D0',
      sideStroke: '#34D399',
      topFill: 'rgba(52, 211, 153, 0.44)',
      leftFill: 'rgba(6, 95, 70, 0.88)',
      rightFill: 'rgba(4, 65, 48, 0.94)',
      text: '#ECFDF5',
      glow: '0 0 26px rgba(52, 211, 153, 0.72)',
    },
    error: {
      topStroke: '#FDA4AF',
      sideStroke: '#F43F5E',
      topFill: 'rgba(244, 63, 94, 0.42)',
      leftFill: 'rgba(136, 19, 55, 0.88)',
      rightFill: 'rgba(96, 14, 42, 0.94)',
      text: '#FFE4E6',
      glow: '0 0 24px rgba(244, 63, 94, 0.65)',
    },
  }[estado];

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -5 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      animate={{ rotate: inclinacion }}
      onClick={onClick}
      disabled={disabled}
      className={`relative group select-none focus:outline-none transition-transform ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      }`}
      style={{
        width: w,
        height: h,
        filter: `drop-shadow(${colores.glow})`,
      }}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
        {/* Halo de selección suave */}
        {seleccionado && estado === 'normal' && (
          <polygon
            points="60,6 112,35 60,114 8,35"
            fill="none"
            stroke="#6EE7B7"
            strokeOpacity="0.65"
            strokeWidth="1.6"
          />
        )}

        {/* Cara Izquierda sólida y limpia */}
        <polygon
          points="14,38 60,60 60,108 14,84"
          fill={colores.leftFill}
          stroke={colores.sideStroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Cara Derecha sólida y limpia */}
        <polygon
          points="106,38 60,60 60,108 106,84"
          fill={colores.rightFill}
          stroke={colores.sideStroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Cara Superior tipo cristal esmerilado */}
        <polygon
          points="60,14 106,38 60,60 14,38"
          fill={colores.topFill}
          stroke={colores.topStroke}
          strokeWidth={seleccionado ? 2.2 : 1.7}
          strokeLinejoin="round"
        />

        {/* Reflejo sutil en la arista superior */}
        <line
          x1="28"
          y1="32"
          x2="60"
          y2="17"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Valor numérico / opción centrada con alta legibilidad */}
        <text
          x="60"
          y={texto.length > 5 ? '39' : '37'}
          textAnchor="middle"
          dominantBaseline="central"
          fill={colores.text}
          fontSize={texto.length > 7 ? '14' : texto.length > 4 ? '18' : '23'}
          fontWeight="900"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            filter: 'drop-shadow(0 2px 6px rgba(2, 6, 23, 0.85))',
          }}
        >
          {texto}
        </text>
      </svg>
    </motion.button>
  );
}

/** Base del Reactor Orbital Elegante en paleta Azul Profundo, Azul Crema, Morado y Esmeralda. */
function BaseReactorCuantico({
  ranuras,
  onSlotClick,
}: {
  ranuras?: (string | null)[];
  onSlotClick?: (idx: number) => void;
}) {
  const slots = ranuras ?? [null, null, null, null];
  const posRanuras = [
    { left: '16%', top: '12%', rot: -10 },
    { left: '38%', top: '3%', rot: -3 },
    { left: '62%', top: '3%', rot: 3 },
    { left: '84%', top: '12%', rot: 10 },
  ];

  return (
    <div className="relative w-full max-w-[660px] h-[142px] sm:h-[160px] mx-auto select-none">
      {/* SVG del Reactor Orbital Pulcro */}
      <svg viewBox="0 0 680 170" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="reactorRimSoft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
            <stop offset="30%" stopColor="#BFDBFE" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#C084FC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="reactorCoreSoft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F0F6FF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#A855F7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sombra de profundidad */}
        <ellipse cx="340" cy="136" rx="305" ry="62" fill="#030612" opacity="0.72" />

        {/* Base exterior en Azul Profundo */}
        <ellipse
          cx="340"
          cy="118"
          rx="276"
          ry="56"
          fill="#0D1633"
          stroke="url(#reactorRimSoft)"
          strokeOpacity="0.55"
          strokeWidth="2"
        />

        {/* Anillo intermedio esmerilado */}
        <ellipse
          cx="340"
          cy="108"
          rx="236"
          ry="47"
          fill="#131E46"
          stroke="url(#reactorRimSoft)"
          strokeWidth="2.4"
        />

        {/* Foso energético central */}
        <ellipse
          cx="340"
          cy="106"
          rx="178"
          ry="34"
          fill="#070C1F"
          stroke="#C4B5FD"
          strokeOpacity="0.55"
          strokeWidth="1.6"
        />
        <ellipse
          cx="340"
          cy="106"
          rx="140"
          ry="26"
          fill="none"
          stroke="#6EE7B7"
          strokeOpacity="0.45"
          strokeWidth="1.3"
          strokeDasharray="10 8"
        />

        {/* Núcleo central luminoso */}
        <ellipse cx="340" cy="105" rx="44" ry="13" fill="#1E1B4B" stroke="#E2EEFF" strokeOpacity="0.65" strokeWidth="1.4" />
        <ellipse cx="340" cy="104" rx="26" ry="8" fill="url(#reactorCoreSoft)" />
      </svg>

      {/* 4 Ranuras en Cápsulas Liquid Glass */}
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
            {/* Haz de luz suave */}
            <div
              className="pointer-events-none absolute -top-10 w-16 sm:w-20 h-12 opacity-50"
              style={{
                background: lleno
                  ? 'linear-gradient(180deg, transparent 0%, rgba(110,231,183,0.18) 55%, rgba(110,231,183,0.6) 100%)'
                  : 'linear-gradient(180deg, transparent 0%, rgba(147,197,253,0.12) 60%, rgba(192,132,252,0.42) 100%)',
                clipPath: 'polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%)',
              }}
            />
            <div
              className="w-16 sm:w-22 h-9 sm:h-11 rounded-xl flex items-center justify-center transition-all liquid-glass-pill"
              style={{
                background: lleno
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.55) 0%, rgba(99, 102, 241, 0.45) 100%)'
                  : 'linear-gradient(135deg, rgba(30, 41, 82, 0.72) 0%, rgba(12, 18, 42, 0.85) 100%)',
                borderColor: lleno ? 'rgba(167, 243, 208, 0.85)' : 'rgba(191, 219, 254, 0.35)',
                boxShadow: lleno
                  ? '0 0 18px rgba(52, 211, 153, 0.48), inset 0 1px 1px rgba(255,255,255,0.45)'
                  : 'inset 0 2px 6px rgba(0,0,0,0.5)',
              }}
            >
              <span
                className="font-black text-xs sm:text-base tracking-tight"
                style={{
                  color: lleno ? '#FFFFFF' : 'rgba(147, 197, 253, 0.35)',
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {valor ?? '·'}
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
}: ModalReactorProps) {
  const [mostrarPista, setMostrarPista] = useState(false);

  const esSecuencia = modo === 'secuencia';
  const estadoActual = esSecuencia ? estadoSecuencia : estadoPregunta;

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(12, 18, 44, 0.80) 0%, rgba(5, 8, 22, 0.90) 75%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-[840px] rounded-3xl liquid-glass-modal p-3.5 sm:p-4 my-auto"
        style={{
          borderColor: 'rgba(191, 219, 254, 0.28)',
        }}
      >
        {/* Cápsula Interior en Doble Encapsulado Liquid Glass */}
        <div
          className="relative rounded-2xl liquid-glass px-5 sm:px-8 py-6 sm:py-7 flex flex-col justify-between gap-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 50% 25%, rgba(36, 48, 98, 0.42) 0%, rgba(11, 17, 38, 0.76) 60%, rgba(6, 10, 24, 0.88) 100%)',
            borderColor: 'rgba(196, 181, 253, 0.22)',
          }}
        >
          {/* ── CABECERA LIMPIA LIQUID GLASS ── */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <EsferaArmilarMini />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#93C5FD]">
                  {esSecuencia ? 'Módulo de Propulsión' : 'Cámara de Precisión'}
                </span>
                <h2
                  className="text-base sm:text-xl font-black tracking-wide uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #F0F6FF 0%, #BFDBFE 50%, #C4B5FD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {esSecuencia ? 'REACTOR DE PROPULSIÓN CUÁNTICA' : 'CÁMARA DE CÁLCULO CUÁNTICO'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BotonPistaCuantica activa={mostrarPista} onClick={() => setMostrarPista((v) => !v)} />

              <div className="liquid-glass-pill inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-black text-[#F0F6FF]">
                <span className="text-[#6EE7B7]">◈</span>
                <span>{nucleosActivos}/4</span>
              </div>

              {estrellas > 0 && (
                <div className="liquid-glass-pill inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-black text-emerald-200">
                  <span>⭐</span>
                  <span>{estrellas}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── CONSIGNA / ENUNCIADO ── */}
          <div className="relative z-20 text-center px-1">
            {esSecuencia ? (
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6EE7B7]">
                  ✦ Secuencia de Propulsión · Ordena de Menor a Mayor ✦
                </p>
                <h3 className="text-lg sm:text-2xl font-black text-[#F0F6FF] tracking-tight">
                  Calcula y encaja la energía
                </h3>
              </div>
            ) : (
              <div
                className="max-w-2xl mx-auto px-5 py-4 rounded-2xl liquid-glass-pill"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(22, 34, 72, 0.72) 0%, rgba(12, 18, 42, 0.82) 100%)',
                  borderColor: 'rgba(191, 219, 254, 0.24)',
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C4B5FD] mb-1.5">
                  🛰️ Reto de Cálculo Cuántico {pregunta?.operador ? `· ${pregunta.operador}` : ''}
                </p>
                <h3 className="text-base sm:text-xl font-extrabold text-[#F0F6FF] leading-snug">
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
                className="relative z-30 mx-auto max-w-xl rounded-2xl px-4 py-2.5 liquid-glass-pill text-[#E2EEFF] text-xs sm:text-sm font-semibold text-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(15, 23, 52, 0.86) 100%)',
                  borderColor: 'rgba(192, 132, 252, 0.45)',
                }}
              >
                💡 <strong className="text-[#C4B5FD]">Pista Cuántica:</strong> {textoPista}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 4 CUBOS CUÁNTICOS FLOTANTES ── */}
          <div className="relative z-20 flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-1">
            {esSecuencia &&
              secuencia.map((num, idx) => {
                const yaElegido = seleccionSecuencia.includes(num);
                const inclinaciones = [-6, -2, 2, 6];
                return (
                  <CuboCuantico3D
                    key={num}
                    texto={String(num)}
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

          {/* ── BASE DEL REACTOR ORBITAL ── */}
          <div className="relative z-10 -my-2">
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
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.24) 0%, rgba(6, 42, 34, 0.88) 100%)'
                      : 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(58, 12, 30, 0.88) 100%)',
                  borderColor:
                    estadoActual === 'correct'
                      ? 'rgba(110, 231, 183, 0.6)'
                      : 'rgba(253, 164, 175, 0.55)',
                  color: estadoActual === 'correct' ? '#ECFDF5' : '#FFE4E6',
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

          {/* ── BOTÓN DE ACCIÓN PRINCIPAL EN LIQUID GLASS ── */}
          <div className="relative z-20 flex justify-center pt-1">
            <button
              type="button"
              onClick={esSecuencia ? onConfirmarSecuencia : onConfirmarPregunta}
              className="liquid-glass-btn px-9 sm:px-12 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-[0.2em] text-white uppercase cursor-pointer"
              style={{
                background:
                  estadoActual !== 'idle'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.62) 0%, rgba(52, 211, 153, 0.45) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.62) 0%, rgba(168, 85, 247, 0.52) 52%, rgba(16, 185, 129, 0.48) 100%)',
                borderColor:
                  estadoActual !== 'idle'
                    ? 'rgba(167, 243, 208, 0.75)'
                    : 'rgba(226, 238, 255, 0.55)',
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
      </motion.div>
    </motion.div>
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
}

/** Asteroide Espacial 3D con cristales en paleta Azul Crema, Morado y Esmeralda + mira [ ]. */
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
      c1: '#93C5FD',
      c2: '#3B82F6',
      glow: 'rgba(147, 197, 253, 0.45)',
      bracket: '#BFDBFE',
    },
    magenta: {
      c1: '#E879F9',
      c2: '#9333EA',
      glow: 'rgba(217, 70, 239, 0.45)',
      bracket: '#E879F9',
    },
    esmeralda: {
      c1: '#6EE7B7',
      c2: '#059669',
      glow: 'rgba(52, 211, 153, 0.45)',
      bracket: '#6EE7B7',
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
      whileHover={disabled ? undefined : { y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center select-none focus:outline-none ${
        disabled ? 'cursor-default' : 'cursor-crosshair'
      }`}
      style={{
        filter: `drop-shadow(0 0 16px ${cfg.glow})`,
      }}
    >
      <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible">
        {/* Mira táctica [ ] */}
        <g stroke={colorMira} strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M 18 36 V 18 H 36" />
          <path d="M 142 36 V 18 H 124" />
          <path d="M 18 124 V 142 H 36" />
          <path d="M 142 124 V 142 H 124" />
        </g>

        {/* Cuerpo rocoso 3D en azul profundo */}
        <polygon
          points="80,16 122,28 144,66 134,114 96,142 52,138 20,108 18,58 44,24"
          fill="#1A2448"
          stroke="#64748B"
          strokeOpacity="0.65"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon points="80,16 122,28 106,58 64,46" fill="#273668" />
        <polygon points="20,108 52,138 96,142 134,114 102,94 48,96" fill="#0F1630" />

        {/* Cristales incrustados */}
        <polygon points="80,26 98,52 80,66 62,52" fill={cfg.c1} stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />
        <polygon points="44,58 68,72 54,98 34,82" fill={cfg.c2} stroke={cfg.c1} strokeWidth="1" />
        <polygon points="116,60 126,88 102,98 92,72" fill={cfg.c1} stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />
        <polygon points="78,96 98,118 76,130 58,114" fill={cfg.c1} stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />

        {/* Núcleo central con el número */}
        <circle cx="80" cy="82" r="34" fill="#080E22" fillOpacity="0.82" stroke={cfg.c1} strokeWidth="1.8" />
        <text
          x="80"
          y="83"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="36"
          fontWeight="900"
          fill="#F0F6FF"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            filter: 'drop-shadow(0 2px 8px rgba(2,6,23,0.9))',
          }}
        >
          {numero}
        </text>
      </svg>
    </motion.button>
  );
}

/** Torreta / Cañón Deflector de Escudo Antimateria rediseñado en Azul Profundo, Crema, Morado y Esmeralda. */
function TorretaAntimateriaSVG({ angulo }: { angulo: number }) {
  return (
    <div className="relative w-44 h-30 flex items-center justify-center select-none pointer-events-none">
      <svg viewBox="0 0 180 130" className="w-full h-full overflow-visible">
        <ellipse cx="90" cy="112" rx="54" ry="13" fill="#0D1633" stroke="#93C5FD" strokeOpacity="0.65" strokeWidth="1.8" />
        <ellipse cx="90" cy="106" rx="38" ry="9" fill="#312E81" stroke="#C4B5FD" strokeWidth="1.4" />

        <g transform={`translate(90 96) rotate(${angulo})`}>
          {/* Conductos de plasma morado/esmeralda */}
          <path
            d="M -25 -6 C -44 -12, -44 16, -21 12"
            fill="none"
            stroke="#C084FC"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 25 -6 C 44 -12, 44 16, 21 12"
            fill="none"
            stroke="#6EE7B7"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Chasis central */}
          <rect x="-24" y="-26" width="48" height="36" rx="10" fill="#1E2952" stroke="#BFDBFE" strokeWidth="1.8" />
          <rect x="-15" y="-19" width="30" height="22" rx="5" fill="#4C1D95" stroke="#E2EEFF" strokeOpacity="0.7" strokeWidth="1.2" />

          {/* Cañón anillado */}
          {[-34, -44, -54, -64].map((ky, i) => (
            <rect
              key={i}
              x={-13 + i * 1.4}
              y={ky}
              width={26 - i * 2.8}
              height="6.5"
              rx="2.5"
              fill={i % 2 === 0 ? '#93C5FD' : '#6366F1'}
              stroke="#0B1124"
              strokeWidth="1.1"
            />
          ))}
          <circle cx="0" cy="-72" r="6.5" fill="#F0F6FF" stroke="#6EE7B7" strokeWidth="2" />
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
}: ModalAlertaImpactoProps) {
  const angulos = [-34, 0, 34];
  const anguloTorreta = seleccionadoIdx !== null ? angulos[seleccionadoIdx] ?? 0 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(22, 14, 48, 0.82) 0%, rgba(5, 8, 22, 0.92) 75%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-[840px] rounded-3xl liquid-glass-modal p-3.5 sm:p-4 my-auto"
        style={{
          borderColor: 'rgba(232, 121, 249, 0.38)',
        }}
      >
        {/* Consola Interior Liquid Glass */}
        <div
          className="relative rounded-2xl liquid-glass px-5 sm:px-8 py-6 sm:py-7 flex flex-col justify-between gap-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(49, 26, 86, 0.42) 0%, rgba(11, 16, 38, 0.8) 62%, rgba(6, 9, 22, 0.9) 100%)',
            borderColor: 'rgba(232, 121, 249, 0.28)',
          }}
        >
          {/* Radar Holográfico Suave */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
            <div className="w-[300px] h-[300px] rounded-full border border-[#C084FC] flex items-center justify-center">
              <div className="w-[210px] h-[210px] rounded-full border border-[#93C5FD] flex items-center justify-center">
                <div className="w-[120px] h-[120px] rounded-full border border-dashed border-[#6EE7B7]" />
              </div>
            </div>
            <div className="absolute w-[340px] h-px bg-[#93C5FD]/40" />
            <div className="absolute h-[340px] w-px bg-[#93C5FD]/40" />
          </div>

          {/* Cabecera */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl liquid-glass-pill flex items-center justify-center text-xl">
                🛡️
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#E879F9]">
                  Escudo Antimateria
                </span>
                <h2
                  className="text-base sm:text-xl font-black tracking-wide uppercase text-[#F0F6FF]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  ALERTA DE IMPACTO
                </h2>
              </div>
            </div>

            <span className="liquid-glass-pill px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#F0ABFC]">
              ● Radar Activo
            </span>
          </div>

          {/* Consigna dinámica */}
          <div className="relative z-20 text-center max-w-xl mx-auto px-2">
            <p className="text-sm sm:text-lg font-extrabold text-[#E2EEFF] leading-relaxed">
              ¡Dispara al asteroide con número{' '}
              <span
                className="inline-block mx-1 px-3.5 py-0.5 rounded-xl font-black text-white liquid-glass-pill"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(168, 85, 247, 0.55) 0%, rgba(16, 185, 129, 0.45) 100%)',
                  borderColor: 'rgba(240, 171, 252, 0.75)',
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
                  className="pointer-events-none absolute bottom-24 w-2 h-36 rounded-full bg-white shadow-[0_0_18px_#6EE7B7,0_0_36px_#C084FC]"
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
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.24) 0%, rgba(6, 42, 34, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(244, 63, 94, 0.24) 0%, rgba(58, 12, 30, 0.9) 100%)',
                  borderColor:
                    estado === 'correct'
                      ? 'rgba(110, 231, 183, 0.6)'
                      : 'rgba(253, 164, 175, 0.55)',
                  color: estado === 'correct' ? '#ECFDF5' : '#FFE4E6',
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
                  className="shrink-0 px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider liquid-glass-btn text-white cursor-pointer"
                >
                  CONTINUAR ✦
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
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
}: ModalGuardianArmilarProps) {
  const [mostrarPista, setMostrarPista] = useState(false);

  const ranurasBoss: (string | null)[] = [0, 1, 2].map((i) =>
    opcionElegida === i ? reto.opciones[i] : null,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(20, 18, 52, 0.84) 0%, rgba(5, 8, 22, 0.93) 75%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative w-full max-w-[860px] rounded-3xl liquid-glass-modal p-3.5 sm:p-4 my-auto"
        style={{
          borderColor: 'rgba(196, 181, 253, 0.34)',
        }}
      >
        {/* Interior en Doble Encapsulado Liquid Glass */}
        <div
          className="relative rounded-2xl liquid-glass px-5 sm:px-8 py-6 sm:py-7 flex flex-col justify-between gap-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 54% 44%, rgba(44, 34, 96, 0.44) 0%, rgba(11, 16, 38, 0.8) 62%, rgba(6, 9, 22, 0.9) 100%)',
            borderColor: 'rgba(196, 181, 253, 0.24)',
          }}
        >
          {/* Cabecera */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <EsferaArmilarMini />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#C4B5FD]">
                  Desafío Final · Sellos Armilares ({faseActual}/3)
                </span>
                <h2
                  className="text-base sm:text-xl font-black tracking-wide uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #F0F6FF 0%, #C4B5FD 55%, #6EE7B7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  GUARDIÁN DEL NIVEL · NÚCLEO ARMILAR
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BotonPistaCuantica activa={mostrarPista} onClick={() => setMostrarPista((v) => !v)} />
              {estrellas > 0 && (
                <div className="liquid-glass-pill inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-black text-emerald-200">
                  <span>⭐</span>
                  <span>{estrellas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Núcleos y Progreso de Fases */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['+', '−', '×', '÷'] as const).map((op, i) => {
                const activo = nucleos[i] ?? true;
                return (
                  <div
                    key={op}
                    className="w-8 h-8 rounded-xl liquid-glass-pill flex items-center justify-center font-black text-sm"
                    style={{
                      color: activo ? '#6EE7B7' : '#64748B',
                      borderColor: activo ? 'rgba(110, 231, 183, 0.5)' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {op}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full liquid-glass-pill">
              <div className="w-20 sm:w-28 h-2.5 rounded-full bg-[#060A18] border border-white/15 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(faseActual / 3) * 100}%`,
                    background: 'linear-gradient(90deg, #6366F1 0%, #C084FC 50%, #6EE7B7 100%)',
                  }}
                />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-[#E2EEFF] uppercase whitespace-nowrap">
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
                className="relative z-30 mx-auto max-w-xl rounded-2xl px-4 py-2.5 liquid-glass-pill text-[#E2EEFF] text-xs sm:text-sm font-semibold text-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(15, 23, 52, 0.86) 100%)',
                  borderColor: 'rgba(192, 132, 252, 0.45)',
                }}
              >
                💡 <strong className="text-[#C4B5FD]">Pista Cuántica:</strong> {reto.pista}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visor del Problema + Gran Esfera Armilar */}
          <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            <div
              className="md:col-span-6 liquid-glass-pill rounded-2xl p-5"
              style={{
                background:
                  'linear-gradient(145deg, rgba(22, 34, 72, 0.72) 0%, rgba(12, 18, 42, 0.84) 100%)',
                borderColor: 'rgba(196, 181, 253, 0.28)',
              }}
            >
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-[#6EE7B7] mb-1.5">
                ◈ Anillo Armilar #{faseActual}
              </span>
              <p className="text-sm sm:text-base font-bold text-[#F0F6FF] leading-relaxed">
                {reto.enunciado}
              </p>
            </div>

            <div className="md:col-span-6 flex items-center justify-center">
              <svg width="210" height="190" viewBox="0 0 240 220" className="overflow-visible">
                <defs>
                  <radialGradient id="bossCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="0.48" />
                    <stop offset="55%" stopColor="#6366F1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="bossRingGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F0F6FF" />
                    <stop offset="50%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#6EE7B7" />
                  </linearGradient>
                </defs>
                <circle cx="120" cy="110" r="92" fill="url(#bossCenterGlow)" />

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
                      strokeWidth="8"
                    />
                    <ellipse
                      rx="78"
                      ry="74"
                      fill="none"
                      stroke="#E2EEFF"
                      strokeWidth="1.5"
                      strokeDasharray="6 8"
                    />
                  </g>

                  <g transform="rotate(-32)">
                    <ellipse
                      rx="72"
                      ry="38"
                      fill="none"
                      stroke={faseActual > 2 ? '#6EE7B7' : '#E2EEFF'}
                      strokeOpacity="0.85"
                      strokeWidth="6.5"
                    />
                  </g>

                  <g transform="rotate(36)">
                    <ellipse
                      rx="66"
                      ry="34"
                      fill="none"
                      stroke="#C084FC"
                      strokeOpacity="0.85"
                      strokeWidth="6"
                    />
                  </g>

                  <circle r="24" fill="#1E1B4B" stroke="#E2EEFF" strokeWidth="2" />
                  <circle r="15" fill="#A855F7" opacity="0.65" />
                  <circle r="8" fill="#6EE7B7" />
                  <circle r="3.5" fill="#FFFFFF" />
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

            <div className="w-full -my-2">
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
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.24) 0%, rgba(6, 42, 34, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(244, 63, 94, 0.24) 0%, rgba(58, 12, 30, 0.9) 100%)',
                  borderColor:
                    estado === 'correct'
                      ? 'rgba(110, 231, 183, 0.6)'
                      : 'rgba(253, 164, 175, 0.55)',
                  color: estado === 'correct' ? '#ECFDF5' : '#FFE4E6',
                }}
              >
                {estado === 'correct' ? (
                  <span>
                    ✨ <strong>¡Anillo Armilar #{faseActual} alineado!</strong> {reto.explicacion}
                  </span>
                ) : (
                  <span>
                    ⚠️ <strong>Frecuencia incorrecta:</strong> {reto.explicacion}{' '}
                    <span className="text-[#C4B5FD]">
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
              className="liquid-glass-btn px-9 sm:px-12 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-[0.2em] text-white uppercase cursor-pointer"
              style={{
                background:
                  estado !== 'idle'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.62) 0%, rgba(52, 211, 153, 0.45) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.62) 0%, rgba(168, 85, 247, 0.52) 52%, rgba(16, 185, 129, 0.48) 100%)',
                borderColor:
                  estado !== 'idle'
                    ? 'rgba(167, 243, 208, 0.75)'
                    : 'rgba(226, 238, 255, 0.55)',
              }}
            >
              {estado === 'idle'
                ? 'ALINEAR ANILLO'
                : faseActual < 3 && estado === 'correct'
                  ? 'SIGUIENTE ANILLO ✦'
                  : estado === 'correct'
                    ? 'RESTAURAR NÚCLEO ✦'
                    : 'NUEVA PREGUNTA ↻'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
