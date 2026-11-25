export interface WhiteboardColorOption {
  id: 'cyan' | 'gold' | 'emerald' | 'white';
  name: string;
  hex: string;
}

export type WhiteboardStrokeSizeKey = 'sm' | 'md' | 'lg';

export const WHITEBOARD_COLORS: readonly WhiteboardColorOption[] = [
  { id: 'cyan', name: 'Cian', hex: '#22d3ee' },
  { id: 'gold', name: 'Dorado', hex: '#fbbf24' },
  { id: 'emerald', name: 'Verde', hex: '#34d399' },
  { id: 'white', name: 'Blanco', hex: '#f8fafc' },
] as const;

export const WHITEBOARD_STROKE_SIZES: Record<WhiteboardStrokeSizeKey, number> = {
  sm: 2.5,
  md: 4.5,
  lg: 7.5,
};

export const WHITEBOARD_STROKE_LABELS: Record<WhiteboardStrokeSizeKey, string> = {
  sm: 'S',
  md: 'M',
  lg: 'L',
};

export const WHITEBOARD_ERASER_MULTIPLIER = 4;

export const WHITEBOARD_MAX_HISTORY = 25;

export const WHITEBOARD_GRID_SPACING = 28;

export const WHITEBOARD_GRID_COLOR = 'rgba(34, 211, 238, 0.14)';

export const WHITEBOARD_LABELS = {
  title: 'Pizarra de Cálculo',
  openButton: 'Pizarra de Cálculo',
  closeButton: 'Cerrar pizarra',
  penTool: 'Lápiz',
  eraserTool: 'Borrador',
  gridToggle: 'Cuadrícula',
  undo: 'Deshacer',
  clear: 'Limpiar',
  sizePrefix: 'Grosor',
  colorPrefix: 'Color',
  canvasAriaLabel: 'Área de dibujo para cálculos matemáticos',
  emptyHint: 'Anota aquí tus cuentas antes de responder',
} as const;
