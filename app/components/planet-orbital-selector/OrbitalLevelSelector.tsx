'use client';

import React from 'react';
import { LiquidGlass } from '../../../components/ui/glasscn/liquid-glass';
import PlanetVisual from '../PlanetVisual';
import type { Course, Level, Planet, StudentProgress } from '../../../shared/types';
import {
  ORBITAL_UI_COPY,
  getOrbitalNodePlacements,
  getOrbitalTheme,
} from '../../../lib/config/orbital-selector-config';
import {
  isOrbitalLevelUnlocked,
  useOrbitalNavigation,
} from '../../../lib/hooks/useOrbitalNavigation';
import { OrbitalModuleTabs } from './OrbitalModuleTabs';
import { OrbitalRingsSvg } from './OrbitalRingsSvg';
import { OrbitalRetroCard } from './OrbitalRetroCard';

interface OrbitalLevelSelectorProps {
  planet: Planet;
  courses: Course[];
  progressMap: Record<number, StudentProgress>;
  isDark: boolean;
  onLaunchLevel: (level: Level) => void;
  onBackToMap: () => void;
}

export function OrbitalLevelSelector({
  planet,
  courses,
  progressMap,
  isDark,
  onLaunchLevel,
  onBackToMap,
}: OrbitalLevelSelectorProps) {
  const theme = getOrbitalTheme(planet.id);
  const palette = isDark ? theme.dark : theme.light;

  const {
    activeModuleIndex,
    activeCourse,
    activeLevels,
    selectedLevelIndex,
    selectModule,
    selectLevel,
  } = useOrbitalNavigation({
    planetId: planet.id,
    courses,
    progressMap,
    onLaunchLevel,
    onBackToMap,
  });

  const placements = getOrbitalNodePlacements(activeLevels.length);
  const unlockedFlags = activeLevels.map((lvl) =>
    isOrbitalLevelUnlocked(lvl, activeLevels, courses, progressMap)
  );

  if (!activeCourse) {
    return null;
  }

  return (
    <section
      aria-label={`Órbita de misiones de ${planet.name}`}
      data-orbital-selector="true"
      className="mx-auto w-full max-w-[1140px] px-3 sm:px-5"
    >
      <LiquidGlass
        blur={2}
        refraction={24}
        bezel={0.34}
        saturation={1.65}
        style={{
          backgroundColor: palette.panelBg,
          borderColor: palette.panelBorder,
          backgroundImage:
            'radial-gradient(120% 80% at 15% 6%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 40%, transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.24) 100%)',
        }}
        className="relative w-full overflow-hidden rounded-[28px] border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),inset_0_-16px_30px_-14px_rgba(180,220,255,0.16),0_26px_76px_-30px_rgba(0,0,0,0.78)]"
      >
        {/* Cabecera interna del marco LiquidGlass (fiel a la imagen de referencia) */}
        <OrbitalModuleTabs
          courses={courses}
          activeModuleIndex={activeModuleIndex}
          activeCourse={activeCourse}
          isDark={isDark}
          theme={theme}
          onSelectModule={selectModule}
          onBackToMap={onBackToMap}
        />

        {/* Escenario Orbital de Escritorio (md y superior) */}
        <div className="relative hidden h-[520px] w-full md:block lg:h-[540px]">
          {/* Anillos elípticos inclinados, anillo sólido interior y conectores con nodos romboidales */}
          <OrbitalRingsSvg
            theme={theme}
            isDark={isDark}
            placements={placements}
            selectedLevelIndex={selectedLevelIndex}
            unlockedFlags={unlockedFlags}
          />

          {/* Planeta Central con 100% de su color vibrante y brillo original */}
          <div className="pointer-events-none absolute left-1/2 top-[50.5%] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <PlanetVisual name={planet.name} />
          </div>

          {/* Píldora del nombre del planeta (NUMÉRIX / LETRALIA / NATURAE) sobre el borde inferior del anillo sólido */}
          <div className="pointer-events-none absolute left-1/2 top-[66.2%] z-20 -translate-x-1/2 -translate-y-1/2">
            <div
              style={{
                borderColor: palette.badgeBorder,
                backgroundColor: isDark
                  ? 'rgba(6, 17, 32, 0.94)'
                  : 'rgba(255, 255, 255, 0.94)',
                color: isDark ? theme.accentHex : palette.badgeText,
                boxShadow: `0 0 18px ${palette.planetHaloGlow}`,
              }}
              className="rounded-full border px-5 py-1 font-mono text-xs font-extrabold uppercase tracking-[0.22em]"
            >
              {planet.name}
            </div>
          </div>

          {/* Tarjetas Retro-Futuristas distribuidas en órbita */}
          {activeLevels.map((level, index) => {
            const node = placements[index] ?? placements[0];
            const isUnlocked = unlockedFlags[index];
            const isSelected = index === selectedLevelIndex;

            return (
              <div
                key={level.id}
                style={{
                  left: `${node.cardXPercent}%`,
                  top: `${node.cardYPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  isSelected ? 'z-30' : 'z-20'
                }`}
              >
                <OrbitalRetroCard
                  level={level}
                  levelIndex={index}
                  progress={progressMap[level.id]}
                  isUnlocked={isUnlocked}
                  isSelected={isSelected}
                  isDark={isDark}
                  theme={theme}
                  onSelect={() => selectLevel(index)}
                  onLaunch={() => onLaunchLevel(level)}
                />
              </div>
            );
          })}
        </div>

        {/* Vista Móvil (< md): Planeta vibrante + tarjetas apiladas sin colisiones */}
        <div className="flex flex-col items-center gap-4 px-4 pt-3 pb-6 md:hidden">
          <div className="relative flex flex-col items-center py-2">
            <PlanetVisual name={planet.name} className="scale-90" />
            <div
              style={{
                borderColor: palette.badgeBorder,
                backgroundColor: isDark
                  ? 'rgba(6, 17, 32, 0.94)'
                  : 'rgba(255, 255, 255, 0.94)',
                color: isDark ? theme.accentHex : palette.badgeText,
              }}
              className="mt-2 rounded-full border px-4 py-1 font-mono text-xs font-extrabold uppercase tracking-[0.2em]"
            >
              {planet.name}
            </div>
          </div>

          {activeLevels.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              {ORBITAL_UI_COPY.emptyLevelsMessage}
            </p>
          ) : (
            <div className="flex w-full flex-col gap-3">
              {activeLevels.map((level, index) => (
                <OrbitalRetroCard
                  key={level.id}
                  level={level}
                  levelIndex={index}
                  progress={progressMap[level.id]}
                  isUnlocked={unlockedFlags[index]}
                  isSelected={index === selectedLevelIndex}
                  isDark={isDark}
                  theme={theme}
                  onSelect={() => selectLevel(index)}
                  onLaunch={() => onLaunchLevel(level)}
                />
              ))}
            </div>
          )}
        </div>
      </LiquidGlass>
    </section>
  );
}
