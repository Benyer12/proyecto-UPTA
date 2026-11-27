'use client';

import type { ReactNode } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const PLACEMENT_CLASSES: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 group-hover/tip:-translate-y-0.5 group-focus-within/tip:-translate-y-0.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 group-hover/tip:translate-y-0.5 group-focus-within/tip:translate-y-0.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2 group-hover/tip:-translate-x-0.5 group-focus-within/tip:-translate-x-0.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2 group-hover/tip:translate-x-0.5 group-focus-within/tip:translate-x-0.5',
};

export default function GlassTooltip({
  label,
  placement = 'top',
  children,
  className = '',
}: {
  label?: string | null;
  placement?: TooltipPlacement;
  children: ReactNode;
  className?: string;
}) {
  if (!label) {
    return <>{children}</>;
  }

  return (
    <span className={`relative inline-flex group/tip ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[110] whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] font-semibold tracking-wide bg-[#080F22]/95 text-white border border-white/20 shadow-lg opacity-0 scale-95 transition-all duration-150 group-hover/tip:opacity-100 group-hover/tip:scale-100 group-focus-within/tip:opacity-100 group-focus-within/tip:scale-100 ${PLACEMENT_CLASSES[placement]}`}
        data-keep-light-text="true"
      >
        {label}
      </span>
    </span>
  );
}
