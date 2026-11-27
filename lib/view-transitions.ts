'use client';

import { flushSync } from 'react-dom';

export type ViewTransitionKind =
  | 'route'
  | 'forward'
  | 'back'
  | 'section'
  | 'choice'
  | 'edit';

export function canUseViewTransitions(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (typeof document.startViewTransition !== 'function') return false;
  if (document.documentElement.dataset.designMode === 'eco') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

/**
 * Ejecuta una actualización de estado dentro de la View Transitions API nativa
 * aplicando el tipo direccional en `html[data-vt-type]`, con fallback instantáneo
 * en Modo Ahorro o navegadores sin soporte.
 */
export function runViewTransition(
  update: () => void,
  type: ViewTransitionKind = 'section',
): void {
  if (!canUseViewTransitions()) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.vtType = type;

  try {
    window.dispatchEvent(
      new CustomEvent('universo:view-transition', { detail: { type } }),
    );
  } catch {
    // ignorar en entornos sin CustomEvent
  }

  try {
    const transition = document.startViewTransition(() => {
      try {
        flushSync(update);
      } catch {
        update();
      }
    });

    void transition.finished.finally(() => {
      if (root.dataset.vtType === type) {
        delete root.dataset.vtType;
      }
    });
  } catch {
    delete root.dataset.vtType;
    update();
  }
}
