'use client';

import {
  WHITEBOARD_COLORS,
  WHITEBOARD_GRID_COLOR,
  WHITEBOARD_GRID_SPACING,
  WHITEBOARD_LABELS,
} from '../../../lib/config/whiteboard-config';
import { useWhiteboardCanvas } from '../../../lib/hooks/useWhiteboardCanvas';
import { useModalEscape } from '../../../lib/hooks/useModalEscape';
import { playStep } from '../../../lib/sound-engine';

interface PizarraHolograficaProps {
  onClose: () => void;
  preguntaResumen?: string;
  asModalWindow?: boolean;
  className?: string;
}

function PenIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        d="M12.6 2.8L15.2 5.4L6.3 14.3L3 15L3.7 11.7L12.6 2.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        d="M9.6 3.5L14.5 8.4L8.4 14.5H4.4L2.8 12.9L9.6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7.5 14.5H15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
      <rect x="2.8" y="2.8" width="12.4" height="12.4" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.8 7H15.2M2.8 11H15.2M7 2.8V15.2M11 2.8V15.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        d="M6.2 4.5L3 7.7L6.2 10.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 7.7H10.5C12.9 7.7 14.8 9.4 14.8 11.6C14.8 13.3 13.5 14.5 11.6 14.5H8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        d="M3.5 5H14.5M6.8 5V3.4C6.8 2.9 7.2 2.5 7.7 2.5H10.3C10.8 2.5 11.2 2.9 11.2 3.4V5M5.2 5L5.8 14.3C5.85 14.9 6.35 15.4 6.95 15.4H11.05C11.65 15.4 12.15 14.9 12.2 14.3L12.8 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PizarraHolografica({
  onClose,
  preguntaResumen,
  asModalWindow = true,
  className = '',
}: PizarraHolograficaProps) {
  const {
    canvasRef,
    tool,
    setTool,
    color,
    setColor,
    showGrid,
    setShowGrid,
    canUndo,
    hasStrokes,
    undo,
    clear,
    pointerHandlers,
  } = useWhiteboardCanvas();

  useModalEscape({
    isOpen: true,
    onEscape: onClose,
    priority: 'secondary',
  });

  const handleClear = () => {
    clear();
    playStep();
  };

  const panel = (
    <section
      aria-label={WHITEBOARD_LABELS.title}
      onClick={(e) => e.stopPropagation()}
      className={`flex flex-col rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-cyan-400/35 shadow-[0_24px_70px_rgba(2,6,23,0.85),0_0_38px_rgba(34,211,238,0.18)] overflow-hidden ${
        asModalWindow ? 'w-full max-w-[760px] h-[min(84vh,600px)]' : ''
      } ${className}`}
    >
      {/* Barra superior compacta de herramientas */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-cyan-400/20 bg-slate-900/75">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] shrink-0"
          />
          <h3 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-100 truncate">
            {WHITEBOARD_LABELS.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={WHITEBOARD_LABELS.closeButton}
          title={WHITEBOARD_LABELS.closeButton}
          data-keep-compact="true"
          className="min-h-[36px] px-3 rounded-xl border border-cyan-300/35 bg-slate-900/80 hover:bg-slate-800 text-slate-100 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <span aria-hidden="true">✕</span>
          <span>Cerrar</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-950/70 border border-cyan-300/30 text-[10px] font-mono text-cyan-100 leading-none">
            ESC
          </kbd>
        </button>
      </div>

      {preguntaResumen && (
        <div className="px-4 py-2 border-b border-cyan-400/15 bg-slate-900/45 text-xs sm:text-sm font-semibold text-cyan-50 leading-snug">
          <span className="text-cyan-300 font-extrabold uppercase tracking-wider text-[11px] mr-2">
            Reto:
          </span>
          <span>{preguntaResumen}</span>
        </div>
      )}

      {/* Controles de trazo, colores y acciones */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-cyan-400/15 bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTool('pen')}
            aria-label={WHITEBOARD_LABELS.penTool}
            aria-pressed={tool === 'pen'}
            title={WHITEBOARD_LABELS.penTool}
            className={`min-h-[34px] px-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              tool === 'pen'
                ? 'bg-cyan-400/25 border-cyan-300 text-cyan-100'
                : 'bg-slate-900/65 border-white/15 text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <PenIcon />
            <span>{WHITEBOARD_LABELS.penTool}</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            aria-label={WHITEBOARD_LABELS.eraserTool}
            aria-pressed={tool === 'eraser'}
            title={WHITEBOARD_LABELS.eraserTool}
            className={`min-h-[34px] px-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              tool === 'eraser'
                ? 'bg-amber-400/25 border-amber-300 text-amber-100'
                : 'bg-slate-900/65 border-white/15 text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <EraserIcon />
            <span>{WHITEBOARD_LABELS.eraserTool}</span>
          </button>

          <div
            role="group"
            aria-label={WHITEBOARD_LABELS.colorPrefix}
            className="flex items-center gap-1.5 pl-1"
          >
            {WHITEBOARD_COLORS.map((c) => {
              const selected = tool === 'pen' && color === c.hex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setColor(c.hex);
                    setTool('pen');
                  }}
                  aria-label={`${WHITEBOARD_LABELS.colorPrefix}: ${c.name}`}
                  aria-pressed={selected}
                  title={c.name}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-transform cursor-pointer ${
                    selected
                      ? 'scale-110 border-white ring-2 ring-cyan-300/70'
                      : 'border-white/30 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: c.hex,
                    boxShadow: selected ? `0 0 12px ${c.hex}` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
            aria-label={WHITEBOARD_LABELS.gridToggle}
            aria-pressed={showGrid}
            title={WHITEBOARD_LABELS.gridToggle}
            className={`min-h-[34px] px-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
              showGrid
                ? 'bg-cyan-500/20 border-cyan-300/60 text-cyan-100'
                : 'bg-slate-900/65 border-white/15 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <GridIcon />
            <span className="hidden sm:inline">{WHITEBOARD_LABELS.gridToggle}</span>
          </button>

          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label={WHITEBOARD_LABELS.undo}
            title={WHITEBOARD_LABELS.undo}
            className="min-h-[34px] px-2.5 rounded-xl border border-white/15 bg-slate-900/65 hover:bg-slate-800/80 disabled:opacity-40 disabled:cursor-not-allowed text-slate-100 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <UndoIcon />
            <span className="hidden sm:inline">{WHITEBOARD_LABELS.undo}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!canUndo}
            aria-label={WHITEBOARD_LABELS.clear}
            title={WHITEBOARD_LABELS.clear}
            className="min-h-[34px] px-2.5 rounded-xl border border-rose-300/30 bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-rose-100 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <TrashIcon />
            <span className="hidden sm:inline">{WHITEBOARD_LABELS.clear}</span>
          </button>
        </div>
      </div>

      {/* Área de dibujo HTML5 Canvas 2D con cuadrícula matemática opcional */}
      <div className="relative flex-1 min-h-[240px] sm:min-h-[300px] md:min-h-[360px] w-full bg-[#03091B]/80">
        {showGrid && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${WHITEBOARD_GRID_COLOR} 1px, transparent 1px), linear-gradient(to bottom, ${WHITEBOARD_GRID_COLOR} 1px, transparent 1px)`,
              backgroundSize: `${WHITEBOARD_GRID_SPACING}px ${WHITEBOARD_GRID_SPACING}px`,
            }}
          />
        )}

        {!hasStrokes && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-center">
            <p className="text-xs sm:text-sm font-medium text-cyan-100/65 select-none">
              {WHITEBOARD_LABELS.emptyHint}
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          role="img"
          aria-label={WHITEBOARD_LABELS.canvasAriaLabel}
          className={`relative z-10 w-full h-full block touch-none ${
            tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'
          }`}
          {...pointerHandlers}
        />
      </div>
    </section>
  );

  if (!asModalWindow) {
    return panel;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={WHITEBOARD_LABELS.title}
      onClick={onClose}
      className="fixed inset-0 z-[135] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md"
    >
      {panel}
    </div>
  );
}
