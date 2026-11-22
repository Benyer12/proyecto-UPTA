'use client';

import { useEffect, useState } from 'react';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import RoleAvatar from './RoleAvatar';
import type {
  PlanetaTutorIA,
  PreguntaGeneradaIA,
  ResumenIndividualEstudianteIA,
  ResumenReporteProfesor,
} from '../lib/ai-tutor';

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

interface ResumenPDFData {
  tituloReporte: string;
  tutorNombre: string;
  fechaEmision: string;
  totalEstudiantes: number;
  totalEstrellas: number;
  totalNivelesCompletados: number;
  promedioEstrellas: number;
  totalPreguntasGeneradasIA: number;
  diagnosticoIA: string;
  recomendacionesClave: string[];
  resumenesPorEstudiante: ResumenIndividualEstudianteIA[];
  ultimasPreguntasIA: PreguntaGeneradaIA[];
  historialIndividual: ResumenReporteProfesor[];
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
  const [creandoPregunta, setCreandoPregunta] = useState(false);
  const [planetaNuevaPregunta, setPlanetaNuevaPregunta] =
    useState<PlanetaTutorIA>('Numérix');
  const [ultimaPreguntaCreada, setUltimaPreguntaCreada] =
    useState<PreguntaGeneradaIA | null>(null);
  const [resumenPDF, setResumenPDF] = useState<ResumenPDFData | null>(null);
  const [reportesLocales, setReportesLocales] = useState<ResumenReporteProfesor[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('universo-reportes-ia');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReportesLocales(parsed);
        }
      }
    } catch {}
  }, []);

  const generarDiagnosticoConIA = async (): Promise<ResumenPDFData | null> => {
    setLoadingIA(true);
    try {
      const res = await fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reporte-profesor',
          tutorNombre: tutorName,
          totalNiveles,
          estudiantes: students,
        }),
      });
      const data = await res.json();
      if (data?.ok && data.resumenPDF) {
        setResumenPDF(data.resumenPDF);
        return data.resumenPDF as ResumenPDFData;
      }
    } catch (e) {
      console.error('Error al consultar diagnóstico IA para profesor:', e);
    } finally {
      setLoadingIA(false);
    }
    return null;
  };

  const crearPreguntaParaBancoJSON = async () => {
    if (creandoPregunta) return;
    setCreandoPregunta(true);
    try {
      const res = await fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generar-pregunta',
          planeta: planetaNuevaPregunta,
          nivelActual: 2,
        }),
      });
      const data = await res.json();
      if (data?.ok && data.nuevaPregunta) {
        setUltimaPreguntaCreada(data.nuevaPregunta);
        if (resumenPDF && typeof data.totalPreguntasEnJson === 'number') {
          setResumenPDF({
            ...resumenPDF,
            totalPreguntasGeneradasIA: data.totalPreguntasEnJson,
            ultimasPreguntasIA: [
              data.nuevaPregunta,
              ...(resumenPDF.ultimasPreguntasIA || []),
            ].slice(0, 6),
          });
        }
      }
    } catch {} finally {
      setCreandoPregunta(false);
    }
  };

  const descargarReportePDFIndividual = async (
    est: ResumenIndividualEstudianteIA,
  ) => {
    const fechaLegible = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlIndividual = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Individual · ${est.nombre}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 36px 44px;
      line-height: 1.55;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #0284c7;
      font-weight: 700;
    }
    h1 { font-size: 22px; margin: 4px 0 6px; color: #0f172a; }
    h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0369a1;
      margin: 22px 0 10px;
      border-left: 3px solid #0284c7;
      padding-left: 8px;
    }
    .kpis {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 22px;
    }
    .kpi {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 14px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #64748b;
      font-weight: 700;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    .box {
      border: 1px solid #bae6fd;
      background: #f0f9ff;
      border-radius: 12px;
      padding: 18px;
      font-size: 13.5px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Universo del Conocimiento · Resumen Individual IA</div>
      <h1>Ficha Pedagógica de ${est.nombre}</h1>
      <div style="font-size:13px;color:#334155;">Usuario: <strong>@${est.usuario}</strong> · Docente: <strong>${tutorName}</strong></div>
    </div>
    <div style="font-size:12px;color:#475569;text-align:right;">
      <div><strong>Fecha:</strong> ${fechaLegible}</div>
      <div><strong>Motor IA:</strong> Gemma 4 / Gemini Cloud</div>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi">
      <div class="kpi-label">Avance de Niveles</div>
      <div class="kpi-val">${est.nivelesCompletados} / ${est.totalNiveles} (${est.porcentajeAvance}%)</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Estrellas Acumuladas</div>
      <div class="kpi-val">${est.estrellasTotales} ★</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Nivel Adaptativo IA</div>
      <div class="kpi-val" style="font-size:15px;color:#0369a1;">${est.etiquetaNivel}</div>
    </div>
  </div>

  <h2>Resumen Pedagógico Personalizado (Gemma 4)</h2>
  <div class="box">
    <p style="margin:0 0 12px;"><strong>Diagnóstico del estudiante:</strong> ${est.resumenIA}</p>
    <p style="margin:0 0 12px;"><strong>Fortaleza principal:</strong> ${est.fortalezaPrincipal}</p>
    <p style="margin:0;"><strong>Próxima meta recomendada:</strong> ${est.metaRecomendada}</p>
  </div>

  <div class="footer">
    <span>Universo del Conocimiento · Plataforma Educativa Gamificada (10 a 12 años)</span>
    <span>Generado por Tutor IA Gemma 4 (/api/tutor-ia)</span>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 250);
    });
  </script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.open();
      win.document.write(htmlIndividual);
      win.document.close();
    }
  };

  const descargarReportePDF = async () => {
    const datos = resumenPDF || (await generarDiagnosticoConIA());
    if (!datos) return;

    const fechaLegible = new Date(datos.fechaEmision).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const resumenesEstudiantes = datos.resumenesPorEstudiante || [];

    const filasEstudiantes =
      resumenesEstudiantes.length === 0
        ? `<tr><td colspan="4" style="text-align:center;padding:18px;color:#64748b;">No hay estudiantes asignados actualmente.</td></tr>`
        : resumenesEstudiantes
            .map(
              (s) => `
                <tr>
                  <td style="width:22%;">
                    <strong>${s.nombre}</strong><br/>
                    <span style="color:#64748b;font-size:11px;">@${s.usuario}</span><br/>
                    <span class="badge" style="margin-top:4px;">${s.etiquetaNivel}</span>
                  </td>
                  <td style="text-align:center;width:14%;">
                    <strong>${s.nivelesCompletados} / ${s.totalNiveles}</strong><br/>
                    <span style="color:#64748b;font-size:11px;">(${s.porcentajeAvance}%)</span><br/>
                    <strong style="color:#b45309;">${s.estrellasTotales} ★</strong>
                  </td>
                  <td style="width:36%;">${s.resumenIA}</td>
                  <td style="width:28%;">
                    <strong>Fortaleza:</strong> ${s.fortalezaPrincipal}<br/>
                    <strong>Meta:</strong> ${s.metaRecomendada}
                  </td>
                </tr>`,
            )
            .join('');

    const filasPreguntasJSON =
      !datos.ultimasPreguntasIA || datos.ultimasPreguntasIA.length === 0
        ? ''
        : `
          <h2>Últimas Preguntas Creadas por la IA en data/preguntas-ia.json</h2>
          <table>
            <thead>
              <tr>
                <th>Planeta</th>
                <th>Nivel</th>
                <th>Enunciado de la Pregunta</th>
                <th>Respuesta Correcta</th>
              </tr>
            </thead>
            <tbody>
              ${datos.ultimasPreguntasIA
                .map(
                  (q) => `
                <tr>
                  <td><strong>${q.planeta}</strong> (${q.materia})</td>
                  <td>${q.etiquetaNivel}</td>
                  <td>${q.enunciado}</td>
                  <td><strong>${q.opciones[q.indiceRespuestaCorrecta]}</strong></td>
                </tr>`,
                )
                .join('')}
            </tbody>
          </table>`;

    const htmlReporte = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${datos.tituloReporte}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 32px 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 22px;
    }
    .brand {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #0284c7;
      font-weight: 700;
    }
    h1 { font-size: 22px; margin: 4px 0 6px; color: #0f172a; }
    h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0369a1;
      margin: 22px 0 10px;
      border-left: 3px solid #0284c7;
      padding-left: 8px;
    }
    .meta { font-size: 12px; color: #475569; text-align: right; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #64748b;
      font-weight: 700;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .diagnosis-box {
      border: 1px solid #bae6fd;
      background: #f0f9ff;
      border-radius: 12px;
      padding: 16px 18px;
      font-size: 13px;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 9px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #334155;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
    }
    ul { margin: 6px 0 0; padding-left: 18px; font-size: 12.5px; }
    li { margin-bottom: 4px; }
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print { body { padding: 12px 18px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Universo del Conocimiento · Tutor IA Gemma 4 / Gemini Cloud</div>
      <h1>Reporte Pedagógico del Docente y Resumen por Estudiante</h1>
      <div style="font-size:13px;color:#334155;">Tutor responsable: <strong>${datos.tutorNombre}</strong></div>
    </div>
    <div class="meta">
      <div><strong>Fecha:</strong> ${fechaLegible}</div>
      <div><strong>Motor IA:</strong> Gemma 4 Cloud</div>
      <div><strong>Banco JSON:</strong> ${datos.totalPreguntasGeneradasIA} preguntas adaptativas</div>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi">
      <div class="kpi-label">Estudiantes</div>
      <div class="kpi-val">${datos.totalEstudiantes}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Niveles Completados</div>
      <div class="kpi-val">${datos.totalNivelesCompletados}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Estrellas Totales</div>
      <div class="kpi-val">${datos.totalEstrellas} ★</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Promedio Estrellas</div>
      <div class="kpi-val">${datos.promedioEstrellas}</div>
    </div>
  </div>

  <h2>Diagnóstico Grupal Generado por Gemma 4</h2>
  <div class="diagnosis-box">
    <p style="margin:0 0 8px;">${datos.diagnosticoIA}</p>
    <strong>Recomendaciones pedagógicas para el aula:</strong>
    <ul>
      ${datos.recomendacionesClave.map((r) => `<li>${r}</li>`).join('')}
    </ul>
  </div>

  <h2>Resumen Pedagógico Individual de Cada Estudiante</h2>
  <table>
    <thead>
      <tr>
        <th>Estudiante y Nivel IA</th>
        <th style="text-align:center;">Avance y Estrellas</th>
        <th>Resumen IA del Estudiante</th>
        <th>Fortaleza y Meta Recomendada</th>
      </tr>
    </thead>
    <tbody>
      ${filasEstudiantes}
    </tbody>
  </table>

  ${filasPreguntasJSON}

  <div class="footer">
    <span>Universo del Conocimiento · Plataforma Educativa Gamificada (10 a 12 años)</span>
    <span>Generado con Tutor IA Gemma 4 (/api/tutor-ia)</span>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 250);
    });
  </script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=1020,height=780');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlReporte);
      printWin.document.close();
    }
  };

  return (
    <section aria-labelledby="ai-tutor-report-heading">
      <LiquidGlass
        blur={2.5}
        refraction={20}
        bezel={0.34}
        saturation={1.65}
        className="rounded-3xl bg-[#050a18]/[0.44] border-white/[0.16] p-6 sm:p-7 space-y-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <RoleAvatar role="tutor" name="Asistente Gemma 4" size={46} />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#67E8F9]">
                Copiloto Docente · Gemma 4 / Gemini Cloud
              </div>
              <h2
                id="ai-tutor-report-heading"
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                Resumen por Estudiante, Banco JSON y Reporte PDF
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Seleccionar planeta para crear pregunta con IA"
              value={planetaNuevaPregunta}
              onChange={(e) => setPlanetaNuevaPregunta(e.target.value as PlanetaTutorIA)}
              className="min-h-[38px] px-3 py-1.5 rounded-full border border-white/15 bg-[#050a18]/80 text-xs font-semibold text-white"
            >
              <option value="Numérix">Numérix (Mate)</option>
              <option value="Letralia">Letralia (Lengua)</option>
              <option value="Naturae">Naturae (Ciencias)</option>
            </select>

            <button
              type="button"
              onClick={crearPreguntaParaBancoJSON}
              disabled={creandoPregunta}
              className="min-h-[38px] px-4 py-1.5 rounded-full border border-[#6EE7B7]/40 bg-[#041B14]/80 hover:bg-[#041B14] text-xs font-semibold text-[#6EE7B7] transition-colors cursor-pointer disabled:opacity-50"
            >
              {creandoPregunta ? 'Creando...' : '+ Crear pregunta IA'}
            </button>

            <button
              type="button"
              onClick={generarDiagnosticoConIA}
              disabled={loadingIA}
              className="min-h-[38px] px-4 py-1.5 rounded-full border border-[#67E8F9]/40 bg-[#041724]/80 hover:bg-[#041724] text-xs font-semibold text-[#67E8F9] transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingIA ? 'Analizando...' : 'Resumen de cada estudiante'}
            </button>

            <button
              type="button"
              onClick={descargarReportePDF}
              disabled={loadingIA}
              className="min-h-[38px] px-5 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Descargar Reporte PDF
            </button>
          </div>
        </div>

        {ultimaPreguntaCreada && (
          <div className="rounded-2xl border border-[#6EE7B7]/30 bg-[#041B14]/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs text-white/90">
              <strong className="text-[#6EE7B7]">
                Guardada en data/preguntas-ia.json ({ultimaPreguntaCreada.planeta}):
              </strong>{' '}
              {ultimaPreguntaCreada.enunciado}
            </div>
            <span className="font-mono text-[10px] text-[#6EE7B7] shrink-0">
              Resp: {ultimaPreguntaCreada.opciones[ultimaPreguntaCreada.indiceRespuestaCorrecta]}
            </span>
          </div>
        )}

        {resumenPDF && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 sm:p-5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#6EE7B7]">
                  Diagnóstico Grupal · {resumenPDF.totalPreguntasGeneradasIA} preguntas en JSON
                </span>
                <span className="font-mono text-[10px] text-white/50">
                  Promedio: {resumenPDF.promedioEstrellas} estrellas/estudiante
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {resumenPDF.diagnosticoIA}
              </p>
            </div>

            {resumenPDF.resumenesPorEstudiante &&
              resumenPDF.resumenesPorEstudiante.length > 0 && (
                <div className="space-y-2.5">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#67E8F9] px-1">
                    Resumen IA de cada estudiante ({resumenPDF.resumenesPorEstudiante.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {resumenPDF.resumenesPorEstudiante.map((est) => (
                      <div
                        key={est.estudianteId}
                        className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <RoleAvatar role="student" name={est.nombre} size={36} />
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-white truncate">
                                  {est.nombre}
                                </div>
                                <div className="font-mono text-[10px] text-[#67E8F9]">
                                  {est.etiquetaNivel}
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

                          <p className="text-xs text-white/80 leading-relaxed">
                            {est.resumenIA}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/10 text-[11px] text-white/65 space-y-0.5">
                          <div>
                            <strong className="text-[#6EE7B7]">Fortaleza:</strong>{' '}
                            {est.fortalezaPrincipal}
                          </div>
                          <div>
                            <strong className="text-[#FDE68A]">Meta:</strong>{' '}
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
    </section>
  );
}
