'use client';

import React from 'react';
import type {
  OrbitalNodePlacement,
  OrbitalThemePalette,
} from '../../../lib/config/orbital-selector-config';

interface OrbitalRingsSvgProps {
  theme: OrbitalThemePalette;
  isDark: boolean;
  placements: OrbitalNodePlacement[];
  selectedLevelIndex: number;
  unlockedFlags: boolean[];
}

const ORBIT_ELLIPSES = [
  { rx: 255, ry: 132, dash: '6 7' },
  { rx: 340, ry: 184, dash: '7 8' },
  { rx: 425, ry: 234, dash: '8 9' },
] as const;

export function OrbitalRingsSvg({
  theme,
  isDark,
  placements,
  selectedLevelIndex,
  unlockedFlags,
}: OrbitalRingsSvgProps) {
  const palette = isDark ? theme.dark : theme.light;
  const activePlacement = placements[selectedLevelIndex];
  const activeRingIndex = activePlacement?.ringIndex ?? 0;

  return (
    <svg
      viewBox="0 0 1000 540"
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`innerRingGrad-${theme.key}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={theme.warmSecondaryHex} stopOpacity={isDark ? '0.65' : '0.55'} />
          <stop offset="50%" stopColor={theme.accentHex} stopOpacity={isDark ? '0.78' : '0.68'} />
          <stop offset="100%" stopColor={theme.accentBrightHex} stopOpacity={isDark ? '0.92' : '0.82'} />
        </linearGradient>

        <radialGradient id={`planetCenterHalo-${theme.key}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.accentBrightHex} stopOpacity={isDark ? '0.22' : '0.14'} />
          <stop offset="55%" stopColor={theme.accentHex} stopOpacity={isDark ? '0.07' : '0.04'} />
          <stop offset="100%" stopColor={theme.accentHex} stopOpacity="0" />
        </radialGradient>

        <filter id={`diamondGlow-${theme.key}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Halo suave detrás del planeta central */}
      <ellipse
        cx={500}
        cy={275}
        rx={175}
        ry={130}
        fill={`url(#planetCenterHalo-${theme.key})`}
      />

      {/* Ejes reticulares sutiles del radar */}
      <line
        x1={110}
        y1={275}
        x2={890}
        y2={275}
        stroke={palette.hairlineStroke}
        strokeWidth={0.75}
        strokeDasharray="3 9"
        opacity={0.45}
      />
      <line
        x1={500}
        y1={45}
        x2={500}
        y2={505}
        stroke={palette.hairlineStroke}
        strokeWidth={0.75}
        strokeDasharray="3 9"
        opacity={0.45}
      />

      {/* 3 Anillos orbitales elípticos inclinados discontinuos */}
      <g transform="rotate(-11 500 275)">
        {ORBIT_ELLIPSES.map((orbit, idx) => {
          const isRingActive = idx === activeRingIndex;
          return (
            <ellipse
              key={`orbit-ring-${idx}`}
              cx={500}
              cy={275}
              rx={orbit.rx}
              ry={orbit.ry}
              fill="none"
              stroke={isRingActive ? palette.activeStroke : palette.hairlineStroke}
              strokeWidth={isRingActive ? 1.15 : 1}
              strokeDasharray={orbit.dash}
              opacity={isRingActive ? 0.85 : 0.62}
            />
          );
        })}
      </g>

      {/* Anillo elíptico sólido interior alrededor del planeta (fiel a la imagen) */}
      <ellipse
        cx={500}
        cy={275}
        rx={178}
        ry={82}
        fill="none"
        stroke={`url(#innerRingGrad-${theme.key})`}
        strokeWidth={1.65}
      />

      {/* Conectores ortogonales y nodos romboidales (◆) para cada nivel */}
      {placements.map((node, index) => {
        const isSelected = index === selectedLevelIndex;
        const isUnlocked = Boolean(unlockedFlags[index]);
        const isHighlighted = isSelected || isUnlocked;
        const strokeColor = isHighlighted ? palette.activeStroke : palette.hairlineStroke;
        const diamondSize = isHighlighted ? 7.5 : 6.5;

        return (
          <g key={`orbital-connector-${index}`}>
            {/* Línea guía fina que cruza el nodo romboidal (retícula técnica) */}
            {node.reticleAxis === 'vertical' ? (
              <line
                x1={node.diamondSvgX}
                y1={node.diamondSvgY - 34}
                x2={node.diamondSvgX}
                y2={node.diamondSvgY + 34}
                stroke={strokeColor}
                strokeWidth={1}
                opacity={isHighlighted ? 0.65 : 0.45}
              />
            ) : (
              <line
                x1={node.diamondSvgX - 34}
                y1={node.diamondSvgY}
                x2={node.diamondSvgX + 34}
                y2={node.diamondSvgY}
                stroke={strokeColor}
                strokeWidth={1}
                opacity={isHighlighted ? 0.65 : 0.45}
              />
            )}

            {/* Continuación desde el rombo hacia el anillo interior o la órbita */}
            <line
              x1={node.diamondSvgX}
              y1={node.diamondSvgY}
              x2={node.orbitTouchSvgX}
              y2={node.orbitTouchSvgY}
              stroke={strokeColor}
              strokeWidth={isHighlighted ? 1.35 : 1}
              opacity={isHighlighted ? 0.85 : 0.55}
            />

            {/* Conector principal desde el borde de la tarjeta hasta el nodo romboidal */}
            <line
              x1={node.cardAnchorSvgX}
              y1={node.cardAnchorSvgY}
              x2={node.diamondSvgX}
              y2={node.diamondSvgY}
              stroke={strokeColor}
              strokeWidth={isHighlighted ? 1.4 : 1}
              opacity={isHighlighted ? 0.95 : 0.6}
            />

            {/* Rombo exterior (◆) rotado 45 grados */}
            <rect
              x={node.diamondSvgX - diamondSize}
              y={node.diamondSvgY - diamondSize}
              width={diamondSize * 2}
              height={diamondSize * 2}
              rx={1.5}
              transform={`rotate(45 ${node.diamondSvgX} ${node.diamondSvgY})`}
              fill={isDark ? '#071322' : '#ffffff'}
              stroke={isHighlighted ? theme.accentHex : palette.hairlineStroke}
              strokeWidth={isHighlighted ? 1.4 : 1.1}
              filter={isHighlighted ? `url(#diamondGlow-${theme.key})` : undefined}
            />

            {/* Punto luminoso central dentro del rombo */}
            <circle
              cx={node.diamondSvgX}
              cy={node.diamondSvgY}
              r={isHighlighted ? 2.8 : 2}
              fill={isHighlighted ? palette.diamondFill : palette.hairlineStroke}
            />
          </g>
        );
      })}
    </svg>
  );
}
