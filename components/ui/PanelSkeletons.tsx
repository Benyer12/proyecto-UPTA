'use client';

import type { CSSProperties } from 'react';
import { LiquidGlass } from './glasscn/liquid-glass';
import LottieAnimation from './LottieAnimation';
import type { LottiePresetName } from '../../lib/lottie-presets';

export function OrbitalSpinner({
  size = 'md',
  label,
  preset = 'orbit',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
  preset?: LottiePresetName;
  className?: string;
}) {
  const pxSize =
    size === 'xs'
      ? 18
      : size === 'sm'
        ? 22
        : size === 'lg'
          ? 56
          : 34;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} role="status" aria-live="polite">
      <LottieAnimation preset={preset} size={pxSize} />
      {label && <span className="text-xs sm:text-sm font-medium text-white/80">{label}</span>}
    </span>
  );
}

export function SkeletonBar({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div aria-hidden="true" className={`skeleton-box rounded-xl ${className}`} style={style} />;
}

export function UserListSkeleton({
  rows = 5,
  showProgress = false,
  actionButtons = 2,
}: {
  rows?: number;
  showProgress?: boolean;
  actionButtons?: number;
}) {
  return (
    <div className="divide-y divide-white/[0.07]" role="status" aria-label="Cargando registros">
      <div className="flex items-center gap-2.5 px-5 sm:px-6 py-3 bg-white/[0.02]">
        <OrbitalSpinner size="sm" label="Sincronizando datos..." />
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-4"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <SkeletonBar className="w-11 h-11 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-sm">
              <div className="flex items-center gap-2">
                <SkeletonBar className="h-4 w-36 rounded-lg" />
                <SkeletonBar className="h-4 w-16 rounded-full" />
              </div>
              <SkeletonBar className="h-3 w-48 rounded-lg" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {showProgress && (
              <div className="hidden md:flex items-center gap-3 mr-2">
                <SkeletonBar className="h-2.5 w-28 rounded-full" />
                <SkeletonBar className="h-4 w-10 rounded-lg" />
              </div>
            )}
            {Array.from({ length: actionButtons }).map((__, bIdx) => (
              <SkeletonBar key={bIdx} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AssignmentsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" role="status" aria-label="Cargando asignaciones">
      <div className="lg:col-span-4">
        <LiquidGlass blur={5} refraction={8} bezel={0.2} className="rounded-2xl bg-white/[0.03] border-white/[0.10]">
          <div className="px-5 py-4 border-b border-white/[0.08]">
            <SkeletonBar className="h-4 w-32 rounded-lg" />
          </div>
          <div className="p-3 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.06]">
                <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonBar className="h-3.5 w-28 rounded-lg" />
                  <SkeletonBar className="h-3 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </LiquidGlass>
      </div>

      <div className="lg:col-span-8">
        <LiquidGlass blur={5} refraction={8} bezel={0.2} className="rounded-2xl bg-white/[0.03] border-white/[0.10]">
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <SkeletonBar className="h-4 w-44 rounded-lg" />
            <SkeletonBar className="h-4 w-24 rounded-lg" />
          </div>
          <UserListSkeleton rows={4} actionButtons={1} />
        </LiquidGlass>
      </div>
    </div>
  );
}

export function TutorIASkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando Copiloto IA">
      <LiquidGlass blur={6} refraction={10} bezel={0.25} className="rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBar className="h-5 w-52 rounded-lg" />
            <SkeletonBar className="h-3.5 w-72 rounded-lg" />
          </div>
          <div className="flex gap-2.5">
            <SkeletonBar className="h-10 w-36 rounded-full" />
            <SkeletonBar className="h-10 w-32 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonBar className="h-3.5 w-28 rounded-lg" />
                  <SkeletonBar className="h-3 w-16 rounded-lg" />
                </div>
              </div>
              <SkeletonBar className="h-2.5 w-full rounded-full" />
              <SkeletonBar className="h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </LiquidGlass>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12 space-y-8" role="status" aria-label="Cargando panel espacial">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <SkeletonBar className="w-14 h-14 rounded-full shrink-0" />
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-32 rounded-full" />
            <SkeletonBar className="h-7 w-56 rounded-xl" />
          </div>
        </div>
        <SkeletonBar className="h-12 w-36 rounded-2xl" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <LiquidGlass key={i} blur={5} refraction={8} bezel={0.2} className="rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonBar className="h-5 w-28 rounded-lg" />
              <SkeletonBar className="h-6 w-16 rounded-full" />
            </div>
            <SkeletonBar className="h-36 w-full rounded-2xl" />
            <SkeletonBar className="h-10 w-full rounded-full" />
          </LiquidGlass>
        ))}
      </div>
    </div>
  );
}

export function AdminPanelSkeleton({ label = 'Cargando panel...' }: { label?: string }) {
  return (
    <div
      className="relative min-h-screen px-5 sm:px-8 lg:px-12 py-8 sm:py-12"
      role="status"
      aria-label={label}
    >
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-7 border-b border-white/10">
          <div className="space-y-3">
            <SkeletonBar className="h-7 w-48 rounded-full" />
            <SkeletonBar className="h-9 w-64 rounded-xl" />
            <SkeletonBar className="h-4 w-80 max-w-full rounded-lg" />
          </div>
          <SkeletonBar className="h-14 w-64 rounded-2xl" />
        </div>

        <LiquidGlass
          blur={5}
          refraction={8}
          bezel={0.2}
          saturation={1.12}
          className="rounded-2xl bg-white/[0.03] border-white/[0.10]"
        >
          <UserListSkeleton rows={5} actionButtons={1} />
        </LiquidGlass>
      </div>
    </div>
  );
}
