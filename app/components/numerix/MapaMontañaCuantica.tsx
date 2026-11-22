'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

export interface NodoCubo {
  index: number; // 0..19
  numero: string; // "01".."20"
  x: number;
  y: number;
  tipo: 'normal' | 'especial' | 'trampa' | 'boss';
  opIzq: string;
  opDer: string;
}

export const ESPECIALES_IDX = [3, 7, 11, 15]; // Casillas 04, 08, 12, 16
export const TRAMPAS_IDX = [5, 9, 13]; // Casillas 06, 10, 14

// 20 casillas más separadas, centradas y distribuidas con amplitud y armonía sobre las 3 terrazas (viewBox 900x680)
const COORDS_S: { x: number; y: number; opIzq: string; opDer: string }[] = [
  // Tramo 1: Terraza Inferior (amplia curva de derecha a izquierda desde el Portal Cuántico)
  { x: 675, y: 566, opIzq: '01', opDer: '+' }, // 01
  { x: 562, y: 582, opIzq: '−', opDer: '÷' },  // 02
  { x: 446, y: 576, opIzq: '+', opDer: '×' },  // 03
  { x: 332, y: 552, opIzq: '×', opDer: '+' },  // 04 (Especial 1)
  { x: 228, y: 506, opIzq: '+', opDer: '÷' },  // 05
  { x: 162, y: 432, opIzq: '√', opDer: '∑' },  // 06 (Trampa 1)

  // Tramo 2: Cresta Central Ascendente (bien espaciada de izquierda a derecha)
  { x: 226, y: 362, opIzq: '+', opDer: '÷' },  // 07
  { x: 320, y: 332, opIzq: '+', opDer: '×' },  // 08 (Especial 2)
  { x: 420, y: 302, opIzq: '×', opDer: '−' },  // 09
  { x: 520, y: 272, opIzq: '√', opDer: '∑' },  // 10 (Trampa 2)
  { x: 618, y: 238, opIzq: 'π', opDer: '÷' },  // 11
  { x: 706, y: 194, opIzq: '×', opDer: '+' },  // 12 (Especial 3)
  { x: 734, y: 126, opIzq: '+', opDer: '−' },  // 13

  // Tramo 3: Cumbre Superior (arco amplio de derecha a izquierda hacia el Santuario Armilar)
  { x: 646, y: 84, opIzq: '√', opDer: '∑' },   // 14 (Trampa 3)
  { x: 544, y: 78, opIzq: 'π', opDer: '÷' },   // 15
  { x: 442, y: 92, opIzq: '×', opDer: '+' },   // 16 (Especial 4)
  { x: 348, y: 120, opIzq: '×', opDer: '÷' },  // 17
  { x: 266, y: 162, opIzq: '−', opDer: '+' },  // 18
  { x: 202, y: 214, opIzq: '+', opDer: '=' },  // 19
  { x: 122, y: 274, opIzq: '★', opDer: '★' },  // 20 (Guardián del Nivel)
];

export const NODOS_NUMERIX: NodoCubo[] = COORDS_S.map((c, idx) => {
  const tipo: NodoCubo['tipo'] =
    idx === 19
      ? 'boss'
      : ESPECIALES_IDX.includes(idx)
        ? 'especial'
        : TRAMPAS_IDX.includes(idx)
          ? 'trampa'
          : 'normal';
  return {
    index: idx,
    numero: String(idx + 1).padStart(2, '0'),
    x: c.x,
    y: c.y,
    tipo,
    opIzq: c.opIzq,
    opDer: c.opDer,
  };
});

/** Genera un path SVG suave Catmull-Rom que pasa por todos los nodos del riel. */
function construirPathRiel(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const PATH_RIEL = construirPathRiel(
  NODOS_NUMERIX.map((n) => ({ x: n.x, y: n.y + 8 })),
);

// Partículas de colores orbitando alrededor del Agujero Negro
const BLACK_HOLE_PARTICLES = [
  { r: 44, size: 2.8, color: '#93C5FD', dur: '7s', angle: 15 },
  { r: 52, size: 2.4, color: '#E879F9', dur: '9s', angle: 75 },
  { r: 60, size: 3.0, color: '#6EE7B7', dur: '11s', angle: 135 },
  { r: 48, size: 2.2, color: '#FDE047', dur: '8s', angle: 195 },
  { r: 68, size: 2.6, color: '#C084FC', dur: '13s', angle: 250 },
  { r: 56, size: 2.5, color: '#E2EEFF', dur: '10s', angle: 310 },
  { r: 74, size: 2.2, color: '#34D399', dur: '14s', angle: 45 },
  { r: 64, size: 2.7, color: '#F472B6', dur: '12s', angle: 165 },
  { r: 40, size: 2.3, color: '#A5B4FC', dur: '6.5s', angle: 280 },
  { r: 78, size: 2.0, color: '#FDE047', dur: '15s', angle: 220 },
];

/** Agujero Negro Supermasivo con Disco de Acreción y Partículas Multicolor en Órbita. */
function AgujeroNegroCosmico({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Resplandor gravitacional exterior */}
      <circle r="92" fill="url(#bhOuterGlow)" />

      {/* Anillo de lente gravitacional vertical (luz doblada detrás del horizonte) */}
      <ellipse
        rx="44"
        ry="42"
        fill="none"
        stroke="url(#bhLensGrad)"
        strokeWidth="4.5"
        opacity="0.72"
      />
      <ellipse
        rx="37"
        ry="36"
        fill="none"
        stroke="#E2EEFF"
        strokeWidth="1.2"
        opacity="0.65"
      />

      {/* Disco de acreción inclinado en rotación */}
      <g transform="rotate(-18)">
        <ellipse
          rx="84"
          ry="24"
          fill="none"
          stroke="url(#bhDiskGrad)"
          strokeWidth="11"
          opacity="0.78"
        />
        <ellipse
          rx="68"
          ry="18"
          fill="none"
          stroke="#F0F6FF"
          strokeWidth="2.2"
          strokeDasharray="18 10 8 10"
          opacity="0.85"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0;360"
            dur="18s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          rx="54"
          ry="14"
          fill="none"
          stroke="#6EE7B7"
          strokeWidth="1.5"
          strokeDasharray="12 14"
          opacity="0.75"
        />
      </g>

      {/* Partículas de colores girando alrededor del agujero negro */}
      <g transform="rotate(-18) scale(1, 0.48)">
        {BLACK_HOLE_PARTICLES.map((p, idx) => (
          <g key={idx}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${p.angle}`}
              to={`${p.angle + 360}`}
              dur={p.dur}
              repeatCount="indefinite"
            />
            <circle
              cx={p.r}
              cy="0"
              r={p.size}
              fill={p.color}
              style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}
            />
            <path
              d={`M ${p.r} 0 A ${p.r} ${p.r} 0 0 0 ${p.r * 0.92} ${-p.r * 0.38}`}
              fill="none"
              stroke={p.color}
              strokeWidth={p.size * 0.65}
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>
        ))}
      </g>

      {/* Horizonte de Sucesos (Núcleo Negro Profundo + Anillo de Fotones) */}
      <circle r="27" fill="#010208" stroke="#E2EEFF" strokeWidth="1.6" strokeOpacity="0.9" />
      <circle r="24" fill="#000004" />
      <circle
        r="28.5"
        fill="none"
        stroke="#C084FC"
        strokeWidth="2.2"
        strokeDasharray="22 14"
        opacity="0.85"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="360;0"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Arco frontal del disco de acreción pasando por delante de la esfera */}
      <g transform="rotate(-18)">
        <path
          d="M -76,0 A 76,21 0 0,0 76,0"
          fill="none"
          stroke="url(#bhDiskGrad)"
          strokeWidth="6.5"
          opacity="0.92"
        />
        <path
          d="M -62,0 A 62,16 0 0,0 62,0"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          opacity="0.85"
        />
      </g>
    </g>
  );
}

/** Planeta Numérix Satelital en el Cielo de Fondo con Anillos Cuánticos. */
function PlanetaFondoNumerix({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="54" fill="url(#bgPlanetHalo)" />
      {/* Arco trasero del anillo */}
      <g transform="rotate(-22)">
        <path
          d="M -62,0 A 62,17 0 0,1 62,0"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="3.5"
          opacity="0.45"
        />
      </g>
      {/* Esfera del planeta */}
      <circle r="32" fill="url(#bgPlanetSphere)" stroke="#BFDBFE" strokeOpacity="0.55" strokeWidth="1" />
      {/* Bandas y detalles continentales */}
      <ellipse cx="0" cy="-6" rx="28" ry="7" fill="none" stroke="#E2EEFF" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="4 3" />
      <ellipse cx="0" cy="8" rx="26" ry="6" fill="none" stroke="#6EE7B7" strokeOpacity="0.25" strokeWidth="1" />
      {/* Sombra esférica */}
      <path
        d="M 10,-30 A 32,32 0 1,1 -22,23 A 28,30 0 1,0 10,-30 Z"
        fill="#030614"
        opacity="0.72"
      />
      {/* Arco delantero del anillo */}
      <g transform="rotate(-22)">
        <path
          d="M -62,0 A 62,17 0 0,0 62,0"
          fill="none"
          stroke="url(#railFluidGrad)"
          strokeWidth="4"
          opacity="0.88"
        />
        <circle cx="-48" cy="11" r="3" fill="#E2EEFF" />
        <circle cx="44" cy="12" r="2.5" fill="#6EE7B7" />
      </g>
    </g>
  );
}

/** Choque de Meteoritos Incandescentes con Onda Expansiva y Chispas. */
function ChoqueMeteoritos({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Resplandor de la colisión */}
      <circle r="44" fill="url(#impactFlashGrad)" />

      {/* Anillo de onda de choque */}
      <ellipse
        rx="28"
        ry="14"
        transform="rotate(-24)"
        fill="none"
        stroke="#F0ABFC"
        strokeWidth="1.6"
        strokeDasharray="6 4"
      >
        <animate attributeName="rx" values="14;34;14" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="ry" values="7;17;7" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2.8s" repeatCount="indefinite" />
      </ellipse>

      {/* Estela del meteorito izquierdo */}
      <path d="M -46,-22 L -8,-3" stroke="url(#cometTailPurple)" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {/* Meteorito izquierdo */}
      <g transform="translate(-11 -3) rotate(15)">
        <polygon
          points="-14,-8 -4,-13 6,-6 4,6 -8,9 -15,1"
          fill="#312E81"
          stroke="#C4B5FD"
          strokeWidth="1.2"
        />
        <path d="M -8,-4 L 2,-2 L -2,4" stroke="#E879F9" strokeWidth="1.3" fill="none" />
      </g>

      {/* Estela del meteorito derecho */}
      <path d="M 48,18 L 9,2" stroke="url(#cometTailEmerald)" strokeWidth="5.5" strokeLinecap="round" opacity="0.7" />
      {/* Meteorito derecho */}
      <g transform="translate(11 3) rotate(-20)">
        <polygon
          points="-5,-9 7,-11 14,-2 9,8 -3,7 -8,0"
          fill="#1E2952"
          stroke="#93C5FD"
          strokeWidth="1.2"
        />
        <path d="M -2,-3 L 6,0 L 1,4" stroke="#6EE7B7" strokeWidth="1.3" fill="none" />
      </g>

      {/* Destello central de choque + fragmentos desprendidos */}
      <circle r="6" fill="#FFFFFF">
        <animate attributeName="r" values="4.5;7.5;4.5" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <path
        d="M 0,-14 L 2,-3 L 14,0 L 2,3 L 0,14 L -2,3 L -14,0 L -2,-3 Z"
        fill="#FDE047"
        opacity="0.9"
      />
      {/* Chispas/fragmentos */}
      <circle cx="-16" cy="14" r="2" fill="#FDE047" />
      <circle cx="15" cy="-14" r="2.2" fill="#E879F9" />
      <circle cx="4" cy="18" r="1.6" fill="#6EE7B7" />
      <circle cx="-8" cy="-17" r="1.8" fill="#93C5FD" />
    </g>
  );
}

/** Cometas luminosos atravesando el cosmos en segundo plano (dentro de los límites del viewBox). */
function CometasPasando() {
  return (
    <g pointerEvents="none">
      {/* Cometa 1: Azul Crema / Esmeralda */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="120 45; 780 235"
          dur="11s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.88;1" dur="11s" repeatCount="indefinite" />
        <g transform="rotate(16)">
          <path
            d="M -75,0 L 0,0"
            stroke="url(#cometTailEmerald)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="6" fill="#6EE7B7" opacity="0.45" />
        </g>
      </g>

      {/* Cometa 2: Magenta / Amatista */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="770 110; 130 410"
          dur="14s"
          begin="2s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.88;1" dur="14s" begin="2s" repeatCount="indefinite" />
        <g transform="rotate(155)">
          <path
            d="M -80,0 L 0,0"
            stroke="url(#cometTailPurple)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="3.2" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="6.5" fill="#E879F9" opacity="0.45" />
        </g>
      </g>
    </g>
  );
}

/** Ramillete de cristales elegantes (Morado Amatista, Esmeralda y Azul Crema). */
function CristalesMontaña({
  x,
  y,
  escala = 1,
  variante = 'violeta',
}: {
  x: number;
  y: number;
  escala?: number;
  variante?: 'violeta' | 'esmeralda' | 'crema';
}) {
  const colores = {
    violeta: { a: '#C084FC', b: '#7C3AED', c: '#E879F9' },
    esmeralda: { a: '#6EE7B7', b: '#10B981', c: '#A5B4FC' },
    crema: { a: '#E2EEFF', b: '#93C5FD', c: '#C4B5FD' },
  }[variante];

  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <ellipse cx="0" cy="4" rx="18" ry="5" fill={colores.a} opacity="0.2" />
      <polygon
        points="-10,2 -14,-17 -5,-25 -1,-12 -2,2"
        fill={colores.b}
        stroke="#E2EEFF"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />
      <polygon
        points="-2,4 -3,-27 4,-35 9,-20 5,4"
        fill={colores.a}
        stroke="#FFFFFF"
        strokeOpacity="0.6"
        strokeWidth="0.9"
      />
      <polygon
        points="4,3 9,-15 16,-21 17,-9 11,3"
        fill={colores.c}
        stroke="#E2EEFF"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />
    </g>
  );
}

/** Portal de Cristal Elegante en la Casilla 01 en Azul Eléctrico. */
function PortalInicio({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="18" rx="44" ry="16" fill="url(#portalFloorGlow)" />
      <polygon
        points="-34,16 -40,-6 -30,-16 -22,12"
        fill="#0055D4"
        stroke="#7DD3FC"
        strokeOpacity="0.8"
        strokeWidth="1"
      />
      <polygon
        points="30,18 38,-4 28,-14 20,14"
        fill="#0077FF"
        stroke="#BAE6FD"
        strokeOpacity="0.8"
        strokeWidth="1"
      />
      <polygon
        points="-24,18 -28,-40 0,-72 28,-40 24,18 14,22 15,-32 0,-52 -15,-32 -14,22"
        fill="url(#portalArchGrad)"
        stroke="#E2EEFF"
        strokeOpacity="0.75"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <polygon
        points="-14,16 -15,-32 0,-51 15,-32 14,16"
        fill="url(#portalEnergyGrad)"
        opacity="0.85"
      />
      <ellipse
        cx="0"
        cy="-14"
        rx="8"
        ry="20"
        fill="none"
        stroke="#E2EEFF"
        strokeWidth="1.1"
        strokeDasharray="4 4"
        opacity="0.75"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 -14;360 0 -14"
          dur="12s"
          repeatCount="indefinite"
        />
      </ellipse>
      <circle cx="0" cy="-14" r="3.5" fill="#FFFFFF" opacity="0.92" />
    </g>
  );
}

/** Santuario del Guardián en la Casilla 20 con Altar Pulcro y Esfera Armilar. */
function SantuarioGuardian({
  x,
  y,
  activo,
  desbloqueado,
}: {
  x: number;
  y: number;
  activo: boolean;
  desbloqueado: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="16" rx="82" ry="34" fill="url(#bossHaloGrad)" />

      {[
        { dy: 22, w: 62, h: 26, d: 10, fillTop: '#0048B8', fillLeft: '#003285', fillRight: '#00225E', stroke: '#38BDF8' },
        { dy: 12, w: 48, h: 20, d: 9, fillTop: '#0066FF', fillLeft: '#0049BD', fillRight: '#00348A', stroke: '#7DD3FC' },
        { dy: 2, w: 34, h: 14, d: 8, fillTop: '#008CFF', fillLeft: '#0062D1', fillRight: '#00459E', stroke: '#00F5FF' },
      ].map((step, idx) => (
        <g key={idx} transform={`translate(0 ${step.dy})`}>
          <polygon
            points={`0,${-step.h} ${step.w},0 0,${step.h} ${-step.w},0`}
            fill={step.fillTop}
            fillOpacity="0.96"
            stroke={step.stroke}
            strokeOpacity="0.82"
            strokeWidth="1.2"
          />
          <polygon
            points={`${-step.w},0 0,${step.h} 0,${step.h + step.d} ${-step.w},${step.d}`}
            fill={step.fillLeft}
            stroke={step.stroke}
            strokeOpacity="0.58"
            strokeWidth="1"
          />
          <polygon
            points={`${step.w},0 0,${step.h} 0,${step.h + step.d} ${step.w},${step.d}`}
            fill={step.fillRight}
            stroke={step.stroke}
            strokeOpacity="0.58"
            strokeWidth="1"
          />
        </g>
      ))}

      <polygon points="-44,10 -48,-12 -40,-20 -36,8" fill="#00B4FF" fillOpacity="0.85" stroke="#E0F2FE" strokeWidth="0.9" />
      <polygon points="44,10 48,-12 40,-20 36,8" fill="#00FF88" fillOpacity="0.82" stroke="#ECFDF5" strokeWidth="0.9" />

      <ellipse cx="0" cy="-2" rx="24" ry="10" fill="#004FC4" stroke="#E0F2FE" strokeOpacity="0.9" strokeWidth="1.4" />
      <ellipse cx="0" cy="-4" rx="16" ry="6" fill="#00E5FF" opacity="0.92" />

      <polygon
        points="-16,-4 -34,-68 34,-68 16,-4"
        fill="url(#armilarBeamGrad)"
        opacity="0.48"
      />

      <g transform="translate(0 -50)">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -48; 0 -54; 0 -48"
          dur="3.6s"
          repeatCount="indefinite"
        />
        <circle r="36" fill="url(#armilarCoreGlow)" opacity="0.6" />

        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0;360"
            dur={desbloqueado ? '14s' : '24s'}
            repeatCount="indefinite"
          />
          <ellipse rx="30" ry="28" fill="none" stroke="url(#goldRingGrad)" strokeWidth="4.5" />
        </g>

        <g transform="rotate(-32)">
          <ellipse rx="27" ry="14" fill="none" stroke="#E2EEFF" strokeOpacity="0.85" strokeWidth="3.2" />
        </g>

        <g transform="rotate(36)">
          <ellipse rx="24" ry="12" fill="none" stroke="#6EE7B7" strokeOpacity="0.8" strokeWidth="2.8" />
        </g>

        <circle r="9.5" fill="#1E1B4B" stroke="#E2EEFF" strokeWidth="1.4" />
        <circle r="6" fill="#00F5FF">
          <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle r="2.8" fill="#FFFFFF" />
      </g>

      <g transform="translate(0 -102)">
        <rect
          x="-72"
          y="-11"
          width="144"
          height="22"
          rx="11"
          fill="#031530"
          fillOpacity="0.94"
          stroke={activo ? '#00F5FF' : '#38BDF8'}
          strokeOpacity="0.88"
          strokeWidth="1.4"
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9.5"
          fontWeight="800"
          letterSpacing="1.6"
          fill="#E0F2FE"
        >
          GUARDIÁN DEL NIVEL
        </text>
      </g>
    </g>
  );
}

/** Cubo Isométrico 3D Pulcro estilo Liquid-Glass. */
function CuboIsometricoSVG({
  nodo,
  activo,
  visitado,
}: {
  nodo: NodoCubo;
  activo: boolean;
  visitado: boolean;
}) {
  if (nodo.tipo === 'boss') return null;

  const W = 31;
  const H = 15.5;
  const D = 25;
  const { x, y, tipo, numero, opIzq, opDer } = nodo;

  const paleta = {
    normal: {
      top: activo
        ? 'rgba(0, 245, 255, 0.72)'
        : visitado
          ? 'rgba(0, 180, 255, 0.56)'
          : 'rgba(0, 128, 255, 0.44)',
      left: visitado ? 'rgba(0, 102, 235, 0.96)' : 'rgba(0, 74, 186, 0.96)',
      right: visitado ? 'rgba(0, 68, 168, 0.98)' : 'rgba(0, 48, 132, 0.98)',
      strokeTop: activo ? '#FFFFFF' : '#00F5FF',
      strokeSide: activo ? '#7DD3FC' : 'rgba(56, 212, 255, 0.85)',
      textTop: '#FFFFFF',
      textSide: '#BAE6FD',
      glow: activo ? 'rgba(0, 245, 255, 0.95)' : 'rgba(0, 136, 255, 0.72)',
    },
    especial: {
      top: activo ? 'rgba(0, 255, 136, 0.68)' : 'rgba(16, 235, 145, 0.45)',
      left: 'rgba(6, 95, 70, 0.92)',
      right: 'rgba(4, 62, 48, 0.96)',
      strokeTop: activo ? '#FFFFFF' : '#00FF88',
      strokeSide: 'rgba(52, 211, 153, 0.85)',
      textTop: '#FFFFFF',
      textSide: '#6EE7B7',
      glow: 'rgba(0, 255, 136, 0.78)',
    },
    trampa: {
      top: activo ? 'rgba(255, 230, 80, 0.72)' : 'rgba(255, 145, 0, 0.5)',
      left: 'rgba(180, 72, 10, 0.94)',
      right: 'rgba(130, 48, 8, 0.97)',
      strokeTop: activo ? '#FFFFFF' : '#FDE047',
      strokeSide: 'rgba(251, 191, 36, 0.88)',
      textTop: '#FFFBEB',
      textSide: '#FDE047',
      glow: 'rgba(255, 153, 0, 0.8)',
    },
  }[tipo];

  const topPts = `${x},${y - H * 2} ${x + W},${y - H} ${x},${y} ${x - W},${y - H}`;
  const leftPts = `${x - W},${y - H} ${x},${y} ${x},${y + D} ${x - W},${y - H + D}`;
  const rightPts = `${x + W},${y - H} ${x},${y} ${x},${y + D} ${x + W},${y - H + D}`;

  return (
    <g
      id={`cell-${nodo.index}`}
      style={{
        filter: `drop-shadow(0 8px 14px rgba(2, 6, 23, 0.68)) drop-shadow(0 0 ${activo ? 15 : 6}px ${paleta.glow})`,
      }}
    >
      <ellipse cx={x} cy={y + D - 2} rx={W * 0.92} ry={H * 0.85} fill="#020617" opacity="0.48" />

      {activo && (
        <polygon
          points={`${x},${y - H * 2 - 4} ${x + W + 5},${y - H} ${x},${y + 4} ${x - W - 5},${y - H}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.92"
        >
          <animate attributeName="stroke-opacity" values="0.95;0.35;0.95" dur="1.6s" repeatCount="indefinite" />
        </polygon>
      )}

      <polygon
        points={leftPts}
        fill={paleta.left}
        stroke={paleta.strokeSide}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <polygon
        points={rightPts}
        fill={paleta.right}
        stroke={paleta.strokeSide}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <polygon
        points={topPts}
        fill={paleta.top}
        stroke={paleta.strokeTop}
        strokeWidth={activo ? 2.2 : 1.5}
        strokeLinejoin="round"
      />

      <text
        x={x}
        y={y - H}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textTop}
        fontSize="11.5"
        fontWeight="900"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        {numero}
      </text>

      <text
        transform={`translate(${x - W * 0.48} ${y + D * 0.32}) skewY(26)`}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textSide}
        opacity="0.9"
        fontSize="11"
        fontWeight="800"
      >
        {opIzq}
      </text>

      <text
        transform={`translate(${x + W * 0.48} ${y + D * 0.32}) skewY(-26)`}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textSide}
        opacity="0.9"
        fontSize="11"
        fontWeight="800"
      >
        {opDer}
      </text>
    </g>
  );
}

/**
 * Token del Jugador Rediseñado: Explorador Espacial Cuántico con Visor Holográfico,
 * Jetpack con propulsores activos, antena de telemetría y traje detallado.
 */
function JovenAstronauta({ caminando }: { caminando: boolean }) {
  return (
    <g>
      {/* Halo y sombra en la plataforma */}
      <ellipse cx="0" cy="3" rx="15" ry="5.5" fill="#020617" opacity="0.55" />
      <ellipse cx="0" cy="3" rx="11" ry="3.8" fill="#6EE7B7" opacity="0.28">
        <animate attributeName="rx" values="9;13;9" dur="1.8s" repeatCount="indefinite" />
      </ellipse>

      {/* Grupo con levitación suave o salto al caminar */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={caminando ? '0 0; 0 -6; 0 0' : '0 0; 0 -2.5; 0 0'}
          dur={caminando ? '0.26s' : '2.4s'}
          repeatCount="indefinite"
        />

        {/* ── Jetpack Cuántico Trasero con Alas Cortas y Propulsores ── */}
        <polygon points="-16,-24 -11,-29 -11,-15 -15,-13" fill="#6366F1" stroke="#E2EEFF" strokeWidth="0.9" />
        <polygon points="16,-24 11,-29 11,-15 15,-13" fill="#6366F1" stroke="#E2EEFF" strokeWidth="0.9" />
        <rect x="-12" y="-31" width="24" height="18" rx="5" fill="#1E2952" stroke="#93C5FD" strokeWidth="1.2" />
        {/* Llamas de propulsión del Jetpack */}
        <ellipse cx="-7" cy="-11" rx="2.8" ry="4.5" fill="#6EE7B7" opacity="0.85">
          <animate attributeName="ry" values="3.5;6;3.5" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="7" cy="-11" rx="2.8" ry="4.5" fill="#C084FC" opacity="0.85">
          <animate attributeName="ry" values="4;6.5;4" dur="0.4s" repeatCount="indefinite" />
        </ellipse>

        {/* ── Piernas y Botas Magnéticas ── */}
        <rect x="-7.5" y="-13" width="6.2" height="9.5" rx="3" fill="#E2EEFF" stroke="#312E81" strokeWidth="1.1" />
        <rect x="1.3" y="-13" width="6.2" height="9.5" rx="3" fill="#E2EEFF" stroke="#312E81" strokeWidth="1.1" />
        {/* Rodilleras */}
        <rect x="-6.5" y="-9.5" width="4.2" height="2.4" rx="1" fill="#6366F1" />
        <rect x="2.3" y="-9.5" width="4.2" height="2.4" rx="1" fill="#6366F1" />
        {/* Botas */}
        <rect x="-8.8" y="-4.5" width="8" height="5" rx="2.4" fill="#1E1B4B" stroke="#93C5FD" strokeWidth="1" />
        <rect x="0.8" y="-4.5" width="8" height="5" rx="2.4" fill="#1E1B4B" stroke="#93C5FD" strokeWidth="1" />
        <line x1="-8" y1="-0.5" x2="-1.5" y2="-0.5" stroke="#6EE7B7" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="1.5" y1="-0.5" x2="8" y2="-0.5" stroke="#6EE7B7" strokeWidth="1.4" strokeLinecap="round" />

        {/* ── Torso Aeroespacial y Pechera ── */}
        <rect x="-10" y="-29" width="20" height="17" rx="6.5" fill="#F8FAFC" stroke="#312E81" strokeWidth="1.2" />
        {/* Hombreras morado/azul crema */}
        <path d="M -10,-25 C -10,-28.5 -5,-29 0,-29 C 5,-29 10,-28.5 10,-25 Z" fill="#4F46E5" />
        {/* Cinturón utilitario */}
        <rect x="-10" y="-16.5" width="20" height="3.8" rx="1.4" fill="#1E1B4B" />
        <rect x="-3.2" y="-17.2" width="6.4" height="5" rx="1.4" fill="#6EE7B7" stroke="#064E3B" strokeWidth="0.9" />
        {/* Núcleo de energía en el pecho */}
        <rect x="-5.5" y="-25" width="11" height="6.2" rx="2" fill="#0F1734" stroke="#93C5FD" strokeWidth="1" />
        <circle cx="0" cy="-21.9" r="2" fill="#6EE7B7" />

        {/* ── Brazos y Guantes ── */}
        <g transform="translate(-10 -25) rotate(-26)">
          <rect x="-7.5" y="-2.2" width="8.5" height="5.2" rx="2.6" fill="#F0F6FF" stroke="#312E81" strokeWidth="1.1" />
          <circle cx="-8" cy="0.4" r="2.8" fill="#6366F1" stroke="#E2EEFF" strokeWidth="0.9" />
        </g>
        <g transform="translate(10 -24) rotate(22)">
          <rect x="-1" y="-2.2" width="8.5" height="5.2" rx="2.6" fill="#F0F6FF" stroke="#312E81" strokeWidth="1.1" />
          <circle cx="8" cy="0.4" r="2.8" fill="#6366F1" stroke="#E2EEFF" strokeWidth="0.9" />
        </g>

        {/* ── Casco Espacial Moderno con Antena y Visor Curvo ── */}
        {/* Antena de telemetría */}
        <line x1="9" y1="-52" x2="12" y2="-59" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12.5" cy="-60" r="2.3" fill="#6EE7B7">
          <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite" />
        </circle>

        {/* Orejeras de comunicación */}
        <rect x="-15.5" y="-46" width="3.5" height="7.5" rx="1.8" fill="#6366F1" stroke="#E2EEFF" strokeWidth="1" />
        <rect x="12" y="-46" width="3.5" height="7.5" rx="1.8" fill="#6366F1" stroke="#E2EEFF" strokeWidth="1" />

        {/* Domo exterior del casco */}
        <circle cx="0" cy="-42.5" r="13.5" fill="#F0F6FF" stroke="#312E81" strokeWidth="1.4" />

        {/* Visor panorámico oscuro/iridiscente con ojos LED expresivos */}
        <rect
          x="-10.5"
          y="-49.5"
          width="21"
          height="14.5"
          rx="7.2"
          fill="url(#visorCyberGrad)"
          stroke="#93C5FD"
          strokeWidth="1.2"
        />

        {/* Ojos digitales expresivos y sonrisa luminosa en el visor */}
        <ellipse cx="-4.2" cy="-42.5" rx="1.9" ry="2.4" fill="#E2EEFF" />
        <ellipse cx="4.2" cy="-42.5" rx="1.9" ry="2.4" fill="#E2EEFF" />
        <circle cx="-3.6" cy="-43.2" r="0.8" fill="#6EE7B7" />
        <circle cx="4.8" cy="-43.2" r="0.8" fill="#6EE7B7" />
        <path
          d="M -2.4 -38.8 Q 0 -36.8 2.4 -38.8"
          stroke="#6EE7B7"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Reflejo de cristal líquido en el casco */}
        <path
          d="M -7.5 -47.5 Q -2 -50.2 5 -48.2"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>
    </g>
  );
}

/**
 * Escenario Cósmico Rico + Isla-Montaña Centrada:
 * Incluye Agujero Negro con partículas de colores, cometas pasando,
 * choque de meteoritos y planeta Numérix satelital.
 */
const EscenarioMontaña = memo(function EscenarioMontaña() {
  return (
    <g>
      {/* ── Nebulosas de Fondo (Azul Profundo, Morado y Esmeralda) ── */}
      <ellipse cx="450" cy="340" rx="410" ry="260" fill="url(#deepNebulaGrad)" />
      <ellipse cx="220" cy="210" rx="250" ry="165" fill="url(#purpleNebulaGrad)" />
      <ellipse cx="660" cy="490" rx="240" ry="145" fill="url(#emeraldNebulaGrad)" />

      {/* ── Campo de Estrellas de Fondo ── */}
      {[
        [45, 42, 1.4], [128, 32, 1.8], [260, 48, 1.3], [390, 28, 1.6], [520, 44, 1.5],
        [820, 38, 1.7], [860, 140, 1.4], [845, 295, 1.8], [865, 455, 1.5], [790, 615, 1.6],
        [42, 210, 1.5], [35, 360, 1.7], [55, 495, 1.4], [115, 625, 1.8], [295, 645, 1.4],
      ].map(([sx, sy, sr], idx) => (
        <circle key={`st-${idx}`} cx={sx} cy={sy} r={sr} fill="#E2EEFF" opacity={0.45 + (idx % 3) * 0.18} />
      ))}

      {/* ── Cometas Animados Cruzando el Espacio ── */}
      <CometasPasando />

      {/* ── AGUJERO NEGRO CON DISCO DE ACRECIÓN Y PARTÍCULAS MULTICOLOR (Arriba Izquierda) ── */}
      <AgujeroNegroCosmico x={126} y={102} />

      {/* ── PLANETA NUMÉRIX SATELITAL EN EL CIELO (Arriba Derecha) ── */}
      <PlanetaFondoNumerix x={808} y={96} />

      {/* ── CHOQUE DE METEORITOS INCANDESCENTES (Abajo Izquierda) ── */}
      <ChoqueMeteoritos x={88} y={556} />

      {/* ── Segundo Choque/Fragmentos de Meteorito Menor (Derecha Media) ── */}
      <g transform="translate(838 355) scale(0.76)">
        <ChoqueMeteoritos x={0} y={0} />
      </g>

      {/* ── Estación Satelital & Mini-Robot Mascota Feliz (Derecha) ── */}
      <g transform="translate(836 530)">
        <ellipse rx="78" ry="46" fill="url(#purpleNebulaGrad)" />
        <g transform="rotate(-16)">
          <ellipse rx="50" ry="15" fill="none" stroke="#00F5FF" strokeOpacity="0.65" strokeWidth="1.5" strokeDasharray="6 4" />
          <ellipse rx="34" ry="10" fill="none" stroke="#00FF88" strokeOpacity="0.65" strokeWidth="1.2" />
        </g>
        {/* Mini Robot Mascota flotante con ojos felices */}
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="2.6s" repeatCount="indefinite" />
          <line x1="0" y1="-22" x2="0" y2="-31" stroke="#00F5FF" strokeWidth="2" />
          <circle cx="0" cy="-33" r="3.5" fill="#FDE047" style={{ filter: 'drop-shadow(0 0 6px #FDE047)' }} />
          <rect x="-17" y="-22" width="34" height="26" rx="10" fill="#0EA5E9" stroke="#E0F2FE" strokeWidth="1.8" />
          <rect x="-12" y="-17" width="24" height="14" rx="5" fill="#031530" stroke="#00F5FF" strokeWidth="1.2" />
          <circle cx="-5" cy="-10.5" r="2.6" fill="#00FF88" />
          <circle cx="5" cy="-10.5" r="2.6" fill="#00FF88" />
          <path d="M -4 -6 Q 0 -3 4 -6" stroke="#00F5FF" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Propulsor neón */}
          <ellipse cx="0" cy="8" rx="6" ry="3.5" fill="#00F5FF" opacity="0.8">
            <animate attributeName="ry" values="2.5;5;2.5" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
        </g>
        <circle cx="-38" cy="10" r="2.8" fill="#00FF88" style={{ filter: 'drop-shadow(0 0 6px #00FF88)' }} />
        <circle cx="40" cy="-8" r="3" fill="#FDE047" style={{ filter: 'drop-shadow(0 0 6px #FDE047)' }} />
      </g>

      {/* ── Cohete Espacial Neón Divertido volando arriba derecha ── */}
      <g transform="translate(865 225) rotate(-32)">
        <animateTransform attributeName="transform" type="translate" values="865 225; 848 205; 865 225" dur="4.2s" repeatCount="indefinite" />
        <g transform="rotate(-32)">
          {/* Llama turbo neón */}
          <path d="M -6,18 L 0,34 L 6,18 Z" fill="#FDE047" opacity="0.92">
            <animate attributeName="opacity" values="0.95;0.5;0.95" dur="0.35s" repeatCount="indefinite" />
          </path>
          <path d="M -3.5,18 L 0,28 L 3.5,18 Z" fill="#00F5FF" />
          {/* Aletas */}
          <polygon points="-10,6 -18,18 -9,16" fill="#FF6B35" stroke="#FDE047" strokeWidth="1" />
          <polygon points="10,6 18,18 9,16" fill="#FF6B35" stroke="#FDE047" strokeWidth="1" />
          {/* Cuerpo del cohete */}
          <path d="M 0,-24 C 9,-14 11,0 10,16 L -10,16 C -11,0 -9,-14 0,-24 Z" fill="#E0F2FE" stroke="#00F5FF" strokeWidth="1.6" />
          <path d="M 0,-24 C 5,-18 7,-12 8,-8 L -8,-8 C -7,-12 -5,-18 0,-24 Z" fill="#0EA5E9" />
          {/* Ventanilla */}
          <circle cx="0" cy="0" r="5" fill="#031530" stroke="#00F5FF" strokeWidth="1.8" />
          <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FFFFFF" opacity="0.85" />
        </g>
      </g>

      {/* ── Símbolos Matemáticos Neón Flotantes alrededor de la isla ── */}
      <g pointerEvents="none" fontFamily="'Orbitron', sans-serif" fontWeight="900">
        <text x="16" y="196" fill="#00F5FF" fontSize="22" opacity="0.72" style={{ filter: 'drop-shadow(0 0 10px #00F5FF)' }}>
          +
          <animate attributeName="y" values="196;184;196" dur="3.4s" repeatCount="indefinite" />
        </text>
        <text x="874" y="425" fill="#00FF88" fontSize="22" opacity="0.75" style={{ filter: 'drop-shadow(0 0 10px #00FF88)' }}>
          ×
          <animate attributeName="y" values="425;412;425" dur="3.8s" repeatCount="indefinite" />
        </text>
        <text x="28" y="428" fill="#FDE047" fontSize="20" opacity="0.75" style={{ filter: 'drop-shadow(0 0 10px #FDE047)' }}>
          π
          <animate attributeName="y" values="428;416;428" dur="4.1s" repeatCount="indefinite" />
        </text>
        <text x="772" y="618" fill="#38BDF8" fontSize="22" opacity="0.78" style={{ filter: 'drop-shadow(0 0 10px #38BDF8)' }}>
          ÷
          <animate attributeName="y" values="618;606;618" dur="3.2s" repeatCount="indefinite" />
        </text>
        <text x="242" y="68" fill="#00FF88" fontSize="18" opacity="0.72" style={{ filter: 'drop-shadow(0 0 8px #00FF88)' }}>
          100%
          <animate attributeName="y" values="68;58;68" dur="4.4s" repeatCount="indefinite" />
        </text>
        <text x="698" y="48" fill="#FDE047" fontSize="20" opacity="0.78" style={{ filter: 'drop-shadow(0 0 8px #FDE047)' }}>
          ★
          <animate attributeName="y" values="48;38;48" dur="2.9s" repeatCount="indefinite" />
        </text>
      </g>

      {/* ══════════════════ 1. BASE ESCULTÓRICA CENTRADA DE LA ISLA FLOTANTE ══════════════════ */}
      <g>
        <ellipse cx="455" cy="624" rx="295" ry="38" fill="#020510" opacity="0.72" />

        <path
          d="M 88 368 C 118 518, 250 628, 450 642 C 650 628, 775 518, 812 408 C 702 548, 492 580, 322 548 C 178 518, 108 435, 88 368 Z"
          fill="url(#cliffBaseGrad)"
          stroke="#4F46E5"
          strokeOpacity="0.3"
          strokeWidth="1.3"
        />

        <path
          d="M 155 466 C 235 584, 345 642, 452 648 C 560 642, 668 580, 745 476 C 642 568, 482 588, 328 556 C 238 536, 185 502, 155 466 Z"
          fill="url(#cliffDeepGrad)"
          opacity="0.92"
        />
      </g>

      {/* ══════════════════ 2. TERRAZA 1: MESETA PRINCIPAL AMPLIA (CUBOS 01..06 Y PORTAL) ══════════════════ */}
      <g>
        <path
          d="M 84 366 C 102 472, 182 558, 332 596 C 492 630, 672 612, 788 520 L 810 416 C 705 556, 496 586, 326 554 C 182 522, 112 434, 84 366 Z"
          fill="url(#cliffWallGrad)"
          stroke="#93C5FD"
          strokeOpacity="0.34"
          strokeWidth="1.3"
        />
        <path
          d="M 84 366 C 74 262, 158 172, 356 102 C 532 54, 704 80, 770 192 C 830 292, 826 432, 754 504 C 654 592, 478 608, 320 572 C 178 540, 94 454, 84 366 Z"
          fill="url(#terrace1TopGrad)"
          stroke="#BFDBFE"
          strokeOpacity="0.42"
          strokeWidth="1.7"
        />
      </g>

      {/* ══════════════════ 3. TERRAZA 2: MESETA INTERMEDIA FLUIDA (CUBOS 07..15) ══════════════════ */}
      <g>
        <path
          d="M 158 430 C 246 478, 384 474, 510 410 C 632 348, 724 268, 738 178 L 738 220 C 720 308, 628 388, 502 452 C 376 512, 242 510, 158 466 Z"
          fill="url(#innerCliffGrad)"
          stroke="#A5B4FC"
          strokeOpacity="0.4"
          strokeWidth="1.3"
        />
        <path
          d="M 124 356 C 114 246, 212 138, 408 82 C 568 46, 716 78, 738 178 C 724 268, 632 348, 510 410 C 384 474, 236 478, 158 430 C 132 410, 126 384, 124 356 Z"
          fill="url(#terrace2TopGrad)"
          stroke="#C4B5FD"
          strokeOpacity="0.5"
          strokeWidth="1.7"
        />
      </g>

      {/* ══════════════════ 4. TERRAZA 3: CUMBRE DEL GUARDIÁN (CIMA IZQUIERDA) ══════════════════ */}
      <g>
        <path
          d="M 74 282 C 98 350, 196 378, 294 344 C 364 318, 402 260, 388 202 L 388 250 C 400 306, 358 362, 288 388 C 190 422, 94 390, 74 326 Z"
          fill="url(#summitCliffGrad)"
          stroke="#C4B5FD"
          strokeOpacity="0.46"
          strokeWidth="1.4"
        />
        <path
          d="M 74 282 C 66 212, 132 154, 230 148 C 322 142, 380 166, 388 202 C 402 260, 364 318, 294 344 C 196 378, 98 350, 74 282 Z"
          fill="url(#summitTopGrad)"
          stroke="#E2EEFF"
          strokeOpacity="0.62"
          strokeWidth="1.8"
        />
        <ellipse
          cx="216"
          cy="252"
          rx="122"
          ry="64"
          transform="rotate(-8 216 252)"
          fill="#0044BD"
          fillOpacity="0.62"
          stroke="#00E5FF"
          strokeOpacity="0.65"
          strokeWidth="1.4"
        />
      </g>

      {/* ── Bruma Luminosa Suave en las Laderas ── */}
      <ellipse cx="150" cy="410" rx="100" ry="30" fill="url(#mistSoftGrad)" />
      <ellipse cx="665" cy="410" rx="110" ry="34" fill="url(#mistSoftGrad)" />
      <ellipse cx="410" cy="585" rx="155" ry="32" fill="url(#mistSoftGrad)" />

      {/* ── Arcos Orbitales Limpios ── */}
      <path
        d="M 68 242 C 8 348, 20 506, 142 596"
        fill="none"
        stroke="#93C5FD"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M 782 222 C 858 318, 860 460, 788 552"
        fill="none"
        stroke="#C4B5FD"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />

      {/* Cristales decorativos armónicos en las terrazas */}
      <CristalesMontaña x={86} y={280} escala={1.0} variante="crema" />
      <CristalesMontaña x={182} y={488} escala={0.92} variante="esmeralda" />
      <CristalesMontaña x={436} y={498} escala={0.9} variante="crema" />
      <CristalesMontaña x={625} y={392} escala={1.0} variante="crema" />
      <CristalesMontaña x={748} y={492} escala={0.86} variante="esmeralda" />

      {/* Destellos estelares suaves sobre la montaña */}
      {[
        { cx: 148, cy: 310, c: '#E2EEFF' },
        { cx: 280, cy: 292, c: '#C4B5FD' },
        { cx: 382, cy: 252, c: '#6EE7B7' },
        { cx: 545, cy: 368, c: '#E2EEFF' },
        { cx: 692, cy: 325, c: '#C4B5FD' },
        { cx: 518, cy: 504, c: '#6EE7B7' },
      ].map((pt, i) => (
        <circle key={i} cx={pt.cx} cy={pt.cy} r="2.5" fill={pt.c} opacity="0.78">
          <animate attributeName="opacity" values="0.25;0.88;0.25" dur={`${2.4 + (i % 3)}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
});

interface MapaMontañaCuanticaProps {
  pos: number;
  caminando: boolean;
  santuarioDesbloqueado: boolean;
}

export default function MapaMontañaCuantica({
  pos,
  caminando,
  santuarioDesbloqueado,
}: MapaMontañaCuanticaProps) {
  const nodoActual = NODOS_NUMERIX[Math.min(pos, NODOS_NUMERIX.length - 1)];

  return (
    <svg
      viewBox="-35 0 970 680"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      role="img"
      aria-label="Montaña Cuántica de Numérix"
    >
      <defs>
        {/* Nebulosas de fondo: Azul Tecnológico, Cian Holográfico y Turquesa */}
        <radialGradient id="deepNebulaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#082F49" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#020B1C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="purpleNebulaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#0369A1" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#020B1C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="emeraldNebulaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.24" />
          <stop offset="60%" stopColor="#0E7490" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#020B1C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mistSoftGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.24" />
          <stop offset="60%" stopColor="#00F5FF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#082F49" stopOpacity="0" />
        </radialGradient>

        {/* Gradientes del Agujero Negro, Planeta Satelital, Cometas y Meteoritos */}
        <radialGradient id="bhOuterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.48" />
          <stop offset="45%" stopColor="#0284C7" stopOpacity="0.26" />
          <stop offset="75%" stopColor="#00F5FF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#020B1C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bhDiskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#0EA5E9" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="bhLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#00F5FF" />
        </linearGradient>
        <radialGradient id="bgPlanetHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#020B1C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bgPlanetSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="35%" stopColor="#0EA5E9" />
          <stop offset="75%" stopColor="#075985" />
          <stop offset="100%" stopColor="#02152E" />
        </radialGradient>
        <radialGradient id="impactFlashGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#020B1C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cometTailEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0" />
          <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="cometTailPurple" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0" />
          <stop offset="60%" stopColor="#7DD3FC" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="visorCyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#075985" />
          <stop offset="50%" stopColor="#082F49" />
          <stop offset="100%" stopColor="#02152E" />
        </linearGradient>

        {/* Gradientes esculturales de la isla-montaña en Azul Eléctrico */}
        <linearGradient id="cliffBaseGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0044B8" />
          <stop offset="50%" stopColor="#002D82" />
          <stop offset="100%" stopColor="#001A52" />
        </linearGradient>
        <linearGradient id="cliffDeepGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003599" />
          <stop offset="100%" stopColor="#001440" />
        </linearGradient>
        <linearGradient id="cliffWallGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0055D4" />
          <stop offset="50%" stopColor="#00389E" />
          <stop offset="100%" stopColor="#00226B" />
        </linearGradient>
        <linearGradient id="innerCliffGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0047B8" />
          <stop offset="50%" stopColor="#0062E3" />
          <stop offset="100%" stopColor="#007BFF" />
        </linearGradient>
        <linearGradient id="summitCliffGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0055D4" />
          <stop offset="60%" stopColor="#0077FF" />
          <stop offset="100%" stopColor="#00A6FF" />
        </linearGradient>

        {/* Superficies superiores de las 3 terrazas en Azul Eléctrico Vibrante */}
        <linearGradient id="terrace1TopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#005CE6" />
          <stop offset="55%" stopColor="#0042AD" />
          <stop offset="100%" stopColor="#002875" />
        </linearGradient>
        <linearGradient id="terrace2TopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0074FF" />
          <stop offset="55%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#003694" />
        </linearGradient>
        <linearGradient id="summitTopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0099FF" />
          <stop offset="55%" stopColor="#006BFF" />
          <stop offset="100%" stopColor="#0046BD" />
        </linearGradient>

        {/* Gradiente del Riel Fluido: Azul Hielo -> Cian Eléctrico -> Turquesa */}
        <linearGradient id="railFluidGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#00F5FF" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>

        {/* Portal y Santuario en Azul Eléctrico + Cian Holográfico */}
        <radialGradient id="portalFloorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="portalArchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <radialGradient id="portalEnergyGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0066FF" />
        </radialGradient>
        <radialGradient id="bossHaloGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#0EA5E9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#062044" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="armilarBeamGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#00F5FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="armilarCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#00F5FF" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="goldRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#00F5FF" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      <g transform="translate(8 0)">
        <EscenarioMontaña />

        {/* ── RIEL FLUIDO NEÓN CON PULSOS DE ENERGÍA ANIMADOS ── */}
        <g pointerEvents="none">
          <path
            d={PATH_RIEL}
            fill="none"
            stroke="url(#railFluidGrad)"
            strokeWidth="20"
            strokeOpacity="0.28"
            strokeLinecap="round"
          />
          <path
            d={PATH_RIEL}
            fill="none"
            stroke="#062856"
            strokeWidth="10"
            strokeOpacity="0.94"
            strokeLinecap="round"
          />
          <path
            d={PATH_RIEL}
            fill="none"
            stroke="url(#railFluidGrad)"
            strokeWidth="4.2"
            strokeOpacity="0.96"
            strokeLinecap="round"
          />
          {/* Pulso neón brillante viajando por toda la pista */}
          <path
            d={PATH_RIEL}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeDasharray="18 54"
            strokeLinecap="round"
            opacity="0.9"
          >
            <animate attributeName="stroke-dashoffset" from="720" to="0" dur="10s" repeatCount="indefinite" />
          </path>
        </g>

        {/* ── SANTUARIO CASILLA 20 (GUARDIÁN DEL NIVEL) ── */}
        <SantuarioGuardian
          x={NODOS_NUMERIX[19].x}
          y={NODOS_NUMERIX[19].y}
          activo={pos === 19}
          desbloqueado={santuarioDesbloqueado}
        />

        {/* ── PORTAL DE CRISTAL CUÁNTICO EN CASILLA 01 ── */}
        <PortalInicio x={748} y={528} />

        {/* ── CUBOS ISOMÉTRICOS 01 AL 19 (Ordenados por profundidad Y ascendente) ── */}
        {[...NODOS_NUMERIX]
          .filter((n) => n.tipo !== 'boss')
          .sort((a, b) => a.y - b.y)
          .map((nodo) => (
            <CuboIsometricoSVG
              key={nodo.index}
              nodo={nodo}
              activo={nodo.index === pos}
              visitado={nodo.index < pos}
            />
          ))}

        {/* ── TOKEN DEL JUGADOR: EXPLORADOR ESPACIAL CUÁNTICO ── */}
        <g
          style={{
            transform: `translate3d(${nodoActual.x}px, ${
              nodoActual.tipo === 'boss' ? nodoActual.y - 6 : nodoActual.y - 16
            }px, 0)`,
            transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          <JovenAstronauta caminando={caminando} />
        </g>
      </g>
    </svg>
  );
}
