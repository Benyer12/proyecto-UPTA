'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { useAccessibilityStore } from '../../lib/accessibility-store';
import { useSpatialArrowNavigation } from '../../lib/hooks/useSpatialArrowNavigation';
import { canUseViewTransitions } from '../../lib/view-transitions';

export default function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    useAccessibilityStore.getState().initAccessibility();
  }, []);

  // Activa transición nativa suave al navegar mediante enlaces internos
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;
        if (nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search) {
          return;
        }
      } catch {
        return;
      }

      if (!canUseViewTransitions()) return;
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      document.documentElement.dataset.vtType = 'route';
      try {
        doc.startViewTransition?.(() => {});
      } catch {}
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  useSpatialArrowNavigation();

  return (
    <MotionConfig reducedMotion="user">
      <div key={pathname} className="vt-route-stage">
        {children}
      </div>
    </MotionConfig>
  );
}
