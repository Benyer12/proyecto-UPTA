'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

const W = 520;
const H = 560;
const MAX_LEVEL = 20;
const PADDLE_W = 96;
const PADDLE_H = 13;
const PADDLE_Y = H - 36;
const BALL_R = 7.5;
const BRICK_COLORS = ['#F472B6', '#D8B4FE', '#67E8F9', '#6EE7B7'];

type BrickKind = 'normal' | 'reinforced' | 'crystal' | 'speed' | 'nova';

interface Brick {
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  kind: BrickKind;
  hp: number;
  maxHp: number;
  color: string;
  pts: number;
}

function buildBricksForLevel(level: number): Brick[] {
  const bricks: Brick[] = [];
  const cols = 8;
  const rows = level >= 12 ? 6 : level >= 5 ? 5 : 4;
  const bw = 54;
  const bh = 18;
  const gap = 8;
  const offsetX = (W - (cols * bw + (cols - 1) * gap)) / 2;
  const offsetY = 44;
  const pattern = (level - 1) % 5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let include = true;
      if (pattern === 1) include = (r + c) % 2 === 0 || r === 0;
      else if (pattern === 2) include = c >= r && c < cols - r;
      else if (pattern === 3) include = c !== 3 && c !== 4 ? true : r < 2;
      else if (pattern === 4) include = r % 2 === 0 || c === 0 || c === cols - 1;

      if (!include) continue;

      let kind: BrickKind = 'normal';
      let hp = 1;
      let color = BRICK_COLORS[(r + level - 1) % BRICK_COLORS.length];
      let pts = 15 + (rows - r) * 5;

      // Determine brick type and strength according to level progression
      if (level >= 7 && r === 0 && (c === 1 || c === cols - 2)) {
        kind = 'crystal';
        hp = 3;
        color = '#FBBF24';
        pts = 60;
      } else if ((level >= 2 && r === 0) || (level >= 10 && r === 1 && c % 2 === 0)) {
        kind = 'reinforced';
        hp = 2;
        color = '#94A3B8';
        pts = 35;
      } else if (level >= 3 && (r + c + level) % 9 === 0) {
        kind = 'speed';
        hp = 1;
        color = '#EC4899';
        pts = 40;
      } else if (level >= 4 && (r * 7 + c + level) % 13 === 0) {
        kind = 'nova';
        hp = 1;
        color = '#FB7185';
        pts = 45;
      }

      bricks.push({
        row: r,
        col: c,
        x: offsetX + c * (bw + gap),
        y: offsetY + r * (bh + gap),
        w: bw,
        h: bh,
        alive: true,
        kind,
        hp,
        maxHp: hp,
        color,
        pts,
      });
    }
  }
  return bricks.length > 0 ? bricks : buildBricksForLevel(1);
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
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState(0);
  const [bricksBroken, setBricksBroken] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [ballSpeedLabel, setBallSpeedLabel] = useState('1.0x');
  const [levelBanner, setLevelBanner] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const paddleXRef = useRef((W - PADDLE_W) / 2);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const ballRef = useRef({ x: W / 2, y: PADDLE_Y - 14, vx: 3.5, vy: -4.0 });
  const turboBoostRef = useRef(0);
  const bricksRef = useRef<Brick[]>(buildBricksForLevel(1));
  const scoreRef = useRef(0);
  const brokenRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
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

  const computeTargetSpeed = useCallback((lvl: number, extraTurbo: number) => {
    const base = 5.2 + (lvl - 1) * 0.16 + extraTurbo;
    return Math.min(9.6, base);
  }, []);

  const resetBall = useCallback(
    (lvl: number) => {
      turboBoostRef.current = 0;
      const spd = computeTargetSpeed(lvl, 0);
      setBallSpeedLabel(`${(spd / 5.2).toFixed(1)}x`);
      const angle = (Math.random() > 0.5 ? 1 : -1) * (0.42 + Math.random() * 0.2);
      ballRef.current = {
        x: W / 2,
        y: PADDLE_Y - 14,
        vx: Math.sin(angle) * spd,
        vy: -Math.cos(angle) * spd,
      };
    },
    [computeTargetSpeed],
  );

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

    ctx.strokeStyle = 'rgba(216, 180, 254, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 26; x < W; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Draw varied beveled retro bricks with HP indicators & cracks
    for (const b of bricksRef.current) {
      if (!b.alive) continue;

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();

      // Retro top bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 3);

      // Kind-specific retro details
      if (b.kind === 'reinforced') {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
        ctx.fillStyle = '#334155';
        ctx.fillRect(b.x + 4, b.y + 6, 3, 5);
        ctx.fillRect(b.x + b.w - 7, b.y + 6, 3, 5);
      } else if (b.kind === 'crystal') {
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(b.x + 10, b.y + 2);
        ctx.lineTo(b.x + 4, b.y + b.h - 2);
        ctx.moveTo(b.x + b.w - 10, b.y + 2);
        ctx.lineTo(b.x + b.w - 4, b.y + b.h - 2);
        ctx.stroke();
      } else if (b.kind === 'speed') {
        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', b.x + b.w / 2, b.y + 13);
      } else if (b.kind === 'nova') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2, b.y + b.h / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Visible crack overlay when damaged (hp < maxHp)
      if (b.hp < b.maxHp) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w * 0.35, b.y + 2);
        ctx.lineTo(b.x + b.w * 0.48, b.y + b.h * 0.55);
        ctx.lineTo(b.x + b.w * 0.4, b.y + b.h - 2);
        if (b.maxHp - b.hp >= 2) {
          ctx.moveTo(b.x + b.w * 0.68, b.y + 2);
          ctx.lineTo(b.x + b.w * 0.6, b.y + b.h * 0.6);
          ctx.lineTo(b.x + b.w * 0.72, b.y + b.h - 2);
        }
        ctx.stroke();
      }
    }

    // Sleek metallic arcade paddle
    const px = paddleXRef.current;
    ctx.fillStyle = '#E9D5FF';
    ctx.beginPath();
    ctx.roundRect(px, PADDLE_Y, PADDLE_W, PADDLE_H, 6);
    ctx.fill();
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(px + 2, PADDLE_Y + 2, 12, PADDLE_H - 4);
    ctx.fillRect(px + PADDLE_W - 14, PADDLE_Y + 2, 12, PADDLE_H - 4);

    // Ball with speed glow
    const ball = ballRef.current;
    ctx.fillStyle = turboBoostRef.current > 0 ? '#F472B6' : '#FDE68A';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  const finishMatch = useCallback((finalState: 'gameover' | 'victory') => {
    setStatus(finalState);
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
        modo: `nivel-${levelRef.current}`,
        duracionSegundos: dur,
      });
    }
  }, []);

  const startNewGame = useCallback(() => {
    paddleXRef.current = (W - PADDLE_W) / 2;
    bricksRef.current = buildBricksForLevel(1);
    scoreRef.current = 0;
    brokenRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;
    resetBall(1);

    setIsNewRecord(false);
    setLevelBanner(`Nivel 1 / ${MAX_LEVEL}`);
    setTimeout(() => setLevelBanner(null), 1300);
    setScore(0);
    setBricksBroken(0);
    setLives(3);
    setLevel(1);
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

    const damageBrick = (brick: Brick) => {
      if (!brick.alive) return;
      brick.hp -= 1;
      if (brick.hp <= 0) {
        brick.alive = false;
        scoreRef.current += brick.pts;
        brokenRef.current += 1;

        if (brick.kind === 'speed') {
          turboBoostRef.current = Math.min(2.2, turboBoostRef.current + 0.55);
          const ball = ballRef.current;
          const nextSpd = computeTargetSpeed(levelRef.current, turboBoostRef.current);
          const curSpd = Math.hypot(ball.vx, ball.vy) || 1;
          ball.vx = (ball.vx / curSpd) * nextSpd;
          ball.vy = (ball.vy / curSpd) * nextSpd;
          setBallSpeedLabel(`${(nextSpd / 5.2).toFixed(1)}x`);
        } else if (brick.kind === 'nova') {
          // Nova explosion damages neighboring bricks
          for (const other of bricksRef.current) {
            if (
              other.alive &&
              Math.abs(other.row - brick.row) <= 1 &&
              Math.abs(other.col - brick.col) <= 1
            ) {
              other.hp -= 1;
              if (other.hp <= 0) {
                other.alive = false;
                scoreRef.current += other.pts;
                brokenRef.current += 1;
              }
            }
          }
        }

        setScore(scoreRef.current);
        setBricksBroken(brokenRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
      } else {
        scoreRef.current += 10;
        setScore(scoreRef.current);
      }
    };

    const step = () => {
      if (keysRef.current.left) paddleXRef.current = Math.max(8, paddleXRef.current - 7.0);
      if (keysRef.current.right) paddleXRef.current = Math.min(W - PADDLE_W - 8, paddleXRef.current + 7.0);

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

      for (const b of bricksRef.current) {
        if (!b.alive) continue;
        if (
          ball.x + BALL_R >= b.x &&
          ball.x - BALL_R <= b.x + b.w &&
          ball.y + BALL_R >= b.y &&
          ball.y - BALL_R <= b.y + b.h
        ) {
          ball.vy = -ball.vy;
          damageBrick(b);
          break;
        }
      }

      if (bricksRef.current.every((b) => !b.alive)) {
        if (levelRef.current >= MAX_LEVEL) {
          scoreRef.current += 500;
          setScore(scoreRef.current);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
          }
          finishMatch('victory');
          drawScene();
          return;
        }
        levelRef.current += 1;
        scoreRef.current += 60;
        setLevel(levelRef.current);
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
        setLevelBanner(`Nivel ${levelRef.current} / ${MAX_LEVEL}`);
        setTimeout(() => setLevelBanner(null), 1300);
        bricksRef.current = buildBricksForLevel(levelRef.current);
        resetBall(levelRef.current);
      }

      if (ball.y - BALL_R > H) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          finishMatch('gameover');
          drawScene();
          return;
        }
        resetBall(levelRef.current);
      }

      drawScene();
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [status, drawScene, resetBall, finishMatch, computeTargetSpeed]);

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
              Arcade #02 · Campaña de 20 Niveles
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ladrillos Cósmicos
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Ladrillos de acero (2 golpes), cristal (3 golpes), turbo ⚡ (acelera la pelota) y bomba Nova ✦ que explota en área.
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

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Nivel</div>
            <div className="text-xl font-black text-[#E9D5FF] tabular-nums">{level} / {MAX_LEVEL}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Puntos</div>
            <div className="text-xl font-black text-[#67E8F9] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Velocidad</div>
            <div className="text-xl font-black text-[#F472B6] tabular-nums">{ballSpeedLabel}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Vidas · Bloques</div>
            <div className="text-lg font-black text-[#FB7185] tabular-nums">{'♥'.repeat(Math.max(0, lives))} · {bricksBroken}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Intentos</div>
            <div className="text-xl font-black text-white tabular-nums">{attempts}</div>
          </div>
          <div className="rounded-2xl border border-[#FDE68A]/25 bg-[#FDE68A]/[0.06] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#FDE68A]">Récord</div>
            <div className="text-xl font-black text-[#FDE68A] tabular-nums">{bestScore}</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <ArcadeScreenFrame
            className="w-full max-w-[520px] aspect-[520/560] touch-none"
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
            {status === 'playing' && levelBanner && (
              <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#D8B4FE]/50 bg-[#090617]/90 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#E9D5FF]">
                {levelBanner}
              </div>
            )}
            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#090617]/90 flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#D8B4FE]">
                  {status === 'victory'
                    ? '¡Campeón de la arena!'
                    : status === 'gameover'
                      ? `Llegaste al Nivel ${level}`
                      : 'Arena lista'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {status === 'victory'
                    ? '¡Felicidades! Completaste los 20 niveles'
                    : status === 'gameover'
                      ? `Puntuación: ${score}`
                      : 'Ladrillos Cósmicos'}
                </div>
                {(status === 'gameover' || status === 'victory') && isNewRecord && (
                  <span className="rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                    ¡Nuevo récord personal!
                  </span>
                )}
                <button
                  type="button"
                  onClick={startNewGame}
                  className="min-h-[42px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors cursor-pointer"
                >
                  {status === 'idle' ? 'Iniciar desde Nivel 1' : 'Jugar de nuevo desde Nivel 1'}
                </button>
              </div>
            )}
          </ArcadeScreenFrame>
        </div>
      </div>
    </LiquidGlass>
  );
}
