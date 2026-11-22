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

const MAX_TEXTURE_SIZE = 160;
const EDGE_TAPER_PX = 2.0;

const displacementMapCache = new Map<string, string>();

function supportsSvgBackdropFilter() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isChromium = /Chrom(e|ium)/.test(ua) || /Edg\//.test(ua);
  return isChromium && !/Firefox/.test(ua);
}

/** Curva óptica suave y simétrica para los 4 bordes sin escalonamiento. */
function symmetricRimCurve(t: number) {
  const inv = Math.max(0, 1 - t);
  return inv * inv * (1.25 - 0.25 * inv);
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
  // Grosor físico uniforme en los 4 lados independiente de la proporción ancho/alto
  const bezelPx = Math.max(10, Math.min(26, bezel * 54, Math.min(halfWidth, halfHeight) * 0.65));

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
      let magnitude = symmetricRimCurve(t);
      magnitude *= Math.min(1, inside / EDGE_TAPER_PX);

      data[index] = Math.round(128 + dirX * magnitude * 118);
      data[index + 1] = Math.round(128 + dirY * magnitude * 118);
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
      // Cuantizar a múltiplos de 16px para evitar regenerar texturas por micro-cambios
      const rawW = Math.round(rect.width);
      const rawH = Math.round(rect.height);
      if (!rawW || !rawH) return;
      const width = Math.max(16, Math.round(rawW / 16) * 16);
      const height = Math.max(16, Math.round(rawH / 16) * 16);
      // Solo omitir micro-chips muy pequeños que no necesitan refracción SVG
      if (width < 90 || height < 36) {
        setGeometry((prev) => (prev === null ? prev : null));
        return;
      }
      const parsed = Number.parseFloat(getComputedStyle(el).borderTopLeftRadius);
      const radius = Math.min(
        Number.isFinite(parsed) ? Math.round(parsed / 4) * 4 : Math.min(width, height) / 2,
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

  const refractionActive = supported && !readingPriority && mapUrl !== '';
  const effectiveBlur = isLight
    ? readingPriority
      ? Math.max(blur, 14)
      : Math.min(blur, 1.15)
    : blur;
  const effectiveRefraction = isLight ? Math.min(refraction, 8) : refraction;
  const effectiveSaturation = isLight ? 1.04 : saturation;

  const backdropFilter = refractionActive
    ? `url(#${filterId}) blur(${effectiveBlur}px) saturate(${effectiveSaturation})`
    : `blur(${isLight && !readingPriority ? 1.5 : effectiveBlur + 2}px) saturate(${effectiveSaturation})`;

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
            />
          </filter>
        </svg>
      )}
    </>
  );
});
