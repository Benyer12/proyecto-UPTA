'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';

const W = 540;
const H = 260;
const GROUND_Y = 212;
const ROVER_X = 64;
const ROVER_W = 32;
const ROVER_H = 30;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  passed: boolean;
}

export default function RunnerArcadeGame({
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
  const [jumpsCleared, setJumpsCleared] = useState(0);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const yRef = useRef(GROUND_Y - ROVER_H);
  const vyRef = useRef(0);
  const jumpCountRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const spawnTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const clearedRef = useRef(0);
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

    ctx.fillStyle = '#150711';
    ctx.fillRect(0, 0, W, H);

    // Horizon line
    ctx.strokeStyle = 'rgba(253, 164, 175, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    // Obstacles
    for (const o of obstaclesRef.current) {
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.moveTo(o.x, GROUND_Y);
      ctx.lineTo(o.x + o.w / 2, GROUND_Y - o.h);
      ctx.lineTo(o.x + o.w, GROUND_Y);
      ctx.closePath();
      ctx.fill();
    }

    // Rover
    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.roundRect(ROVER_X, yRef.current, ROVER_W, ROVER_H, 7);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ROVER_X + 19, yRef.current + 7, 7, 7);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const startNewGame = useCallback(() => {
    yRef.current = GROUND_Y - ROVER_H;
    vyRef.current = 0;
    jumpCountRef.current = 0;
    obstaclesRef.current = [{ x: W + 80, w: 26, h: 32, passed: false }];
    spawnTimerRef.current = 0;
    scoreRef.current = 0;
    clearedRef.current = 0;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;

    setIsNewRecord(false);
    setScore(0);
    setJumpsCleared(0);
    setStatus('playing');
  }, []);

  const triggerJump = useCallback(() => {
    if (status === 'idle' || status === 'gameover') {
      startNewGame();
      return;
    }
    if (jumpCountRef.current < 2) {
      vyRef.current = -10.8;
      jumpCountRef.current += 1;
    }
  }, [status, startNewGame]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'arrowup' || k === 'w') {
        e.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener('keydown', down, { passive: false });
    return () => window.removeEventListener('keydown', down);
  }, [triggerJump]);

  useEffect(() => {
    if (status !== 'playing') return;
    let rafId = 0;
    let tick = 0;

    const step = () => {
      tick += 1;
      const speed = Math.min(8.8, 4.4 + clearedRef.current * 0.14);

      vyRef.current += 0.56;
      yRef.current += vyRef.current;
      if (yRef.current >= GROUND_Y - ROVER_H) {
        yRef.current = GROUND_Y - ROVER_H;
        vyRef.current = 0;
        jumpCountRef.current = 0;
      }

      spawnTimerRef.current += 1;
      if (spawnTimerRef.current > Math.max(46, 85 - clearedRef.current * 1.2)) {
        spawnTimerRef.current = 0;
        obstaclesRef.current.push({
          x: W + 20,
          w: 22 + Math.floor(Math.random() * 14),
          h: 26 + Math.floor(Math.random() * 20),
          passed: false,
        });
      }

      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x + o.w > -20);

      for (const o of obstaclesRef.current) {
        if (!o.passed && o.x + o.w < ROVER_X) {
          o.passed = true;
          clearedRef.current += 1;
          scoreRef.current += 15;
          setJumpsCleared(clearedRef.current);
        }

        // Collision AABB with friendly padding
        if (
          ROVER_X + ROVER_W - 6 > o.x + 4 &&
          ROVER_X + 6 < o.x + o.w - 4 &&
          yRef.current + ROVER_H - 4 > GROUND_Y - o.h + 4
        ) {
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
              detalleExtra: clearedRef.current,
              modo: 'doble-salto',
              duracionSegundos: dur,
            });
          }
          draw();
          return;
        }
      }

      if (tick % 8 === 0) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
      }

      draw();
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [status, draw]);

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(253, 164, 175, 0.24)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FDA4AF]/35 bg-[#FDA4AF]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FDA4AF]">
              <span className="h-2 w-2 rounded-full bg-[#FDA4AF]" aria-hidden="true" />
              Arcade #05 · Plataformas
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Salto Orbital
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Pulsa Espacio, ↑, W o toca el tablero para saltar (¡soporta doble salto en el aire!).
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Puntos</div>
            <div className="text-2xl font-black text-[#FDA4AF] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Saltos superados</div>
            <div className="text-2xl font-black text-[#FDE68A] tabular-nums">{jumpsCleared}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Intentos</div>
            <div className="text-2xl font-black text-white tabular-nums">{attempts}</div>
          </div>
          <div className="rounded-2xl border border-[#FDE68A]/25 bg-[#FDE68A]/[0.06] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#FDE68A]">Récord</div>
            <div className="text-2xl font-black text-[#FDE68A] tabular-nums">{bestScore}</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div
            onClick={status === 'playing' ? triggerJump : undefined}
            className="relative w-full max-w-[540px] aspect-[540/260] rounded-2xl overflow-hidden border-2 border-[#FDA4AF]/35 shadow-[0_0_45px_-14px_rgba(253,164,175,0.45)] bg-[#150711] cursor-pointer"
          >
            <canvas ref={canvasRef} className="w-full h-full block" aria-label="Tablero de Salto Orbital" />
            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#150711]/84 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center gap-3">
                <div className="text-2xl font-black text-white">
                  {status === 'gameover' ? `Puntuación: ${score}` : 'Salto Orbital'}
                </div>
                {status === 'gameover' && isNewRecord && (
                  <span className="rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                    ¡Nuevo récord personal!
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame();
                  }}
                  className="min-h-[40px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 cursor-pointer"
                >
                  {status === 'gameover' ? 'Correr de nuevo' : 'Iniciar carrera'}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={triggerJump}
            className="min-h-[44px] px-8 rounded-full border border-[#FDA4AF]/40 bg-[#FDA4AF]/15 text-[#FDA4AF] font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Saltar / Doble salto
          </button>
        </div>
      </div>
    </LiquidGlass>
  );
}
