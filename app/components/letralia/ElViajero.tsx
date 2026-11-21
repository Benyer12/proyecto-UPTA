'use client';

/**
 * "El Viajero": joven explorador astral de Letralia con casco de explorador,
 * bufanda coral-ámbar, túnica lavanda, morral de pergaminos y capa estelar.
 * Punto (0,0) en sus pies. Mira a la derecha por defecto.
 */

function Balanceo({
  cx,
  cy,
  desde,
  hasta,
  dur,
}: {
  cx: number;
  cy: number;
  desde: number;
  hasta: number;
  dur: number;
}) {
  return (
    <animateTransform
      attributeName="transform"
      type="rotate"
      values={`${desde} ${cx} ${cy};${hasta} ${cx} ${cy};${desde} ${cx} ${cy}`}
      dur={`${dur}s`}
      repeatCount="indefinite"
      calcMode="spline"
      keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
      keyTimes="0;0.5;1"
    />
  );
}

export default function ElViajero({
  caminando,
  mirando = 1,
}: {
  caminando: boolean;
  mirando?: 1 | -1;
}) {
  const k = caminando ? 'walk' : 'idle';
  return (
    <g transform={`scale(${mirando} 1)`}>
      <defs>
        <linearGradient id="capaViajero" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="45%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#FDA4AF" />
        </linearGradient>
        <linearGradient id="cascoViajero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="55%" stopColor="#F5E6C8" />
          <stop offset="100%" stopColor="#D4B88C" />
        </linearGradient>
        <linearGradient id="tunicaViajero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#EDE9FE" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>

      {/* Halo astral bajo los pies + sombra suave */}
      <ellipse cx={0} cy={1.5} rx={16} ry={5.5} fill="#7DD3FC" opacity={0.22} />
      <ellipse cx={0} cy={1} rx={13} ry={4.2} fill="#1E1B4B" opacity={0.32} />

      {/* Capa astral (ondea hacia atrás con constelaciones) */}
      <g>
        <Balanceo
          key={`capa-${k}`}
          cx={-4}
          cy={-34}
          desde={caminando ? -6 : -2}
          hasta={caminando ? 8 : 3.5}
          dur={caminando ? 0.68 : 2.6}
        />
        <path
          d="M-4 -36 C-15 -30 -23 -18 -32 -4 C-26 -4 -21 -8 -17 -3.5 C-14 -8 -10 -7 -6 -4.5 C-6 -16 -3 -28 -4 -36 Z"
          fill="url(#capaViajero)"
          stroke="#6366F1"
          strokeOpacity={0.75}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M-8 -30 C-14 -22 -19 -14 -25 -6"
          stroke="#FFFFFF"
          strokeOpacity={0.8}
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={-21} cy={-13} r={1.1} fill="#FFFBEB" />
        <circle cx={-14} cy={-20} r={0.85} fill="#FFFFFF" />
        <circle cx={-17} cy={-9} r={0.75} fill="#E0F2FE" />
      </g>

      {/* Pierna trasera */}
      <g>
        {caminando && <Balanceo key="p1" cx={-3} cy={-14} desde={20} hasta={-20} dur={0.36} />}
        <rect x={-5.5} y={-14} width={5} height={12} rx={2.4} fill="#4338CA" />
        <path
          d="M-6.5 -3.8 h7.2 a2.6 2.6 0 0 1 2.6 2.6 v1.2 h-9.8 z"
          fill="#312E81"
          stroke="#A5B4FC"
          strokeWidth={0.5}
        />
      </g>

      {/* Pierna delantera */}
      <g>
        {caminando && <Balanceo key="p2" cx={3} cy={-14} desde={-20} hasta={20} dur={0.36} />}
        <rect x={0.5} y={-14} width={5} height={12} rx={2.4} fill="#4F46E5" />
        <path
          d="M-0.5 -3.8 h7.2 a2.6 2.6 0 0 1 2.6 2.6 v1.2 h-9.8 z"
          fill="#3730A3"
          stroke="#C4B5FD"
          strokeWidth={0.5}
        />
      </g>

      {/* Cuerpo / túnica de archivo astral */}
      <path
        d="M-8.2 -14 C-9.2 -22 -8.2 -31 -1 -33.2 C6.2 -33.2 9.2 -26 8.7 -14 Q0 -10.8 -8.2 -14 Z"
        fill="url(#tunicaViajero)"
        stroke="#7C3AED"
        strokeOpacity={0.75}
        strokeWidth={1.1}
      />
      {/* Pliegue vertical central de la túnica */}
      <line x1={1} y1={-30} x2={1.5} y2={-13} stroke="#C4B5FD" strokeWidth={0.9} />

      {/* Cinturón astral con hebilla dorada */}
      <rect x={-8.5} y={-19.2} width={17.2} height={3.2} rx={1.5} fill="#6D28D9" />
      <rect
        x={0.8}
        y={-19.5}
        width={3.6}
        height={3.8}
        rx={1}
        fill="#FDE68A"
        stroke="#B45309"
        strokeWidth={0.6}
      />

      {/* Morral de pergaminos */}
      <path d="M-5 -30 L8 -17" stroke="#9A7248" strokeWidth={1.4} strokeLinecap="round" />
      <rect
        x={6.2}
        y={-19.5}
        width={7.5}
        height={6.4}
        rx={1.8}
        fill="#E9CFA4"
        stroke="#8C6239"
        strokeWidth={0.9}
      />
      <rect
        x={7.8}
        y={-23.5}
        width={2.4}
        height={5.2}
        rx={1.1}
        fill="#FFFBEB"
        stroke="#C8AD82"
        strokeWidth={0.6}
      />

      {/* Brazo */}
      <g>
        <Balanceo
          key={`brazo-${k}`}
          cx={0}
          cy={-29}
          desde={caminando ? -28 : -6}
          hasta={caminando ? 22 : 2}
          dur={caminando ? 0.36 : 2.4}
        />
        <rect
          x={-2.1}
          y={-30}
          width={4.6}
          height={11.2}
          rx={2.3}
          fill="#F5F3FF"
          stroke="#8B5CF6"
          strokeWidth={0.85}
        />
        <circle cx={0.2} cy={-18.3} r={2.3} fill="#FAD2B4" stroke="#D99B72" strokeWidth={0.5} />
      </g>

      {/* Bufanda coral y punta ondeante */}
      <path
        d="M-6.2 -32.2 Q0 -28.8 7.2 -32.2 L6.6 -28.8 Q0 -26.2 -5.7 -28.8 Z"
        fill="#FDA4AF"
        stroke="#E11D48"
        strokeOpacity={0.65}
        strokeWidth={0.7}
      />
      <g>
        <Balanceo
          key={`buf-${k}`}
          cx={-5}
          cy={-28}
          desde={caminando ? -11 : -3}
          hasta={caminando ? 11 : 3.5}
          dur={caminando ? 0.48 : 2}
        />
        <path
          d="M-5 -30 C-10 -28 -14.5 -27 -18.8 -29.2 L-17.5 -24.8 C-13.2 -23.8 -9 -24.8 -5 -27 Z"
          fill="#FDBA74"
          stroke="#D97706"
          strokeOpacity={0.7}
          strokeWidth={0.7}
        />
      </g>

      {/* Cabeza */}
      <circle cx={1} cy={-40.2} r={8.2} fill="#FCE0C8" stroke="#DDA37B" strokeWidth={0.8} />
      <path d="M-6.6 -41 Q-7.2 -46.2 -2.8 -47.2 L-2.8 -41.8 Z" fill="#6B422B" />
      {/* Ojo expresivo con brillo */}
      <circle cx={4.3} cy={-40.6} r={1.3} fill="#1E1B4B" />
      <circle cx={4.7} cy={-41.1} r={0.5} fill="#FFFFFF" />
      {/* Mejilla rosada y sonrisa */}
      <circle cx={5.6} cy={-37.6} r={1.7} fill="#FDA4AF" opacity={0.6} />
      <path
        d="M2.9 -36.5 Q4.7 -35.3 6.3 -36.5"
        stroke="#9A4E38"
        strokeWidth={0.9}
        fill="none"
        strokeLinecap="round"
      />

      {/* Casco / sombrero de explorador astral */}
      <ellipse
        cx={0.5}
        cy={-44.8}
        rx={13}
        ry={3.6}
        fill="#D6BD92"
        stroke="#9E7E50"
        strokeWidth={0.7}
      />
      <path
        d="M-8.3 -45 C-8.3 -55.6 9.3 -55.6 9.8 -45 Z"
        fill="url(#cascoViajero)"
        stroke="#A48456"
        strokeWidth={0.9}
      />
      {/* Cinta lavanda con gema celeste frontal */}
      <path
        d="M-8.2 -46.8 Q0.7 -44 9.6 -46.8 L9.8 -45 Q0.7 -42.4 -8.2 -45 Z"
        fill="#8B5CF6"
      />
      <path
        d="M-3.2 -52.3 Q0.2 -54.3 4.2 -52.7"
        stroke="#FFFFFF"
        strokeOpacity={0.9}
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={8.8} cy={-46} r={1.6} fill="#7DD3FC" stroke="#FFFFFF" strokeWidth={0.7} />
    </g>
  );
}
