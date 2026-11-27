'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import { useThemeStore } from '../lib/theme-store';

export interface LiquidGlassSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface LiquidGlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LiquidGlassSelectOption[];
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
}

export default function LiquidGlassSelect({
  value,
  onChange,
  options,
  ariaLabel = 'Seleccionar opción',
  placeholder = 'Seleccionar...',
  className = '',
}: LiquidGlassSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 220 });

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const prefersReducedMotion = useReducedMotion();
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const minW = Math.max(rect.width, 224);
    const maxLeft = Math.max(12, window.innerWidth - minW - 12);
    setMenuPos({
      top: rect.bottom + 8,
      left: Math.min(rect.left, maxLeft),
      width: minW,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);
      if (!clickedTrigger && !clickedMenu) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, updatePosition]);

  return (
    <div ref={triggerRef} className={`relative inline-block min-w-[210px] ${className}`}>
      <LiquidGlass
        blur={1.2}
        refraction={8}
        bezel={0.44}
        saturation={1.65}
        className={`rounded-full transition-all duration-200 ${
          isLight
            ? 'bg-white/[0.16] border-white/[0.78] hover:bg-white/[0.3]'
            : 'bg-white/[0.06] border-white/[0.2] hover:bg-white/[0.1] hover:border-white/[0.34]'
        }`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={ariaLabel}
          onClick={() => {
            if (!open) updatePosition();
            setOpen((prev) => !prev);
          }}
          className={`w-full min-h-[40px] px-4 py-2 flex items-center justify-between gap-3 text-xs sm:text-[13px] font-semibold cursor-pointer ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isLight ? 'text-slate-600' : 'text-white/75'
            } ${open ? 'rotate-180' : 'rotate-0'}`}
            aria-hidden="true"
          >
            <path
              d="M3.75 6L8 10.25L12.25 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </LiquidGlass>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                id={listboxId}
                role="listbox"
                aria-label={ariaLabel}
                style={{
                  position: 'fixed',
                  top: menuPos.top,
                  left: menuPos.left,
                  width: menuPos.width,
                  transformOrigin: 'top center',
                }}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: -6, scale: 0.97 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6, scale: 0.97 }
                }
                transition={{
                  duration: 0.17,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="z-[95] rounded-2xl will-change-transform"
              >
                <LiquidGlass
                  blur={14}
                  refraction={8}
                  bezel={0.36}
                  saturation={1.75}
                  readingPriority
                  className={`rounded-2xl p-1.5 ${
                    isLight
                      ? 'bg-white/[0.86] border-slate-900/[0.12] shadow-[0_24px_60px_-18px_rgba(15,23,42,0.2),inset_0_1px_0_0_rgba(255,255,255,0.98)]'
                      : 'bg-white/[0.08] border-white/[0.24] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.72),inset_0_1px_0_0_rgba(255,255,255,0.36)]'
                  }`}
                  style={{
                    backgroundImage: isLight
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(244,248,255,0.82) 100%)'
                      : 'linear-gradient(180deg, rgba(16,24,48,0.56) 0%, rgba(7,12,28,0.68) 100%)',
                  }}
                >
                  <div className="max-h-64 overflow-y-auto space-y-0.5">
                    {options.map((opt) => {
                      const active = opt.value === value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            onChange(opt.value);
                            setOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs sm:text-[13px] transition-all duration-150 cursor-pointer ${
                            isLight
                              ? active
                                ? 'bg-sky-500/[0.16] text-slate-950 font-bold'
                                : 'text-slate-700 hover:bg-white/[0.6] hover:text-slate-950 font-medium'
                              : active
                                ? 'bg-white/[0.16] text-white font-bold'
                                : 'text-white/80 hover:bg-white/[0.1] hover:text-white font-medium'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate">{opt.label}</div>
                            {opt.sublabel && (
                              <div
                                className={`text-[10px] truncate ${
                                  isLight ? 'text-slate-500' : 'text-white/55'
                                }`}
                              >
                                {opt.sublabel}
                              </div>
                            )}
                          </div>
                          {active && (
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isLight ? 'text-sky-600' : 'text-[#67E8F9]'
                              }`}
                              aria-hidden="true"
                            >
                              <path
                                d="M3.5 8.5L6.5 11.5L12.5 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </LiquidGlass>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
