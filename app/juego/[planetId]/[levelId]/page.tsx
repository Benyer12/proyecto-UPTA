'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useCallback } from 'react';
import { getPlanetById } from '../../../../lib/mock-data';
import { useAuthStore } from '../../../../lib/auth-store';
import { guardarProgresoHibrido } from '../../../../lib/offline-sync';
import Dado3D from '../../../components/Dado3D';
import TableroIsometrico from '../../../components/TableroIsometrico';
import TableroLetralia from '../../../components/TableroLetralia';
import TableroNaturae from '../../../components/TableroNaturae';
import SoundTogglePill from '../../../../components/SoundTogglePill';
import { playDiceLand, playDiceRoll } from '../../../../lib/sound-engine';

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
        className="absolute inset-0 rounded-[32px] overflow-hidden liquid-glass backdrop-blur-lg"
        style={{
          border: `1.5px solid rgba(167, 243, 208, 0.36)`,
          background: `radial-gradient(ellipse at 50% 40%, ${planetColor}1E, rgba(2, 20, 16, 0.56) 72%)`,
          boxShadow: `inset 0 0 24px rgba(110, 231, 183, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.22), 0 24px 68px rgba(0, 0, 0, 0.72), 0 0 44px ${planetColor}1A`,
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
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 18 18"
                fill="none"
                className="w-4 h-4 animate-spin"
                aria-hidden="true"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="6.5"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="2"
                />
                <path
                  d="M9 2.5A6.5 6.5 0 0 1 15.5 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Rodando...</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle cx="7.2" cy="7.2" r="1.15" fill="currentColor" />
                <circle cx="12.8" cy="7.2" r="1.15" fill="currentColor" />
                <circle cx="10" cy="10" r="1.15" fill="currentColor" />
                <circle cx="7.2" cy="12.8" r="1.15" fill="currentColor" />
                <circle cx="12.8" cy="12.8" r="1.15" fill="currentColor" />
              </svg>
              <span>Lanzar dado</span>
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : '0,245,212';
}

export default function JuegoPage() {
  const params = useParams<{ planetId: string; levelId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const planetId = parseInt(params.planetId, 10);
  const levelId = parseInt(params.levelId, 10);

  const planet = useMemo(() => getPlanetById(planetId), [planetId]);
  const level = useMemo(() => {
    if (!planet) return null;
    for (const c of planet.courses) {
      const found = c.levels.find((l) => l.id === levelId || l.order === levelId);
      if (found) return found;
    }
    return null;
  }, [planet, levelId]);

  const isNumerix = Number(planetId) === 1;
  const isLetralia =
    Number(planetId) === 2 ||
    Boolean(planet && /letralia|verbum/i.test(planet.name));
  const isNaturae =
    Number(planetId) === 3 ||
    Boolean(planet && /naturae/i.test(planet.name));

  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(1);
  const [lastRoll, setLastRoll] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentPos, setCurrentPos] = useState(0);
  const [nivelGuardado, setNivelGuardado] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [mostrarJefeFinal, setMostrarJefeFinal] = useState(false);
  const [guardandoProgreso, setGuardandoProgreso] = useState(false);

  /**
   * Función principal de cálculo de estrellas y persistencia directa en Supabase.
   * Guarda tanto por cliente autenticado (para pasar RLS) como por Server Action.
   */
  const handleCompletarJefeFinal = useCallback(
    async (
      aciertosFinales: number = aciertos,
      totalFinales: number = totalPreguntas,
      redirigir: boolean = true
    ) => {
      const userId = (user as any)?.id;

      if (!userId || typeof userId !== 'string') {
        console.error('❌ Error de validación: El usuario no tiene un ID válido en la sesión.');
        return;
      }

      if (guardandoProgreso) return;
      setGuardandoProgreso(true);

      try {
        // --- 1. Cálculo de Estrellas Regulares por Porcentaje ---
        let estrellasRegulares = 3;
        if (totalFinales > 0) {
          const porcentaje = (aciertosFinales / totalFinales) * 100;
          if (porcentaje >= 90) {
            estrellasRegulares = 3;
          } else if (porcentaje >= 70 && porcentaje < 90) {
            estrellasRegulares = 2;
          } else {
            estrellasRegulares = 1;
          }
        }

        // --- 2. Bonificación Fija del Jefe Final (Reactor de Propulsión Cuántica) ---
        const bonificacionJefeFinal = 4;

        // --- 3. Sumatoria Total (Regulares + 4 del Jefe) ---
        const estrellasTotalesNivel = estrellasRegulares + bonificacionJefeFinal;

        // --- 4. Guardado híbrido (BD local PowerSync + Supabase cuando hay conexión) ---
        await guardarProgresoHibrido(userId, levelId, true, estrellasTotalesNivel);

        console.log(
          `✅ ¡Progreso actualizado! Nivel ${levelId} -> ${estrellasTotalesNivel} estrellas (${estrellasRegulares} regulares + ${bonificacionJefeFinal} jefe)`
        );

        if (redirigir) {
          router.refresh();
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('❌ Error crítico al guardar el progreso del nivel:', error);
        setNivelGuardado(false);
      } finally {
        setGuardandoProgreso(false);
      }
    },
    [aciertos, totalPreguntas, user, guardandoProgreso, levelId, router]
  );

  // Actualiza la posición del jugador; cada tablero (Numérix, Letralia, Naturae) guarda
  // su propio progreso únicamente cuando el estudiante derrota al Jefe Final.
  const handlePositionChange = useCallback(
    (pos: number) => {
      setCurrentPos(pos);

      if (!isLetralia && !isNumerix && !isNaturae && pos + 1 >= 20 && !nivelGuardado) {
        setMostrarJefeFinal(true);
      }
    },
    [isLetralia, isNumerix, isNaturae, nivelGuardado]
  );

  const handleRoll = useCallback(() => {
    if (diceRolling) return;
    const result = Math.floor(Math.random() * 6) + 1;
    setDiceResult(result);
    setDiceRolling(true);
    setShowResult(false);
    playDiceRoll();
  }, [diceRolling]);

  const handleRollComplete = useCallback(() => {
    setDiceRolling(false);
    setLastRoll(diceResult);
    setShowResult(true);
    playDiceLand();
  }, [diceResult]);

  if (!planet || !level) {
    return (
      <div className="fixed inset-0 z-[100] h-screen w-screen flex items-center justify-center px-6" style={{ background: '#00000a' }}>
        <FondoCosmico />
        <div className="relative z-10 text-center liquid-glass liquid-glass-panel rounded-3xl p-8 max-w-md w-full space-y-4">
          <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Nivel no encontrado</h1>
          <p className="text-[#CBD5E1] text-sm">Este nivel no existe en las cartas estelares disponibles.</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider liquid-glass-btn text-[#F8FAFC] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Volver al mapa</span>
          </button>
        </div>
      </div>
    );
  }

  const pc = hexToRgb(planet.color);

  if (isLetralia) {
    return (
      <div data-game-board="true" className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-[#1E293B]">
        <TableroLetralia onPositionChange={handlePositionChange} />
      </div>
    );
  }

  if (isNumerix) {
    return (
      <div data-game-board="true" className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-[#071326]">
        <TableroIsometrico
          planetColor={planet.color}
          planetGlow={planet.glow}
          onPositionChange={handlePositionChange}
        />
      </div>
    );
  }

  if (isNaturae) {
    return (
      <div data-game-board="true" className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-[#010C0A]">
        <TableroNaturae onPositionChange={handlePositionChange} />
      </div>
    );
  }

  return (
    <div
      data-game-board="true"
      className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #03221B 0%, #01100C 58%, #010606 100%)',
      }}
    >
      {/* Escenario 3D Studio CGI Bio-Cristal para Naturae */}
      <img
        src="/images/naturae-board-bg.jpg"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-95 mix-blend-screen"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(1, 16, 12, 0.25) 0%, rgba(1, 10, 8, 0.52) 100%)',
        }}
      />

      {/* ── HUD HEADER ── */}
      <header
        className="fixed top-0 left-0 w-full z-50 liquid-glass-header"
        style={{
          borderBottom: `1px solid rgba(${pc},.28)`,
        }}
      >
        <div className="w-full mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-all shadow-md"
              style={{
                color: '#fff',
                background: `linear-gradient(135deg, ${planet.color}40, ${planet.color}20)`,
                border: `1px solid ${planet.color}80`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${planet.color}60, ${planet.color}30)`;
                e.currentTarget.style.boxShadow = `0 0 15px ${planet.color}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${planet.color}40, ${planet.color}20)`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              VOLVER
            </button>
            <div style={{ borderLeft: `1px solid rgba(${pc},.3)`, height: 20 }} />
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-2"
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontWeight: 900,
                  fontSize: '.85rem',
                  letterSpacing: '.18em',
                  color: '#F8FAFC',
                }}
              >
                <span
                  aria-hidden="true"
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: planet.color, boxShadow: `0 0 10px ${planet.color}` }}
                />
                {planet.name.toUpperCase()}
              </span>
              <span
                className="hidden sm:inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#CBD5E1]"
                style={{
                  border: `1px solid rgba(${pc},.35)`,
                  background: `rgba(${pc},.1)`,
                }}
              >
                Tablero cuántico
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold tracking-wider text-[#CBD5E1] tabular-nums">
              {user ? `Jugador: ${user.name}` : 'Sin sesión'} · Casilla {currentPos + 1} / 20
            </div>
            <SoundTogglePill />
          </div>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="relative z-10 h-full" style={{ paddingTop: 56 }}>
        <div className="h-full flex flex-col items-center justify-center px-4">
          <GenericBoard
            planetColor={planet.color}
            diceRolling={diceRolling}
            diceResult={diceResult}
            showResult={showResult}
            onRoll={handleRoll}
            onRollComplete={handleRollComplete}
          />
        </div>
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