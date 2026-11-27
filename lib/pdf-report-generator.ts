import { jsPDF } from 'jspdf';
import type {
  PreguntaGeneradaIA,
  ResumenIndividualEstudianteIA,
  ResumenReporteProfesor,
} from './ai-tutor';

export interface ResumenPDFData {
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

export interface GeneratedPdfDocument {
  blobUrl: string;
  filename: string;
  title: string;
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 14;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const FOOTER_Y = PAGE_H - 10;
const MAX_Y = PAGE_H - 18;

function safePdfText(text: string | number | null | undefined): string {
  return String(text ?? '')
    .replace(/★/g, 'estrellas')
    .replace(/•/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '-')
    .trim();
}

function slugifyFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function formatReadableDate(dateInput?: string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString('es-ES');
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function addFooters(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, FOOTER_Y - 4, PAGE_W - MARGIN_X, FOOTER_Y - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Universo del Conocimiento - Reporte Pedagogico IA', MARGIN_X, FOOTER_Y);
    doc.text(`Pagina ${i} de ${totalPages}`, PAGE_W - MARGIN_X, FOOTER_Y, { align: 'right' });
  }
}

function drawSectionHeading(doc: jsPDF, y: number, title: string): number {
  let cursorY = y;
  if (cursorY > MAX_Y - 16) {
    doc.addPage();
    cursorY = 18;
  }
  doc.setFillColor(2, 132, 199);
  doc.rect(MARGIN_X, cursorY, 2.2, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(3, 105, 161);
  doc.text(safePdfText(title).toUpperCase(), MARGIN_X + 5, cursorY + 4.2);
  return cursorY + 9;
}

function drawKpiRow(
  doc: jsPDF,
  y: number,
  items: Array<{ label: string; value: string }>,
): number {
  const gap = 3.5;
  const colW = (CONTENT_W - gap * (items.length - 1)) / items.length;
  const boxH = 18;

  items.forEach((item, idx) => {
    const x = MARGIN_X + idx * (colW + gap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, colW, boxH, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(safePdfText(item.label).toUpperCase(), x + 3.5, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(safePdfText(item.value), x + 3.5, y + 13.5);
  });

  return y + boxH + 7;
}

function drawHeroBanner(
  doc: jsPDF,
  eyebrow: string,
  title: string,
  subtitleLines: string[],
): number {
  const y = 12;
  const h = 28 + Math.max(0, subtitleLines.length - 1) * 4.5;

  doc.setFillColor(11, 18, 33);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, h, 4, 4, 'F');

  // Accent bar on right/bottom edge
  doc.setFillColor(3, 105, 161);
  doc.roundedRect(MARGIN_X, y + h - 2.2, CONTENT_W, 2.2, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(103, 232, 249);
  doc.text(safePdfText(eyebrow).toUpperCase(), MARGIN_X + 6, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(safePdfText(title), CONTENT_W - 12);
  doc.text(titleLines[0] || safePdfText(title), MARGIN_X + 6, y + 14.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(203, 213, 225);
  subtitleLines.forEach((line, idx) => {
    doc.text(safePdfText(line), MARGIN_X + 6, y + 21 + idx * 4.5);
  });

  return y + h + 7;
}

function drawInfoCard(
  doc: jsPDF,
  y: number,
  options: {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    bg: [number, number, number];
    border: [number, number, number];
    titleColor: [number, number, number];
  },
): number {
  const padX = 5;
  const padY = 5;
  const innerW = CONTENT_W - padX * 2;

  const paragraphLines: string[][] = (options.paragraphs || []).map((p) =>
    doc.splitTextToSize(safePdfText(p), innerW),
  );
  const bulletLines: string[][] = (options.bullets || []).map((b, idx) =>
    doc.splitTextToSize(`${idx + 1}. ${safePdfText(b)}`, innerW - 3),
  );

  let contentH = 6; // title
  paragraphLines.forEach((lines) => {
    contentH += lines.length * 4.4 + 2;
  });
  bulletLines.forEach((lines) => {
    contentH += lines.length * 4.4 + 1.5;
  });
  const totalH = contentH + padY * 2;

  let cursorY = y;
  if (cursorY + totalH > MAX_Y) {
    doc.addPage();
    cursorY = 18;
  }

  doc.setFillColor(...options.bg);
  doc.setDrawColor(...options.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN_X, cursorY, CONTENT_W, totalH, 3, 3, 'FD');

  let textY = cursorY + padY + 3.8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...options.titleColor);
  doc.text(safePdfText(options.title).toUpperCase(), MARGIN_X + padX, textY);
  textY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.setTextColor(30, 41, 59);

  paragraphLines.forEach((lines) => {
    doc.text(lines, MARGIN_X + padX, textY);
    textY += lines.length * 4.4 + 2;
  });

  bulletLines.forEach((lines) => {
    doc.text(lines, MARGIN_X + padX + 2, textY);
    textY += lines.length * 4.4 + 1.5;
  });

  return cursorY + totalH + 5;
}

export function buildIndividualReportPdf(
  est: ResumenIndividualEstudianteIA,
  tutorName: string,
): GeneratedPdfDocument {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fechaLegible = formatReadableDate();
  const promedioNivel =
    est.nivelesCompletados > 0
      ? (est.estrellasTotales / est.nivelesCompletados).toFixed(1)
      : '0.0';

  let y = drawHeroBanner(
    doc,
    'Universo del Conocimiento - Reporte Individual IA',
    est.nombre,
    [
      `Usuario: @${est.usuario}  |  Nivel: ${est.etiquetaNivel}`,
      `Tutor: ${tutorName}  |  Emitido: ${fechaLegible}`,
    ],
  );

  y = drawKpiRow(doc, y, [
    { label: 'Niveles', value: `${est.nivelesCompletados}/${est.totalNiveles}` },
    { label: 'Avance', value: `${est.porcentajeAvance}%` },
    { label: 'Estrellas', value: `${est.estrellasTotales}` },
    { label: 'Prom./Nivel', value: `${promedioNivel}` },
  ]);

  // Progress bar
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(MARGIN_X, y - 2, CONTENT_W, 3.2, 1.5, 1.5, 'F');
  const fillW = Math.max(4, (CONTENT_W * Math.min(100, Math.max(0, est.porcentajeAvance))) / 100);
  doc.setFillColor(2, 132, 199);
  doc.roundedRect(MARGIN_X, y - 2, fillW, 3.2, 1.5, 1.5, 'F');
  y += 6;

  y = drawSectionHeading(doc, y, 'Analisis Pedagogico IA');
  y = drawInfoCard(doc, y, {
    title: 'Resumen General del Estudiante',
    paragraphs: [est.resumenIA],
    bg: [240, 249, 255],
    border: [186, 230, 253],
    titleColor: [3, 105, 161],
  });

  y = drawInfoCard(doc, y, {
    title: 'Fortaleza Principal y Meta Recomendada',
    paragraphs: [
      `Fortaleza: ${est.fortalezaPrincipal}`,
      `Meta recomendada: ${est.metaRecomendada}`,
    ],
    bg: [236, 253, 245],
    border: [167, 243, 208],
    titleColor: [4, 120, 87],
  });

  y = drawInfoCard(doc, y, {
    title: 'Como puede mejorar?',
    paragraphs: [est.comoMejorar],
    bg: [255, 251, 235],
    border: [253, 230, 138],
    titleColor: [180, 83, 9],
  });

  if (est.metodosEmplear && est.metodosEmplear.length > 0) {
    y = drawInfoCard(doc, y, {
      title: 'Metodos recomendados para emplear con el estudiante',
      bullets: est.metodosEmplear,
      bg: [245, 243, 255],
      border: [221, 214, 254],
      titleColor: [109, 40, 217],
    });
  }

  addFooters(doc);

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  return {
    blobUrl,
    filename: `reporte_individual_${slugifyFilename(est.nombre || est.usuario)}.pdf`,
    title: `Reporte Individual · ${est.nombre}`,
  };
}

export function buildGroupReportPdf(datos: ResumenPDFData): GeneratedPdfDocument {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fechaLegible = formatReadableDate(datos.fechaEmision);

  let y = drawHeroBanner(
    doc,
    'Universo del Conocimiento - Reporte Pedagogico Grupal',
    datos.tituloReporte || 'Reporte Pedagogico de Estudiantes',
    [
      `Tutor: ${datos.tutorNombre}  |  Emitido: ${fechaLegible}`,
      `Retos adaptativos calibrados por IA: ${datos.totalPreguntasGeneradasIA}`,
    ],
  );

  y = drawKpiRow(doc, y, [
    { label: 'Estudiantes', value: `${datos.totalEstudiantes}` },
    { label: 'Niveles Comp.', value: `${datos.totalNivelesCompletados}` },
    { label: 'Estrellas Tot.', value: `${datos.totalEstrellas}` },
    { label: 'Prom. Estrellas', value: `${datos.promedioEstrellas}` },
  ]);

  y = drawSectionHeading(doc, y, 'Diagnostico Grupal IA');
  y = drawInfoCard(doc, y, {
    title: 'Evaluacion General del Grupo',
    paragraphs: [datos.diagnosticoIA],
    bullets: datos.recomendacionesClave,
    bg: [240, 249, 255],
    border: [186, 230, 253],
    titleColor: [3, 105, 161],
  });

  y = drawSectionHeading(doc, y, 'Resumen Individual por Estudiante');

  const lista = datos.resumenesPorEstudiante || [];
  if (lista.length === 0) {
    y = drawInfoCard(doc, y, {
      title: 'Sin estudiantes asignados',
      paragraphs: ['No hay estudiantes asignados actualmente para este tutor.'],
      bg: [248, 250, 252],
      border: [203, 213, 225],
      titleColor: [71, 85, 105],
    });
  } else {
    lista.forEach((est) => {
      const metodosText =
        est.metodosEmplear && est.metodosEmplear.length > 0
          ? est.metodosEmplear
          : ['Reforzar practica guiada en sesiones cortas.'];

      y = drawInfoCard(doc, y, {
        title: `${est.nombre} (@${est.usuario}) - ${est.etiquetaNivel} | ${est.nivelesCompletados}/${est.totalNiveles} niveles (${est.porcentajeAvance}%) | ${est.estrellasTotales} estrellas`,
        paragraphs: [
          est.resumenIA,
          `Como mejorar: ${est.comoMejorar}`,
          `Fortaleza: ${est.fortalezaPrincipal}  |  Meta: ${est.metaRecomendada}`,
        ],
        bullets: metodosText,
        bg: [255, 255, 255],
        border: [203, 213, 225],
        titleColor: [15, 23, 42],
      });
    });
  }

  if (datos.ultimasPreguntasIA && datos.ultimasPreguntasIA.length > 0) {
    y = drawSectionHeading(doc, y, 'Ultimas Preguntas Calibradas por la IA');
    datos.ultimasPreguntasIA.slice(0, 8).forEach((q, idx) => {
      const correcta = q.opciones?.[q.indiceRespuestaCorrecta] ?? '';
      y = drawInfoCard(doc, y, {
        title: `Pregunta ${idx + 1} - ${q.planeta} (${q.materia}) | ${q.etiquetaNivel}`,
        paragraphs: [q.enunciado, `Respuesta correcta: ${correcta}`],
        bg: [248, 250, 252],
        border: [203, 213, 225],
        titleColor: [3, 105, 161],
      });
    });
  }

  addFooters(doc);

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  return {
    blobUrl,
    filename: `reporte_grupal_${slugifyFilename(datos.tutorNombre || 'tutor')}.pdf`,
    title: datos.tituloReporte || 'Reporte Grupal · Universo del Conocimiento',
  };
}
