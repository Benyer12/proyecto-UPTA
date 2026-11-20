'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../lib/auth-store';
import type { LoginData, RegisterData } from '../shared/types';

export default function Header() {
  const router = useRouter();
  const { user, token, login, register, logout, getRedirect } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
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
      router.push(getRedirect() as any);
    } else {
      setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  const handleRegister = async () => { 
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
      }, 2500);
    } else {
      setRegError('Error al crear la cuenta. Intenta con otro usuario.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 liquid-glass-header">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-white no-underline group">
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌌</span>
          <span className="font-extrabold text-lg tracking-wide hidden sm:inline bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            Universo del Conocimiento
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/about" className="text-sm font-semibold tracking-wide text-slate-200 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Acerca de
            </Link>
            <Link href="/how-to-play" className="text-sm font-semibold tracking-wide text-slate-200 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Cómo jugar
            </Link>
          </nav>

          {token && user ? (
            <nav className="flex items-center gap-5 ml-4 pl-5 border-l border-white/15">
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-semibold tracking-wide text-cyan-300 hover:text-cyan-200 transition-colors px-3 py-1.5 rounded-lg liquid-glass-pill">
                  Panel Admin
                </Link>
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

          {/* Botón menú móvil */}
          <button
            className="sm:hidden text-white p-2 liquid-glass-pill rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden border-t border-white/10 liquid-glass overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-3">
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-cyan-300 px-3 py-2 rounded-lg hover:bg-white/5">
                Acerca de
              </Link>
              <Link href="/how-to-play" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-cyan-300 px-3 py-2 rounded-lg hover:bg-white/5">
                Cómo jugar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={formRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/15 liquid-glass"
          >
            <div className="max-w-md mx-auto px-6 py-8">
              <div className="flex mb-6 p-1 rounded-xl liquid-glass-pill">
                <button
                  onClick={() => { setTab('login'); resetRegForm(); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    tab === 'login'
                      ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => { setTab('register'); resetLoginForm(); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    tab === 'register'
                      ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Registrarse
                </button>
              </div>

              {tab === 'login' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold tracking-wide" htmlFor="header-user">Usuario</label>
                    <input
                      id="header-user"
                      type="text"
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500"
                      placeholder="Tu nombre de usuario"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold tracking-wide" htmlFor="header-pass">Contraseña</label>
                    <input
                      id="header-pass"
                      type="password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500"
                      placeholder="Tu contraseña"
                    />
                  </div>

                  {loginError && (
                    <p className="text-red-400 text-xs font-medium">{loginError}</p>
                  )}

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full liquid-glass-btn text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? 'Cargando...' : 'Entrar'}
                  </button>
                </div>
              )}

              {tab === 'register' && (
                <div className="space-y-4">
                  {regSuccess ? (
                    <div className="text-center py-8 liquid-glass rounded-2xl p-6">
                      <p className="text-emerald-400 font-bold text-sm">
                        ✅ Registro exitoso.
                      </p>
                      <p className="text-slate-300 text-xs mt-2">
                        Un administrador debe asignar tu rol para que puedas acceder.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-slate-300 font-semibold tracking-wide" htmlFor="reg-name">Nombre completo</label>
                        <input
                          id="reg-name"
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-semibold tracking-wide" htmlFor="reg-email">Correo electrónico</label>
                        <input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-semibold tracking-wide" htmlFor="reg-user">Usuario</label>
                        <input
                          id="reg-user"
                          type="text"
                          value={regUser}
                          onChange={(e) => setRegUser(e.target.value)}
                          className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500"
                          placeholder="Tu nombre de usuario"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-semibold tracking-wide" htmlFor="reg-pass">Contraseña</label>
                        <input
                          id="reg-pass"
                          type="password"
                          value={regPass}
                          onChange={(e) => setRegPass(e.target.value)}
                          className="w-full mt-1.5 liquid-glass-input rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>

                      {regError && (
                        <p className="text-red-400 text-xs font-medium">{regError}</p>
                      )}

                      <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full liquid-glass-btn text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {loading ? 'Cargando...' : 'Crear cuenta'}
                      </button>

                      <p className="text-xs text-slate-400 text-center">
                        Después de registrarte, un administrador debe aprobar tu cuenta.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
