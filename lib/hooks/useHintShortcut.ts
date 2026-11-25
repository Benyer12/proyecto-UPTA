'use client';

import { useEffect, useRef } from 'react';
import { HINT_SHORTCUT_KEY } from '../config/modal-safety-config';

export interface UseHintShortcutOptions {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export function useHintShortcut({
  isOpen,
  onToggle,
  disabled = false,
}: UseHintShortcutOptions): void {
  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    if (!isOpen || disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.toLowerCase() !== HINT_SHORTCUT_KEY) return;
      if (isEditableElement(event.target)) return;

      event.preventDefault();
      onToggleRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, disabled]);
}
