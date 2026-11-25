'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPlanetById, MOCK_PROGRESS } from '../../../lib/mock-data';
import { obtenerProgresoEstudianteHibrido } from '../../../lib/offline-sync';
import { useAuthStore } from '../../../lib/auth-store';
import type { Level, StudentProgress } from '../../../shared/types';
import { useThemeStore } from '../../../lib/theme-store';
import { OrbitalLevelSelector } from '../../components/planet-orbital-selector/OrbitalLevelSelector';

function IconArrowLeft({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M19 12H5M12 19L5 12L12 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MissingPortalIllustration() {
  return (
    <svg
      viewBox="0 0 200 130"
      fill="none"
      className="w-44 h-28 mx-auto"
      role="img"
      aria-label="Ilustración de órbita planetaria vacía"
    >
      <ellipse
        cx="100"
        cy="68"
        rx="74"
        ry="24"
        stroke="#67E8F9"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <circle
        cx="100"
        cy="68"
        r="28"
        fill="#0B1226"
        stroke="#67E8F9"
        strokeOpacity="0.45"
        strokeWidth="1.6"
      />
      <path
        d="M90 58L110 78M110 58L90 78"
        stroke="#94A3B8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="38" cy="54" r="3.5" fill="#67E8F9" fillOpacity="0.7" />
      <circle cx="164" cy="78" r="2.5" fill="#D8B4FE" fillOpacity="0.75" />
      <circle cx="144" cy="30" r="2" fill="#FDE68A" fillOpacity="0.7" />
    </svg>
  );
}

export default function PlanetaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appTheme = useThemeStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);
  const [progressMap, setProgressMap] = useState<Record<number, StudentProgress>>(MOCK_PROGRESS);
  const isDark = appTheme !== 'light';
  const planetId = parseInt(params.id, 10);
  const planet = useMemo(() => getPlanetById(planetId), [planetId]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void obtenerProgresoEstudianteHibrido(String(user.id)).then((res) => {
      if (!cancelled) {
        setProgressMap(res.progressMap);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!planet) {
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center px-6">
        <div className="relative z-10 text-center liquid-glass liquid-glass-panel rounded-3xl p-8 max-w-md w-full space-y-5">
          <MissingPortalIllustration />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">
              Portal no encontrado
            </h1>
            <p className="text-[#CBD5E1] text-sm leading-relaxed">
              Este planeta no existe en las cartas estelares disponibles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 liquid-glass-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#F8FAFC] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67E8F9]"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Volver al mapa estelar</span>
          </button>
        </div>
      </div>
    );
  }

  const courses = [...planet.courses].sort((a, b) => a.order - b.order);

  const handleLaunchLevel = (level: Level) => {
    router.push(`/juego/${planet.id}/${level.id}`);
  };

  const handleBackToMap = () => {
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center py-4 sm:py-6">
      <OrbitalLevelSelector
        planet={planet}
        courses={courses}
        progressMap={progressMap}
        isDark={isDark}
        onLaunchLevel={handleLaunchLevel}
        onBackToMap={handleBackToMap}
      />
    </div>
  );
}
