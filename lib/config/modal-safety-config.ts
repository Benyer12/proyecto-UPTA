export const EXIT_SHORTCUT_KEY = 'Escape';

export const HINT_SHORTCUT_KEY = 'p';

export const HINT_SHORTCUT_LABELS = {
  buttonText: 'Pista',
  hideText: 'Ocultar pista',
  shortcutHint: 'P',
  ariaLabel: 'Mostrar u ocultar pista (tecla P)',
} as const;

export const MINIGAME_EXIT_LABELS = {
  buttonText: 'Salir',
  shortcutHint: 'ESC',
  ariaLabel: 'Salir del reto y volver al tablero (tecla Escape)',
  confirmTitle: '¿Salir de este reto?',
  confirmBody: 'Volverás al tablero sin perder tu progreso guardado.',
  confirmAction: 'Sí, volver al tablero',
  cancelAction: 'Seguir jugando',
} as const;
