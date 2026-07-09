'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import Dado3D from './Dado3D';

interface NumerixBoardProps {
  planetColor: string;
  planetGlow: string;
}

const GOLDEN_ANGLE = 137.508;
const TILE_COUNT = 20;

const CATEGORIES = [
  { id: 'calculo', label: 'Cálculo', color: '#00d4ff', icon: '+', hue: 190 },
  { id: 'logica', label: 'Lógica', color: '#a855f7', icon: '?', hue: 270 },
  { id: 'numeros', label: 'Números', color: '#fbbf24', icon: '#', hue: 40 },
  { id: 'geometria', label: 'Geometría', color: '#34d399', icon: '◆', hue: 155 },
  { id: 'sorpresa', label: 'Sorpresa', color: '#f472b6', icon: '✦', hue: 330 },
] as const;

interface StarPosition {
  id: number;
  x: number;
  y: number;
  radius: number;
  angle: number;
  size: number;
  category: typeof CATEGORIES[number];
  connections: number[];
}

function generateConstellation(): StarPosition[] {
  const maxR = 44;
  const minR = 6;
  const stars: StarPosition[] = [];

  for (let i = 0; i < TILE_COUNT; i++) {
    const t = (TILE_COUNT - i - 1) / (TILE_COUNT - 1);
    const r = minR + (maxR - minR) * Math.sqrt(t);
    const theta = (i + 1) * GOLDEN_ANGLE;
    const thetaRad = (theta * Math.PI) / 180;

    stars.push({
      id: i + 1,
      x: 50 + r * Math.cos(thetaRad),
      y: 50 + r * Math.sin(thetaRad),
      radius: r,
      angle: theta,
      size: Math.round(26 + (r / maxR) * 14),
      category: CATEGORIES[i % CATEGORIES.length],
      connections: [],
    });
  }

  for (let i = 0; i < stars.length; i++) {
    const dists: { idx: number; d: number }[] = [];
    for (let j = 0; j < stars.length; j++) {
      if (i === j) continue;
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      dists.push({ idx: j, d: Math.sqrt(dx * dx + dy * dy) });
    }
    dists.sort((a, b) => a.d - b.d);
    stars[i].connections = dists.slice(0, 2).map((d) => stars[d.idx].id);
  }

  return stars;
}

function StarNode({
  star,
  isCurrent,
  isCompleted,
  isHovered,
  planetColor,
  index,
  onHover,
  onClick,
}: {
  star: StarPosition;
  isCurrent: boolean;
  isCompleted: boolean;
  isHovered: boolean;
  planetColor: string;
  index: number;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
}) {
  const glowIntensity = isCurrent ? 1 : isCompleted ? 0.7 : isHovered ? 0.5 : 0;
  const pulseDuration = 2.5 + (star.id % 5) * 0.4;

  return (
    <motion.button
      onMouseEnter={() => onHover(star.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(star.id)}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${star.x}%`, top: `${star.y}%`, zIndex: isCurrent ? 30 : 10 }}
      whileHover={{ scale: 1.25, zIndex: 35 }}
      whileTap={{ scale: 0.85 }}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: star.size, height: star.size }}
        animate={{
          y: [0, -1.5, 0],
        }}
        transition={{
          duration: 3 + (star.id % 4) * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: star.id * 0.3,
        }}
      >
        {isCurrent && (
          <>
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute rounded-full"
                style={{
                  border: `1px solid ${planetColor}`,
                  boxShadow: `0 0 8px ${planetColor}66`,
                }}
                animate={{
                  width: [star.size, star.size + 24 + ring * 16],
                  height: [star.size, star.size + 24 + ring * 16],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: ring * 0.4,
                  ease: 'easeOut',
                }}
              />
            ))}
            <motion.div
              className="absolute w-1 h-1 rounded-full"
              style={{ background: planetColor, boxShadow: `0 0 10px ${planetColor}` }}
              animate={{
                x: [0, Math.cos(index) * star.size * 0.8],
                y: [0, Math.sin(index) * star.size * 0.8],
                opacity: [0, 1, 0],
                scale: [0, 2, 0],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          </>
        )}

        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: isCompleted
              ? `radial-gradient(circle at 35% 25%, ${star.category.color}cc, ${star.category.color}44)`
              : isCurrent
              ? `radial-gradient(circle at 35% 25%, ${planetColor}ee, ${planetColor}55)`
              : `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.12), rgba(255,255,255,0.03))`,
            border: `1.5px solid ${
              isCompleted
                ? star.category.color + 'dd'
                : isCurrent
                ? planetColor + 'ee'
                : isHovered
                ? star.category.color + '77'
                : 'rgba(255,255,255,0.12)'
            }`,
            boxShadow: isCompleted
              ? `0 0 ${16 + glowIntensity * 20}px ${star.category.color}66, inset 0 0 ${8 + glowIntensity * 10}px ${star.category.color}33`
              : isCurrent
              ? `0 0 30px ${planetColor}66, 0 0 60px ${planetColor}33, inset 0 0 15px ${planetColor}33`
              : isHovered
              ? `0 0 12px ${star.category.color}44`
              : `0 0 4px rgba(255,255,255,0.06)`,
            transition: 'box-shadow 0.5s ease, border-color 0.4s ease, background 0.5s ease',
          }}
        />

        {isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${star.category.color}44, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${planetColor}44, transparent 70%)`,
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div
          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${star.category.color}15 100%)`,
            opacity: isHovered || isCurrent ? 1 : 0,
          }}
        />

        <motion.span
          className="relative z-10 font-black select-none"
          style={{
            fontSize: isCurrent ? 15 : isCompleted ? 14 : 11,
            color: isCompleted || isCurrent ? '#fff' : 'rgba(255,255,255,0.55)',
            textShadow: isCompleted
              ? `0 0 10px ${star.category.color}`
              : isCurrent
              ? `0 0 15px ${planetColor}`
              : 'none',
          }}
        >
          {star.id}
        </motion.span>

        {isCompleted && (
          <motion.div
            className="absolute -top-1 -right-1 w-[14px] h-[14px] rounded-full flex items-center justify-center"
            style={{
              background: star.category.color,
              boxShadow: `0 0 10px ${star.category.color}`,
            }}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <span className="text-[6px] font-black text-white">✓</span>
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
}

function ConstellationWeb({
  stars,
  completedStars,
  currentStarId,
  planetColor,
}: {
  stars: StarPosition[];
  completedStars: Set<number>;
  currentStarId: number;
  planetColor: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 800 });

  useEffect(() => {
    const measure = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDims({ w: rect.width, h: rect.height });
        }
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, []);

  const toPx = (x: number, y: number) => ({
    px: (x / 100) * dims.w,
    py: (y / 100) * dims.h,
  });

  const starMap = useMemo(() => {
    const map = new Map<number, StarPosition>();
    stars.forEach((s) => map.set(s.id, s));
    return map;
  }, [stars]);

  const lines: {
    from: StarPosition;
    to: StarPosition;
    type: 'path' | 'constellation';
    active: boolean;
  }[] = [];

  for (let i = 0; i < stars.length - 1; i++) {
    const from = stars[i];
    const to = stars[i + 1];
    lines.push({
      from,
      to,
      type: 'path',
      active: completedStars.has(from.id) && completedStars.has(to.id),
    });
  }

  const drawnPairs = new Set<string>();
  stars.forEach((star) => {
    star.connections.forEach((connId) => {
      const conn = starMap.get(connId);
      if (!conn) return;
      const key = `${Math.min(star.id, connId)}-${Math.max(star.id, connId)}`;
      if (drawnPairs.has(key)) return;
      drawnPairs.add(key);
      const bothCompleted = completedStars.has(star.id) && completedStars.has(conn.id);
      const oneActive = star.id === currentStarId || conn.id === currentStarId;
      const nearCurrent = Math.abs(star.id - currentStarId) <= 1 || Math.abs(conn.id - currentStarId) <= 1;
      const isPathLine = Math.abs(star.id - conn.id) === 1;
      if (!isPathLine) {
        lines.push({
          from: star,
          to: conn,
          type: 'constellation',
          active: bothCompleted,
        });
      }
    });
  });

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <filter id="webGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {lines.map((line, i) => {
        const p1 = toPx(line.from.x, line.from.y);
        const p2 = toPx(line.to.x, line.to.y);
        const cx = (p1.px + p2.px) / 2;
        const cy = (p1.py + p2.py) / 2;
        const dx = p2.px - p1.px;
        const dy = p2.py - p1.py;
        const curve = Math.min(dims.w, dims.h) * 0.025;
        const cpx = cx + dy * 0.12;
        const cpy = cy - dx * 0.12;

        if (line.type === 'path') {
          return (
            <g key={i}>
              <path
                d={`M ${p1.px} ${p1.py} Q ${cpx} ${cpy} ${p2.px} ${p2.py}`}
                fill="none"
                stroke={line.active ? planetColor + '88' : `${planetColor}25`}
                strokeWidth={line.active ? 2.5 : 1}
                strokeDasharray={line.active ? 'none' : '4 4'}
                opacity={line.active ? 0.8 : 0.3}
                style={{ transition: 'all 0.6s ease' }}
              />
              {line.active && (
                <motion.path
                  d={`M ${p1.px} ${p1.py} Q ${cpx} ${cpy} ${p2.px} ${p2.py}`}
                  fill="none"
                  stroke={planetColor}
                  strokeWidth={1.5}
                  opacity={0.4}
                  filter="url(#webGlow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              )}
            </g>
          );
        }

        if (line.type === 'constellation') {
          return (
            <g key={i}>
              <path
                d={`M ${p1.px} ${p1.py} Q ${cpx} ${cpy} ${p2.px} ${p2.py}`}
                fill="none"
                stroke={
                  line.active
                    ? line.from.category.color + '77'
                    : `${planetColor}12`
                }
                strokeWidth={line.active ? 1.5 : 0.5}
                opacity={line.active ? 0.6 : 0.15}
                style={{ transition: 'all 0.8s ease' }}
              />
              {line.active && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={2}
                  fill={line.from.category.color}
                  opacity={0.5}
                  animate={{ r: [2, 4, 2], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </g>
          );
        }

        return null;
      })}
    </svg>
  );
}

function NebulaParticles({ planetColor }: { planetColor: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: 2 + Math.random() * 96,
        y: 2 + Math.random() * 96,
        size: 1 + Math.random() * 2.5,
        duration: 8 + Math.random() * 8,
        delay: Math.random() * 8,
        driftX: (Math.random() - 0.5) * 50,
        driftY: (Math.random() - 0.5) * 50,
        hue: Math.random() > 0.6
          ? 190 + Math.random() * 40
          : Math.random() > 0.5
          ? 270 + Math.random() * 30
          : 40 + Math.random() * 20,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsla(${p.hue}, 80%, 60%, 0.5)`,
            boxShadow: `0 0 ${p.size * 3}px hsla(${p.hue}, 80%, 60%, 0.3)`,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.4, 0],
            x: [0, p.driftX],
            y: [0, p.driftY],
            scale: [0, 1.3, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function CategoryLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center gap-1 px-2 py-1 rounded-md"
          style={{
            background: `${cat.color}0c`,
            border: `1px solid ${cat.color}20`,
          }}
        >
          <span className="text-[9px] font-bold" style={{ color: cat.color }}>{cat.icon}</span>
          <span className="text-[8px] font-medium" style={{ color: `${cat.color}99` }}>{cat.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function NumerixBoard({ planetColor, planetGlow }: NumerixBoardProps) {
  const stars = useMemo(() => generateConstellation(), []);

  const [currentStar, setCurrentStar] = useState(1);
  const [completedStars, setCompletedStars] = useState<Set<number>>(new Set());
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [combo, setCombo] = useState(0);
  const [burstStar, setBurstStar] = useState<number | null>(null);

  const handleStarClick = useCallback(
    (id: number) => {
      if (completedStars.has(id) || id > currentStar + 1) return;
      for (let i = 1; i < id; i++) {
        if (!completedStars.has(i)) return;
      }
      const newCompleted = new Set(completedStars);
      newCompleted.add(id);
      setCompletedStars(newCompleted);
      setBurstStar(id);
      setTimeout(() => setBurstStar(null), 800);

      if (id < TILE_COUNT) {
        setCurrentStar(id + 1);
      } else {
        setTimeout(() => setShowVictory(true), 700);
      }
    },
    [completedStars, currentStar],
  );

  const handleRoll = useCallback(() => {
    if (diceRolling || showVictory) return;
    const result = Math.floor(Math.random() * 6) + 1;
    setDiceResult(result);
    setDiceRolling(true);
    setShowResult(false);
  }, [diceRolling, showVictory]);

  const handleRollComplete = useCallback(() => {
    setDiceRolling(false);
    setShowResult(true);

    const steps = diceResult;
    const isCombo = steps >= 5;
    if (isCombo) setCombo((c) => c + 1);
    else setCombo(0);

    const target = Math.min(currentStar + steps - 1, TILE_COUNT);
    const newCompleted = new Set(completedStars);
    for (let i = currentStar; i <= target; i++) {
      newCompleted.add(i);
      setTimeout(() => setBurstStar(i), (i - currentStar) * 200);
    }
    setTimeout(() => setBurstStar(null), (target - currentStar + 1) * 200 + 400);

    if (target >= TILE_COUNT) {
      setTimeout(() => setShowVictory(true), 800);
    } else {
      setCurrentStar(target + 1);
    }
  }, [diceRolling, diceResult, currentStar, completedStars]);

  const currentStarData = stars.find((s) => s.id === currentStar);

  return (
    <div className="relative w-full px-1 mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className="px-4 py-2 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${planetColor}18, ${planetColor}06)`,
            border: `1px solid ${planetColor}28`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="text-[10px] font-bold tracking-widest"
              style={{ color: `${planetColor}bb` }}
            >
              ESTRELLA
            </span>
            <span className="text-xl font-black" style={{ color: '#fff', textShadow: `0 0 15px ${planetColor}` }}>
              {currentStar}
            </span>
            <span className="text-xs" style={{ color: `${planetColor}77` }}>
              / {TILE_COUNT}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="px-4 py-2 rounded-xl text-right"
          style={{
            background: `${planetColor}0a`,
            border: `1px solid ${planetColor}22`,
          }}
        >
          <span className="text-[9px] font-medium" style={{ color: `${planetColor}88` }}>
            Constelación
          </span>
          <br />
          <span className="text-xl font-black" style={{ color: '#fff', textShadow: `0 0 10px ${planetColor}` }}>
            {completedStars.size}
          </span>
          <span className="text-xs" style={{ color: `${planetColor}77` }}>
            /{TILE_COUNT}
          </span>
        </motion.div>
      </div>

      {combo > 1 && (
        <motion.div
          className="text-center mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <span
            className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full"
            style={{
              background: `linear-gradient(135deg, #fbbf2433, #f9721633)`,
              border: `1px solid #fbbf2455`,
              color: '#fbbf24',
              textShadow: '0 0 10px #fbbf24',
            }}
          >
            ✦ COMBO ×{combo} ✦
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full"
        style={{ paddingBottom: '100%' }}
      >
        <div
          className="absolute inset-0 rounded-[32px] overflow-hidden"
          style={{
            border: `1px solid ${planetColor}18`,
            background: `
              radial-gradient(ellipse at 50% 30%, ${planetColor}0c, transparent 65%),
              radial-gradient(ellipse at 50% 80%, ${planetColor}04, transparent 50%),
              radial-gradient(circle at 50% 50%, #001515, #000808)
            `,
            boxShadow: `inset 0 0 100px ${planetColor}04, 0 0 60px ${planetColor}03`,
          }}
        >
          <div className="absolute inset-4 rounded-2xl" style={{ border: `1px solid ${planetColor}08` }} />

          <NebulaParticles planetColor={planetColor} />

          <ConstellationWeb
            stars={stars}
            completedStars={completedStars}
            currentStarId={currentStar}
            planetColor={planetColor}
          />

          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 8 }}>
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 100,
                  height: 100,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, ${planetColor}0c 0%, transparent 70%)`,
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 62,
                  height: 62,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: `1px solid ${planetColor}14`,
                }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 78,
                  height: 78,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: `1px dashed ${planetColor}0e`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              />
              <Dado3D
                size={46}
                rolling={diceRolling}
                result={diceResult}
                onRollComplete={handleRollComplete}
              />
            </motion.div>
          </div>

          {stars.map((star, i) => (
            <StarNode
              key={star.id}
              star={star}
              isCurrent={star.id === currentStar}
              isCompleted={completedStars.has(star.id)}
              isHovered={hoveredStar === star.id}
              planetColor={planetColor}
              index={i}
              onHover={setHoveredStar}
              onClick={handleStarClick}
            />
          ))}

          <AnimatePresence>
            {burstStar && (
              <motion.div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
                {(() => {
                  const s = stars.find((st) => st.id === burstStar);
                  if (!s) return null;
                  return (
                    <motion.div
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${s.x}%`, top: `${s.y}%` }}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: s.size,
                          height: s.size,
                          background: s.category.color,
                          boxShadow: `0 0 60px ${s.category.color}`,
                        }}
                      />
                    </motion.div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showVictory && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="relative px-10 py-8 rounded-2xl text-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${planetColor}35, ${planetColor}15)`,
                    border: `2px solid ${planetColor}77`,
                    boxShadow: `0 0 100px ${planetColor}55, 0 0 200px ${planetColor}22`,
                    backdropFilter: 'blur(16px)',
                  }}
                  initial={{ scale: 0.5, y: 40 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 13, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-25"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${planetColor}, transparent 60%)` }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.25, 0.4, 0.25] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <motion.div
                    className="relative text-5xl mb-3"
                    animate={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  >
                    ✦
                  </motion.div>

                  <h3
                    className="relative text-2xl font-black mb-2"
                    style={{ color: '#fff', textShadow: `0 0 30px ${planetColor}` }}
                  >
                    ¡Constelación Completa!
                  </h3>
                  <p className="relative text-sm" style={{ color: `${planetColor}cc` }}>
                    Has iluminado todas las estrellas de Numérix
                  </p>

                  <motion.div
                    className="relative mt-6 flex justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {[1, 2, 3].map((star) => (
                      <motion.span
                        key={star}
                        className="text-2xl"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 12,
                          delay: 1.2 + star * 0.25,
                        }}
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showResult && !showVictory && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
            >
              <div
                className="px-5 py-2 rounded-full text-sm font-bold tracking-wide"
                style={{
                  background: `linear-gradient(135deg, ${planetColor}22, ${planetColor}0e)`,
                  border: `1px solid ${planetColor}55`,
                  color: '#fff',
                  boxShadow: `0 0 30px ${planetColor}22`,
                }}
              >
                🎲 {diceResult} — {diceResult} paso{diceResult !== 1 ? 's' : ''}
                {diceResult >= 5 && (
                  <span
                    className="ml-2 text-[9px] font-black tracking-widest"
                    style={{ color: '#fbbf24', textShadow: '0 0 8px #fbbf24' }}
                  >
                    ¡SUPER TIRADA!
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-center mt-6">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleRoll}
          disabled={diceRolling || showVictory}
          className="relative px-10 py-3.5 rounded-full text-sm font-bold tracking-widest overflow-hidden"
          style={{
            border: `1.5px solid ${diceRolling || showVictory ? planetColor + '44' : planetColor + 'aa'}`,
            color: '#fff',
            background: diceRolling || showVictory
              ? `${planetColor}15`
              : `linear-gradient(135deg, ${planetColor}35, ${planetColor}12)`,
            boxShadow: diceRolling || showVictory ? 'none' : `0 0 40px ${planetColor}22`,
            cursor: diceRolling || showVictory ? 'not-allowed' : 'pointer',
            opacity: diceRolling || showVictory ? 0.5 : 1,
          }}
        >
          {showVictory ? (
            <span className="flex items-center gap-2">✦ CONSTELACIÓN COMPLETA ✦</span>
          ) : diceRolling ? (
            <span className="flex items-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                ✦
              </motion.span>
              Revelando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-lg">🎲</span>
              REVELAR ESTRELLAS
            </span>
          )}
        </motion.button>
      </div>

      {currentStarData && (
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={currentStar}
        >
          <div
            className="inline-block px-4 py-1.5 rounded-lg text-[10px] font-medium leading-relaxed"
            style={{
              background: `${currentStarData.category.color}0c`,
              border: `1px solid ${currentStarData.category.color}25`,
              color: `${currentStarData.category.color}aa`,
            }}
          >
            Siguiente: <span style={{ color: currentStarData.category.color }}>{currentStarData.category.icon}</span>{' '}
            {currentStarData.category.label}
          </div>
        </motion.div>
      )}

      <CategoryLegend />
    </div>
  );
}