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
      radius: isLight ? 1 + Math.random() * 1.8 : Math.random() * 2.1,
      baseAlpha: isLight ? 0.16 + Math.random() * 0.28 : 0.3 + Math.random() * 0.65,
      alpha: 0,
      speed: Math.random() * 0.007 + 0.002,
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }
  return stars;
}

function drawAuroraWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  isLight: boolean,
) {
  const shiftX = Math.sin(time * 0.18) * w * 0.04;
  const shiftY = Math.cos(time * 0.15) * h * 0.035;

  if (isLight) {
    // Fondo diurno suave tono niebla-perla (descansado para la vista, sin blanco deslumbrante)
    const baseGrad = ctx.createLinearGradient(0, 0, w, h);
    baseGrad.addColorStop(0, '#D9E0EA');
    baseGrad.addColorStop(0.5, '#E1E6EE');
    baseGrad.addColorStop(1, '#DCE0EA');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    const lightOrbs: [number, number, number, string, number][] = [
      [w * 0.16 + shiftX, h * 0.2 + shiftY, Math.max(w, h) * 0.42, '100, 165, 210', 0.12],
      [w * 0.84 - shiftX, h * 0.18 - shiftY, Math.max(w, h) * 0.4, '148, 122, 200', 0.1],
      [w * 0.52 + shiftX * 0.6, h * 0.54 - shiftY, Math.max(w, h) * 0.45, '92, 168, 148', 0.09],
      [w * 0.22 - shiftX * 0.5, h * 0.82 + shiftY, Math.max(w, h) * 0.38, '196, 174, 134', 0.08],
      [w * 0.82 + shiftX * 0.7, h * 0.8 - shiftY * 0.8, Math.max(w, h) * 0.42, '118, 152, 208', 0.11],
    ];

    for (const [cx, cy, r, rgb, alpha] of lightOrbs) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
      g.addColorStop(0.55, `rgba(${rgb}, ${(alpha * 0.35).toFixed(3)})`);
      g.addColorStop(1, 'rgba(225, 230, 238, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cinta prismática muy sutil para la refracción sin saturar la vista
    ctx.save();
    ctx.translate(w * 0.5 + shiftX * 0.5, h * 0.48 + shiftY * 0.5);
    ctx.rotate(-0.28);
    const ribbonGrad = ctx.createLinearGradient(-w * 0.6, 0, w * 0.6, 0);
    ribbonGrad.addColorStop(0, 'rgba(100, 165, 210, 0)');
    ribbonGrad.addColorStop(0.25, 'rgba(100, 165, 210, 0.06)');
    ribbonGrad.addColorStop(0.5, 'rgba(148, 122, 200, 0.06)');
    ribbonGrad.addColorStop(0.75, 'rgba(92, 168, 148, 0.05)');
    ribbonGrad.addColorStop(1, 'rgba(196, 174, 134, 0)');
    ctx.fillStyle = ribbonGrad;
    ctx.fillRect(-w * 0.75, -h * 0.14, w * 1.5, h * 0.28);
    ctx.restore();
    return;
  }

  // Modo oscuro mejorado: cosmos profundo con auroras prismáticas suaves para refracción líquida
  const bg = ctx.createRadialGradient(
    w * 0.5,
    h * 0.42,
    0,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.85,
  );
  bg.addColorStop(0, '#070B22');
  bg.addColorStop(0.55, '#030513');
  bg.addColorStop(1, '#010108');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const darkOrbs: [number, number, number, string, number][] = [
    [w * 0.18 + shiftX, h * 0.22 + shiftY, Math.max(w, h) * 0.42, '0, 210, 255', 0.13],
    [w * 0.82 - shiftX, h * 0.2 - shiftY, Math.max(w, h) * 0.42, '168, 85, 247', 0.15],
    [w * 0.5 + shiftX * 0.5, h * 0.68 - shiftY, Math.max(w, h) * 0.44, '16, 185, 129', 0.1],
    [w * 0.85 + shiftX * 0.4, h * 0.82 + shiftY * 0.5, Math.max(w, h) * 0.36, '59, 130, 246', 0.12],
    [w * 0.14 - shiftX * 0.4, h * 0.82 - shiftY * 0.5, Math.max(w, h) * 0.34, '217, 70, 239', 0.09],
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

  // Cinta auroral sutil para que el liquid-refract curve la luz en los bordes
  ctx.save();
  ctx.translate(w * 0.5 + shiftX * 0.5, h * 0.5 + shiftY * 0.5);
  ctx.rotate(-0.26);
  const darkRibbon = ctx.createLinearGradient(-w * 0.6, 0, w * 0.6, 0);
  darkRibbon.addColorStop(0, 'rgba(0, 245, 255, 0)');
  darkRibbon.addColorStop(0.28, 'rgba(0, 245, 255, 0.08)');
  darkRibbon.addColorStop(0.52, 'rgba(191, 64, 255, 0.09)');
  darkRibbon.addColorStop(0.76, 'rgba(0, 255, 136, 0.06)');
  darkRibbon.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = darkRibbon;
  ctx.fillRect(-w * 0.75, -h * 0.13, w * 1.5, h * 0.26);
  ctx.restore();
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
    const isLight = theme === 'light';

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
      drawAuroraWave(ctx, canvas.width, canvas.height, time, lightNow);

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
      style={{ background: theme === 'light' ? '#DCE2EC' : '#020410' }}
    />
  );
}
