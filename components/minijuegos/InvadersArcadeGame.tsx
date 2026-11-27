'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';
import ArcadeScreenFrame from './ArcadeScreenFrame';

const W = 520;
const H = 580;
const MAX_LEVEL = 10;
const SHIP_Y = H - 36;
const SHIP_W = 44;

type AlienKind = 'commander' | 'crab' | 'saucer' | 'bomber' | 'armored';

interface Alien {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  hp: number;
  maxHp: number;
  pts: number;
  color: string;
  kind: AlienKind;
}

interface Bullet {
  x: number;
  y: number;
  vy: number;
}

interface MysteryUfo {
  active: boolean;
  x: number;
  vx: number;
}

// Crisp 11x8 / 8x8 retro pixel art bitmaps (2 animation frames per alien ship!)
const SPRITES: Record<AlienKind, [string[], string[]]> = {
  commander: [
    [
      '00011000',
      '00111100',
      '01111110',
      '11011011',
      '11111111',
      '00100100',
      '01011010',
      '10100101',
    ],
    [
      '00011000',
      '00111100',
      '01111110',
      '11011011',
      '11111111',
      '01011010',
      '10000001',
      '01000010',
    ],
  ],
  crab: [
    [
      '00100000100',
      '00010001000',
      '00111111100',
      '01101110110',
      '11111111111',
      '10111111101',
      '10100000101',
      '00011011000',
    ],
    [
      '00100000100',
      '10010001001',
      '10111111101',
      '11101110111',
      '11111111111',
      '01111111110',
      '00100000100',
      '01000000010',
    ],
  ],
  saucer: [
    [
      '00001110000',
      '00111111100',
      '01111111110',
      '11011011011',
      '11111111111',
      '00111011100',
      '01000000010',
      '00000000000',
    ],
    [
      '00001110000',
      '00111111100',
      '01111111110',
      '11101110111',
      '11111111111',
      '01011011010',
      '00100000100',
      '00000000000',
    ],
  ],
  bomber: [
    [
      '00011111000',
      '01111111110',
      '11111111111',
      '11100100111',
      '11111111111',
      '00110001100',
      '01100100110',
      '11000000011',
    ],
    [
      '00011111000',
      '01111111110',
      '11111111111',
      '11100100111',
      '11111111111',
      '00111011100',
      '01101110110',
      '00110001100',
    ],
  ],
  armored: [
    [
      '01111111110',
      '11111111111',
      '11011111011',
      '11110101111',
      '11111111111',
      '01101110110',
      '00110001100',
      '01100000110',
    ],
    [
      '01111111110',
      '11111111111',
      '11011111011',
      '11110101111',
      '11111111111',
      '10110101101',
      '01010001010',
      '00100000100',
    ],
  ],
};

function drawPixelSprite(
  ctx: CanvasRenderingContext2D,
  bitmap: string[],
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  const rows = bitmap.length;
  const cols = bitmap[0].length;
  const pw = w / cols;
  const ph = h / rows;
  ctx.fillStyle = color;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (bitmap[r][c] === '1') {
        ctx.fillRect(x + c * pw, y + r * ph, Math.ceil(pw), Math.ceil(ph));
      }
    }
  }
}

function buildWave(level: number): Alien[] {
  const list: Alien[] = [];
  const rowConfigs: Array<{ kind: AlienKind; color: string; hp: number }> = [
    { kind: 'commander', color: '#FDE68A', hp: level >= 8 ? 2 : 1 },
    { kind: 'crab', color: '#6EE7B7', hp: 1 },
    { kind: 'saucer', color: '#67E8F9', hp: 1 },
    { kind: 'bomber', color: '#D8B4FE', hp: 1 },
    { kind: 'armored', color: '#FDA4AF', hp: level >= 6 ? 2 : 1 },
  ];

  const rows = level >= 6 ? 5 : 4;
  const cols = level >= 4 ? 8 : 7;
  const spacingX = Math.floor((W - 84) / cols);
  const startX = Math.floor((W - (cols - 1) * spacingX - 32) / 2);

  for (let r = 0; r < rows; r++) {
    const cfg = rowConfigs[(r + Math.floor((level - 1) / 3)) % rowConfigs.length];
    for (let c = 0; c < cols; c++) {
      list.push({
        x: startX + c * spacingX,
        y: 44 + r * 36,
        w: 32,
        h: 22,
        alive: true,
        hp: cfg.hp,
        maxHp: cfg.hp,
        pts: (rows - r) * 15 + (level - 1) * 5 + (cfg.hp > 1 ? 15 : 0),
        color: cfg.color,
        kind: cfg.kind,
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
  const ufoRef = useRef<MysteryUfo>({ active: false, x: -50, vx: 2.2 });
  const lastShotRef = useRef(0);
  const lastEnemyShotRef = useRef(0);
  const lastUfoCheckRef = useRef(Date.now());

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

  const draw = useCallback((nowMs: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const isEcoMode = document.documentElement.dataset.designMode === 'eco';
    const dpr = isEcoMode ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    if (canvas.width !== Math.round(W * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#030F0B';
    ctx.fillRect(0, 0, W, H);

    // Subtle animated starfield
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 89 + 23) % (W - 20)) + 10;
      const sy = ((i * 137 + 41 + Math.floor(nowMs / 80)) % (H - 40)) + 15;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(103, 232, 249, 0.25)' : 'rgba(110, 231, 183, 0.16)';
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Mystery Red UFO at the top
    const ufo = ufoRef.current;
    if (ufo.active) {
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.ellipse(ufo.x + 20, 20, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(ufo.x + 20, 16, 7, Math.PI, 0);
      ctx.fill();
    }

    // 2-frame retro pixel-art alien ships
    const animFrame = Math.floor(nowMs / 360) % 2;
    for (const a of aliensRef.current) {
      if (!a.alive) continue;
      const sprite = SPRITES[a.kind][animFrame];
      const renderColor = a.maxHp > 1 && a.hp === 1 ? '#FDE047' : a.color;
      drawPixelSprite(ctx, sprite, a.x, a.y, a.w, a.h, renderColor);

      // Tiny shield indicator on armored 2-HP invaders
      if (a.hp > 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(a.x - 2, a.y - 2, a.w + 4, a.h + 4);
      }
    }

    // Player laser bolts
    ctx.fillStyle = '#67E8F9';
    for (const b of bulletsRef.current) {
      ctx.fillRect(b.x - 1.8, b.y - 12, 3.6, 13);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(b.x - 0.8, b.y - 10, 1.6, 9);
      ctx.fillStyle = '#67E8F9';
    }

    // Enemy plasma bolts
    ctx.fillStyle = '#FB7185';
    for (const eb of enemyBulletsRef.current) {
      ctx.fillRect(eb.x - 2.2, eb.y, 4.4, 11);
    }

    // Detailed Retro Player Starfighter (evolves subtly at level 5+)
    const sx = shipXRef.current;
    const cx = sx + SHIP_W / 2;
    const upgraded = levelRef.current >= 5;

    // Thruster flame
    const flameH = 7 + Math.sin(nowMs / 45) * 3;
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(cx - 5, SHIP_Y + 8);
    ctx.lineTo(cx, SHIP_Y + 8 + flameH);
    ctx.lineTo(cx + 5, SHIP_Y + 8);
    ctx.closePath();
    ctx.fill();

    // Outer wings
    ctx.fillStyle = upgraded ? '#38BDF8' : '#0EA5E9';
    ctx.beginPath();
    ctx.moveTo(cx, SHIP_Y - 14);
    ctx.lineTo(sx + SHIP_W, SHIP_Y + 9);
    ctx.lineTo(sx + SHIP_W - 6, SHIP_Y + 11);
    ctx.lineTo(cx + 8, SHIP_Y + 4);
    ctx.lineTo(cx - 8, SHIP_Y + 4);
    ctx.lineTo(sx + 6, SHIP_Y + 11);
    ctx.lineTo(sx, SHIP_Y + 9);
    ctx.closePath();
    ctx.fill();

    // Wing-tip retro cannons
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(sx + 4, SHIP_Y - 3, 3, 9);
    ctx.fillRect(sx + SHIP_W - 7, SHIP_Y - 3, 3, 9);

    // Center fuselage & glowing cockpit
    ctx.fillStyle = '#67E8F9';
    ctx.beginPath();
    ctx.moveTo(cx, SHIP_Y - 24);
    ctx.lineTo(cx + 7, SHIP_Y + 6);
    ctx.lineTo(cx - 7, SHIP_Y + 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(cx, SHIP_Y - 8, 2.8, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    draw(Date.now());
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
    shipXRef.current = W / 2 - SHIP_W / 2;
    aliensRef.current = buildWave(1);
    alienDirRef.current = 1;
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    ufoRef.current = { active: false, x: -50, vx: 2.3 };
    lastUfoCheckRef.current = Date.now();
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
    const cx = shipXRef.current + SHIP_W / 2;
    if (levelRef.current >= 5) {
      // Twin laser upgrade from Level 5!
      bulletsRef.current.push(
        { x: cx - 10, y: SHIP_Y - 16, vy: -7.5 },
        { x: cx + 10, y: SHIP_Y - 16, vy: -7.5 },
      );
    } else {
      bulletsRef.current.push({ x: cx, y: SHIP_Y - 24, vy: -7.4 });
    }
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
      const now = Date.now();

      if (keysRef.current.left) shipXRef.current = Math.max(10, shipXRef.current - 5.6);
      if (keysRef.current.right) shipXRef.current = Math.min(W - SHIP_W - 10, shipXRef.current + 5.6);
      if (keysRef.current.fire) fireLaser();

      // Mystery UFO spawn/move
      const ufo = ufoRef.current;
      if (!ufo.active && now - lastUfoCheckRef.current > 11000) {
        lastUfoCheckRef.current = now;
        const fromLeft = Math.random() > 0.5;
        ufo.active = true;
        ufo.x = fromLeft ? -44 : W + 4;
        ufo.vx = fromLeft ? 2.4 : -2.4;
      } else if (ufo.active) {
        ufo.x += ufo.vx;
        if (ufo.x < -55 || ufo.x > W + 55) {
          ufo.active = false;
        }
      }

      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y + b.vy }))
        .filter((b) => b.y > -14);

      enemyBulletsRef.current = enemyBulletsRef.current
        .map((b) => ({ ...b, y: b.y + b.vy }))
        .filter((b) => b.y < H + 14);

      const aliveAliens = aliensRef.current.filter((a) => a.alive);
      const totalInWave = aliensRef.current.length;
      const speedX =
        (0.95 + levelRef.current * 0.2 + (totalInWave - aliveAliens.length) * 0.038) *
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
            draw(now);
            return;
          }
        }
      }

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
        // Mystery UFO hit
        if (ufo.active && b.x >= ufo.x && b.x <= ufo.x + 40 && b.y >= 10 && b.y <= 28) {
          ufo.active = false;
          b.y = -100;
          scoreRef.current += 100;
          killsRef.current += 1;
          setScore(scoreRef.current);
          setKills(killsRef.current);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            setBestScore(scoreRef.current);
          }
          continue;
        }

        for (const a of aliensRef.current) {
          if (!a.alive) continue;
          if (b.x >= a.x && b.x <= a.x + a.w && b.y >= a.y && b.y <= a.y + a.h) {
            b.y = -100;
            a.hp -= 1;
            if (a.hp <= 0) {
              a.alive = false;
              scoreRef.current += a.pts;
              killsRef.current += 1;
              setScore(scoreRef.current);
              setKills(killsRef.current);
              if (scoreRef.current > bestRef.current) {
                bestRef.current = scoreRef.current;
                setBestScore(scoreRef.current);
              }
            }
            break;
          }
        }
      }

      const sx = shipXRef.current;
      for (const eb of enemyBulletsRef.current) {
        if (eb.x >= sx + 3 && eb.x <= sx + SHIP_W - 3 && eb.y >= SHIP_Y - 18 && eb.y <= SHIP_Y + 9) {
          eb.y = H + 50;
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            finishMatch('gameover');
            draw(now);
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
          draw(now);
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
        setLevelBanner(`Nivel ${levelRef.current} / ${MAX_LEVEL}${levelRef.current === 5 ? ' · ¡Doble Láser!' : ''}`);
        setTimeout(() => setLevelBanner(null), 1600);
        aliensRef.current = buildWave(levelRef.current);
        bulletsRef.current = [];
        enemyBulletsRef.current = [];
      }

      draw(now);
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
              Arcade #03 · Campaña Retro de 10 Niveles
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Invasores Arcade
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              5 clases de naves alienígenas animadas, ovni rojo sorpresa (+100 pts) y mejora de doble láser desde el Nivel 5.
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
            bgColor="#030F0B"
          >
            <canvas ref={canvasRef} className="w-full h-full block" aria-label="Tablero de Invasores Arcade" />

            {status === 'playing' && levelBanner && (
              <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#6EE7B7]/50 bg-[#030F0B]/92 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#6EE7B7] whitespace-nowrap">
                {levelBanner}
              </div>
            )}

            {status !== 'playing' && (
              <div className="absolute inset-0 bg-[#030F0B]/90 flex flex-col items-center justify-center p-6 text-center gap-4">
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
