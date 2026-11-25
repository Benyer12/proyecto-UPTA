'use client';

import { useEffect } from 'react';
import {
  FOCUSABLE_SELECTOR,
  SPATIAL_DIRECTION_MAP,
  type SpatialDirection,
} from '../config/navigation-config';

const NATIVE_ACTIVATABLE_TAGS = new Set(['A', 'BUTTON', 'SUMMARY', 'INPUT', 'SELECT', 'TEXTAREA']);
const NATIVE_ARROW_TAGS = new Set(['TEXTAREA', 'SELECT']);
const NATIVE_ARROW_INPUT_TYPES = new Set(['range', 'number', 'date', 'time', 'datetime-local']);

function isVisibleFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
    return false;
  }
  if (el.closest('[aria-hidden="true"], [inert]')) {
    return false;
  }
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none' || style.pointerEvents === 'none') {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getActiveDialogRoot(): HTMLElement | null {
  const dialogs = Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]'),
  ).filter((dialog) => {
    const style = window.getComputedStyle(dialog);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = dialog.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  if (dialogs.length === 0) return null;

  dialogs.sort((a, b) => {
    const za = Number.parseInt(window.getComputedStyle(a).zIndex || '0', 10) || 0;
    const zb = Number.parseInt(window.getComputedStyle(b).zIndex || '0', 10) || 0;
    return za - zb;
  });

  return dialogs[dialogs.length - 1];
}

function getCandidates(scopeRoot: ParentNode): HTMLElement[] {
  const nodes = Array.from(scopeRoot.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const seen = new Set<HTMLElement>();
  const result: HTMLElement[] = [];

  for (const el of nodes) {
    if (seen.has(el)) continue;
    seen.add(el);
    if (isVisibleFocusable(el)) {
      result.push(el);
    }
  }
  return result;
}

function shouldYieldArrowToNativeControl(
  active: Element | null,
  direction: SpatialDirection,
): boolean {
  if (!(active instanceof HTMLElement)) return false;
  if (active.isContentEditable || active.closest('[contenteditable="true"]')) {
    return true;
  }
  if (NATIVE_ARROW_TAGS.has(active.tagName)) {
    return true;
  }
  if (active instanceof HTMLInputElement) {
    if (NATIVE_ARROW_INPUT_TYPES.has(active.type)) {
      return true;
    }
    if (
      (direction === 'left' || direction === 'right') &&
      active.type !== 'checkbox' &&
      active.type !== 'radio' &&
      active.type !== 'button' &&
      active.type !== 'submit'
    ) {
      return true;
    }
  }
  return false;
}

function findBestCandidate(
  current: HTMLElement | null,
  candidates: HTMLElement[],
  direction: SpatialDirection,
): HTMLElement | null {
  if (candidates.length === 0) return null;

  if (!current || !candidates.includes(current)) {
    const ordered = [...candidates].sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      if (Math.abs(ra.top - rb.top) > 12) return ra.top - rb.top;
      return ra.left - rb.left;
    });
    return direction === 'up' || direction === 'left'
      ? ordered[ordered.length - 1]
      : ordered[0];
  }

  const rectA = current.getBoundingClientRect();
  const ax = rectA.left + rectA.width / 2;
  const ay = rectA.top + rectA.height / 2;

  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const cand of candidates) {
    if (cand === current) continue;
    const rectB = cand.getBoundingClientRect();
    const bx = rectB.left + rectB.width / 2;
    const by = rectB.top + rectB.height / 2;

    const dx = bx - ax;
    const dy = by - ay;

    let primaryDist = 0;
    let perpDist = 0;
    let alignedOverlap = false;

    if (direction === 'right') {
      if (dx <= 4) continue;
      primaryDist = dx;
      perpDist = Math.abs(dy);
      alignedOverlap = rectB.top < rectA.bottom - 2 && rectB.bottom > rectA.top + 2;
    } else if (direction === 'left') {
      if (dx >= -4) continue;
      primaryDist = -dx;
      perpDist = Math.abs(dy);
      alignedOverlap = rectB.top < rectA.bottom - 2 && rectB.bottom > rectA.top + 2;
    } else if (direction === 'down') {
      if (dy <= 4) continue;
      primaryDist = dy;
      perpDist = Math.abs(dx);
      alignedOverlap = rectB.left < rectA.right - 2 && rectB.right > rectA.left + 2;
    } else {
      if (dy >= -4) continue;
      primaryDist = -dy;
      perpDist = Math.abs(dx);
      alignedOverlap = rectB.left < rectA.right - 2 && rectB.right > rectA.left + 2;
    }

    const score =
      primaryDist +
      perpDist * (alignedOverlap ? 1.15 : 2.6) -
      (alignedOverlap ? 80 : 0);

    if (score < bestScore) {
      bestScore = score;
      best = cand;
    }
  }

  return best;
}

export function useSpatialArrowNavigation(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const activeEl = document.activeElement;

      if (event.key === 'Enter') {
        if (
          activeEl instanceof HTMLElement &&
          !NATIVE_ACTIVATABLE_TAGS.has(activeEl.tagName) &&
          !activeEl.isContentEditable &&
          isVisibleFocusable(activeEl)
        ) {
          event.preventDefault();
          activeEl.click();
        }
        return;
      }

      const direction = SPATIAL_DIRECTION_MAP[event.key];
      if (!direction) return;
      if (shouldYieldArrowToNativeControl(activeEl, direction)) return;

      const dialogRoot = getActiveDialogRoot();
      const scopeRoot: ParentNode = dialogRoot ?? document;
      const candidates = getCandidates(scopeRoot);
      if (candidates.length === 0) return;

      const current = activeEl instanceof HTMLElement ? activeEl : null;
      const next = findBestCandidate(current, candidates, direction);
      if (!next) return;

      event.preventDefault();
      next.focus();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      next.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
