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

const COORDS_S: { x: number; y: number; opIzq: string; opDer: string }[] = [
  // Tramo 1: Terraza Inferior (derecha a izquierda desde el Portal Cuántico)
  { x: 576, y: 548, opIzq: '01', opDer: '+' }, // 01
  { x: 500, y: 554, opIzq: '−', opDer: '÷' },  // 02
  { x: 422, y: 548, opIzq: '+', opDer: '×' },  // 03
  { x: 346, y: 534, opIzq: '×', opDer: '+' },  // 04 (Especial 1)
  { x: 274, y: 504, opIzq: '+', opDer: '÷' },  // 05
  { x: 230, y: 452, opIzq: '√', opDer: '∑' },  // 06 (Trampa 1)

  // Tramo 2: Cresta Diagonal Central Ascendente (izquierda a derecha)
  { x: 268, y: 394, opIzq: '+', opDer: '÷' },  // 07
  { x: 332, y: 356, opIzq: '+', opDer: '×' },  // 08 (Especial 2)
  { x: 396, y: 318, opIzq: '×', opDer: '−' },  // 09
  { x: 460, y: 280, opIzq: '√', opDer: '∑' },  // 10 (Trampa 2)
  { x: 522, y: 242, opIzq: 'π', opDer: '÷' },  // 11
  { x: 576, y: 202, opIzq: '×', opDer: '+' },  // 12 (Especial 3)
  { x: 604, y: 152, opIzq: '+', opDer: '−' },  // 13

  // Tramo 3: Cumbre Superior (derecha a izquierda hacia el Santuario Armilar)
  { x: 564, y: 108, opIzq: '√', opDer: '∑' },  // 14 (Trampa 3)
  { x: 500, y: 98, opIzq: 'π', opDer: '÷' },   // 15
  { x: 436, y: 104, opIzq: '×', opDer: '+' },  // 16 (Especial 4)
  { x: 374, y: 120, opIzq: '×', opDer: '÷' },  // 17
  { x: 318, y: 146, opIzq: '−', opDer: '+' },  // 18
  { x: 272, y: 178, opIzq: '+', opDer: '=' },  // 19
  { x: 184, y: 248, opIzq: '★', opDer: '★' },  // 20 (Guardián del Nivel)
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

/** Portal de Cristal Elegante en la Casilla 01 (Azul Crema, Morado y Esmeralda). */
function PortalInicio({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="18" rx="44" ry="16" fill="url(#portalFloorGlow)" />
      <polygon
        points="-34,16 -40,-6 -30,-16 -22,12"
        fill="#312E81"
        stroke="#C4B5FD"
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      <polygon
        points="30,18 38,-4 28,-14 20,14"
        fill="#1E3A8A"
        stroke="#BFDBFE"
        strokeOpacity="0.6"
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
      {/* Halo suave de energía en la cima */}
      <ellipse cx="0" cy="16" rx="82" ry="34" fill="url(#bossHaloGrad)" />

      {/* Plataforma escalonada isométrica limpia (Azul Profundo -> Azul Crema -> Amatista) */}
      {[
        { dy: 22, w: 62, h: 26, d: 10, fillTop: '#1E2952', fillLeft: '#131B38', fillRight: '#0E142B', stroke: '#93C5FD' },
        { dy: 12, w: 48, h: 20, d: 9, fillTop: '#2E3B6E', fillLeft: '#1E2749', fillRight: '#151C36', stroke: '#C4B5FD' },
        { dy: 2, w: 34, h: 14, d: 8, fillTop: '#4C3D8F', fillLeft: '#312564', fillRight: '#231A4A', stroke: '#E2EEFF' },
      ].map((step, idx) => (
        <g key={idx} transform={`translate(0 ${step.dy})`}>
          <polygon
            points={`0,${-step.h} ${step.w},0 0,${step.h} ${-step.w},0`}
            fill={step.fillTop}
            fillOpacity="0.94"
            stroke={step.stroke}
            strokeOpacity="0.65"
            strokeWidth="1.2"
          />
          <polygon
            points={`${-step.w},0 0,${step.h} 0,${step.h + step.d} ${-step.w},${step.d}`}
            fill={step.fillLeft}
            stroke={step.stroke}
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <polygon
            points={`${step.w},0 0,${step.h} 0,${step.h + step.d} ${step.w},${step.d}`}
            fill={step.fillRight}
            stroke={step.stroke}
            strokeOpacity="0.45"
            strokeWidth="1"
          />
        </g>
      ))}

      {/* Pilares de cristal minimalistas en las esquinas */}
      <polygon points="-44,10 -48,-12 -40,-20 -36,8" fill="#A855F7" fillOpacity="0.75" stroke="#F3E8FF" strokeWidth="0.9" />
      <polygon points="44,10 48,-12 40,-20 36,8" fill="#34D399" fillOpacity="0.75" stroke="#ECFDF5" strokeWidth="0.9" />

      {/* Base circular del reactor armilar */}
      <ellipse cx="0" cy="-2" rx="24" ry="10" fill="#312E81" stroke="#E2EEFF" strokeOpacity="0.8" strokeWidth="1.4" />
      <ellipse cx="0" cy="-4" rx="16" ry="6" fill="#C4B5FD" opacity="0.85" />

      {/* Cono de luz ascendente suave */}
      <polygon
        points="-16,-4 -34,-68 34,-68 16,-4"
        fill="url(#armilarBeamGrad)"
        opacity="0.48"
      />

      {/* ── GRAN ESFERA ARMILAR (Azul Crema, Morado y Esmeralda/Oro Suave) ── */}
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
        <circle r="6" fill="#E879F9">
          <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle r="2.8" fill="#FFFFFF" />
      </g>

      {/* Etiqueta flotante GUARDIÁN DEL NIVEL */}
      <g transform="translate(0 -102)">
        <rect
          x="-72"
          y="-11"
          width="144"
          height="22"
          rx="11"
          fill="#0B1124"
          fillOpacity="0.92"
          stroke={activo ? '#6EE7B7' : '#C084FC'}
          strokeOpacity="0.8"
          strokeWidth="1.4"
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9.5"
          fontWeight="800"
          letterSpacing="1.6"
          fill="#F3E8FF"
        >
          GUARDIÁN DEL NIVEL
        </text>
      </g>
    </g>
  );
}

/**
 * Cubo Isométrico 3D Pulcro estilo Liquid-Glass (SIN líneas punteadas internas desordenadas).
 * Colores suaves y elegantes:
 * - Normal: Azul Profundo + Azul Crema (#E2EEFF / #93C5FD)
 * - Especial: Verde Esmeralda + Crema (#34D399 / #A7F3D0)
 * - Trampa: Morado / Magenta Cósmico (#D946EF / #F0ABFC)
 */
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

  const W = 29;
  const H = 14.5;
  const D = 24;
  const { x, y, tipo, numero, opIzq, opDer } = nodo;

  const paleta = {
    normal: {
      top: activo
        ? 'rgba(191, 219, 254, 0.42)'
        : visitado
          ? 'rgba(147, 197, 253, 0.28)'
          : 'rgba(59, 130, 246, 0.18)',
      left: visitado ? 'rgba(30, 58, 118, 0.85)' : 'rgba(17, 32, 68, 0.88)',
      right: visitado ? 'rgba(20, 40, 86, 0.92)' : 'rgba(11, 22, 48, 0.94)',
      strokeTop: activo ? '#FFFFFF' : '#BFDBFE',
      strokeSide: activo ? '#93C5FD' : 'rgba(147, 197, 253, 0.45)',
      textTop: '#F0F6FF',
      textSide: '#93C5FD',
      glow: activo ? 'rgba(147, 197, 253, 0.55)' : 'rgba(59, 130, 246, 0.22)',
    },
    especial: {
      top: activo ? 'rgba(110, 231, 183, 0.48)' : 'rgba(16, 185, 129, 0.30)',
      left: 'rgba(6, 78, 59, 0.86)',
      right: 'rgba(4, 52, 40, 0.92)',
      strokeTop: activo ? '#FFFFFF' : '#6EE7B7',
      strokeSide: 'rgba(110, 231, 183, 0.52)',
      textTop: '#ECFDF5',
      textSide: '#6EE7B7',
      glow: 'rgba(52, 211, 153, 0.42)',
    },
    trampa: {
      top: activo ? 'rgba(240, 171, 252, 0.48)' : 'rgba(192, 38, 211, 0.30)',
      left: 'rgba(88, 28, 135, 0.86)',
      right: 'rgba(59, 7, 100, 0.92)',
      strokeTop: activo ? '#FFFFFF' : '#F0ABFC',
      strokeSide: 'rgba(232, 121, 249, 0.52)',
      textTop: '#FAF5FF',
      textSide: '#E879F9',
      glow: 'rgba(217, 70, 239, 0.42)',
    },
  }[tipo];

  const topPts = `${x},${y - H * 2} ${x + W},${y - H} ${x},${y} ${x - W},${y - H}`;
  const leftPts = `${x - W},${y - H} ${x},${y} ${x},${y + D} ${x - W},${y - H + D}`;
  const rightPts = `${x + W},${y - H} ${x},${y} ${x},${y + D} ${x + W},${y - H + D}`;

  return (
    <g
      id={`cell-${nodo.index}`}
      style={{
        filter: `drop-shadow(0 8px 14px rgba(2, 6, 23, 0.65)) drop-shadow(0 0 ${activo ? 14 : 6}px ${paleta.glow})`,
      }}
    >
      {/* Sombra suave en la base del cubo */}
      <ellipse cx={x} cy={y + D - 2} rx={W * 0.9} ry={H * 0.85} fill="#020617" opacity="0.45" />

      {/* Halo de selección limpio cuando el astronauta está en la casilla */}
      {activo && (
        <polygon
          points={`${x},${y - H * 2 - 4} ${x + W + 5},${y - H} ${x},${y + 4} ${x - W - 5},${y - H}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeOpacity="0.9"
        >
          <animate attributeName="stroke-opacity" values="0.95;0.35;0.95" dur="1.6s" repeatCount="indefinite" />
        </polygon>
      )}

      {/* Caras laterales sólidas y pulcras (sin líneas punteadas internas que ensucien el 3D) */}
      <polygon
        points={leftPts}
        fill={paleta.left}
        stroke={paleta.strokeSide}
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <polygon
        points={rightPts}
        fill={paleta.right}
        stroke={paleta.strokeSide}
        strokeWidth="1.15"
        strokeLinejoin="round"
      />

      {/* Cara superior estilo cristal esmerilado con bisel luminoso */}
      <polygon
        points={topPts}
        fill={paleta.top}
        stroke={paleta.strokeTop}
        strokeWidth={activo ? 2.1 : 1.4}
        strokeLinejoin="round"
      />

      {/* Número de casilla limpio */}
      <text
        x={x}
        y={y - H}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textTop}
        fontSize="11"
        fontWeight="900"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        {numero}
      </text>

      {/* Operadores en las caras frontales con opacidad armónica */}
      <text
        transform={`translate(${x - W * 0.48} ${y + D * 0.32}) skewY(26)`}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textSide}
        opacity="0.88"
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
        opacity="0.88"
        fontSize="11"
        fontWeight="800"
      >
        {opDer}
      </text>
    </g>
  );
}

/** Token del Jugador: Joven Astronauta Explorador. */
function JovenAstronauta({ caminando }: { caminando: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="13" ry="5" fill="#020617" opacity="0.5" />
      <rect x="-11" y="-28" width="22" height="16" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
      <circle cx="-8" cy="-20" r="2.2" fill="#93C5FD" />
      <circle cx="8" cy="-20" r="2.2" fill="#6EE7B7" />

      <g>
        {caminando && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -3; 0 0"
            dur="0.28s"
            repeatCount="indefinite"
          />
        )}
        <rect x="-7" y="-12" width="6" height="9" rx="2.5" fill="#F8FAFC" stroke="#475569" strokeWidth="1.1" />
        <rect x="1" y="-12" width="6" height="9" rx="2.5" fill="#F8FAFC" stroke="#475569" strokeWidth="1.1" />
        <rect x="-8" y="-4" width="7.5" height="4.5" rx="2" fill="#64748B" stroke="#1E293B" strokeWidth="1" />
        <rect x="0.5" y="-4" width="7.5" height="4.5" rx="2" fill="#64748B" stroke="#1E293B" strokeWidth="1" />
      </g>

      <rect x="-9.5" y="-27" width="19" height="16" rx="6" fill="#FFFFFF" stroke="#475569" strokeWidth="1.2" />
      <rect x="-9.5" y="-16" width="19" height="3.5" rx="1.2" fill="#334155" />
      <rect x="-3" y="-16.5" width="6" height="4.5" rx="1" fill="#C084FC" stroke="#4C1D95" strokeWidth="0.8" />
      <rect x="-5" y="-23" width="10" height="5" rx="1.5" fill="#1E3A8A" stroke="#93C5FD" strokeWidth="0.9" />

      <g transform="translate(-9.5 -24) rotate(-28)">
        <rect x="-7" y="-2" width="8" height="5" rx="2.5" fill="#FFFFFF" stroke="#475569" strokeWidth="1.1" />
        <circle cx="-7.5" cy="0.5" r="2.6" fill="#93C5FD" stroke="#1E293B" strokeWidth="0.9" />
      </g>
      <g transform="translate(9.5 -23) rotate(22)">
        <rect x="-1" y="-2" width="8" height="5" rx="2.5" fill="#FFFFFF" stroke="#475569" strokeWidth="1.1" />
        <circle cx="7.5" cy="0.5" r="2.6" fill="#93C5FD" stroke="#1E293B" strokeWidth="0.9" />
      </g>

      <circle cx="0" cy="-41" r="12.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.4" />
      <circle cx="0" cy="-40" r="9.5" fill="#FCD5B5" />
      <path
        d="M-9.5 -42 C-9.5 -51 9.5 -51 9.5 -42 C6 -45 2 -43 -1 -45 C-4 -43 -7 -44 -9.5 -42 Z"
        fill="#78350F"
      />
      <circle cx="-3.6" cy="-39.5" r="1.4" fill="#0F172A" />
      <circle cx="3.6" cy="-39.5" r="1.4" fill="#0F172A" />
      <circle cx="-3.1" cy="-40" r="0.5" fill="#FFFFFF" />
      <circle cx="4.1" cy="-40" r="0.5" fill="#FFFFFF" />
      <ellipse cx="-5.8" cy="-37.2" rx="1.8" ry="1" fill="#F472B6" opacity="0.5" />
      <ellipse cx="5.8" cy="-37.2" rx="1.8" ry="1" fill="#F472B6" opacity="0.5" />
      <path d="M-2.2 -36.5 Q0 -34.6 2.2 -36.5" stroke="#7C2D12" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      <circle cx="0" cy="-41" r="12.5" fill="url(#helmetGlassGrad)" stroke="#BFDBFE" strokeWidth="1.4" />
      <path d="M-7 -48 Q-2 -51 4 -49" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
      <rect x="-14.5" y="-44" width="3" height="6" rx="1.5" fill="#C084FC" stroke="#4C1D95" strokeWidth="0.9" />
      <rect x="11.5" y="-44" width="3" height="6" rx="1.5" fill="#C084FC" stroke="#4C1D95" strokeWidth="0.9" />
    </g>
  );
}

/**
 * Escenario de Isla-Montaña Flotante Pulcro y Fluido:
 * Terrazas curvas suaves en Azul Profundo, Azul Crema, Morado Amatista y Esmeralda,
 * sin líneas rectas ni estrías caóticas.
 */
const EscenarioMontaña = memo(function EscenarioMontaña() {
  return (
    <g>
      {/* ── Nebulosas Suaves de Fondo (Azul Profundo, Morado y Esmeralda) ── */}
      <ellipse cx="390" cy="330" rx="360" ry="230" fill="url(#deepNebulaGrad)" />
      <ellipse cx="200" cy="230" rx="220" ry="145" fill="url(#purpleNebulaGrad)" />
      <ellipse cx="560" cy="460" rx="210" ry="125" fill="url(#emeraldNebulaGrad)" />

      {/* ── Anillo Orbital Minimalista Superior Izquierdo ── */}
      <g transform="translate(106 84) rotate(-18)" opacity="0.7">
        <ellipse rx="68" ry="20" fill="none" stroke="#C4B5FD" strokeOpacity="0.32" strokeWidth="1.2" />
        <circle cx="-46" cy="-10" r="2.5" fill="#E2EEFF" />
        <circle cx="58" cy="8" r="3" fill="#6EE7B7" />
      </g>

      {/* ── Cristal Orbital Pulcro Superior Derecho ── */}
      <g transform="translate(688 88)" opacity="0.85">
        <g transform="rotate(20)">
          <ellipse rx="64" ry="18" fill="none" stroke="#BFDBFE" strokeOpacity="0.35" strokeWidth="1.2" />
        </g>
        <polygon points="0,-28 17,-6 6,24 -14,16 -17,-9" fill="url(#floatingCrystalGrad)" stroke="#E2EEFF" strokeOpacity="0.7" strokeWidth="1.1" />
      </g>

      {/* ══════════════════ 1. BASE ESCULTÓRICA SUAVE DE LA ISLA FLOTANTE ══════════════════ */}
      <g>
        {/* Sombra ambiental bajo la isla */}
        <ellipse cx="405" cy="598" rx="250" ry="34" fill="#020510" opacity="0.7" />

        {/* Cono inferior esculpido con curvas suaves (sin picos dentados ni grietas desordenadas) */}
        <path
          d="M 84 358 C 110 495, 225 602, 395 616 C 565 602, 680 498, 714 398 C 618 528, 435 558, 286 528 C 162 500, 102 422, 84 358 Z"
          fill="url(#cliffBaseGrad)"
          stroke="#4F46E5"
          strokeOpacity="0.28"
          strokeWidth="1.2"
        />

        {/* Segunda capa volumétrica inferior suave */}
        <path
          d="M 145 452 C 215 562, 310 618, 402 624 C 495 618, 590 558, 658 462 C 568 548, 428 566, 292 536 C 215 518, 172 486, 145 452 Z"
          fill="url(#cliffDeepGrad)"
          opacity="0.9"
        />
      </g>

      {/* ══════════════════ 2. TERRAZA 1: MESETA PRINCIPAL (CUBOS 01..06 Y PORTAL) ══════════════════ */}
      <g>
        {/* Canto/borde 3D pulcro de la Terraza 1 */}
        <path
          d="M 80 356 C 95 455, 165 535, 295 572 C 435 604, 595 588, 696 502 L 716 406 C 625 535, 440 562, 290 532 C 165 502, 105 420, 80 356 Z"
          fill="url(#cliffWallGrad)"
          stroke="#93C5FD"
          strokeOpacity="0.32"
          strokeWidth="1.2"
        />
        {/* Superficie curva limpia de la Terraza 1 */}
        <path
          d="M 80 356 C 72 260, 145 180, 320 112 C 475 68, 625 92, 682 195 C 735 288, 732 418, 668 486 C 580 568, 425 582, 285 548 C 162 518, 88 438, 80 356 Z"
          fill="url(#terrace1TopGrad)"
          stroke="#BFDBFE"
          strokeOpacity="0.4"
          strokeWidth="1.6"
        />
      </g>

      {/* ══════════════════ 3. TERRAZA 2: MESETA INTERMEDIA FLUIDA (CUBOS 07..15) ══════════════════ */}
      <g>
        {/* Pared curva suave del escalón intermedio (sin rayas verticales) */}
        <path
          d="M 148 418 C 225 462, 345 458, 455 398 C 562 340, 642 265, 654 182 L 654 222 C 638 304, 558 378, 448 438 C 338 494, 222 492, 148 452 Z"
          fill="url(#innerCliffGrad)"
          stroke="#A5B4FC"
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />

        {/* Superficie superior de la Terraza 2 */}
        <path
          d="M 118 348 C 110 245, 195 145, 365 92 C 505 58, 635 88, 654 182 C 642 265, 562 340, 455 398 C 345 458, 215 462, 148 418 C 125 398, 120 374, 118 348 Z"
          fill="url(#terrace2TopGrad)"
          stroke="#C4B5FD"
          strokeOpacity="0.48"
          strokeWidth="1.6"
        />
      </g>

      {/* ══════════════════ 4. TERRAZA 3: CUMBRE DEL GUARDIÁN (CIMA IZQUIERDA) ══════════════════ */}
      <g>
        {/* Pared curva suave de la cumbre (sin vetas verticales desordenadas) */}
        <path
          d="M 96 268 C 118 332, 208 358, 298 326 C 362 302, 396 248, 384 192 L 384 238 C 394 290, 356 344, 292 368 C 202 400, 114 370, 96 310 Z"
          fill="url(#summitCliffGrad)"
          stroke="#C4B5FD"
          strokeOpacity="0.45"
          strokeWidth="1.3"
        />

        {/* Plataforma superior de la Cumbre */}
        <path
          d="M 96 268 C 88 202, 148 148, 238 142 C 322 136, 376 158, 384 192 C 396 248, 362 302, 298 326 C 208 358, 118 332, 96 268 Z"
          fill="url(#summitTopGrad)"
          stroke="#E2EEFF"
          strokeOpacity="0.6"
          strokeWidth="1.8"
        />

        {/* Halo interior sutil de la Cumbre */}
        <ellipse
          cx="228"
          cy="238"
          rx="112"
          ry="60"
          transform="rotate(-8 228 238)"
          fill="#261F52"
          fillOpacity="0.55"
          stroke="#C4B5FD"
          strokeOpacity="0.35"
          strokeWidth="1.1"
        />
      </g>

      {/* ── Bruma Luminosa Suave en las Laderas ── */}
      <ellipse cx="140" cy="395" rx="90" ry="28" fill="url(#mistSoftGrad)" />
      <ellipse cx="590" cy="395" rx="100" ry="32" fill="url(#mistSoftGrad)" />
      <ellipse cx="350" cy="560" rx="135" ry="30" fill="url(#mistSoftGrad)" />

      {/* ── Un único arco orbital limpio y fluido alrededor de la isla (sin rayas ni paneles sueltos) ── */}
      <path
        d="M 78 232 C 16 334, 26 486, 138 574"
        fill="none"
        stroke="#93C5FD"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />
      <path
        d="M 692 214 C 764 306, 766 442, 698 532"
        fill="none"
        stroke="#C4B5FD"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />

      {/* Cristales decorativos armónicos en las terrazas */}
      <CristalesMontaña x={108} y={266} escala={1.0} variante="violeta" />
      <CristalesMontaña x={172} y={468} escala={0.9} variante="esmeralda" />
      <CristalesMontaña x={384} y={488} escala={0.88} variante="crema" />
      <CristalesMontaña x={548} y={382} escala={0.98} variante="violeta" />
      <CristalesMontaña x={658} y={476} escala={0.84} variante="esmeralda" />

      {/* Destellos estelares suaves sobre la montaña */}
      {[
        { cx: 142, cy: 295, c: '#E2EEFF' },
        { cx: 242, cy: 302, c: '#C4B5FD' },
        { cx: 332, cy: 268, c: '#6EE7B7' },
        { cx: 485, cy: 362, c: '#E2EEFF' },
        { cx: 612, cy: 318, c: '#C4B5FD' },
        { cx: 458, cy: 490, c: '#6EE7B7' },
      ].map((pt, i) => (
        <circle key={i} cx={pt.cx} cy={pt.cy} r="2.4" fill={pt.c} opacity="0.75">
          <animate attributeName="opacity" values="0.25;0.85;0.25" dur={`${2.4 + (i % 3)}s`} repeatCount="indefinite" />
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
      viewBox="0 0 780 640"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      role="img"
      aria-label="Montaña Cuántica de Numérix"
    >
      <defs>
        {/* Nebulosas de fondo: Azul Profundo, Morado Amatista y Esmeralda */}
        <radialGradient id="deepNebulaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#0F172A" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#040714" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="purpleNebulaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#4C1D95" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#040714" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="emeraldNebulaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#065F46" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#040714" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mistSoftGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#A855F7" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        {/* Gradientes esculturales de la isla-montaña (Azul Profundo + Índigo + Morado) */}
        <linearGradient id="cliffBaseGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F1B3D" />
          <stop offset="50%" stopColor="#0B132B" />
          <stop offset="100%" stopColor="#060A18" />
        </linearGradient>
        <linearGradient id="cliffDeepGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0C1530" />
          <stop offset="100%" stopColor="#040712" />
        </linearGradient>
        <linearGradient id="cliffWallGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#152248" />
          <stop offset="50%" stopColor="#0D1734" />
          <stop offset="100%" stopColor="#080E22" />
        </linearGradient>
        <linearGradient id="innerCliffGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111A3A" />
          <stop offset="50%" stopColor="#1A2652" />
          <stop offset="100%" stopColor="#232E66" />
        </linearGradient>
        <linearGradient id="summitCliffGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#161D42" />
          <stop offset="60%" stopColor="#232B5E" />
          <stop offset="100%" stopColor="#2E3675" />
        </linearGradient>

        {/* Superficies superiores de las 3 terrazas */}
        <linearGradient id="terrace1TopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16244D" />
          <stop offset="55%" stopColor="#101B3B" />
          <stop offset="100%" stopColor="#0A1228" />
        </linearGradient>
        <linearGradient id="terrace2TopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1F2E63" />
          <stop offset="55%" stopColor="#18234D" />
          <stop offset="100%" stopColor="#111938" />
        </linearGradient>
        <linearGradient id="summitTopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2D3A7A" />
          <stop offset="55%" stopColor="#232B61" />
          <stop offset="100%" stopColor="#181E46" />
        </linearGradient>

        {/* Gradiente del Riel Fluido (Azul Crema -> Morado -> Esmeralda) */}
        <linearGradient id="railFluidGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="45%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>

        {/* Portal y Santuario */}
        <radialGradient id="portalFloorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="portalArchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2EEFF" />
          <stop offset="50%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <radialGradient id="portalEnergyGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#F0F6FF" />
          <stop offset="55%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#4F46E5" />
        </radialGradient>
        <radialGradient id="bossHaloGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.38" />
          <stop offset="60%" stopColor="#34D399" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="armilarBeamGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#E2EEFF" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#C084FC" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="armilarCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#C084FC" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="goldRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E8FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="floatingCrystalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2EEFF" />
          <stop offset="50%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <radialGradient id="helmetGlassGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="65%" stopColor="#93C5FD" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.28" />
        </radialGradient>
      </defs>

      <EscenarioMontaña />

      {/* ── RIEL FLUIDO Y ELEGANTE (Azul Crema -> Morado -> Esmeralda) ── */}
      <g pointerEvents="none">
        <path
          d={PATH_RIEL}
          fill="none"
          stroke="url(#railFluidGrad)"
          strokeWidth="16"
          strokeOpacity="0.18"
          strokeLinecap="round"
        />
        <path
          d={PATH_RIEL}
          fill="none"
          stroke="#131C3E"
          strokeWidth="9"
          strokeOpacity="0.92"
          strokeLinecap="round"
        />
        <path
          d={PATH_RIEL}
          fill="none"
          stroke="url(#railFluidGrad)"
          strokeWidth="3.5"
          strokeOpacity="0.9"
          strokeLinecap="round"
        />
      </g>

      {/* ── SANTUARIO CASILLA 20 (GUARDIÁN DEL NIVEL) ── */}
      <SantuarioGuardian
        x={NODOS_NUMERIX[19].x}
        y={NODOS_NUMERIX[19].y}
        activo={pos === 19}
        desbloqueado={santuarioDesbloqueado}
      />

      {/* ── PORTAL DE CRISTAL CUÁNTICO EN CASILLA 01 ── */}
      <PortalInicio x={642} y={512} />

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

      {/* ── TOKEN DEL JUGADOR: JOVEN ASTRONAUTA EXPLORADOR ── */}
      <motion.g
        initial={false}
        animate={{
          x: nodoActual.x,
          y: nodoActual.tipo === 'boss' ? nodoActual.y - 6 : nodoActual.y - 16,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <JovenAstronauta caminando={caminando} />
      </motion.g>
    </svg>
  );
}
