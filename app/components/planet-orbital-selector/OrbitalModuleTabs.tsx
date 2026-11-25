'use client';

import React from 'react';
import type { Course } from '../../../shared/types';
import {
  ORBITAL_UI_COPY,
  type OrbitalThemePalette,
} from '../../../lib/config/orbital-selector-config';

interface OrbitalModuleTabsProps {
  courses: Course[];
  activeModuleIndex: number;
  activeCourse: Course;
  isDark: boolean;
  theme: OrbitalThemePalette;
  onSelectModule: (index: number) => void;
  onBackToMap: () => void;
}

function IconArrowLeft({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M19 12H5M12 19L5 12L12 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrbitalModuleTabs({
  courses,
  activeModuleIndex,
  activeCourse,
  isDark,
  theme,
  onSelectModule,
  onBackToMap,
}: OrbitalModuleTabsProps) {
  const palette = isDark ? theme.dark : theme.light;
  const levelsCount = activeCourse.levels.length;
  const levelsWord =
    levelsCount === 1
      ? ORBITAL_UI_COPY.singleLevelSuffix
      : ORBITAL_UI_COPY.levelsCountSuffix;

  return (
    <div className="relative z-20 flex flex-col gap-3 px-5 pt-5 pb-2 md:flex-row md:items-center md:justify-between md:px-8 md:pt-6">
      {/* Izquierda: Píldora ← Mapa Estelar [ESC] */}
      <div className="flex items-center justify-between md:justify-start">
        <button
          type="button"
          onClick={onBackToMap}
          style={{
            backgroundColor: palette.pillBg,
            borderColor: palette.pillBorder,
          }}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-150 hover:scale-[1.02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9] ${
            isDark
              ? 'text-slate-100 hover:border-white/30'
              : 'text-slate-800 hover:border-slate-400'
          }`}
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          <span>{ORBITAL_UI_COPY.backButtonText}</span>
          <span
            className={`font-mono text-[11px] ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            [{ORBITAL_UI_COPY.backKeyHint}]
          </span>
        </button>

        {/* Píldora temática visible en móvil a la derecha del botón volver */}
        <div
          style={{
            backgroundColor: palette.pillBg,
            borderColor: palette.pillBorder,
          }}
          className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs backdrop-blur-md md:hidden"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: theme.accentBrightHex,
              boxShadow: `0 0 8px ${theme.accentBrightHex}`,
            }}
          />
          <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
            {activeCourse.description}
          </span>
        </div>
      </div>

      {/* Centro: Insignia cuadrada 01 (/ 02 si hay varios módulos) + MÓDULO ORBITAL · N NIVELES + Título */}
      <div className="flex items-center justify-center gap-3.5">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Módulos orbitales">
          {courses.map((course, idx) => {
            const isSelected = idx === activeModuleIndex;
            const code = String(course.order).padStart(2, '0');
            return (
              <button
                key={course.id}
                type="button"
                role="tab"
                data-orbital-module-tab="true"
                aria-selected={isSelected}
                aria-label={`Módulo ${code}: ${course.name}`}
                onClick={() => onSelectModule(idx)}
                style={
                  isSelected
                    ? {
                        borderColor: palette.badgeBorder,
                        backgroundColor: isDark ? 'rgba(10, 25, 42, 0.92)' : palette.badgeBg,
                        color: theme.accentHex,
                        boxShadow: `0 0 16px ${palette.planetHaloGlow}`,
                      }
                    : {
                        borderColor: palette.pillBorder,
                        backgroundColor: palette.pillBg,
                      }
                }
                className={`flex h-10 w-10 items-center justify-center rounded-xl border font-mono text-xs font-black tabular-nums transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9] ${
                  !isSelected
                    ? isDark
                      ? 'text-slate-400 hover:border-white/30 hover:text-slate-200'
                      : 'text-slate-500 hover:border-slate-400 hover:text-slate-800'
                    : ''
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>

        <div className="text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {ORBITAL_UI_COPY.moduleHeaderPrefix} · {levelsCount} {levelsWord}
            </span>
            <span
              aria-hidden="true"
              className={`inline-block h-px w-5 ${
                isDark ? 'bg-slate-500/60' : 'bg-slate-400/70'
              }`}
            />
          </div>
          <h1
            className={`text-lg font-black tracking-tight md:text-xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {activeCourse.name}
          </h1>
        </div>
      </div>

      {/* Derecha (Desktop): Píldora temática • Sumas y restas básicas */}
      <div className="hidden md:flex md:items-center md:justify-end">
        <div
          style={{
            backgroundColor: palette.pillBg,
            borderColor: palette.pillBorder,
          }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-md"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: theme.accentBrightHex,
              boxShadow: `0 0 8px ${theme.accentBrightHex}`,
            }}
          />
          <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
            {activeCourse.description}
          </span>
        </div>
      </div>
    </div>
  );
}
