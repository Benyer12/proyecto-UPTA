'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';

const W = 440;
const H = 440;

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

function buildWave(wave: number): Alien[] {
  const list: Alien[] = [];
  const colors = ['#FDE68A', '#6EE7B7', '#67E8F9', '#D8B4FE'];
  const rows = 4;
  const cols = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      list.push({
        x: 44 + c * 50,
        y: 42 + r * 34,
        w: 28,
        h: 18,
        alive: true,
        pts: (rows - r) * 10 + (wave - 1) * 5,
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
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const shipXRef = useRef(W / 2 - 18);
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
      ctx.fillRect(b.x - 2, b.y - 8, 4, 10);
    }

    // Enemy bullets
    ctx.fillStyle = '#FB7185';
    for (const eb of enemyBulletsRef.current) {
      ctx.fillRect(eb.x - 2, eb.y, 4, 9);
    }

    // Ship
    const sx = shipXRef.current;
    ctx.fillStyle = '#67E8F9';
    ctx.beginPath();
    ctx.moveTo(sx + 18, H - 42);
    ctx.lineTo(sx + 36, H - 18);
    ctx.lineTo(sx, H - 18);
    ctx.closePath();
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const finishMatch = useCallback(() => {
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
        detalleExtra: killsRef.current,
        modo: `oleada-${waveRef.current}`,
        duracionSegundos: dur,
      });
    }
  }, []);

  const startNewGame = useCallback(() => {
    shipXRef.current = W / 2 - 18;
    aliensRef.current = buildWave(1);
    alienDirRef.current = 1;
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    scoreRef.current = 0;
    killsRef.current = 0;
    livesRef.current = 3;
    waveRef.current = 1;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;

    setIsNewRecord(false);
    setScore(0);
    setKills(0);
    setLives(3);
    setWave(1);
    setStatus('playing');
  }, []);

  const fireLaser = useCallback(() => {
    const now = Date.now();
    if (now - lastShotRef.current < 240) return;
    lastShotRef.current = now;
    bulletsRef.current.push({ x: shipXRef.current + 18, y: H - 44, vy: -6.5 });
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
      if (keysRef.current.left) shipXRef.current = Math.max(8, shipXRef.current - 5);
      if (keysRef.current.right) shipXRef.current = Math.min(W - 44, shipXRef.current + 5);
      if (keysRef.current.fire) fireLaser();

      // Move bullets
      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y + b.vy }))
        .filter((b) => b.y > -12);

      enemyBulletsRef.current = enemyBulletsRef.current
        .map((b) => ({ ...b, y: b.y + b.vy }))
        .filter((b) => b.y < H + 12);

      // Move aliens
      const aliveAliens = aliensRef.current.filter((a) => a.alive);
      const speedX = (1.1 + waveRef.current * 0.25 + (28 - aliveAliens.length) * 0.04) * alienDirRef.current;
      let hitEdge = false;
      for (const a of aliveAliens) {
        a.x += speedX;
        if (a.x <= 12 || a.x + a.w >= W - 12) hitEdge = true;
      }
      if (hitEdge) {
        alienDirRef.current *= -1;
        for (const a of aliveAliens) {
          a.y += 14;
          if (a.y + a.h >= H - 46) {
            finishMatch();
            draw();
            return;
          }
        }
      }

      // Enemy shoots occasionally
      const now = Date.now();
      if (aliveAliens.length > 0 && now - lastEnemyShotRef.current > Math.max(450, 1150 - waveRef.current * 120)) {
        lastEnemyShotRef.current = now;
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        enemyBulletsRef.current.push({
          x: shooter.x + shooter.w / 2,
          y: shooter.y + shooter.h,
          vy: 3.6 + waveRef.current * 0.25,
        });
      }

      // Check player bullets vs aliens
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

      // Enemy bullets vs player ship
      const sx = shipXRef.current;
      for (const eb of enemyBulletsRef.current) {
        if (eb.x >= sx && eb.x <= sx + 36 && eb.y >= H - 40 && eb.y <= H - 16) {
          eb.y = H + 50;
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            finishMatch();
            draw();
            return;
          }
        }
      }

      // Wave cleared
      if (aliensRef.current.every((a) => !a.alive)) {
        waveRef.current += 1;
        scoreRef.current += 60;
        setWave(waveRef.current);
        setScore(scoreRef.current);
        aliensRef.current = buildWave(waveRef.current);
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
              Arcade #03 · Acción Retro
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Invasores Arcade
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Muévete con ←/→ o A/D y dispara láseres con Espacio o con los controles en pantalla.
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
            <div className="text-2xl font-black text-[#6EE7B7] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Naves</div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{kills}</div>
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
          <div className="relative w-full max-w-[440px] aspect-square rounded-2xl overflow-hidden border-2 border-[#6EE7B7]/35 shadow-[0_0_45px_-14px_rgba(110,231,183,0.45)] bg-[#04120D]">
            <canvas ref={canvasRef} className="w-full h-full block" aria-label="Tablero de Invasores Arcade" />
            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#04120D]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6EE7B7]">
                  {status === 'gameover' ? 'Base comprometida' : 'Escuadrón listo'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {status === 'gameover' ? `Puntuación: ${score}` : 'Invasores Arcade'}
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
          </div>

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
