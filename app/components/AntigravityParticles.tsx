'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '../../lib/theme-store';
import { useSettingsStore } from '../../lib/settings-store';

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
  strokeStyle: string;
  baseAlpha: number;
  alpha: number;
  phase: number;
  speed: number;
  orbitRadius: number;
  orbitOffset: number;
}

// Paleta exclusiva Dorado, Magenta y Fucsia para modo oscuro
const DARK_PALETTE = [
  'rgb(251, 191, 36)',  // Dorado brillante (#FBBF24)
  'rgb(245, 158, 11)',  // Dorado cálido (#F59E0B)
  'rgb(253, 224, 71)',  // Dorado luz (#FDE047)
  'rgb(217, 70, 239)',  // Magenta luminoso (#D946EF)
  'rgb(192, 38, 211)',  // Magenta intenso (#C026D3)
  'rgb(236, 72, 153)',  // Fucsia vibrante (#EC4899)
  'rgb(255, 46, 147)',  // Fucsia neón (#FF2E93)
];

// Paleta de alto contraste para polvo de estrellas visible en modo claro
const LIGHT_STARDUST_PALETTE = [
  'rgb(180, 83, 9)',    // Oro ámbar profundo (#B45309)
  'rgb(217, 119, 6)',   // Dorado cálido intenso (#D97706)
  'rgb(109, 40, 217)',  // Violeta real profundo (#6D28D9)
  'rgb(67, 56, 202)',   // Índigo espacial (#4338CA)
  'rgb(3, 105, 161)',   // Azul zafiro (#0369A1)
  'rgb(162, 28, 175)',  // Fucsia amatista (#A21CAF)
];

const ALLOWED_ROUTES = [
  '/',
  '/about',
  '/how-to-play',
  '/configuracion',
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
    clean.startsWith('/admin/') ||
    clean.startsWith('/maestro/') ||
    clean.startsWith('/docente/') ||
    clean.startsWith('/tutor/') ||
    clean.startsWith('/asignaciones/')
  );
}

export default function AntigravityParticles() {
  const pathname = usePathname();
  const theme = useThemeStore((s) => s.theme);
  const designMode = useSettingsStore((s) => s.designMode);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const initializedSettings = useSettingsStore((s) => s.initialized);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const allowed = isRouteAllowed(pathname) && designMode !== 'eco';

  useEffect(() => {
    if (!initializedSettings) {
      initSettings();
    }
  }, [initializedSettings, initSettings]);

  useEffect(() => {
    if (!allowed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const isLight = theme === 'light';
    const activePalette = isLight ? LIGHT_STARDUST_PALETTE : DARK_PALETTE;

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
      const idx = Math.floor(clamped * activePalette.length);
      return activePalette[idx];
    };

    const createParticles = (w: number, h: number): Particle[] => {
      const list: Particle[] = [];
      // En modo claro: polvo de estrella abundante y fino; en oscuro: densidad equilibrada
      const spacing = isLight ? (w < 768 ? 74 : 58) : (w < 768 ? 82 : 68);
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = (c + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.85;
          const oy = (r + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.85;
          const initialAngle = Math.random() * Math.PI * 2;

          list.push({
            x: ox,
            y: oy,
            originX: ox,
            originY: oy,
            vx: 0,
            vy: 0,
            size: isLight ? 1.35 + Math.random() * 1.45 : 1.25 + Math.random() * 1.15,
            length: isLight ? 3.4 + Math.random() * 3.2 : 4 + Math.random() * 4.8,
            angle: initialAngle,
            targetAngle: initialAngle,
            strokeStyle: getColorForPosition(ox, oy, w, h),
            baseAlpha: isLight ? 0.52 + Math.random() * 0.36 : 0.26 + Math.random() * 0.3,
            alpha: isLight ? 0.65 : 0.34,
            phase: Math.random() * Math.PI * 2,
            speed: isLight ? 0.28 + Math.random() * 0.35 : 0.45 + Math.random() * 0.55,
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
      resizeTimer = setTimeout(resize, 160);
    };

    const attractRadius = 340;
    const attractRadiusSq = attractRadius * attractRadius;
    const originRadiusSq = attractRadiusSq * 1.38;

    const animate = (timestamp: number) => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      // Render continuo a 60 FPS nativos del navegador (sin frenarse tras reposo ni al sacar el mouse)
      const time = timestamp / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';

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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const floatX = Math.cos(time * p.speed + p.phase) * 5.2;
        const floatY = Math.sin(time * p.speed * 0.85 + p.phase) * 5.2;
        const homeX = p.originX + floatX;
        const homeY = p.originY + floatY;

        let targetAlpha = p.baseAlpha * (0.78 + 0.22 * Math.sin(time * 1.3 + p.phase));
        let stretch = 1;

        if (mouse.active) {
          const dxMouse = mouse.x - p.x;
          const dyMouse = mouse.y - p.y;
          const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;

          const dxOrigin = mouse.x - p.originX;
          const dyOrigin = mouse.y - p.originY;
          const distOriginSq = dxOrigin * dxOrigin + dyOrigin * dyOrigin;

          if (distMouseSq < attractRadiusSq || distOriginSq < originRadiusSq) {
            const distMouse = Math.sqrt(distMouseSq);
            const distOrigin = Math.sqrt(distOriginSq);
            const effectiveDist = Math.min(distMouse, distOrigin * 0.85);

            if (effectiveDist < attractRadius) {
              const influence = 1 - effectiveDist / attractRadius;
              const smoothInfluence = influence * influence;

              const orbitAngle = p.orbitOffset + time * 0.4;
              const desiredX = mouse.x + Math.cos(orbitAngle) * p.orbitRadius;
              const desiredY = mouse.y + Math.sin(orbitAngle) * p.orbitRadius;

              p.vx += (desiredX - p.x) * 0.028 * smoothInfluence;
              p.vy += (desiredY - p.y) * 0.028 * smoothInfluence;

              p.vx += mouse.vx * 0.05 * smoothInfluence;
              p.vy += mouse.vy * 0.05 * smoothInfluence;

              if (distMouse < 40 && distMouse > 0.1) {
                const push = ((40 - distMouse) / 40) * 0.35;
                p.vx -= (dxMouse / distMouse) * push;
                p.vy -= (dyMouse / distMouse) * push;
              }

              targetAlpha = Math.min(isLight ? 0.92 : 0.88, p.baseAlpha + smoothInfluence * 0.48);
              stretch = 1 + smoothInfluence * 0.85;
            }
          }
        }

        p.vx += (homeX - p.x) * 0.016;
        p.vy += (homeY - p.y) * 0.016;

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
        p.angle += angleDiff * 0.14;

        p.alpha += (targetAlpha - p.alpha) * 0.15;

        ctx.globalAlpha = p.alpha;

        if (isLight) {
          // Modo claro: polvo de estrella fino (motes circulares y micro-destellos en cruz cada 4 partículas)
          ctx.fillStyle = p.strokeStyle;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (i % 2 === 0 && p.alpha > 0.45) {
            const crossLen = p.length * 0.9;
            ctx.strokeStyle = p.strokeStyle;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(p.x - crossLen, p.y);
            ctx.lineTo(p.x + crossLen, p.y);
            ctx.moveTo(p.x, p.y - crossLen);
            ctx.lineTo(p.x, p.y + crossLen);
            ctx.stroke();
          }
        } else {
          // Modo oscuro: polvo cósmico luminoso (orbes suaves + destellos estelares en Dorado, Magenta y Fucsia)
          const radius = p.size * (0.95 + (stretch - 1) * 0.35);

          // Halo suave alrededor del punto
          ctx.globalAlpha = p.alpha * 0.24;
          ctx.fillStyle = p.strokeStyle;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Núcleo circular nítido
          ctx.globalAlpha = Math.min(0.95, p.alpha * 1.15);
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Destello estelar delicado en 4 puntas para algunas partículas
          if (i % 3 === 0 && p.alpha > 0.32) {
            const glint = radius * 2.8;
            ctx.globalAlpha = p.alpha * 0.65;
            ctx.strokeStyle = p.strokeStyle;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(p.x - glint, p.y);
            ctx.lineTo(p.x + glint, p.y);
            ctx.moveTo(p.x, p.y - glint);
            ctx.lineTo(p.x, p.y + glint);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
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
  }, [allowed, theme]);

  if (!allowed) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
