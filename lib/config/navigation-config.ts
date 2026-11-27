export type SpatialDirection = 'up' | 'down' | 'left' | 'right';

export const SPATIAL_DIRECTION_MAP: Record<string, SpatialDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'summary',
  'select:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'textarea:not(:disabled)',
  '[role="button"]:not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface KeyboardShortcutGuideItem {
  keys: readonly string[];
  title: string;
  description: string;
  accentColor: string;
  bg: string;
  border: string;
}

export const KEYBOARD_SHORTCUTS_GUIDE: readonly KeyboardShortcutGuideItem[] = [
  {
    keys: ['↑', '↓', '←', '→'],
    title: 'Flechas de dirección',
    description:
      'Muévete arriba, abajo, izquierda o derecha por enlaces, planetas, tarjetas y opciones del juego.',
    accentColor: '#67E8F9',
    bg: 'rgba(103, 232, 249, 0.12)',
    border: 'rgba(103, 232, 249, 0.35)',
  },
  {
    keys: ['Enter'],
    title: 'Entrar o confirmar',
    description:
      'Abre el apartado que tienes seleccionado, despliega secciones o confirma tu respuesta.',
    accentColor: '#6EE7B7',
    bg: 'rgba(110, 231, 183, 0.12)',
    border: 'rgba(110, 231, 183, 0.35)',
  },
  {
    keys: ['L'],
    title: 'Modo Lectura Fácil',
    description:
      'Activa o desactiva textos más grandes y espaciados para leer con mayor comodidad.',
    accentColor: '#93C5FD',
    bg: 'rgba(147, 197, 253, 0.12)',
    border: 'rgba(147, 197, 253, 0.35)',
  },
  {
    keys: ['P'],
    title: 'Mostrar u ocultar Pista',
    description:
      'Abre o cierra la pista de ayuda dentro de los retos de Numérix, Letralia y Naturae.',
    accentColor: '#FDE68A',
    bg: 'rgba(253, 230, 138, 0.12)',
    border: 'rgba(253, 230, 138, 0.35)',
  },
  {
    keys: ['ESC'],
    title: 'Salida segura',
    description:
      'Cierra primero la Pizarra de Cálculo si está abierta, o vuelve al tablero sin perder tu avance.',
    accentColor: '#FDA4AF',
    bg: 'rgba(253, 164, 175, 0.12)',
    border: 'rgba(253, 164, 175, 0.35)',
  },
] as const;
