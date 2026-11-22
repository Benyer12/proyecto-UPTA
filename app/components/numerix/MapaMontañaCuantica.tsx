'use client';

import { memo } from 'react';

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

// Coordenadas calibradas 1:1 sobre los 19 zócalos de energía + Altar del Guardián del render 3D (1264x848)
const COORDS_S: { x: number; y: number; opIzq: string; opDer: string }[] = [
  // Terraza Inferior (del Portal Cristalino de la derecha hacia la izquierda)
  { x: 942, y: 742, opIzq: '01', opDer: '+' }, // 01
  { x: 770, y: 774, opIzq: '−', opDer: '÷' },  // 02
  { x: 610, y: 766, opIzq: '+', opDer: '×' },  // 03
  { x: 452, y: 730, opIzq: '×', opDer: '+' },  // 04 (Especial 1)
  { x: 316, y: 668, opIzq: '+', opDer: '÷' },  // 05
  { x: 222, y: 552, opIzq: '√', opDer: '∑' },  // 06 (Trampa 1)

  // Cresta Central Ascendente (izquierda a derecha)
  { x: 318, y: 462, opIzq: '+', opDer: '÷' },  // 07
  { x: 444, y: 416, opIzq: '+', opDer: '×' },  // 08 (Especial 2)
  { x: 576, y: 374, opIzq: '×', opDer: '−' },  // 09
  { x: 716, y: 332, opIzq: '√', opDer: '∑' },  // 10 (Trampa 2)
  { x: 850, y: 292, opIzq: 'π', opDer: '÷' },  // 11
  { x: 960, y: 234, opIzq: '×', opDer: '+' },  // 12 (Especial 3)
  { x: 996, y: 142, opIzq: '+', opDer: '−' },  // 13

  // Cumbre Superior (arco hacia el Santuario del Guardián)
  { x: 892, y: 90, opIzq: '√', opDer: '∑' },   // 14 (Trampa 3)
  { x: 746, y: 76, opIzq: 'π', opDer: '÷' },   // 15
  { x: 604, y: 94, opIzq: '×', opDer: '+' },   // 16 (Especial 4)
  { x: 478, y: 132, opIzq: '×', opDer: '÷' },  // 17
  { x: 368, y: 192, opIzq: '−', opDer: '+' },  // 18
  { x: 282, y: 258, opIzq: '+', opDer: '=' },  // 19
  { x: 168, y: 352, opIzq: '★', opDer: '★' },  // 20 (Altar del Guardián)
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

const CUBOS_ORDENADOS = [...NODOS_NUMERIX]
  .filter((n) => n.tipo !== 'boss')
  .sort((a, b) => a.y - b.y);

function buildSmoothPath(pts: { x: number; y: number }[]): string {
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
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const PATH_RIEL = buildSmoothPath(COORDS_S);

/** Cubo holográfico translúcido 3D sobre cada zócalo dorado-cian del escenario renderizado. */
const CuboIsometricoSVG = memo(function CuboIsometricoSVG({
  nodo,
  activo,
  visitado,
}: {
  nodo: NodoCubo;
  activo: boolean;
  visitado: boolean;
}) {
  if (nodo.tipo === 'boss') return null;

  const W = 25;
  const H = 12.5;
  const D = 15;
  const { x, y, tipo, numero, opIzq, opDer } = nodo;

  const paleta = {
    normal: {
      top: activo ? 'url(#cubeTopActive)' : visitado ? 'url(#cubeTopVisited)' : 'url(#cubeTopNormal)',
      left: 'url(#cubeLeftNormal)',
      right: 'url(#cubeRightNormal)',
      strokeTop: activo ? '#FFFFFF' : '#67E8F9',
      strokeSide: activo ? '#BAE6FD' : 'rgba(56, 212, 255, 0.85)',
      textTop: '#FFFFFF',
      textSide: '#E0F2FE',
      glow: activo ? '#00F5FF' : '#38BDF8',
    },
    especial: {
      top: activo ? 'url(#cubeTopActive)' : 'url(#cubeTopEspecial)',
      left: 'rgba(5, 110, 80, 0.92)',
      right: 'rgba(3, 62, 46, 0.96)',
      strokeTop: activo ? '#FFFFFF' : '#6EE7B7',
      strokeSide: 'rgba(110, 231, 183, 0.9)',
      textTop: '#FFFFFF',
      textSide: '#A7F3D0',
      glow: '#00FF88',
    },
    trampa: {
      top: activo ? 'url(#cubeTopActive)' : 'url(#cubeTopTrampa)',
      left: 'rgba(194, 78, 12, 0.92)',
      right: 'rgba(124, 45, 10, 0.96)',
      strokeTop: activo ? '#FFFFFF' : '#FDE047',
      strokeSide: 'rgba(253, 224, 71, 0.9)',
      textTop: '#FFFBEB',
      textSide: '#FEF08A',
      glow: '#FBBF24',
    },
  }[tipo];

  const baseOffsetY = -4;
  const cy = y + baseOffsetY;
  const topPts = `${x},${cy - H * 2} ${x + W},${cy - H} ${x},${cy} ${x - W},${cy - H}`;
  const topInnerPts = `${x},${cy - H * 2 + 2.2} ${x + W - 4},${cy - H} ${x},${cy - 2.2} ${x - W + 4},${cy - H}`;
  const leftPts = `${x - W},${cy - H} ${x},${cy} ${x},${cy + D} ${x - W},${cy - H + D}`;
  const rightPts = `${x + W},${cy - H} ${x},${cy} ${x},${cy + D} ${x + W},${cy - H + D}`;

  return (
    <g id={`cell-${nodo.index}`}>
      {activo && (
        <ellipse
          cx={x}
          cy={y + 6}
          rx={W + 12}
          ry={H + 7}
          fill="none"
          stroke={paleta.glow}
          strokeWidth="3"
          strokeOpacity="0.88"
        >
          <animate attributeName="stroke-opacity" values="0.95;0.35;0.95" dur="1.4s" repeatCount="indefinite" />
        </ellipse>
      )}

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
      <polygon
        points={topPts}
        fill={paleta.top}
        stroke={paleta.strokeTop}
        strokeWidth={activo ? 2 : 1.4}
        strokeLinejoin="round"
      />
      <polygon
        points={topInnerPts}
        fill="none"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      <text
        x={x}
        y={cy - H}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textTop}
        fontSize="12"
        fontWeight="900"
        fontFamily="'Orbitron', sans-serif"
      >
        {numero}
      </text>

      <text
        transform={`translate(${x - W * 0.48} ${cy + D * 0.24}) skewY(26)`}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textSide}
        opacity="0.95"
        fontSize="10"
        fontWeight="800"
      >
        {opIzq}
      </text>

      <text
        transform={`translate(${x + W * 0.48} ${cy + D * 0.24}) skewY(-26)`}
        textAnchor="middle"
        dominantBaseline="central"
        fill={paleta.textSide}
        opacity="0.95"
        fontSize="10"
        fontWeight="800"
      >
        {opDer}
      </text>
    </g>
  );
});

/** Explorador Espacial Cuántico (Astro-Kid) con levitación y propulsores. */
const JovenAstronauta = memo(function JovenAstronauta({ caminando }: { caminando: boolean }) {
  return (
    <g transform="scale(1.18)">
      <ellipse cx="0" cy="4" rx="14" ry="5" fill="#020617" opacity="0.58" />
      <ellipse cx="0" cy="4" rx="11" ry="3.8" fill="#00F5FF" opacity="0.34">
        <animate attributeName="rx" values="9;14;9" dur="1.8s" repeatCount="indefinite" />
      </ellipse>

      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={caminando ? '0 0; 0 -7; 0 0' : '0 0; 0 -2.5; 0 0'}
          dur={caminando ? '0.26s' : '2.4s'}
          repeatCount="indefinite"
        />

        {/* Jetpack */}
        <polygon points="-16,-24 -11,-29 -11,-15 -15,-13" fill="#38BDF8" stroke="#E2EEFF" strokeWidth="0.9" />
        <polygon points="16,-24 11,-29 11,-15 15,-13" fill="#38BDF8" stroke="#E2EEFF" strokeWidth="0.9" />
        <rect x="-12" y="-31" width="24" height="18" rx="5" fill="#1E2952" stroke="#93C5FD" strokeWidth="1.2" />
        <ellipse cx="-7" cy="-11" rx="2.8" ry="4.5" fill="#6EE7B7" opacity="0.88">
          <animate attributeName="ry" values="3.5;6;3.5" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="7" cy="-11" rx="2.8" ry="4.5" fill="#00F5FF" opacity="0.88">
          <animate attributeName="ry" values="4;6.5;4" dur="0.4s" repeatCount="indefinite" />
        </ellipse>

        {/* Piernas y botas */}
        <rect x="-7.5" y="-13" width="6.2" height="9.5" rx="3" fill="#E2EEFF" stroke="#1E293B" strokeWidth="1.1" />
        <rect x="1.3" y="-13" width="6.2" height="9.5" rx="3" fill="#E2EEFF" stroke="#1E293B" strokeWidth="1.1" />
        <rect x="-8.8" y="-4.5" width="8" height="5" rx="2.4" fill="#0F172A" stroke="#7DD3FC" strokeWidth="1" />
        <rect x="0.8" y="-4.5" width="8" height="5" rx="2.4" fill="#0F172A" stroke="#7DD3FC" strokeWidth="1" />

        {/* Torso */}
        <rect x="-10" y="-29" width="20" height="17" rx="6.5" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.2" />
        <path d="M -10,-25 C -10,-28.5 -5,-29 0,-29 C 5,-29 10,-28.5 10,-25 Z" fill="#0284C7" />
        <rect x="-5.5" y="-24" width="11" height="6.2" rx="2" fill="#0F1734" stroke="#67E8F9" strokeWidth="1" />
        <circle cx="0" cy="-20.9" r="2" fill="#00F5FF" />

        {/* Brazos */}
        <g transform="translate(-10 -25) rotate(-26)">
          <rect x="-7.5" y="-2.2" width="8.5" height="5.2" rx="2.6" fill="#F0F6FF" stroke="#1E293B" strokeWidth="1.1" />
          <circle cx="-8" cy="0.4" r="2.8" fill="#0284C7" stroke="#E2EEFF" strokeWidth="0.9" />
        </g>
        <g transform="translate(10 -24) rotate(22)">
          <rect x="-1" y="-2.2" width="8.5" height="5.2" rx="2.6" fill="#F0F6FF" stroke="#1E293B" strokeWidth="1.1" />
          <circle cx="8" cy="0.4" r="2.8" fill="#0284C7" stroke="#E2EEFF" strokeWidth="0.9" />
        </g>

        {/* Casco espacial con visor */}
        <line x1="9" y1="-52" x2="12" y2="-59" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12.5" cy="-60" r="2.3" fill="#FDE047">
          <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="-42.5" r="13.5" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.4" />
        <rect x="-10" y="-49.5" width="20" height="13.5" rx="6.5" fill="#031530" stroke="#67E8F9" strokeWidth="1.2" />
        <circle cx="-4.2" cy="-43" r="2.2" fill="#67E8F9" />
        <circle cx="4.2" cy="-43" r="2.2" fill="#67E8F9" />
        <path d="M -3 -39 Q 0 -36.5 3 -39" stroke="#6EE7B7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
});

interface MapaMontañaCuanticaProps {
  pos: number;
  caminando: boolean;
  santuarioDesbloqueado: boolean;
}

const MapaMontañaCuantica = memo(function MapaMontañaCuantica({
  pos,
  caminando,
  santuarioDesbloqueado,
}: MapaMontañaCuanticaProps) {
  const nodoActual = NODOS_NUMERIX[Math.min(pos, NODOS_NUMERIX.length - 1)];
  const sanctuaryNode = NODOS_NUMERIX[19];

  return (
    <svg
      viewBox="0 0 1264 848"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      style={{
        maskImage: 'radial-gradient(ellipse 95% 94% at 50% 50%, black 78%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 95% 94% at 50% 50%, black 78%, transparent 100%)',
      }}
      role="img"
      aria-label="Montaña Cuántica 3D de Numérix"
    >
      <defs>
        <linearGradient id="cubeTopNormal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#0284C7" stopOpacity="0.84" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cubeTopVisited" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.94" />
          <stop offset="55%" stopColor="#0EA5E9" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="cubeTopActive" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="45%" stopColor="#00F5FF" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="cubeTopEspecial" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#10B981" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cubeTopTrampa" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.92" />
          <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.84" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="cubeLeftNormal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0264D4" />
          <stop offset="100%" stopColor="#00328F" />
        </linearGradient>
        <linearGradient id="cubeRightNormal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0045AD" />
          <stop offset="100%" stopColor="#002166" />
        </linearGradient>
      </defs>

      {/* Escenario 3D Studio Renderizado de Numérix */}
      <image
        href="/images/numerix-island-render.jpg"
        x="0"
        y="0"
        width="1264"
        height="848"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Pulso de energía viajando por el riel 3D */}
      <path
        d={PATH_RIEL}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeDasharray="18 58"
        strokeLinecap="round"
        opacity="0.82"
      >
        <animate attributeName="stroke-dashoffset" from="760" to="0" dur="9s" repeatCount="indefinite" />
      </path>

      {/* Halo activo sobre el Altar del Guardián */}
      {(pos === 19 || santuarioDesbloqueado) && (
        <ellipse
          cx={sanctuaryNode.x}
          cy={sanctuaryNode.y + 6}
          rx="44"
          ry="20"
          fill="none"
          stroke={santuarioDesbloqueado ? '#00FF88' : '#00F5FF'}
          strokeWidth="2.8"
          strokeOpacity="0.85"
        >
          <animate attributeName="rx" values="40;50;40" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Píldora flotante del Guardián */}
      <g transform={`translate(${sanctuaryNode.x} 166)`}>
        <rect
          x="-82"
          y="-13"
          width="164"
          height="26"
          rx="13"
          fill="#031530"
          fillOpacity="0.88"
          stroke={pos === 19 || santuarioDesbloqueado ? '#00F5FF' : '#7DD3FC'}
          strokeOpacity="0.85"
          strokeWidth="1.4"
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10.5"
          fontWeight="800"
          letterSpacing="1.8"
          fill="#E0F2FE"
        >
          GUARDIÁN DEL NIVEL
        </text>
      </g>

      {/* 19 Cubos holográficos alineados sobre los zócalos 3D */}
      {CUBOS_ORDENADOS.map((nodo) => (
        <CuboIsometricoSVG
          key={nodo.index}
          nodo={nodo}
          activo={nodo.index === pos}
          visitado={nodo.index < pos}
        />
      ))}

      {/* Explorador Espacial Cuántico */}
      <g
        style={{
          transform: `translate3d(${nodoActual.x}px, ${
            nodoActual.tipo === 'boss' ? nodoActual.y - 4 : nodoActual.y - 14
          }px, 0)`,
          transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        <JovenAstronauta caminando={caminando} />
      </g>
    </svg>
  );
});

export default MapaMontañaCuantica;
