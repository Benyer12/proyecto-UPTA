'use client';

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  WHITEBOARD_COLORS,
  WHITEBOARD_ERASER_MULTIPLIER,
  WHITEBOARD_MAX_HISTORY,
  WHITEBOARD_STROKE_SIZES,
  type WhiteboardStrokeSizeKey,
} from '../config/whiteboard-config';

export type WhiteboardTool = 'pen' | 'eraser';

export interface WhiteboardPoint {
  x: number;
  y: number;
}

export interface WhiteboardStroke {
  points: WhiteboardPoint[];
  color: string;
  width: number;
  tool: WhiteboardTool;
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: WhiteboardStroke) {
  if (stroke.points.length === 0) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
  }

  ctx.lineWidth = stroke.width;

  if (stroke.points.length === 1) {
    const pt = stroke.points[0];
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, stroke.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

  for (let i = 1; i < stroke.points.length - 1; i++) {
    const curr = stroke.points[i];
    const next = stroke.points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
  }

  const last = stroke.points[stroke.points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

export function useWhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<WhiteboardTool>('pen');
  const [color, setColor] = useState<string>(WHITEBOARD_COLORS[0].hex);
  const [strokeSize, setStrokeSize] = useState<WhiteboardStrokeSizeKey>('md');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);

  const strokesRef = useRef<WhiteboardStroke[]>([]);
  const activeStrokeRef = useRef<WhiteboardStroke | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const renderAll = useCallback((list: WhiteboardStroke[], inProgress: WhiteboardStroke | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    for (let i = 0; i < list.length; i++) {
      drawStroke(ctx, list[i]);
    }
    if (inProgress) {
      drawStroke(ctx, inProgress);
    }
    ctx.restore();
  }, []);

  useEffect(() => {
    strokesRef.current = strokes;
    renderAll(strokes, activeStrokeRef.current);
  }, [strokes, renderAll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      renderAll(strokesRef.current, activeStrokeRef.current);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [renderAll]);

  const getRelativePoint = useCallback((e: ReactPointerEvent<HTMLCanvasElement>): WhiteboardPoint => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const commitActiveStroke = useCallback(() => {
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;
    activePointerIdRef.current = null;
    if (!finished || finished.points.length === 0) return;

    setStrokes((prev) => [...prev, finished].slice(-WHITEBOARD_MAX_HISTORY));
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}

      const baseWidth = WHITEBOARD_STROKE_SIZES[strokeSize];
      const width = tool === 'eraser' ? baseWidth * WHITEBOARD_ERASER_MULTIPLIER : baseWidth;

      const stroke: WhiteboardStroke = {
        points: [getRelativePoint(e)],
        color,
        width,
        tool,
      };
      activePointerIdRef.current = e.pointerId;
      activeStrokeRef.current = stroke;
      renderAll(strokesRef.current, stroke);
    },
    [color, getRelativePoint, renderAll, strokeSize, tool],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== e.pointerId || !activeStrokeRef.current) return;
      const nextPt = getRelativePoint(e);
      const pts = activeStrokeRef.current.points;
      const prevPt = pts[pts.length - 1];
      if (prevPt && Math.hypot(nextPt.x - prevPt.x, nextPt.y - prevPt.y) < 0.75) {
        return;
      }
      pts.push(nextPt);
      renderAll(strokesRef.current, activeStrokeRef.current);
    },
    [getRelativePoint, renderAll],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {}
      commitActiveStroke();
    },
    [commitActiveStroke],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      commitActiveStroke();
    },
    [commitActiveStroke],
  );

  const undo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    activeStrokeRef.current = null;
    activePointerIdRef.current = null;
    setStrokes([]);
  }, []);

  const pointerHandlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    }),
    [onPointerDown, onPointerMove, onPointerUp, onPointerCancel],
  );

  return {
    canvasRef,
    tool,
    setTool,
    color,
    setColor,
    strokeSize,
    setStrokeSize,
    showGrid,
    setShowGrid,
    canUndo: strokes.length > 0,
    hasStrokes: strokes.length > 0,
    undo,
    clear,
    pointerHandlers,
  };
}
