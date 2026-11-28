'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { useAccessibilityStore } from '../../lib/accessibility-store';
import { useSettingsStore } from '../../lib/settings-store';
import { useSpatialArrowNavigation } from '../../lib/hooks/useSpatialArrowNavigation';

type RouteLoadingStage = 'idle' | 'loading' | 'finishing';

export default function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEco = useSettingsStore((s) => s.designMode === 'eco');

  const [routeStage, setRouteStage] = useState<RouteLoadingStage>('idle');

  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    useAccessibilityStore.getState().initAccessibility();
    useSettingsStore.getState().initSettings();
  }, []);

  const clearRouteTimers = () => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
  };

  // Completa suavemente la barra superior cuando termina de cambiar la ruta
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    clearRouteTimers();
    setRouteStage('finishing');
    finishTimerRef.current = setTimeout(() => {
      setRouteStage('idle');
    }, 240);
  }, [pathname]);

  // Captura clics en enlaces internos para activar barra de carga superior sin congelar la vista
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

      if (isEco) return;

      clearRouteTimers();
      setRouteStage('loading');

      // Respaldo de seguridad si la navegación se cancela
      safetyTimerRef.current = setTimeout(() => {
        setRouteStage('idle');
      }, 4500);
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      clearRouteTimers();
    };
  }, [isEco]);

  useSpatialArrowNavigation();

  return (
    <MotionConfig reducedMotion="user">
      {/* Barra superior ultra fluida GPU (scaleX) durante transiciones de página/módulo */}
      {routeStage !== 'idle' && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-[210] h-[2.5px] pointer-events-none overflow-hidden"
        >
          <div
            className={`h-full origin-left bg-gradient-to-r from-[#38BDF8] via-[#C084FC] to-[#34D399] shadow-[0_0_12px_rgba(103,232,249,0.75)] transition-all duration-300 ease-out ${
              routeStage === 'loading'
                ? 'w-[78%] opacity-100'
                : 'w-full opacity-0'
            }`}
          />
        </div>
      )}

      <div key={pathname} className="route-smooth-enter">
        {children}
      </div>
    </MotionConfig>
  );
}
