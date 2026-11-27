'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Course, Level, StudentProgress } from '../../shared/types';
import { getLevelProgress } from '../mock-data';

interface UseOrbitalNavigationParams {
  planetId: number;
  courses: Course[];
  progressMap: Record<number, StudentProgress>;
  onLaunchLevel: (level: Level) => void;
  onBackToMap: () => void;
}

interface OrbitalSelectionOverride {
  planetId: number;
  moduleIndex?: number;
  levelIndex?: number;
}

export function isOrbitalLevelUnlocked(
  level: Level,
  courseLevels: Level[],
  allCourses: Course[],
  progressMap: Record<number, StudentProgress>
): boolean {
  const prog = progressMap[level.id] || getLevelProgress(level.id);
  if (prog.status !== 'locked') {
    return true;
  }

  const allLevelsOrdered = allCourses.flatMap((course) => course.levels);
  const globalIndex = allLevelsOrdered.findIndex((item) => item.id === level.id);
  if (globalIndex === 0) return true;

  if (globalIndex > 0) {
    const prevLevel = allLevelsOrdered[globalIndex - 1];
    const prevProg = prevLevel ? progressMap[prevLevel.id] || getLevelProgress(prevLevel.id) : null;
    if (prevProg?.status === 'completed') {
      return true;
    }
  }

  const localIndex = courseLevels.findIndex((item) => item.id === level.id);
  if (localIndex > 0) {
    const prevLocal = courseLevels[localIndex - 1];
    const prevLocalProg = prevLocal
      ? progressMap[prevLocal.id] || getLevelProgress(prevLocal.id)
      : null;
    if (prevLocalProg?.status === 'completed') {
      return true;
    }
  }

  return false;
}

function getDefaultOrbitalSelection(
  courses: Course[],
  progressMap: Record<number, StudentProgress>
): { moduleIndex: number; levelIndex: number } {
  if (courses.length === 0) {
    return { moduleIndex: 0, levelIndex: 0 };
  }

  for (let mIdx = 0; mIdx < courses.length; mIdx += 1) {
    const courseLevels = courses[mIdx].levels;
    for (let lIdx = 0; lIdx < courseLevels.length; lIdx += 1) {
      const lvl = courseLevels[lIdx];
      const unlocked = isOrbitalLevelUnlocked(lvl, courseLevels, courses, progressMap);
      const prog = progressMap[lvl.id] || getLevelProgress(lvl.id);
      if (unlocked && prog.status !== 'completed') {
        return { moduleIndex: mIdx, levelIndex: lIdx };
      }
    }
  }

  return { moduleIndex: 0, levelIndex: 0 };
}

const EMPTY_LEVELS: Level[] = [];

export function useOrbitalNavigation({
  planetId,
  courses,
  progressMap,
  onLaunchLevel,
  onBackToMap,
}: UseOrbitalNavigationParams) {
  const defaultSelection = getDefaultOrbitalSelection(courses, progressMap);

  const [override, setOverride] = useState<OrbitalSelectionOverride>({
    planetId,
  });

  const rawModuleIndex =
    override.planetId === planetId && typeof override.moduleIndex === 'number'
      ? override.moduleIndex
      : defaultSelection.moduleIndex;

  const activeModuleIndex =
    courses.length === 0
      ? 0
      : Math.min(Math.max(0, rawModuleIndex), courses.length - 1);

  const activeCourse = courses[activeModuleIndex] ?? courses[0] ?? null;
  const activeLevels = activeCourse ? activeCourse.levels : EMPTY_LEVELS;

  const rawLevelIndex =
    override.planetId === planetId && typeof override.levelIndex === 'number'
      ? override.levelIndex
      : defaultSelection.levelIndex;

  const selectedLevelIndex =
    activeLevels.length === 0
      ? 0
      : Math.min(Math.max(0, rawLevelIndex), activeLevels.length - 1);

  const selectModule = useCallback(
    (nextModuleIndex: number) => {
      if (courses.length === 0) return;
      const clamped = ((nextModuleIndex % courses.length) + courses.length) % courses.length;
      const targetLevels = courses[clamped]?.levels ?? [];
      let nextLevelIdx = 0;
      for (let i = 0; i < targetLevels.length; i += 1) {
        const unlocked = isOrbitalLevelUnlocked(
          targetLevels[i],
          targetLevels,
          courses,
          progressMap
        );
        const prog = progressMap[targetLevels[i].id] || getLevelProgress(targetLevels[i].id);
        if (unlocked && prog.status !== 'completed') {
          nextLevelIdx = i;
          break;
        }
      }

      setOverride({
        planetId,
        moduleIndex: clamped,
        levelIndex: nextLevelIdx,
      });
    },
    [courses, planetId, progressMap]
  );

  const selectLevel = useCallback(
    (nextLevelIndex: number) => {
      if (activeLevels.length === 0) return;
      const clamped =
        ((nextLevelIndex % activeLevels.length) + activeLevels.length) % activeLevels.length;
      setOverride((prev) => ({
        planetId,
        moduleIndex:
          prev.planetId === planetId && typeof prev.moduleIndex === 'number'
            ? prev.moduleIndex
            : activeModuleIndex,
        levelIndex: clamped,
      }));
    },
    [activeLevels.length, activeModuleIndex, planetId]
  );

  const cycleLevel = useCallback(
    (delta: 1 | -1) => {
      if (activeLevels.length === 0) return;
      selectLevel(selectedLevelIndex + delta);
    },
    [activeLevels.length, selectLevel, selectedLevelIndex]
  );

  const cycleModule = useCallback(
    (delta: 1 | -1) => {
      if (courses.length <= 1) return;
      selectModule(activeModuleIndex + delta);
    },
    [activeModuleIndex, courses.length, selectModule]
  );

  const triggerSelectedLevel = useCallback(() => {
    const level = activeLevels[selectedLevelIndex];
    if (!level) return;
    const unlocked = isOrbitalLevelUnlocked(level, activeLevels, courses, progressMap);
    if (unlocked) {
      onLaunchLevel(level);
    }
  }, [activeLevels, courses, onLaunchLevel, progressMap, selectedLevelIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable ||
          target.closest('[role="dialog"][aria-modal="true"]')
        ) {
          return;
        }
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onBackToMap();
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopImmediatePropagation();
        cycleLevel(1);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopImmediatePropagation();
        cycleLevel(-1);
        return;
      }

      if (event.key === 'PageDown') {
        if (courses.length > 1) {
          event.preventDefault();
          event.stopImmediatePropagation();
          cycleModule(1);
        }
        return;
      }

      if (event.key === 'PageUp') {
        if (courses.length > 1) {
          event.preventDefault();
          event.stopImmediatePropagation();
          cycleModule(-1);
        }
        return;
      }

      if (event.key === 'Enter') {
        if (target && target.closest('header')) {
          return;
        }
        if (target && target.closest('[data-orbital-module-tab="true"]')) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        triggerSelectedLevel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [courses.length, cycleLevel, cycleModule, onBackToMap, triggerSelectedLevel]);

  return {
    activeModuleIndex,
    activeCourse,
    activeLevels,
    selectedLevelIndex,
    selectModule,
    selectLevel,
    cycleLevel,
    cycleModule,
    triggerSelectedLevel,
  };
}
