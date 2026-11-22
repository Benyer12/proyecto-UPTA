'use client';

import {
  type CSSProperties,
  type HTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../../app/utils/cn';
import { useThemeStore } from '../../../lib/theme-store';

type MapGeometry = {
  width: number;
  height: number;
  radius: number;
  bezel: number;
};

const MAX_TEXTURE_SIZE = 480;
const EDGE_TAPER_PX = 1.25;

const displacementMapCache = new Map<string, string>();

function supportsSvgBackdropFilter() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isChromium = /Chrom(e|ium)/.test(ua) || /Edg\//.test(ua);
  return isChromium && !/Firefox/.test(ua);
}

function convexSquircle(x: number) {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
}

function createDisplacementMap({ width, height, radius, bezel }: MapGeometry) {
  const cacheKey = `${width}:${height}:${radius}:${bezel}`;
  const cached = displacementMapCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const downscale = Math.min(1, MAX_TEXTURE_SIZE / Math.max(width, height));
  const texWidth = Math.max(2, Math.round(width * downscale));
  const texHeight = Math.max(2, Math.round(height * downscale));

  const canvas = document.createElement('canvas');
  canvas.width = texWidth;
  canvas.height = texHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const image = ctx.createImageData(texWidth, texHeight);
  const data = image.data;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const r = Math.min(radius, halfWidth, halfHeight);
  const bezelPx = Math.max(1, bezel * Math.min(halfWidth, halfHeight));

  for (let ty = 0; ty < texHeight; ty += 1) {
    for (let tx = 0; tx < texWidth; tx += 1) {
      const px = ((tx + 0.5) / texWidth) * width - halfWidth;
      const py = ((ty + 0.5) / texHeight) * height - halfHeight;

      const qx = Math.abs(px) - (halfWidth - r);
      const qy = Math.abs(py) - (halfHeight - r);
      let signedDistance: number;
      let dirX = 0;
      let dirY = 0;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy);
        signedDistance = len - r;
        dirX = (Math.sign(px) * qx) / len;
        dirY = (Math.sign(py) * qy) / len;
      } else if (qx > qy) {
        signedDistance = qx - r;
        dirX = Math.sign(px);
      } else {
        signedDistance = qy - r;
        dirY = Math.sign(py);
      }

      const index = (ty * texWidth + tx) * 4;
      const inside = -signedDistance;

      if (inside <= 0) {
        data[index] = 128;
        data[index + 1] = 128;
        data[index + 2] = 128;
        data[index + 3] = 255;
        continue;
      }

      const t = Math.min(1, inside / bezelPx);
      let magnitude = 1 - convexSquircle(t);
      magnitude *= Math.min(1, inside / EDGE_TAPER_PX);

      data[index] = Math.round(128 + dirX * magnitude * 127);
      data[index + 1] = Math.round(128 + dirY * magnitude * 127);
      data[index + 2] = 128;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const mapUrl = canvas.toDataURL('image/png');
  displacementMapCache.set(cacheKey, mapUrl);
  return mapUrl;
}

export type LiquidGlassProps = HTMLAttributes<HTMLDivElement> & {
  /** Extra blur mixed into the backdrop-filter after the SVG refraction. */
  blur?: number;
  /** SVG displacement strength. Higher values bend the sampled backdrop more. */
  refraction?: number;
  /** Fraction of the radius used as the curved edge where most refraction happens. */
  bezel?: number;
  /** Backdrop saturation. */
  saturation?: number;
  /** Preserves higher frosted opacity in light mode for reading-priority surfaces (e.g. login/forms). */
  readingPriority?: boolean;
};

/**
 * Superficie Liquid Glass fiel a glasscn:
 * - Modo oscuro: cristal translúcido profundo con refracción SVG feDisplacementMap
 * - Modo claro: cristal óptico ultra-transparente (refracción ~7-9, desenfoque ~1px)
 *   excepto cuando `readingPriority` está activo (formularios / modales de lectura).
 */
export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
  {
    blur = 2.5,
    refraction = 15,
    bezel = 0.34,
    saturation = 1.32,
    readingPriority = false,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const rawId = useId();
  const filterId = useMemo(() => `liquid-glass-${rawId.replace(/:/g, '')}`, [rawId]);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const localRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const [geometry, setGeometry] = useState<MapGeometry | null>(null);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (!width || !height) return;
      const parsed = Number.parseFloat(getComputedStyle(el).borderTopLeftRadius);
      const radius = Math.min(
        Number.isFinite(parsed) ? parsed : Math.min(width, height) / 2,
        width / 2,
        height / 2,
      );
      setGeometry((prev) =>
        prev &&
        prev.width === width &&
        prev.height === height &&
        prev.radius === radius &&
        prev.bezel === bezel
          ? prev
          : { width, height, radius, bezel },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [bezel]);

  const mapUrl = useMemo(() => (geometry ? createDisplacementMap(geometry) : ''), [geometry]);

  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(supportsSvgBackdropFilter());
  }, []);

  const refractionActive = supported && mapUrl !== '';
  const effectiveBlur = isLight
    ? readingPriority
      ? Math.max(blur, 14)
      : Math.min(blur, 1.15)
    : blur;
  const effectiveRefraction = isLight
    ? readingPriority
      ? Math.min(refraction, 8)
      : Math.min(refraction, 8)
    : refraction;
  const effectiveSaturation = isLight && !readingPriority ? Math.max(saturation, 1.35) : saturation;

  const backdropFilter = refractionActive
    ? `url(#${filterId}) blur(${effectiveBlur}px) saturate(${effectiveSaturation})`
    : `blur(${isLight && !readingPriority ? 1.5 : effectiveBlur + 2.5}px) saturate(${effectiveSaturation})`;

  return (
    <>
      <div
        ref={setRefs}
        data-liquid-glass="true"
        data-reading-priority={readingPriority ? 'true' : undefined}
        className={cn(
          'relative overflow-hidden rounded-full',
          isLight
            ? readingPriority
              ? 'bg-white/[0.90] border border-slate-900/[0.12] shadow-[0_24px_64px_-22px_rgba(15,23,42,0.22),inset_0_1px_0_0_rgba(255,255,255,1)]'
              : 'bg-white/[0.14] border border-white/[0.72] shadow-[0_14px_38px_-22px_rgba(30,64,175,0.16),inset_0_1px_0_0_rgba(255,255,255,0.88),inset_0_-1px_0_0_rgba(255,255,255,0.28)]'
            : 'bg-white/[0.045] border border-white/[0.10] shadow-[0_24px_80px_-42px_rgba(0,0,0,0.72),inset_0_1px_0_0_rgba(255,255,255,0.18)]',
          className,
        )}
        style={{ ...style, backdropFilter, WebkitBackdropFilter: backdropFilter } as CSSProperties}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            padding: 'var(--liquid-glass-rim-width, 0.75px)',
            background: isLight
              ? readingPriority
                ? 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.98) var(--liquid-glass-rim-fade, 18%), rgba(255,255,255,0.98) calc(100% - var(--liquid-glass-rim-fade, 18%)), rgba(255,255,255,0)), ' +
                  'linear-gradient(to bottom, rgba(15,23,42,0), rgba(15,23,42,0.12) var(--liquid-glass-rim-fade, 18%), rgba(15,23,42,0.12) calc(100% - var(--liquid-glass-rim-fade, 18%)), rgba(15,23,42,0))'
                : 'linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.92) var(--liquid-glass-rim-fade, 20%), rgba(255,255,255,0.92) calc(100% - var(--liquid-glass-rim-fade, 20%)), rgba(255,255,255,0.12)), ' +
                  'linear-gradient(to bottom, rgba(148,163,184,0.06), rgba(30,64,175,0.14) var(--liquid-glass-rim-fade, 20%), rgba(30,64,175,0.14) calc(100% - var(--liquid-glass-rim-fade, 20%)), rgba(148,163,184,0.06))'
              : 'linear-gradient(to right, rgba(255,255,255,0), var(--liquid-glass-rim-light, rgba(255,255,255,0.28)) var(--liquid-glass-rim-fade, 18%), var(--liquid-glass-rim-light, rgba(255,255,255,0.28)) calc(100% - var(--liquid-glass-rim-fade, 18%)), rgba(255,255,255,0)), ' +
                'linear-gradient(to bottom, rgba(0,0,0,0), var(--liquid-glass-rim-dark, rgba(255,255,255,0.09)) var(--liquid-glass-rim-fade, 18%), var(--liquid-glass-rim-dark, rgba(255,255,255,0.09)) calc(100% - var(--liquid-glass-rim-fade, 18%)), rgba(0,0,0,0))',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
          }}
        />
      </div>

      {refractionActive && (
        <svg className="pointer-events-none absolute size-0 overflow-hidden" aria-hidden="true">
          <filter
            id={filterId}
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={mapUrl}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={effectiveRefraction}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation={isLight && !readingPriority ? '0.08' : '0.15'} />
          </filter>
        </svg>
      )}
    </>
  );
});
