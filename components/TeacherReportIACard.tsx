'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import LiquidGlassSelect, { type LiquidGlassSelectOption } from './LiquidGlassSelect';
import RoleAvatar from './RoleAvatar';
import type {
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
  const [errorIA, setErrorIA] = useState<string | null>(null);
  const [filtroEstudiante, setFiltroEstudiante] = useState<string>('all');
  const [resumenPDF, setResumenPDF] = useState<ResumenPDFData | null>(null);

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
    targetWin?: Window | null,
  ) => {
    const fechaLegible = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const promedioEstrellasNivel =
      est.nivelesCompletados > 0
        ? (est.estrellasTotales / est.nivelesCompletados).toFixed(1)
        : '0.0';
    const metodosHtml = (est.metodosEmplear || [])
      .map((m, idx) => `<li><strong>Método ${idx + 1}:</strong> ${m}</li>`)
      .join('');

    const htmlIndividual = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Individual · ${est.nombre}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 20px 28px;
      line-height: 1.55;
    }
    .hero {
      background: linear-gradient(135deg, #0b1221 0%, #0369a1 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 22px 26px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #67e8f9;
      font-weight: 800;
    }
    h1 { font-size: 22px; margin: 4px 0 6px; color: #ffffff; }
    .meta-line { font-size: 12.5px; color: #cbd5e1; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      font-weight: 700;
    }
    .kpi-val {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    .progress-track {
      height: 8px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #0284c7, #10b981);
      border-radius: 999px;
    }
    h2 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0369a1;
      margin: 18px 0 10px;
      border-left: 4px solid #0284c7;
      padding-left: 10px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }
    .card {
      border-radius: 14px;
      padding: 16px 18px;
      font-size: 13px;
      break-inside: avoid;
    }
    .card-blue {
      border: 1px solid #bae6fd;
      background: #f0f9ff;
      margin-bottom: 14px;
    }
    .card-emerald {
      border: 1px solid #a7f3d0;
      background: #ecfdf5;
    }
    .card-amber {
      border: 1px solid #fde68a;
      background: #fffbeb;
    }
    .card-violet {
      border: 1px solid #ddd6fe;
      background: #f5f3ff;
      margin-bottom: 14px;
    }
    .card-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      font-weight: 800;
      margin: 0 0 6px;
    }
    ul.methods {
      margin: 8px 0 0;
      padding-left: 18px;
    }
    ul.methods li {
      margin-bottom: 6px;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10.5px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div>
      <div class="brand">Universo del Conocimiento · Ficha Pedagógica IA</div>
      <h1>${est.nombre}</h1>
      <div class="meta-line">Usuario: <strong>@${est.usuario}</strong> · Docente: <strong>${tutorName}</strong></div>
    </div>
    <div style="font-size:11.5px;color:#e2e8f0;text-align:right;">
      <div><strong>Emitido:</strong> ${fechaLegible}</div>
      <div><strong>Motor IA:</strong> Google Gemini Cloud</div>
    </div>
  </div>

  <div class="kpis">
    <div class="kpi">
      <div class="kpi-label">Avance en el Mapa</div>
      <div class="kpi-val">${est.nivelesCompletados} / ${est.totalNiveles} (${est.porcentajeAvance}%)</div>
      <div class="progress-track"><div class="progress-fill" style="width:${est.porcentajeAvance}%;"></div></div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Estrellas Totales</div>
      <div class="kpi-val" style="color:#b45309;">${est.estrellasTotales} ★</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Promedio / Nivel</div>
      <div class="kpi-val">${promedioEstrellasNivel} ★</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Nivel Adaptativo IA</div>
      <div class="kpi-val" style="font-size:14px;color:#0369a1;">${est.etiquetaNivel}</div>
    </div>
  </div>

  <h2>Diagnóstico Pedagógico Personalizado</h2>
  <div class="card card-blue">
    <p style="margin:0;">${est.resumenIA}</p>
  </div>

  <div class="grid-2">
    <div class="card card-emerald">
      <div class="card-title" style="color:#047857;">Fortaleza Principal</div>
      <p style="margin:0;">${est.fortalezaPrincipal}</p>
    </div>
    <div class="card card-amber">
      <div class="card-title" style="color:#b45309;">Próxima Meta Recomendada</div>
      <p style="margin:0;">${est.metaRecomendada}</p>
    </div>
  </div>

  <h2>Plan de Mejora y Métodos de Enseñanza</h2>
  <div class="card card-amber" style="margin-bottom:14px;">
    <div class="card-title" style="color:#92400e;">¿Cómo puede mejorar el alumno?</div>
    <p style="margin:0;">${est.comoMejorar}</p>
  </div>

  <div class="card card-violet">
    <div class="card-title" style="color:#5b21b6;">Métodos prácticos para aplicar con el niño</div>
    <ul class="methods">
      ${metodosHtml}
    </ul>
  </div>

  <div class="footer">
    <span>Universo del Conocimiento · Plataforma Educativa Gamificada (10 a 12 años)</span>
    <span>Generado por Tutor IA Google Gemini (/api/tutor-ia)</span>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 250);
    });
  </script>
</body>
</html>`;

    const win = targetWin ?? window.open('', '_blank', 'width=940,height=740');
    if (win) {
      win.document.open();
      win.document.write(htmlIndividual);
      win.document.close();
    }
  };

  const descargarReportePDF = async () => {
    // Si ya tenemos el resumen generado para la selección actual, abrimos el PDF al instante (0 ms)
    const yaTieneSeleccion =
      resumenPDF &&
      (filtroEstudiante === 'all'
        ? resumenPDF.resumenesPorEstudiante.length >= students.length
        : resumenPDF.resumenesPorEstudiante.some((e) => e.estudianteId === filtroEstudiante));

    if (yaTieneSeleccion && resumenPDF) {
      if (filtroEstudiante !== 'all') {
        const individual = resumenPDF.resumenesPorEstudiante.find(
          (e) => e.estudianteId === filtroEstudiante,
        );
        if (individual) {
          await descargarReportePDFIndividual(individual);
          return;
        }
      }
    }

    // Abrimos la ventana de forma síncrona al clic para evitar bloqueadores de popups mientras genera
    const pendingWin = !yaTieneSeleccion
      ? window.open('', '_blank', 'width=1020,height=780')
      : null;
    if (pendingWin) {
      pendingWin.document.open();
      pendingWin.document.write(
        '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>Preparando PDF...</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:90vh;color:#0369a1;font-weight:600;">Generando reporte pedagógico PDF con IA...</body></html>',
      );
      pendingWin.document.close();
    }

    const datos = yaTieneSeleccion && resumenPDF ? resumenPDF : await generarDiagnosticoConIA();
    if (!datos) {
      if (pendingWin) pendingWin.close();
      return;
    }

    if (filtroEstudiante !== 'all') {
      const individual = datos.resumenesPorEstudiante.find(
        (e) => e.estudianteId === filtroEstudiante,
      );
      if (individual) {
        await descargarReportePDFIndividual(individual, pendingWin);
        return;
      }
    }

    const fechaLegible = new Date(datos.fechaEmision).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const resumenesEstudiantes = datos.resumenesPorEstudiante || [];

    const tarjetasEstudiantes =
      resumenesEstudiantes.length === 0
        ? `<div class="empty-box">No hay estudiantes asignados actualmente.</div>`
        : resumenesEstudiantes
            .map((s) => {
              const metodosList = (s.metodosEmplear || [])
                .map((m) => `<li>${m}</li>`)
                .join('');
              return `
                <div class="student-card">
                  <div class="student-top">
                    <div>
                      <div class="student-name">${s.nombre} <span class="student-user">@${s.usuario}</span></div>
                      <span class="badge">${s.etiquetaNivel}</span>
                    </div>
                    <div class="student-metrics">
                      <div><strong>${s.nivelesCompletados}/${s.totalNiveles}</strong> niveles (${s.porcentajeAvance}%)</div>
                      <div style="color:#b45309;font-weight:800;">${s.estrellasTotales} ★</div>
                    </div>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width:${s.porcentajeAvance}%;"></div>
                  </div>
                  <p class="student-summary">${s.resumenIA}</p>
                  <div class="student-details">
                    <div class="detail-box detail-improve">
                      <div class="detail-title">¿Cómo puede mejorar?</div>
                      <p>${s.comoMejorar}</p>
                    </div>
                    <div class="detail-box detail-methods">
                      <div class="detail-title">Métodos a emplear</div>
                      <ul>${metodosList}</ul>
                    </div>
                  </div>
                  <div class="student-foot">
                    <span><strong>Fortaleza:</strong> ${s.fortalezaPrincipal}</span>
                    <span><strong>Meta:</strong> ${s.metaRecomendada}</span>
                  </div>
                </div>`;
            })
            .join('');

    const filasPreguntasJSON =
      !datos.ultimasPreguntasIA || datos.ultimasPreguntasIA.length === 0
        ? ''
        : `
          <h2>Últimas Preguntas Calibradas por la IA en los Tableros</h2>
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
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 20px 28px;
      line-height: 1.5;
    }
    .hero {
      background: linear-gradient(135deg, #0b1221 0%, #0369a1 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 18px;
    }
    .brand {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #67e8f9;
      font-weight: 800;
    }
    h1 { font-size: 20px; margin: 4px 0 6px; color: #ffffff; }
    .meta { font-size: 12px; color: #cbd5e1; text-align: right; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }
    .kpi {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      font-weight: 700;
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    h2 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0369a1;
      margin: 20px 0 10px;
      border-left: 4px solid #0284c7;
      padding-left: 10px;
    }
    .diagnosis-box {
      border: 1px solid #bae6fd;
      background: #f0f9ff;
      border-radius: 12px;
      padding: 16px 18px;
      font-size: 12.5px;
      break-inside: avoid;
    }
    .diagnosis-box ul { margin: 8px 0 0; padding-left: 18px; }
    .diagnosis-box li { margin-bottom: 4px; }
    .student-card {
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 14px;
      background: #ffffff;
      break-inside: avoid;
    }
    .student-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .student-name { font-size: 15px; font-weight: 800; color: #0f172a; }
    .student-user { font-size: 11.5px; font-weight: 500; color: #64748b; }
    .student-metrics { text-align: right; font-size: 12px; }
    .badge {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 9px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
    }
    .progress-track {
      height: 7px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      margin: 10px 0;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #0284c7, #10b981);
    }
    .student-summary { font-size: 12.5px; margin: 0 0 10px; color: #1e293b; }
    .student-details {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .detail-box {
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 11.5px;
    }
    .detail-improve { background: #fffbeb; border: 1px solid #fde68a; }
    .detail-methods { background: #f5f3ff; border: 1px solid #ddd6fe; }
    .detail-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      margin-bottom: 4px;
      color: #334155;
    }
    .detail-box p { margin: 0; }
    .detail-box ul { margin: 0; padding-left: 16px; }
    .detail-box li { margin-bottom: 3px; }
    .student-foot {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
      font-size: 11px;
      color: #475569;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-top: 8px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
      font-size: 10.5px;
      text-transform: uppercase;
    }
    .empty-box {
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      color: #64748b;
    }
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 10.5px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div>
      <div class="brand">Universo del Conocimiento · Reporte Ejecutivo IA</div>
      <h1>${datos.tituloReporte}</h1>
      <div style="font-size:12.5px;color:#cbd5e1;">Docente responsable: <strong style="color:#fff;">${datos.tutorNombre}</strong></div>
    </div>
    <div class="meta">
      <div><strong>Fecha de emisión:</strong> ${fechaLegible}</div>
      <div><strong>Motor IA:</strong> Google Gemini Cloud</div>
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
      <div class="kpi-val" style="color:#b45309;">${datos.totalEstrellas} ★</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Promedio / Alumno</div>
      <div class="kpi-val">${datos.promedioEstrellas} ★</div>
    </div>
  </div>

  <h2>Diagnóstico Grupal y Métodos de Mejora (Google Gemini)</h2>
  <div class="diagnosis-box">
    <p style="margin:0 0 8px;">${datos.diagnosticoIA}</p>
    <strong>Métodos y recomendaciones clave para el grupo:</strong>
    <ul>
      ${datos.recomendacionesClave.map((r) => `<li>${r}</li>`).join('')}
    </ul>
  </div>

  <h2>Plan Pedagógico Individual por Estudiante</h2>
  ${tarjetasEstudiantes}

  ${filasPreguntasJSON}

  <div class="footer">
    <span>Universo del Conocimiento · Plataforma Educativa Gamificada (10 a 12 años)</span>
    <span>Generado con Tutor IA Google Gemini (/api/tutor-ia)</span>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 250);
    });
  </script>
</body>
</html>`;

    const printWin = pendingWin ?? window.open('', '_blank', 'width=1020,height=780');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlReporte);
      printWin.document.close();
    }
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
              {filtroEstudiante === 'all' ? 'Descargar Reporte PDF' : 'Descargar PDF Individual'}
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
    </section>
  );
}
