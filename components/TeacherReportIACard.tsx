'use client';

import { useEffect, useState } from 'react';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import RoleAvatar from './RoleAvatar';
import type { PreguntaGeneradaIA, ResumenReporteProfesor } from '../lib/ai-tutor';

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

    const historialCombinado = [
      ...(datos.historialIndividual || []),
      ...reportesLocales,
    ].slice(0, 8);

    const filasEstudiantes =
      students.length === 0
        ? `<tr><td colspan="5" style="text-align:center;padding:18px;color:#64748b;">No hay estudiantes asignados actualmente.</td></tr>`
        : students
            .map((s) => {
              const pct =
                totalNiveles > 0
                  ? Math.min(100, Math.round((s.nivelesCompletados / totalNiveles) * 100))
                  : 0;
              const nivelIA =
                s.estrellasTotales >= 12 || pct >= 65
                  ? 'Nivel 3 · Cuántico'
                  : s.estrellasTotales >= 4 || pct >= 25
                    ? 'Nivel 2 · Propulsión'
                    : 'Nivel 1 · Base Orbital';
              return `
                <tr>
                  <td><strong>${s.nombre}</strong><br/><span style="color:#64748b;font-size:11px;">@${s.usuario} · ${s.correo}</span></td>
                  <td style="text-align:center;">${s.nivelesCompletados} / ${totalNiveles} (${pct}%)</td>
                  <td style="text-align:center;font-weight:700;color:#b45309;">${s.estrellasTotales} ★</td>
                  <td style="text-align:center;"><span class="badge">${nivelIA}</span></td>
                  <td style="text-align:center;">${
                    s.ultimaSesion
                      ? new Date(s.ultimaSesion).toLocaleDateString('es-ES')
                      : 'Sin registro'
                  }</td>
                </tr>`;
            })
            .join('');

    const filasHistorialIA =
      historialCombinado.length === 0
        ? ''
        : `
          <h2>Evaluaciones adaptativas recientes (Tutor IA Gemma 4)</h2>
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Planeta / Materia</th>
                <th>Nivel Adaptativo</th>
                <th>Precisión</th>
                <th>Recomendación de Gemma 4</th>
              </tr>
            </thead>
            <tbody>
              ${historialCombinado
                .map(
                  (h) => `
                <tr>
                  <td><strong>${h.estudianteNombre}</strong></td>
                  <td>${h.planeta} (${h.materia})</td>
                  <td>${h.etiquetaNivel}</td>
                  <td style="text-align:center;font-weight:700;">${h.precisionPorcentaje}%</td>
                  <td>${h.recomendacionPedagogica}</td>
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
    h1 {
      font-size: 22px;
      margin: 4px 0 6px;
      color: #0f172a;
    }
    h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0369a1;
      margin: 22px 0 10px;
      border-left: 3px solid #0284c7;
      padding-left: 8px;
    }
    .meta {
      font-size: 12px;
      color: #475569;
      text-align: right;
    }
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
      vertical-align: middle;
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
    ul {
      margin: 6px 0 0;
      padding-left: 18px;
      font-size: 12.5px;
    }
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
    @media print {
      body { padding: 12px 18px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Universo del Conocimiento · Tutor IA Gemma 4</div>
      <h1>Reporte Pedagógico del Docente</h1>
      <div style="font-size:13px;color:#334155;">Tutor responsable: <strong>${datos.tutorNombre}</strong></div>
    </div>
    <div class="meta">
      <div><strong>Fecha:</strong> ${fechaLegible}</div>
      <div><strong>Motor IA:</strong> Gemma 4 (Ollama Cloud)</div>
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

  <h2>Diagnóstico Ejecutivo Generado por Gemma 4</h2>
  <div class="diagnosis-box">
    <p style="margin:0 0 8px;">${datos.diagnosticoIA}</p>
    <strong>Recomendaciones pedagógicas para el aula:</strong>
    <ul>
      ${datos.recomendacionesClave.map((r) => `<li>${r}</li>`).join('')}
    </ul>
  </div>

  <h2>Desempeño por Estudiante Asignado</h2>
  <table>
    <thead>
      <tr>
        <th>Estudiante</th>
        <th style="text-align:center;">Avance de Niveles</th>
        <th style="text-align:center;">Estrellas</th>
        <th style="text-align:center;">Nivel Adaptativo IA</th>
        <th style="text-align:center;">Última Sesión</th>
      </tr>
    </thead>
    <tbody>
      ${filasEstudiantes}
    </tbody>
  </table>

  ${filasHistorialIA}

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

    const printWin = window.open('', '_blank', 'width=980,height=760');
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <RoleAvatar role="tutor" name="Asistente Gemma 4" size={46} />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#67E8F9]">
                Copiloto Docente · Gemma 4 (Ollama Cloud)
              </div>
              <h2
                id="ai-tutor-report-heading"
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                Resumen Pedagógico IA y Reporte PDF
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={generarDiagnosticoConIA}
              disabled={loadingIA}
              className="min-h-[40px] px-4 py-2 rounded-full border border-[#67E8F9]/40 bg-[#041724]/80 hover:bg-[#041724] text-xs font-semibold text-[#67E8F9] transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingIA ? 'Consultando a Gemma 4...' : 'Analizar grupo con IA'}
            </button>

            <button
              type="button"
              onClick={descargarReportePDF}
              disabled={loadingIA}
              className="min-h-[40px] px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Descargar Reporte PDF
            </button>
          </div>
        </div>

        {resumenPDF && (
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#6EE7B7]">
                Diagnóstico listo para PDF · {resumenPDF.totalPreguntasGeneradasIA} preguntas en JSON
              </span>
              <span className="font-mono text-[10px] text-white/50">
                Promedio: {resumenPDF.promedioEstrellas} estrellas/estudiante
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              {resumenPDF.diagnosticoIA}
            </p>
          </div>
        )}
      </LiquidGlass>
    </section>
  );
}
