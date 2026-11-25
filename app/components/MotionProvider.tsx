'use client';

import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAccessibilityStore } from '../../lib/accessibility-store';

export default function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useAccessibilityStore.getState().initAccessibility();
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
