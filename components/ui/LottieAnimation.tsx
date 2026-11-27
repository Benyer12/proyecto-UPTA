'use client';

import { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { getLottiePresetData, type LottiePresetName } from '../../lib/lottie-presets';

interface LottieAnimationProps {
  preset?: LottiePresetName;
  animationData?: Record<string, unknown>;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
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
  className = '',
  onComplete,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rawData = animationData ?? getLottiePresetData(preset);
    const clonedData = JSON.parse(JSON.stringify(rawData));

    const isEco =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-design-mode') === 'eco';

    let anim: AnimationItem | null = null;
    try {
      anim = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: isEco ? false : loop,
        autoplay: isEco ? false : autoplay,
        animationData: clonedData,
      });

      if (speed !== 1) {
        anim.setSpeed(speed);
      }

      if (isEco) {
        anim.goToAndStop(25, true);
      } else if (onComplete) {
        anim.addEventListener('complete', onComplete);
      }
    } catch {
      // Fallback silencioso si el contenedor se desmonta durante la carga
    }

    return () => {
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
  }, [preset, animationData, loop, autoplay, speed, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center shrink-0 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
