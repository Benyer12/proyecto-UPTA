'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type LiquidGlassToastVariant =
  | 'activated'
  | 'deactivated'
  | 'saved'
  | 'pending'
  | 'blocked'
  | 'error';

export interface LiquidGlassToastData {
  id: number;
  variant: LiquidGlassToastVariant;
  eyebrow?: string;
  title: string;
  message: string;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface VariantTheme {
  defaultEyebrow: string;
  outerBorder: string;
  innerBg: string;
  accentGlow: string;
  barGradient: string;
  eyebrowColor: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  pulseColor: string;
}

const VARIANT_THEMES: Record<LiquidGlassToastVariant, VariantTheme> = {
  activated: {
    defaultEyebrow: 'ESTADO ACTUALIZADO · ACTIVO',
    outerBorder:
      'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(52,211,153,0.78) 38%, rgba(255,255,255,0.18) 72%, rgba(16,185,129,0.72) 100%)',
    innerBg:
      'linear-gradient(155deg, rgba(16, 185, 129, 0.24) 0%, rgba(10, 26, 36, 0.84) 48%, rgba(5, 12, 24, 0.92) 100%)',
    accentGlow: 'rgba(16, 185, 129, 0.42)',
    barGradient: 'linear-gradient(90deg, #34D399 0%, #6EE7B7 55%, #A7F3D0 100%)',
    eyebrowColor: '#6EE7B7',
    iconBg: 'linear-gradient(145deg, rgba(16, 185, 129, 0.36) 0%, rgba(6, 78, 59, 0.55) 100%)',
    iconBorder: 'rgba(110, 231, 183, 0.65)',
    iconColor: '#A7F3D0',
    pulseColor: 'rgba(52, 211, 153, 0.45)',
  },
  deactivated: {
    defaultEyebrow: 'ESTADO ACTUALIZADO · INACTIVO',
    outerBorder:
      'linear-gradient(135deg, rgba(255,255,255,0.68) 0%, rgba(251,113,133,0.82) 38%, rgba(255,255,255,0.16) 72%, rgba(245,158,11,0.65) 100%)',
    innerBg:
      'linear-gradient(155deg, rgba(244, 63, 94, 0.24) 0%, rgba(36, 14, 28, 0.86) 48%, rgba(14, 8, 20, 0.93) 100%)',
    accentGlow: 'rgba(244, 63, 94, 0.42)',
    barGradient: 'linear-gradient(90deg, #FB7185 0%, #F43F5E 55%, #FDBA74 100%)',
    eyebrowColor: '#FDA4AF',
    iconBg: 'linear-gradient(145deg, rgba(244, 63, 94, 0.36) 0%, rgba(136, 19, 55, 0.58) 100%)',
    iconBorder: 'rgba(253, 164, 175, 0.68)',
    iconColor: '#FFE4E6',
    pulseColor: 'rgba(244, 63, 94, 0.45)',
  },
  saved: {
    defaultEyebrow: 'REGISTRO SINCRONIZADO',
    outerBorder:
      'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(147,197,253,0.75) 38%, rgba(255,255,255,0.16) 72%, rgba(192,132,252,0.72) 100%)',
    innerBg:
      'linear-gradient(155deg, rgba(99, 102, 241, 0.24) 0%, rgba(15, 22, 48, 0.86) 48%, rgba(7, 11, 26, 0.93) 100%)',
    accentGlow: 'rgba(139, 92, 246, 0.4)',
    barGradient: 'linear-gradient(90deg, #93C5FD 0%, #C084FC 55%, #6EE7B7 100%)',
    eyebrowColor: '#BFDBFE',
    iconBg: 'linear-gradient(145deg, rgba(99, 102, 241, 0.38) 0%, rgba(49, 46, 129, 0.6) 100%)',
    iconBorder: 'rgba(191, 219, 254, 0.65)',
    iconColor: '#E0F2FE',
    pulseColor: 'rgba(147, 197, 253, 0.42)',
  },
  pending: {
    defaultEyebrow: 'SOLICITUDES PENDIENTES',
    outerBorder:
      'linear-gradient(135deg, rgba(255,255,255,0.76) 0%, rgba(251,191,36,0.82) 36%, rgba(192,132,252,0.62) 68%, rgba(245,158,11,0.78) 100%)',
    innerBg:
      'linear-gradient(155deg, rgba(217, 119, 6, 0.24) 0%, rgba(30, 20, 52, 0.88) 46%, rgba(10, 10, 26, 0.94) 100%)',
    accentGlow: 'rgba(245, 158, 11, 0.44)',
    barGradient: 'linear-gradient(90deg, #FBBF24 0%, #C084FC 58%, #93C5FD 100%)',
    eyebrowColor: '#FDE68A',
    iconBg: 'linear-gradient(145deg, rgba(245, 158, 11, 0.36) 0%, rgba(109, 40, 217, 0.56) 100%)',
    iconBorder: 'rgba(253, 230, 138, 0.72)',
    iconColor: '#FEF3C7',
    pulseColor: 'rgba(251, 191, 36, 0.5)',
  },
  blocked: {
    defaultEyebrow: 'ACCESO RESTRINGIDO · CUENTA INACTIVA',
    outerBorder:
      'linear-gradient(135deg, rgba(255,255,255,0.76) 0%, rgba(244,63,94,0.86) 35%, rgba(192,132,252,0.58) 68%, rgba(251,113,133,0.82) 100%)',
    innerBg:
      'linear-gradient(155deg, rgba(190, 18, 60, 0.3) 0%, rgba(30, 14, 38, 0.88) 46%, rgba(10, 8, 22, 0.94) 100%)',
    accentGlow: 'rgba(244, 63, 94, 0.5)',
    barGradient: 'linear-gradient(90deg, #F43F5E 0%, #E879F9 55%, #FDA4AF 100%)',
    eyebrowColor: '#FDA4AF',
    iconBg: 'linear-gradient(145deg, rgba(225, 29, 72, 0.42) 0%, rgba(88, 28, 135, 0.62) 100%)',
    iconBorder: 'rgba(253, 164, 175, 0.78)',
    iconColor: '#FFF1F2',
    pulseColor: 'rgba(244, 63, 94, 0.52)',
  },
  error: {
    defaultEyebrow: 'ERROR DE OPERACIÓN',
    outerBorder:
      'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(248,113,113,0.8) 40%, rgba(255,255,255,0.16) 75%, rgba(239,68,68,0.75) 100%)',
    innerBg:
      'linear-gradient(155deg, rgba(239, 68, 68, 0.24) 0%, rgba(34, 14, 24, 0.87) 48%, rgba(12, 8, 18, 0.93) 100%)',
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    barGradient: 'linear-gradient(90deg, #F87171 0%, #EF4444 100%)',
    eyebrowColor: '#FCA5A5',
    iconBg: 'linear-gradient(145deg, rgba(239, 68, 68, 0.35) 0%, rgba(127, 29, 29, 0.58) 100%)',
    iconBorder: 'rgba(252, 165, 165, 0.65)',
    iconColor: '#FEE2E2',
    pulseColor: 'rgba(239, 68, 68, 0.42)',
  },
};

function ToastIcon({ variant, color }: { variant: LiquidGlassToastVariant; color: string }) {
  if (variant === 'activated') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.75L4.75 5.85V11.6C4.75 16.25 7.82 20.42 12 21.75C16.18 20.42 19.25 16.25 19.25 11.6V5.85L12 2.75Z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8.75 12.1L10.95 14.3L15.45 9.8"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'deactivated') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.75L4.75 5.85V11.6C4.75 16.25 7.82 20.42 12 21.75C16.18 20.42 19.25 16.25 19.25 11.6V5.85L12 2.75Z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.25 9.25L14.75 14.75M14.75 9.25L9.25 14.75"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === 'blocked') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="5.25"
          y="10.75"
          width="13.5"
          height="9.5"
          rx="2.5"
          stroke={color}
          strokeWidth="1.85"
        />
        <path
          d="M8.5 10.75V7.75C8.5 5.82 10.07 4.25 12 4.25C13.93 4.25 15.5 5.82 15.5 7.75V10.75"
          stroke={color}
          strokeWidth="1.85"
          strokeLinecap="round"
        />
        <circle cx="12" cy="15.2" r="1.45" fill={color} />
      </svg>
    );
  }

  if (variant === 'pending') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15.5 19.25V17.75C15.5 15.82 13.93 14.25 12 14.25H7.5C5.57 14.25 4 15.82 4 17.75V19.25"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="9.75" cy="8.75" r="3.25" stroke={color} strokeWidth="1.8" />
        <circle cx="17.75" cy="10.25" r="3.5" stroke={color} strokeWidth="1.75" />
        <path
          d="M17.75 8.5V10.4L19 11.15"
          stroke={color}
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'saved') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
        <path
          d="M8.5 12.2L10.85 14.55L15.65 9.75"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <path d="M12 8V12.6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.1" fill={color} />
    </svg>
  );
}

export default function LiquidGlassToast({
  toast,
  onClose,
}: {
  toast: LiquidGlassToastData | null;
  onClose: () => void;
}) {
  const durationMs = toast?.durationMs ?? (toast?.variant === 'blocked' ? 6800 : 4800);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [toast, durationMs, onClose]);

  const theme = toast ? VARIANT_THEMES[toast.variant] : null;

  return (
    <div
      data-liquid-toast="true"
      className="pointer-events-none fixed top-20 right-4 sm:right-6 z-[200] flex flex-col items-end max-w-[calc(100vw-2rem)] sm:max-w-[430px] w-full"
      aria-live="assertive"
      role="status"
    >
      <AnimatePresence mode="wait">
        {toast && theme && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 56, y: -6, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 42, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 330, damping: 28, mass: 0.9 }}
            className="pointer-events-auto relative w-full rounded-[22px] p-[1.5px]"
            style={{
              background: theme.outerBorder,
              boxShadow: `0 26px 64px -12px rgba(0, 0, 0, 0.86), 0 0 42px -8px ${theme.accentGlow}`,
            }}
          >
            {/* Superficie principal en Liquid Glass intenso */}
            <div
              className="relative overflow-hidden rounded-[20.5px] px-4 py-4 sm:px-5 sm:py-4"
              style={{
                background: theme.innerBg,
                backdropFilter: 'blur(42px) saturate(225%)',
                WebkitBackdropFilter: 'blur(42px) saturate(225%)',
                boxShadow:
                  'inset 0 1.5px 1px rgba(255, 255, 255, 0.42), inset 0 -10px 24px rgba(0, 0, 0, 0.42)',
              }}
            >
              {/* Reflejo especular óptico en movimiento */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 -skew-x-12"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.14) 50%, transparent 100%)',
                }}
                animate={{ x: ['-40%', '310%'] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  repeatDelay: 1.4,
                  ease: 'easeInOut',
                }}
              />

              {/* Línea lateral de estado */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                style={{
                  background: theme.barGradient,
                  boxShadow: `0 0 14px ${theme.accentGlow}`,
                }}
              />

              <div className="relative z-10 flex items-start gap-3.5 pl-1.5">
                {/* Emblema vectorial en cristal biselado con pulso sutil */}
                <div className="relative shrink-0 mt-0.5">
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ border: `1.5px solid ${theme.pulseColor}` }}
                    animate={{ scale: [1, 1.24, 1], opacity: [0.65, 0, 0.65] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div
                    className="relative w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: theme.iconBg,
                      border: `1px solid ${theme.iconBorder}`,
                      boxShadow: `inset 0 1px 1px rgba(255,255,255,0.45), 0 8px 18px -6px ${theme.accentGlow}`,
                    }}
                  >
                    <ToastIcon variant={toast.variant} color={theme.iconColor} />
                  </div>
                </div>

                {/* Contenido tipográfico limpio y profesional */}
                <div className="min-w-0 flex-1 pr-1">
                  <div
                    className="text-[10px] font-extrabold uppercase tracking-[0.2em] leading-none mb-1.5"
                    style={{ color: theme.eyebrowColor }}
                  >
                    {toast.eyebrow ?? theme.defaultEyebrow}
                  </div>
                  <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-tight leading-snug">
                    {toast.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-200/90 leading-relaxed mt-1 font-normal">
                    {toast.message}
                  </p>
                  {toast.actionLabel && toast.onAction && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.onAction?.();
                        onClose();
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: `1px solid ${theme.iconBorder}`,
                        color: theme.iconColor,
                      }}
                    >
                      <span>{toast.actionLabel}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path
                          d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Botón de cierre minimalista SVG */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar notificación"
                  className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-slate-300/80 hover:text-white hover:bg-white/12 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3.25 3.25L10.75 10.75M10.75 3.25L3.25 10.75"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Barra de progreso de tiempo restante */}
              <div className="relative z-10 mt-3.5 h-[2.5px] w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  key={`bar-${toast.id}`}
                  className="h-full origin-left rounded-full"
                  style={{ background: theme.barGradient }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: durationMs / 1000, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
