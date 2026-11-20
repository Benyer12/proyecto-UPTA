'use client';

import React from 'react';

interface PlanetVisualProps {
  name: string;
  className?: string;
}

export default function PlanetVisual({ name, className = '' }: PlanetVisualProps) {
  if (name.includes('Numérix')) {
    return (
      <div className={`relative w-48 h-48 flex items-center justify-center select-none ${className}`}>
        {/* Resplandor atmosférico profundo */}
        <div
          className="absolute w-36 h-36 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,245,255,0.32) 0%, rgba(0,102,255,0.12) 55%, transparent 75%)',
            filter: 'blur(18px)',
          }}
        />

        {/* Arco trasero del sistema de anillos astrolabio */}
        <svg className="absolute w-60 h-40 -rotate-[16deg] pointer-events-none z-0 overflow-visible" viewBox="0 0 260 140">
          <defs>
            <linearGradient id="numRingBack" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="numRingGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#00f5ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Mitad superior (trasera) de los anillos */}
          <path
            d="M 16,70 A 114,34 0 0,1 244,70"
            fill="none"
            stroke="url(#numRingBack)"
            strokeWidth="7"
            opacity="0.45"
          />
          <path
            d="M 26,70 A 104,29 0 0,1 234,70"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.2"
            strokeDasharray="6 4 2 4"
            opacity="0.65"
          />
          <path
            d="M 38,70 A 92,24 0 0,1 222,70"
            fill="none"
            stroke="url(#numRingGold)"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>

        {/* Esfera Planetaria Numérix (Mundo cibernético-cristalino con océanos de datos y red geodésica) */}
        <div
          className="relative w-32 h-32 rounded-full z-10 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 30% 26%, #e0f2fe 0%, #38bdf8 18%, #0284c7 46%, #0f172a 78%, #020617 100%)',
            boxShadow:
              'inset -16px -16px 28px rgba(2, 6, 23, 0.96), inset 6px 6px 16px rgba(186, 230, 253, 0.65), 0 0 28px rgba(0, 245, 255, 0.35), 0 0 2px 1px rgba(125, 211, 252, 0.45)',
          }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128" fill="none">
            <defs>
              <radialGradient id="numCoreGlow" cx="38%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#0369a1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="numBand" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.05" />
                <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <circle cx="64" cy="64" r="64" fill="url(#numCoreGlow)" />

            {/* Bandas oceánicas y corrientes cuánticas */}
            <path
              d="M -10,42 C 22,34 54,48 88,38 C 108,32 122,38 138,35 L 138,52 C 112,56 84,46 50,54 C 24,60 4,50 -10,54 Z"
              fill="url(#numBand)"
            />
            <path
              d="M -10,76 C 24,68 58,82 94,72 C 114,67 126,73 138,70 L 138,86 C 110,90 78,80 44,88 C 18,94 2,84 -10,88 Z"
              fill="url(#numBand)"
            />

            {/* Paralelos y meridianos esféricos de precisión */}
            <ellipse cx="64" cy="64" rx="60" ry="20" stroke="#7dd3fc" strokeOpacity="0.28" strokeWidth="0.9" strokeDasharray="3 3" />
            <ellipse cx="64" cy="64" rx="60" ry="42" stroke="#7dd3fc" strokeOpacity="0.22" strokeWidth="0.8" />
            <ellipse cx="64" cy="64" rx="22" ry="60" stroke="#7dd3fc" strokeOpacity="0.24" strokeWidth="0.8" strokeDasharray="4 3" />
            <ellipse cx="64" cy="64" rx="44" ry="60" stroke="#38bdf8" strokeOpacity="0.18" strokeWidth="0.8" />

            {/* Continentes cristalinos / placas fractales */}
            <path
              d="M 26,38 L 42,26 L 62,32 L 56,50 L 36,52 Z"
              fill="rgba(14, 165, 233, 0.28)"
              stroke="#7dd3fc"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
            <path
              d="M 42,26 L 56,50 M 26,38 L 62,32"
              stroke="#bae6fd"
              strokeWidth="0.6"
              strokeOpacity="0.45"
            />

            <path
              d="M 70,54 L 92,46 L 104,62 L 90,80 L 72,74 Z"
              fill="rgba(2, 132, 199, 0.32)"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeOpacity="0.75"
            />
            <path
              d="M 70,54 L 104,62 M 92,46 L 72,74"
              stroke="#bae6fd"
              strokeWidth="0.6"
              strokeOpacity="0.4"
            />

            <path
              d="M 32,76 L 50,70 L 62,86 L 46,98 L 30,90 Z"
              fill="rgba(56, 189, 248, 0.24)"
              stroke="#7dd3fc"
              strokeWidth="0.9"
              strokeOpacity="0.6"
            />

            {/* Nodos de constelación luminosos sobre la corteza (luces de ciudades fractales) */}
            <circle cx="42" cy="26" r="1.8" fill="#ffffff" />
            <circle cx="56" cy="50" r="1.6" fill="#00f5ff" />
            <circle cx="92" cy="46" r="1.8" fill="#fef08a" />
            <circle cx="72" cy="74" r="1.5" fill="#00f5ff" />
            <circle cx="50" cy="70" r="1.5" fill="#ffffff" />
            <circle cx="90" cy="80" r="1.4" fill="#7dd3fc" />

            {/* Casquete polar ártico luminoso */}
            <ellipse cx="56" cy="10" rx="22" ry="5" fill="rgba(224, 242, 254, 0.45)" />
          </svg>

          {/* Sombra volumétrica esférica (terminador día/noche realista) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 28% 24%, rgba(255,255,255,0.35) 0%, transparent 32%), radial-gradient(circle at 78% 78%, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.55) 42%, transparent 70%)',
            }}
          />
          {/* Atmósfera Fresnel en el borde */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset 2px 3px 8px rgba(224, 242, 254, 0.75), inset -6px -8px 16px rgba(0, 245, 255, 0.22)',
            }}
          />
        </div>

        {/* Arco frontal del anillo astrolabio con satélites */}
        <svg className="absolute w-60 h-40 -rotate-[16deg] pointer-events-none z-20 overflow-visible" viewBox="0 0 260 140">
          <defs>
            <linearGradient id="numRingFront" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#00f5ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
            </linearGradient>
            <filter id="numGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sombra proyectada por el anillo frontal */}
          <path
            d="M 16,70 A 114,34 0 0,0 244,70"
            fill="none"
            stroke="rgba(0, 245, 255, 0.22)"
            strokeWidth="9"
          />

          {/* Anillo principal segmentado */}
          <path
            d="M 16,70 A 114,34 0 0,0 244,70"
            fill="none"
            stroke="url(#numRingFront)"
            strokeWidth="3.2"
            filter="url(#numGlow)"
          />

          {/* Anillo interior calibrado */}
          <path
            d="M 26,70 A 104,29 0 0,0 234,70"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="1.3"
            strokeDasharray="16 5 4 5"
            opacity="0.9"
          />
          <path
            d="M 38,70 A 92,24 0 0,0 222,70"
            fill="none"
            stroke="#fef08a"
            strokeWidth="0.9"
            strokeDasharray="3 8"
            opacity="0.7"
          />

          {/* Satélite poliédrico izquierdo */}
          <g transform="translate(46, 91)" filter="url(#numGlow)">
            <circle cx="0" cy="0" r="6.5" fill="#04132c" stroke="#00f5ff" strokeWidth="1.5" />
            <polygon points="0,-3.5 3.5,0 0,3.5 -3.5,0" fill="#e0f2fe" />
          </g>

          {/* Satélite derecho con núcleo dorado */}
          <g transform="translate(206, 93)" filter="url(#numGlow)">
            <circle cx="0" cy="0" r="5.5" fill="#04132c" stroke="#7dd3fc" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="2.2" fill="#fef08a" />
          </g>
        </svg>
      </div>
    );
  }

  if (name.includes('Letralia')) {
    return (
      <div className={`relative w-48 h-48 flex items-center justify-center select-none ${className}`}>
        {/* Nebulosa púrpura/magenta/dorada envolvente */}
        <div
          className="absolute w-36 h-36 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(217,70,239,0.34) 0%, rgba(147,51,234,0.14) 55%, transparent 75%)',
            filter: 'blur(18px)',
          }}
        />

        {/* Anillo trasero de polvo estelar y runas */}
        <svg className="absolute w-60 h-40 rotate-[14deg] pointer-events-none z-0 overflow-visible" viewBox="0 0 260 140">
          <defs>
            <linearGradient id="letRingBack" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#9333ea" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <path
            d="M 18,70 A 112,32 0 0,1 242,70"
            fill="none"
            stroke="url(#letRingBack)"
            strokeWidth="6"
            opacity="0.45"
          />
          <path
            d="M 30,70 A 100,26 0 0,1 230,70"
            fill="none"
            stroke="#f5d0fe"
            strokeWidth="1.1"
            strokeDasharray="4 5"
            opacity="0.55"
          />
        </svg>

        {/* Esfera Planetaria Letralia (Gigante gaseoso imperial con bandas fluidas, tormenta anticiclónica y destellos dorados) */}
        <div
          className="relative w-32 h-32 rounded-full z-10 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 32% 24%, #fae8ff 0%, #e879f9 20%, #a855f7 46%, #4c1d95 76%, #1e0538 100%)',
            boxShadow:
              'inset -16px -16px 28px rgba(18, 2, 36, 0.96), inset 6px 6px 16px rgba(250, 232, 255, 0.65), 0 0 28px rgba(217, 70, 239, 0.38), 0 0 2px 1px rgba(240, 171, 252, 0.45)',
          }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128" fill="none">
            <defs>
              <linearGradient id="letBand1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fdf4ff" stopOpacity="0.15" />
                <stop offset="45%" stopColor="#f5d0fe" stopOpacity="0.55" />
                <stop offset="80%" stopColor="#fbbf24" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="letBand2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#581c87" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3b0764" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="letBand3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d946ef" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#fde047" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Bandas atmosféricas de gigante gaseoso (estilo Júpiter/Saturno en tonos amatista, rosa y oro) */}
            <path
              d="M -8,22 C 24,16 56,28 92,20 C 110,16 124,20 136,18 L 136,30 C 112,34 80,24 46,32 C 20,37 4,28 -8,32 Z"
              fill="url(#letBand1)"
            />
            <path
              d="M -8,38 C 28,32 62,46 96,36 C 114,32 126,38 136,35 L 136,50 C 110,56 76,44 42,52 C 18,58 2,48 -8,52 Z"
              fill="url(#letBand2)"
            />
            <path
              d="M -8,56 C 22,50 58,64 94,54 C 112,49 124,55 136,52 L 136,68 C 108,74 74,62 40,70 C 16,75 2,66 -8,70 Z"
              fill="url(#letBand1)"
            />
            <path
              d="M -8,76 C 30,70 64,82 98,74 C 116,70 126,75 136,72 L 136,86 C 112,92 80,80 46,88 C 22,93 4,85 -8,88 Z"
              fill="url(#letBand3)"
            />
            <path
              d="M -8,94 C 26,88 60,98 96,92 C 114,88 124,93 136,90 L 136,104 C 110,108 78,98 44,105 C 20,109 4,102 -8,105 Z"
              fill="url(#letBand2)"
            />

            {/* Gran Ojo de la Sabiduría (Tormenta anticiclónica luminosa con remolino dorado) */}
            <g transform="translate(80, 68) rotate(-8)">
              <ellipse cx="0" cy="0" rx="16" ry="9.5" fill="#2e1065" stroke="#f0abfc" strokeWidth="1.1" strokeOpacity="0.8" />
              <ellipse cx="0" cy="0" rx="11" ry="6" fill="none" stroke="#fde047" strokeWidth="0.9" strokeDasharray="6 3" opacity="0.85" />
              <ellipse cx="0" cy="0" rx="5.5" ry="3" fill="#fdf4ff" opacity="0.9" />
            </g>

            {/* Vórtice menor en hemisferio norte */}
            <g transform="translate(42, 42) rotate(6)">
              <ellipse cx="0" cy="0" rx="9" ry="5" fill="#4c1d95" stroke="#f5d0fe" strokeWidth="0.8" opacity="0.85" />
              <circle cx="0" cy="0" r="2" fill="#fde047" opacity="0.9" />
            </g>

            {/* Constelación caligráfica sutil grabada en la alta atmósfera */}
            <path
              d="M 28,30 Q 48,22 66,34 T 102,30"
              stroke="#fef08a"
              strokeWidth="0.7"
              strokeDasharray="2 3"
              opacity="0.6"
            />
            <circle cx="28" cy="30" r="1.4" fill="#fef08a" />
            <circle cx="66" cy="34" r="1.6" fill="#ffffff" />
            <circle cx="102" cy="30" r="1.3" fill="#fef08a" />
          </svg>

          {/* Terminador volumétrico y brillo atmosférico */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.4) 0%, transparent 34%), radial-gradient(circle at 78% 78%, rgba(15,2,28,0.92) 0%, rgba(15,2,28,0.5) 44%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset 2px 3px 8px rgba(250, 232, 255, 0.78), inset -6px -8px 16px rgba(217, 70, 239, 0.25)',
            }}
          />
        </div>

        {/* Arco frontal del anillo de Letralia con lunas y destellos dorados */}
        <svg className="absolute w-60 h-40 rotate-[14deg] pointer-events-none z-20 overflow-visible" viewBox="0 0 260 140">
          <defs>
            <linearGradient id="letRingFront" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#fae8ff" stopOpacity="0.95" />
              <stop offset="68%" stopColor="#fbbf24" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
            <filter id="letGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M 18,70 A 112,32 0 0,0 242,70"
            fill="none"
            stroke="rgba(217, 70, 239, 0.22)"
            strokeWidth="8"
          />
          <path
            d="M 18,70 A 112,32 0 0,0 242,70"
            fill="none"
            stroke="url(#letRingFront)"
            strokeWidth="3"
            filter="url(#letGlow)"
          />
          <path
            d="M 30,70 A 100,26 0 0,0 230,70"
            fill="none"
            stroke="#fde047"
            strokeWidth="1.1"
            strokeDasharray="10 6 2 6"
            opacity="0.85"
          />

          {/* Luna cristalina izquierda */}
          <g transform="translate(52, 91)" filter="url(#letGlow)">
            <circle cx="0" cy="0" r="5.5" fill="#1e0538" stroke="#f0abfc" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="2.2" fill="#fae8ff" />
          </g>

          {/* Estrella/Cometa dorado en el anillo derecho */}
          <g transform="translate(198, 92)" filter="url(#letGlow)">
            <circle cx="0" cy="0" r="6" fill="#1e0538" stroke="#fde047" strokeWidth="1.4" />
            <path d="M 0,-3.5 L 1,-1 L 3.5,0 L 1,1 L 0,3.5 L -1,1 L -3.5,0 L -1,-1 Z" fill="#fef08a" />
          </g>
        </svg>
      </div>
    );
  }

  if (name.includes('Naturae')) {
    return (
      <div className={`relative w-48 h-48 flex items-center justify-center select-none ${className}`}>
        {/* Atmósfera bioluminiscente esmeralda/turquesa */}
        <div
          className="absolute w-36 h-36 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.34) 0%, rgba(6,182,212,0.14) 55%, transparent 75%)',
            filter: 'blur(18px)',
          }}
        />

        {/* Arco trasero del anillo orbital de esporas y aurora */}
        <svg className="absolute w-60 h-40 -rotate-[20deg] pointer-events-none z-0 overflow-visible" viewBox="0 0 260 140">
          <defs>
            <linearGradient id="natRingBack" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <path
            d="M 22,70 A 108,30 0 0,1 238,70"
            fill="none"
            stroke="url(#natRingBack)"
            strokeWidth="5"
            opacity="0.45"
          />
          <path
            d="M 34,70 A 96,24 0 0,1 226,70"
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="1"
            strokeDasharray="5 5"
            opacity="0.55"
          />
        </svg>

        {/* Esfera Planetaria Naturae (Exoplaneta oceánico vivo con continentes esmeralda, ríos bioluminiscentes y nubes en espiral) */}
        <div
          className="relative w-32 h-32 rounded-full z-10 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, #ccfbf1 0%, #2dd4bf 20%, #0d9488 46%, #064e3b 76%, #022c22 100%)',
            boxShadow:
              'inset -16px -16px 28px rgba(1, 20, 14, 0.96), inset 6px 6px 16px rgba(204, 251, 241, 0.65), 0 0 28px rgba(0, 255, 136, 0.35), 0 0 2px 1px rgba(110, 231, 183, 0.45)',
          }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128" fill="none">
            <defs>
              <linearGradient id="natLand1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="35%" stopColor="#10b981" />
                <stop offset="80%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id="natLand2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="45%" stopColor="#059669" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
            </defs>

            {/* Casquete polar norte helado */}
            <path
              d="M 28,8 C 46,2 82,2 100,10 C 86,16 44,16 28,8 Z"
              fill="#ecfdf5"
              opacity="0.7"
            />

            {/* Gran Continente Boreal con relieve natural (no manchas negras) */}
            <path
              d="M 16,36 C 22,24 38,20 52,24 C 64,27 72,20 82,26 C 90,32 88,44 78,50 C 68,56 62,50 52,54 C 40,58 32,64 22,58 C 12,52 10,44 16,36 Z"
              fill="url(#natLand1)"
              stroke="#6ee7b7"
              strokeWidth="0.8"
              strokeOpacity="0.65"
            />
            {/* Ríos bioluminiscentes y cordillera interior */}
            <path
              d="M 26,38 C 38,35 48,42 62,38 C 70,35 76,38 82,36"
              stroke="#ccfbf1"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M 48,40 C 52,46 46,50 42,54"
              stroke="#99f6e4"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Archipiélago Ecuatorial */}
            <path
              d="M 88,54 C 96,50 108,54 112,62 C 114,70 104,76 94,72 C 86,68 82,58 88,54 Z"
              fill="url(#natLand2)"
              stroke="#6ee7b7"
              strokeWidth="0.7"
              strokeOpacity="0.6"
            />
            <circle cx="76" cy="64" r="3.5" fill="url(#natLand1)" />

            {/* Continente Austral Esmeralda */}
            <path
              d="M 30,78 C 42,70 58,72 70,78 C 82,84 88,96 78,106 C 66,114 44,112 32,102 C 22,94 20,84 30,78 Z"
              fill="url(#natLand2)"
              stroke="#6ee7b7"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            <path
              d="M 38,86 C 50,84 62,90 74,94"
              stroke="#a7f3d0"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Nodos de bosque bioluminiscente */}
            <circle cx="44" cy="34" r="1.5" fill="#fef08a" opacity="0.9" />
            <circle cx="66" cy="34" r="1.3" fill="#ffffff" opacity="0.9" />
            <circle cx="56" cy="86" r="1.5" fill="#fef08a" opacity="0.85" />
            <circle cx="98" cy="62" r="1.3" fill="#ffffff" opacity="0.85" />

            {/* Sistemas de nubes blancas atmosféricas en espiral (dan realismo inmediato de planeta vivo) */}
            <path
              d="M 10,48 C 30,42 56,50 84,44 C 98,40 110,44 120,42"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.42"
              filter="blur(1px)"
            />
            <path
              d="M 22,68 C 46,62 72,72 104,64"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.38"
              filter="blur(0.8px)"
            />
            <path
              d="M 18,92 C 42,88 68,96 96,90"
              stroke="#ecfdf5"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.32"
              filter="blur(1px)"
            />
          </svg>

          {/* Sombra esférica día/noche y atmósfera turquesa/esmeralda */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.38) 0%, transparent 34%), radial-gradient(circle at 78% 78%, rgba(1,18,12,0.92) 0%, rgba(1,18,12,0.5) 44%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset 2px 3px 8px rgba(204, 251, 241, 0.8), inset -6px -8px 16px rgba(0, 255, 136, 0.24)',
            }}
          />
        </div>

        {/* Arco frontal del anillo de Naturae + Luna oceánica */}
        <svg className="absolute w-60 h-40 -rotate-[20deg] pointer-events-none z-20 overflow-visible" viewBox="0 0 260 140">
          <defs>
            <linearGradient id="natRingFront" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#ccfbf1" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#34d399" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.8" />
            </linearGradient>
            <filter id="natGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M 22,70 A 108,30 0 0,0 238,70"
            fill="none"
            stroke="rgba(0, 255, 136, 0.2)"
            strokeWidth="7.5"
          />
          <path
            d="M 22,70 A 108,30 0 0,0 238,70"
            fill="none"
            stroke="url(#natRingFront)"
            strokeWidth="2.8"
            filter="url(#natGlow)"
          />
          <path
            d="M 34,70 A 96,24 0 0,0 226,70"
            fill="none"
            stroke="#fef08a"
            strokeWidth="1"
            strokeDasharray="8 6 2 6"
            opacity="0.75"
          />

          {/* Satélite natural / Luna verde con cráter luminoso */}
          <g transform="translate(202, 89)" filter="url(#natGlow)">
            <circle cx="0" cy="0" r="6" fill="#022c22" stroke="#6ee7b7" strokeWidth="1.5" />
            <circle cx="-1.2" cy="-1.2" r="2.2" fill="#ccfbf1" />
          </g>

          {/* Cápsula de vida / Semilla estelar izquierda */}
          <g transform="translate(54, 89)" filter="url(#natGlow)">
            <circle cx="0" cy="0" r="4.8" fill="#022c22" stroke="#2dd4bf" strokeWidth="1.3" />
            <circle cx="0" cy="0" r="1.8" fill="#fef08a" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-44 h-44 flex items-center justify-center ${className}`}>
      <div
        className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 30% 28%, #e2e8f0 0%, #64748b 28%, #0f172a 100%)',
          boxShadow:
            'inset -15px -15px 28px rgba(0,0,0,0.8), inset 12px 12px 22px rgba(255,255,255,0.4), 0 0 45px rgba(255,255,255,0.2)',
        }}
      />
    </div>
  );
}
