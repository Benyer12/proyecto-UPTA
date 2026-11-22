'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '../lib/theme-store';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  speed: number;
  phase: number;
  color: string;
}

const STAR_COUNT = 72;

const DARK_STAR_COLORS = [
  '255,255,255',
  '180,220,255',
  '200,180,255',
  '150,255,220',
  '255,220,180',
];

const LIGHT_MOTE_COLORS = [
  '2,132,199',
  '124,58,237',
  '5,150,105',
  '217,119,6',
  '37,99,235',
];

function createStars(w: number, h: number, isLight: boolean): Star[] {
  const palette = isLight ? LIGHT_MOTE_COLORS : DARK_STAR_COLORS;
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: isLight ? 1 + Math.random() * 1.6 : Math.random() * 1.9,
      baseAlpha: isLight ? 0.14 + Math.random() * 0.2 : 0.28 + Math.random() * 0.6,
      alpha: 0,
      speed: Math.random() * 0.007 + 0.002,
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }
  return stars;
}

/**
 * Pre-escala la imagen 3D de fondo al tamaño exacto de pantalla (+ margen para flotación)
 * evitando re-escalar una textura 2K en cada frame.
 */
function buildPreScaledLayer(
  img: HTMLImageElement,
  w: number,
  h: number,
  isLight: boolean,
): HTMLCanvasElement | null {
  if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return null;

  const bleed = 32;
  const offW = w + bleed * 2;
  const offH = h + bleed * 2;
  const off = document.createElement('canvas');
  off.width = offW;
  off.height = offH;
  const octx = off.getContext('2d');
  if (!octx) return null;

  const scale = Math.max(offW / img.naturalWidth, offH / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const dx = (offW - drawW) / 2;
  const dy = (offH - drawH) / 2;

  if (isLight) {
    const baseGrad = octx.createLinearGradient(0, 0, offW, offH);
    baseGrad.addColorStop(0, '#CBD6EE');
    baseGrad.addColorStop(0.5, '#D7D5EC');
    baseGrad.addColorStop(1, '#CED8EA');
    octx.fillStyle = baseGrad;
    octx.fillRect(0, 0, offW, offH);
    octx.globalAlpha = 0.98;
    octx.drawImage(img, dx, dy, drawW, drawH);
  } else {
    const bg = octx.createRadialGradient(
      offW * 0.5,
      offH * 0.44,
      0,
      offW * 0.5,
      offH * 0.5,
      Math.max(offW, offH) * 0.88,
    );
    bg.addColorStop(0, '#040714');
    bg.addColorStop(0.55, '#02040D');
    bg.addColorStop(1, '#010105');
    octx.fillStyle = bg;
    octx.fillRect(0, 0, offW, offH);

    octx.globalCompositeOperation = 'screen';
    octx.globalAlpha = 0.96;
    octx.drawImage(img, dx, dy, drawW, drawH);
  }

  return off;
}

export default function FondoCosmico() {
  const pathname = usePathname();
  const theme = useThemeStore((s) => s.theme);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // En los tableros de juego (pantalla completa) no dibujamos fondo oculto debajo
  const isGameRoute = Boolean(pathname?.startsWith('/juego/'));

  useEffect(() => {
    if (isGameRoute) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    let isVisible = true;
    let lastDraw = 0;

    let darkScaled: HTMLCanvasElement | null = null;
    let lightScaled: HTMLCanvasElement | null = null;

    const darkImg = new Image();
    darkImg.src = '/images/liquid-prism-bg.jpg';

    const lightImg = new Image();
    lightImg.src = '/images/liquid-prism-light-bg.jpg';

    const rebuildScaledLayers = () => {
      darkScaled = buildPreScaledLayer(darkImg, canvas.width, canvas.height, false);
      lightScaled = buildPreScaledLayer(lightImg, canvas.width, canvas.height, true);
    };

    darkImg.onload = rebuildScaledLayers;
    lightImg.onload = rebuildScaledLayers;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = createStars(canvas.width, canvas.height, themeRef.current === 'light');
      rebuildScaledLayers();
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    };

    const drawFrame = (timestamp: number) => {
      if (!isVisible) {
        animationId = requestAnimationFrame(drawFrame);
        return;
      }

      // 24 fps es totalmente fluido para nebulosas/estrellas lentas y reduce 60% el trabajo de backdrop-filter
      if (timestamp - lastDraw < 40) {
        animationId = requestAnimationFrame(drawFrame);
        return;
      }
      lastDraw = timestamp;

      const time = timestamp / 1000;
      const lightNow = themeRef.current === 'light';
      const w = canvas.width;
      const h = canvas.height;
      const layer = lightNow ? lightScaled : darkScaled;

      if (layer) {
        const floatX = Math.round(Math.sin(time * 0.2) * 12) - 32;
        const floatY = Math.round(Math.cos(time * 0.16) * 8) - 32;
        ctx.drawImage(layer, floatX, floatY);
      } else {
        ctx.fillStyle = lightNow ? '#D4D6EC' : '#010208';
        ctx.fillRect(0, 0, w, h);
      }

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(time * star.speed * 60 + star.phase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${star.alpha.toFixed(2)})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(drawFrame);
    };

    resize();
    animationId = requestAnimationFrame(drawFrame);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, isGameRoute]);

  if (isGameRoute) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ background: theme === 'light' ? '#D4D6EC' : '#010208' }}
    />
  );
}
