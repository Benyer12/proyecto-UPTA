'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

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
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tipRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: -9999,
    left: -9999,
  });

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tipEl = tipRef.current;
    if (!triggerEl || !tipEl || typeof window === 'undefined') return;

    const r = triggerEl.getBoundingClientRect();
    const t = tipEl.getBoundingClientRect();
    const gap = 8;
    const margin = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0;
    let left = 0;

    if (placement === 'bottom') {
      top = r.bottom + gap;
      left = r.left + r.width / 2 - t.width / 2;
      if (top + t.height > vh - margin) {
        top = Math.max(margin, r.top - t.height - gap);
      }
    } else if (placement === 'left') {
      top = r.top + r.height / 2 - t.height / 2;
      left = r.left - t.width - gap;
      if (left < margin) {
        left = Math.min(vw - t.width - margin, r.right + gap);
      }
    } else if (placement === 'right') {
      top = r.top + r.height / 2 - t.height / 2;
      left = r.right + gap;
      if (left + t.width > vw - margin) {
        left = Math.max(margin, r.left - t.width - gap);
      }
    } else {
      // top (default)
      top = r.top - t.height - gap;
      left = r.left + r.width / 2 - t.width / 2;
      if (top < margin) {
        top = Math.min(vh - t.height - margin, r.bottom + gap);
      }
    }

    // Clamp strictly inside viewport bounds so it never gets cut off on left/right/top/bottom
    left = Math.max(margin, Math.min(left, vw - t.width - margin));
    top = Math.max(margin, Math.min(top, vh - t.height - margin));

    setCoords({ top, left });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, label, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open, updatePosition]);

  if (!label) {
    return <>{children}</>;
  }

  return (
    <span
      ref={triggerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={`relative inline-flex ${className}`}
    >
      {children}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="pointer-events-none max-w-[280px] sm:max-w-[340px] text-center leading-snug rounded-xl px-3 py-1.5 text-[11px] font-semibold tracking-wide bg-[#080F22]/95 text-white border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.75)] backdrop-blur-md"
            data-keep-light-text="true"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
