'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

const W = 500;
const H = 340;
const PADDLE_H = 74;
const PADDLE_W = 12;
const WIN_GOALS = 7;

export default function PongArcadeGame({
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
  const [playerGoals, setPlayerGoals] = useState(0);
  const [cpuGoals, setCpuGoals] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const playerYRef = useRef(H / 2 - PADDLE_H / 2);
  const cpuYRef = useRef(H / 2 - PADDLE_H / 2);
  const keysRef = useRef({ up: false, down: false });
  const ballRef = useRef({ x: W / 2, y: H / 2, vx: 4.1, vy: 2.6 });
  const pGoalsRef = useRef(0);
  const cGoalsRef = useRef(0);
  const scoreRef = useRef(0);
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

  const resetBall = useCallback((toRight: boolean) => {
    ballRef.current = {
      x: W / 2,
      y: H / 2,
      vx: (toRight ? 1 : -1) * 4.2,
      vy: (Math.random() > 0.5 ? 1 : -1) * (2.1 + Math.random() * 1.4),
    };
  }, []);

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

    ctx.fillStyle = '#060F24';
    ctx.fillRect(0, 0, W, H);

    // Center net
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2, 12);
    ctx.lineTo(W / 2, H - 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = '#67E8F9';
    ctx.beginPath();
    ctx.roundRect(18, playerYRef.current, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // CPU paddle
    ctx.fillStyle = '#93C5FD';
    ctx.beginPath();
    ctx.roundRect(W - 30, cpuYRef.current, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // Ball
    const b = ballRef.current;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 7.5, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const startNewGame = useCallback(() => {
    playerYRef.current = H / 2 - PADDLE_H / 2;
    cpuYRef.current = H / 2 - PADDLE_H / 2;
    pGoalsRef.current = 0;
    cGoalsRef.current = 0;
    scoreRef.current = 0;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;
    resetBall(true);

    setIsNewRecord(false);
    setPlayerGoals(0);
    setCpuGoals(0);
    setScore(0);
    setStatus('playing');
  }, [resetBall]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'arrowdown') e.preventDefault();
      if (k === 'arrowup' || k === 'w') keysRef.current.up = true;
      if (k === 'arrowdown' || k === 's') keysRef.current.down = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') keysRef.current.up = false;
      if (k === 'arrowdown' || k === 's') keysRef.current.down = false;
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
      if (keysRef.current.up) playerYRef.current = Math.max(8, playerYRef.current - 5.8);
      if (keysRef.current.down) playerYRef.current = Math.min(H - PADDLE_H - 8, playerYRef.current + 5.8);

      const b = ballRef.current;

      // CPU AI follows ball smoothly
      const cpuCenter = cpuYRef.current + PADDLE_H / 2;
      if (cpuCenter < b.y - 10) cpuYRef.current = Math.min(H - PADDLE_H - 8, cpuYRef.current + 3.9);
      else if (cpuCenter > b.y + 10) cpuYRef.current = Math.max(8, cpuYRef.current - 3.9);

      b.x += b.vx;
      b.y += b.vy;

      if (b.y - 7.5 <= 0) {
        b.y = 7.5;
        b.vy = Math.abs(b.vy);
      } else if (b.y + 7.5 >= H) {
        b.y = H - 7.5;
        b.vy = -Math.abs(b.vy);
      }

      // Player paddle collision
      if (
        b.vx < 0 &&
        b.x - 7.5 <= 30 &&
        b.x - 7.5 >= 14 &&
        b.y >= playerYRef.current - 6 &&
        b.y <= playerYRef.current + PADDLE_H + 6
      ) {
        const hit = (b.y - (playerYRef.current + PADDLE_H / 2)) / (PADDLE_H / 2);
        b.vx = Math.min(8.2, Math.abs(b.vx) * 1.06);
        const rawVy = hit * 4.5;
        b.vy = Math.abs(rawVy) < 0.7 ? (rawVy >= 0 ? 0.85 : -0.85) : rawVy;
        b.x = 38;
        scoreRef.current += 10;
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
      }

      // CPU paddle collision
      if (
        b.vx > 0 &&
        b.x + 7.5 >= W - 30 &&
        b.x + 7.5 <= W - 14 &&
        b.y >= cpuYRef.current - 6 &&
        b.y <= cpuYRef.current + PADDLE_H + 6
      ) {
        const hit = (b.y - (cpuYRef.current + PADDLE_H / 2)) / (PADDLE_H / 2);
        b.vx = -Math.min(8.2, Math.abs(b.vx) * 1.05);
        b.vy = hit * 4.5;
        b.x = W - 38;
      }

      // Goals
      if (b.x > W + 10) {
        pGoalsRef.current += 1;
        scoreRef.current += 50;
        setPlayerGoals(pGoalsRef.current);
        setScore(scoreRef.current);
        if (scoreRef.current > bestRef.current) {
          bestRef.current = scoreRef.current;
          setBestScore(scoreRef.current);
        }
        resetBall(false);
      } else if (b.x < -10) {
        cGoalsRef.current += 1;
        setCpuGoals(cGoalsRef.current);
        resetBall(true);
      }

      if (pGoalsRef.current >= WIN_GOALS || cGoalsRef.current >= WIN_GOALS) {
        if (pGoalsRef.current >= WIN_GOALS) {
          scoreRef.current += 120;
          setScore(scoreRef.current);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
          }
        }
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
            detalleExtra: pGoalsRef.current,
            modo: `${pGoalsRef.current}-${cGoalsRef.current}`,
            duracionSegundos: dur,
          });
        }
        draw();
        return;
      }

      draw();
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [status, draw, resetBall]);

  const handlePointerMove = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relY = ((clientY - rect.top) / rect.height) * H;
    playerYRef.current = Math.max(8, Math.min(H - PADDLE_H - 8, relY - PADDLE_H / 2));
  };

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(147, 197, 253, 0.24)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#93C5FD]/35 bg-[#93C5FD]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#93C5FD]">
              <span className="h-2 w-2 rounded-full bg-[#93C5FD]" aria-hidden="true" />
              Arcade #06 · Duelo 1v1
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pong Nebular
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Duelo a {WIN_GOALS} goles contra la CPU. Controla tu barra izquierda con el ratón, el dedo o las flechas ↑/↓.
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
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Marcador (Tú - CPU)</div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{playerGoals} - {cpuGoals}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Puntos</div>
            <div className="text-2xl font-black text-[#93C5FD] tabular-nums">{score}</div>
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

        <div className="flex justify-center">
          <ArcadeScreenFrame
            className="w-full max-w-[500px] aspect-[500/340] touch-none"
            accentColor="rgba(147, 197, 253, 0.35)"
            glowColor="rgba(147, 197, 253, 0.42)"
            bgColor="#060F24"
          >
            <canvas
              ref={canvasRef}
              onMouseMove={(e) => handlePointerMove(e.clientY)}
              onTouchMove={(e) => {
                if (e.touches[0]) handlePointerMove(e.touches[0].clientY);
              }}
              className="w-full h-full block"
              aria-label="Tablero de Pong Nebular"
            />
            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#060F24]/88 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="text-2xl font-black text-white">
                  {status === 'gameover'
                    ? playerGoals >= WIN_GOALS
                      ? `¡Victoria ${playerGoals}-${cpuGoals}! (${score} pts)`
                      : `Fin del duelo ${playerGoals}-${cpuGoals} (${score} pts)`
                    : 'Pong Nebular'}
                </div>
                {status === 'gameover' && isNewRecord && (
                  <span className="rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                    ¡Nuevo récord personal!
                  </span>
                )}
                <button
                  type="button"
                  onClick={startNewGame}
                  className="min-h-[42px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 cursor-pointer"
                >
                  {status === 'gameover' ? 'Revancha' : 'Iniciar duelo'}
                </button>
              </div>
            )}
          </ArcadeScreenFrame>
        </div>
      </div>
    </LiquidGlass>
  );
}
