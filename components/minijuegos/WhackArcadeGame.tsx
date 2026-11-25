'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';

type TargetKind = 'cyan' | 'gold' | 'violet';

interface ActiveTarget {
  cell: number;
  kind: TargetKind;
  points: number;
  glyph: string;
}

const MATCH_SECONDS = 30;

export default function WhackArcadeGame({
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
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState(MATCH_SECONDS);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [target, setTarget] = useState<ActiveTarget | null>(null);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const scoreRef = useRef(0);
  const hitsRef = useRef(0);
  const bestRef = useRef(initialBestScore);
  const startBestRef = useRef(initialBestScore);
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

  const spawnTarget = useCallback((prevCell?: number) => {
    let cell = Math.floor(Math.random() * 9);
    if (prevCell !== undefined && cell === prevCell) {
      cell = (cell + 3) % 9;
    }
    const roll = Math.random();
    const picked: ActiveTarget =
      roll > 0.85
        ? { cell, kind: 'violet', points: 30, glyph: '☄️' }
        : roll > 0.52
          ? { cell, kind: 'gold', points: 20, glyph: '★' }
          : { cell, kind: 'cyan', points: 10, glyph: '✦' };
    setTarget(picked);
  }, []);

  const startNewGame = useCallback(() => {
    scoreRef.current = 0;
    hitsRef.current = 0;
    startBestRef.current = bestRef.current;
    reportedRef.current = false;
    setIsNewRecord(false);
    setScore(0);
    setHits(0);
    setTimeLeft(MATCH_SECONDS);
    setStatus('playing');
    spawnTarget();
  }, [spawnTarget]);

  useEffect(() => {
    if (status !== 'playing') return;
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setStatus('gameover');
          setTarget(null);
          if (!reportedRef.current) {
            reportedRef.current = true;
            if (scoreRef.current > startBestRef.current && scoreRef.current > 0) {
              setIsNewRecord(true);
            }
            setAttempts((a) => a + 1);
            onFinishRef.current?.({
              puntaje: scoreRef.current,
              detalleExtra: hitsRef.current,
              modo: '30-segundos',
              duracionSegundos: MATCH_SECONDS,
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    const moveTimer = setInterval(() => {
      spawnTarget(target?.cell);
    }, Math.max(580, 960 - hits * 10));
    return () => clearInterval(moveTimer);
  }, [status, hits, target?.cell, spawnTarget]);

  const handleCellClick = (idx: number) => {
    if (status !== 'playing' || !target || target.cell !== idx) return;
    scoreRef.current += target.points;
    hitsRef.current += 1;
    setScore(scoreRef.current);
    setHits(hitsRef.current);
    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
    }
    spawnTarget(idx);
  };

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(94, 234, 212, 0.24)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5EEAD4]/35 bg-[#5EEAD4]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5EEAD4]">
              <span className="h-2 w-2 rounded-full bg-[#5EEAD4]" aria-hidden="true" />
              Arcade #08 · Velocidad
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Caza Cometas
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Tienes {MATCH_SECONDS} segundos para atrapar cometas (30 pts), estrellas (20 pts) y destellos (10 pts).
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
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Tiempo</div>
            <div className="text-2xl font-black text-[#FB7185] tabular-nums">{timeLeft}s</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Puntos</div>
            <div className="text-2xl font-black text-[#5EEAD4] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Aciertos</div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{hits}</div>
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

        <div className="max-w-sm mx-auto space-y-4">
          <div className="grid grid-cols-3 gap-3.5">
            {Array.from({ length: 9 }, (_, idx) => {
              const isActive = status === 'playing' && target?.cell === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCellClick(idx)}
                  className={`aspect-square rounded-3xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                    isActive
                      ? target.kind === 'violet'
                        ? 'border-[#D8B4FE] bg-[#D8B4FE]/25 scale-105 shadow-[0_0_24px_rgba(216,180,254,0.45)]'
                        : target.kind === 'gold'
                          ? 'border-[#FDE68A] bg-[#FDE68A]/25 scale-105 shadow-[0_0_24px_rgba(253,230,138,0.45)]'
                          : 'border-[#5EEAD4] bg-[#5EEAD4]/25 scale-105 shadow-[0_0_24px_rgba(94,234,212,0.45)]'
                      : 'border-white/12 bg-white/[0.04] hover:bg-white/[0.08]'
                  }`}
                >
                  {isActive ? (
                    <>
                      <span className="text-3xl leading-none">{target.glyph}</span>
                      <span className="text-[10px] font-extrabold text-white mt-1">+{target.points}</span>
                    </>
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-white/15" />
                  )}
                </button>
              );
            })}
          </div>

          {status !== 'playing' && (
            <div className="rounded-2xl border border-[#5EEAD4]/35 bg-[#5EEAD4]/10 p-4 text-center space-y-2.5">
              {status === 'gameover' && isNewRecord && (
                <div className="inline-block rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                  ¡Nuevo récord personal!
                </div>
              )}
              <div className="text-lg font-extrabold text-white">
                {status === 'gameover'
                  ? `¡Tiempo agotado! Lograste ${score} pts (${hits} aciertos)`
                  : '¿Listo para cazar cometas?'}
              </div>
              <button
                type="button"
                onClick={startNewGame}
                className="min-h-[42px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 cursor-pointer"
              >
                {status === 'gameover' ? 'Jugar de nuevo' : 'Iniciar 30s'}
              </button>
            </div>
          )}
        </div>
      </div>
    </LiquidGlass>
  );
}
