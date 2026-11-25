'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import SnakeArcadeGame from '../../components/SnakeArcadeGame';
import { useAuthStore } from '../../lib/auth-store';
import { obtenerProgresoEstudianteHibrido } from '../../lib/offline-sync';

interface MinijuegoDef {
  id: string;
  slot: string;
  titulo: string;
  genero: string;
  descripcion: string;
  requiredStars: number;
  playable: boolean;
  accent: string;
  glow: string;
  bgTint: string;
  artwork: ReactNode;
}

const MINIJUEGOS: MinijuegoDef[] = [
  {
    id: 'snake',
    slot: '01',
    titulo: 'Serpiente Estelar',
    genero: 'Clásico Arcade',
    descripcion: 'Come manzanas espaciales y haz crecer tu serpiente.',
    requiredStars: 17,
    playable: true,
    accent: '#67E8F9',
    glow: 'rgba(103, 232, 249, 0.36)',
    bgTint: 'rgba(103, 232, 249, 0.10)',
    artwork: (
      <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="104" height="56" rx="10" fill="#050C1B" stroke="#67E8F9" strokeOpacity="0.3" />
        {/* Snake body */}
        <rect x="20" y="38" width="12" height="12" rx="3.5" fill="#10B981" />
        <rect x="33" y="38" width="12" height="12" rx="3.5" fill="#10B981" />
        <rect x="46" y="38" width="12" height="12" rx="3.5" fill="#22D3EE" />
        <rect x="46" y="25" width="12" height="12" rx="3.5" fill="#22D3EE" />
        <rect x="59" y="25" width="13" height="12" rx="4" fill="#67E8F9" />
        <circle cx="68.5" cy="28.8" r="1.5" fill="#041521" />
        <circle cx="68.5" cy="33.2" r="1.5" fill="#041521" />
        {/* Apple */}
        <circle cx="92" cy="31" r="7" fill="#FB7185" />
        <ellipse cx="94" cy="22.5" rx="3" ry="1.6" transform="rotate(-25 94 22.5)" fill="#34D399" />
      </svg>
    ),
  },
  {
    id: 'breakout',
    slot: '02',
    titulo: 'Ladrillos Cósmicos',
    genero: 'Destreza',
    descripcion: 'Rebota la esfera de plasma y rompe muros estelares.',
    requiredStars: 22,
    playable: false,
    accent: '#D8B4FE',
    glow: 'rgba(216, 180, 254, 0.32)',
    bgTint: 'rgba(216, 180, 254, 0.10)',
    artwork: (
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
  },
  {
    id: 'invaders',
    slot: '03',
    titulo: 'Invasores Arcade',
    genero: 'Acción Retro',
    descripcion: 'Defiende la base espacial de oleadas pixeladas.',
    requiredStars: 26,
    playable: false,
    accent: '#6EE7B7',
    glow: 'rgba(110, 231, 183, 0.32)',
    bgTint: 'rgba(110, 231, 183, 0.10)',
    artwork: (
      <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="104" height="56" rx="10" fill="#04130E" stroke="#6EE7B7" strokeOpacity="0.28" />
        {/* Alien icon */}
        <rect x="48" y="18" width="24" height="12" rx="3" fill="#6EE7B7" />
        <rect x="43" y="22" width="5" height="6" rx="1" fill="#6EE7B7" />
        <rect x="72" y="22" width="5" height="6" rx="1" fill="#6EE7B7" />
        <rect x="53" y="22" width="4" height="4" fill="#04130E" />
        <rect x="63" y="22" width="4" height="4" fill="#04130E" />
        <rect x="59" y="35" width="2.5" height="9" rx="1" fill="#FDE68A" />
        {/* Ship */}
        <path d="M50 56L60 46L70 56H50Z" fill="#67E8F9" />
      </svg>
    ),
  },
  {
    id: 'memory',
    slot: '04',
    titulo: 'Memoria Galáctica',
    genero: 'Memoria',
    descripcion: 'Encuentra pares de símbolos ocultos en menos turnos.',
    requiredStars: 30,
    playable: false,
    accent: '#FDE68A',
    glow: 'rgba(253, 230, 138, 0.32)',
    bgTint: 'rgba(253, 230, 138, 0.10)',
    artwork: (
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
  },
  {
    id: 'runner',
    slot: '05',
    titulo: 'Salto Orbital',
    genero: 'Plataformas',
    descripcion: 'Corre y salta cráteres lunares sin perder impulso.',
    requiredStars: 34,
    playable: false,
    accent: '#FDA4AF',
    glow: 'rgba(253, 164, 175, 0.32)',
    bgTint: 'rgba(253, 164, 175, 0.10)',
    artwork: (
      <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="104" height="56" rx="10" fill="#180810" stroke="#FDA4AF" strokeOpacity="0.28" />
        <line x1="18" y1="52" x2="102" y2="52" stroke="#FDA4AF" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="32" y="24" width="14" height="14" rx="4" fill="#FDA4AF" />
        <polygon points="74,52 82,38 90,52" fill="#FDE68A" />
      </svg>
    ),
  },
  {
    id: 'pong',
    slot: '06',
    titulo: 'Pong Nebular',
    genero: 'Duelo 1v1',
    descripcion: 'Duelo clásico de reflejos contra la inteligencia orbital.',
    requiredStars: 38,
    playable: false,
    accent: '#93C5FD',
    glow: 'rgba(147, 197, 253, 0.32)',
    bgTint: 'rgba(147, 197, 253, 0.10)',
    artwork: (
      <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="104" height="56" rx="10" fill="#071024" stroke="#93C5FD" strokeOpacity="0.28" />
        <line x1="60" y1="14" x2="60" y2="58" stroke="#93C5FD" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 4" />
        <rect x="20" y="24" width="6" height="22" rx="3" fill="#67E8F9" />
        <rect x="94" y="30" width="6" height="22" rx="3" fill="#93C5FD" />
        <circle cx="64" cy="34" r="4.5" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'tetris',
    slot: '07',
    titulo: 'Bloques Quánticos',
    genero: 'Puzle Arcade',
    descripcion: 'Encaja piezas luminosas y completa líneas completas.',
    requiredStars: 42,
    playable: false,
    accent: '#C4B5FD',
    glow: 'rgba(196, 181, 253, 0.32)',
    bgTint: 'rgba(196, 181, 253, 0.10)',
    artwork: (
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
  },
  {
    id: 'whack',
    slot: '08',
    titulo: 'Caza Cometas',
    genero: 'Velocidad',
    descripcion: 'Atrapa destellos estelares antes de que desaparezcan.',
    requiredStars: 46,
    playable: false,
    accent: '#5EEAD4',
    glow: 'rgba(94, 234, 212, 0.32)',
    bgTint: 'rgba(94, 234, 212, 0.10)',
    artwork: (
      <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="104" height="56" rx="10" fill="#051717" stroke="#5EEAD4" strokeOpacity="0.28" />
        <circle cx="36" cy="28" r="8" fill="#5EEAD4" fillOpacity="0.18" stroke="#5EEAD4" strokeOpacity="0.4" />
        <circle cx="60" cy="42" r="9" fill="#5EEAD4" />
        <circle cx="84" cy="28" r="8" fill="#5EEAD4" fillOpacity="0.18" stroke="#5EEAD4" strokeOpacity="0.4" />
        <path d="M60 35L62.2 39.5L67 40.2L63.5 43.6L64.3 48.4L60 46.1L55.7 48.4L56.5 43.6L53 40.2L57.8 39.5L60 35Z" fill="#041515" />
      </svg>
    ),
  },
];

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

export default function MinijuegosPage() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [loadingStars, setLoadingStars] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roleNorm = (user?.role || '').trim().toLowerCase();
  const isStaff = roleNorm === 'admin' || roleNorm === 'tutor' || roleNorm === 'docente';
  const isStudent = roleNorm === 'student';

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

  const handleSelectGame = (game: MinijuegoDef) => {
    setNotice(null);

    if (!user) {
      setNotice('Inicia sesión en la parte superior para entrar a la zona de Minijuegos.');
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

    if (!game.playable) {
      setNotice(
        `"${game.titulo}" está diseñado y reservado para próximas misiones. Por ahora selecciona "Serpiente Estelar" (#01) para jugar.`,
      );
      return;
    }

    setSelectedGameId(game.id);
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <p className="text-sm text-white/60">Cargando sala arcade...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12">
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Cabecera Arcade Liquid Glass */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-7 border-b border-white/10">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/35 bg-[#67E8F9]/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#67E8F9] shadow-[0_0_20px_-6px_rgba(103,232,249,0.4)]">
              <span className="h-2 w-2 rounded-full bg-[#67E8F9]" aria-hidden="true" />
              Sala Arcade · Entretenimiento
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Minijuegos Espaciales
            </h1>
            <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
              Elige un arcade clásico para descansar entre misiones. Tutores y administradores tienen acceso
              inmediato; los estudiantes desbloquean cada cuadro al reunir las estrellas necesarias.
            </p>
          </div>

          {/* Indicador de acceso / estrellas */}
          <LiquidGlass
            blur={6}
            refraction={8}
            bezel={0.2}
            className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3.5 self-start lg:self-auto shrink-0"
            style={{ '--liquid-glass-rim-uniform': 'rgba(255, 255, 255, 0.14)' } as CSSProperties}
          >
            {!user ? (
              <div className="text-xs text-white/75">
                Inicia sesión para ver tu acceso o tus estrellas ★
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
                  <div className="text-sm font-bold text-white">Acceso libre a los minijuegos</div>
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
                      (1.º juego: 17 ★)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </LiquidGlass>
        </section>

        {/* Aviso informativo al pulsar cuadro bloqueado / próximo / sin sesión */}
        {notice && (
          <div
            role="status"
            className="rounded-2xl border border-[#FDE68A]/35 bg-[#FDE68A]/[0.08] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#FEF3C7]"
          >
            <span>{notice}</span>
            {isStudent && totalStars < 17 && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white text-black px-4 py-1.5 text-xs font-bold hover:bg-white/90 transition-colors shrink-0 self-start sm:self-auto"
              >
                Ir a ganar estrellas →
              </Link>
            )}
          </div>
        )}

        {/* Si seleccionó Serpiente Estelar -> Cabina Arcade; si no -> Grid de 8 cuadros */}
        {selectedGameId === 'snake' ? (
          <SnakeArcadeGame
            userKey={String(user?.id || 'guest')}
            onBack={() => {
              setSelectedGameId(null);
              setNotice(null);
            }}
          />
        ) : (
          <section aria-label="Catálogo de 8 minijuegos arcade">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {MINIJUEGOS.map((game) => {
                const unlockedByStars = isStaff || (isStudent && totalStars >= game.requiredStars);
                const missingStars = Math.max(0, game.requiredStars - totalStars);
                const progressPct = isStaff
                  ? 100
                  : Math.min(100, Math.round((totalStars / game.requiredStars) * 100));

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
                      {/* Franja superior: slot + requisito de estrellas visible siempre */}
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

                      {/* Centro: Pantalla arcade minimalista */}
                      <div className="relative my-2 flex-1 flex items-center justify-center">
                        <div
                          className={`w-full h-full max-h-[115px] transition-transform duration-200 ${
                            unlockedByStars ? 'group-hover:scale-[1.03]' : 'grayscale-[35%] opacity-75'
                          }`}
                        >
                          {game.artwork}
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

                      {/* Pie del cuadro: título, descripción y barra/estado de desbloqueo */}
                      <div className="space-y-2">
                        <div>
                          <h2 className="text-base font-extrabold text-white leading-tight truncate">
                            {game.titulo}
                          </h2>
                          <p className="text-[11.5px] text-white/65 line-clamp-2 mt-0.5 leading-snug">
                            {game.descripcion}
                          </p>
                        </div>

                        {!isStaff && (
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
                              <span>{user ? `${totalStars}/${game.requiredStars} ★` : `Requiere ${game.requiredStars} ★`}</span>
                              <span>
                                {!user
                                  ? 'Inicia sesión'
                                  : unlockedByStars
                                    ? game.playable
                                      ? 'Listo para jugar'
                                      : 'Próximamente'
                                    : 'Bloqueado'}
                              </span>
                            </div>
                          </div>
                        )}

                        {isStaff && (
                          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-semibold">
                            <span className="text-[#6EE7B7]">Desbloqueado</span>
                            <span style={{ color: game.accent }}>
                              {game.playable ? 'Seleccionar y jugar →' : 'En diseño'}
                            </span>
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
  );
}
