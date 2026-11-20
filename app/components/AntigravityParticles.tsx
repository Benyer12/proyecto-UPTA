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
      // Menos partículas: espaciado amplio para un aspecto limpio, sutil y elegante
      const spacing = w < 768 ? 95 : 80;
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
            size: 1.2 + Math.random() * 1.1,
            length: 3.5 + Math.random() * 4.5,
            angle: initialAngle,
            targetAngle: initialAngle,
            color: getColorForPosition(ox, oy, w, h),
            // Mucho más transparentes y delicadas en reposo
            baseAlpha: 0.08 + Math.random() * 0.14,
            alpha: 0.1,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.5,
            orbitRadius: 70 + Math.random() * 140,
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
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
        mouse.vx = mouse.x - prevX;
        mouse.vy = mouse.y - prevY;
      } else {
        mouse.vx *= 0.92;
        mouse.vy *= 0.92;
      }

      const attractRadius = 380;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Flotación ambiental suave alrededor de su origen
        const floatX = Math.cos(time * p.speed + p.phase) * 6;
        const floatY = Math.sin(time * p.speed * 0.85 + p.phase) * 6;
        const homeX = p.originX + floatX;
        const homeY = p.originY + floatY;

        let targetAlpha = p.baseAlpha * (0.75 + 0.25 * Math.sin(time * 1.2 + p.phase));
        let stretch = 1;

        if (mouse.active) {
          // Las partículas cercanas siguen al cursor formando una nube/enjambre orbital suave
          const dxMouse = mouse.x - p.x;
          const dyMouse = mouse.y - p.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          // También chequeamos distancia desde su origen para capturar partículas en el camino del mouse
          const dxOrigin = mouse.x - p.originX;
          const dyOrigin = mouse.y - p.originY;
          const distOrigin = Math.sqrt(dxOrigin * dxOrigin + dyOrigin * dyOrigin);

          const effectiveDist = Math.min(distMouse, distOrigin * 0.85);

          if (effectiveDist < attractRadius) {
            const influence = 1 - effectiveDist / attractRadius;
            const smoothInfluence = influence * influence;

            // Punto objetivo que orbita y sigue al cursor (como en la pantalla de autenticación de Antigravity)
            const orbitAngle = p.orbitOffset + time * 0.35;
            const desiredX = mouse.x + Math.cos(orbitAngle) * p.orbitRadius;
            const desiredY = mouse.y + Math.sin(orbitAngle) * p.orbitRadius;

            // Fuerza de atracción suave hacia el punto orbital que sigue al mouse
            p.vx += (desiredX - p.x) * 0.022 * smoothInfluence;
            p.vy += (desiredY - p.y) * 0.022 * smoothInfluence;

            // Arrastre sutil en la dirección en que se mueve el mouse (para que lo sigan con fluidez)
            p.vx += mouse.vx * 0.045 * smoothInfluence;
            p.vy += mouse.vy * 0.045 * smoothInfluence;

            // Si se acercan demasiado al centro exacto del puntero (< 45px), mantener un pequeño espacio limpio
            if (distMouse < 45 && distMouse > 0.1) {
              const push = ((45 - distMouse) / 45) * 0.35;
              p.vx -= (dxMouse / distMouse) * push;
              p.vy -= (dyMouse / distMouse) * push;
            }

            // Opacidad sutil y transparente incluso cuando están activas (máximo ~0.48)
            targetAlpha = Math.min(0.48, p.baseAlpha + smoothInfluence * 0.28);
            stretch = 1 + smoothInfluence * 0.85;
          }
        }

        // Retorno elástico muy suave a su posición original cuando el mouse se aleja
        p.vx += (homeX - p.x) * 0.012;
        p.vy += (homeY - p.y) * 0.012;

        // Amortiguación fluida
        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        // Orientar la cápsula hacia la dirección en la que viaja / sigue al mouse
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
        p.angle += angleDiff * 0.12;

        p.alpha += (targetAlpha - p.alpha) * 0.12;

        // Dibujar cápsula sutil y redondeada
        const currentLen = (p.length + Math.min(6, Math.sqrt(speedSq) * 1.5)) * stretch;
        const halfLen = currentLen * 0.5;
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);

        ctx.beginPath();
        ctx.moveTo(p.x - cos * halfLen, p.y - sin * halfLen);
        ctx.lineTo(p.x + cos * halfLen, p.y + sin * halfLen);
        ctx.strokeStyle = `rgba(${p.color}, ${p.alpha.toFixed(3)})`;
        ctx.lineWidth = p.size * 1.45;
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
