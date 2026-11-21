'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../lib/auth-store';
import { supabase } from '../lib/supabase';
import LiquidGlassToast, {
  type LiquidGlassToastData,
} from '../app/components/LiquidGlassToast';
import type { LoginData, RegisterData } from '../shared/types';

interface DropdownParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  length: number;
  angle: number;
  targetAngle: number;
  color: string;
  baseAlpha: number;
  alpha: number;
  phase: number;
  speed: number;
  orbitRadius: number;
  orbitOffset: number;
}

const DROPDOWN_PALETTE = [
  '0, 245, 255',   // Cyan Numérix
  '56, 189, 248',  // Azul celeste
  '59, 130, 246',  // Azul profundo
  '191, 64, 255',  // Púrpura Letralia
  '217, 70, 239',  // Magenta
  '0, 255, 136',   // Esmeralda Naturae
  '250, 204, 21',  // Dorado estelar
];

function DropdownAntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: DropdownParticle[] = [];

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      vx: 0,
      vy: 0,
      active: false,
    };

    const getColor = (x: number, y: number, w: number, h: number) => {
      const nx = x / Math.max(1, w);
      const ny = y / Math.max(1, h);
      const ratio = Math.max(0, Math.min(0.999, nx * 0.65 + ny * 0.35 + (Math.random() - 0.5) * 0.2));
      return DROPDOWN_PALETTE[Math.floor(ratio * DROPDOWN_PALETTE.length)];
    };

    const initParticles = (w: number, h: number) => {
      const list: DropdownParticle[] = [];
      const spacing = w < 640 ? 64 : 52;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = (c + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.8;
          const oy = (r + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.8;
          const ang = Math.random() * Math.PI * 2;
          list.push({
            x: ox,
            y: oy,
            originX: ox,
            originY: oy,
            vx: 0,
            vy: 0,
            size: 1.2 + Math.random() * 1.1,
            length: 3.5 + Math.random() * 4.5,
            angle: ang,
            targetAngle: ang,
            color: getColor(ox, oy, w, h),
            baseAlpha: 0.14 + Math.random() * 0.2,
            alpha: 0.18,
            phase: Math.random() * Math.PI * 2,
            speed: 0.45 + Math.random() * 0.55,
            orbitRadius: 48 + Math.random() * 115,
            orbitOffset: Math.random() * Math.PI * 2,
          });
        }
      }
      return list;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(320, rect.width);
      canvas.height = Math.max(300, rect.height);
      particles = initParticles(canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left - 40 &&
        e.clientX <= rect.right + 40 &&
        e.clientY >= rect.top - 40 &&
        e.clientY <= rect.bottom + 40
      ) {
        const rx = e.clientX - rect.left;
        const ry = e.clientY - rect.top;
        mouse.targetX = rx;
        mouse.targetY = ry;
        if (!mouse.active) {
          mouse.x = rx;
          mouse.y = ry;
          mouse.active = true;
        }
      } else {
        mouse.active = false;
      }
    };

    const animate = (ts: number) => {
      const time = ts / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouse.active) {
        const px = mouse.x;
        const py = mouse.y;
        mouse.x += (mouse.targetX - mouse.x) * 0.13;
        mouse.y += (mouse.targetY - mouse.y) * 0.13;
        mouse.vx = mouse.x - px;
        mouse.vy = mouse.y - py;
      } else {
        mouse.vx *= 0.9;
        mouse.vy *= 0.9;
      }

      const attractRadius = 290;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const floatX = Math.cos(time * p.speed + p.phase) * 5;
        const floatY = Math.sin(time * p.speed * 0.85 + p.phase) * 5;
        const homeX = p.originX + floatX;
        const homeY = p.originY + floatY;

        let targetAlpha = p.baseAlpha * (0.75 + 0.25 * Math.sin(time * 1.4 + p.phase));
        let stretch = 1;

        if (mouse.active) {
          const dxM = mouse.x - p.x;
          const dyM = mouse.y - p.y;
          const distM = Math.hypot(dxM, dyM);
          const distO = Math.hypot(mouse.x - p.originX, mouse.y - p.originY);
          const effDist = Math.min(distM, distO * 0.85);

          if (effDist < attractRadius) {
            const inf = 1 - effDist / attractRadius;
            const smooth = inf * inf;
            const orbitAng = p.orbitOffset + time * 0.4;
            const desX = mouse.x + Math.cos(orbitAng) * p.orbitRadius;
            const desY = mouse.y + Math.sin(orbitAng) * p.orbitRadius;

            p.vx += (desX - p.x) * 0.025 * smooth + mouse.vx * 0.045 * smooth;
            p.vy += (desY - p.y) * 0.025 * smooth + mouse.vy * 0.045 * smooth;

            if (distM < 36 && distM > 0.1) {
              const push = ((36 - distM) / 36) * 0.35;
              p.vx -= (dxM / distM) * push;
              p.vy -= (dyM / distM) * push;
            }

            targetAlpha = Math.min(0.65, p.baseAlpha + smooth * 0.36);
            stretch = 1 + smooth * 0.85;
          }
        }

        p.vx += (homeX - p.x) * 0.015;
        p.vy += (homeY - p.y) * 0.015;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > 0.04) {
          p.targetAngle = Math.atan2(p.vy, p.vx);
        } else if (mouse.active) {
          p.targetAngle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
        } else {
          p.targetAngle = Math.atan2(floatY, floatX);
        }

        let diff = p.targetAngle - p.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        p.angle += diff * 0.13;
        p.alpha += (targetAlpha - p.alpha) * 0.14;

        const len = (p.length + Math.min(5, Math.sqrt(speedSq) * 1.4)) * stretch;
        const half = len * 0.5;
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);

        ctx.beginPath();
        ctx.moveTo(p.x - cos * half, p.y - sin * half);
        ctx.lineTo(p.x + cos * half, p.y + sin * half);
        ctx.strokeStyle = `rgba(${p.color}, ${p.alpha.toFixed(3)})`;
        ctx.lineWidth = p.size * 1.45;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animationId = requestAnimationFrame(animate);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

const PLANET_CHIPS = [
  { name: 'Numérix', sub: 'Matemáticas', icon: '🔢', color: '#00f5ff', bg: 'rgba(0, 245, 255, 0.09)' },
  { name: 'Letralia', sub: 'Lenguas', icon: '📖', color: '#bf40ff', bg: 'rgba(191, 64, 255, 0.09)' },
  { name: 'Naturae', sub: 'Ciencias', icon: '🌿', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.09)' },
];

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Roles' },
  { href: '/admin/pendientes', label: 'Pendientes', isPending: true },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/asignaciones', label: 'Asignaciones' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, login, register, logout, getRedirect } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [authToast, setAuthToast] = useState<LiquidGlassToastData | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  const fetchPendingCount = useCallback(async (): Promise<number> => {
    const { count, error } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true })
      .in('role', ['student', 'tutor'])
      .eq('status', false);

    if (error) {
      console.error('Error al consultar usuarios pendientes:', error.message);
      return 0;
    }

    const total = count ?? 0;
    setPendingCount(total);
    return total;
  }, []);

  // Mantener actualizado el contador de pendientes para el menú superior del administrador
  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      setPendingCount(0);
      return;
    }

    fetchPendingCount();

    const handlePendingUpdated = () => {
      fetchPendingCount();
    };
    window.addEventListener('admin-pending-updated', handlePendingUpdated);
    return () => {
      window.removeEventListener('admin-pending-updated', handlePendingUpdated);
    };
  }, [token, user, pathname, fetchPendingCount]);

  // Verificar que cuentas activas (student/tutor, excepto admin) no hayan sido desactivadas
  useEffect(() => {
    if (!token || !user || user.role === 'admin') return;
    let cancelled = false;

    const verificarEstadoCuenta = async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('status, role, nombre')
        .eq('id', String(user.id))
        .maybeSingle();

      if (cancelled || error || !data) return;

      if (data.role !== 'admin' && data.status === false) {
        const rolLegible =
          data.role === 'tutor' || data.role === 'docente' ? 'Tutor' : 'Estudiante';
        await supabase.auth.signOut().catch(() => {});
        logout();
        router.push('/');
        setAuthToast({
          id: Date.now(),
          variant: 'blocked',
          eyebrow: 'SESIÓN INTERRUMPIDA · CUENTA INACTIVA',
          title: 'Acceso suspendido por administración',
          message: `Tu cuenta de ${rolLegible} (${data.nombre || user.name}) fue marcada como inactiva. Comunícate con un administrador para restablecer tu acceso.`,
          durationMs: 7500,
        });
      }
    };

    verificarEstadoCuenta();
    return () => {
      cancelled = true;
    };
  }, [token, user, pathname, logout, router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest('[data-liquid-toast="true"]')) return;
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const resetLoginForm = () => {
    setLoginUser('');
    setLoginPass('');
    setLoginError('');
  };

  const resetRegForm = () => {
    setRegName('');
    setRegEmail('');
    setRegUser('');
    setRegPass('');
    setRegError('');
    setRegSuccess(false);
  };

  const handleLogin = async () => {
    setLoginError('');
    setLoading(true);

    const ok = await login({ username: loginUser, password: loginPass } as LoginData);

    setLoading(false);
    if (ok) {
      setIsOpen(false);
      resetLoginForm();
      const loggedUser = useAuthStore.getState().user;
      if (loggedUser?.role === 'admin') {
        const totalPendientes = await fetchPendingCount();
        if (totalPendientes > 0) {
          setAuthToast({
            id: Date.now(),
            variant: 'pending',
            eyebrow: 'SOLICITUDES DE ACCESO',
            title:
              totalPendientes === 1
                ? 'Tienes 1 usuario pendiente por aprobar'
                : `Tienes ${totalPendientes} usuarios pendientes por aprobar`,
            message:
              'Hay cuentas recién registradas esperando tu aprobación para poder iniciar sesión en la plataforma.',
            actionLabel: 'Revisar pendientes',
            onAction: () => router.push('/admin/pendientes'),
            durationMs: 8500,
          });
        }
      }
      router.push(getRedirect() as any);
    } else {
      const err = useAuthStore.getState().lastLoginError;
      if (err?.code === 'INACTIVE_ACCOUNT') {
        const rolLegible =
          err.usuarioRol === 'tutor' || err.usuarioRol === 'docente'
            ? 'Tutor'
            : 'Estudiante';
        setLoginError(
          `Esta cuenta de ${rolLegible} está inactiva. Contacta a un administrador para reactivarla.`,
        );
        setAuthToast({
          id: Date.now(),
          variant: 'blocked',
          eyebrow: 'ACCESO DENEGADO · CUENTA INACTIVA',
          title: 'No es posible iniciar sesión',
          message:
            err.message ||
            `Tu cuenta de ${rolLegible} se encuentra desactivada actualmente. Un administrador debe reactivarla para permitir el acceso.`,
          durationMs: 7500,
        });
      } else {
        setLoginError('Usuario o contraseña incorrectos.');
      }
    }
  };

  const handleRegister = async () => {
    setRegError('');
    if (!regName || !regEmail || !regUser || !regPass) {
      setRegError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);
    const ok = await register({
      name: regName,
      email: regEmail,
      username: regUser,
      password: regPass,
    } as RegisterData);

    setLoading(false);
    if (ok) {
      setRegSuccess(true);
      setTimeout(() => {
        setTab('login');
        resetRegForm();
      }, 3200);
    } else {
      const regErrMsg = useAuthStore.getState().lastRegisterError;
      setRegError(regErrMsg || 'Error al crear la cuenta. Intenta con otro usuario.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
    <header className="fixed top-0 left-0 w-full z-50 liquid-glass-header">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-white no-underline group">
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌌</span>
          <span className="font-extrabold text-lg tracking-wide hidden sm:inline bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            Universo del Conocimiento
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!(token && user?.role === 'admin') && (
            <nav className="hidden sm:flex items-center gap-6">
              <Link href="/about" className="text-sm font-semibold tracking-wide text-slate-200 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                Acerca de
              </Link>
              <Link href="/how-to-play" className="text-sm font-semibold tracking-wide text-slate-200 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                Cómo jugar
              </Link>
            </nav>
          )}

          {token && user ? (
            <nav
              className={`flex items-center gap-4 ${
                user.role === 'admin' ? '' : 'ml-4 pl-5 border-l border-white/15'
              }`}
            >
              {user.role === 'admin' && (
                <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl liquid-glass-pill">
                  {ADMIN_NAV_ITEMS.map((item) => {
                    const isActive =
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname?.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                          isActive
                            ? 'liquid-glass-btn text-white'
                            : 'text-slate-300 hover:text-white hover:bg-white/8'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.isPending && pendingCount > 0 && (
                          <span
                            className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black leading-none"
                            style={{
                              background:
                                'linear-gradient(135deg, rgba(251, 191, 36, 0.92) 0%, rgba(245, 158, 11, 0.95) 100%)',
                              color: '#1E1B4B',
                              boxShadow: '0 0 12px rgba(251, 191, 36, 0.65)',
                            }}
                          >
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {(user.role === 'tutor' || user.role === 'docente') && (
                <Link href="/maestro" className="text-sm font-semibold tracking-wide text-cyan-300 hover:text-cyan-200 transition-colors px-3 py-1.5 rounded-lg liquid-glass-pill">
                  Mis Estudiantes
                </Link>
              )}

              {user.role === 'student' && (
                <Link href="/dashboard" className="text-sm font-semibold tracking-wide text-cyan-300 hover:text-cyan-200 transition-colors px-3 py-1.5 rounded-lg liquid-glass-pill">
                  Dashboard
                </Link>
              )}

              <div className="flex items-center gap-3 pl-4 border-l border-white/15">
                <div className="text-right leading-tight">
                  <div className="text-sm text-white font-semibold">{user.name}</div>
                  <div className="text-[11px] text-cyan-300/80 uppercase tracking-wider font-medium">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold liquid-glass-pill hover:bg-white/15 text-white px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Salir
                </button>
              </div>
            </nav>
          ) : (
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                resetLoginForm();
                resetRegForm();
              }}
              className="liquid-glass-btn text-white text-sm font-bold tracking-wide px-5 py-2 rounded-xl cursor-pointer"
            >
              Iniciar sesión
            </button>
          )}

          {/* Botón menú móvil / tablet */}
          <button
            className={`${
              token && user?.role === 'admin' ? 'lg:hidden' : 'sm:hidden'
            } text-white p-2 liquid-glass-pill rounded-lg cursor-pointer`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menú Móvil / Tablet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${
              token && user?.role === 'admin' ? 'lg:hidden' : 'sm:hidden'
            } border-t border-white/15 liquid-glass-dropdown overflow-hidden`}
          >
            <div className="flex flex-col p-4 gap-2">
              {token && user?.role === 'admin' ? (
                <>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#93C5FD] px-3 pt-1 pb-1">
                    Secciones de Administración
                  </div>
                  {ADMIN_NAV_ITEMS.map((item) => {
                    const isActive =
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname?.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between text-sm font-bold px-3.5 py-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'liquid-glass-btn text-white'
                            : 'text-slate-200 hover:text-white hover:bg-white/8'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.isPending && pendingCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-2 rounded-full text-[11px] font-black bg-amber-400 text-slate-950">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </>
              ) : (
                <>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-cyan-300 px-3 py-2 rounded-lg hover:bg-white/5">
                    Acerca de
                  </Link>
                  <Link href="/how-to-play" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-cyan-300 px-3 py-2 rounded-lg hover:bg-white/5">
                    Cómo jugar
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel Desplegable de Autenticación con Partículas Interactivas + Cápsulas Liquid Glass */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={formRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
            className="relative overflow-hidden border-t border-white/15 liquid-glass-dropdown"
          >
            {/* Lienzo de partículas Antigravity dentro del panel desplegable */}
            <DropdownAntigravityCanvas />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 md:py-10">
              <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                {/* Columna Izquierda: Tarjeta de Telemetría y Mundos en Liquid Glass */}
                <div className="hidden lg:flex lg:col-span-5 flex-col justify-between rounded-3xl liquid-glass p-7">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f5ff]" />
                      Portal de Acceso Estelar
                    </div>

                    <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                      Explora el cosmos del aprendizaje
                    </h3>

                    <p className="text-xs text-slate-300/90 leading-relaxed">
                      Ingresa con tu cuenta de explorador, tutor o administrador para sincronizar tu progreso, misiones y estrellas en tiempo real.
                    </p>
                  </div>

                  {/* Mini cápsulas Liquid Glass de los 3 planetas */}
                  <div className="space-y-2.5 my-5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Mundos conectados
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {PLANET_CHIPS.map((p) => (
                        <div
                          key={p.name}
                          className="liquid-glass-pill rounded-2xl p-3 text-center"
                          style={{
                            background: `linear-gradient(155deg, ${p.bg} 0%, rgba(15, 20, 38, 0.45) 100%)`,
                            borderColor: `${p.color}40`,
                          }}
                        >
                          <div className="text-xl mb-1">{p.icon}</div>
                          <div className="text-xs font-extrabold text-white tracking-wide">{p.name}</div>
                          <div className="text-[10px] font-semibold" style={{ color: p.color }}>
                            {p.sub}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estado del sistema en cápsula Liquid Glass */}
                  <div className="liquid-glass-pill rounded-2xl px-4 py-3 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span>🛡️</span> Sincronización Offline/Online
                    </span>
                    <span className="text-emerald-300 font-bold tracking-wider uppercase text-[10px]">
                      ● Activa
                    </span>
                  </div>
                </div>

                {/* Columna Derecha: Cápsula Liquid Glass del Formulario */}
                <div className="lg:col-span-7">
                  <div className="rounded-3xl liquid-glass p-6 sm:p-8 h-full flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300/90 block">
                          {tab === 'login' ? 'Bienvenido de vuelta' : 'Nuevo Explorador'}
                        </span>
                        <h4 className="text-xl font-black text-white tracking-wide">
                          {tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Espacial'}
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="liquid-glass-pill w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
                        title="Cerrar panel"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Selector de pestañas en cápsula Liquid Glass */}
                    <div className="flex mb-6 p-1.5 rounded-2xl liquid-glass-pill">
                      <button
                        onClick={() => { setTab('login'); resetRegForm(); }}
                        className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                          tab === 'login'
                            ? 'liquid-glass-btn text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Iniciar sesión
                      </button>
                      <button
                        onClick={() => { setTab('register'); resetLoginForm(); }}
                        className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                          tab === 'register'
                            ? 'liquid-glass-btn text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Registrarse
                      </button>
                    </div>

                    {tab === 'login' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-200 font-semibold tracking-wide" htmlFor="header-user">
                            Usuario
                          </label>
                          <input
                            id="header-user"
                            type="text"
                            value={loginUser}
                            onChange={(e) => setLoginUser(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500"
                            placeholder="Tu nombre de usuario"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-200 font-semibold tracking-wide" htmlFor="header-pass">
                            Contraseña
                          </label>
                          <input
                            id="header-pass"
                            type="password"
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500"
                            placeholder="Tu contraseña"
                          />
                        </div>

                        {loginError && (
                          <div className="liquid-glass-pill border-rose-400/45 bg-rose-500/12 rounded-xl px-4 py-2.5 text-rose-200 text-xs font-semibold flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 shadow-[0_0_8px_rgba(251,113,133,0.85)]" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <button
                          onClick={handleLogin}
                          disabled={loading}
                          className="w-full liquid-glass-btn text-white font-bold py-3 rounded-xl text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                        >
                          {loading ? 'Conectando...' : '🚀 Entrar al Universo'}
                        </button>
                      </div>
                    )}

                    {tab === 'register' && (
                      <div className="space-y-3.5">
                        {regSuccess ? (
                          <div className="text-center py-8 liquid-glass-pill rounded-2xl p-6 space-y-2 border-emerald-400/35">
                            <p className="text-emerald-300 font-bold text-base">
                              Registro completado
                            </p>
                            <p className="text-slate-300 text-xs leading-relaxed max-w-sm mx-auto">
                              Tu cuenta quedó en estado pendiente. Un administrador deberá aprobar
                              tu solicitud antes de que puedas iniciar sesión.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="grid sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="text-xs text-slate-200 font-semibold tracking-wide" htmlFor="reg-name">
                                  Nombre completo
                                </label>
                                <input
                                  id="reg-name"
                                  type="text"
                                  value={regName}
                                  onChange={(e) => setRegName(e.target.value)}
                                  className="w-full mt-1 liquid-glass-input rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-slate-500"
                                  placeholder="Ej: Juan Pérez"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-200 font-semibold tracking-wide" htmlFor="reg-email">
                                  Correo electrónico
                                </label>
                                <input
                                  id="reg-email"
                                  type="email"
                                  value={regEmail}
                                  onChange={(e) => setRegEmail(e.target.value)}
                                  className="w-full mt-1 liquid-glass-input rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-slate-500"
                                  placeholder="correo@ejemplo.com"
                                />
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="text-xs text-slate-200 font-semibold tracking-wide" htmlFor="reg-user">
                                  Usuario
                                </label>
                                <input
                                  id="reg-user"
                                  type="text"
                                  value={regUser}
                                  onChange={(e) => setRegUser(e.target.value)}
                                  className="w-full mt-1 liquid-glass-input rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-slate-500"
                                  placeholder="Nombre de usuario"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-200 font-semibold tracking-wide" htmlFor="reg-pass">
                                  Contraseña
                                </label>
                                <input
                                  id="reg-pass"
                                  type="password"
                                  value={regPass}
                                  onChange={(e) => setRegPass(e.target.value)}
                                  className="w-full mt-1 liquid-glass-input rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-slate-500"
                                  placeholder="Mínimo 6 caracteres"
                                />
                              </div>
                            </div>

                            {regError && (
                              <div className="liquid-glass-pill border-rose-400/45 bg-rose-500/12 rounded-xl px-4 py-2.5 text-rose-200 text-xs font-semibold flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 shadow-[0_0_8px_rgba(251,113,133,0.85)]" />
                                <span>{regError}</span>
                              </div>
                            )}

                            <button
                              onClick={handleRegister}
                              disabled={loading}
                              className="w-full liquid-glass-btn text-white font-bold py-3 rounded-xl text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {loading ? 'Creando cuenta...' : '✨ Crear cuenta'}
                            </button>

                            <p className="text-[11px] text-slate-400 text-center">
                              Después de registrarte, un administrador aprobará tu cuenta.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    <LiquidGlassToast toast={authToast} onClose={() => setAuthToast(null)} />
    </>
  );
}
