'use client';

import { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { getLottiePresetData, type LottiePresetName } from '../../lib/lottie-presets';
import { useSettingsStore } from '../../lib/settings-store';

interface LottieAnimationProps {
  preset?: LottiePresetName;
  animationData?: Record<string, unknown>;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  forcePlay?: boolean;
  renderer?: 'svg' | 'canvas';
  className?: string;
  onComplete?: () => void;
}

export default function LottieAnimation({
  preset = 'orbit',
  animationData,
  size = 48,
  loop = true,
  autoplay = true,
  speed = 1,
  forcePlay = false,
  renderer = 'svg',
  className = '',
  onComplete,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isEco = useSettingsStore((s) => s.designMode === 'eco');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rawData = animationData ?? getLottiePresetData(preset);
    const clonedData = JSON.parse(JSON.stringify(rawData));

    const reducedMotion =
      !forcePlay &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const staticOnly = (!forcePlay && isEco) || reducedMotion;

    let anim: AnimationItem | null = null;
    let observer: IntersectionObserver | null = null;

    try {
      anim = lottie.loadAnimation({
        container,
        renderer,
        loop: staticOnly ? false : loop,
        autoplay: staticOnly ? false : autoplay,
        animationData: clonedData,
        rendererSettings:
          renderer === 'canvas'
            ? {
                clearCanvas: true,
                preserveAspectRatio: 'xMidYMid slice',
              }
            : {
                progressiveLoad: !forcePlay,
              },
      });

      if (speed !== 1) {
        anim.setSpeed(speed);
      }

      if (staticOnly) {
        anim.goToAndStop(25, true);
      } else {
        if (autoplay) {
          anim.play();
        }
        if (onComplete) {
          anim.addEventListener('complete', onComplete);
        }

        // Pausa automática cuando sale del viewport para mantener 60fps sin lagueo
        if (!forcePlay && typeof IntersectionObserver !== 'undefined' && autoplay) {
          observer = new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              if (!anim || !entry) return;
              if (entry.isIntersecting) {
                anim.play();
              } else {
                anim.pause();
              }
            },
            { threshold: 0.05 },
          );
          observer.observe(container);
        }
      }
    } catch {
      // Fallback silencioso si el contenedor se desmonta durante la carga
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (anim) {
        if (onComplete) {
          try {
            anim.removeEventListener('complete', onComplete);
          } catch {
            // ignorar
          }
        }
        anim.destroy();
      }
    };
  }, [preset, animationData, loop, autoplay, speed, forcePlay, renderer, onComplete, isEco]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, transform: 'translateZ(0)' }}
      className={`inline-flex items-center justify-center shrink-0 select-none pointer-events-none will-change-transform ${className}`}
      aria-hidden="true"
    />
  );
}
