'use client';

import { useEffect, useRef, useState } from 'react';

interface Dado3DProps {
  size?: number;
  rolling?: boolean;
  result?: number;
  onRollComplete?: () => void;
  faceColor?: string;
  borderColor?: string;
  pipColor?: string;
}

const FACE_COLORS: Record<number, string> = {
  1: '#1E2952',
  2: '#312E81',
  3: '#064E3B',
  4: '#4C1D95',
  5: '#1E3A8A',
  6: '#3B0764',
};

const DICE_PIP_LAYOUTS: Record<number, number[][]> = {
  1: [[0.5, 0.5]],
  2: [[0.27, 0.27], [0.73, 0.73]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
  5: [[0.26, 0.26], [0.74, 0.26], [0.5, 0.5], [0.26, 0.74], [0.74, 0.74]],
  6: [[0.27, 0.22], [0.73, 0.22], [0.27, 0.5], [0.73, 0.5], [0.27, 0.78], [0.73, 0.78]],
};

function DiceFace({
  num,
  size,
  color,
  borderColor,
  pipColor,
  themed,
}: {
  num: number;
  size: number;
  color: string;
  borderColor?: string;
  pipColor?: string;
  themed: boolean;
}) {
  const pips = DICE_PIP_LAYOUTS[num] || DICE_PIP_LAYOUTS[1];
  const pipSize = num === 1 ? size * 0.21 : size * 0.16;
  const isLavender =
    themed &&
    (color.toLowerCase().startsWith('#e') ||
      color.toLowerCase().startsWith('#f') ||
      color.toLowerCase().startsWith('#d'));

  return (
    <div
      className="relative flex items-center justify-center select-none overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: isLavender
          ? `radial-gradient(circle at 30% 25%, #ffffff 0%, ${color} 68%, ${borderColor ?? color}88 100%)`
          : `linear-gradient(145deg, rgba(45, 62, 128, 0.96) 0%, ${color} 52%, rgba(8, 13, 32, 0.98) 100%)`,
        border: `2px solid ${borderColor ?? '#BFDBFE'}`,
        boxShadow: isLavender
          ? `inset 0 0 ${size * 0.16}px ${borderColor ?? color}55, 0 8px 20px rgba(15,23,42,0.3)`
          : `inset 0 2px 3px rgba(255, 255, 255, 0.38), inset 0 -4px 10px rgba(3, 6, 20, 0.85), 0 8px 20px rgba(2, 6, 23, 0.55)`,
      }}
    >
      {!isLavender && (
        <div
          className="absolute pointer-events-none"
          style={{
            inset: size * 0.08,
            borderRadius: size * 0.15,
            border: '1px solid rgba(191, 219, 254, 0.24)',
            background:
              'radial-gradient(circle at 30% 22%, rgba(226, 238, 255, 0.14) 0%, transparent 60%)',
          }}
        />
      )}

      <div
        className="absolute -top-1/2 -left-1/2 w-full h-full rotate-45 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.16) 100%)',
        }}
      />

      <div className="relative" style={{ width: size * 0.78, height: size * 0.78 }}>
        {pips.map((pos, i) => {
          const isCenterOne = num === 1 && i === 0;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: pipSize,
                height: pipSize,
                left: `${pos[0] * 100}%`,
                top: `${pos[1] * 100}%`,
                transform: 'translate(-50%, -50%)',
                background: isLavender
                  ? `radial-gradient(circle at 35% 35%, ${pipColor ?? '#312E81'}cc 0%, ${pipColor ?? '#312E81'} 70%)`
                  : isCenterOne
                    ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #6EE7B7 55%, #10B981 100%)'
                    : `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${pipColor ?? '#E2EEFF'} 60%, #93C5FD 100%)`,
                boxShadow: isLavender
                  ? 'inset 0 1px 2px rgba(0,0,0,0.35)'
                  : isCenterOne
                    ? '0 0 10px rgba(110, 231, 183, 0.85), 0 0 4px #FFFFFF'
                    : '0 0 8px rgba(191, 219, 254, 0.75), inset 0 1px 1px #FFFFFF',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function Dado3D({
  size = 80,
  rolling = false,
  result = 1,
  onRollComplete,
  faceColor,
  borderColor,
  pipColor,
}: Dado3DProps) {
  const [displayFace, setDisplayFace] = useState(result || 1);
  const [angle, setAngle] = useState(0);
  const isRollingRef = useRef(false);
  const onRollCompleteRef = useRef(onRollComplete);
  onRollCompleteRef.current = onRollComplete;

  const themed = Boolean(faceColor);

  useEffect(() => {
    if (!rolling && !isRollingRef.current) {
      setDisplayFace(result || 1);
    }
  }, [result, rolling]);

  useEffect(() => {
    if (rolling && !isRollingRef.current) {
      isRollingRef.current = true;
      // Giro 2D plano sobre su eje central (rotateZ): tamaño 100% constante de principio a fin, CERO zoom
      setAngle((prev) => prev + 720);

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setDisplayFace(((step + result) % 6) + 1);
      }, 115);

      const timer = setTimeout(() => {
        clearInterval(interval);
        setDisplayFace(result || 1);
        isRollingRef.current = false;
        onRollCompleteRef.current?.();
      }, 920);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
        isRollingRef.current = false;
      };
    }
  }, [rolling, result]);

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          transform: `rotate(${angle}deg)`,
          transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <DiceFace
          num={displayFace}
          size={size}
          color={faceColor ?? FACE_COLORS[displayFace]}
          borderColor={borderColor}
          pipColor={pipColor}
          themed={themed}
        />
      </div>
    </div>
  );
}
