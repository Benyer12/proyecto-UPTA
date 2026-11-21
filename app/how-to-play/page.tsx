'use client';

import Link from 'next/link';
import { LiquidGlass } from '../../components/ui/glasscn/liquid-glass';
import { useThemeStore } from '../../lib/theme-store';

const STEPS = [
  { step: '01', title: 'Elige planeta', desc: 'Numérix, Letralia o Naturae.' },
  { step: '02', title: 'Lanza el dado', desc: 'Avanza y supera cada reto.' },
  { step: '03', title: 'Vence al Guardián', desc: 'Completa el nivel y gana estrellas.' },
];

const RULES = [
  { title: 'Combustible diario', desc: 'Se recarga cada 24 horas para sesiones equilibradas.' },
  { title: 'Dado 3D y casillas', desc: 'Avanza por la ruta orbital y activa eventos especiales.' },
  { title: 'Cero castigos', desc: 'Si fallas, recibes pistas y vuelves a intentarlo sin perder tu progreso.' },
  { title: 'Guardián final', desc: 'Desafío de cierre en tres fases con estrellas extra.' },
];

const ROLES = [
  { title: 'Estudiante', desc: 'Juega tableros, supera misiones y colecciona estrellas.' },
  { title: 'Tutor / Maestro', desc: 'Supervisa el avance y estrellas de sus estudiantes.' },
  { title: 'Administrador', desc: 'Aprueba cuentas, asigna roles y vincula grupos.' },
];

function BoardFlowDiagram({ isLight }: { isLight: boolean }) {
  const strokeMain = isLight ? '#0284C7' : '#67E8F9';
  const strokePurple = isLight ? '#7E22CE' : '#D8B4FE';
  const strokeGreen = isLight ? '#047857' : '#6EE7B7';
  const nodeFill1 = isLight ? '#E0F2FE' : '#0B132B';
  const nodeFill2 = isLight ? '#F3E8FF' : '#171235';
  const nodeFill3 = isLight ? '#D1FAE5' : '#07221D';
  const labelColor = isLight ? '#1E293B' : '#CBD5E1';

  return (
    <svg
      viewBox="0 0 320 190"
      fill="none"
      className="w-full h-auto max-w-[310px] mx-auto select-none"
      role="img"
      aria-label="Ciclo de misión: dado, retos y guardián final"
    >
      <path
        d="M42 136 C85 136 100 62 160 62 C220 62 235 126 278 126"
        stroke={strokeMain}
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeDasharray="6 6"
      />
      <g transform="translate(42 136)">
        <rect x="-18" y="-18" width="36" height="36" rx="9" fill={nodeFill1} stroke={strokeMain} strokeWidth="1.6" />
        <circle cx="-6" cy="-6" r="2.2" fill={strokeMain} />
        <circle cx="0" cy="0" r="2.2" fill={isLight ? '#0F172A' : '#F8FAFC'} />
        <circle cx="6" cy="6" r="2.2" fill={strokeMain} />
        <text x="0" y="34" textAnchor="middle" fill={labelColor} fontSize="10" fontWeight="700">
          DADO
        </text>
      </g>
      <g transform="translate(160 62)">
        <polygon points="0,-22 20,-10 20,10 0,22 -20,10 -20,-10" fill={nodeFill2} stroke={strokePurple} strokeWidth="1.6" />
        <path d="M-5 1L-1 5L6 -4" stroke={strokePurple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="0" y="-30" textAnchor="middle" fill={strokePurple} fontSize="10" fontWeight="700">
          RETOS
        </text>
      </g>
      <g transform="translate(278 126)">
        <circle r="20" fill={nodeFill3} stroke={strokeGreen} strokeWidth="1.6" />
        <ellipse rx="27" ry="9" transform="rotate(-24)" stroke={strokeGreen} strokeOpacity="0.65" strokeWidth="1.2" />
        <circle r="6" fill={strokeGreen} />
        <text x="0" y="36" textAnchor="middle" fill={strokeGreen} fontSize="10" fontWeight="700">
          GUARDIÁN
        </text>
      </g>
    </svg>
  );
}

export default function HowToPlayPage() {
  const appTheme = useThemeStore((s) => s.theme);
  const isLight = appTheme === 'light';

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12 pb-20 space-y-8">
        {/* 1. CABECERA VISUAL CON DIAGRAMA */}
        <LiquidGlass
          blur={2}
          refraction={22}
          bezel={0.36}
          saturation={1.65}
          className="rounded-3xl bg-[#050a18]/[0.36] border-white/[0.15] p-6 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),inset_0_-14px_26px_-12px_rgba(180,220,255,0.16)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="inline-flex items-center rounded-full border border-[#67E8F9]/35 bg-white/[0.05] px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#67E8F9]">
                Guía rápida
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight cosmic-title leading-tight">
                Cómo jugar
              </h1>
              <p className="text-base text-white/75 max-w-md">
                Lanza el dado, resuelve retos y vence al Guardián.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-3">
                <BoardFlowDiagram isLight={isLight} />
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* 2. FLUJO EN 3 PASOS VISUALES */}
        <ol className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <li key={s.step}>
              <LiquidGlass
                blur={2}
                refraction={20}
                bezel={0.36}
                saturation={1.62}
                className="mwg-scroll-reveal h-full rounded-2xl bg-[#050a18]/[0.36] border-white/[0.15] p-5 flex items-start gap-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)]"
              >
                <span className="w-9 h-9 rounded-lg bg-[#0B132B] border border-cyan-400/45 flex items-center justify-center text-[#67E8F9] text-xs font-black shrink-0 tabular-nums">
                  {s.step}
                </span>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-extrabold text-white">{s.title}</h2>
                  <p className="text-xs text-white/70">{s.desc}</p>
                </div>
              </LiquidGlass>
            </li>
          ))}
        </ol>

        {/* 3. REGLAS Y ROLES EN DIVULGACIÓN PROGRESIVA (<details>) */}
        <div className="mwg-defer-section grid md:grid-cols-2 gap-6">
          <section aria-labelledby="rules-heading" className="space-y-3">
            <h2 id="rules-heading" className="text-lg font-black text-white tracking-tight px-1">
              Reglas del tablero
            </h2>
            <LiquidGlass
              blur={2}
              refraction={20}
              bezel={0.34}
              saturation={1.62}
              className="rounded-3xl bg-[#050a18]/[0.36] border-white/[0.15] divide-y divide-white/10"
            >
              {RULES.map((rule) => (
                <details key={rule.title} className="mwg-details px-5 py-3.5">
                  <summary className="text-sm font-bold text-white">
                    {rule.title}
                  </summary>
                  <p className="pt-2 pl-6 text-xs sm:text-sm text-white/75">{rule.desc}</p>
                </details>
              ))}
            </LiquidGlass>
          </section>

          <section aria-labelledby="roles-heading" className="space-y-3">
            <h2 id="roles-heading" className="text-lg font-black text-white tracking-tight px-1">
              Roles en la plataforma
            </h2>
            <LiquidGlass
              blur={2}
              refraction={20}
              bezel={0.34}
              saturation={1.62}
              className="rounded-3xl bg-[#050a18]/[0.36] border-white/[0.15] divide-y divide-white/10"
            >
              {ROLES.map((role) => (
                <details key={role.title} className="mwg-details px-5 py-3.5">
                  <summary className="text-sm font-bold text-white">
                    {role.title}
                  </summary>
                  <p className="pt-2 pl-6 text-xs sm:text-sm text-white/75">{role.desc}</p>
                </details>
              ))}
            </LiquidGlass>
          </section>
        </div>

        {/* 4. ACCIÓN FINAL */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="min-h-[46px] inline-flex items-center justify-center rounded-full bg-white text-black hover:bg-white/90 px-7 text-sm font-bold transition-colors"
          >
            Entrar a jugar
          </Link>
          <LiquidGlass
            blur={2}
            refraction={18}
            bezel={0.4}
            saturation={1.65}
            className="inline-flex rounded-full bg-white/[0.045] border-white/[0.16]"
          >
            <Link
              href="/"
              className="glance min-h-[46px] inline-flex items-center justify-center rounded-full px-6 text-sm font-semibold text-white hover:bg-white/[0.06] transition-colors"
            >
              Volver al inicio
            </Link>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}
