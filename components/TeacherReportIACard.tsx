'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import LiquidGlassSelect, { type LiquidGlassSelectOption } from './LiquidGlassSelect';
import RoleAvatar from './RoleAvatar';
import { OrbitalSpinner } from './ui/PanelSkeletons';
import {
  buildGroupReportPdf,
  buildIndividualReportPdf,
  type GeneratedPdfDocument,
  type ResumenPDFData,
} from '../lib/pdf-report-generator';
import { runViewTransition } from '../lib/view-transitions';
import type { ResumenIndividualEstudianteIA } from '../lib/ai-tutor';

const PdfSlickReportModal = dynamic(() => import('./PdfSlickReportModal'), {
  ssr: false,
});

export interface EstudianteParaReporte {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  role: string;
  nivelesCompletados: number;
  estrellasTotales: number;
  ultimaSesion: string | null;
}

export default function TeacherReportIACard({
  tutorName,
  students,
  totalNiveles,
}: {
  tutorName: string;
  students: EstudianteParaReporte[];
  totalNiveles: number;
}) {
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState<string | null>(null);
  const [filtroEstudiante, setFiltroEstudiante] = useState<string>('all');
  const [resumenPDF, setResumenPDF] = useState<ResumenPDFData | null>(null);
  const [inlinePdfDoc, setInlinePdfDoc] = useState<GeneratedPdfDocument | null>(null);
  const [modalPdfDoc, setModalPdfDoc] = useState<GeneratedPdfDocument | null>(null);
  const autoLoadedRef = useRef(false);

  // Actualiza automáticamente la vista previa PDFSlick cuando hay datos listos o cambia el filtro
  useEffect(() => {
    if (!resumenPDF) return;
    if (filtroEstudiante !== 'all') {
      const individual = resumenPDF.resumenesPorEstudiante.find(
        (e) => e.estudianteId === filtroEstudiante,
      );
      if (individual) {
        setInlinePdfDoc(buildIndividualReportPdf(individual, tutorName));
        return;
      }
    }
    setInlinePdfDoc(buildGroupReportPdf(resumenPDF));
  }, [resumenPDF, filtroEstudiante, tutorName]);

  const abrirEnPdfSlick = (doc: GeneratedPdfDocument) => {
    runViewTransition(() => {
      setInlinePdfDoc(doc);
      setModalPdfDoc(doc);
    }, 'edit');
  };

  const cerrarPdfSlick = () => {
    runViewTransition(() => {
      setModalPdfDoc(null);
    }, 'edit');
  };

  const opcionesSelector = useMemo<LiquidGlassSelectOption[]>(() => {
    const base: LiquidGlassSelectOption[] = [
      {
        value: 'all',
        label: 'Todos los estudiantes',
        sublabel: `${students.length} ${students.length === 1 ? 'asignado' : 'asignados'}`,
      },
    ];
    students.forEach((s) => {
      base.push({
        value: s.id,
        label: s.nombre,
        sublabel: `@${s.usuario} · ${s.estrellasTotales} ★`,
      });
    });
    return base;
  }, [students]);

  const resumenesFiltrados = useMemo(() => {
    const lista = resumenPDF?.resumenesPorEstudiante || [];
    if (filtroEstudiante === 'all') return lista;
    return lista.filter((est) => est.estudianteId === filtroEstudiante);
  }, [resumenPDF, filtroEstudiante]);

  const generarDiagnosticoConIA = async (): Promise<ResumenPDFData | null> => {
    setLoadingIA(true);
    setErrorIA(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);
    try {
      const res = await fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          action: 'reporte-profesor',
          tutorNombre: tutorName,
          totalNiveles,
          estudianteObjetivoId: filtroEstudiante,
          estudiantes: students,
        }),
      });
      const data = await res.json();
      if (data?.ok && data.resumenPDF) {
        setResumenPDF(data.resumenPDF);
        return data.resumenPDF as ResumenPDFData;
      }
      setErrorIA('No se pudo obtener el resumen en este momento. Intenta nuevamente.');
    } catch (e) {
      console.error('Error al consultar diagnóstico IA para profesor:', e);
      setErrorIA('La consulta tardó demasiado o falló la conexión. Vuelve a intentarlo.');
    } finally {
      clearTimeout(timer);
      setLoadingIA(false);
    }
    return null;
  };

  useEffect(() => {
    if (autoLoadedRef.current) return;
    autoLoadedRef.current = true;
    void generarDiagnosticoConIA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const descargarReportePDFIndividual = async (
    est: ResumenIndividualEstudianteIA,
  ) => {
    const pdfDoc = buildIndividualReportPdf(est, tutorName);
    abrirEnPdfSlick(pdfDoc);
  };

  const descargarReportePDF = async () => {
    const yaTieneSeleccion =
      resumenPDF &&
      (filtroEstudiante === 'all'
        ? resumenPDF.resumenesPorEstudiante.length >= students.length
        : resumenPDF.resumenesPorEstudiante.some((e) => e.estudianteId === filtroEstudiante));

    const datos = yaTieneSeleccion && resumenPDF ? resumenPDF : await generarDiagnosticoConIA();
    if (!datos) return;

    if (filtroEstudiante !== 'all') {
      const individual = datos.resumenesPorEstudiante.find(
        (e) => e.estudianteId === filtroEstudiante,
      );
      if (individual) {
        await descargarReportePDFIndividual(individual);
        return;
      }
    }

    const pdfDoc = buildGroupReportPdf(datos);
    abrirEnPdfSlick(pdfDoc);
  };
  return (
    <section aria-labelledby="ai-tutor-report-heading">
      <LiquidGlass
        blur={5}
        refraction={8}
        bezel={0.2}
        saturation={1.12}
        className="rounded-2xl bg-white/[0.03] border-white/[0.10] p-6 sm:p-7 space-y-5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.65)]"
        style={
          {
            '--liquid-glass-rim-uniform': 'rgba(255, 255, 255, 0.13)',
          } as CSSProperties
        }
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <RoleAvatar role="tutor" name="Asistente Google Gemini" size={46} />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#67E8F9]">
                Copiloto Docente · Google Gemini Cloud
              </div>
              <h2
                id="ai-tutor-report-heading"
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                Resumen por Estudiante y Reporte PDF
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <LiquidGlassSelect
              ariaLabel="Filtrar estudiante para resumen y reporte PDF"
              value={filtroEstudiante}
              onChange={setFiltroEstudiante}
              options={opcionesSelector}
            />

            <button
              type="button"
              onClick={generarDiagnosticoConIA}
              disabled={loadingIA}
              className="min-h-[40px] px-4 py-2 rounded-full border border-[#67E8F9]/40 bg-[#041724]/80 hover:bg-[#041724] text-xs font-semibold text-[#67E8F9] transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingIA
                ? 'Analizando...'
                : resumenPDF
                  ? 'Regenerar resumen IA'
                  : 'Resumen de cada estudiante'}
            </button>

            <button
              type="button"
              onClick={descargarReportePDF}
              disabled={loadingIA}
              className="min-h-[40px] px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {filtroEstudiante === 'all' ? 'Vista Previa PDF Grupal' : 'Vista Previa PDF Individual'}
            </button>
          </div>
        </div>

        {loadingIA && (
          <div className="rounded-2xl border border-[#67E8F9]/25 bg-[#041724]/60 px-5 py-4 flex items-center justify-center">
            <OrbitalSpinner
              size="md"
              preset="pdf"
              label="Generando diagnóstico IA y preparando vista previa PDFSlick..."
            />
          </div>
        )}

        {errorIA && (
          <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
            {errorIA}
          </div>
        )}

        {resumenPDF && (
          <div className="space-y-6">
            {filtroEstudiante === 'all' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Columna Izquierda: Diagnóstico Grupal con ancho de lectura cómodo y alto contraste */}
                <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-[#060E20]/82 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#6EE7B7]">
                        <span className="h-2 w-2 rounded-full bg-[#6EE7B7]" aria-hidden="true" />
                        Diagnóstico Grupal del Aula
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#67E8F9]/30 bg-[#67E8F9]/10 px-3 py-1 font-mono text-[11px] font-semibold text-[#67E8F9]">
                          {resumenPDF.totalPreguntasGeneradasIA} retos IA
                        </span>
                        <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 font-mono text-[11px] font-semibold text-amber-200">
                          Promedio: {resumenPDF.promedioEstrellas} ★
                        </span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-[15.5px] text-white/95 leading-[1.8] max-w-[64ch]">
                      {resumenPDF.diagnosticoIA}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">
                        Estudiantes
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                        {resumenPDF.totalEstudiantes}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">
                        Niveles Comp.
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-[#67E8F9] mt-0.5">
                        {resumenPDF.totalNivelesCompletados}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-white/55">
                        Estrellas Tot.
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-amber-300 mt-0.5">
                        {resumenPDF.totalEstrellas} ★
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Métodos recomendados en tarjetas numeradas fáciles de escanear */}
                {resumenPDF.recomendacionesClave?.length > 0 && (
                  <div className="lg:col-span-5 rounded-2xl border border-[#FDE68A]/25 bg-[#060E20]/82 p-5 sm:p-6 flex flex-col justify-between gap-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#FDE68A]">
                        <span className="h-2 w-2 rounded-full bg-[#FDE68A]" aria-hidden="true" />
                        Métodos Recomendados para el Grupo
                      </span>
                    </div>
                    <div className="space-y-2.5 flex-1 flex flex-col justify-center">
                      {resumenPDF.recomendacionesClave.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5"
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#FDE68A]/40 bg-[#FDE68A]/15 font-mono text-xs font-extrabold text-[#FDE68A] mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-[13px] sm:text-[13.5px] text-white/90 leading-[1.65]">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {resumenesFiltrados.length > 0 && (
              <div className="space-y-3">
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#67E8F9] px-1">
                  {filtroEstudiante === 'all'
                    ? `Resumen IA de cada estudiante (${resumenesFiltrados.length})`
                    : 'Resumen IA del estudiante seleccionado'}
                </div>
                <div
                  className={`grid grid-cols-1 ${
                    resumenesFiltrados.length > 1 ? 'lg:grid-cols-2' : ''
                  } gap-5`}
                >
                  {resumenesFiltrados.map((est) => (
                    <div
                      key={est.estudianteId}
                      className="rounded-2xl border border-white/15 bg-[#060E20]/82 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
                          <div className="flex items-center gap-3 min-w-0">
                            <RoleAvatar role="student" name={est.nombre} size={42} />
                            <div className="min-w-0">
                              <div className="text-base font-bold text-white truncate">
                                {est.nombre}
                              </div>
                              <div className="font-mono text-[11px] text-[#67E8F9] mt-0.5">
                                {est.etiquetaNivel} · {est.porcentajeAvance}% ({est.estrellasTotales} ★)
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => descargarReportePDFIndividual(est)}
                            className="min-h-[34px] px-3.5 py-1.5 rounded-full border border-white/20 bg-white/[0.08] hover:bg-white hover:text-black text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                          >
                            Vista Previa PDF
                          </button>
                        </div>

                        <p className="text-sm sm:text-[14.5px] text-white/92 leading-[1.75]">
                          {est.resumenIA}
                        </p>

                        <div className="rounded-xl border border-[#FDE68A]/30 bg-[#FDE68A]/[0.07] p-3.5 space-y-1.5">
                          <div className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#FDE68A]">
                            ¿Cómo puede mejorar?
                          </div>
                          <p className="text-[13px] sm:text-[13.5px] text-white/90 leading-[1.65]">
                            {est.comoMejorar}
                          </p>
                        </div>

                        {est.metodosEmplear?.length > 0 && (
                          <div className="rounded-xl border border-[#D8B4FE]/30 bg-[#D8B4FE]/[0.07] p-3.5 space-y-2">
                            <div className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#E9D5FF]">
                              Métodos para emplear con el niño
                            </div>
                            <ul className="space-y-1.5 text-[13px] sm:text-[13.5px] text-white/90 leading-[1.6] list-disc pl-4">
                              {est.metodosEmplear.map((metodo, idx) => (
                                <li key={idx}>{metodo}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-white/10 text-xs">
                        <div className="rounded-xl border border-[#6EE7B7]/25 bg-[#6EE7B7]/[0.07] px-3.5 py-2.5">
                          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#6EE7B7] mb-0.5">
                            Fortaleza Principal
                          </span>
                          <span className="text-white/90 leading-snug">{est.fortalezaPrincipal}</span>
                        </div>
                        <div className="rounded-xl border border-[#67E8F9]/25 bg-[#67E8F9]/[0.07] px-3.5 py-2.5">
                          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#67E8F9] mb-0.5">
                            Meta Recomendada
                          </span>
                          <span className="text-white/90 leading-snug">{est.metaRecomendada}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inlinePdfDoc && !modalPdfDoc && (
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#67E8F9]">
                    Vista Previa en Vivo (PDFSlick) · Descarga disponible desde la barra superior
                  </span>
                </div>
                <PdfSlickReportModal
                  key={inlinePdfDoc.filename}
                  mode="inline"
                  pdfBuffer={inlinePdfDoc.pdfBuffer}
                  blobUrl={inlinePdfDoc.blobUrl}
                  filename={inlinePdfDoc.filename}
                  title={inlinePdfDoc.title}
                  onExpand={() =>
                    runViewTransition(() => {
                      setModalPdfDoc(inlinePdfDoc);
                    }, 'edit')
                  }
                />
              </div>
            )}
          </div>
        )}
      </LiquidGlass>

      {modalPdfDoc && (
        <PdfSlickReportModal
          key={`modal-${modalPdfDoc.filename}`}
          mode="modal"
          pdfBuffer={modalPdfDoc.pdfBuffer}
          blobUrl={modalPdfDoc.blobUrl}
          filename={modalPdfDoc.filename}
          title={modalPdfDoc.title}
          onClose={cerrarPdfSlick}
        />
      )}
    </section>
  );
}
