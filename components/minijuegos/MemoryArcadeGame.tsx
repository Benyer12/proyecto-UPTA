'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from '../ui/glasscn/liquid-glass';
import type { ResultadoPartidaInput } from '../../lib/minijuegos-types';

const SYMBOLS = [
  { id: 'star', label: 'Estrella', glyph: '★' },
  { id: 'planet', label: 'Planeta', glyph: '🪐' },
  { id: 'rocket', label: 'Cohete', glyph: '🚀' },
  { id: 'moon', label: 'Luna', glyph: '🌙' },
  { id: 'comet', label: 'Cometa', glyph: '☄️' },
  { id: 'bolt', label: 'Energía', glyph: '⚡' },
  { id: 'atom', label: 'Átomo', glyph: '⚛️' },
  { id: 'gem', label: 'Cristal', glyph: '💎' },
  { id: 'ufo', label: 'Ovni', glyph: '🛸' },
  { id: 'sun', label: 'Sol', glyph: '☀️' },
  { id: 'scope', label: 'Órbita', glyph: '🔭' },
  { id: 'sat', label: 'Satélite', glyph: '🛰️' },
];

const MEMORY_LEVELS = [
  { level: 1, pairs: 3, colsClass: 'grid-cols-3' },
  { level: 2, pairs: 4, colsClass: 'grid-cols-4' },
  { level: 3, pairs: 6, colsClass: 'grid-cols-4' },
  { level: 4, pairs: 8, colsClass: 'grid-cols-4' },
  { level: 5, pairs: 10, colsClass: 'grid-cols-5' },
  { level: 6, pairs: 12, colsClass: 'grid-cols-6' },
];

interface CardItem {
  uid: number;
  symbolId: string;
  label: string;
  glyph: string;
  matched: boolean;
}

function createDeckForPairs(pairCount: number): CardItem[] {
  const chosen = SYMBOLS.slice(0, pairCount);
  const doubled = [...chosen, ...chosen].map((s, idx) => ({
    uid: idx,
    symbolId: s.id,
    label: s.label,
    glyph: s.glyph,
    matched: false,
  }));
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled;
}

export default function MemoryArcadeGame({
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
  const [levelIdx, setLevelIdx] = useState(0);
  const currentCfg = MEMORY_LEVELS[levelIdx];

  const [cards, setCards] = useState<CardItem[]>(() => createDeckForPairs(MEMORY_LEVELS[0].pairs));
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [totalPairsCleared, setTotalPairsCleared] = useState(0);
  const [levelPairsCleared, setLevelPairsCleared] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [levelDone, setLevelDone] = useState(false);
  const [campaignWon, setCampaignWon] = useState(false);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const lockRef = useRef(false);
  const matchStartRef = useRef(Date.now());
  const bestRef = useRef(initialBestScore);
  const startBestRef = useRef(initialBestScore);
  const onFinishRef = useRef(onGameFinished);
  onFinishRef.current = onGameFinished;

  useEffect(() => {
    setBestScore((prev) => Math.max(prev, initialBestScore));
    bestRef.current = Math.max(bestRef.current, initialBestScore);
  }, [initialBestScore]);

  useEffect(() => {
    setAttempts((prev) => Math.max(prev, initialAttempts));
  }, [initialAttempts]);

  const startFromLevel1 = useCallback(() => {
    lockRef.current = false;
    matchStartRef.current = Date.now();
    startBestRef.current = bestRef.current;
    setLevelIdx(0);
    setCards(createDeckForPairs(MEMORY_LEVELS[0].pairs));
    setFlippedIndices([]);
    setMoves(0);
    setTotalPairsCleared(0);
    setLevelPairsCleared(0);
    setCombo(0);
    setScore(0);
    setLevelDone(false);
    setCampaignWon(false);
    setIsNewRecord(false);
  }, []);

  const advanceNextLevel = () => {
    const nextIdx = levelIdx + 1;
    if (nextIdx >= MEMORY_LEVELS.length) return;
    lockRef.current = false;
    setLevelIdx(nextIdx);
    setCards(createDeckForPairs(MEMORY_LEVELS[nextIdx].pairs));
    setFlippedIndices([]);
    setMoves(0);
    setLevelPairsCleared(0);
    setCombo(0);
    setLevelDone(false);
  };

  const handleCardClick = (idx: number) => {
    if (lockRef.current || levelDone || campaignWon) return;
    if (flippedIndices.includes(idx) || cards[idx].matched) return;

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      lockRef.current = true;
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const [a, b] = nextFlipped;

      if (cards[a].symbolId === cards[b].symbolId) {
        const nextCombo = combo + 1;
        const gained = 40 + nextCombo * 15 + currentCfg.level * 10;
        const nextScore = score + gained;
        const nextLvlPairs = levelPairsCleared + 1;
        const nextTotalPairs = totalPairsCleared + 1;

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)),
          );
          setFlippedIndices([]);
          setCombo(nextCombo);
          setLevelPairsCleared(nextLvlPairs);
          setTotalPairsCleared(nextTotalPairs);
          setScore(nextScore);
          lockRef.current = false;

          if (nextLvlPairs === currentCfg.pairs) {
            const lvlBonus = Math.max(20, 140 - nextMoves * 6);
            const updatedTotal = nextScore + lvlBonus;
            setScore(updatedTotal);
            if (updatedTotal > bestRef.current) {
              bestRef.current = updatedTotal;
              setBestScore(updatedTotal);
            }

            if (levelIdx === MEMORY_LEVELS.length - 1) {
              const dur = Math.max(1, Math.round((Date.now() - matchStartRef.current) / 1000));
              setCampaignWon(true);
              setAttempts((p) => p + 1);
              if (updatedTotal > startBestRef.current && updatedTotal > 0) {
                setIsNewRecord(true);
              }
              onFinishRef.current?.({
                puntaje: updatedTotal,
                detalleExtra: nextTotalPairs,
                modo: `nivel-6-completo`,
                duracionSegundos: dur,
              });
            } else {
              setLevelDone(true);
            }
          }
        }, 320);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          setCombo(0);
          lockRef.current = false;
        }, 620);
      }
    }
  };

  return (
    <LiquidGlass
      blur={8}
      refraction={10}
      bezel={0.22}
      saturation={1.15}
      className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)]"
      style={{ '--liquid-glass-rim-uniform': 'rgba(253, 230, 138, 0.24)' } as CSSProperties}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FDE68A]/35 bg-[#FDE68A]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FDE68A]">
              <span className="h-2 w-2 rounded-full bg-[#FDE68A]" aria-hidden="true" />
              Arcade #04 · Progresión de 6 Niveles
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Memoria Galáctica
            </h2>
            <p className="text-xs sm:text-sm text-white/65">
              Comienza con 3 parejas en el Nivel 1 y sube hasta 12 parejas (24 cartas) en el Nivel 6.
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
            <div className="text-2xl font-black text-[#FDE68A] tabular-nums">
              {currentCfg.level} / {MEMORY_LEVELS.length}
            </div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Puntos</div>
            <div className="text-2xl font-black text-[#67E8F9] tabular-nums">{score}</div>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Parejas (Nivel)</div>
            <div className="text-2xl font-black text-[#6EE7B7] tabular-nums">
              {levelPairsCleared} / {currentCfg.pairs}
            </div>
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

        <div className="max-w-xl mx-auto space-y-4">
          <div className={`grid ${currentCfg.colsClass} gap-2.5 sm:gap-3`}>
            {cards.map((card, idx) => {
              const revealed = card.matched || flippedIndices.includes(idx);
              return (
                <button
                  key={`${currentCfg.level}-${card.uid}`}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  aria-label={revealed ? card.label : 'Carta oculta'}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                    card.matched
                      ? 'border-[#6EE7B7]/50 bg-[#6EE7B7]/15 scale-[0.98]'
                      : revealed
                        ? 'border-[#FDE68A]/60 bg-white/15'
                        : 'border-white/15 bg-white/[0.05] hover:bg-white/[0.11] hover:-translate-y-0.5'
                  }`}
                >
                  {revealed ? (
                    <>
                      <span className="text-2xl sm:text-3xl leading-none">{card.glyph}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white/75 mt-1 truncate max-w-full px-1">
                        {card.label}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-lg font-black text-white/35">★</span>
                  )}
                </button>
              );
            })}
          </div>

          {campaignWon ? (
            <div className="rounded-2xl border border-[#6EE7B7]/40 bg-[#6EE7B7]/10 p-5 text-center space-y-3">
              {isNewRecord && (
                <div className="inline-block rounded-full border border-[#FDE68A]/45 bg-[#FDE68A]/15 px-3 py-0.5 text-[11px] font-bold text-[#FDE68A]">
                  ¡Nuevo récord personal!
                </div>
              )}
              <div className="text-xl font-black text-white">
                ¡Felicidades! Completaste los 6 niveles de Memoria ({score} pts)
              </div>
              <button
                type="button"
                onClick={startFromLevel1}
                className="min-h-[42px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 cursor-pointer"
              >
                Jugar de nuevo desde Nivel 1
              </button>
            </div>
          ) : levelDone ? (
            <div className="rounded-2xl border border-[#FDE68A]/40 bg-[#FDE68A]/10 p-4 text-center space-y-2.5">
              <div className="text-base sm:text-lg font-extrabold text-white">
                ¡Nivel {currentCfg.level} superado en {moves} movimientos!
              </div>
              <button
                type="button"
                onClick={advanceNextLevel}
                className="min-h-[42px] px-7 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 cursor-pointer"
              >
                Siguiente Nivel ({MEMORY_LEVELS[levelIdx + 1]?.pairs} parejas) →
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={startFromLevel1}
                className="min-h-[38px] px-5 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.14] text-xs font-semibold text-white cursor-pointer"
              >
                Reiniciar desde Nivel 1
              </button>
            </div>
          )}
        </div>
      </div>
    </LiquidGlass>
  );
}
