'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useCallback } from 'react';
import { getPlanetById } from '../../../../lib/mock-data';
import Dado3D from '../../../components/Dado3D';
import NumerixBoard from '../../../components/NumerixBoard';

const FondoCosmico = dynamic(() => import('../../../FondoCosmico'), { ssr: false });

function OrbitingDot({ radius, size, color, delay }: { radius: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 8px ${color}`,
        left: '50%',
        top: '50%',
        x: -size / 2,
        y: -size / 2,
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 12px ${color}`,
          left: radius,
          top: 0,
        }}
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay }}
      />
    </motion.div>
  );
}

function GenericBoard({
  planetColor,
  diceRolling,
  diceResult,
  showResult,
  onRoll,
  onRollComplete,
}: {
  planetColor: string;
  diceRolling: boolean;
  diceResult: number;
  showResult: boolean;
  onRoll: () => void;
  onRollComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="relative w-full max-w-sm aspect-square"
    >
      <div
        className="absolute inset-0 rounded-[32px] overflow-hidden"
        style={{
          border: `1px solid ${planetColor}22`,
          background: `radial-gradient(ellipse at 50% 40%, ${planetColor}15, transparent 70%), radial-gradient(ellipse at 50% 80%, ${planetColor}08, transparent 50%)`,
          boxShadow: `inset 0 0 80px ${planetColor}08, 0 0 60px ${planetColor}08`,
        }}
      >
        <div className="absolute inset-4 rounded-2xl border border-white/[0.03]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className="absolute rounded-full"
              style={{
                width: 200,
                height: 200,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${planetColor}11 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 140,
                height: 140,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: `1px solid ${planetColor}15`,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 180,
                height: 180,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: `1px dashed ${planetColor}10`,
              }}
            />

            <OrbitingDot radius={85} size={4} color={planetColor} delay={0} />
            <OrbitingDot radius={100} size={3} color={planetColor} delay={0.8} />
            <OrbitingDot radius={75} size={3.5} color={planetColor} delay={1.6} />

            <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
              <Dado3D
                size={90}
                rolling={diceRolling}
                result={diceResult}
                onRollComplete={onRollComplete}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div
              className="px-5 py-2 rounded-full text-sm font-bold tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${planetColor}22, ${planetColor}11)`,
                border: `1px solid ${planetColor}44`,
                color: '#fff',
                boxShadow: `0 0 30px ${planetColor}22`,
              }}
            >
              {diceResult}/6
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-5">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onRoll}
          disabled={diceRolling}
          className="relative px-10 py-3.5 rounded-full text-sm font-bold tracking-widest overflow-hidden"
          style={{
            border: `1.5px solid ${diceRolling ? planetColor + '44' : planetColor + '99'}`,
            color: '#fff',
            background: diceRolling
              ? `${planetColor}15`
              : `linear-gradient(135deg, ${planetColor}30, ${planetColor}10)`,
            boxShadow: diceRolling ? 'none' : `0 0 30px ${planetColor}22`,
            cursor: diceRolling ? 'not-allowed' : 'pointer',
            opacity: diceRolling ? 0.5 : 1,
          }}
        >
          {diceRolling ? (
            <span className="flex items-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                ⏳
              </motion.span>
              Rodando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>🎲</span>
              LANZAR DADO
            </span>
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div
            className="inline-block px-4 py-2 rounded-xl text-[10px] leading-relaxed"
            style={{
              border: `1px solid ${planetColor}15`,
              background: `${planetColor}06`,
              color: `${planetColor}88`,
            }}
          >
            <span className="font-bold tracking-widest uppercase">Módulo de Preguntas</span>
            <br />
            Próximamente
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function JuegoPage() {
  const params = useParams<{ planetId: string; levelId: string }>();
  const router = useRouter();
  const planetId = parseInt(params.planetId, 10);
  const levelId = parseInt(params.levelId, 10);

  const planet = useMemo(() => getPlanetById(planetId), [planetId]);
  const level = useMemo(() => {
    if (!planet) return null;
    for (const c of planet.courses) {
      const found = c.levels.find((l) => l.id === levelId);
      if (found) return found;
    }
    return null;
  }, [planet, levelId]);

  const isNumerixLevel1 = planetId === 1 && levelId === 1;

  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(1);
  const [lastRoll, setLastRoll] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleRoll = useCallback(() => {
    if (diceRolling) return;
    const result = Math.floor(Math.random() * 6) + 1;
    setDiceResult(result);
    setDiceRolling(true);
    setShowResult(false);
  }, [diceRolling]);

  const handleRollComplete = useCallback(() => {
    setDiceRolling(false);
    setLastRoll(diceResult);
    setShowResult(true);
  }, [diceResult]);

  if (!planet || !level) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" style={{ background: '#00000a' }}>
        <FondoCosmico />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-black text-white mb-2">Nivel no encontrado</h1>
          <p className="text-slate-400 text-sm mb-4">Este nivel no existe en el cosmos...</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 rounded-full text-sm font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            ← Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  const course = planet.courses.find((c) => c.levels.some((l) => l.id === levelId));

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#00000a' }}>
      <FondoCosmico />
      <div className="relative z-10 px-4 py-8 max-w-5xl mx-auto min-h-screen flex flex-col">
        <button
          onClick={() => router.push(`/planeta/${planetId}`)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4 shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="text-center mb-6 shrink-0">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-1">
            <span>{planet.name}</span>
            <span className="text-slate-700">/</span>
            <span style={{ color: planet.color }}>{course?.name}</span>
          </div>
          <h1 className="text-lg font-black text-white">{level.name}</h1>
        </div>

        <div className="flex-1 flex items-center justify-center pb-8">
          {isNumerixLevel1 ? (
            <NumerixBoard planetColor={planet.color} planetGlow={planet.glow} />
          ) : (
            <GenericBoard
              planetColor={planet.color}
              diceRolling={diceRolling}
              diceResult={diceResult}
              showResult={showResult}
              onRoll={handleRoll}
              onRollComplete={handleRollComplete}
            />
          )}
        </div>

        {!isNumerixLevel1 && (
          <div className="text-center shrink-0 pb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div
                className="inline-block px-4 py-2 rounded-xl text-[10px] leading-relaxed"
                style={{
                  border: `1px solid ${planet.color}15`,
                  background: `${planet.color}06`,
                  color: `${planet.color}88`,
                }}
              >
                <span className="font-bold tracking-widest uppercase">Módulo de Preguntas</span>
                <br />
                Próximamente
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <style>{`
        @property --angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
      `}</style>
    </div>
  );
}