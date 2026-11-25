'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

const COLS = 10;
const ROWS = 20;
const CELL = 22;

const SHAPES = [
  { matrix: [[1, 1, 1, 1]], color: '#67E8F9' }, // I
  { matrix: [[1, 1], [1, 1]], color: '#FDE68A' }, // O
  { matrix: [[0, 1, 0], [1, 1, 1]], color: '#C4B5FD' }, // T
  { matrix: [[0, 1, 1], [1, 1, 0]], color: '#6EE7B7' }, // S
  { matrix: [[1, 1, 0], [0, 1, 1]], color: '#FB7185' }, // Z
  { matrix: [[1, 0, 0], [1, 1, 1]], color: '#93C5FD' }, // J
  { matrix: [[0, 0, 1], [1, 1, 1]], color: '#FDBA74' }, // L
];

type BoardGrid = (string | null)[][];

function emptyBoard(): BoardGrid {
  return Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
}

function rotateMatrix(m: number[][]): number[][] {
  const rows = m.length;
  const cols = m[0].length;
  const out = Array.from({ length: cols }, () => Array<number>(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out[c][rows - 1 - r] = m[r][c];
    }
  }
  return out;
}

function randomPiece() {
  const tpl = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    matrix: tpl.matrix.map((row) => [...row]),
    color: tpl.color,
    x: Math.floor((COLS - tpl.matrix[0].length) / 2),
    y: 0,
  };
}

export default function TetrisArcadeGame({
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
  const [linesCleared, setLinesCleared] = useState(0);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const boardRef = useRef<BoardGrid>(emptyBoard());
  const pieceRef = useRef(randomPiece());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
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

  const collides = useCallback((board: BoardGrid, matrix: number[][], px: number, py: number) => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (!matrix[r][c]) continue;
        const nx = px + c;
        const ny = py + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && board[ny][nx] !== null) return true;
      }
    }
    return false;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = COLS * CELL;
    const h = ROWS * CELL;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#0D091D';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(196, 181, 253, 0.08)';
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, h);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(w, y * CELL);
      ctx.stroke();
    }

    const drawCell = (cx: number, cy: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(cx * CELL + 1.5, cy * CELL + 1.5, CELL - 3, CELL - 3, 4);
      ctx.fill();
    };

    const board = boardRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const col = board[r][c];
        if (col) drawCell(c, r, col);
      }
    }

    const p = pieceRef.current;
    for (let r = 0; r < p.matrix.length; r++) {
      for (let c = 0; c < p.matrix[r].length; c++) {
        if (p.matrix[r][c]) drawCell(p.x + c, p.y + r, p.color);
      }
    }
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const lockPiece = useCallback(() => {
    const p = pieceRef.current;
    const b = boardRef.current;
    for (let r = 0; r < p.matrix.length; r++) {
      for (let c = 0; c < p.matrix[r].length; c++) {
        if (!p.matrix[r][c]) continue;
        const ny = p.y + r;
        const nx = p.x + c;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
          b[ny][nx] = p.color;
        }
      }
    }

    let cleared = 0;
    const remaining: BoardGrid = [];
    for (let r = 0; r < ROWS; r++) {
      if (b[r].every((cell) => cell !== null)) {
        cleared += 1;
      } else {
        remaining.push(b[r]);
      }
    }
    while (remaining.length < ROWS) {
      remaining.unshift(Array<string | null>(COLS).fill(null));
    }
    boardRef.current = remaining;

    if (cleared > 0) {
      const ptsTable = [0, 100, 300, 500, 800];
      scoreRef.current += ptsTable[cleared] || cleared * 200;
      linesRef.current += cleared;
      setLinesCleared(linesRef.current);
    } else {
      scoreRef.current += 10;
    }
    setScore(scoreRef.current);
    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
    }

    const next = randomPiece();
    if (collides(boardRef.current, next.matrix, next.x, next.y)) {
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
          detalleExtra: linesRef.current,
          modo: 'clasico',
          duracionSegundos: dur,
        });
      }
    } else {
      pieceRef.current = next;
    }
  }, [collides]);

  const moveHorizontal = useCallback(
    (dx: number) => {
      if (status !== 'playing') return;
      const p = pieceRef.current;
      if (!collides(boardRef.current, p.matrix, p.x + dx, p.y)) {
        p.x += dx;
        draw();
      }
    },
    [status, collides, draw],
  );

  const rotatePiece = useCallback(() => {
    if (status !== 'playing') return;
    const p = pieceRef.current;
    const rot = rotateMatrix(p.matrix);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!collides(boardRef.current, rot, p.x + kick, p.y)) {
        p.x += kick;
        p.matrix = rot;
        draw();
        return;
      }
    }
  }, [status, collides, draw]);

  const dropStep = useCallback(() => {
    if (status !== 'playing') return;
    const p = pieceRef.current;
    if (!collides(boardRef.current, p.matrix, p.x, p.y + 1)) {
      p.y += 1;
    } else {
      lockPiece();
    }
    draw();
  }, [status, collides, lockPiece, draw]);

  const startNewGame = useCallback(() => {
    boardRef.current = emptyBoard();
    pieceRef.current = randomPiece();
    scoreRef.current = 0;
    linesRef.current = 0;
    startBestRef.current = bestRef.current;
    matchStartRef.current = Date.now();
    reportedRef.current = false;

    setIsNewRecord(false);
    setScore(0);
    setLinesCleared(0);
    setStatus('playing');
    draw();
  }, [draw]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      const k = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(k)) {
        e.preventDefault();
      }
      if (k === 'arrowleft' || k === 'a') moveHorizontal(-1);
      else if (k === 'arrowright' || k === 'd') moveHorizontal(1);
      else if (k === 'arrowup' || k === 'w') rotatePiece();
      else if (k === 'arrowdown' || k === 's' || k === ' ') dropStep();
    };
    window.addEventListener('keydown', down, { passive: false });
    return () => window.removeEventListener('keydown', down);
  }, [status, moveHorizontal, rotatePiece, dropStep]);

  useEffect(() => {
    if (status !== 'playing') return;
    const delay = Math.max(170, 520 - linesCleared * 16);
    const id = setInterval(dropStep, delay);
    return () => clearInterval(id);
  }, [status, linesCleared, dropStep]);

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(196, 181, 253, 0.24)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C4B5FD]/35 bg-[#C4B5FD]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C4B5FD]">
              <span className="h-2 w-2 rounded-full bg-[#C4B5FD]" aria-hidden="true" />
              Arcade #07 · Puzle Arcade
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bloques Quánticos
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Rota con ↑ o W, mueve con ←/→ y baja más rápido con ↓ o los botones táctiles.
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
            <div className="text-2xl font-black text-[#C4B5FD] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Líneas</div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{linesCleared}</div>
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

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <ArcadeScreenFrame
            className="w-[236px] h-[456px]"
            accentColor="rgba(196, 181, 253, 0.35)"
            glowColor="rgba(196, 181, 253, 0.42)"
            bgColor="#0D091D"
          >
            <canvas ref={canvasRef} className="w-full h-full block" aria-label="Tablero de Bloques Quánticos" />
            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#0D091D]/88 flex flex-col items-center justify-center p-4 text-center gap-3">
                <div className="text-xl font-black text-white">
                  {status === 'gameover' ? `Puntos: ${score}` : 'Bloques Quánticos'}
                </div>
                {status === 'gameover' && isNewRecord && (
                  <span className="rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                    ¡Nuevo récord personal!
                  </span>
                )}
                <button
                  type="button"
                  onClick={startNewGame}
                  className="min-h-[40px] px-6 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 cursor-pointer"
                >
                  {status === 'gameover' ? 'Jugar de nuevo' : 'Iniciar partida'}
                </button>
              </div>
            )}
          </ArcadeScreenFrame>

          <div className="grid grid-cols-3 gap-2 w-[200px]">
            <div />
            <button
              type="button"
              onClick={rotatePiece}
              className="h-12 rounded-xl border border-[#C4B5FD]/40 bg-[#C4B5FD]/15 text-[#E9D5FF] font-bold text-xs cursor-pointer"
            >
              Rotar ↻
            </button>
            <div />
            <button
              type="button"
              onClick={() => moveHorizontal(-1)}
              className="h-12 rounded-xl border border-white/15 bg-white/[0.08] text-white font-bold text-lg cursor-pointer"
            >
              ←
            </button>
            <button
              type="button"
              onClick={dropStep}
              className="h-12 rounded-xl border border-white/15 bg-white/[0.08] text-white font-bold text-lg cursor-pointer"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => moveHorizontal(1)}
              className="h-12 rounded-xl border border-white/15 bg-white/[0.08] text-white font-bold text-lg cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </LiquidGlass>
  );
}
