'use client';

import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAccessibilityStore } from '../../lib/accessibility-store';
import { useSpatialArrowNavigation } from '../../lib/hooks/useSpatialArrowNavigation';

export default function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useAccessibilityStore.getState().initAccessibility();
  }, []);

  useSpatialArrowNavigation();

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
