'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

const W = 520;
const H = 580;
const MAX_LEVEL = 10;
const SHIP_Y = H - 36;
const SHIP_W = 40;

interface Alien {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  pts: number;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  vy: number;
}

function buildWave(level: number): Alien[] {
  const list: Alien[] = [];
  const colors = ['#FDE68A', '#6EE7B7', '#67E8F9', '#D8B4FE', '#FDA4AF'];
  const rows = level >= 6 ? 5 : 4;
  const cols = level >= 4 ? 8 : 7;
  const spacingX = Math.floor((W - 88) / cols);
  const startX = Math.floor((W - (cols - 1) * spacingX - 28) / 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      list.push({
        x: startX + c * spacingX,
        y: 36 + r * 34,
        w: 28,
        h: 18,
        alive: true,
        pts: (rows - r) * 10 + (level - 1) * 5,
        color: colors[r % colors.length],
      });
    }
  }
  return list;
}

export default function InvadersArcadeGame({
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
  const [kills, setKills] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [levelBanner, setLevelBanner] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const shipXRef = useRef(W / 2 - SHIP_W / 2);
  const keysRef = useRef({ left: false, right: false, fire: false });
  const aliensRef = useRef<Alien[]>(buildWave(1));
  const alienDirRef = useRef(1);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const lastShotRef = useRef(0);
  const lastEnemyShotRef = useRef(0);

  const scoreRef = useRef(0);
  const killsRef = useRef(0);
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

    ctx.fillStyle = '#04120D';
    ctx.fillRect(0, 0, W, H);

    // Subtle stars
    ctx.fillStyle = 'rgba(110, 231, 183, 0.14)';
    for (let i = 0; i < 18; i++) {
      const sx = ((i * 89 + 23) % (W - 20)) + 10;
      const sy = ((i * 137 + 41) % (H - 40)) + 15;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Aliens
    for (const a of aliensRef.current) {
      if (!a.alive) continue;
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.roundRect(a.x, a.y, a.w, a.h, 4);
      ctx.fill();
      ctx.fillStyle = '#04120D';
      ctx.fillRect(a.x + 6, a.y + 5, 4, 4);
      ctx.fillRect(a.x + a.w - 10, a.y + 5, 4, 4);
    }

    // Player bullets
    ctx.fillStyle = '#FDE68A';
    for (const b of bulletsRef.current) {
      ctx.fillRect(b.x - 2, b.y - 10, 4, 12);
    }

    // Enemy bullets
    ctx.fillStyle = '#FB7185';
    for (const eb of enemyBulletsRef.current) {
      ctx.fillRect(eb.x - 2.5, eb.y, 5, 11);
    }

    // Player Ship (wide spacing from top formation)
    const sx = shipXRef.current;
    ctx.fillStyle = '#67E8F9';
    ctx.beginPath();
    ctx.moveTo(sx + SHIP_W / 2, SHIP_Y - 22);
    ctx.lineTo(sx + SHIP_W, SHIP_Y + 8);
    ctx.lineTo(sx + SHIP_W * 0.72, SHIP_Y + 4);
    ctx.lineTo(sx + SHIP_W * 0.28, SHIP_Y + 4);
    ctx.lineTo(sx, SHIP_Y + 8);
    ctx.closePath();
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

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
        detalleExtra: killsRef.current,
        modo: `nivel-${levelRef.current}`,
        duracionSegundos: dur,
      });
    }
  }, []);

  const startNewGame = useCallback(() => {
    // Always start from level 1
    shipXRef.current = W / 2 - SHIP_W / 2;
    aliensRef.current = buildWave(1);
    alienDirRef.current = 1;
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    scoreRef.current = 0;
    killsRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;

    setIsNewRecord(false);
    setLevelBanner('Nivel 1 / 10');
    setTimeout(() => setLevelBanner(null), 1300);
    setScore(0);
    setKills(0);
    setLives(3);
    setLevel(1);
    setStatus('playing');
  }, []);

  const fireLaser = useCallback(() => {
    const now = Date.now();
    if (now - lastShotRef.current < 210) return;
    lastShotRef.current = now;
    bulletsRef.current.push({ x: shipXRef.current + SHIP_W / 2, y: SHIP_Y - 24, vy: -7.2 });
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = true;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = true;
      if (k === ' ' || k === 'arrowup' || k === 'w') keysRef.current.fire = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = false;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = false;
      if (k === ' ' || k === 'arrowup' || k === 'w') keysRef.current.fire = false;
    };
    window.addEventListener('keydown', down, { passive: false });
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
      if (keysRef.current.left) shipXRef.current = Math.max(10, shipXRef.current - 5.4);
      if (keysRef.current.right) shipXRef.current = Math.min(W - SHIP_W - 10, shipXRef.current + 5.4);
      if (keysRef.current.fire) fireLaser();

      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y + b.vy }))
        .filter((b) => b.y > -14);

      enemyBulletsRef.current = enemyBulletsRef.current
        .map((b) => ({ ...b, y: b.y + b.vy }))
        .filter((b) => b.y < H + 14);

      const aliveAliens = aliensRef.current.filter((a) => a.alive);
      const totalInWave = aliensRef.current.length;
      const speedX =
        (0.95 + levelRef.current * 0.2 + (totalInWave - aliveAliens.length) * 0.035) *
        alienDirRef.current;

      let hitEdge = false;
      for (const a of aliveAliens) {
        a.x += speedX;
        if (a.x <= 14 || a.x + a.w >= W - 14) hitEdge = true;
      }
      if (hitEdge) {
        alienDirRef.current *= -1;
        for (const a of aliveAliens) {
          a.y += 14;
          if (a.y + a.h >= SHIP_Y - 26) {
            finishMatch('gameover');
            draw();
            return;
          }
        }
      }

      const now = Date.now();
      const enemyCooldown = Math.max(380, 1180 - levelRef.current * 75);
      if (aliveAliens.length > 0 && now - lastEnemyShotRef.current > enemyCooldown) {
        lastEnemyShotRef.current = now;
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        enemyBulletsRef.current.push({
          x: shooter.x + shooter.w / 2,
          y: shooter.y + shooter.h,
          vy: 3.4 + levelRef.current * 0.24,
        });
      }

      for (const b of bulletsRef.current) {
        for (const a of aliensRef.current) {
          if (!a.alive) continue;
          if (b.x >= a.x && b.x <= a.x + a.w && b.y >= a.y && b.y <= a.y + a.h) {
            a.alive = false;
            b.y = -100;
            scoreRef.current += a.pts;
            killsRef.current += 1;
            setScore(scoreRef.current);
            setKills(killsRef.current);
            if (scoreRef.current > bestRef.current) {
              bestRef.current = scoreRef.current;
              setBestScore(scoreRef.current);
            }
            break;
          }
        }
      }

      const sx = shipXRef.current;
      for (const eb of enemyBulletsRef.current) {
        if (eb.x >= sx + 2 && eb.x <= sx + SHIP_W - 2 && eb.y >= SHIP_Y - 18 && eb.y <= SHIP_Y + 8) {
          eb.y = H + 50;
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            finishMatch('gameover');
            draw();
            return;
          }
        }
      }

      if (aliensRef.current.every((a) => !a.alive)) {
        if (levelRef.current >= MAX_LEVEL) {
          scoreRef.current += 300;
          setScore(scoreRef.current);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
          }
          finishMatch('victory');
          draw();
          return;
        }
        levelRef.current += 1;
        scoreRef.current += 75;
        setLevel(levelRef.current);
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
        setLevelBanner(`Nivel ${levelRef.current} / ${MAX_LEVEL}`);
        setTimeout(() => setLevelBanner(null), 1300);
        aliensRef.current = buildWave(levelRef.current);
        bulletsRef.current = [];
        enemyBulletsRef.current = [];
      }

      draw();
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [status, draw, fireLaser, finishMatch]);

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(110, 231, 183, 0.24)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6EE7B7]/35 bg-[#6EE7B7]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6EE7B7]">
              <span className="h-2 w-2 rounded-full bg-[#6EE7B7]" aria-hidden="true" />
              Arcade #03 · Campaña de 10 Niveles
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Invasores Arcade
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Siempre inicias en el Nivel 1 y avanzas oleada tras oleada. ¡Supera los 10 niveles para completar la misión!
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
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Nivel</div>
            <div className="text-2xl font-black text-[#6EE7B7] tabular-nums">{level} / {MAX_LEVEL}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Puntos</div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Vidas · Naves</div>
            <div className="text-xl font-black text-[#FB7185] tabular-nums">{'♥'.repeat(Math.max(0, lives))} · {kills}</div>
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
            className="w-full max-w-[520px] aspect-[520/580]"
            accentColor="rgba(110, 231, 183, 0.35)"
            glowColor="rgba(110, 231, 183, 0.42)"
            bgColor="#04120D"
          >
            <canvas ref={canvasRef} className="w-full h-full block" aria-label="Tablero de Invasores Arcade" />

            {status === 'playing' && levelBanner && (
              <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#6EE7B7]/50 bg-[#04120D]/90 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#6EE7B7]">
                {levelBanner}
              </div>
            )}

            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#04120D]/90 flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6EE7B7]">
                  {status === 'victory'
                    ? '¡Misión completada!'
                    : status === 'gameover'
                      ? `Llegaste al Nivel ${level}`
                      : 'Escuadrón listo'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {status === 'victory'
                    ? '¡Felicidades! Superaste los 10 niveles'
                    : status === 'gameover'
                      ? `Puntuación: ${score}`
                      : 'Invasores Arcade'}
                </div>
                {status === 'victory' && (
                  <p className="text-xs sm:text-sm text-[#A7F3D0] max-w-sm">
                    Defendiste la galaxia desde el Nivel 1 hasta el Nivel 10 con {score} puntos y {kills} naves destruidas.
                  </p>
                )}
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onMouseDown={() => (keysRef.current.left = true)}
              onMouseUp={() => (keysRef.current.left = false)}
              onMouseLeave={() => (keysRef.current.left = false)}
              onTouchStart={() => (keysRef.current.left = true)}
              onTouchEnd={() => (keysRef.current.left = false)}
              className="h-12 w-16 rounded-xl border border-white/15 bg-white/[0.08] text-white font-bold text-lg cursor-pointer"
            >
              ←
            </button>
            <button
              type="button"
              onClick={fireLaser}
              className="h-12 px-6 rounded-xl border border-[#6EE7B7]/40 bg-[#6EE7B7]/15 text-[#6EE7B7] font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Disparar
            </button>
            <button
              type="button"
              onMouseDown={() => (keysRef.current.right = true)}
              onMouseUp={() => (keysRef.current.right = false)}
              onMouseLeave={() => (keysRef.current.right = false)}
              onTouchStart={() => (keysRef.current.right = true)}
              onTouchEnd={() => (keysRef.current.right = false)}
              className="h-12 w-16 rounded-xl border border-white/15 bg-white/[0.08] text-white font-bold text-lg cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
}
