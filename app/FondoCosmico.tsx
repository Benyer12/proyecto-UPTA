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
      baseAlpha: isLight ? 0.14 + Math.random() * 0.22 : 0.28 + Math.random() * 0.62,
      alpha: 0,
      speed: Math.random() * 0.007 + 0.002,
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }
  return stars;
}

/** Evalúa un punto en una curva spline Catmull-Rom */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

interface RibbonPoint {
  x: number;
  y: number;
  nx: number;
  ny: number;
  r: number;
  t: number;
}

function buildSplinePoints(
  controlPts: Array<{ x: number; y: number; r: number }>,
  steps: number,
): RibbonPoint[] {
  const raw: Array<{ x: number; y: number; r: number; t: number }> = [];
  const segCount = controlPts.length - 1;

  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * segCount;
    const idx = Math.min(segCount - 1, Math.floor(u));
    const localT = u - idx;

    const p0 = controlPts[Math.max(0, idx - 1)];
    const p1 = controlPts[idx];
    const p2 = controlPts[Math.min(segCount, idx + 1)];
    const p3 = controlPts[Math.min(segCount, idx + 2)];

    raw.push({
      x: catmullRom(p0.x, p1.x, p2.x, p3.x, localT),
      y: catmullRom(p0.y, p1.y, p2.y, p3.y, localT),
      r: catmullRom(p0.r, p1.r, p2.r, p3.r, localT),
      t: i / steps,
    });
  }

  return raw.map((pt, i) => {
    const prev = raw[Math.max(0, i - 1)];
    const next = raw[Math.min(raw.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    return {
      x: pt.x,
      y: pt.y,
      nx: -dy / len,
      ny: dx / len,
      r: pt.r,
      t: pt.t,
    };
  });
}

/**
 * Dibuja una cinta escultórica 3D de vidrio cromático / metal líquido
 * con refracción espectral (dorado, cian, azul eléctrico, esmeralda y cristal oscuro)
 * para potenciar el efecto Liquid Glass como fondo orgánico.
 */
function renderLiquidPrismLayer(w: number, h: number, isLight: boolean): HTMLCanvasElement {
  const pad = 36;
  const off = document.createElement('canvas');
  off.width = Math.max(1, w + pad * 2);
  off.height = Math.max(1, h + pad * 2);
  const ctx = off.getContext('2d');
  if (!ctx) return off;

  ctx.translate(pad, pad);
  const baseUnit = Math.min(w, h);

  // Curva S escultórica 3D en onda líquida estilo glasscn atravesando todo el fondo
  const mainControl = [
    { x: w * 0.26, y: -h * 0.16, r: baseUnit * 0.145 },
    { x: w * 0.11, y: h * 0.12, r: baseUnit * 0.175 },
    { x: w * 0.07, y: h * 0.38, r: baseUnit * 0.155 },
    { x: w * 0.26, y: h * 0.58, r: baseUnit * 0.125 },
    { x: w * 0.44, y: h * 0.45, r: baseUnit * 0.105 },
    { x: w * 0.55, y: h * 0.22, r: baseUnit * 0.13 },
    { x: w * 0.71, y: h * 0.42, r: baseUnit * 0.155 },
    { x: w * 0.87, y: h * 0.78, r: baseUnit * 0.185 },
    { x: w * 1.06, y: h * 1.16, r: baseUnit * 0.21 },
  ];

  // Cinta secundaria suave al fondo (profundidad espacial 3D)
  const backControl = [
    { x: -w * 0.12, y: h * 0.8, r: baseUnit * 0.09 },
    { x: w * 0.16, y: h * 0.68, r: baseUnit * 0.11 },
    { x: w * 0.44, y: h * 0.74, r: baseUnit * 0.095 },
    { x: w * 0.72, y: h * 0.18, r: baseUnit * 0.09 },
    { x: w * 1.12, y: h * 0.04, r: baseUnit * 0.11 },
  ];

  const drawRibbon = (
    pts: RibbonPoint[],
    alphaScale: number,
    softBlurPx: number,
  ) => {
    ctx.save();
    if (softBlurPx > 0) {
      ctx.filter = `blur(${softBlurPx}px)`;
    }
    ctx.globalAlpha = alphaScale;

    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];

      // Extender ligeramente cada segmento para evitar micro-costuras entre quads
      const tx = b.x - a.x;
      const ty = b.y - a.y;
      const bx = b.x + tx * 0.28;
      const by = b.y + ty * 0.28;

      const x1 = a.x - a.nx * a.r;
      const y1 = a.y - a.ny * a.r;
      const x2 = a.x + a.nx * a.r;
      const y2 = a.y + a.ny * a.r;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      const shift = Math.sin(a.t * Math.PI * 2.2) * 0.05;
      const clampStop = (v: number) => Math.max(0.01, Math.min(0.99, v));

      if (isLight) {
        // Modo claro: cinta de vidrio pastel iridiscente descansada (sin saturación extrema)
        grad.addColorStop(0, 'rgba(148, 163, 184, 0)');
        grad.addColorStop(clampStop(0.14 + shift), 'rgba(56, 189, 248, 0.34)');
        grad.addColorStop(clampStop(0.28 + shift), 'rgba(255, 255, 255, 0.72)');
        grad.addColorStop(0.45, 'rgba(167, 139, 250, 0.26)');
        grad.addColorStop(0.6, 'rgba(203, 213, 225, 0.42)');
        grad.addColorStop(clampStop(0.76 - shift), 'rgba(52, 211, 153, 0.32)');
        grad.addColorStop(clampStop(0.88 - shift), 'rgba(245, 180, 95, 0.28)');
        grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      } else {
        // Modo oscuro: vidrio líquido cromático de alto contraste (oro/ámbar, cian, negro espejo, azul eléctrico, turquesa)
        grad.addColorStop(0, 'rgba(4, 10, 24, 0)');
        grad.addColorStop(clampStop(0.08 + shift), 'rgba(245, 158, 11, 0.78)');
        grad.addColorStop(clampStop(0.18 + shift), 'rgba(253, 224, 130, 0.94)');
        grad.addColorStop(clampStop(0.28 + shift), 'rgba(56, 189, 248, 0.88)');
        grad.addColorStop(0.39, 'rgba(6, 14, 34, 0.96)');
        grad.addColorStop(0.5, 'rgba(2, 6, 18, 0.98)');
        grad.addColorStop(0.61, 'rgba(14, 165, 233, 0.72)');
        grad.addColorStop(clampStop(0.72 - shift), 'rgba(0, 245, 255, 0.92)');
        grad.addColorStop(clampStop(0.82 - shift), 'rgba(255, 255, 255, 0.88)');
        grad.addColorStop(clampStop(0.9 - shift), 'rgba(52, 211, 153, 0.78)');
        grad.addColorStop(0.96, 'rgba(251, 146, 60, 0.48)');
        grad.addColorStop(1, 'rgba(4, 10, 24, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(bx + b.nx * b.r, by + b.ny * b.r);
      ctx.lineTo(bx - b.nx * b.r, by - b.ny * b.r);
      ctx.closePath();
      ctx.fill();
    }

    // Filamento especular brillante interno para acentuar el volumen de cristal líquido
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const hx = p.x - p.nx * p.r * 0.44;
      const hy = p.y - p.ny * p.r * 0.44;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(224, 242, 254, 0.42)';
    ctx.lineWidth = Math.max(1.5, baseUnit * 0.008);
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  };

  const backPts = buildSplinePoints(backControl, 150);
  const mainPts = buildSplinePoints(mainControl, 220);

  drawRibbon(backPts, isLight ? 0.24 : 0.28, 10);
  drawRibbon(mainPts, isLight ? 0.46 : 0.86, 0);

  return off;
}

function drawCosmicBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  isLight: boolean,
  prismLayer: HTMLCanvasElement | null,
) {
  const shiftX = Math.sin(time * 0.18) * w * 0.035;
  const shiftY = Math.cos(time * 0.15) * h * 0.03;

  if (isLight) {
    // Base niebla-perla descansada para la vista
    const baseGrad = ctx.createLinearGradient(0, 0, w, h);
    baseGrad.addColorStop(0, '#D9E0EA');
    baseGrad.addColorStop(0.5, '#E1E6EE');
    baseGrad.addColorStop(1, '#DCE0EA');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    const lightOrbs: [number, number, number, string, number][] = [
      [w * 0.18 + shiftX, h * 0.22 + shiftY, Math.max(w, h) * 0.4, '100, 165, 210', 0.11],
      [w * 0.82 - shiftX, h * 0.2 - shiftY, Math.max(w, h) * 0.38, '148, 122, 200', 0.09],
      [w * 0.52 + shiftX * 0.6, h * 0.62 - shiftY, Math.max(w, h) * 0.42, '92, 168, 148', 0.08],
    ];

    for (const [cx, cy, r, rgb, alpha] of lightOrbs) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
      g.addColorStop(0.6, `rgba(${rgb}, ${(alpha * 0.3).toFixed(3)})`);
      g.addColorStop(1, 'rgba(225, 230, 238, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Cosmos profundo oscuro con neblinas sutiles para enmarcar la cinta líquida 3D
    const bg = ctx.createRadialGradient(
      w * 0.5,
      h * 0.44,
      0,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.88,
    );
    bg.addColorStop(0, '#060A1E');
    bg.addColorStop(0.55, '#030511');
    bg.addColorStop(1, '#010106');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const darkOrbs: [number, number, number, string, number][] = [
      [w * 0.16 + shiftX, h * 0.2 + shiftY, Math.max(w, h) * 0.38, '0, 200, 255', 0.09],
      [w * 0.82 - shiftX, h * 0.72 - shiftY, Math.max(w, h) * 0.38, '245, 158, 11', 0.07],
      [w * 0.55 + shiftX * 0.5, h * 0.35 - shiftY, Math.max(w, h) * 0.4, '56, 189, 248', 0.08],
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
  }

  // Cinta 3D de vidrio cromático iridiscente flotando suavemente (con margen para evitar cortes)
  if (prismLayer) {
    const floatX = Math.sin(time * 0.22) * 14 - 36;
    const floatY = Math.cos(time * 0.18) * 10 - 36;
    ctx.drawImage(prismLayer, floatX, floatY);
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
    let prismLayer: HTMLCanvasElement | null = null;
    let isVisible = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const lightNow = themeRef.current === 'light';
      stars = createStars(canvas.width, canvas.height, lightNow);
      prismLayer = renderLiquidPrismLayer(canvas.width, canvas.height, lightNow);
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
      drawCosmicBackdrop(ctx, canvas.width, canvas.height, time, lightNow, prismLayer);

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
