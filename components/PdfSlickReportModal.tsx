'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { usePDFSlick } from '@pdfslick/react';
import '@pdfslick/react/dist/pdf_viewer.css';
import { OrbitalSpinner } from './ui/PanelSkeletons';
import GlassTooltip from './ui/GlassTooltip';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface PdfSlickReportModalProps {
  pdfBuffer: ArrayBuffer;
  blobUrl: string;
  filename: string;
  title: string;
  mode?: 'inline' | 'modal';
  onExpand?: () => void;
  onClose?: () => void;
}

export default function PdfSlickReportModal({
  pdfBuffer,
  blobUrl,
  filename,
  title,
  mode = 'modal',
  onExpand,
  onClose,
}: PdfSlickReportModalProps) {
  if (typeof window !== 'undefined') {
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const [showThumbs, setShowThumbs] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isDocumentLoaded,
    viewerRef,
    thumbsRef,
    usePDFSlickStore,
    PDFSlickViewer,
    PDFSlickThumbnails,
    error,
  } = usePDFSlick(pdfBuffer, {
    scaleValue: 'page-width',
    singlePageViewer: false,
    filename,
  });

  const pdfSlick = usePDFSlickStore((s) => s.pdfSlick);
  const pageNumber = usePDFSlickStore((s) => s.pageNumber);
  const numPages = usePDFSlickStore((s) => s.numPages);
  const scale = usePDFSlickStore((s) => s.scale);
  const scaleValue = usePDFSlickStore((s) => s.scaleValue);
  const pagesRotation = usePDFSlickStore((s) => s.pagesRotation);

  useEffect(() => {
    if (mode !== 'modal' || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewerCard = (
    <div
      className={
        mode === 'modal'
          ? 'relative flex flex-col w-full max-w-6xl h-[90vh] rounded-3xl border border-white/20 bg-[#07111e]/95 shadow-[0_28px_90px_-15px_rgba(0,0,0,0.85)] overflow-hidden'
          : 'relative flex flex-col w-full h-[640px] rounded-2xl border border-[#67E8F9]/25 bg-[#07111e]/95 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75)] overflow-hidden'
      }
    >
      {/* Barra superior de vista previa PDFSlick */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/12 bg-white/[0.04] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#67E8F9]/35 bg-[#67E8F9]/15 text-[#67E8F9] text-xs font-black shrink-0">
            PDF
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            <p className="font-mono text-[10px] text-white/55 truncate">
              Vista Previa Interactiva PDFSlick · {filename}
            </p>
          </div>
        </div>

        {/* Controles de navegación, zoom y descarga desde la vista previa */}
        <div className="flex flex-wrap items-center gap-1.5">
          <GlassTooltip label="Mostrar u ocultar miniaturas de páginas" placement="bottom">
            <button
              type="button"
              onClick={() => setShowThumbs((v) => !v)}
              className={`min-h-[34px] px-3 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                showThumbs
                  ? 'border-[#67E8F9]/50 bg-[#67E8F9]/20 text-[#67E8F9]'
                  : 'border-white/15 bg-white/[0.05] text-white/75 hover:bg-white/10'
              }`}
            >
              Miniaturas
            </button>
          </GlassTooltip>

          <div className="flex items-center rounded-full border border-white/15 bg-white/[0.04] p-0.5">
            <button
              type="button"
              disabled={!isDocumentLoaded || pageNumber <= 1}
              onClick={() => pdfSlick?.gotoPage(Math.max(1, pageNumber - 1))}
              aria-label="Página anterior"
              className="h-7 w-7 rounded-full text-xs font-bold text-white/85 hover:bg-white/15 disabled:opacity-35 cursor-pointer"
            >
              ‹
            </button>
            <span className="px-2.5 font-mono text-[11px] text-white/90 select-none">
              {numPages > 0 ? `${pageNumber} / ${numPages}` : '1 / 1'}
            </span>
            <button
              type="button"
              disabled={!isDocumentLoaded || pageNumber >= numPages}
              onClick={() => pdfSlick?.gotoPage(Math.min(numPages, pageNumber + 1))}
              aria-label="Página siguiente"
              className="h-7 w-7 rounded-full text-xs font-bold text-white/85 hover:bg-white/15 disabled:opacity-35 cursor-pointer"
            >
              ›
            </button>
          </div>

          <div className="flex items-center rounded-full border border-white/15 bg-white/[0.04] p-0.5">
            <button
              type="button"
              disabled={!isDocumentLoaded}
              onClick={() => pdfSlick?.decreaseScale()}
              aria-label="Alejar zoom"
              className="h-7 w-7 rounded-full text-xs font-bold text-white/85 hover:bg-white/15 disabled:opacity-35 cursor-pointer"
            >
              −
            </button>
            <span className="px-2 font-mono text-[11px] text-white/90 min-w-[46px] text-center select-none">
              {Math.round((scale || 1) * 100)}%
            </span>
            <button
              type="button"
              disabled={!isDocumentLoaded}
              onClick={() => pdfSlick?.increaseScale()}
              aria-label="Acercar zoom"
              className="h-7 w-7 rounded-full text-xs font-bold text-white/85 hover:bg-white/15 disabled:opacity-35 cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={!isDocumentLoaded}
            onClick={() => {
              if (!pdfSlick) return;
              pdfSlick.currentScaleValue =
                scaleValue === 'page-fit' ? 'page-width' : 'page-fit';
            }}
            className="min-h-[34px] px-3 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-white/85 disabled:opacity-40 cursor-pointer"
          >
            {scaleValue === 'page-fit' ? 'Ajustar ancho' : 'Página completa'}
          </button>

          <GlassTooltip label="Rotar 90 grados" placement="bottom">
            <button
              type="button"
              disabled={!isDocumentLoaded}
              onClick={() => pdfSlick?.setRotation((pagesRotation + 90) % 360)}
              className="min-h-[34px] px-3 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-white/85 disabled:opacity-40 cursor-pointer"
            >
              Rotar
            </button>
          </GlassTooltip>

          <button
            type="button"
            disabled={!isDocumentLoaded}
            onClick={() => pdfSlick?.triggerPrinting()}
            className="min-h-[34px] px-3.5 rounded-full border border-[#67E8F9]/40 bg-[#041724]/80 hover:bg-[#041724] text-xs font-semibold text-[#67E8F9] disabled:opacity-40 cursor-pointer"
          >
            Imprimir
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="min-h-[34px] px-4 rounded-full bg-white text-black hover:bg-white/90 text-xs font-bold transition-colors cursor-pointer"
          >
            Descargar .PDF
          </button>

          {mode === 'inline' && onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="min-h-[34px] px-3.5 rounded-full border border-[#D8B4FE]/40 bg-[#D8B4FE]/15 hover:bg-[#D8B4FE]/25 text-xs font-semibold text-[#E9D5FF] cursor-pointer"
            >
              Pantalla completa
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar visor PDF"
              className="min-h-[34px] px-3 rounded-full border border-rose-400/35 bg-rose-500/15 hover:bg-rose-500/25 text-xs font-bold text-rose-200 cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </header>

      {/* Cuerpo del visor PDFSlick */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden bg-[#0c1624]">
        {/* Panel lateral de miniaturas */}
        {showThumbs && (
          <aside className="hidden md:flex flex-col w-44 shrink-0 border-r border-white/10 bg-[#07101c]">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/50 px-3 pt-2.5 pb-1.5 shrink-0">
              Páginas ({numPages || 1})
            </div>
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <PDFSlickThumbnails
                thumbsRef={thumbsRef}
                usePDFSlickStore={usePDFSlickStore}
                className="p-2.5 space-y-2.5 overflow-y-auto"
              >
                {({ pageNumber: thumbPage, src, loaded }) => (
                  <button
                    key={thumbPage}
                    type="button"
                    onClick={() => pdfSlick?.gotoPage(thumbPage)}
                    className={`w-full rounded-xl p-1.5 border transition-all cursor-pointer text-left mb-2 ${
                      pageNumber === thumbPage
                        ? 'border-[#67E8F9] bg-[#67E8F9]/15 shadow-[0_0_16px_-4px_rgba(103,232,249,0.45)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                    }`}
                  >
                    <div className="aspect-[210/297] w-full rounded-lg overflow-hidden bg-white flex items-center justify-center">
                      {loaded && src ? (
                        <img
                          src={src}
                          alt={`Miniatura página ${thumbPage}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="font-mono text-[10px] text-slate-400">
                          {thumbPage}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-center font-mono text-[10px] text-white/75">
                      Pág. {thumbPage}
                    </div>
                  </button>
                )}
              </PDFSlickThumbnails>
            </div>
          </aside>
        )}

        {/* Área principal PDFSlickViewer */}
        <div className="relative flex-1 min-h-0 overflow-hidden pdfSlick">
          <PDFSlickViewer
            viewerRef={viewerRef}
            usePDFSlickStore={usePDFSlickStore}
            className="w-full h-full"
          />

          {!isDocumentLoaded && !error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07111e]/85 backdrop-blur-sm">
              <OrbitalSpinner
                size="lg"
                preset="pdf"
                label="Renderizando vista previa PDFSlick..."
              />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-20 flex flex-col bg-[#07111e]">
              <iframe
                src={blobUrl}
                title={title}
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (mode === 'inline') {
    return viewerCard;
  }

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Visor PDF: ${title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {viewerCard}
    </div>,
    document.body,
  );
}
