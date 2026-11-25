'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

// 3 progressive symmetric 19x21 Pac-Man mazes:
// '#' = wall, '.' = pellet, 'o' = power pellet, '-' = ghost house gate,
// 'G' = inside ghost house, 'F' = fruit/bonus spawn, 'P' = Pac-Man spawn, ' ' = empty/tunnel
const MAX_LEVEL = 3;

const MAZE_LEVELS: Array<{
  level: number;
  nombre: string;
  wallStroke: string;
  wallFill: string;
  wallGlow: string;
  grid: string[];
}> = [
  {
    level: 1,
    nombre: 'Laberinto Clásico',
    wallStroke: '#2563EB',
    wallFill: 'rgba(29, 78, 216, 0.14)',
    wallGlow: 'rgba(59, 130, 246, 0.55)',
    grid: [
      '###################',
      '#........#........#',
      '#o##.###.#.###.##o#',
      '#.................#',
      '#.##.#.#####.#.##.#',
      '#....#...#...#....#',
      '####.### # ###.####',
      '   #.#       #.#   ',
      '####.# ##-## #.####',
      '    .  #GGG#  .    ',
      '####.# ##### #.####',
      '   #.#   F   #.#   ',
      '####.# ##### #.####',
      '#........#........#',
      '#.##.###.#.###.##.#',
      '#o.#.....P.....#.o#',
      '##.#.#.#####.#.#.##',
      '#....#...#...#....#',
      '#.######.#.######.#',
      '#.................#',
      '###################',
    ],
  },
  {
    level: 2,
    nombre: 'Laberinto Galáctico',
    wallStroke: '#8B5CF6',
    wallFill: 'rgba(139, 92, 246, 0.15)',
    wallGlow: 'rgba(167, 139, 250, 0.55)',
    grid: [
      '###################',
      '#o....#.....#....o#',
      '#.###.#.###.#.###.#',
      '#.................#',
      '###.#.#######.#.###',
      '#...#....#....#...#',
      '#.#.#### # ####.#.#',
      '#.#.#         #.#.#',
      '#...#  ##-##  #...#',
      '   .   #GGG#   .   ',
      '#...#  #####  #...#',
      '#.#.#    F    #.#.#',
      '#.#.### ### ###.#.#',
      '#.................#',
      '#.###.#.###.#.###.#',
      '#o..#....P....#..o#',
      '###.#.#######.#.###',
      '#.................#',
      '#.##.###.#.###.##.#',
      '#.................#',
      '###################',
    ],
  },
  {
    level: 3,
    nombre: 'Laberinto Maestro',
    wallStroke: '#10B981',
    wallFill: 'rgba(16, 185, 129, 0.14)',
    wallGlow: 'rgba(52, 211, 153, 0.55)',
    grid: [
      '###################',
      '#o.......#.......o#',
      '#.##.###.#.###.##.#',
      '#.#..#.......#..#.#',
      '#.##.#.#####.#.##.#',
      '#........#........#',
      '####.### # ###.####',
      '   #.#       #.#   ',
      '####.# ##-## #.####',
      '   .   #GGG#   .   ',
      '####.# ##### #.####',
      '   #.#   F   #.#   ',
      '####.# ##### #.####',
      '#.................#',
      '#.##.#.#####.#.##.#',
      '#o...#...P...#...o#',
      '####.###.#.###.####',
      '#....#.......#....#',
      '#.##.#.#####.#.##.#',
      '#.................#',
      '###################',
    ],
  },
];

const ROWS = MAZE_LEVELS[0].grid.length;
const COLS = MAZE_LEVELS[0].grid[0].length;
const CELL = 24;
const W = COLS * CELL; // 456
const H = ROWS * CELL; // 504

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const DIR_VEC: Record<Dir, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

type GhostMode = 'house' | 'active' | 'frightened' | 'eaten';

interface Ghost {
  id: number;
  name: string;
  x: number; // floating grid coordinate (center of tile = col + 0.5, wait: let's store integer-aligned tile coords as floats 0..COLS-1!)
  y: number;
  dir: Dir;
  color: string;
  mode: GhostMode;
  releaseAtMs: number;
  scatterTarget: { x: number; y: number };
  lastDecisionTile: string;
}

interface FloatingPopup {
  x: number;
  y: number;
  text: string;
  color: string;
  untilMs: number;
}

function getMazeConfig(level: number) {
  return MAZE_LEVELS[Math.max(0, Math.min(MAZE_LEVELS.length - 1, level - 1))];
}

function buildMazeGrid(level = 1): string[][] {
  return getMazeConfig(level).grid.map((row) => row.split(''));
}

function isWallTile(grid: string[][], col: number, row: number): boolean {
  if (row < 0 || row >= ROWS) return true;
  if (col < 0 || col >= COLS) return false; // side tunnel
  return grid[row][col] === '#';
}

function canEntityEnter(grid: string[][], col: number, row: number, allowGate: boolean): boolean {
  if (row < 0 || row >= ROWS) return false;
  if (col < 0 || col >= COLS) return true; // tunnel wrap
  const ch = grid[row][col];
  if (ch === '#') return false;
  if (ch === '-' && !allowGate) return false;
  if (ch === 'G' && !allowGate) return false;
  return true;
}

function findSpawns(now: number, level = 1) {
  const tpl = getMazeConfig(level).grid;
  let pac = { x: 9, y: 15 };
  let gate = { x: 9, y: 8 };
  let fruit = { x: 9, y: 11 };
  const houseSlots: Array<{ x: number; y: number }> = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = tpl[r][c];
      if (ch === 'P') pac = { x: c, y: r };
      else if (ch === '-') gate = { x: c, y: r };
      else if (ch === 'F') fruit = { x: c, y: r };
      else if (ch === 'G') houseSlots.push({ x: c, y: r });
    }
  }

  const ghosts: Ghost[] = [
    {
      id: 0,
      name: 'Blinky',
      x: gate.x,
      y: gate.y - 1, // Starts just outside ghost house like original!
      dir: 'LEFT',
      color: '#EF4444',
      mode: 'active',
      releaseAtMs: now,
      scatterTarget: { x: COLS - 2, y: 1 },
      lastDecisionTile: '',
    },
    {
      id: 1,
      name: 'Pinky',
      x: houseSlots[1]?.x ?? gate.x,
      y: houseSlots[1]?.y ?? gate.y + 1,
      dir: 'UP',
      color: '#F472B6',
      mode: 'house',
      releaseAtMs: now + 1800,
      scatterTarget: { x: 1, y: 1 },
      lastDecisionTile: '',
    },
    {
      id: 2,
      name: 'Inky',
      x: houseSlots[0]?.x ?? gate.x - 1,
      y: houseSlots[0]?.y ?? gate.y + 1,
      dir: 'UP',
      color: '#22D3EE',
      mode: 'house',
      releaseAtMs: now + 4500,
      scatterTarget: { x: COLS - 2, y: ROWS - 2 },
      lastDecisionTile: '',
    },
    {
      id: 3,
      name: 'Clyde',
      x: houseSlots[2]?.x ?? gate.x + 1,
      y: houseSlots[2]?.y ?? gate.y + 1,
      dir: 'UP',
      color: '#FB923C',
      mode: 'house',
      releaseAtMs: now + 7500,
      scatterTarget: { x: 1, y: ROWS - 2 },
      lastDecisionTile: '',
    },
  ];

  return { pac, gate, fruit, ghosts };
}

function countRemainingPellets(grid: string[][]): number {
  let total = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === '.' || grid[r][c] === 'o') total += 1;
    }
  }
  return total;
}

export default function PacmanArcadeGame({
  initialBestScore = 0,
  initialAttempts = 0,
  onGameFinished,
  onBack,
}: {
  initialBestScore?: number;
  initialAttempts?: number;
  onGameFinished?: (result: ResultadoPartidaInput) => void;
  onBack: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [levelBanner, setLevelBanner] = useState<string | null>(null);
  const [ghostsEaten, setGhostsEaten] = useState(0);
  const [frightTimerUI, setFrightTimerUI] = useState(0);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const initialSpawns = findSpawns(Date.now(), 1);
  const gridRef = useRef<string[][]>(buildMazeGrid(1));
  const gateRef = useRef(initialSpawns.gate);
  const fruitPosRef = useRef(initialSpawns.fruit);
  const pacRef = useRef({
    x: initialSpawns.pac.x,
    y: initialSpawns.pac.y,
    dir: 'LEFT' as Dir,
    nextDir: 'LEFT' as Dir,
    moving: true,
  });
  const ghostsRef = useRef<Ghost[]>(initialSpawns.ghosts);
  const frightUntilRef = useRef(0);
  const eatComboRef = useRef(0);
  const fruitVisibleUntilRef = useRef(0);
  const fruitSpawnedThisLevelRef = useRef(false);
  const pelletsEatenRef = useRef(0);
  const popupsRef = useRef<FloatingPopup[]>([]);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const ghostsEatenRef = useRef(0);
  const bestRef = useRef(initialBestScore);
  const startBestRef = useRef(initialBestScore);
  const matchStartRef = useRef(Date.now());
  const reportedRef = useRef(false);
  const onFinishRef = useRef(onGameFinished);
  onFinishRef.current = onGameFinished;

  useEffect(() => {
    setBestScore((prev) => Math.max(prev, initialBestScore));
    bestRef.current = Math.max(bestRef.current, initialBestScore);
  }, [initialBestScore]);

  useEffect(() => {
    setAttempts((prev) => Math.max(prev, initialAttempts));
  }, [initialAttempts]);

  const draw = useCallback((nowMs: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== W * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Classic arcade pure black space
    ctx.fillStyle = '#02040D';
    ctx.fillRect(0, 0, W, H);

    const grid = gridRef.current;
    const mazeTheme = getMazeConfig(levelRef.current);

    // 1. Classic continuous neon maze walls (color changes per level!)
    ctx.strokeStyle = mazeTheme.wallStroke;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.shadowColor = mazeTheme.wallGlow;
    ctx.shadowBlur = 4;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = grid[r][c];
        const px = c * CELL;
        const py = r * CELL;

        if (ch === '#') {
          const topOpen = !isWallTile(grid, c, r - 1);
          const bottomOpen = !isWallTile(grid, c, r + 1);
          const leftOpen = !isWallTile(grid, c - 1, r);
          const rightOpen = !isWallTile(grid, c + 1, r);

          ctx.fillStyle = mazeTheme.wallFill;
          ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);

          const inset = 3;
          ctx.beginPath();
          if (topOpen) {
            ctx.moveTo(px + (leftOpen ? inset : 0), py + inset);
            ctx.lineTo(px + CELL - (rightOpen ? inset : 0), py + inset);
          }
          if (bottomOpen) {
            ctx.moveTo(px + (leftOpen ? inset : 0), py + CELL - inset);
            ctx.lineTo(px + CELL - (rightOpen ? inset : 0), py + CELL - inset);
          }
          if (leftOpen) {
            ctx.moveTo(px + inset, py + (topOpen ? inset : 0));
            ctx.lineTo(px + inset, py + CELL - (bottomOpen ? inset : 0));
          }
          if (rightOpen) {
            ctx.moveTo(px + CELL - inset, py + (topOpen ? inset : 0));
            ctx.lineTo(px + CELL - inset, py + CELL - (bottomOpen ? inset : 0));
          }
          ctx.stroke();
        } else if (ch === '-') {
          // Pink Ghost House Door
          ctx.save();
          ctx.strokeStyle = '#F472B6';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#F472B6';
          ctx.beginPath();
          ctx.moveTo(px, py + CELL / 2);
          ctx.lineTo(px + CELL, py + CELL / 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    ctx.shadowBlur = 0;

    // 2. Pellets & pulsing Power Pellets
    const pulse = 0.78 + 0.22 * Math.sin(nowMs / 140);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = grid[r][c];
        const cx = c * CELL + CELL / 2;
        const cy = r * CELL + CELL / 2;
        if (ch === '.') {
          ctx.fillStyle = '#FDE68A';
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (ch === 'o') {
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(cx, cy, 6.3 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Bonus Cherry / Fruit
    if (nowMs < fruitVisibleUntilRef.current) {
      const fx = fruitPosRef.current.x * CELL + CELL / 2;
      const fy = fruitPosRef.current.y * CELL + CELL / 2;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(fx - 3.5, fy + 3, 4.5, 0, Math.PI * 2);
      ctx.arc(fx + 4, fy + 4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4ADE80';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(fx - 3, fy - 1);
      ctx.quadraticCurveTo(fx + 1, fy - 9, fx + 4, fy - 7);
      ctx.lineTo(fx + 4, fy);
      ctx.stroke();
    }

    // 4. Pac-Man (smooth mouth animation when moving; still pose when stopped at wall)
    const p = pacRef.current;
    const pcx = p.x * CELL + CELL / 2;
    const pcy = p.y * CELL + CELL / 2;
    const baseAng =
      p.dir === 'RIGHT' ? 0 : p.dir === 'DOWN' ? Math.PI / 2 : p.dir === 'LEFT' ? Math.PI : -Math.PI / 2;
    const chomp = p.moving ? 0.04 + 0.28 * Math.abs(Math.sin(nowMs / 65)) : 0.22;

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(pcx, pcy);
    ctx.arc(pcx, pcy, CELL * 0.43, baseAng + chomp * Math.PI, baseAng + Math.PI * 2 - chomp * Math.PI);
    ctx.closePath();
    ctx.fill();

    // 5. Ghosts (body + animated wave + directional eyes)
    const frightRemaining = frightUntilRef.current - nowMs;
    const blinkWhite = frightRemaining > 0 && frightRemaining < 2000 && Math.floor(nowMs / 150) % 2 === 0;

    for (const g of ghostsRef.current) {
      const gx = g.x * CELL + CELL / 2;
      const gy = g.y * CELL + CELL / 2;
      const r = CELL * 0.42;

      if (g.mode !== 'eaten') {
        const bodyColor =
          g.mode === 'frightened' ? (blinkWhite ? '#E2E8F0' : '#1D4ED8') : g.color;
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(gx, gy - 1, r, Math.PI, 0);
        const wave = Math.sin(nowMs / 90 + g.id) > 0 ? 1 : -1;
        ctx.lineTo(gx + r, gy + r - 2);
        ctx.lineTo(gx + r * 0.45, gy + r - 4 + wave);
        ctx.lineTo(gx, gy + r - 1);
        ctx.lineTo(gx - r * 0.45, gy + r - 4 - wave);
        ctx.lineTo(gx - r, gy + r - 2);
        ctx.closePath();
        ctx.fill();
      }

      // Eyes
      const look = DIR_VEC[g.dir];
      if (g.mode === 'frightened') {
        ctx.fillStyle = blinkWhite ? '#EF4444' : '#FDE68A';
        ctx.fillRect(gx - 4.5, gy - 3, 2.5, 2.5);
        ctx.fillRect(gx + 2, gy - 3, 2.5, 2.5);
        ctx.strokeStyle = blinkWhite ? '#EF4444' : '#FDE68A';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(gx - 5, gy + 3);
        ctx.lineTo(gx - 2, gy + 1.5);
        ctx.lineTo(gx, gy + 3);
        ctx.lineTo(gx + 2, gy + 1.5);
        ctx.lineTo(gx + 5, gy + 3);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(gx - 3.6, gy - 2, 2.9, 0, Math.PI * 2);
        ctx.arc(gx + 3.6, gy - 2, 2.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(gx - 3.6 + look.dx * 1.2, gy - 2 + look.dy * 1.2, 1.5, 0, Math.PI * 2);
        ctx.arc(gx + 3.6 + look.dx * 1.2, gy - 2 + look.dy * 1.2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Floating score popups (+200, +100)
    popupsRef.current = popupsRef.current.filter((pop) => nowMs < pop.untilMs);
    for (const pop of popupsRef.current) {
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x * CELL + CELL / 2, pop.y * CELL + CELL / 2 - 4);
    }
  }, []);

  useEffect(() => {
    draw(Date.now());
  }, [draw]);

  const resetPositions = useCallback(() => {
    const now = Date.now();
    const s = findSpawns(now, levelRef.current);
    pacRef.current = { x: s.pac.x, y: s.pac.y, dir: 'LEFT', nextDir: 'LEFT', moving: true };
    ghostsRef.current = s.ghosts;
    gateRef.current = s.gate;
    fruitPosRef.current = s.fruit;
    frightUntilRef.current = 0;
    eatComboRef.current = 0;
    setFrightTimerUI(0);
  }, []);

  const startNewGame = useCallback(() => {
    levelRef.current = 1;
    gridRef.current = buildMazeGrid(1);
    resetPositions();
    scoreRef.current = 0;
    livesRef.current = 3;
    ghostsEatenRef.current = 0;
    pelletsEatenRef.current = 0;
    fruitVisibleUntilRef.current = 0;
    fruitSpawnedThisLevelRef.current = false;
    popupsRef.current = [];
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;

    setIsNewRecord(false);
    setLevelBanner(`Nivel 1 / ${MAX_LEVEL} · ${MAZE_LEVELS[0].nombre}`);
    setTimeout(() => setLevelBanner(null), 1500);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGhostsEaten(0);
    setStatus('playing');
  }, [resetPositions]);

  const setDesiredDirection = useCallback(
    (dir: Dir) => {
      if (status === 'idle') {
        startNewGame();
      }
      pacRef.current.nextDir = dir;
    },
    [status, startNewGame],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      if (k === 'arrowup' || k === 'w') setDesiredDirection('UP');
      else if (k === 'arrowdown' || k === 's') setDesiredDirection('DOWN');
      else if (k === 'arrowleft' || k === 'a') setDesiredDirection('LEFT');
      else if (k === 'arrowright' || k === 'd') setDesiredDirection('RIGHT');
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setDesiredDirection]);

  // Smooth 60 FPS continuous arcade game loop
  useEffect(() => {
    if (status !== 'playing') return;
    let rafId = 0;
    let lastTime = performance.now();

    const step = (perfNow: number) => {
      const dt = Math.min(0.04, (perfNow - lastTime) / 1000);
      lastTime = perfNow;
      const now = Date.now();
      const grid = gridRef.current;
      const pac = pacRef.current;

      // 1. Move Pac-Man smoothly in continuous coordinates (never enters wall tiles)
      const wrapCol = (c: number) => (c < 0 ? COLS - 1 : c >= COLS ? 0 : c);
      const pacSpeed = Math.min(7.8, 5.9 + (levelRef.current - 1) * 0.25); // tiles/sec
      const tileCol = Math.max(0, Math.min(COLS - 1, Math.round(pac.x)));
      const tileRow = Math.max(0, Math.min(ROWS - 1, Math.round(pac.y)));
      const distToCenterX = Math.abs(pac.x - tileCol);
      const distToCenterY = Math.abs(pac.y - tileRow);

      // Try switching to buffered direction
      if (pac.nextDir !== pac.dir) {
        const tv = DIR_VEC[pac.nextDir];
        const nextTileOpen = canEntityEnter(grid, wrapCol(tileCol + tv.dx), tileRow + tv.dy, false);
        const isOpposite = pac.nextDir === OPPOSITE[pac.dir];
        const canReverseWithinTile =
          isOpposite &&
          ((tv.dx < 0 && pac.x > tileCol) ||
            (tv.dx > 0 && pac.x < tileCol) ||
            (tv.dy < 0 && pac.y > tileRow) ||
            (tv.dy > 0 && pac.y < tileRow));

        if (isOpposite && (nextTileOpen || canReverseWithinTile)) {
          pac.dir = pac.nextDir;
        } else if (distToCenterX < 0.26 && distToCenterY < 0.26 && nextTileOpen) {
          pac.x = tileCol;
          pac.y = tileRow;
          pac.dir = pac.nextDir;
        }
      }

      // Advance along current direction, stopping cleanly at tile center before a wall
      const pv = DIR_VEC[pac.dir];
      const curColNow = Math.max(0, Math.min(COLS - 1, Math.round(pac.x)));
      const curRowNow = Math.max(0, Math.min(ROWS - 1, Math.round(pac.y)));
      const forwardOpen = canEntityEnter(grid, wrapCol(curColNow + pv.dx), curRowNow + pv.dy, false);

      let nextX = pac.x + pv.dx * pacSpeed * dt;
      let nextY = pac.y + pv.dy * pacSpeed * dt;

      if (!forwardOpen) {
        if (pv.dx > 0 && nextX >= curColNow) {
          pac.x = curColNow;
          pac.y = curRowNow;
          pac.moving = false;
        } else if (pv.dx < 0 && nextX <= curColNow) {
          pac.x = curColNow;
          pac.y = curRowNow;
          pac.moving = false;
        } else if (pv.dy > 0 && nextY >= curRowNow) {
          pac.x = curColNow;
          pac.y = curRowNow;
          pac.moving = false;
        } else if (pv.dy < 0 && nextY <= curRowNow) {
          pac.x = curColNow;
          pac.y = curRowNow;
          pac.moving = false;
        } else {
          // Moving within the current valid tile toward its center before stopping
          pac.x = nextX;
          pac.y = nextY;
          pac.moving = true;
        }
      } else {
        pac.moving = true;
        // Side tunnel wrap
        if (nextX < -0.5) nextX = COLS - 0.5;
        if (nextX > COLS - 0.5) nextX = -0.5;
        pac.x = nextX;
        pac.y = nextY;
        // Keep neatly centered on the corridor axis
        if (pv.dx !== 0) pac.y += (curRowNow - pac.y) * Math.min(1, dt * 20);
        if (pv.dy !== 0) pac.x += (curColNow - pac.x) * Math.min(1, dt * 20);
      }

      // Eat pellets / power pellets when centered over a tile
      const curCol = Math.max(0, Math.min(COLS - 1, Math.round(pac.x)));
      const curRow = Math.max(0, Math.min(ROWS - 1, Math.round(pac.y)));
      const tileChar = grid[curRow]?.[curCol];
      if ((tileChar === '.' || tileChar === 'o') && Math.hypot(pac.x - curCol, pac.y - curRow) < 0.36) {
        grid[curRow][curCol] = ' ';
        pelletsEatenRef.current += 1;
        scoreRef.current += tileChar === 'o' ? 50 : 10;
        if (tileChar === 'o') {
          const frightMs = Math.max(4500, 7500 - (levelRef.current - 1) * 400);
          frightUntilRef.current = now + frightMs;
          eatComboRef.current = 0;
          for (const g of ghostsRef.current) {
            if (g.mode === 'active') {
              g.mode = 'frightened';
              g.dir = OPPOSITE[g.dir];
              g.lastDecisionTile = '';
            }
          }
        }
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }

        // Spawn cherry bonus after 35 pellets eaten in the level
        if (!fruitSpawnedThisLevelRef.current && pelletsEatenRef.current >= 35) {
          fruitSpawnedThisLevelRef.current = true;
          fruitVisibleUntilRef.current = now + 9000;
        }
      }

      // Eat bonus cherry
      if (
        now < fruitVisibleUntilRef.current &&
        Math.hypot(pac.x - fruitPosRef.current.x, pac.y - fruitPosRef.current.y) < 0.55
      ) {
        fruitVisibleUntilRef.current = 0;
        const fruitPts = 100 + (levelRef.current - 1) * 100;
        scoreRef.current += fruitPts;
        popupsRef.current.push({
          x: fruitPosRef.current.x,
          y: fruitPosRef.current.y,
          text: `+${fruitPts}`,
          color: '#4ADE80',
          untilMs: now + 950,
        });
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
      }

      // Fright timer expiration
      const isFrightActive = now < frightUntilRef.current;
      setFrightTimerUI(isFrightActive ? Math.ceil((frightUntilRef.current - now) / 1000) : 0);

      // Scatter vs Chase alternating timer (7s scatter, 18s chase)
      const cycleSec = ((now - matchStartRef.current) / 1000) % 25;
      const isScatterWave = cycleSec < 7;

      // 2. Move Ghosts smoothly in continuous coordinates
      const gate = gateRef.current;
      const allDirs: Dir[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];

      for (const g of ghostsRef.current) {
        if (g.mode === 'frightened' && !isFrightActive) {
          g.mode = 'active';
        }

        if (g.mode === 'house') {
          if (now < g.releaseAtMs) {
            // Subtle vertical bobbing inside house
            g.y = gate.y + 1 + Math.sin(now / 180 + g.id) * 0.14;
            continue;
          }
          // Smoothly guide out through the pink gate!
          const tx = gate.x;
          const ty = gate.y - 1;
          const speed = 3.4;
          if (Math.abs(g.x - tx) > 0.08) {
            g.x += Math.sign(tx - g.x) * speed * dt;
            g.dir = tx > g.x ? 'RIGHT' : 'LEFT';
          } else {
            g.x = tx;
            g.y -= speed * dt;
            g.dir = 'UP';
            if (g.y <= ty) {
              g.y = ty;
              g.dir = g.id % 2 === 0 ? 'LEFT' : 'RIGHT';
              g.mode = isFrightActive ? 'frightened' : 'active';
              g.lastDecisionTile = '';
            }
          }
          continue;
        }

        const gSpeed =
          g.mode === 'eaten'
            ? 8.5
            : g.mode === 'frightened'
              ? 3.3
              : Math.min(6.7, 4.9 + (levelRef.current - 1) * 0.25);

        const gc = Math.round(g.x);
        const gr = Math.round(g.y);
        const key = `${gc},${gr}`;

        // Decide direction once when crossing close to tile center
        if (Math.abs(g.x - gc) < 0.14 && Math.abs(g.y - gr) < 0.14 && g.lastDecisionTile !== key) {
          g.lastDecisionTile = key;
          g.x = gc;
          g.y = gr;

          if (g.mode === 'eaten' && gc === gate.x && gr === gate.y - 1) {
            // Arrived back at ghost gate! Re-enter briefly and release immediately
            g.mode = 'house';
            g.y = gate.y + 1;
            g.releaseAtMs = now + 900;
            continue;
          }

          const allowGate = g.mode === 'eaten';
          const valid = allDirs.filter((d) => {
            const v = DIR_VEC[d];
            let nc = gc + v.dx;
            const nr = gr + v.dy;
            if (nc < 0) nc = COLS - 1;
            if (nc >= COLS) nc = 0;
            return canEntityEnter(grid, nc, nr, allowGate);
          });

          const choices = valid.filter((d) => d !== OPPOSITE[g.dir]);
          const pool = choices.length > 0 ? choices : valid;

          if (pool.length > 0) {
            if (g.mode === 'frightened') {
              g.dir = pool[Math.floor(Math.random() * pool.length)];
            } else {
              // Authentic Ghost Target Selection!
              let target = { x: pac.x, y: pac.y };
              if (g.mode === 'eaten') {
                target = { x: gate.x, y: gate.y - 1 };
              } else if (isScatterWave) {
                target = g.scatterTarget;
              } else if (g.id === 1) {
                // Pinky targets 4 tiles ahead of Pac-Man
                const pv2 = DIR_VEC[pac.dir];
                target = { x: pac.x + pv2.dx * 4, y: pac.y + pv2.dy * 4 };
              } else if (g.id === 2) {
                // Inky flanks using Blinky's position
                const blinky = ghostsRef.current[0];
                const pv2 = DIR_VEC[pac.dir];
                const ahead = { x: pac.x + pv2.dx * 2, y: pac.y + pv2.dy * 2 };
                target = {
                  x: ahead.x + (ahead.x - blinky.x),
                  y: ahead.y + (ahead.y - blinky.y),
                };
              } else if (g.id === 3) {
                // Clyde retreats to corner if within 6 tiles of Pac-Man
                const distToPac = Math.hypot(g.x - pac.x, g.y - pac.y);
                target = distToPac < 6 ? g.scatterTarget : { x: pac.x, y: pac.y };
              }

              pool.sort((a, b) => {
                const va = DIR_VEC[a];
                const vb = DIR_VEC[b];
                const da = Math.hypot(gc + va.dx - target.x, gr + va.dy - target.y);
                const db = Math.hypot(gc + vb.dx - target.x, gr + vb.dy - target.y);
                return da - db;
              });
              g.dir = pool[0];
            }
          }
        }

        const gv = DIR_VEC[g.dir];
        const ghostForwardOpen = canEntityEnter(
          grid,
          wrapCol(gc + gv.dx),
          gr + gv.dy,
          g.mode === 'eaten',
        );
        let gNextX = g.x + gv.dx * gSpeed * dt;
        let gNextY = g.y + gv.dy * gSpeed * dt;

        const stoppedAtWall =
          !ghostForwardOpen &&
          ((gv.dx > 0 && gNextX >= gc) ||
            (gv.dx < 0 && gNextX <= gc) ||
            (gv.dy > 0 && gNextY >= gr) ||
            (gv.dy < 0 && gNextY <= gr));

        if (stoppedAtWall) {
          g.x = gc;
          g.y = gr;
          g.lastDecisionTile = '';
        } else {
          if (gNextX < -0.5) gNextX = COLS - 0.5;
          if (gNextX > COLS - 0.5) gNextX = -0.5;
          g.x = gNextX;
          g.y = gNextY;
        }

        // Collision check with Pac-Man
        if (g.mode !== 'eaten' && Math.hypot(g.x - pac.x, g.y - pac.y) < 0.62) {
          if (g.mode === 'frightened') {
            g.mode = 'eaten';
            eatComboRef.current += 1;
            const comboPts = 200 * Math.pow(2, Math.min(3, eatComboRef.current - 1));
            ghostsEatenRef.current += 1;
            scoreRef.current += comboPts;
            popupsRef.current.push({
              x: g.x,
              y: g.y,
              text: `+${comboPts}`,
              color: '#67E8F9',
              untilMs: now + 900,
            });
            setGhostsEaten(ghostsEatenRef.current);
            setScore(scoreRef.current);
            if (scoreRef.current > bestRef.current) {
              bestRef.current = scoreRef.current;
              setBestScore(scoreRef.current);
            }
          } else {
            livesRef.current -= 1;
            setLives(livesRef.current);
            if (livesRef.current <= 0) {
              setStatus('gameover');
              if (!reportedRef.current) {
                reportedRef.current = true;
                const dur = Math.max(1, Math.round((now - matchStartRef.current) / 1000));
                if (scoreRef.current > startBestRef.current && scoreRef.current > 0) {
                  setIsNewRecord(true);
                }
                setAttempts((prev) => prev + 1);
                onFinishRef.current?.({
                  puntaje: scoreRef.current,
                  detalleExtra: ghostsEatenRef.current,
                  modo: `nivel-${levelRef.current}`,
                  duracionSegundos: dur,
                });
              }
              draw(now);
              return;
            }
            resetPositions();
            draw(now);
            rafId = requestAnimationFrame(step);
            return;
          }
        }
      }

      // 3. Level cleared?
      if (countRemainingPellets(grid) === 0) {
        if (levelRef.current >= MAX_LEVEL) {
          scoreRef.current += 500;
          setScore(scoreRef.current);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
          }
          setStatus('victory');
          if (!reportedRef.current) {
            reportedRef.current = true;
            const dur = Math.max(1, Math.round((now - matchStartRef.current) / 1000));
            if (scoreRef.current > startBestRef.current && scoreRef.current > 0) {
              setIsNewRecord(true);
            }
            setAttempts((prev) => prev + 1);
            onFinishRef.current?.({
              puntaje: scoreRef.current,
              detalleExtra: ghostsEatenRef.current,
              modo: `nivel-3-completo`,
              duracionSegundos: dur,
            });
          }
          draw(now);
          return;
        }

        levelRef.current += 1;
        scoreRef.current += 300;
        pelletsEatenRef.current = 0;
        fruitSpawnedThisLevelRef.current = false;
        fruitVisibleUntilRef.current = 0;
        setLevel(levelRef.current);
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
        const nextCfg = getMazeConfig(levelRef.current);
        setLevelBanner(`Nivel ${levelRef.current} / ${MAX_LEVEL} · ${nextCfg.nombre}`);
        setTimeout(() => setLevelBanner(null), 1600);
        gridRef.current = buildMazeGrid(levelRef.current);
        resetPositions();
      }

      draw(now);
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [status, draw, resetPositions]);

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(250, 204, 21, 0.28)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FACC15]/35 bg-[#FACC15]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FDE047]">
              <span className="h-2 w-2 rounded-full bg-[#FACC15]" aria-hidden="true" />
              Arcade #08 · 3 Laberintos Clásicos 60 FPS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pac-Man Estelar
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Movimiento fluido en rieles neón, puerta rosa de fantasmas, 4 personalidades IA y combo por comer fantasmas azules (200 / 400 / 800 / 1600).
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="min-h-[40px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black text-white text-xs font-semibold px-5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            ← Volver a Minijuegos
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Puntos</div>
            <div className="text-2xl font-black text-[#FACC15] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Nivel · Vidas</div>
            <div className="text-xl font-black text-[#67E8F9] tabular-nums">
              {level}/{MAX_LEVEL} · <span className="text-[#FB7185]">{'♥'.repeat(Math.max(0, lives))}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Fantasmas</div>
            <div className="text-2xl font-black text-[#93C5FD] tabular-nums">
              {ghostsEaten}
              {frightTimerUI > 0 && (
                <span className="ml-2 text-xs font-bold text-[#60A5FA]">({frightTimerUI}s poder)</span>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Intentos</div>
            <div className="text-2xl font-black text-white tabular-nums">{attempts}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#FDE68A]/25 bg-[#FDE68A]/[0.06] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#FDE68A]">Récord</div>
            <div className="text-2xl font-black text-[#FDE68A] tabular-nums">{bestScore}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 flex justify-center">
            <ArcadeScreenFrame
              className="w-full max-w-[456px] aspect-[456/504]"
              accentColor="rgba(59, 130, 246, 0.45)"
              glowColor="rgba(59, 130, 246, 0.45)"
              bgColor="#02040D"
            >
              <canvas ref={canvasRef} className="w-full h-full block" aria-label="Laberinto de Pac-Man Estelar" />
              {status === 'playing' && levelBanner && (
                <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#FACC15]/50 bg-[#02040D]/92 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FACC15] whitespace-nowrap">
                  {levelBanner}
                </div>
              )}
              {status !== 'playing' && (
                <div className="absolute inset-0 bg-[#02040D]/88 flex flex-col items-center justify-center p-6 text-center gap-4">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FACC15]">
                    {status === 'victory'
                      ? '¡Maestro del Laberinto!'
                      : status === 'gameover'
                        ? `Llegaste al Nivel ${level}`
                        : 'Listo en el laberinto'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {status === 'victory'
                      ? '¡Felicidades! Completaste los 3 niveles'
                      : status === 'gameover'
                        ? `Puntuación: ${score}`
                        : 'Pac-Man Estelar'}
                  </div>
                  {(status === 'gameover' || status === 'victory') && isNewRecord && (
                    <span className="rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                      ¡Nuevo récord personal!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="min-h-[42px] px-7 rounded-full bg-[#FACC15] text-black text-xs font-bold hover:bg-[#FDE047] transition-colors cursor-pointer"
                  >
                    {status === 'idle' ? 'Iniciar Nivel 1' : 'Jugar de nuevo desde Nivel 1'}
                  </button>
                </div>
              )}
            </ArcadeScreenFrame>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/75 text-center">
                Controles (Flechas / WASD)
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                <div />
                <button
                  type="button"
                  onClick={() => setDesiredDirection('UP')}
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  ↑
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => setDesiredDirection('LEFT')}
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setDesiredDirection('DOWN')}
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setDesiredDirection('RIGHT')}
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#FACC15]/25 bg-[#FACC15]/[0.06] p-4 text-xs text-white/80 leading-relaxed space-y-1.5">
              <div className="font-bold text-[#FACC15]">Mecánica original</div>
              <p>
                • Los 4 fantasmas salen gradualmente por la puerta rosa central.<br />
                • Come una esfera grande para volverlos azules y cazarlos en cadena (<strong>200, 400, 800, 1600</strong>).<br />
                • Al ser comidos, solo sus ojos regresan rápido a regenerarse al centro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
}
