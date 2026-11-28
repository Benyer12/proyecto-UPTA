'use client';

import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';
import themeToggleAnimationData from '../../lib/lottie/theme-toggle.json';

interface ThemeToggleLottieProps {
  theme: 'dark' | 'light';
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-[88px] h-[52px]',
  md: 'w-[126px] h-[74px]',
  lg: 'w-[164px] h-[96px] sm:w-[196px] sm:h-[115px]',
};

export default function ThemeToggleLottie({
  theme,
  onToggle,
  size = 'lg',
  className = '',
}: ThemeToggleLottieProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const themeRef = useRef<'dark' | 'light'>(theme);
  const lastRenderedThemeRef = useRef<'dark' | 'light'>(theme);

  themeRef.current = theme;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const load = async () => {
      const lottieModule = await import('lottie-web');
      const lottie = lottieModule.default || lottieModule;
      if (cancelled || !containerRef.current) return;

      const clonedData = JSON.parse(JSON.stringify(themeToggleAnimationData));

      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'canvas',
        loop: false,
        autoplay: false,
        animationData: clonedData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          clearCanvas: true,
        },
      });

      anim.setSpeed(1.6);
      anim.goToAndStop(themeRef.current === 'dark' ? 90 : 0, true);
      lastRenderedThemeRef.current = themeRef.current;
      animRef.current = anim;
    };

    void load();

    return () => {
      cancelled = true;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    if (lastRenderedThemeRef.current === theme) return;

    lastRenderedThemeRef.current = theme;
    anim.setSpeed(1.6);
    if (theme === 'dark') {
      anim.playSegments([0, 90], true);
    } else {
      anim.playSegments([90, 180], true);
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        theme === 'dark'
          ? 'Cambiar a Modo Claro'
          : 'Cambiar a Modo Oscuro'
      }
      title={
        theme === 'dark'
          ? 'Modo Oscuro activo · Clic para cambiar a Claro'
          : 'Modo Claro activo · Clic para cambiar a Oscuro'
      }
      className={`group relative inline-flex items-center justify-center rounded-full ${
        size === 'sm' ? 'p-0' : 'p-1.5'
      } transition-transform duration-200 hover:scale-[1.04] active:scale-[0.97] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${className}`}
    >
      <div
        ref={containerRef}
        className={`${SIZE_CLASSES[size]} will-change-transform`}
        style={{ transform: 'translateZ(0)' }}
      />
    </button>
  );
}
