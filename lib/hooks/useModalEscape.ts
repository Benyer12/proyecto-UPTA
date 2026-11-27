'use client';

import { useEffect, useRef } from 'react';
import { EXIT_SHORTCUT_KEY } from '../config/modal-safety-config';

export type ModalEscapePriority = 'modal' | 'secondary';

export interface UseModalEscapeOptions {
  isOpen: boolean;
  onEscape: () => void;
  disabled?: boolean;
  priority?: ModalEscapePriority;
}

interface EscapeEntry {
  id: number;
  priority: ModalEscapePriority;
  onEscape: () => void;
}

const activeEntries: EscapeEntry[] = [];
let nextEntryId = 1;
let globalListenerAttached = false;

function handleGlobalEscapeKeyDown(event: KeyboardEvent) {
  if (event.key !== EXIT_SHORTCUT_KEY || event.repeat) return;
  if (activeEntries.length === 0) return;

  const secondary = activeEntries.filter((entry) => entry.priority === 'secondary');
  const pool = secondary.length > 0 ? secondary : activeEntries;
  const target = pool[pool.length - 1];
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();
  target.onEscape();
}

function attachGlobalListenerIfNeeded() {
  if (typeof window === 'undefined' || globalListenerAttached) return;
  window.addEventListener('keydown', handleGlobalEscapeKeyDown, true);
  globalListenerAttached = true;
}

function detachGlobalListenerIfIdle() {
  if (typeof window === 'undefined' || !globalListenerAttached) return;
  if (activeEntries.length === 0) {
    window.removeEventListener('keydown', handleGlobalEscapeKeyDown, true);
    globalListenerAttached = false;
  }
}

export function useModalEscape({
  isOpen,
  onEscape,
  disabled = false,
  priority = 'modal',
}: UseModalEscapeOptions): void {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!isOpen || disabled) return;

    const id = nextEntryId++;
    const entry: EscapeEntry = {
      id,
      priority,
      onEscape: () => onEscapeRef.current(),
    };
    activeEntries.push(entry);
    attachGlobalListenerIfNeeded();

    return () => {
      const idx = activeEntries.findIndex((item) => item.id === id);
      if (idx !== -1) {
        activeEntries.splice(idx, 1);
      }
      detachGlobalListenerIfIdle();
    };
  }, [isOpen, disabled, priority]);
}
