'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import { useThemeStore } from '../lib/theme-store';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';
type SpeedMode = 'relaxed' | 'arcade' | 'turbo';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INITIAL_DIR: Direction = 'RIGHT';

const SPEED_CONFIG: Record<SpeedMode, { label: string; baseMs: number; minMs: number; stepMs: number }> = {
  relaxed: { label: 'Suave', baseMs: 165, minMs: 95, stepMs: 2 },
  arcade: { label: 'Arcade', baseMs: 125, minMs: 70, stepMs: 2.5 },
  turbo: { label: 'Turbo', baseMs: 92, minMs: 52, stepMs: 2.5 },
};

const OPPOSITE_DIR: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

function spawnApple(occupied: Point[]): Point {
  const occupiedSet = new Set(occupied.map((p) => `${p.x},${p.y}`));
  const freeCells: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupiedSet.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }
  if (freeCells.length === 0) return { x: 0, y: 0 };
  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

export default function SnakeArcadeGame({
  userKey,
  onBack,
}: {
  userKey: string;
  onBack: () => void;
}) {
  const isLight = useThemeStore((s) => s.theme === 'light');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [status, setStatus] = useState<GameStatus>('idle');
  const [speedMode, setSpeedMode] = useState<SpeedMode>('arcade');
  const [score, setScore] = useState(0);
  const [apples, setApples] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const snakeRef = useRef<Point[]>([...INITIAL_SNAKE]);
  const dirRef = useRef<Direction>(INITIAL_DIR);
  const dirQueueRef = useRef<Direction[]>([]);
  const appleRef = useRef<Point>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const applesRef = useRef(0);
  const statusRef = useRef<GameStatus>('idle');
  const bestScoreRef = useRef(0);

  const storageKey = `arcade_snake_best_${userKey || 'guest'}`;

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(storageKey) || 0);
      if (Number.isFinite(saved) && saved > 0) {
        bestScoreRef.current = saved;
        setBestScore(saved);
      }
    } catch {
      // Ignore storage failures
    }
  }, [storageKey]);

  const playEatTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      setTimeout(() => void ctx.close(), 180);
    } catch {
      // Audio optional
    }
  }, []);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 440;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = size / GRID_SIZE;

    // Arena background
    ctx.fillStyle = isLight ? '#0B172A' : '#050B16';
    ctx.fillRect(0, 0, size, size);

    // Subtle arcade grid
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_SIZE; i++) {
      const pos = i * cell;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.stroke();
    }

    // Apple glow + fruit
    const apple = appleRef.current;
    const ax = apple.x * cell + cell / 2;
    const ay = apple.y * cell + cell / 2;
    const glow = ctx.createRadialGradient(ax, ay, 2, ax, ay, cell * 0.8);
    glow.addColorStop(0, 'rgba(251, 113, 133, 0.55)');
    glow.addColorStop(1, 'rgba(251, 113, 133, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ax, ay, cell * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Apple body
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.arc(ax, ay + 1, cell * 0.36, 0, Math.PI * 2);
    ctx.fill();

    // Apple highlight & leaf
    ctx.fillStyle = '#FFE4E6';
    ctx.beginPath();
    ctx.arc(ax - 2.5, ay - 1.5, cell * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#34D399';
    ctx.beginPath();
    ctx.ellipse(ax + 2.5, ay - cell * 0.32, 3.2, 1.8, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Snake segments (draw tail -> head)
    const snake = snakeRef.current;
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const pad = i === 0 ? 1.5 : 2.3;
      const rx = seg.x * cell + pad;
      const ry = seg.y * cell + pad;
      const rw = cell - pad * 2;
      const rh = cell - pad * 2;
      const radius = i === 0 ? 6 : 5;

      const t = i / Math.max(1, snake.length - 1);
      ctx.fillStyle = i === 0 ? '#67E8F9' : t < 0.5 ? '#22D3EE' : '#10B981';

      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, radius);
      ctx.fill();

      // Eyes on head
      if (i === 0) {
        const dir = dirRef.current;
        const cx = seg.x * cell + cell / 2;
        const cy = seg.y * cell + cell / 2;
        let e1 = { x: cx + 3, y: cy - 3.5 };
        let e2 = { x: cx + 3, y: cy + 3.5 };
        if (dir === 'LEFT') {
          e1 = { x: cx - 3, y: cy - 3.5 };
          e2 = { x: cx - 3, y: cy + 3.5 };
        } else if (dir === 'UP') {
          e1 = { x: cx - 3.5, y: cy - 3 };
          e2 = { x: cx + 3.5, y: cy - 3 };
        } else if (dir === 'DOWN') {
          e1 = { x: cx - 3.5, y: cy + 3 };
          e2 = { x: cx + 3.5, y: cy + 3 };
        }

        ctx.fillStyle = '#041421';
        ctx.beginPath();
        ctx.arc(e1.x, e1.y, 2, 0, Math.PI * 2);
        ctx.arc(e2.x, e2.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [isLight]);

  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

  const startNewGame = useCallback(() => {
    const startSnake = INITIAL_SNAKE.map((p) => ({ ...p }));
    snakeRef.current = startSnake;
    dirRef.current = INITIAL_DIR;
    dirQueueRef.current = [];
    appleRef.current = spawnApple(startSnake);
    scoreRef.current = 0;
    applesRef.current = 0;
    statusRef.current = 'playing';

    setScore(0);
    setApples(0);
    setStatus('playing');
    drawBoard();
  }, [drawBoard]);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') {
      statusRef.current = 'paused';
      setStatus('paused');
    } else if (statusRef.current === 'paused') {
      statusRef.current = 'playing';
      setStatus('playing');
    }
  }, []);

  const queueDirection = useCallback((nextDir: Direction) => {
    if (statusRef.current === 'idle') {
      startNewGame();
    }
    if (statusRef.current !== 'playing') return;
    const queue = dirQueueRef.current;
    const lastPlanned = queue.length > 0 ? queue[queue.length - 1] : dirRef.current;
    if (nextDir === lastPlanned || OPPOSITE_DIR[lastPlanned] === nextDir) return;
    if (queue.length < 2) {
      queue.push(nextDir);
    }
  }, [startNewGame]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }
      if (key === 'arrowup' || key === 'w') queueDirection('UP');
      else if (key === 'arrowdown' || key === 's') queueDirection('DOWN');
      else if (key === 'arrowleft' || key === 'a') queueDirection('LEFT');
      else if (key === 'arrowright' || key === 'd') queueDirection('RIGHT');
      else if (key === ' ' || key === 'p') {
        if (statusRef.current === 'idle' || statusRef.current === 'gameover') {
          startNewGame();
        } else {
          togglePause();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [queueDirection, startNewGame, togglePause]);

  useEffect(() => {
    if (status !== 'playing') return;

    const cfg = SPEED_CONFIG[speedMode];
    const currentDelay = Math.max(cfg.minMs, cfg.baseMs - apples * cfg.stepMs);

    const timer = setInterval(() => {
      if (statusRef.current !== 'playing') return;

      const nextQueued = dirQueueRef.current.shift();
      if (nextQueued) {
        dirRef.current = nextQueued;
      }

      const snake = snakeRef.current;
      const head = snake[0];
      const nextHead: Point = {
        x: head.x + (dirRef.current === 'RIGHT' ? 1 : dirRef.current === 'LEFT' ? -1 : 0),
        y: head.y + (dirRef.current === 'DOWN' ? 1 : dirRef.current === 'UP' ? -1 : 0),
      };

      const ateApple = nextHead.x === appleRef.current.x && nextHead.y === appleRef.current.y;
      const hitWall =
        nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;

      const bodyToCheck = ateApple ? snake : snake.slice(0, -1);
      const hitSelf = bodyToCheck.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y);

      if (hitWall || hitSelf) {
        statusRef.current = 'gameover';
        setStatus('gameover');
        return;
      }

      const updatedSnake = ateApple
        ? [nextHead, ...snake]
        : [nextHead, ...snake.slice(0, -1)];

      snakeRef.current = updatedSnake;

      if (ateApple) {
        playEatTone();
        const nextApples = applesRef.current + 1;
        const nextScore = scoreRef.current + 10;
        applesRef.current = nextApples;
        scoreRef.current = nextScore;
        setApples(nextApples);
        setScore(nextScore);

        if (nextScore > bestScoreRef.current) {
          bestScoreRef.current = nextScore;
          setBestScore(nextScore);
          try {
            localStorage.setItem(storageKey, String(nextScore));
          } catch {
            // Ignore storage errors
          }
        }
        appleRef.current = spawnApple(updatedSnake);
      }

      drawBoard();
    }, currentDelay);

    return () => clearInterval(timer);
  }, [status, speedMode, apples, drawBoard, playEatTone, storageKey]);

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(103, 232, 249, 0.2)' } as CSSProperties}
    >
      <div className="space-y-6">
        {/* Cabecera de cabina arcade */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#67E8F9]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#67E8F9]">
              <span className="h-2 w-2 rounded-full bg-[#67E8F9]" aria-hidden="true" />
              Arcade #01 · Activo
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Serpiente Estelar
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Come manzanas espaciales para crecer y sumar puntos sin chocar con los bordes ni contigo mismo.
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

        {/* Marcadores + Velocidad */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">
              Puntuación
            </div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">
              Manzanas
            </div>
            <div className="text-2xl font-black text-[#FB7185] tabular-nums">{apples}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">
              Tamaño
            </div>
            <div className="text-2xl font-black text-[#6EE7B7] tabular-nums">
              {INITIAL_SNAKE.length + apples}
            </div>
          </div>
          <div className="rounded-2xl border border-[#FDE68A]/25 bg-[#FDE68A]/[0.06] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#FDE68A]">
              Récord personal
            </div>
            <div className="text-2xl font-black text-[#FDE68A] tabular-nums">{bestScore}</div>
          </div>
        </div>

        {/* Área central: Tablero Canvas + Panel lateral */}
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[440px] aspect-square rounded-2xl overflow-hidden border-2 border-[#67E8F9]/35 shadow-[0_0_45px_-14px_rgba(103,232,249,0.45)] bg-[#050B16]">
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
                aria-label="Tablero del juego Serpiente Estelar"
              />

              {status !== 'playing' && (
                <div className="absolute inset-0 bg-[#050B16]/82 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-4">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#67E8F9]">
                    {status === 'idle'
                      ? 'Listo para despegar'
                      : status === 'paused'
                        ? 'Juego en pausa'
                        : 'Fin de la partida'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {status === 'gameover'
                      ? `Lograste ${score} puntos`
                      : status === 'paused'
                        ? 'Tómate un respiro'
                        : 'Serpiente Estelar'}
                  </div>
                  {status === 'gameover' && (
                    <p className="text-xs sm:text-sm text-white/75">
                      Comiste <strong>{apples}</strong> {apples === 1 ? 'manzana' : 'manzanas'} y alcanzaste tamaño{' '}
                      <strong>{INITIAL_SNAKE.length + apples}</strong>.
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    {status === 'paused' ? (
                      <button
                        type="button"
                        onClick={togglePause}
                        className="min-h-[42px] px-6 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors cursor-pointer"
                      >
                        Continuar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startNewGame}
                        className="min-h-[42px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors cursor-pointer"
                      >
                        {status === 'gameover' ? 'Jugar de nuevo' : 'Iniciar partida'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controles, velocidad e instrucciones */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/75">
                  Velocidad Arcade
                </span>
                {status === 'playing' || status === 'paused' ? (
                  <button
                    type="button"
                    onClick={togglePause}
                    className="min-h-[32px] px-3.5 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.14] text-xs font-semibold text-white cursor-pointer"
                  >
                    {status === 'paused' ? 'Reanudar' : 'Pausar'}
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['relaxed', 'arcade', 'turbo'] as SpeedMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSpeedMode(mode)}
                    className={`min-h-[38px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      speedMode === mode
                        ? 'bg-[#67E8F9] text-black border-[#67E8F9]'
                        : 'bg-white/[0.04] text-white/75 border-white/12 hover:bg-white/[0.1]'
                    }`}
                  >
                    {SPEED_CONFIG[mode].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cruceta táctil / clic */}
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 space-y-3">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/75 text-center">
                Controles táctiles o teclado (Flechas / WASD)
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                <div />
                <button
                  type="button"
                  onClick={() => queueDirection('UP')}
                  aria-label="Mover arriba"
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  ↑
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => queueDirection('LEFT')}
                  aria-label="Mover a la izquierda"
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => queueDirection('DOWN')}
                  aria-label="Mover abajo"
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => queueDirection('RIGHT')}
                  aria-label="Mover a la derecha"
                  className="h-12 rounded-xl border border-white/15 bg-white/[0.08] hover:bg-white/20 text-white font-bold text-lg cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#6EE7B7]/25 bg-[#6EE7B7]/[0.06] p-4 text-xs text-white/80 leading-relaxed space-y-1">
              <div className="font-bold text-[#6EE7B7]">¿Cómo se juega?</div>
              <p>
                Usa las flechas del teclado, las teclas <strong>W A S D</strong> o los botones en pantalla para
                guiar a la serpiente hacia las manzanas rojas. Cada manzana te hace crecer +1 segmento y suma{' '}
                <strong>10 puntos</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
}
