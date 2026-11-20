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
  orbitRadius: number;
  orbitOffset: number;
}

// Paleta espacial sincronizada con el panel de Iniciar Sesión (Numérix Cyan, Letralia Púrpura, Naturae Esmeralda, Estelar Dorado/Azul)
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

const ALLOWED_ROUTES = [
  '/',
  '/about',
  '/how-to-play',
  '/dashboard',
  '/maestro',
  '/docente',
  '/tutor',
  '/admin',
  '/asignaciones',
  '/planeta',
];

function isRouteAllowed(pathname: string | null): boolean {
  if (!pathname) return false;
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (ALLOWED_ROUTES.includes(clean)) return true;
  return (
    clean.startsWith('/planeta/') ||
    clean.startsWith('/maestro/') ||
    clean.startsWith('/docente/') ||
    clean.startsWith('/tutor/') ||
    clean.startsWith('/asignaciones/')
  );
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
    };

    const getColorForPosition = (x: number, y: number, w: number, h: number): string => {
      const nx = x / Math.max(1, w);
      const ny = y / Math.max(1, h);
      const ratio = nx * 0.65 + ny * 0.35 + (Math.random() - 0.5) * 0.2;
      const clamped = Math.max(0, Math.min(0.999, ratio));
      const idx = Math.floor(clamped * PALETTE.length);
      return PALETTE[idx];
    };

    const createParticles = (w: number, h: number): Particle[] => {
      const list: Particle[] = [];
      // Misma densidad y visibilidad viva que el panel desplegable de Iniciar Sesión
      const spacing = w < 768 ? 68 : 54;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = (c + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.82;
          const oy = (r + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.82;
          const initialAngle = Math.random() * Math.PI * 2;

          list.push({
            x: ox,
            y: oy,
            originX: ox,
            originY: oy,
            vx: 0,
            vy: 0,
            size: 1.25 + Math.random() * 1.15,
            length: 3.8 + Math.random() * 4.6,
            angle: initialAngle,
            targetAngle: initialAngle,
            color: getColorForPosition(ox, oy, w, h),
            // Opacidad igualada a la del panel de Iniciar Sesión (mucho más visibles y nítidas)
            baseAlpha: 0.24 + Math.random() * 0.28,
            alpha: 0.32,
            phase: Math.random() * Math.PI * 2,
            speed: 0.45 + Math.random() * 0.55,
            orbitRadius: 55 + Math.random() * 130,
            orbitOffset: Math.random() * Math.PI * 2,
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
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
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

      // Seguimiento suave del cursor
      if (mouse.active) {
        const prevX = mouse.x;
        const prevY = mouse.y;
        mouse.x += (mouse.targetX - mouse.x) * 0.13;
        mouse.y += (mouse.targetY - mouse.y) * 0.13;
        mouse.vx = mouse.x - prevX;
        mouse.vy = mouse.y - prevY;
      } else {
        mouse.vx *= 0.9;
        mouse.vy *= 0.9;
      }

      const attractRadius = 350;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Flotación ambiental suave alrededor de su origen
        const floatX = Math.cos(time * p.speed + p.phase) * 5.5;
        const floatY = Math.sin(time * p.speed * 0.85 + p.phase) * 5.5;
        const homeX = p.originX + floatX;
        const homeY = p.originY + floatY;

        let targetAlpha = p.baseAlpha * (0.78 + 0.22 * Math.sin(time * 1.4 + p.phase));
        let stretch = 1;

        if (mouse.active) {
          const dxMouse = mouse.x - p.x;
          const dyMouse = mouse.y - p.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          const dxOrigin = mouse.x - p.originX;
          const dyOrigin = mouse.y - p.originY;
          const distOrigin = Math.sqrt(dxOrigin * dxOrigin + dyOrigin * dyOrigin);

          const effectiveDist = Math.min(distMouse, distOrigin * 0.85);

          if (effectiveDist < attractRadius) {
            const influence = 1 - effectiveDist / attractRadius;
            const smoothInfluence = influence * influence;

            const orbitAngle = p.orbitOffset + time * 0.4;
            const desiredX = mouse.x + Math.cos(orbitAngle) * p.orbitRadius;
            const desiredY = mouse.y + Math.sin(orbitAngle) * p.orbitRadius;

            p.vx += (desiredX - p.x) * 0.025 * smoothInfluence;
            p.vy += (desiredY - p.y) * 0.025 * smoothInfluence;

            p.vx += mouse.vx * 0.045 * smoothInfluence;
            p.vy += mouse.vy * 0.045 * smoothInfluence;

            if (distMouse < 40 && distMouse > 0.1) {
              const push = ((40 - distMouse) / 40) * 0.35;
              p.vx -= (dxMouse / distMouse) * push;
              p.vy -= (dyMouse / distMouse) * push;
            }

            // Misma intensidad luminosa al acercarse al cursor que en el panel de Iniciar Sesión
            targetAlpha = Math.min(0.88, p.baseAlpha + smoothInfluence * 0.48);
            stretch = 1 + smoothInfluence * 0.85;
          }
        }

        p.vx += (homeX - p.x) * 0.015;
        p.vy += (homeY - p.y) * 0.015;

        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > 0.04) {
          p.targetAngle = Math.atan2(p.vy, p.vx);
        } else if (mouse.active) {
          p.targetAngle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
        } else {
          p.targetAngle = Math.atan2(floatY, floatX);
        }

        let angleDiff = p.targetAngle - p.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        p.angle += angleDiff * 0.13;

        p.alpha += (targetAlpha - p.alpha) * 0.14;

        const currentLen = (p.length + Math.min(6, Math.sqrt(speedSq) * 1.45)) * stretch;
        const halfLen = currentLen * 0.5;
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);

        ctx.beginPath();
        ctx.moveTo(p.x - cos * halfLen, p.y - sin * halfLen);
        ctx.lineTo(p.x + cos * halfLen, p.y + sin * halfLen);
        ctx.strokeStyle = `rgba(${p.color}, ${p.alpha.toFixed(3)})`;
        ctx.lineWidth = p.size * 1.5;
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
