'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

const W = 440;
const H = 440;
const PADDLE_W = 86;
const PADDLE_H = 12;
const PADDLE_Y = H - 30;
const BALL_R = 7;
const ROWS = 4;
const COLS = 7;
const BRICK_COLORS = ['#F472B6', '#D8B4FE', '#67E8F9', '#6EE7B7'];
const ROW_POINTS = [30, 25, 20, 15];

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  color: string;
  pts: number;
}

function buildBricks(): Brick[] {
  const bricks: Brick[] = [];
  const bw = 50;
  const bh = 16;
  const gap = 8;
  const offsetX = (W - (COLS * bw + (COLS - 1) * gap)) / 2;
  const offsetY = 48;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: offsetX + c * (bw + gap),
        y: offsetY + r * (bh + gap),
        w: bw,
        h: bh,
        alive: true,
        color: BRICK_COLORS[r % BRICK_COLORS.length],
        pts: ROW_POINTS[r % ROW_POINTS.length],
      });
    }
  }
  return bricks;
}

export default function BreakoutArcadeGame({
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
  const [bricksBroken, setBricksBroken] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const paddleXRef = useRef((W - PADDLE_W) / 2);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const ballRef = useRef({ x: W / 2, y: PADDLE_Y - 12, vx: 3.3, vy: -3.6 });
  const bricksRef = useRef<Brick[]>(buildBricks());
  const scoreRef = useRef(0);
  const brokenRef = useRef(0);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
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

  const resetBall = useCallback((waveNum: number) => {
    const speedBoost = Math.min(2.2, (waveNum - 1) * 0.35);
    const dir = Math.random() > 0.5 ? 1 : -1;
    ballRef.current = {
      x: W / 2,
      y: PADDLE_Y - 12,
      vx: dir * (3.2 + speedBoost * 0.6),
      vy: -(3.6 + speedBoost),
    };
  }, []);

  const drawScene = useCallback(() => {
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

    ctx.fillStyle = '#090617';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 22; x < W; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Bricks
    for (const b of bricksRef.current) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();
    }

    // Paddle
    ctx.fillStyle = '#E9D5FF';
    ctx.beginPath();
    ctx.roundRect(paddleXRef.current, PADDLE_Y, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // Ball
    const ball = ballRef.current;
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  const startNewGame = useCallback(() => {
    paddleXRef.current = (W - PADDLE_W) / 2;
    bricksRef.current = buildBricks();
    scoreRef.current = 0;
    brokenRef.current = 0;
    livesRef.current = 3;
    waveRef.current = 1;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;
    resetBall(1);

    setIsNewRecord(false);
    setScore(0);
    setBricksBroken(0);
    setLives(3);
    setWave(1);
    setStatus('playing');
  }, [resetBall]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = true;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = false;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    let rafId = 0;

    const step = () => {
      if (keysRef.current.left) paddleXRef.current = Math.max(8, paddleXRef.current - 6.2);
      if (keysRef.current.right) paddleXRef.current = Math.min(W - PADDLE_W - 8, paddleXRef.current + 6.2);

      const ball = ballRef.current;
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - BALL_R <= 0) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x + BALL_R >= W) {
        ball.x = W - BALL_R;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - BALL_R <= 0) {
        ball.y = BALL_R;
        ball.vy = Math.abs(ball.vy);
      }

      // Paddle bounce
      const px = paddleXRef.current;
      if (
        ball.vy > 0 &&
        ball.y + BALL_R >= PADDLE_Y &&
        ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
        ball.x >= px - 4 &&
        ball.x <= px + PADDLE_W + 4
      ) {
        const hitPos = (ball.x - (px + PADDLE_W / 2)) / (PADDLE_W / 2);
        const speed = Math.hypot(ball.vx, ball.vy);
        const angle = hitPos * (Math.PI / 3);
        ball.vx = speed * Math.sin(angle);
        ball.vy = -Math.abs(speed * Math.cos(angle));
        ball.y = PADDLE_Y - BALL_R;
      }

      // Brick collisions
      for (const b of bricksRef.current) {
        if (!b.alive) continue;
        if (
          ball.x + BALL_R >= b.x &&
          ball.x - BALL_R <= b.x + b.w &&
          ball.y + BALL_R >= b.y &&
          ball.y - BALL_R <= b.y + b.h
        ) {
          b.alive = false;
          ball.vy = -ball.vy;
          scoreRef.current += b.pts;
          brokenRef.current += 1;
          setScore(scoreRef.current);
          setBricksBroken(brokenRef.current);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
          }
          break;
        }
      }

      // Wave cleared?
      if (bricksRef.current.every((b) => !b.alive)) {
        waveRef.current += 1;
        scoreRef.current += 50;
        setWave(waveRef.current);
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
        bricksRef.current = buildBricks();
        resetBall(waveRef.current);
      }

      // Bottom out
      if (ball.y - BALL_R > H) {
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
            setAttempts((p) => p + 1);
            onFinishRef.current?.({
              puntaje: scoreRef.current,
              detalleExtra: brokenRef.current,
              modo: `oleada-${waveRef.current}`,
              duracionSegundos: dur,
            });
          }
          drawScene();
          return;
        }
        resetBall(waveRef.current);
      }

      drawScene();
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [status, drawScene, resetBall]);

  const handlePointerMove = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * W;
    paddleXRef.current = Math.max(8, Math.min(W - PADDLE_W - 8, relX - PADDLE_W / 2));
  };

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(216, 180, 254, 0.24)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8B4FE]/35 bg-[#D8B4FE]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E9D5FF]">
              <span className="h-2 w-2 rounded-full bg-[#D8B4FE]" aria-hidden="true" />
              Arcade #02 · Destreza
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ladrillos Cósmicos
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Mueve la barra con el ratón, el dedo o las flechas ←/→ para rebotar la esfera y destruir todos los bloques.
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
            <div className="text-2xl font-black text-[#E9D5FF] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Bloques</div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{bricksBroken}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Vidas · Oleada</div>
            <div className="text-xl font-black text-[#FB7185] tabular-nums">{'♥'.repeat(Math.max(0, lives))} · #{wave}</div>
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

        <div className="flex flex-col items-center gap-4">
          <ArcadeScreenFrame
            className="w-full max-w-[440px] aspect-square touch-none"
            accentColor="rgba(216, 180, 254, 0.35)"
            glowColor="rgba(216, 180, 254, 0.42)"
            bgColor="#090617"
          >
            <canvas
              ref={canvasRef}
              onMouseMove={(e) => handlePointerMove(e.clientX)}
              onTouchMove={(e) => {
                if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
              }}
              className="w-full h-full block"
              aria-label="Tablero de Ladrillos Cósmicos"
            />
            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#090617]/88 flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8B4FE]">
                  {status === 'gameover' ? 'Fin de la partida' : 'Arena lista'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {status === 'gameover' ? `Puntuación: ${score}` : 'Ladrillos Cósmicos'}
                </div>
                {status === 'gameover' && isNewRecord && (
                  <span className="rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                    ¡Nuevo récord personal!
                  </span>
                )}
                <button
                  type="button"
                  onClick={startNewGame}
                  className="min-h-[42px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors cursor-pointer"
                >
                  {status === 'gameover' ? 'Jugar de nuevo' : 'Iniciar partida'}
                </button>
              </div>
            )}
          </ArcadeScreenFrame>
        </div>
      </div>
    </LiquidGlass>
  );
}
