'use client';

import type { ReactNode } from 'react';

export default function ArcadeScreenFrame({
  className = 'w-full max-w-[440px] aspect-square',
  accentColor,
  glowColor,
  bgColor,
  onClick,
  children,
}: {
  className?: string;
  accentColor: string;
  glowColor: string;
  bgColor: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`${className} p-2 rounded-[26px] border border-white/15 bg-[#030712]/95 shrink-0`}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px ${accentColor}, 0 22px 54px -18px ${glowColor}`,
      }}
    >
      <div
        className="relative w-full h-full rounded-[18px] overflow-hidden ring-1 ring-inset ring-white/12"
        style={{
          backgroundColor: bgColor,
          clipPath: 'inset(0 round 18px)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
