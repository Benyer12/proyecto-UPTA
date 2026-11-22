'use client';

import { useEffect, useState } from 'react';
import { LiquidGlass } from './ui/glasscn/liquid-glass';
import RoleAvatar from './RoleAvatar';
import { playCorrect, playIncorrect } from '../lib/sound-engine';
import type {
  NivelDificultadIA,
  PlanetaTutorIA,
  PreguntaGeneradaIA,
  RespuestaTutorIA,
} from '../lib/ai-tutor';

const PLANETAS: PlanetaTutorIA[] = ['Numérix', 'Letralia', 'Naturae'];

export default function StudentTutorIACard({
  studentName,
}: {
  studentName: string;
}) {
  const [planetaActivo, setPlanetaActivo] = useState<PlanetaTutorIA>('Numérix');
  const [nivelActual, setNivelActual] = useState<NivelDificultadIA>(1);
  const [etiquetaNivel, setEtiquetaNivel] = useState('Nivel 1 · Base Orbital');
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [total, setTotal] = useState(0);
  const [mensajeTutor, setMensajeTutor] = useState(
    `¡Hola, ${studentName}! Soy tu Tutor IA Gemma 4 en la nube. Responde o pídeme una pregunta nueva.`,
  );
  const [preguntaActiva, setPreguntaActiva] = useState<PreguntaGeneradaIA | null>(null);
  const [opcionElegida, setOpcionElegida] = useState<number | null>(null);
  const [estadoRespuesta, setEstadoRespuesta] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [cargando, setCargando] = useState(false);
  const [generandoPregunta, setGenerandoPregunta] = useState(false);
  const [totalEnJson, setTotalEnJson] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/tutor-ia')
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.preguntas) && data.preguntas.length > 0) {
          setTotalEnJson(data.totalPreguntas ?? data.preguntas.length);
          const delPlaneta =
            data.preguntas.find((p: PreguntaGeneradaIA) => p.planeta === 'Numérix') ||
            data.preguntas[0];
          setPreguntaActiva(delPlaneta);
        }
      })
      .catch(() => {});
  }, []);

  const cambiarPlaneta = async (nuevoPlaneta: PlanetaTutorIA) => {
    setPlanetaActivo(nuevoPlaneta);
    setOpcionElegida(null);
    setEstadoRespuesta('idle');
    try {
      const res = await fetch(`/api/tutor-ia?planeta=${encodeURIComponent(nuevoPlaneta)}`);
      const data = await res.json();
      if (data?.ok && Array.isArray(data.preguntas) && data.preguntas.length > 0) {
        setPreguntaActiva(data.preguntas[0]);
      } else {
        await pedirNuevaPreguntaIA(nuevoPlaneta);
      }
    } catch {}
  };

  const pedirNuevaPreguntaIA = async (planetaDestino: PlanetaTutorIA = planetaActivo) => {
    if (generandoPregunta || cargando) return;
    setGenerandoPregunta(true);
    setOpcionElegida(null);
    setEstadoRespuesta('idle');
    try {
      const res = await fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generar-pregunta',
          planeta: planetaDestino,
          nivelActual,
        }),
      });
      const data = await res.json();
      if (data?.ok && data.nuevaPregunta) {
        setPreguntaActiva(data.nuevaPregunta);
        if (typeof data.totalPreguntasEnJson === 'number') {
          setTotalEnJson(data.totalPreguntasEnJson);
        }
        setMensajeTutor(
          `¡Creé una nueva pregunta de ${planetaDestino} (${etiquetaNivel}) y la guardé en preguntas-ia.json!`,
        );
      }
    } catch {
      // Mantiene pregunta actual si hay fallo de red
    } finally {
      setGenerandoPregunta(false);
    }
  };

  const verificarConTutorIA = async (idx: number) => {
    if (!preguntaActiva || cargando || estadoRespuesta !== 'idle') return;
    setOpcionElegida(idx);
    const esCorrecta = idx === preguntaActiva.indiceRespuestaCorrecta;
    setEstadoRespuesta(esCorrecta ? 'correct' : 'incorrect');
    if (esCorrecta) playCorrect();
    else playIncorrect();

    const nuevaRacha = esCorrecta ? racha + 1 : 0;
    const nuevosAciertos = esCorrecta ? aciertos + 1 : aciertos;
    const nuevoTotal = total + 1;
    setRacha(nuevaRacha);
    setAciertos(nuevosAciertos);
    setTotal(nuevoTotal);
    setCargando(true);

    try {
      const res = await fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteNombre: studentName,
          planeta: planetaActivo,
          nivelActual,
          esCorrecta,
          rachaAciertos: nuevaRacha,
          aciertos: nuevosAciertos,
          totalPreguntas: nuevoTotal,
          preguntaActual: preguntaActiva.enunciado,
          respuestaEstudiante: preguntaActiva.opciones[idx],
          respuestaCorrecta: preguntaActiva.opciones[preguntaActiva.indiceRespuestaCorrecta],
        }),
      });

      const data: RespuestaTutorIA & { totalPreguntasEnJson?: number } = await res.json();
      if (data?.ok) {
        setNivelActual(data.nuevoNivel);
        setEtiquetaNivel(data.etiquetaNivel);
        setMensajeTutor(data.mensajeTutor);
        if (typeof data.totalPreguntasEnJson === 'number') {
          setTotalEnJson(data.totalPreguntasEnJson);
        }
        try {
          const prevRaw = window.localStorage.getItem('universo-reportes-ia');
          const prev = prevRaw ? JSON.parse(prevRaw) : [];
          const next = [data.resumenProfesor, ...(Array.isArray(prev) ? prev : [])].slice(0, 20);
          window.localStorage.setItem('universo-reportes-ia', JSON.stringify(next));
        } catch {}

        setTimeout(() => {
          setPreguntaActiva(data.nuevaPregunta);
          setOpcionElegida(null);
          setEstadoRespuesta('idle');
        }, 1500);
      }
    } catch {
      setTimeout(() => {
        setOpcionElegida(null);
        setEstadoRespuesta('idle');
      }, 1500);
    } finally {
      setCargando(false);
    }
  };

  return (
    <LiquidGlass
      blur={2}
      refraction={22}
      bezel={0.36}
      saturation={1.65}
      className="rounded-3xl bg-[#050a18]/[0.38] border-white/[0.16] p-5 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32)]"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3.5">
          <RoleAvatar role="tutor" name="Tutor IA Gemma 4" size={44} />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#67E8F9]">
                Tutor IA · Gemma 4 Cloud
              </span>
              <span className="rounded-full border border-[#6EE7B7]/35 bg-[#041B14]/75 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#6EE7B7]">
                {etiquetaNivel}
              </span>
              {totalEnJson !== null && (
                <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 font-mono text-[10px] text-white/65">
                  {totalEnJson} en preguntas-ia.json
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/85 leading-snug">{mensajeTutor}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-center shrink-0">
          {PLANETAS.map((p) => {
            const activo = planetaActivo === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => cambiarPlaneta(p)}
                className={`min-h-[34px] px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  activo
                    ? 'bg-white text-black'
                    : 'border border-white/12 bg-white/[0.05] text-white/75 hover:text-white'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => pedirNuevaPreguntaIA(planetaActivo)}
            disabled={generandoPregunta || cargando}
            className="min-h-[34px] px-3.5 py-1 rounded-full border border-[#67E8F9]/40 bg-[#041724]/80 hover:bg-[#041724] text-xs font-semibold text-[#67E8F9] transition-colors cursor-pointer disabled:opacity-50"
          >
            {generandoPregunta ? 'Creando...' : '+ Nueva pregunta IA'}
          </button>
        </div>
      </div>

      {preguntaActiva && (
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/50">
              Reto adaptativo en vivo · {preguntaActiva.planeta}
            </div>
            <p className="text-sm sm:text-base font-bold text-white">
              {preguntaActiva.enunciado}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            {preguntaActiva.opciones.map((op, idx) => {
              const seleccionada = opcionElegida === idx;
              const esCorrecta = idx === preguntaActiva.indiceRespuestaCorrecta;
              let btnStyle =
                'border-white/14 bg-white/[0.06] text-white hover:bg-white/[0.12]';
              if (estadoRespuesta !== 'idle' && seleccionada) {
                btnStyle = esCorrecta
                  ? 'border-emerald-400/70 bg-emerald-500/25 text-[#6EE7B7]'
                  : 'border-rose-400/70 bg-rose-500/25 text-rose-200';
              }

              return (
                <button
                  key={`${preguntaActiva.id}-${idx}`}
                  type="button"
                  disabled={cargando || estadoRespuesta !== 'idle'}
                  onClick={() => verificarConTutorIA(idx)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${btnStyle}`}
                >
                  {op}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </LiquidGlass>
  );
}
