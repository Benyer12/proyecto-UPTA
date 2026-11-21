'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const FondoCosmico = dynamic(() => import('./FondoCosmico'), { ssr: false });
const AntigravityParticles = dynamic(() => import('./components/AntigravityParticles'), { ssr: false });

const GLASS_SELECTOR =
  '.liquid-glass, .liquid-glass-pill, .liquid-glass-btn, .liquid-glass-dropdown, .liquid-glass-modal';

interface GlassState {
  // Ángulo de luz especular en el borde (174° en reposo, estilo Figma Glass)
  angle: number;
  targetAngle: number;
  // Intensidad activa (0..1)
  active: number;
  targetActive: number;
  // Variación suave del desenfoque (frost) al mover el cursor sobre el panel
  stretch: number;
  targetStretch: number;
  baseFrost: number;
}

const DEFAULT_ANGLE = 174;

function normalizeAngleDelta(target: number, current: number): number {
  let diff = ((target - current + 540) % 360) - 180;
  if (diff < -180) diff += 360;
  return diff;
}

function getPanelBaseFrost(el: HTMLElement): number {
  const cl = el.classList;
  if (cl.contains('liquid-glass-dropdown')) return 18;
  if (cl.contains('liquid-glass-modal')) return 18;
  if (cl.contains('liquid-glass-panel')) return 8;
  if (cl.contains('liquid-glass-btn')) return 5;
  if (cl.contains('liquid-glass-pill')) return 4;
  return 5;
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
        st = {
          angle: DEFAULT_ANGLE,
          targetAngle: DEFAULT_ANGLE,
          active: 0,
          targetActive: 0,
          stretch: 0,
          targetStretch: 0,
          baseFrost: getPanelBaseFrost(el),
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

        const angleDelta = normalizeAngleDelta(st.targetAngle, st.angle);
        st.angle += angleDelta * 0.09;

        st.active += (st.targetActive - st.active) * 0.1;
        st.stretch += (st.targetStretch - st.stretch) * 0.12;
        st.targetStretch *= 0.88;

        const currentBlur = st.baseFrost + st.stretch * 4.5;
        const rimOpacity = 0.72 + st.active * 0.28;

        el.style.setProperty('--light-angle', `${st.angle.toFixed(2)}deg`);
        el.style.setProperty('--glass-blur', `${currentBlur.toFixed(2)}px`);
        el.style.setProperty('--glass-rim-opacity', rimOpacity.toFixed(3));

        const settled =
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
      const proximityMargin = 80;

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
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const angleDeg = Math.atan2(relY - cy, relX - cx) * (180 / Math.PI) + 90;

          st.targetAngle = angleDeg;
          st.targetActive = inside ? 1 : 0.4;
          if (inside) {
            st.targetStretch = Math.max(st.targetStretch, pointerSpeed);
          }
          scheduleTick();
        } else if (states.has(el)) {
          const st = states.get(el)!;
          st.targetActive = 0;
          st.targetAngle = DEFAULT_ANGLE;
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
