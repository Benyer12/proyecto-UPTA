'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../lib/auth-store';
import { useThemeStore } from '../lib/theme-store';
import { useSettingsStore } from '../lib/settings-store';
import { supabase } from '../lib/supabase';
import {
  hayConexionInternet,
  obtenerUsuariosHibrido,
} from '../lib/offline-sync';
import LiquidGlassToast, {
  type LiquidGlassToastData,
} from '../app/components/LiquidGlassToast';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import GlassTooltip from './ui/GlassTooltip';
import { OrbitalSpinner } from './ui/PanelSkeletons';
import LottieAnimation from './ui/LottieAnimation';
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

const DROPDOWN_LIGHT_PALETTE = [
  '2, 132, 199',   // Cyan océano
  '37, 99, 235',   // Azul cobalto
  '124, 58, 237',  // Violeta real
  '192, 38, 211',  // Orquídea
  '5, 150, 105',   // Esmeralda profunda
  '217, 119, 6',   // Ámbar solar
  '14, 116, 144',  // Turquesa
];

function DropdownAntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const isEco = useSettingsStore((s) => s.designMode === 'eco');
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (isEco) return;
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
      const palette = themeRef.current === 'light' ? DROPDOWN_LIGHT_PALETTE : DROPDOWN_PALETTE;
      const nx = x / Math.max(1, w);
      const ny = y / Math.max(1, h);
      const ratio = Math.max(0, Math.min(0.999, nx * 0.65 + ny * 0.35 + (Math.random() - 0.5) * 0.2));
      return palette[Math.floor(ratio * palette.length)];
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
  }, [theme, isEco]);

  if (isEco) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

const PLANET_CHIPS = [
  { id: 'numerix', name: 'Numérix', sub: 'Matemáticas', color: '#67E8F9', bg: 'rgba(0, 245, 255, 0.09)' },
  { id: 'letralia', name: 'Letralia', sub: 'Lenguas', color: '#D8B4FE', bg: 'rgba(191, 64, 255, 0.09)' },
  { id: 'naturae', name: 'Naturae', sub: 'Ciencias', color: '#6EE7B7', bg: 'rgba(0, 255, 136, 0.09)' },
] as const;

function BrandOrbitMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="brandCore" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="55%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="8.5" fill="url(#brandCore)" />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="5.2"
        transform="rotate(-24 16 16)"
        stroke="#E2EEFF"
        strokeWidth="1.6"
        strokeOpacity="0.9"
      />
      <circle cx="26.5" cy="10.2" r="2.1" fill="#6EE7B7" />
    </svg>
  );
}

function PlanetChipGlyph({ id, color }: { id: 'numerix' | 'letralia' | 'naturae'; color: string }) {
  if (id === 'numerix') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-auto mb-1.5">
        <rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth="1.6" />
        <path d="M8.5 9H15.5L11.5 12L15.5 15H8.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === 'letralia') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-auto mb-1.5">
        <path d="M19 5C13.5 5.5 9 9.5 7 16L5.5 19L8.5 17.5C15 15.5 18.5 11 19 5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6.5 18L15 9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mx-auto mb-1.5">
      <path d="M18.5 5.5C12.5 5.5 7.5 9 6.5 16.5C14 15.5 18.5 11.5 18.5 5.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 16.5C8.5 13.5 11.5 11 15 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Roles' },
  { href: '/admin/pendientes', label: 'Pendientes', isPending: true },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/asignaciones', label: 'Asignaciones' },
  { href: '/minijuegos', label: 'Minijuegos' },
];

function formatRoleLabel(role?: string | null): string {
  const normalized = (role || '').trim().toLowerCase();
  if (normalized === 'admin') return 'Administrador';
  if (normalized === 'tutor' || normalized === 'docente') return 'Tutor';
  return 'Estudiante';
}

function PasswordEyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
        <path
          d="M2.5 12C4.6 7.8 8 5.5 12 5.5C16 5.5 19.4 7.8 21.5 12C19.4 16.2 16 18.5 12 18.5C8 18.5 4.6 16.2 2.5 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
      <path
        d="M3 3L21 21M10.6 10.7C10.2 11.1 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 12.9 13.8 13.3 13.4M6.7 6.8C4.8 8.1 3.4 9.9 2.5 12C4.6 16.2 8 18.5 12 18.5C13.9 18.5 15.6 17.9 17.1 16.9M14.1 5.8C13.4 5.6 12.7 5.5 12 5.5C11.1 5.5 10.2 5.6 9.4 5.9M19.3 14.8C20.2 13.9 20.9 13 21.5 12C19.4 7.8 16 5.5 12 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, login, register, logout, getRedirect } = useAuthStore();
  const initSettings = useSettingsStore((s) => s.initSettings);
  const settingsInitialized = useSettingsStore((s) => s.initialized);

  useEffect(() => {
    if (!settingsInitialized) {
      initSettings();
    }
  }, [settingsInitialized, initSettings]);

  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [authToast, setAuthToast] = useState<LiquidGlassToastData | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  const fetchPendingCount = useCallback(async (): Promise<number> => {
    try {
      const { usuarios } = await obtenerUsuariosHibrido({
        roles: ['student', 'tutor'],
        soloInactivos: true,
      });
      const total = usuarios.length;
      setPendingCount(total);
      return total;
    } catch {
      return 0;
    }
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
    if (!hayConexionInternet()) return;
    let cancelled = false;

    const verificarEstadoCuenta = async () => {
      if (!hayConexionInternet()) return;
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
    setShowLoginPass(false);
    setLoginError('');
  };

  const resetRegForm = () => {
    setRegName('');
    setRegEmail('');
    setRegUser('');
    setRegPass('');
    setRegPassConfirm('');
    setShowRegPass(false);
    setShowRegConfirmPass(false);
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
    if (!regName || !regEmail || !regUser || !regPass || !regPassConfirm) {
      setRegError('Todos los campos son obligatorios.');
      return;
    }

    if (regPass.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regPass !== regPassConfirm) {
      setRegError('Las contraseñas no coinciden. Verifica ambos campos.');
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

  if (pathname?.startsWith('/juego')) {
    return null;
  }

  return (
    <>
    <header className="fixed top-3 left-0 w-full z-40 px-3 sm:px-6 pointer-events-none">
      {/* Barra flotante Liquid Glass estilo glasscn (píldora suspendida con refracción SVG) */}
      <div className="mx-auto max-w-5xl pointer-events-auto">
        <LiquidGlass
          blur={2}
          refraction={20}
          bezel={0.4}
          saturation={1.65}
          className="h-14 rounded-full bg-[#050814]/[0.34] border-white/[0.16] px-3.5 sm:px-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-10px_20px_-10px_rgba(180,220,255,0.16),0_18px_48px_-22px_rgba(0,0,0,0.75)]"
        >
          <div className="h-full flex items-center justify-between gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white no-underline group min-h-[40px] pl-1 shrink-0"
            >
              <span className="transition-transform duration-300 group-hover:scale-105">
                <BrandOrbitMark />
              </span>
              <span className="font-bold text-sm sm:text-[15px] tracking-tight hidden sm:inline text-white">
                Universo del Conocimiento
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {!(token && user?.role === 'admin') && (
                <nav className={`${token ? 'hidden lg:flex' : 'hidden sm:flex'} items-center gap-1`}>
                  <Link
                    href="/about"
                    className={`text-xs sm:text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                      pathname === '/about'
                        ? 'bg-white/12 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    Acerca de
                  </Link>
                  <Link
                    href="/how-to-play"
                    className={`text-xs sm:text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                      pathname === '/how-to-play'
                        ? 'bg-white/12 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    Cómo jugar
                  </Link>
                  <Link
                    href="/minijuegos"
                    className={`text-xs sm:text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      pathname === '/minijuegos'
                        ? 'bg-[#67E8F9]/20 text-[#67E8F9] border border-[#67E8F9]/35'
                        : 'text-[#67E8F9]/90 hover:text-[#67E8F9] hover:bg-white/[0.06]'
                    }`}
                  >
                    Minijuegos
                  </Link>
                </nav>
              )}

              {token && user ? (
                <nav className="flex items-center gap-1.5 sm:gap-2">
                  {user.role === 'admin' && (
                    <div className="hidden lg:flex items-center gap-0.5 px-1">
                      {ADMIN_NAV_ITEMS.map((item) => {
                        const isActive =
                          item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname?.startsWith(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`glance inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                              isActive
                                ? 'bg-white text-black'
                                : 'text-white/70 hover:text-white hover:bg-white/[0.07]'
                            }`}
                          >
                            <span>{item.label}</span>
                            {item.isPending && pendingCount > 0 && (
                              <span
                                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black leading-none ${
                                  isActive
                                    ? 'bg-black text-amber-300'
                                    : 'bg-amber-400 text-black'
                                }`}
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
                    <div className="flex items-center gap-1 rounded-full bg-white/[0.05] p-1 border border-white/10">
                      <Link
                        href="/maestro"
                        className={`text-xs sm:text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                          pathname === '/maestro'
                            ? 'bg-white text-black'
                            : 'text-white/80 hover:text-white'
                        }`}
                      >
                        Mis Estudiantes
                      </Link>
                      <Link
                        href="/maestro/ia"
                        className={`text-xs sm:text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                          pathname === '/maestro/ia'
                            ? 'bg-white text-black'
                            : 'text-[#67E8F9] hover:text-white'
                        }`}
                      >
                        Copiloto IA
                      </Link>
                    </div>
                  )}

                  {user.role === 'student' && (
                    <Link
                      href="/dashboard"
                      className={`text-xs sm:text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                        pathname === '/dashboard'
                          ? 'bg-white text-black'
                          : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
                      }`}
                    >
                      Mi Universo
                    </Link>
                  )}

                  <div className="flex items-center gap-2 pl-2.5 ml-0.5 border-l border-white/12">
                    <div className="hidden md:block text-right leading-tight">
                      <div className="text-xs text-white font-semibold max-w-[120px] truncate">
                        {user.name}
                      </div>
                      <div className="font-mono text-[10px] text-white/55 uppercase tracking-wider">
                        {formatRoleLabel(user.role)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="min-h-[36px] text-xs font-semibold bg-white/[0.07] hover:bg-white/[0.14] border border-white/12 text-white px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>
                </nav>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setIsOpen(!isOpen);
                    resetLoginForm();
                    resetRegForm();
                  }}
                  className="min-h-[40px] bg-white hover:bg-white/90 text-black text-xs sm:text-[13px] font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Iniciar sesión
                </button>
              )}

              {/* Único botón de Configuración (engranaje mecánico) en el panel superior */}
              <GlassTooltip label="Configuración" placement="bottom">
                <Link
                  href="/configuracion"
                  aria-label="Abrir configuración de la plataforma"
                  data-active-pill={pathname === '/configuracion' ? 'true' : undefined}
                  className={`hidden sm:inline-flex items-center justify-center w-[38px] h-[38px] rounded-full border transition-colors shrink-0 ${
                    pathname === '/configuracion'
                      ? 'bg-white text-black border-white'
                      : 'bg-[#060a18]/[0.45] border-white/[0.16] text-white/80 hover:text-white hover:bg-white/[0.12]'
                  }`}
                >
                  <LottieAnimation preset="gear" size={20} speed={0.75} />
                </Link>
              </GlassTooltip>

              {/* Botón menú móvil / tablet con etiqueta visible */}
              <button
                type="button"
                aria-expanded={mobileMenuOpen}
                className={`${
                  token ? 'lg:hidden' : 'sm:hidden'
                } min-h-[40px] inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.14] border border-white/12 cursor-pointer`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  {mobileMenuOpen ? (
                    <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  ) : (
                    <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  )}
                </svg>
                <span>Menú</span>
              </button>
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* Menú Móvil / Tablet flotante en cristal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={`${
              token ? 'lg:hidden' : 'sm:hidden'
            } pointer-events-auto mx-auto max-w-5xl mt-2.5 rounded-2xl liquid-glass-dropdown overflow-hidden`}
          >
            <div className="flex flex-col p-3 gap-1.5">
              {token && user?.role === 'admin' ? (
                <>
                  <div className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/45 px-3 pt-1 pb-1">
                    Administración
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
                        className={`min-h-[44px] flex items-center justify-between text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                          isActive
                            ? 'bg-white text-black'
                            : 'text-white/80 hover:text-white hover:bg-white/[0.07]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.isPending && pendingCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-2 rounded-full text-[11px] font-black bg-amber-400 text-black">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </>
              ) : (
                <>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center text-sm font-medium text-white/80 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.07]">
                    Acerca de
                  </Link>
                  <Link href="/how-to-play" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center text-sm font-medium text-white/80 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.07]">
                    Cómo jugar
                  </Link>
                  <Link href="/minijuegos" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center text-sm font-semibold text-[#67E8F9] hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.07]">
                    Minijuegos
                  </Link>
                  {(user?.role === 'tutor' || user?.role === 'docente') && (
                    <>
                      <Link href="/maestro" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center text-sm font-medium text-white/80 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.07]">
                        Mis Estudiantes
                      </Link>
                      <Link href="/maestro/ia" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center text-sm font-semibold text-[#67E8F9] hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.07]">
                        Copiloto IA
                      </Link>
                    </>
                  )}
                  {user?.role === 'student' && (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center text-sm font-medium text-white/80 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.07]">
                      Mi Universo
                    </Link>
                  )}
                </>
              )}
              <Link
                href="/configuracion"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                  pathname === '/configuracion'
                    ? 'bg-white text-black'
                    : 'text-white/85 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <GearIcon className="w-4 h-4 shrink-0" />
                <span>Configuración</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* Modal de Autenticación por encima de la barra superior (z-[90]) con scroll interno en móvil */}
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            ref={formRef}
            data-reading-priority="true"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl liquid-glass-dropdown will-change-transform"
          >
            {/* Lienzo de partículas Antigravity dentro del panel desplegable */}
            <DropdownAntigravityCanvas />

            <div className="relative z-20 p-5 sm:p-8">
              <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                {/* Columna Izquierda: Ventana informativa limpia con mayor opacidad */}
                <div className="hidden lg:flex lg:col-span-5 flex-col justify-between rounded-2xl border border-white/12 bg-[#070b18]/85 p-6">
                  <div className="space-y-3">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/50 block">
                      Portal de acceso
                    </span>

                    <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                      Tu espacio de aprendizaje
                    </h3>

                    <p className="text-sm text-white/65 leading-relaxed">
                      Inicia sesión como estudiante para acceder a los mundos interactivos, o entra como tutor o administrador para gestionar el aula.
                    </p>
                  </div>

                  <div className="space-y-2 my-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                      Áreas disponibles al ingresar
                    </div>
                    <div className="space-y-2">
                      {PLANET_CHIPS.map((p) => (
                        <div
                          key={p.name}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <PlanetChipGlyph id={p.id} color={p.color} />
                            <span className="text-xs font-semibold text-white">{p.sub}</span>
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                            {p.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 flex items-center justify-between text-xs">
                    <span className="text-white/70 font-medium">Sincronización en la nube</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6EE7B7]">
                      Activa
                    </span>
                  </div>
                </div>

                {/* Columna Derecha: Formulario limpio en cristal con alta legibilidad */}
                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-white/12 bg-[#070b18]/85 p-5 sm:p-7 h-full flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/50 block">
                          {tab === 'login' ? 'Acceso a tu cuenta' : 'Nuevo registro'}
                        </span>
                        <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                          {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 rounded-full border border-white/12 bg-white/[0.05] hover:bg-white/[0.12] flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-colors"
                        aria-label="Cerrar panel de acceso"
                      >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Selector de pestañas estilo segmented pill */}
                    <div
                      role="tablist"
                      aria-label="Modo de acceso"
                      className="relative z-20 flex mb-6 p-1 rounded-full border border-white/10 bg-white/[0.04]"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'login'}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          setTab('login');
                          resetRegForm();
                        }}
                        className={`flex-1 min-h-[40px] py-2 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                          tab === 'login'
                            ? 'bg-white text-black'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        Iniciar sesión
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'register'}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          setTab('register');
                          resetLoginForm();
                        }}
                        className={`flex-1 min-h-[40px] py-2 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                          tab === 'register'
                            ? 'bg-white text-black'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        Registrarse
                      </button>
                    </div>

                    {tab === 'login' && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void handleLogin();
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-xs text-white/75 font-medium" htmlFor="header-user">
                            Usuario
                          </label>
                          <input
                            id="header-user"
                            type="text"
                            autoComplete="username"
                            value={loginUser}
                            onChange={(e) => setLoginUser(e.target.value)}
                            className="w-full min-h-[44px] mt-1.5 liquid-glass-input rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/35"
                            placeholder="Tu nombre de usuario"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/75 font-medium" htmlFor="header-pass">
                            Contraseña
                          </label>
                          <div className="relative mt-1.5">
                            <input
                              id="header-pass"
                              type={showLoginPass ? 'text' : 'password'}
                              autoComplete="current-password"
                              value={loginPass}
                              onChange={(e) => setLoginPass(e.target.value)}
                              className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-4 pr-11 py-2.5 text-white text-sm placeholder-white/35"
                              placeholder="Tu contraseña"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPass((v) => !v)}
                              aria-label={showLoginPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <PasswordEyeIcon open={showLoginPass} />
                            </button>
                          </div>
                        </div>

                        {loginError && (
                          <div className="border border-rose-400/40 bg-rose-500/12 rounded-xl px-4 py-2.5 text-rose-200 text-xs font-medium flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-semibold py-3 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                        >
                          {loading && <OrbitalSpinner size="xs" />}
                          <span>{loading ? 'Conectando...' : 'Entrar a mi cuenta'}</span>
                        </button>
                      </form>
                    )}

                    {tab === 'register' && (
                      <div className="space-y-3.5">
                        {regSuccess ? (
                          <div className="text-center py-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.08] p-6 space-y-2">
                            <p className="text-emerald-300 font-semibold text-base">
                              Registro completado
                            </p>
                            <p className="text-white/70 text-xs leading-relaxed max-w-sm mx-auto">
                              Tu cuenta quedó en estado pendiente. Un administrador deberá aprobar
                              tu solicitud antes de que puedas iniciar sesión.
                            </p>
                          </div>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void handleRegister();
                            }}
                            className="space-y-3.5"
                          >
                            <div className="grid sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="text-xs text-white/75 font-medium" htmlFor="reg-name">
                                  Nombre completo
                                </label>
                                <input
                                  id="reg-name"
                                  type="text"
                                  autoComplete="name"
                                  value={regName}
                                  onChange={(e) => setRegName(e.target.value)}
                                  className="w-full min-h-[44px] mt-1 liquid-glass-input rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/35"
                                  placeholder="Tu nombre completo"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-white/75 font-medium" htmlFor="reg-email">
                                  Correo electrónico
                                </label>
                                <input
                                  id="reg-email"
                                  type="email"
                                  autoComplete="email"
                                  value={regEmail}
                                  onChange={(e) => setRegEmail(e.target.value)}
                                  className="w-full min-h-[44px] mt-1 liquid-glass-input rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/35"
                                  placeholder="correo@dominio.com"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs text-white/75 font-medium" htmlFor="reg-user">
                                Usuario
                              </label>
                              <input
                                id="reg-user"
                                type="text"
                                autoComplete="username"
                                value={regUser}
                                onChange={(e) => setRegUser(e.target.value)}
                                className="w-full min-h-[44px] mt-1 liquid-glass-input rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/35"
                                placeholder="Nombre de usuario"
                              />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="text-xs text-white/75 font-medium" htmlFor="reg-pass">
                                  Contraseña
                                </label>
                                <div className="relative mt-1">
                                  <input
                                    id="reg-pass"
                                    type={showRegPass ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={regPass}
                                    onChange={(e) => setRegPass(e.target.value)}
                                    className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-3.5 pr-10 py-2.5 text-white text-sm placeholder-white/35"
                                    placeholder="Mínimo 6 caracteres"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowRegPass((v) => !v)}
                                    aria-label={showRegPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                  >
                                    <PasswordEyeIcon open={showRegPass} />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-white/75 font-medium" htmlFor="reg-pass-confirm">
                                  Confirmar contraseña
                                </label>
                                <div className="relative mt-1">
                                  <input
                                    id="reg-pass-confirm"
                                    type={showRegConfirmPass ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={regPassConfirm}
                                    onChange={(e) => setRegPassConfirm(e.target.value)}
                                    className="w-full min-h-[44px] liquid-glass-input rounded-xl pl-3.5 pr-10 py-2.5 text-white text-sm placeholder-white/35"
                                    placeholder="Repite tu contraseña"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowRegConfirmPass((v) => !v)}
                                    aria-label={showRegConfirmPass ? 'Ocultar confirmación' : 'Ver confirmación'}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                  >
                                    <PasswordEyeIcon open={showRegConfirmPass} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {regError && (
                              <div className="border border-rose-400/40 bg-rose-500/12 rounded-xl px-4 py-2.5 text-rose-200 text-xs font-medium flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                                <span>{regError}</span>
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-semibold py-3 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {loading && <OrbitalSpinner size="xs" />}
                              <span>{loading ? 'Creando cuenta...' : 'Registrar cuenta'}</span>
                            </button>

                            <p className="text-[11px] text-white/50 text-center">
                              Después de registrarte, un administrador aprobará tu cuenta.
                            </p>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    <LiquidGlassToast toast={authToast} onClose={() => setAuthToast(null)} />
    </>
  );
}
