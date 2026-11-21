'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef } from 'react';

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

const FACE_ROTATIONS: Record<number, { rotateX: number; rotateY: number }> = {
  1: { rotateX: -14, rotateY: 18 },
  2: { rotateX: -14, rotateY: -72 },
  3: { rotateX: -104, rotateY: 18 },
  4: { rotateX: 76, rotateY: 18 },
  5: { rotateX: -14, rotateY: 108 },
  6: { rotateX: 14, rotateY: 198 },
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
  const pips = DICE_PIP_LAYOUTS[num];
  const pipSize = num === 1 ? size * 0.2 : size * 0.155;
  const isLavender =
    themed &&
    (color.toLowerCase().startsWith('#e') ||
      color.toLowerCase().startsWith('#f') ||
      color.toLowerCase().startsWith('#d'));

  return (
    <div
      className="absolute flex items-center justify-center select-none overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: isLavender
          ? `radial-gradient(circle at 30% 25%, #ffffff 0%, ${color} 68%, ${borderColor ?? color}88 100%)`
          : `linear-gradient(145deg, rgba(45, 62, 128, 0.94) 0%, ${color} 52%, rgba(8, 13, 32, 0.96) 100%)`,
        border: `1.8px solid ${borderColor ?? '#BFDBFE'}`,
        boxShadow: isLavender
          ? `inset 0 0 ${size * 0.16}px ${borderColor ?? color}55`
          : `inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -4px 10px rgba(3, 6, 20, 0.8), 0 0 16px rgba(147, 197, 253, 0.22)`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {!isLavender && (
        <div
          className="absolute pointer-events-none"
          style={{
            inset: size * 0.08,
            borderRadius: size * 0.15,
            border: '1px solid rgba(191, 219, 254, 0.22)',
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
  const controls = useAnimationControls();
  const cumulativeSpinRef = useRef({ x: 0, y: 0 });
  const isRollingRef = useRef(false);
  const onRollCompleteRef = useRef(onRollComplete);
  onRollCompleteRef.current = onRollComplete;

  const half = size / 2;
  const themed = Boolean(faceColor);

  useEffect(() => {
    if (rolling && !isRollingRef.current) {
      isRollingRef.current = true;
      const target = FACE_ROTATIONS[result] || FACE_ROTATIONS[1];
      // Acumulamos giros completos de 360° hacia adelante para que nunca retroceda ni haga saltos/zooms cortados
      cumulativeSpinRef.current = {
        x: cumulativeSpinRef.current.x + 360 * 3,
        y: cumulativeSpinRef.current.y + 360 * 3,
      };

      controls
        .start({
          rotateX: target.rotateX + cumulativeSpinRef.current.x,
          rotateY: target.rotateY + cumulativeSpinRef.current.y,
          transition: {
            duration: 1.05,
            ease: [0.22, 1, 0.36, 1],
          },
        })
        .then(() => {
          isRollingRef.current = false;
          onRollCompleteRef.current?.();
        });
    } else if (!rolling && !isRollingRef.current) {
      const target = FACE_ROTATIONS[result] || FACE_ROTATIONS[1];
      controls.set({
        rotateX: target.rotateX + cumulativeSpinRef.current.x,
        rotateY: target.rotateY + cumulativeSpinRef.current.y,
      });
    }
  }, [rolling, result, controls]);

  const faceTransforms: Record<number, string> = {
    1: `translateZ(${half}px)`,
    2: `rotateY(90deg) translateZ(${half}px)`,
    3: `rotateX(90deg) translateZ(${half}px)`,
    4: `rotateX(-90deg) translateZ(${half}px)`,
    5: `rotateY(-90deg) translateZ(${half}px)`,
    6: `rotateY(180deg) translateZ(${half}px)`,
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ perspective: size * 6, width: size, height: size }}
    >
      <motion.div
        initial={{
          rotateX: FACE_ROTATIONS[1].rotateX,
          rotateY: FACE_ROTATIONS[1].rotateY,
        }}
        animate={controls}
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div
            key={num}
            style={{
              width: size,
              height: size,
              transform: faceTransforms[num],
              position: 'absolute',
            }}
          >
            <DiceFace
              num={num}
              size={size}
              color={faceColor ?? FACE_COLORS[num]}
              borderColor={borderColor}
              pipColor={pipColor}
              themed={themed}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
