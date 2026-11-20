'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const FondoCosmico = dynamic(() => import('./FondoCosmico'), { ssr: false });
const AntigravityParticles = dynamic(() => import('./components/AntigravityParticles'), { ssr: false });

const GLASS_SELECTOR =
  '.liquid-glass, .liquid-glass-pill, .liquid-glass-btn, .liquid-glass-dropdown, .liquid-glass-modal';

interface GlassState {
  // Posición primaria de luz líquida (%)
  lx: number;
  ly: number;
  // Posición secundaria con inercia (estela de dispersión cromática %)
  tx: number;
  ty: number;
  // Objetivo del mouse (%)
  targetX: number;
  targetY: number;
  // Ángulo de luz especular en grados (174° en reposo, estilo Figma Glass)
  angle: number;
  targetAngle: number;
  // Intensidad de fluidez activa (0..1)
  active: number;
  targetActive: number;
  // Velocidad del arrastre líquido para simular distorsión/desenfoque dinámico
  stretch: number;
  targetStretch: number;
  // Frost y brillo base según el tipo de panel
  baseFrost: number;
  baseBright: number;
}

const DEFAULT_ANGLE = 174;

function normalizeAngleDelta(target: number, current: number): number {
  let diff = ((target - current + 540) % 360) - 180;
  if (diff < -180) diff += 360;
  return diff;
}

function getPanelBaseOptics(el: HTMLElement): { baseFrost: number; baseBright: number } {
  const cl = el.classList;
  if (cl.contains('liquid-glass-dropdown')) return { baseFrost: 38, baseBright: 1.0 };
  if (cl.contains('liquid-glass-modal')) return { baseFrost: 36, baseBright: 1.0 };
  if (cl.contains('liquid-glass-panel')) return { baseFrost: 26, baseBright: 1.01 };
  if (cl.contains('liquid-glass-btn')) return { baseFrost: 12, baseBright: 1.04 };
  if (cl.contains('liquid-glass-pill')) return { baseFrost: 11, baseBright: 1.03 };
  return { baseFrost: 18, baseBright: 1.01 };
}

export default function FondoWrapper() {
  useEffect(() => {
    const states = new Map<HTMLElement, GlassState>();
    let rafId: number | null = null;
    let pointerX = -9999;
    let pointerY = -9999;
    let prevPointerX = -9999;
    let prevPointerY = -9999;

    const getOrCreateState = (el: HTMLElement): GlassState => {
      let st = states.get(el);
      if (!st) {
        const { baseFrost, baseBright } = getPanelBaseOptics(el);
        st = {
          lx: 50,
          ly: 50,
          tx: 50,
          ty: 50,
          targetX: 50,
          targetY: 50,
          angle: DEFAULT_ANGLE,
          targetAngle: DEFAULT_ANGLE,
          active: 0,
          targetActive: 0,
          stretch: 0,
          targetStretch: 0,
          baseFrost,
          baseBright,
        };
        states.set(el, st);
      }
      return st;
    };

    const tick = () => {
      rafId = null;
      let needsAnotherFrame = false;

      states.forEach((st, el) => {
        if (!el.isConnected) {
          states.delete(el);
          return;
        }

        // Interpolación viscosa tipo líquido (dos capas con diferente inercia)
        st.lx += (st.targetX - st.lx) * 0.11;
        st.ly += (st.targetY - st.ly) * 0.11;
        st.tx += (st.targetX - st.tx) * 0.055;
        st.ty += (st.targetY - st.ty) * 0.055;

        const angleDelta = normalizeAngleDelta(st.targetAngle, st.angle);
        st.angle += angleDelta * 0.09;

        st.active += (st.targetActive - st.active) * 0.1;
        st.stretch += (st.targetStretch - st.stretch) * 0.12;
        st.targetStretch *= 0.88;

        const currentBlur = st.baseFrost + st.stretch * 4.5;
        const currentBright = st.baseBright + st.active * 0.06;
        const rimOpacity = 0.68 + st.active * 0.32;
        const sheenOpacity = 0.06 + st.active * 0.94;

        el.style.setProperty('--lx', `${st.lx.toFixed(2)}%`);
        el.style.setProperty('--ly', `${st.ly.toFixed(2)}%`);
        el.style.setProperty('--tx1', `${(st.tx + 4).toFixed(2)}%`);
        el.style.setProperty('--ty1', `${(st.ty - 3).toFixed(2)}%`);
        el.style.setProperty('--tx2', `${(st.tx - 4).toFixed(2)}%`);
        el.style.setProperty('--ty2', `${(st.ty + 3).toFixed(2)}%`);
        el.style.setProperty('--light-angle', `${st.angle.toFixed(2)}deg`);
        el.style.setProperty('--glass-blur', `${currentBlur.toFixed(2)}px`);
        el.style.setProperty('--glass-bright', currentBright.toFixed(3));
        el.style.setProperty('--glass-rim-opacity', rimOpacity.toFixed(3));
        el.style.setProperty('--glass-sheen-opacity', sheenOpacity.toFixed(3));

        const settled =
          Math.abs(st.targetX - st.lx) < 0.08 &&
          Math.abs(st.targetY - st.ly) < 0.08 &&
          Math.abs(st.targetX - st.tx) < 0.08 &&
          Math.abs(st.targetY - st.ty) < 0.08 &&
          Math.abs(angleDelta) < 0.15 &&
          Math.abs(st.targetActive - st.active) < 0.005 &&
          st.stretch < 0.01;

        if (!settled) {
          needsAnotherFrame = true;
        } else if (st.targetActive === 0) {
          states.delete(el);
        }
      });

      if (needsAnotherFrame) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const dx = prevPointerX === -9999 ? 0 : e.clientX - prevPointerX;
      const dy = prevPointerY === -9999 ? 0 : e.clientY - prevPointerY;
      const pointerSpeed = Math.min(1, Math.hypot(dx, dy) / 35);

      pointerX = e.clientX;
      pointerY = e.clientY;
      prevPointerX = pointerX;
      prevPointerY = pointerY;

      const elements = document.querySelectorAll<HTMLElement>(GLASS_SELECTOR);
      const proximityMargin = 90;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inside =
          pointerX >= rect.left &&
          pointerX <= rect.right &&
          pointerY >= rect.top &&
          pointerY <= rect.bottom;

        const near =
          pointerX >= rect.left - proximityMargin &&
          pointerX <= rect.right + proximityMargin &&
          pointerY >= rect.top - proximityMargin &&
          pointerY <= rect.bottom + proximityMargin;

        if (inside || near) {
          const st = getOrCreateState(el);
          const relX = pointerX - rect.left;
          const relY = pointerY - rect.top;
          const pctX = Math.max(-10, Math.min(110, (relX / Math.max(1, rect.width)) * 100));
          const pctY = Math.max(-10, Math.min(110, (relY / Math.max(1, rect.height)) * 100));

          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const angleDeg = Math.atan2(relY - cy, relX - cx) * (180 / Math.PI) + 90;

          st.targetX = pctX;
          st.targetY = pctY;
          st.targetAngle = angleDeg;
          st.targetActive = inside ? 1 : 0.42;
          if (inside) {
            st.targetStretch = Math.max(st.targetStretch, pointerSpeed);
          }
          scheduleTick();
        } else if (states.has(el)) {
          const st = states.get(el)!;
          st.targetActive = 0;
          st.targetAngle = DEFAULT_ANGLE;
          st.targetX = 50;
          st.targetY = 50;
          scheduleTick();
        }
      });
    };

    const handlePointerLeave = () => {
      prevPointerX = -9999;
      prevPointerY = -9999;
      states.forEach((st) => {
        st.targetActive = 0;
        st.targetAngle = DEFAULT_ANGLE;
        st.targetX = 50;
        st.targetY = 50;
      });
      if (states.size > 0) scheduleTick();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
      states.clear();
    };
  }, []);

  return (
    <>
      <FondoCosmico />
      <AntigravityParticles />
    </>
  );
}
