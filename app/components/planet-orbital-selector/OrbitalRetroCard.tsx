'use client';

import React from 'react';
import type { Level, StudentProgress } from '../../../shared/types';
import { LiquidGlass } from '../../../components/ui/glasscn/liquid-glass';
import {
  ORBITAL_UI_COPY,
  type OrbitalThemePalette,
} from '../../../lib/config/orbital-selector-config';

interface OrbitalRetroCardProps {
  level: Level;
  levelIndex: number;
  progress?: StudentProgress;
  isUnlocked: boolean;
  isSelected: boolean;
  isDark: boolean;
  theme: OrbitalThemePalette;
  onSelect: () => void;
  onLaunch: () => void;
}

function IconPlay({ className = 'w-2.5 h-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <polygon points="4.5,3 13,8 4.5,13" fill="currentColor" />
    </svg>
  );
}

function IconLock({ className = 'w-2.5 h-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.2"
        y="7.2"
        width="9.6"
        height="6.4"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 7.2V5.3C5.5 3.92 6.62 2.8 8 2.8C9.38 2.8 10.5 3.92 10.5 5.3V7.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGuardian({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.5L16.5 5.6V10.4C16.5 14.1 13.7 17.1 10 18C6.3 17.1 3.5 14.1 3.5 10.4V5.6L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.5L11.2 9L13.8 9.4L11.9 11.2L12.4 13.8L10 12.5L7.6 13.8L8.1 11.2L6.2 9.4L8.8 9L10 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconStar({ filled, className = 'w-3 h-3' }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.4L12.35 7.16L17.6 7.92L13.8 11.62L14.7 16.85L10 14.38L5.3 16.85L6.2 11.62L2.4 7.92L7.65 7.16L10 2.4Z"
        fill={filled ? '#FDE68A' : 'none'}
        stroke={filled ? '#F59E0B' : '#475569'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrbitalRetroCard({
  level,
  levelIndex,
  progress,
  isUnlocked,
  isSelected,
  isDark,
  theme,
  onSelect,
  onLaunch,
}: OrbitalRetroCardProps) {
  const palette = isDark ? theme.dark : theme.light;
  const isCompleted = progress?.status === 'completed';
  const formattedNumber = String(level.order).padStart(2, '0');
  const phaseCode = `${level.isBoss ? ORBITAL_UI_COPY.bossPrefix : ORBITAL_UI_COPY.phasePrefix}${formattedNumber}`;
  const sectorCode = `${ORBITAL_UI_COPY.sectorPrefix}${formattedNumber}`;

  // En la imagen de referencia, la misión disponible o enfocada muestra la tarjeta completa con subtítulo, 3 estrellas y botón INICIAR MISIÓN [ENTER].
  // Las misiones bloqueadas no seleccionadas se muestran en formato compacto técnico (Nivel 2 y Nivel 3 en la imagen).
  const showExpandedCard = isUnlocked || isSelected;
  const filledSegments = isCompleted ? 5 : isUnlocked ? (level.isBoss ? 5 : 3) : 0;
  const earnedStars = progress?.stars ?? 0;

  let statusLabel: string = ORBITAL_UI_COPY.statusLocked;
  if (isCompleted) {
    statusLabel = ORBITAL_UI_COPY.statusCompleted;
  } else if (isUnlocked) {
    statusLabel = level.isBoss ? ORBITAL_UI_COPY.statusGuardian : ORBITAL_UI_COPY.statusAvailable;
  }

  const handleCardClick = () => {
    onSelect();
    if (isUnlocked && isSelected) {
      onLaunch();
    }
  };

  if (!showExpandedCard) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`${level.name}, ${statusLabel}`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        className="group relative w-full md:w-[228px] lg:w-[244px] cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
      >
        <LiquidGlass
          blur={2}
          refraction={18}
          bezel={0.28}
          saturation={1.45}
          style={{
            backgroundColor: palette.mutedCardBg,
            borderColor: palette.mutedCardBorder,
          }}
          className="relative rounded-2xl border p-3.5 transition-all duration-200 hover:border-white/25"
        >
          {/* Esquinas técnicas sutiles */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1.5 left-1.5 h-2 w-2 rounded-tl-md border-t border-l border-white/15"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 rounded-tr-md border-t border-r border-white/15"
          />

          {/* Fila superior: código FASE-02 + badge BLOQUEADO */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full opacity-55"
                style={{ backgroundColor: isDark ? '#94A3B8' : '#64748B' }}
              />
              <span
                className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {phaseCode}
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-slate-400'
                  : 'border-slate-300/80 bg-slate-100/80 text-slate-600'
              }`}
            >
              <IconLock className="h-2.5 w-2.5 opacity-80" />
              <span>{statusLabel}</span>
            </span>
          </div>

          {/* Cuerpo compacto: recuadro NIVEL 02 + Título + 5 segmentos apagados */}
          <div className="mt-2.5 flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border ${
                isDark
                  ? 'border-white/12 bg-[#07101c]/80 text-slate-300'
                  : 'border-slate-300/80 bg-slate-100 text-slate-700'
              }`}
            >
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.14em] opacity-75">
                {ORBITAL_UI_COPY.levelBoxLabel}
              </span>
              <span className="mt-0.5 font-mono text-sm font-black leading-none tabular-nums">
                {formattedNumber}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className={`truncate text-sm font-bold leading-tight ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {level.name}
              </h3>

              {/* 5 segmentos de progreso inactivos */}
              <div className="mt-2 flex items-center gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((seg) => (
                  <span
                    key={seg}
                    className={`h-1 w-2.5 rounded-xs ${
                      isDark ? 'bg-white/15' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${level.name}: ${level.description}. Estado: ${statusLabel}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isUnlocked) {
            onLaunch();
          } else {
            onSelect();
          }
        }
      }}
      className="group relative w-full md:w-[276px] lg:w-[294px] cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
    >
      <LiquidGlass
        blur={2}
        refraction={24}
        bezel={0.36}
        saturation={1.68}
        style={{
          backgroundColor: isUnlocked ? palette.activeCardBg : palette.mutedCardBg,
          borderColor: isSelected || isUnlocked ? palette.activeCardBorder : palette.mutedCardBorder,
          boxShadow: isSelected || isUnlocked ? palette.activeCardShadow : undefined,
        }}
        className="relative rounded-2xl border p-4 transition-all duration-200"
      >
        {/* Esquinas técnicas del visor (HUD corners fieles a la referencia) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1.5 left-1.5 h-2.5 w-2.5 rounded-tl-md border-t-2 border-l-2"
          style={{ borderColor: isUnlocked ? theme.accentHex : 'rgba(255,255,255,0.22)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-tr-md border-t-2 border-r-2"
          style={{ borderColor: isUnlocked ? theme.accentHex : 'rgba(255,255,255,0.22)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 left-1.5 h-2.5 w-2.5 rounded-bl-md border-b-2 border-l-2"
          style={{ borderColor: isUnlocked ? theme.accentHex : 'rgba(255,255,255,0.22)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-br-md border-b-2 border-r-2"
          style={{ borderColor: isUnlocked ? theme.accentHex : 'rgba(255,255,255,0.22)' }}
        />

        {/* Fila 1: • FASE-01 + Píldora [ ▶ DISPONIBLE ] */}
        <div
          className={`flex items-center justify-between gap-2 pb-2.5 border-b ${
            isDark ? 'border-white/10' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: isUnlocked ? theme.accentBrightHex : '#94A3B8',
                boxShadow: isUnlocked ? `0 0 8px ${theme.accentBrightHex}` : undefined,
              }}
            />
            <span
              style={{ color: isUnlocked ? palette.badgeText : undefined }}
              className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                !isUnlocked ? (isDark ? 'text-slate-400' : 'text-slate-600') : ''
              }`}
            >
              {phaseCode}
            </span>
          </div>

          <span
            style={
              isUnlocked
                ? {
                    borderColor: palette.badgeBorder,
                    backgroundColor: palette.badgeBg,
                    color: palette.badgeText,
                  }
                : undefined
            }
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
              !isUnlocked
                ? isDark
                  ? 'border-white/15 bg-white/[0.04] text-slate-400'
                  : 'border-slate-300 bg-slate-100 text-slate-600'
                : ''
            }`}
          >
            {isUnlocked ? (
              level.isBoss ? (
                <IconGuardian className="h-3 w-3" />
              ) : (
                <IconPlay className="h-2.5 w-2.5" />
              )
            ) : (
              <IconLock className="h-2.5 w-2.5" />
            )}
            <span>{statusLabel}</span>
          </span>
        </div>

        {/* Fila 2: Recuadro NIVEL 01 + Título, subtítulo, 5 barras segmentadas y 3 estrellas */}
        <div className="mt-3 flex items-center gap-3.5">
          <div
            style={
              isUnlocked
                ? {
                    borderColor: palette.badgeBorder,
                    background: `radial-gradient(circle at 35% 30%, ${theme.accentBrightHex}26 0%, rgba(7, 19, 32, 0.88) 85%)`,
                  }
                : undefined
            }
            className={`flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-xl border ${
              isDark ? 'bg-[#071320]/90 text-white' : 'bg-slate-50 text-slate-900'
            } ${!isUnlocked ? (isDark ? 'border-white/15' : 'border-slate-300') : ''}`}
          >
            <span
              style={{ color: isUnlocked ? theme.accentHex : undefined }}
              className="font-mono text-[8px] font-bold uppercase tracking-[0.14em]"
            >
              {ORBITAL_UI_COPY.levelBoxLabel}
            </span>
            <span className="mt-0.5 font-mono text-lg font-black leading-none tabular-nums">
              {formattedNumber}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className={`truncate text-base font-black leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {level.name}
            </h3>
            <p
              className={`mt-0.5 truncate text-xs font-medium ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {level.description}
            </p>

            {/* Barra segmentada (5 bloques) + 3 Estrellas doradas a la derecha */}
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((seg) => {
                  const isLit = seg < filledSegments;
                  return (
                    <span
                      key={seg}
                      style={
                        isLit
                          ? {
                              backgroundColor: theme.accentHex,
                              boxShadow: `0 0 6px ${theme.accentBrightHex}`,
                            }
                          : undefined
                      }
                      className={`h-1.5 w-3 rounded-xs ${
                        !isLit ? (isDark ? 'bg-white/15' : 'bg-slate-300') : ''
                      }`}
                    />
                  );
                })}
              </div>

              <div
                className="flex items-center gap-0.5"
                aria-label={
                  isCompleted
                    ? `${earnedStars} de 3 estrellas obtenidas`
                    : '3 estrellas disponibles en esta misión'
                }
              >
                {[1, 2, 3].map((starNumber) => {
                  const starGold = isCompleted ? starNumber <= earnedStars : isUnlocked;
                  return <IconStar key={starNumber} filled={starGold} />;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 3 (Pie): SECTOR 01 + Botón [ ▶ INICIAR MISIÓN [ENTER] ] */}
        <div
          className={`mt-3.5 flex items-center justify-between gap-2 border-t pt-2.5 ${
            isDark ? 'border-white/10' : 'border-slate-200/80'
          }`}
        >
          <span
            className={`font-mono text-[9px] font-semibold uppercase tracking-[0.16em] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {sectorCode}
          </span>

          {isUnlocked ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLaunch();
              }}
              style={{
                borderColor: palette.ctaBorder,
                backgroundColor: palette.ctaBg,
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] cursor-pointer ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span style={{ color: theme.accentHex }}>
                <IconPlay className="h-2.5 w-2.5" />
              </span>
              <span>
                {isCompleted ? ORBITAL_UI_COPY.ctaReplay : ORBITAL_UI_COPY.ctaStart}
              </span>
              <span style={{ color: theme.accentHex }}>
                [{ORBITAL_UI_COPY.ctaKeyHint}]
              </span>
            </button>
          ) : (
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Completa el nivel {String(Math.max(1, levelIndex)).padStart(2, '0')}
            </span>
          )}
        </div>
      </LiquidGlass>
    </div>
  );
}
