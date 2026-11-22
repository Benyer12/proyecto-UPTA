'use client';

import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
} from 'react';
import { cn } from '../../../app/utils/cn';
import { useThemeStore } from '../../../lib/theme-store';

export type LiquidGlassProps = HTMLAttributes<HTMLDivElement> & {
  /** Backdrop blur radius in px. */
  blur?: number;
  /** Kept for API compatibility across glasscn surfaces. */
  refraction?: number;
  /** Kept for API compatibility across glasscn surfaces. */
  bezel?: number;
  /** Backdrop saturation multiplier. */
  saturation?: number;
  /** Preserves higher frosted opacity in light mode for reading-priority surfaces (e.g. login/forms). */
  readingPriority?: boolean;
};

/**
 * Superficie Liquid Glass acelerada por GPU:
 * - Usa exclusivamente `backdrop-filter` nativo por hardware (sin <svg> feDisplacementMap ni <canvas> por tarjeta)
 * - Simetría óptica uniforme en los 4 lados para modo oscuro y claro.
 */
export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
  {
    blur = 2.5,
    refraction: _refraction,
    bezel: _bezel,
    saturation = 1.32,
    readingPriority = false,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const effectiveBlur = isLight
    ? readingPriority
      ? Math.max(blur, 14)
      : Math.min(Math.max(blur, 1.5), 3.5)
    : Math.max(blur, 3);
  const effectiveSaturation = isLight ? 1.06 : saturation;
  const backdropFilter = `blur(${effectiveBlur}px) saturate(${effectiveSaturation})`;

  return (
    <div
      ref={ref}
      data-liquid-glass="true"
      data-reading-priority={readingPriority ? 'true' : undefined}
      className={cn(
        'relative overflow-hidden rounded-full',
        isLight
          ? readingPriority
            ? 'bg-white/[0.90] border border-slate-900/[0.12] shadow-[0_24px_64px_-22px_rgba(15,23,42,0.22),inset_0_0_20px_rgba(255,255,255,0.85)]'
            : 'bg-white/[0.14] border border-white/[0.72] shadow-[0_14px_38px_-22px_rgba(30,64,175,0.16),inset_0_0_20px_rgba(255,255,255,0.34),inset_0_0_0_1px_rgba(255,255,255,0.42)]'
          : 'bg-white/[0.045] border border-white/[0.16] shadow-[0_24px_80px_-42px_rgba(0,0,0,0.72),inset_0_0_22px_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.16)]',
        className,
      )}
      style={
        {
          contain: 'layout style',
          ...style,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
        } as CSSProperties
      }
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: 'var(--liquid-glass-rim-width, 1px)',
          background: isLight
            ? readingPriority
              ? 'rgba(15, 23, 42, 0.14)'
              : 'rgba(255, 255, 255, 0.86)'
            : 'var(--liquid-glass-rim-uniform, rgba(255, 255, 255, 0.34))',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
        }}
      />
    </div>
  );
});
