'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '../lib/theme-store';

interface TornasolGlint {
  x: string;
  y: string;
  size: number;
  star?: boolean;
  color: string;
  core: string;
  peak: number;
  dur: string;
  delay: string;
}

// Destellos minuciosos y sutiles a lo largo de la curva 3D tornasol en modo oscuro
const DARK_GLINTS: TornasolGlint[] = [
  { x: '23%', y: '14%', size: 8, star: true, color: 'rgba(255, 255, 255, 0.92)', core: '#FFFFFF', peak: 0.72, dur: '6.2s', delay: '-0.8s' },
  { x: '16%', y: '27%', size: 3, color: 'rgba(253, 230, 138, 0.95)', core: '#FDE68A', peak: 0.65, dur: '5.4s', delay: '-2.1s' },
  { x: '13%', y: '41%', size: 7, star: true, color: 'rgba(251, 191, 36, 0.88)', core: '#FEF3C7', peak: 0.62, dur: '7.4s', delay: '-3.5s' },
  { x: '21%', y: '56%', size: 3, color: 'rgba(253, 224, 150, 0.9)', core: '#FDE68A', peak: 0.58, dur: '5.8s', delay: '-1.4s' },
  { x: '34%', y: '62%', size: 8, star: true, color: 'rgba(103, 232, 249, 0.92)', core: '#E0F2FE', peak: 0.68, dur: '6.8s', delay: '-4.2s' },
  { x: '43%', y: '47%', size: 3, color: 'rgba(255, 255, 255, 0.94)', core: '#FFFFFF', peak: 0.64, dur: '5.1s', delay: '-0.4s' },
  { x: '52%', y: '34%', size: 7, star: true, color: 'rgba(255, 255, 255, 0.94)', core: '#FFFFFF', peak: 0.7, dur: '7.8s', delay: '-5.1s' },
  { x: '61%', y: '22%', size: 3, color: 'rgba(253, 230, 138, 0.92)', core: '#FEF3C7', peak: 0.6, dur: '6.0s', delay: '-2.7s' },
  { x: '71%', y: '26%', size: 3, color: 'rgba(103, 232, 249, 0.94)', core: '#67E8F9', peak: 0.66, dur: '5.5s', delay: '-1.1s' },
  { x: '67%', y: '41%', size: 9, star: true, color: 'rgba(56, 189, 248, 0.95)', core: '#E0F2FE', peak: 0.74, dur: '6.9s', delay: '-3.0s' },
  { x: '58%', y: '49%', size: 3, color: 'rgba(103, 232, 249, 0.95)', core: '#A5F3FC', peak: 0.64, dur: '4.9s', delay: '-4.6s' },
  { x: '77%', y: '46%', size: 3, color: 'rgba(196, 181, 253, 0.9)', core: '#EDE9FE', peak: 0.58, dur: '7.1s', delay: '-0.9s' },
  { x: '81%', y: '60%', size: 7, star: true, color: 'rgba(110, 231, 183, 0.88)', core: '#D1FAE5', peak: 0.62, dur: '6.5s', delay: '-2.3s' },
  { x: '72%', y: '74%', size: 3, color: 'rgba(56, 189, 248, 0.95)', core: '#BAE6FD', peak: 0.68, dur: '5.7s', delay: '-3.8s' },
  { x: '64%', y: '86%', size: 8, star: true, color: 'rgba(103, 232, 249, 0.92)', core: '#FFFFFF', peak: 0.66, dur: '7.5s', delay: '-1.9s' },
  { x: '8%', y: '18%', size: 2, color: 'rgba(186, 230, 253, 0.75)', core: '#E0F2FE', peak: 0.44, dur: '8.2s', delay: '-5.4s' },
  { x: '87%', y: '21%', size: 2, color: 'rgba(196, 181, 253, 0.75)', core: '#EDE9FE', peak: 0.42, dur: '7.9s', delay: '-2.8s' },
  { x: '27%', y: '82%', size: 2, color: 'rgba(253, 230, 138, 0.72)', core: '#FEF3C7', peak: 0.44, dur: '8.4s', delay: '-4.7s' },
  { x: '88%', y: '81%', size: 2, color: 'rgba(103, 232, 249, 0.78)', core: '#CFFAFE', peak: 0.46, dur: '7.3s', delay: '-1.5s' },
  { x: '47%', y: '15%', size: 2, color: 'rgba(255, 255, 255, 0.75)', core: '#FFFFFF', peak: 0.4, dur: '8.6s', delay: '-6.0s' },
];

// Destellos minuciosos tornasol para nebulosa y cristal 3D en modo claro
const LIGHT_GLINTS: TornasolGlint[] = [
  { x: '16%', y: '72%', size: 8, star: true, color: 'rgba(255, 255, 255, 0.96)', core: '#FFFFFF', peak: 0.66, dur: '6.6s', delay: '-1.2s' },
  { x: '29%', y: '79%', size: 3, color: 'rgba(245, 180, 65, 0.92)', core: '#FEF3C7', peak: 0.56, dur: '5.6s', delay: '-3.1s' },
  { x: '39%', y: '67%', size: 7, star: true, color: 'rgba(217, 155, 38, 0.88)', core: '#FFFBEB', peak: 0.6, dur: '7.4s', delay: '-0.6s' },
  { x: '48%', y: '58%', size: 3, color: 'rgba(255, 255, 255, 0.96)', core: '#FFFFFF', peak: 0.62, dur: '5.2s', delay: '-4.0s' },
  { x: '57%', y: '47%', size: 9, star: true, color: 'rgba(251, 191, 36, 0.9)', core: '#FFFFFF', peak: 0.68, dur: '6.9s', delay: '-2.4s' },
  { x: '68%', y: '37%', size: 7, star: true, color: 'rgba(56, 189, 248, 0.86)', core: '#F0F9FF', peak: 0.6, dur: '7.6s', delay: '-5.2s' },
  { x: '77%', y: '39%', size: 3, color: 'rgba(139, 92, 246, 0.82)', core: '#F5F3FF', peak: 0.54, dur: '6.1s', delay: '-1.8s' },
  { x: '84%', y: '51%', size: 8, star: true, color: 'rgba(255, 255, 255, 0.96)', core: '#FFFFFF', peak: 0.64, dur: '6.4s', delay: '-3.7s' },
  { x: '71%', y: '62%', size: 3, color: 'rgba(245, 158, 11, 0.86)', core: '#FEF3C7', peak: 0.54, dur: '5.9s', delay: '-0.9s' },
  { x: '46%', y: '42%', size: 3, color: 'rgba(167, 139, 250, 0.85)', core: '#F5F3FF', peak: 0.52, dur: '7.2s', delay: '-4.4s' },
  { x: '62%', y: '27%', size: 3, color: 'rgba(253, 224, 71, 0.9)', core: '#FFFFFF', peak: 0.56, dur: '6.7s', delay: '-2.9s' },
  { x: '82%', y: '21%', size: 7, star: true, color: 'rgba(192, 132, 252, 0.84)', core: '#FFFFFF', peak: 0.58, dur: '7.9s', delay: '-1.5s' },
  { x: '23%', y: '58%', size: 3, color: 'rgba(56, 189, 248, 0.82)', core: '#E0F2FE', peak: 0.5, dur: '6.3s', delay: '-5.6s' },
  { x: '11%', y: '48%', size: 2, color: 'rgba(255, 255, 255, 0.9)', core: '#FFFFFF', peak: 0.48, dur: '8.1s', delay: '-2.0s' },
  { x: '53%', y: '72%', size: 2, color: 'rgba(245, 180, 65, 0.82)', core: '#FEF3C7', peak: 0.46, dur: '7.8s', delay: '-4.9s' },
  { x: '90%', y: '14%', size: 2, color: 'rgba(167, 139, 250, 0.8)', core: '#F5F3FF', peak: 0.44, dur: '8.4s', delay: '-3.3s' },
];

export default function FondoCosmico() {
  const pathname = usePathname();
  const theme = useThemeStore((s) => s.theme);

  // En los tableros de juego (pantalla completa) no dibujamos fondo debajo
  if (pathname?.startsWith('/juego/')) return null;

  const isLight = theme === 'light';
  const glints = isLight ? LIGHT_GLINTS : DARK_GLINTS;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none"
      style={{
        contain: 'strict',
        transform: 'translateZ(0)',
        background: isLight
          ? 'linear-gradient(135deg, #CBD6EE 0%, #D7D5EC 50%, #CED8EA 100%)'
          : 'radial-gradient(ellipse at 50% 44%, #040714 0%, #02040D 55%, #010105 100%)',
      }}
    >
      {/* Curva / Nebulosa 3D tornasol fija en un solo lugar, decodificada una sola vez en GPU */}
      <img
        src={isLight ? '/images/liquid-prism-light-bg.jpg' : '/images/liquid-prism-bg.jpg'}
        alt=""
        decoding="async"
        fetchPriority="high"
        className={`absolute inset-0 h-full w-full object-cover object-center ${
          isLight ? 'opacity-[0.98]' : 'mix-blend-screen opacity-95'
        }`}
      />

      {/* Destellos minuciosos, sutiles y elegantes del tornasol (solo opacity/transform en GPU) */}
      {glints.map((g, idx) => (
        <span
          key={`${isLight ? 'l' : 'd'}-${idx}`}
          className={`tornasol-glint ${g.star ? 'tornasol-glint-star' : ''}`}
          style={
            {
              left: g.x,
              top: g.y,
              width: `${g.size}px`,
              height: `${g.size}px`,
              '--glint-color': g.color,
              '--glint-peak': g.peak,
              '--glint-dur': g.dur,
              '--glint-delay': g.delay,
              background: g.star
                ? `radial-gradient(circle, ${g.core} 0%, ${g.color} 28%, transparent 72%)`
                : `radial-gradient(circle, ${g.core} 0%, ${g.color} 45%, transparent 100%)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
