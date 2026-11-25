export type PlanetThemeKey = 'numerix' | 'letralia' | 'naturae';

export interface OrbitalThemePalette {
  key: PlanetThemeKey;
  accentHex: string;
  accentBrightHex: string;
  warmSecondaryHex: string;
  dark: {
    panelBg: string;
    panelBorder: string;
    hairlineStroke: string;
    activeStroke: string;
    planetHaloGlow: string;
    diamondFill: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    ctaBorder: string;
    ctaBg: string;
    mutedCardBg: string;
    mutedCardBorder: string;
    activeCardBg: string;
    activeCardBorder: string;
    activeCardShadow: string;
    pillBg: string;
    pillBorder: string;
  };
  light: {
    panelBg: string;
    panelBorder: string;
    hairlineStroke: string;
    activeStroke: string;
    planetHaloGlow: string;
    diamondFill: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    ctaBorder: string;
    ctaBg: string;
    mutedCardBg: string;
    mutedCardBorder: string;
    activeCardBg: string;
    activeCardBorder: string;
    activeCardShadow: string;
    pillBg: string;
    pillBorder: string;
  };
}

export const ORBITAL_PLANET_THEMES: Record<number, OrbitalThemePalette> = {
  1: {
    key: 'numerix',
    accentHex: '#67E8F9',
    accentBrightHex: '#00F5FF',
    warmSecondaryHex: '#C2A878',
    dark: {
      panelBg: 'rgba(8, 17, 32, 0.58)',
      panelBorder: 'rgba(148, 163, 184, 0.24)',
      hairlineStroke: 'rgba(148, 163, 184, 0.24)',
      activeStroke: 'rgba(103, 232, 249, 0.72)',
      planetHaloGlow: 'rgba(0, 245, 255, 0.28)',
      diamondFill: '#67E8F9',
      badgeBorder: 'rgba(103, 232, 249, 0.42)',
      badgeBg: 'rgba(8, 47, 73, 0.65)',
      badgeText: '#A5F3FC',
      ctaBorder: 'rgba(103, 232, 249, 0.48)',
      ctaBg: 'rgba(9, 25, 38, 0.92)',
      mutedCardBg: 'rgba(11, 21, 36, 0.68)',
      mutedCardBorder: 'rgba(255, 255, 255, 0.14)',
      activeCardBg: 'rgba(12, 29, 44, 0.86)',
      activeCardBorder: 'rgba(103, 232, 249, 0.58)',
      activeCardShadow: '0 0 28px rgba(0, 245, 255, 0.16)',
      pillBg: 'rgba(10, 22, 38, 0.84)',
      pillBorder: 'rgba(255, 255, 255, 0.16)',
    },
    light: {
      panelBg: 'rgba(255, 255, 255, 0.76)',
      panelBorder: 'rgba(14, 116, 144, 0.26)',
      hairlineStroke: 'rgba(15, 23, 42, 0.20)',
      activeStroke: 'rgba(8, 145, 178, 0.75)',
      planetHaloGlow: 'rgba(6, 182, 212, 0.24)',
      diamondFill: '#0891B2',
      badgeBorder: 'rgba(8, 145, 178, 0.45)',
      badgeBg: 'rgba(207, 250, 254, 0.85)',
      badgeText: '#155E75',
      ctaBorder: 'rgba(8, 145, 178, 0.55)',
      ctaBg: 'rgba(236, 254, 255, 0.95)',
      mutedCardBg: 'rgba(248, 250, 252, 0.82)',
      mutedCardBorder: 'rgba(15, 23, 42, 0.14)',
      activeCardBg: 'rgba(255, 255, 255, 0.94)',
      activeCardBorder: 'rgba(8, 145, 178, 0.62)',
      activeCardShadow: '0 12px 28px rgba(8, 145, 178, 0.16)',
      pillBg: 'rgba(255, 255, 255, 0.88)',
      pillBorder: 'rgba(15, 23, 42, 0.16)',
    },
  },
  2: {
    key: 'letralia',
    accentHex: '#D8B4FE',
    accentBrightHex: '#BF40FF',
    warmSecondaryHex: '#C4B5FD',
    dark: {
      panelBg: 'rgba(14, 10, 30, 0.58)',
      panelBorder: 'rgba(167, 139, 250, 0.24)',
      hairlineStroke: 'rgba(148, 163, 184, 0.24)',
      activeStroke: 'rgba(216, 180, 254, 0.72)',
      planetHaloGlow: 'rgba(191, 64, 255, 0.28)',
      diamondFill: '#D8B4FE',
      badgeBorder: 'rgba(216, 180, 254, 0.42)',
      badgeBg: 'rgba(59, 7, 100, 0.62)',
      badgeText: '#F3E8FF',
      ctaBorder: 'rgba(216, 180, 254, 0.48)',
      ctaBg: 'rgba(28, 12, 48, 0.92)',
      mutedCardBg: 'rgba(17, 14, 34, 0.68)',
      mutedCardBorder: 'rgba(255, 255, 255, 0.14)',
      activeCardBg: 'rgba(26, 15, 46, 0.86)',
      activeCardBorder: 'rgba(216, 180, 254, 0.58)',
      activeCardShadow: '0 0 28px rgba(191, 64, 255, 0.18)',
      pillBg: 'rgba(18, 14, 36, 0.84)',
      pillBorder: 'rgba(255, 255, 255, 0.16)',
    },
    light: {
      panelBg: 'rgba(255, 255, 255, 0.76)',
      panelBorder: 'rgba(126, 34, 206, 0.24)',
      hairlineStroke: 'rgba(15, 23, 42, 0.20)',
      activeStroke: 'rgba(147, 51, 234, 0.75)',
      planetHaloGlow: 'rgba(147, 51, 234, 0.22)',
      diamondFill: '#9333EA',
      badgeBorder: 'rgba(147, 51, 234, 0.45)',
      badgeBg: 'rgba(243, 232, 255, 0.88)',
      badgeText: '#6B21A8',
      ctaBorder: 'rgba(147, 51, 234, 0.55)',
      ctaBg: 'rgba(250, 245, 255, 0.95)',
      mutedCardBg: 'rgba(248, 250, 252, 0.82)',
      mutedCardBorder: 'rgba(15, 23, 42, 0.14)',
      activeCardBg: 'rgba(255, 255, 255, 0.94)',
      activeCardBorder: 'rgba(147, 51, 234, 0.62)',
      activeCardShadow: '0 12px 28px rgba(147, 51, 234, 0.16)',
      pillBg: 'rgba(255, 255, 255, 0.88)',
      pillBorder: 'rgba(15, 23, 42, 0.16)',
    },
  },
  3: {
    key: 'naturae',
    accentHex: '#6EE7B7',
    accentBrightHex: '#00FF88',
    warmSecondaryHex: '#A7F3D0',
    dark: {
      panelBg: 'rgba(7, 22, 24, 0.58)',
      panelBorder: 'rgba(110, 231, 183, 0.24)',
      hairlineStroke: 'rgba(148, 163, 184, 0.24)',
      activeStroke: 'rgba(110, 231, 183, 0.72)',
      planetHaloGlow: 'rgba(0, 255, 136, 0.28)',
      diamondFill: '#6EE7B7',
      badgeBorder: 'rgba(110, 231, 183, 0.42)',
      badgeBg: 'rgba(6, 78, 59, 0.62)',
      badgeText: '#D1FAE5',
      ctaBorder: 'rgba(110, 231, 183, 0.48)',
      ctaBg: 'rgba(8, 33, 29, 0.92)',
      mutedCardBg: 'rgba(10, 24, 28, 0.68)',
      mutedCardBorder: 'rgba(255, 255, 255, 0.14)',
      activeCardBg: 'rgba(11, 35, 34, 0.86)',
      activeCardBorder: 'rgba(110, 231, 183, 0.58)',
      activeCardShadow: '0 0 28px rgba(0, 255, 136, 0.16)',
      pillBg: 'rgba(10, 25, 28, 0.84)',
      pillBorder: 'rgba(255, 255, 255, 0.16)',
    },
    light: {
      panelBg: 'rgba(255, 255, 255, 0.76)',
      panelBorder: 'rgba(5, 150, 105, 0.24)',
      hairlineStroke: 'rgba(15, 23, 42, 0.20)',
      activeStroke: 'rgba(5, 150, 105, 0.75)',
      planetHaloGlow: 'rgba(16, 185, 129, 0.22)',
      diamondFill: '#059669',
      badgeBorder: 'rgba(5, 150, 105, 0.45)',
      badgeBg: 'rgba(209, 250, 229, 0.88)',
      badgeText: '#065F46',
      ctaBorder: 'rgba(5, 150, 105, 0.55)',
      ctaBg: 'rgba(236, 253, 245, 0.95)',
      mutedCardBg: 'rgba(248, 250, 252, 0.82)',
      mutedCardBorder: 'rgba(15, 23, 42, 0.14)',
      activeCardBg: 'rgba(255, 255, 255, 0.94)',
      activeCardBorder: 'rgba(5, 150, 105, 0.62)',
      activeCardShadow: '0 12px 28px rgba(5, 150, 105, 0.16)',
      pillBg: 'rgba(255, 255, 255, 0.88)',
      pillBorder: 'rgba(15, 23, 42, 0.16)',
    },
  },
};

export function getOrbitalTheme(planetId: number): OrbitalThemePalette {
  return ORBITAL_PLANET_THEMES[planetId] ?? ORBITAL_PLANET_THEMES[1];
}

/**
 * Coordenadas en un lienzo SVG de 1000 x 540 (porcentajes equivalentes para las tarjetas HTML).
 * Replica con precisión la composición de la imagen de referencia:
 * - Nivel 1 (índice 0): Derecha-Centro, conector horizontal izquierdo hacia nodo romboidal en el anillo interior/medio.
 * - Nivel 2 (índice 1): Arriba-Izquierda, conector vertical inferior hacia nodo romboidal en el anillo medio.
 * - Nivel 3 (índice 2): Abajo-Derecha, conector horizontal izquierdo hacia nodo romboidal en el anillo exterior.
 */
export interface OrbitalNodePlacement {
  /** Posición X del centro de la tarjeta en % (0..100) */
  cardXPercent: number;
  /** Posición Y del centro de la tarjeta en % (0..100) */
  cardYPercent: number;
  /** Punto de anclaje del cable en el borde de la tarjeta (en unidades SVG 1000x540) */
  cardAnchorSvgX: number;
  cardAnchorSvgY: number;
  /** Coordenadas del nodo romboidal (◆) sobre la órbita (en unidades SVG 1000x540) */
  diamondSvgX: number;
  diamondSvgY: number;
  /** Punto opcional donde el conector continúa desde el rombo hasta el anillo sólido o la órbita */
  orbitTouchSvgX: number;
  orbitTouchSvgY: number;
  /** Orientación de la línea guía que cruza el nodo romboidal */
  reticleAxis: 'vertical' | 'horizontal';
  /** Índice del anillo orbital asociado (0 = interno, 1 = medio, 2 = externo) */
  ringIndex: number;
}

const PRESET_3_NODES: OrbitalNodePlacement[] = [
  // Nivel 1 (FASE-01): Derecha-centro (protagonista)
  {
    cardXPercent: 78.5,
    cardYPercent: 45.5,
    cardAnchorSvgX: 646,
    cardAnchorSvgY: 245,
    diamondSvgX: 604,
    diamondSvgY: 245,
    orbitTouchSvgX: 584,
    orbitTouchSvgY: 256,
    reticleAxis: 'vertical',
    ringIndex: 0,
  },
  // Nivel 2 (FASE-02): Arriba-izquierda
  {
    cardXPercent: 28.5,
    cardYPercent: 26.5,
    cardAnchorSvgX: 285,
    cardAnchorSvgY: 196,
    diamondSvgX: 285,
    diamondSvgY: 234,
    orbitTouchSvgX: 285,
    orbitTouchSvgY: 284,
    reticleAxis: 'horizontal',
    ringIndex: 1,
  },
  // Nivel 3 (FASE-03): Abajo-derecha
  {
    cardXPercent: 70.5,
    cardYPercent: 75.5,
    cardAnchorSvgX: 588,
    cardAnchorSvgY: 408,
    diamondSvgX: 554,
    diamondSvgY: 408,
    orbitTouchSvgX: 534,
    orbitTouchSvgY: 408,
    reticleAxis: 'vertical',
    ringIndex: 2,
  },
];

const PRESET_2_NODES: OrbitalNodePlacement[] = [
  PRESET_3_NODES[0],
  PRESET_3_NODES[1],
];

const PRESET_4_NODES: OrbitalNodePlacement[] = [
  PRESET_3_NODES[0],
  PRESET_3_NODES[1],
  PRESET_3_NODES[2],
  {
    cardXPercent: 26.5,
    cardYPercent: 74.5,
    cardAnchorSvgX: 382,
    cardAnchorSvgY: 402,
    diamondSvgX: 420,
    diamondSvgY: 402,
    orbitTouchSvgX: 442,
    orbitTouchSvgY: 392,
    reticleAxis: 'vertical',
    ringIndex: 1,
  },
];

const PRESET_5_NODES: OrbitalNodePlacement[] = [
  ...PRESET_4_NODES,
  {
    cardXPercent: 73.5,
    cardYPercent: 18.5,
    cardAnchorSvgX: 615,
    cardAnchorSvgY: 100,
    diamondSvgX: 575,
    diamondSvgY: 100,
    orbitTouchSvgX: 552,
    orbitTouchSvgY: 115,
    reticleAxis: 'vertical',
    ringIndex: 2,
  },
];

const PRESET_6_NODES: OrbitalNodePlacement[] = [
  ...PRESET_5_NODES,
  {
    cardXPercent: 21.5,
    cardYPercent: 51.0,
    cardAnchorSvgX: 332,
    cardAnchorSvgY: 275,
    diamondSvgX: 368,
    diamondSvgY: 275,
    orbitTouchSvgX: 392,
    orbitTouchSvgY: 275,
    reticleAxis: 'vertical',
    ringIndex: 0,
  },
];

export function getOrbitalNodePlacements(count: number): OrbitalNodePlacement[] {
  if (count <= 2) return PRESET_2_NODES.slice(0, Math.max(1, count));
  if (count === 3) return PRESET_3_NODES;
  if (count === 4) return PRESET_4_NODES;
  if (count === 5) return PRESET_5_NODES;
  return PRESET_6_NODES.slice(0, count);
}

export const ORBITAL_UI_COPY = {
  backButtonText: 'Mapa Estelar',
  backKeyHint: 'ESC',
  moduleHeaderPrefix: 'MÓDULO ORBITAL',
  levelsCountSuffix: 'NIVELES',
  singleLevelSuffix: 'NIVEL',
  levelBoxLabel: 'NIVEL',
  phasePrefix: 'FASE-',
  bossPrefix: 'JEFE-',
  sectorPrefix: 'SECTOR ',
  statusAvailable: 'DISPONIBLE',
  statusCompleted: 'COMPLETADO',
  statusLocked: 'BLOQUEADO',
  statusGuardian: 'GUARDIÁN',
  ctaStart: 'INICIAR MISIÓN',
  ctaReplay: 'REJUGAR MISIÓN',
  ctaKeyHint: 'ENTER',
  emptyLevelsMessage: 'Este módulo orbital aún no tiene misiones registradas.',
} as const;
