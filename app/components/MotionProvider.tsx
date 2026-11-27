'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { useAccessibilityStore } from '../../lib/accessibility-store';
import { useSettingsStore } from '../../lib/settings-store';
import { useSpatialArrowNavigation } from '../../lib/hooks/useSpatialArrowNavigation';
import { canUseViewTransitions } from '../../lib/view-transitions';
import LottieAnimation from '../../components/ui/LottieAnimation';

export default function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [transitionPulseKey, setTransitionPulseKey] = useState<number>(0);

  useEffect(() => {
    useAccessibilityStore.getState().initAccessibility();
    useSettingsStore.getState().initSettings();
  }, []);

  // Dispara animación Lottie en cada cambio de ruta
  useEffect(() => {
    if (!canUseViewTransitions()) return;
    setTransitionPulseKey(Date.now());
  }, [pathname]);

  // Escucha transiciones de módulo, sección, elección y edición
  useEffect(() => {
    const handleCustomTransition = () => {
      if (!canUseViewTransitions()) return;
      setTransitionPulseKey(Date.now());
    };
    window.addEventListener('universo:view-transition', handleCustomTransition);
    return () => window.removeEventListener('universo:view-transition', handleCustomTransition);
  }, []);

  useEffect(() => {
    if (!transitionPulseKey) return;
    const timer = setTimeout(() => {
      setTransitionPulseKey(0);
    }, 520);
    return () => clearTimeout(timer);
  }, [transitionPulseKey]);

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
      setTransitionPulseKey(Date.now());
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
      {transitionPulseKey > 0 && (
        <div
          key={transitionPulseKey}
          className="fixed bottom-5 right-5 z-[160] pointer-events-none flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#041724]/85 backdrop-blur-md px-3 py-1.5 shadow-[0_10px_30px_-8px_rgba(103,232,249,0.45)]"
          aria-hidden="true"
        >
          <LottieAnimation preset="orbit" size={24} speed={1.6} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#67E8F9]">
            Transición
          </span>
        </div>
      )}
      {children}
    </MotionConfig>
  );
}
