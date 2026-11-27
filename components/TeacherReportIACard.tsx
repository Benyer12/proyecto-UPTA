'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import LiquidGlassSelect, { type LiquidGlassSelectOption } from './LiquidGlassSelect';
import RoleAvatar from './RoleAvatar';
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
  const [activePdfDoc, setActivePdfDoc] = useState<GeneratedPdfDocument | null>(null);

  useEffect(() => {
    return () => {
      if (activePdfDoc?.blobUrl) {
        URL.revokeObjectURL(activePdfDoc.blobUrl);
      }
    };
  }, [activePdfDoc]);

  const abrirEnPdfSlick = (doc: GeneratedPdfDocument) => {
    runViewTransition(() => {
      setActivePdfDoc(doc);
    }, 'edit');
  };

  const cerrarPdfSlick = () => {
    runViewTransition(() => {
      setActivePdfDoc(null);
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
              {filtroEstudiante === 'all' ? 'Ver / Descargar PDF' : 'Ver PDF Individual'}
            </button>
          </div>
        </div>

        {errorIA && (
          <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
            {errorIA}
          </div>
        )}

        {resumenPDF && (
          <div className="space-y-4">
            {filtroEstudiante === 'all' && (
              <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#6EE7B7]">
                    Diagnóstico Grupal · {resumenPDF.totalPreguntasGeneradasIA} retos adaptativos en tableros
                  </span>
                  <span className="font-mono text-[10px] text-white/50">
                    Promedio: {resumenPDF.promedioEstrellas} estrellas/estudiante
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  {resumenPDF.diagnosticoIA}
                </p>
                {resumenPDF.recomendacionesClave?.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FDE68A]">
                      Métodos recomendados para el grupo
                    </div>
                    <ul className="space-y-1 text-xs text-white/75 list-disc pl-4">
                      {resumenPDF.recomendacionesClave.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {resumenesFiltrados.length > 0 && (
              <div className="space-y-2.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#67E8F9] px-1">
                  {filtroEstudiante === 'all'
                    ? `Resumen IA de cada estudiante (${resumenesFiltrados.length})`
                    : 'Resumen IA del estudiante seleccionado'}
                </div>
                <div
                  className={`grid grid-cols-1 ${
                    resumenesFiltrados.length > 1 ? 'md:grid-cols-2' : ''
                  } gap-4`}
                >
                  {resumenesFiltrados.map((est) => (
                    <div
                      key={est.estudianteId}
                      className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 flex flex-col justify-between gap-3.5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <RoleAvatar role="student" name={est.nombre} size={38} />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-white truncate">
                                {est.nombre}
                              </div>
                              <div className="font-mono text-[10px] text-[#67E8F9]">
                                {est.etiquetaNivel} · {est.porcentajeAvance}% ({est.estrellasTotales} ★)
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => descargarReportePDFIndividual(est)}
                            className="min-h-[32px] px-3 py-1 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white hover:text-black text-[11px] font-semibold text-white transition-colors cursor-pointer shrink-0"
                          >
                            PDF Individual
                          </button>
                        </div>

                        <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed">
                          {est.resumenIA}
                        </p>

                        <div className="rounded-xl border border-[#FDE68A]/25 bg-[#FDE68A]/[0.06] p-3 space-y-1">
                          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#FDE68A]">
                            ¿Cómo puede mejorar?
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed">{est.comoMejorar}</p>
                        </div>

                        {est.metodosEmplear?.length > 0 && (
                          <div className="rounded-xl border border-[#D8B4FE]/25 bg-[#D8B4FE]/[0.06] p-3 space-y-1.5">
                            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E9D5FF]">
                              Métodos para emplear con el niño
                            </div>
                            <ul className="space-y-1 text-xs text-white/80 list-disc pl-4">
                              {est.metodosEmplear.map((metodo, idx) => (
                                <li key={idx}>{metodo}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-white/10 text-[11px] text-white/65 space-y-1">
                        <div>
                          <strong className="text-[#6EE7B7]">Fortaleza:</strong>{' '}
                          {est.fortalezaPrincipal}
                        </div>
                        <div>
                          <strong className="text-[#67E8F9]">Meta:</strong>{' '}
                          {est.metaRecomendada}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </LiquidGlass>

      {activePdfDoc && (
        <PdfSlickReportModal
          blobUrl={activePdfDoc.blobUrl}
          filename={activePdfDoc.filename}
          title={activePdfDoc.title}
          onClose={cerrarPdfSlick}
        />
      )}
    </section>
  );
}
