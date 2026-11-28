'use client';

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import { OrbitalSpinner } from '../../components/ui/PanelSkeletons';
import LottieAnimation from '../../components/ui/LottieAnimation';
import rollingCubesData from '../../lib/lottie/rolling-cubes.json';
import { runViewTransition } from '../../lib/view-transitions';
import SnakeArcadeGame from '../../components/SnakeArcadeGame';
import BreakoutArcadeGame from '../../components/minijuegos/BreakoutArcadeGame';
import InvadersArcadeGame from '../../components/minijuegos/InvadersArcadeGame';
import MemoryArcadeGame from '../../components/minijuegos/MemoryArcadeGame';
import RunnerArcadeGame from '../../components/minijuegos/RunnerArcadeGame';
import PongArcadeGame from '../../components/minijuegos/PongArcadeGame';
import TetrisArcadeGame from '../../components/minijuegos/TetrisArcadeGame';
import PacmanArcadeGame from '../../components/minijuegos/PacmanArcadeGame';
import { useAuthStore } from '../../lib/auth-store';
import { obtenerProgresoEstudianteHibrido } from '../../lib/offline-sync';
import {
  DEFAULT_MINIJUEGOS_CATALOG,
  type MinijuegoCatalogoItem,
  type ProgresoMinijuegoUsuario,
  type ResultadoPartidaInput,
} from '../../lib/minijuegos-types';

const ARTWORKS: Record<string, ReactNode> = {
  snake: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#050C1B" stroke="#67E8F9" strokeOpacity="0.3" />
      <rect x="20" y="38" width="12" height="12" rx="3.5" fill="#10B981" />
      <rect x="33" y="38" width="12" height="12" rx="3.5" fill="#10B981" />
      <rect x="46" y="38" width="12" height="12" rx="3.5" fill="#22D3EE" />
      <rect x="46" y="25" width="12" height="12" rx="3.5" fill="#22D3EE" />
      <rect x="59" y="25" width="13" height="12" rx="4" fill="#67E8F9" />
      <circle cx="68.5" cy="28.8" r="1.5" fill="#041521" />
      <circle cx="68.5" cy="33.2" r="1.5" fill="#041521" />
      <circle cx="92" cy="31" r="7" fill="#FB7185" />
      <ellipse cx="94" cy="22.5" rx="3" ry="1.6" transform="rotate(-25 94 22.5)" fill="#34D399" />
    </svg>
  ),
  breakout: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#0B071A" stroke="#D8B4FE" strokeOpacity="0.28" />
      <rect x="18" y="16" width="18" height="6" rx="2" fill="#D8B4FE" />
      <rect x="40" y="16" width="18" height="6" rx="2" fill="#A855F7" />
      <rect x="62" y="16" width="18" height="6" rx="2" fill="#D8B4FE" />
      <rect x="84" y="16" width="18" height="6" rx="2" fill="#F472B6" />
      <rect x="28" y="25" width="18" height="6" rx="2" fill="#67E8F9" />
      <rect x="50" y="25" width="18" height="6" rx="2" fill="#D8B4FE" />
      <rect x="72" y="25" width="18" height="6" rx="2" fill="#67E8F9" />
      <circle cx="62" cy="42" r="4" fill="#FDE68A" />
      <rect x="44" y="53" width="32" height="5" rx="2.5" fill="#E9D5FF" />
    </svg>
  ),
  invaders: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#04130E" stroke="#6EE7B7" strokeOpacity="0.28" />
      <rect x="48" y="18" width="24" height="12" rx="3" fill="#6EE7B7" />
      <rect x="43" y="22" width="5" height="6" rx="1" fill="#6EE7B7" />
      <rect x="72" y="22" width="5" height="6" rx="1" fill="#6EE7B7" />
      <rect x="53" y="22" width="4" height="4" fill="#04130E" />
      <rect x="63" y="22" width="4" height="4" fill="#04130E" />
      <rect x="59" y="35" width="2.5" height="9" rx="1" fill="#FDE68A" />
      <path d="M50 56L60 46L70 56H50Z" fill="#67E8F9" />
    </svg>
  ),
  memory: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#171204" stroke="#FDE68A" strokeOpacity="0.28" />
      <rect x="26" y="16" width="20" height="24" rx="4" fill="#FDE68A" fillOpacity="0.2" stroke="#FDE68A" />
      <rect x="50" y="16" width="20" height="24" rx="4" fill="#67E8F9" fillOpacity="0.22" stroke="#67E8F9" />
      <rect x="74" y="16" width="20" height="24" rx="4" fill="#FDE68A" fillOpacity="0.2" stroke="#FDE68A" />
      <text x="36" y="32" textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="800">★</text>
      <text x="60" y="32" textAnchor="middle" fill="#67E8F9" fontSize="12" fontWeight="800">?</text>
      <text x="84" y="32" textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="800">★</text>
      <rect x="34" y="47" width="52" height="5" rx="2.5" fill="#FDE68A" fillOpacity="0.4" />
    </svg>
  ),
  runner: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#180810" stroke="#FDA4AF" strokeOpacity="0.28" />
      <line x1="18" y1="52" x2="102" y2="52" stroke="#FDA4AF" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="32" y="24" width="14" height="14" rx="4" fill="#FDA4AF" />
      <polygon points="74,52 82,38 90,52" fill="#FDE68A" />
    </svg>
  ),
  pong: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#071024" stroke="#93C5FD" strokeOpacity="0.28" />
      <line x1="60" y1="14" x2="60" y2="58" stroke="#93C5FD" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 4" />
      <rect x="20" y="24" width="6" height="22" rx="3" fill="#67E8F9" />
      <rect x="94" y="30" width="6" height="22" rx="3" fill="#93C5FD" />
      <circle cx="64" cy="34" r="4.5" fill="#FFFFFF" />
    </svg>
  ),
  tetris: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#0F0B22" stroke="#C4B5FD" strokeOpacity="0.28" />
      <rect x="44" y="18" width="10" height="10" rx="2" fill="#C4B5FD" />
      <rect x="55" y="18" width="10" height="10" rx="2" fill="#C4B5FD" />
      <rect x="66" y="18" width="10" height="10" rx="2" fill="#C4B5FD" />
      <rect x="55" y="29" width="10" height="10" rx="2" fill="#C4B5FD" />
      <rect x="33" y="46" width="10" height="10" rx="2" fill="#67E8F9" />
      <rect x="44" y="46" width="10" height="10" rx="2" fill="#67E8F9" />
      <rect x="55" y="46" width="10" height="10" rx="2" fill="#6EE7B7" />
      <rect x="66" y="46" width="10" height="10" rx="2" fill="#6EE7B7" />
      <rect x="77" y="46" width="10" height="10" rx="2" fill="#FDE68A" />
    </svg>
  ),
  pacman: (
    <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="104" height="56" rx="10" fill="#04081A" stroke="#FACC15" strokeOpacity="0.34" />
      {/* Pac-Man eating dots */}
      <path d="M40 36 L52 27 A14 14 0 1 0 52 45 Z" fill="#FACC15" />
      <circle cx="58" cy="36" r="2.6" fill="#FDE68A" />
      <circle cx="70" cy="36" r="2.6" fill="#FDE68A" />
      {/* Classic Ghost */}
      <path d="M81 36 A8 8 0 0 1 97 36 V45 L93 42 L89 45 L85 42 L81 45 Z" fill="#EF4444" />
      <circle cx="86" cy="34" r="2" fill="#FFFFFF" />
      <circle cx="92" cy="34" r="2" fill="#FFFFFF" />
      <circle cx="85.5" cy="34" r="1" fill="#0F172A" />
      <circle cx="91.5" cy="34" r="1" fill="#0F172A" />
    </svg>
  ),
};

function LockIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 7V5.2C5.5 3.82 6.62 2.7 8 2.7C9.38 2.7 10.5 3.82 10.5 5.2V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getLocalProgressKey(userId: string) {
  return `minijuegos_progreso_local_${userId || 'guest'}`;
}

export default function MinijuegosPage() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [loadingStars, setLoadingStars] = useState(false);
  const [catalogo, setCatalogo] = useState<MinijuegoCatalogoItem[]>(DEFAULT_MINIJUEGOS_CATALOG);
  const [progresoUsuario, setProgresoUsuario] = useState<Record<string, ProgresoMinijuegoUsuario>>({});
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roleNorm = (user?.role || '').trim().toLowerCase();
  const isStaff = roleNorm === 'admin' || roleNorm === 'tutor' || roleNorm === 'docente';
  const isStudent = roleNorm === 'student';

  const cargarBaseMinijuegos = useCallback(async () => {
    const uid = user?.id ? String(user.id) : '';
    let localMap: Record<string, ProgresoMinijuegoUsuario> = {};
    if (uid) {
      try {
        const raw = localStorage.getItem(getLocalProgressKey(uid));
        if (raw) {
          localMap = JSON.parse(raw) as Record<string, ProgresoMinijuegoUsuario>;
          setProgresoUsuario(localMap);
        }
      } catch {
        // Ignore
      }
    }

    try {
      const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
      const res = await fetch(`/api/minijuegos${qs}`);
      const data = await res.json();
      if (data?.ok) {
        if (Array.isArray(data.minijuegos) && data.minijuegos.length > 0) {
          setCatalogo(data.minijuegos);
        }
        if (uid && data.progresoUsuario && typeof data.progresoUsuario === 'object') {
          const serverMap = data.progresoUsuario as Record<string, ProgresoMinijuegoUsuario>;
          const merged: Record<string, ProgresoMinijuegoUsuario> = { ...localMap };
          for (const [jid, srv] of Object.entries(serverMap)) {
            const loc = merged[jid];
            if (!loc || srv.intentos >= loc.intentos) {
              merged[jid] = srv;
            } else {
              merged[jid] = {
                ...loc,
                recordPersonal: Math.max(loc.recordPersonal, srv.recordPersonal),
                mejorDetalle: Math.max(loc.mejorDetalle, srv.mejorDetalle),
              };
            }
          }
          setProgresoUsuario(merged);
          try {
            localStorage.setItem(getLocalProgressKey(uid), JSON.stringify(merged));
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Fallback already set
    }
  }, [user]);

  useEffect(() => {
    if (!mounted) return;
    void cargarBaseMinijuegos();
  }, [mounted, cargarBaseMinijuegos]);

  useEffect(() => {
    if (!mounted || !user || !isStudent) return;
    let cancelled = false;
    setLoadingStars(true);
    obtenerProgresoEstudianteHibrido(String(user.id))
      .then((res) => {
        if (!cancelled) {
          setTotalStars(Number(res.totalStars) || 0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingStars(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, user, isStudent]);

  const guardarResultadoJuego = useCallback(
    async (minijuegoId: string, result: ResultadoPartidaInput) => {
      if (!user) return;
      const uid = String(user.id);
      const ahora = new Date().toISOString();

      setProgresoUsuario((prevMap) => {
        const prev = prevMap[minijuegoId] || {
          intentos: 0,
          recordPersonal: 0,
          ultimoPuntaje: 0,
          mejorDetalle: 0,
          ultimaModo: result.modo,
          tiempoTotalSegundos: 0,
          primeraPartida: ahora,
          ultimaPartida: ahora,
        };
        const updated: ProgresoMinijuegoUsuario = {
          intentos: prev.intentos + 1,
          recordPersonal: Math.max(prev.recordPersonal, result.puntaje),
          ultimoPuntaje: result.puntaje,
          mejorDetalle: Math.max(prev.mejorDetalle, result.detalleExtra),
          ultimaModo: result.modo,
          tiempoTotalSegundos: prev.tiempoTotalSegundos + result.duracionSegundos,
          primeraPartida: prev.primeraPartida || ahora,
          ultimaPartida: ahora,
        };
        const nextMap = { ...prevMap, [minijuegoId]: updated };
        try {
          localStorage.setItem(getLocalProgressKey(uid), JSON.stringify(nextMap));
        } catch {
          // Ignore
        }
        return nextMap;
      });

      try {
        const res = await fetch('/api/minijuegos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            userName: user.name || user.usuario || 'Jugador',
            role: user.role,
            minijuegoId,
            puntaje: result.puntaje,
            detalleExtra: result.detalleExtra,
            modo: result.modo,
            duracionSegundos: result.duracionSegundos,
          }),
        });
        const data = await res.json();
        if (data?.ok) {
          if (data.progresoJuego) {
            setProgresoUsuario((prevMap) => {
              const nextMap = { ...prevMap, [minijuegoId]: data.progresoJuego as ProgresoMinijuegoUsuario };
              try {
                localStorage.setItem(getLocalProgressKey(uid), JSON.stringify(nextMap));
              } catch {
                // Ignore
              }
              return nextMap;
            });
          }
          if (data.estadisticasGlobales) {
            setCatalogo((prevCat) =>
              prevCat.map((item) =>
                item.id === minijuegoId
                  ? { ...item, estadisticasGlobales: data.estadisticasGlobales }
                  : item,
              ),
            );
          }
        }
      } catch (err) {
        console.warn('No se pudo sincronizar con data/minijuegos-db.json:', err);
      }
    },
    [user],
  );

  const handleSelectGame = (game: MinijuegoCatalogoItem) => {
    setNotice(null);

    if (!user) {
      setNotice('Inicia sesión en la parte superior para entrar a la zona de Minijuegos.');
      return;
    }

    if (isStudent && loadingStars) {
      setNotice('Verificando tus estrellas sincronizadas, intenta en un segundo...');
      return;
    }

    const isUnlocked = isStaff || (isStudent && totalStars >= game.requiredStars);

    if (!isUnlocked) {
      const missing = Math.max(0, game.requiredStars - totalStars);
      setNotice(
        `Necesitas ${game.requiredStars} ★ para desbloquear "${game.titulo}". Tienes ${totalStars} ★ (te faltan ${missing} ★).`,
      );
      return;
    }

    runViewTransition(() => setSelectedGameId(game.id), 'forward');
  };

  const handleBackToCatalog = useCallback(() => {
    runViewTransition(() => {
      setSelectedGameId(null);
      setNotice(null);
    }, 'back');
    void cargarBaseMinijuegos();
  }, [cargarBaseMinijuegos]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <OrbitalSpinner size="md" label="Cargando sala arcade..." />
      </div>
    );
  }

  const renderSelectedGame = () => {
    if (!selectedGameId) return null;
    const prog = progresoUsuario[selectedGameId];
    const commonProps = {
      initialBestScore: prog?.recordPersonal || 0,
      initialAttempts: prog?.intentos || 0,
      onBack: handleBackToCatalog,
    };

    switch (selectedGameId) {
      case 'snake':
        return (
          <SnakeArcadeGame
            userKey={String(user?.id || 'guest')}
            {...commonProps}
            onGameFinished={(r) =>
              guardarResultadoJuego('snake', {
                puntaje: r.puntaje,
                detalleExtra: r.manzanas,
                modo: r.modo,
                duracionSegundos: r.duracionSegundos,
              })
            }
          />
        );
      case 'breakout':
        return (
          <BreakoutArcadeGame
            {...commonProps}
            onGameFinished={(r) => guardarResultadoJuego('breakout', r)}
          />
        );
      case 'invaders':
        return (
          <InvadersArcadeGame
            {...commonProps}
            onGameFinished={(r) => guardarResultadoJuego('invaders', r)}
          />
        );
      case 'memory':
        return (
          <MemoryArcadeGame
            {...commonProps}
            onGameFinished={(r) => guardarResultadoJuego('memory', r)}
          />
        );
      case 'runner':
        return (
          <RunnerArcadeGame
            {...commonProps}
            onGameFinished={(r) => guardarResultadoJuego('runner', r)}
          />
        );
      case 'pong':
        return (
          <PongArcadeGame
            {...commonProps}
            onGameFinished={(r) => guardarResultadoJuego('pong', r)}
          />
        );
      case 'tetris':
        return (
          <TetrisArcadeGame
            {...commonProps}
            onGameFinished={(r) => guardarResultadoJuego('tetris', r)}
          />
        );
      case 'pacman':
        return (
          <PacmanArcadeGame
            {...commonProps}
            onGameFinished={(r) => guardarResultadoJuego('pacman', r)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {loadingStars && (
          <div className="flex justify-end">
            <OrbitalSpinner size="xs" label="Sincronizando estrellas..." />
          </div>
        )}
        {/* Cabecera Arcade Liquid Glass */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-7 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="shrink-0 self-start sm:self-center flex items-center justify-center rounded-3xl border border-[#67E8F9]/25 bg-[#040916]/60 p-2 shadow-[0_0_36px_-10px_rgba(103,232,249,0.5)]">
              <LottieAnimation
                animationData={rollingCubesData as Record<string, unknown>}
                size={132}
                speed={1.15}
                forcePlay
                renderer="canvas"
              />
            </div>

            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#67E8F9]/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#67E8F9] shadow-[0_0_20px_-6px_rgba(103,232,249,0.4)]">
                <LottieAnimation preset="gamepad" size={22} />
                <span>Sala Arcade · 8 Juegos Activos</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Minijuegos Espaciales
              </h1>
              <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
                Elige cualquiera de los 8 arcades clásicos para divertirte entre misiones. Tus intentos y
                récords personales se guardan automáticamente en la base local de minijuegos.
              </p>
            </div>
          </div>

          <LiquidGlass
            blur={6}
            refraction={8}
            bezel={0.2}
            className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3.5 self-start lg:self-auto shrink-0"
            style={{ '--liquid-glass-rim-uniform': 'rgba(255, 255, 255, 0.14)' } as CSSProperties}
          >
            {!user ? (
              <div className="text-xs text-white/75">
                Inicia sesión para guardar intentos, récords y estrellas ★
              </div>
            ) : isStaff ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#6EE7B7]/15 border border-[#6EE7B7]/40 text-[#6EE7B7] font-black text-sm">
                  ★
                </span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#6EE7B7]">
                    {roleNorm === 'admin' ? 'Administrador' : 'Tutor'}
                  </div>
                  <div className="text-sm font-bold text-white">Acceso libre a los 8 juegos</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE68A]/15 border border-[#FDE68A]/40 text-[#FDE68A] font-black text-base">
                  ★
                </span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#FDE68A]">
                    Tus estrellas acumuladas
                  </div>
                  <div className="text-base font-extrabold text-white tabular-nums">
                    {loadingStars ? 'Cargando...' : `${totalStars} ★`}
                    <span className="text-xs font-medium text-white/55 ml-2">
                      (Desde 17 ★ hasta 80 ★)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </LiquidGlass>
        </section>

        {notice && (
          <div
            role="status"
            className="rounded-2xl border border-[#FDE68A]/35 bg-[#FDE68A]/[0.08] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#FEF3C7]"
          >
            <span>{notice}</span>
            {isStudent && totalStars < 80 && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white text-black px-4 py-1.5 text-xs font-bold hover:bg-white/90 transition-colors shrink-0 self-start sm:self-auto"
              >
                Ir a ganar estrellas →
              </Link>
            )}
          </div>
        )}

        <div>
        {selectedGameId ? (
          renderSelectedGame()
        ) : (
          <section aria-label="Catálogo de 8 minijuegos arcade">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {catalogo.map((game) => {
                const unlockedByStars = isStaff || (isStudent && totalStars >= game.requiredStars);
                const missingStars = Math.max(0, game.requiredStars - totalStars);
                const progressPct = isStaff
                  ? 100
                  : Math.min(100, Math.round((totalStars / game.requiredStars) * 100));
                const miProgreso = progresoUsuario[game.id];

                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSelectGame(game)}
                    className="group text-left focus:outline-none cursor-pointer"
                  >
                    <LiquidGlass
                      blur={7}
                      refraction={10}
                      bezel={0.22}
                      saturation={1.14}
                      className={`relative aspect-square w-full rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                        unlockedByStars
                          ? 'bg-white/[0.04] border-white/15 hover:bg-white/[0.08] hover:-translate-y-1'
                          : 'bg-white/[0.02] border-white/10 opacity-90 hover:opacity-100'
                      }`}
                      style={
                        {
                          '--liquid-glass-rim-uniform': unlockedByStars
                            ? game.glow
                            : 'rgba(255, 255, 255, 0.10)',
                        } as CSSProperties
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                          style={{
                            color: game.accent,
                            backgroundColor: game.bgTint,
                            borderColor: game.glow,
                          }}
                        >
                          #{game.slot} · {game.genero}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold border ${
                            unlockedByStars
                              ? 'border-[#FDE68A]/45 bg-[#FDE68A]/12 text-[#FDE68A]'
                              : 'border-white/20 bg-black/40 text-white/85'
                          }`}
                        >
                          {!unlockedByStars && <LockIcon className="w-3 h-3 text-[#FDE68A]" />}
                          <span>★ {game.requiredStars}</span>
                        </span>
                      </div>

                      <div className="relative my-2 flex-1 flex items-center justify-center">
                        <div
                          className={`w-full h-full max-h-[108px] transition-transform duration-200 ${
                            unlockedByStars ? 'group-hover:scale-[1.03]' : 'grayscale-[35%] opacity-75'
                          }`}
                        >
                          {ARTWORKS[game.id] || ARTWORKS.snake}
                        </div>

                        {!unlockedByStars && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 border border-[#FDE68A]/40 px-3 py-1 text-[11px] font-bold text-[#FDE68A] backdrop-blur-sm">
                              <LockIcon className="w-3.5 h-3.5" />
                              Faltan {missingStars} ★
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h2 className="text-base font-extrabold text-white leading-tight truncate">
                            {game.titulo}
                          </h2>
                          <p className="text-[11.5px] text-white/65 line-clamp-2 mt-0.5 leading-snug">
                            {game.descripcion}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-white/60 bg-white/[0.03] border border-white/10 rounded-xl px-2.5 py-1">
                          <span>Intentos: {miProgreso?.intentos ?? 0}</span>
                          <span className="text-[#FDE68A] font-bold">
                            Récord: {miProgreso?.recordPersonal ?? 0}
                          </span>
                        </div>

                        {!isStaff ? (
                          <div className="space-y-1">
                            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${progressPct}%`,
                                  backgroundColor: unlockedByStars ? '#6EE7B7' : '#FDE68A',
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-white/55">
                              <span>
                                {user
                                  ? `${totalStars}/${game.requiredStars} ★`
                                  : `Requiere ${game.requiredStars} ★`}
                              </span>
                              <span>
                                {!user
                                  ? 'Inicia sesión'
                                  : unlockedByStars
                                    ? 'Listo para jugar →'
                                    : 'Bloqueado'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-semibold">
                            <span className="text-[#6EE7B7]">Desbloqueado</span>
                            <span style={{ color: game.accent }}>Seleccionar y jugar →</span>
                          </div>
                        )}
                      </div>
                    </LiquidGlass>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        </div>
      </div>
    </div>
  );
}
