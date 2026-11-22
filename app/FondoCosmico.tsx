'use client';

import { useEffect, useRef } from 'react';
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

const STAR_COUNT = 85;

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
      radius: isLight ? 1 + Math.random() * 1.6 : Math.random() * 2.0,
      baseAlpha: isLight ? 0.14 + Math.random() * 0.2 : 0.28 + Math.random() * 0.62,
      alpha: 0,
      speed: Math.random() * 0.007 + 0.002,
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }
  return stars;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  time: number,
  composite: GlobalCompositeOperation,
  alpha: number,
) {
  if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;

  const bleed = 36;
  const scale = Math.max((w + bleed * 2) / img.naturalWidth, (h + bleed * 2) / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;

  const floatX = Math.sin(time * 0.2) * 14;
  const floatY = Math.cos(time * 0.16) * 10;
  const dx = (w - drawW) / 2 + floatX;
  const dy = (h - drawH) / 2 + floatY;

  ctx.save();
  ctx.globalCompositeOperation = composite;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
}

function drawCosmicBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  isLight: boolean,
  darkImg: HTMLImageElement | null,
  lightImg: HTMLImageElement | null,
) {
  const shiftX = Math.sin(time * 0.18) * w * 0.035;
  const shiftY = Math.cos(time * 0.15) * h * 0.03;

  if (isLight) {
    // Base niebla lavanda-azul descansada mientras carga o como soporte
    const baseGrad = ctx.createLinearGradient(0, 0, w, h);
    baseGrad.addColorStop(0, '#CBD6EE');
    baseGrad.addColorStop(0.5, '#D7D5EC');
    baseGrad.addColorStop(1, '#CED8EA');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    // Render 3D oficial de modo claro: nebulosa dorado espacial tornasol + curvas de cristal líquido
    if (lightImg) {
      drawCoverImage(ctx, lightImg, w, h, time, 'source-over', 0.98);
    }

    // Velos sutiles en dorado espacial y lavanda que acompasan la nebulosa sin saturar
    const lightNebulas: [number, number, number, string, number][] = [
      [w * 0.2 + shiftX, h * 0.24 + shiftY, Math.max(w, h) * 0.38, '148, 163, 224', 0.06],
      [w * 0.56 + shiftX * 0.5, h * 0.54 - shiftY, Math.max(w, h) * 0.4, '245, 198, 110', 0.07],
      [w * 0.82 - shiftX, h * 0.26 - shiftY, Math.max(w, h) * 0.36, '167, 139, 250', 0.06],
    ];

    for (const [cx, cy, r, rgb, alpha] of lightNebulas) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
      g.addColorStop(0.6, `rgba(${rgb}, ${(alpha * 0.35).toFixed(3)})`);
      g.addColorStop(1, 'rgba(215, 213, 236, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  // Modo oscuro: cosmos profundo para enmarcar el render 3D tornasol
  const bg = ctx.createRadialGradient(
    w * 0.5,
    h * 0.44,
    0,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.88,
  );
  bg.addColorStop(0, '#040714');
  bg.addColorStop(0.55, '#02040D');
  bg.addColorStop(1, '#010105');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const darkOrbs: [number, number, number, string, number][] = [
    [w * 0.18 + shiftX, h * 0.24 + shiftY, Math.max(w, h) * 0.36, '0, 190, 255', 0.07],
    [w * 0.8 - shiftX, h * 0.68 - shiftY, Math.max(w, h) * 0.36, '245, 158, 11', 0.05],
  ];

  for (const [cx, cy, r, rgb, alpha] of darkOrbs) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
    g.addColorStop(0.55, `rgba(${rgb}, ${(alpha * 0.32).toFixed(3)})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (darkImg) {
    drawCoverImage(ctx, darkImg, w, h, time, 'screen', 0.96);
  }
}

export default function FondoCosmico() {
  const theme = useThemeStore((s) => s.theme);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    let isVisible = true;

    const darkImg = new Image();
    darkImg.src = '/images/liquid-prism-bg.jpg';

    const lightImg = new Image();
    lightImg.src = '/images/liquid-prism-light-bg.jpg';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = createStars(canvas.width, canvas.height, themeRef.current === 'light');
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    const animate = (timestamp: number) => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const time = timestamp / 1000;
      const lightNow = themeRef.current === 'light';

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCosmicBackdrop(ctx, canvas.width, canvas.height, time, lightNow, darkImg, lightImg);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(time * star.speed * 60 + star.phase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${star.alpha.toFixed(3)})`;
        ctx.fill();
      }

      if (!lightNow && Math.floor(time) % 13 === 0 && Math.floor(time * 10) % 7 === 0) {
        const sx = Math.random() * canvas.width;
        const sy = Math.random() * (canvas.height / 2);
        const len = 120 + Math.random() * 80;
        const grad = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.4);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.4, 'rgba(200,240,255,0.85)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy + len * 0.4);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animationId = requestAnimationFrame(animate);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 transition-colors duration-300"
      style={{ background: theme === 'light' ? '#D4D6EC' : '#010208' }}
    />
  );
}
