'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  length: number;
  angle: number;
  targetAngle: number;
  color: string;
  baseAlpha: number;
  alpha: number;
  phase: number;
  speed: number;
}

// Paleta espacial sincronizada con el tema del proyecto (Numérix Cyan, Letralia Púrpura, Naturae Esmeralda, Estelar Dorado/Azul)
const PALETTE = [
  '0, 245, 255',   // Cyan Numérix (#00f5ff)
  '56, 189, 248',  // Azul celeste cósmico (#38bdf8)
  '59, 130, 246',  // Azul profundo (#3b82f6)
  '191, 64, 255',  // Púrpura Letralia (#bf40ff)
  '168, 85, 247',  // Violeta (#a855f7)
  '217, 70, 239',  // Magenta espacial (#d946ef)
  '0, 255, 136',   // Esmeralda Naturae (#00ff88)
  '250, 204, 21',  // Dorado estelar (#facc15)
];

const ALLOWED_ROUTES = ['/', '/dashboard', '/maestro', '/admin'];

function isRouteAllowed(pathname: string | null): boolean {
  if (!pathname) return false;
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return ALLOWED_ROUTES.includes(clean);
}

export default function AntigravityParticles() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const allowed = isRouteAllowed(pathname);

  useEffect(() => {
    if (!allowed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let isVisible = true;

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      vx: 0,
      vy: 0,
      active: false,
      lastMove: 0,
    };

    const getColorForPosition = (x: number, y: number, w: number, h: number): string => {
      // Distribución cromática suave por zonas para lograr el efecto arcoíris cósmico de Antigravity
      const nx = x / Math.max(1, w);
      const ny = y / Math.max(1, h);
      const ratio = (nx * 0.65 + ny * 0.35 + (Math.random() - 0.5) * 0.18);
      const clamped = Math.max(0, Math.min(0.999, ratio));
      const idx = Math.floor(clamped * PALETTE.length);
      return PALETTE[idx];
    };

    const createParticles = (w: number, h: number): Particle[] => {
      const list: Particle[] = [];
      // Cuadrícula orgánica con jitter para distribución uniforme y limpia
      const spacing = w < 768 ? 44 : 36;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = (c + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.75;
          const oy = (r + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.75;
          const initialAngle = Math.random() * Math.PI * 2;

          list.push({
            x: ox,
            y: oy,
            originX: ox,
            originY: oy,
            vx: 0,
            vy: 0,
            size: 1.4 + Math.random() * 1.4,
            length: 4 + Math.random() * 5,
            angle: initialAngle,
            targetAngle: initialAngle,
            color: getColorForPosition(ox, oy, w, h),
            baseAlpha: 0.22 + Math.random() * 0.35,
            alpha: 0.25,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 0.8,
          });
        }
      }
      return list;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = createParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      if (!mouse.active) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      }
      mouse.lastMove = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        mouse.targetX = t.clientX;
        mouse.targetY = t.clientY;
        if (!mouse.active) {
          mouse.x = t.clientX;
          mouse.y = t.clientY;
          mouse.active = true;
        }
        mouse.lastMove = performance.now();
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Suavizado del cursor (interpolación fluida)
      if (mouse.active) {
        const prevX = mouse.x;
        const prevY = mouse.y;
        mouse.x += (mouse.targetX - mouse.x) * 0.18;
        mouse.y += (mouse.targetY - mouse.y) * 0.18;
        mouse.vx = mouse.x - prevX;
        mouse.vy = mouse.y - prevY;
      } else {
        mouse.vx *= 0.9;
        mouse.vy *= 0.9;
      }

      const interactionRadius = 210;
      const innerExclusion = 55; // Zona interior limpia alrededor del puntero

      // Halo sutil reactivo donde se ubica el puntero
      if (mouse.active) {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          interactionRadius * 1.15
        );
        glow.addColorStop(0, 'rgba(0, 245, 255, 0.045)');
        glow.addColorStop(0.5, 'rgba(191, 64, 255, 0.025)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, interactionRadius * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Movimiento ambiental sutil (flotación antigravedad)
        const floatX = Math.cos(time * p.speed + p.phase) * 3.5;
        const floatY = Math.sin(time * p.speed * 0.9 + p.phase) * 3.5;
        const homeX = p.originX + floatX;
        const homeY = p.originY + floatY;

        let targetAlpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(time * 1.5 + p.phase));
        let stretch = 1;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const maxR = interactionRadius;

          if (distSq < maxR * maxR && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const normX = dx / dist;
            const normY = dy / dist;

            // Fuerza de repulsión suave + vórtice tangencial (efecto magnético Antigravity)
            const factor = 1 - dist / maxR;
            const smoothFactor = factor * factor;

            // Empuje radial hacia el anillo exterior
            const radialPush = dist < innerExclusion
              ? ((innerExclusion - dist) / innerExclusion) * 2.4
              : smoothFactor * 1.35;

            // Ligera rotación orbital alrededor del cursor + arrastre del movimiento del mouse
            const swirlStrength = smoothFactor * 0.45;
            const tangentX = -normY;
            const tangentY = normX;

            p.vx += normX * radialPush + tangentX * swirlStrength + mouse.vx * smoothFactor * 0.05;
            p.vy += normY * radialPush + tangentY * swirlStrength + mouse.vy * smoothFactor * 0.05;

            // Orientar la cápsula tangencial/radialmente respecto al cursor
            p.targetAngle = Math.atan2(dy + tangentY * 22, dx + tangentX * 22);
            targetAlpha = Math.min(0.95, p.baseAlpha + smoothFactor * 0.65);
            stretch = 1 + smoothFactor * 1.45;
          } else {
            p.targetAngle = Math.atan2(floatY, floatX);
          }
        } else {
          p.targetAngle = Math.atan2(floatY, floatX);
        }

        // Fuerza elástica de retorno a su posición base
        const toHomeX = homeX - p.x;
        const toHomeY = homeY - p.y;
        p.vx += toHomeX * 0.045;
        p.vy += toHomeY * 0.045;

        // Amortiguación (fricción espacial)
        p.vx *= 0.84;
        p.vy *= 0.84;

        p.x += p.vx;
        p.y += p.vy;

        // Si la partícula tiene velocidad significativa, orientar según su dirección de flujo
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > 0.25) {
          p.targetAngle = Math.atan2(p.vy, p.vx);
        }

        // Interpolación suave de ángulo
        let angleDiff = p.targetAngle - p.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        p.angle += angleDiff * 0.16;

        p.alpha += (targetAlpha - p.alpha) * 0.15;

        // Dibujar cápsula / trazo redondeado (estilo Google Antigravity)
        const currentLen = (p.length + Math.min(8, Math.sqrt(speedSq) * 1.8)) * stretch;
        const halfLen = currentLen * 0.5;
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);

        ctx.beginPath();
        ctx.moveTo(p.x - cos * halfLen, p.y - sin * halfLen);
        ctx.lineTo(p.x + cos * halfLen, p.y + sin * halfLen);
        ctx.strokeStyle = `rgba(${p.color}, ${p.alpha.toFixed(3)})`;
        ctx.lineWidth = p.size * 1.6;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animationId = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, [allowed]);

  if (!allowed) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
