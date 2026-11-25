'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

// Classic 19-col x 21-row Pac-Man inspired maze:
// '#' = wall, '.' = pellet, 'o' = power pellet, ' ' = empty/tunnel, 'P' = Pac-Man spawn, 'G' = ghost house
const MAZE_TEMPLATE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '   #.#       #.#   ',
  '####.# ##G## #.####',
  '    .  #GGG#  .    ',
  '####.# ##### #.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
];

const ROWS = MAZE_TEMPLATE.length;
const COLS = MAZE_TEMPLATE[0].length;
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

interface Ghost {
  id: number;
  x: number;
  y: number;
  dir: Dir;
  color: string;
  homeX: number;
  homeY: number;
}

function buildMazeGrid(): string[][] {
  return MAZE_TEMPLATE.map((row) => row.split(''));
}

function findSpawnPositions() {
  let pac = { x: 9, y: 15 };
  const ghostHomes: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE_TEMPLATE[r][c] === 'P') pac = { x: c, y: r };
      if (MAZE_TEMPLATE[r][c] === 'G') ghostHomes.push({ x: c, y: r });
    }
  }
  const ghostColors = ['#EF4444', '#F472B6', '#22D3EE', '#FB923C'];
  const ghosts: Ghost[] = ghostColors.map((color, idx) => {
    const home = ghostHomes[idx % ghostHomes.length] || { x: 9, y: 8 };
    return {
      id: idx,
      x: home.x,
      y: home.y,
      dir: idx % 2 === 0 ? 'LEFT' : 'RIGHT',
      color,
      homeX: home.x,
      homeY: home.y,
    };
  });
  return { pac, ghosts };
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

function isWalkable(grid: string[][], x: number, y: number): boolean {
  if (y < 0 || y >= ROWS) return false;
  if (x < 0 || x >= COLS) return true; // tunnel wrap
  return grid[y][x] !== '#';
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
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [ghostsEaten, setGhostsEaten] = useState(0);
  const [frightTimerUI, setFrightTimerUI] = useState(0);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const gridRef = useRef<string[][]>(buildMazeGrid());
  const spawns = findSpawnPositions();
  const pacRef = useRef({ x: spawns.pac.x, y: spawns.pac.y, dir: 'LEFT' as Dir, nextDir: 'LEFT' as Dir });
  const ghostsRef = useRef<Ghost[]>(spawns.ghosts);
  const frightUntilRef = useRef(0);
  const mouthOpenRef = useRef(true);

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

  const draw = useCallback(() => {
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

    ctx.fillStyle = '#030612';
    ctx.fillRect(0, 0, W, H);

    const grid = gridRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        const px = c * CELL;
        const py = r * CELL;

        if (cell === '#') {
          ctx.fillStyle = '#1D4ED8';
          ctx.beginPath();
          ctx.roundRect(px + 2, py + 2, CELL - 4, CELL - 4, 5);
          ctx.fill();
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (cell === '.') {
          ctx.fillStyle = '#FDE68A';
          ctx.beginPath();
          ctx.arc(px + CELL / 2, py + CELL / 2, 2.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 'o') {
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(px + CELL / 2, py + CELL / 2, 6.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Pac-Man
    const p = pacRef.current;
    const pcx = p.x * CELL + CELL / 2;
    const pcy = p.y * CELL + CELL / 2;
    const baseAng =
      p.dir === 'RIGHT' ? 0 : p.dir === 'DOWN' ? Math.PI / 2 : p.dir === 'LEFT' ? Math.PI : -Math.PI / 2;
    const mouth = mouthOpenRef.current ? 0.28 * Math.PI : 0.05 * Math.PI;

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(pcx, pcy);
    ctx.arc(pcx, pcy, CELL * 0.42, baseAng + mouth, baseAng + Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();

    // Ghosts
    const isFrightened = Date.now() < frightUntilRef.current;
    for (const g of ghostsRef.current) {
      const gx = g.x * CELL + CELL / 2;
      const gy = g.y * CELL + CELL / 2;
      const r = CELL * 0.41;

      ctx.fillStyle = isFrightened ? '#2563EB' : g.color;
      ctx.beginPath();
      ctx.arc(gx, gy - 1, r, Math.PI, 0);
      ctx.lineTo(gx + r, gy + r - 2);
      ctx.lineTo(gx + r * 0.35, gy + r * 0.55);
      ctx.lineTo(gx, gy + r - 2);
      ctx.lineTo(gx - r * 0.35, gy + r * 0.55);
      ctx.lineTo(gx - r, gy + r - 2);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(gx - 3.5, gy - 2, 2.6, 0, Math.PI * 2);
      ctx.arc(gx + 3.5, gy - 2, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isFrightened ? '#FDE68A' : '#0F172A';
      ctx.beginPath();
      ctx.arc(gx - 3.5, gy - 2, 1.3, 0, Math.PI * 2);
      ctx.arc(gx + 3.5, gy - 2, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const resetPositions = useCallback(() => {
    const s = findSpawnPositions();
    pacRef.current = { x: s.pac.x, y: s.pac.y, dir: 'LEFT', nextDir: 'LEFT' };
    ghostsRef.current = s.ghosts;
    frightUntilRef.current = 0;
    setFrightTimerUI(0);
  }, []);

  const startNewGame = useCallback(() => {
    gridRef.current = buildMazeGrid();
    resetPositions();
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    ghostsEatenRef.current = 0;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;

    setIsNewRecord(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGhostsEaten(0);
    setStatus('playing');
    draw();
  }, [resetPositions, draw]);

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

  useEffect(() => {
    if (status !== 'playing') return;

    const tickMs = Math.max(115, 165 - (level - 1) * 10);
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount += 1;
      mouthOpenRef.current = !mouthOpenRef.current;
      const grid = gridRef.current;
      const pac = pacRef.current;

      // Try buffered turn first
      const tryVec = DIR_VEC[pac.nextDir];
      let tx = pac.x + tryVec.dx;
      const ty = pac.y + tryVec.dy;
      if (tx < 0) tx = COLS - 1;
      if (tx >= COLS) tx = 0;
      if (isWalkable(grid, tx, ty)) {
        pac.dir = pac.nextDir;
      }

      // Move Pac-Man
      const moveVec = DIR_VEC[pac.dir];
      let nx = pac.x + moveVec.dx;
      const ny = pac.y + moveVec.dy;
      if (nx < 0) nx = COLS - 1;
      if (nx >= COLS) nx = 0;
      if (isWalkable(grid, nx, ny)) {
        pac.x = nx;
        pac.y = ny;
      }

      // Eat pellet or power pellet
      const cell = grid[pac.y]?.[pac.x];
      if (cell === '.' || cell === 'o') {
        grid[pac.y][pac.x] = ' ';
        scoreRef.current += cell === 'o' ? 50 : 10;
        if (cell === 'o') {
          frightUntilRef.current = Date.now() + 7000;
        }
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
      }

      const now = Date.now();
      const isFrightened = now < frightUntilRef.current;
      setFrightTimerUI(isFrightened ? Math.ceil((frightUntilRef.current - now) / 1000) : 0);

      // Move ghosts (slightly slower when frightened)
      if (!isFrightened || stepCount % 2 === 0) {
        const dirs: Dir[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        for (const g of ghostsRef.current) {
          const validDirs = dirs.filter((d) => {
            const v = DIR_VEC[d];
            let gx = g.x + v.dx;
            const gy = g.y + v.dy;
            if (gx < 0) gx = COLS - 1;
            if (gx >= COLS) gx = 0;
            return isWalkable(grid, gx, gy);
          });

          const nonReverse = validDirs.filter((d) => d !== OPPOSITE[g.dir]);
          const choices = nonReverse.length > 0 ? nonReverse : validDirs;

          if (choices.length > 0) {
            if (isFrightened || Math.random() < 0.25) {
              g.dir = choices[Math.floor(Math.random() * choices.length)];
            } else {
              // Greedy chase toward Pac-Man
              choices.sort((a, b) => {
                const va = DIR_VEC[a];
                const vb = DIR_VEC[b];
                const da = Math.hypot(g.x + va.dx - pac.x, g.y + va.dy - pac.y);
                const db = Math.hypot(g.x + vb.dx - pac.x, g.y + vb.dy - pac.y);
                return da - db;
              });
              g.dir = choices[0];
            }

            const gv = DIR_VEC[g.dir];
            let ngx = g.x + gv.dx;
            const ngy = g.y + gv.dy;
            if (ngx < 0) ngx = COLS - 1;
            if (ngx >= COLS) ngx = 0;
            if (isWalkable(grid, ngx, ngy)) {
              g.x = ngx;
              g.y = ngy;
            }
          }
        }
      }

      // Check Pac-Man vs Ghosts
      for (const g of ghostsRef.current) {
        if (g.x === pac.x && g.y === pac.y) {
          if (Date.now() < frightUntilRef.current) {
            g.x = g.homeX;
            g.y = g.homeY;
            ghostsEatenRef.current += 1;
            scoreRef.current += 200;
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
                const dur = Math.max(1, Math.round((Date.now() - matchStartRef.current) / 1000));
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
              draw();
              return;
            }
            resetPositions();
            break;
          }
        }
      }

      // Level cleared?
      if (countRemainingPellets(grid) === 0) {
        levelRef.current += 1;
        scoreRef.current += 250;
        setLevel(levelRef.current);
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
        gridRef.current = buildMazeGrid();
        resetPositions();
      }

      draw();
    }, tickMs);

    return () => clearInterval(timer);
  }, [status, level, draw, resetPositions]);

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
              Arcade #08 · Laberinto Clásico
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pac-Man Estelar
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Recorre el laberinto clásico con túneles laterales, come las esferas de poder doradas para cazar fantasmas y sube de nivel.
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
              #{level} · <span className="text-[#FB7185]">{'♥'.repeat(Math.max(0, lives))}</span>
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
              accentColor="rgba(250, 204, 21, 0.36)"
              glowColor="rgba(59, 130, 246, 0.45)"
              bgColor="#030612"
            >
              <canvas ref={canvasRef} className="w-full h-full block" aria-label="Laberinto de Pac-Man Estelar" />
              {status !== 'playing' && (
                <div className="absolute inset-0 bg-[#030612]/90 flex flex-col items-center justify-center p-6 text-center gap-4">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FACC15]">
                    {status === 'gameover' ? 'Fin de la partida' : 'Laberinto listo'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {status === 'gameover' ? `Puntuación: ${score}` : 'Pac-Man Estelar'}
                  </div>
                  {status === 'gameover' && isNewRecord && (
                    <span className="rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                      ¡Nuevo récord personal!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="min-h-[42px] px-7 rounded-full bg-[#FACC15] text-black text-xs font-bold hover:bg-[#FDE047] transition-colors cursor-pointer"
                  >
                    {status === 'gameover' ? 'Jugar de nuevo' : 'Iniciar partida'}
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
              <div className="font-bold text-[#FACC15]">Reglas del clásico</div>
              <p>
                • Puntos pequeños: <strong>10 pts</strong>.<br />
                • Esferas grandes de poder: <strong>50 pts</strong> y vuelven azules a los fantasmas por 7 segundos para que puedas comerlos (<strong>+200 pts</strong>).<br />
                • Usa los pasillos laterales abiertos para cruzar de un lado al otro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
}
