'use client';

import { type CSSProperties, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../../lib/auth-store';
import { useSettingsStore } from '../../lib/settings-store';
import {
  guardarProgresoHibrido,
  hayConexionInternet,
} from '../../lib/offline-sync';
import {
  cachearPackIAOffline,
  obtenerBancoOfflineNaturae,
} from '../../lib/offline-questions';
import SoundTogglePill from '../../components/SoundTogglePill';
import Dado3D from './Dado3D';
import {
  playCorrect,
  playDiceLand,
  playDiceRoll,
  playIncorrect,
  playStarWin,
  playStep,
} from '../../lib/sound-engine';

interface NodoNaturae {
  index: number;
  numero: string;
  x: number;
  y: number;
  tipo: 'normal' | 'biocore' | 'reto' | 'boss';
  codigo: string;
}

interface PreguntaCiencias {
  pregunta: string;
  tema: string;
  opciones: string[];
  correcta: number;
  pista: string;
}

const TOTAL_NATURAE = 20;

// 20 casillas calibradas 1:1 exactamente sobre el centro del camino de piedra 3D (1200x896)
const COORDS_NATURAE: { x: number; y: number; codigo: string }[] = [
  { x: 920, y: 710, codigo: 'BIO-01' },
  { x: 840, y: 616, codigo: 'BIO-02' },
  { x: 760, y: 638, codigo: 'BIO-03' },
  { x: 672, y: 642, codigo: 'CEL' },
  { x: 590, y: 620, codigo: 'BIO-05' },
  { x: 546, y: 565, codigo: 'SOL' },
  { x: 576, y: 504, codigo: 'BIO-07' },
  { x: 636, y: 460, codigo: 'BIO-08' },
  { x: 702, y: 416, codigo: 'ECO' },
  { x: 758, y: 368, codigo: 'BIO-10' },
  { x: 794, y: 312, codigo: 'ENE' },
  { x: 768, y: 256, codigo: 'BIO-12' },
  { x: 702, y: 226, codigo: 'BIO-13' },
  { x: 628, y: 226, codigo: 'ORB' },
  { x: 562, y: 248, codigo: 'BIO-15' },
  { x: 502, y: 266, codigo: 'ATM' },
  { x: 446, y: 256, codigo: 'BIO-17' },
  { x: 398, y: 226, codigo: 'BIO-18' },
  { x: 362, y: 194, codigo: 'BIO-19' },
  { x: 332, y: 162, codigo: 'ADN' },
];

const BIOCORES_IDX = [3, 8, 13];
const RETOS_IDX = [5, 10, 15];

const NODOS_NATURAE: NodoNaturae[] = COORDS_NATURAE.map((c, idx) => ({
  index: idx,
  numero: String(idx + 1).padStart(2, '0'),
  x: c.x,
  y: c.y,
  codigo: c.codigo,
  tipo:
    idx === 19
      ? 'boss'
      : BIOCORES_IDX.includes(idx)
        ? 'biocore'
        : RETOS_IDX.includes(idx)
          ? 'reto'
          : 'normal',
}));

const PREGUNTAS_CIENCIAS: Record<number, PreguntaCiencias[]> = {
  10: [
    {
      pregunta: '¿Cuál es la unidad más pequeña que forma a todos los seres vivos?',
      tema: 'Célula Viva',
      opciones: ['La célula', 'El átomo de hierro', 'El cristal de sal', 'La molécula de aire'],
      correcta: 0,
      pista: 'Todos los animales y plantas están hechos de millones de estas unidades microscópicas.',
    },
    {
      pregunta: '¿Qué reino agrupa a los hongos, setas y levaduras?',
      tema: 'Reinos de la Naturaleza',
      opciones: ['Reino Vegetal', 'Reino Fungi', 'Reino Monera', 'Reino Protista'],
      correcta: 1,
      pista: 'Su nombre proviene del latín para referirse a los hongos.',
    },
    {
      pregunta: '¿Qué organelo exclusivo de las plantas realiza la fotosíntesis?',
      tema: 'Biología Vegetal',
      opciones: ['La mitocondria', 'El cloroplasto', 'El ribosoma', 'La vacuola digestiva'],
      correcta: 1,
      pista: 'Contiene clorofila, el pigmento verde que capta la luz solar.',
    },
    {
      pregunta: '¿Qué gas liberan las plantas al ambiente durante la fotosíntesis?',
      tema: 'Respiración y Vida',
      opciones: ['Dióxido de carbono', 'Oxígeno', 'Nitrógeno líquido', 'Metano'],
      correcta: 1,
      pista: 'Es el gas indispensable que respiramos todos los seres humanos.',
    },
    {
      pregunta: '¿Cómo se clasifican los animales que tienen columna vertebral?',
      tema: 'Reino Animal',
      opciones: ['Invertebrados', 'Vertebrados', 'Anélidos', 'Artrópodos'],
      correcta: 1,
      pista: 'Incluye peces, anfibios, reptiles, aves y mamíferos.',
    },
  ],
  11: [
    {
      pregunta: 'En un ecosistema, ¿qué organismos fabrican su propio alimento usando la luz solar?',
      tema: 'Cadenas Tróficas',
      opciones: ['Los descomponedores', 'Los productores', 'Los carnívoros', 'Los carroñeros'],
      correcta: 1,
      pista: 'Son las plantas y algas verdes en la base de la cadena alimenticia.',
    },
    {
      pregunta: '¿Qué nombre recibe el cambio de agua líquida a vapor por el calor del Sol?',
      tema: 'Ciclo del Agua',
      opciones: ['Condensación', 'Precipitación', 'Evaporación', 'Filtración'],
      correcta: 2,
      pista: 'Ocurre cuando el Sol calienta océanos, ríos y lagos.',
    },
    {
      pregunta: '¿Cuál es el órgano encargado de bombear la sangre por todo el cuerpo humano?',
      tema: 'Cuerpo Humano',
      opciones: ['El pulmón', 'El corazón', 'El estómago', 'El hígado'],
      correcta: 1,
      pista: 'Late rítmicamente en el centro-izquierda de nuestro pecho.',
    },
    {
      pregunta: '¿Qué insectos ayudan principalmente a polinizar las flores para que den frutos?',
      tema: 'Polinización',
      opciones: ['Las abejas y mariposas', 'Las lombrices de tierra', 'Las hormigas cortadoras', 'Los escorpiones'],
      correcta: 0,
      pista: 'Buscan néctar de flor en flor y transportan polen en sus patitas.',
    },
  ],
  12: [
    {
      pregunta: '¿Cuál es el planeta más cercano al Sol en nuestro Sistema Solar?',
      tema: 'Sistema Solar',
      opciones: ['Venus', 'Mercurio', 'Marte', 'Tierra'],
      correcta: 1,
      pista: 'Es el planeta rocoso más pequeño y veloz alrededor del Sol.',
    },
    {
      pregunta: '¿Qué movimiento de la Tierra dura 24 horas y produce el día y la noche?',
      tema: 'Movimientos Terrestres',
      opciones: ['Traslación', 'Rotación', 'Precesión', 'Órbita elíptica'],
      correcta: 1,
      pista: 'La Tierra gira sobre su propio eje como un trompo.',
    },
    {
      pregunta: '¿Qué fuente de energía renovable aprovecha la luz solar mediante paneles?',
      tema: 'Energías Limpias',
      opciones: ['Energía solar fotovoltaica', 'Energía térmica de carbón', 'Energía nuclear de fisión', 'Energía fósil'],
      correcta: 0,
      pista: 'Utiliza rayos del Sol y no contamina el ambiente.',
    },
    {
      pregunta: '¿Qué capa de gases rodea la Tierra y nos protege de los rayos solares dañinos?',
      tema: 'Atmósfera',
      opciones: ['La litosfera', 'La atmósfera', 'La hidrosfera', 'El manto terrestre'],
      correcta: 1,
      pista: 'Contiene el aire que respiramos y la capa de ozono.',
    },
  ],
};

function buildPathNaturae(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const PATH_NATURAE = buildPathNaturae(COORDS_NATURAE);

/** Explorador Bio-Espacial con alitas luminosas. */
const BioExplorerBot = memo(function BioExplorerBot({ caminando }: { caminando: boolean }) {
  return (
    <g transform="scale(1.16)">
      <ellipse cx="0" cy="4" rx="14" ry="5" fill="#011A14" opacity="0.58" />
      <ellipse cx="0" cy="4" rx="11" ry="3.8" fill="#00FF88" opacity="0.34">
        <animate attributeName="rx" values="9;14;9" dur="1.8s" repeatCount="indefinite" />
      </ellipse>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={caminando ? '0 0; 0 -7; 0 0' : '0 0; 0 -2.5; 0 0'}
          dur={caminando ? '0.26s' : '2.2s'}
          repeatCount="indefinite"
        />
        <path d="M-8,-22 Q-22,-32 -18,-16 Z" fill="#34D399" stroke="#ECFDF5" strokeWidth="1" opacity="0.9" />
        <path d="M8,-22 Q22,-32 18,-16 Z" fill="#34D399" stroke="#ECFDF5" strokeWidth="1" opacity="0.9" />
        <rect x="-11" y="-28" width="22" height="20" rx="8" fill="#ECFDF5" stroke="#065F46" strokeWidth="1.4" />
        <rect x="-8" y="-23" width="16" height="10" rx="4.5" fill="#022C22" stroke="#6EE7B7" strokeWidth="1.1" />
        <circle cx="-3.5" cy="-18" r="2" fill="#00FF88" />
        <circle cx="3.5" cy="-18" r="2" fill="#00FF88" />
        <line x1="0" y1="-28" x2="0" y2="-36" stroke="#6EE7B7" strokeWidth="1.8" />
        <circle cx="0" cy="-38" r="3.4" fill="#FDE047" />
        <rect x="-8" y="-8" width="6.5" height="6" rx="2.5" fill="#065F46" stroke="#A7F3D0" strokeWidth="1" />
        <rect x="1.5" y="-8" width="6.5" height="6" rx="2.5" fill="#065F46" stroke="#A7F3D0" strokeWidth="1" />
      </g>
    </g>
  );
});

const MapaNaturaeSVG = memo(function MapaNaturaeSVG({
  pos,
  caminando,
  santuarioListo,
}: {
  pos: number;
  caminando: boolean;
  santuarioListo: boolean;
}) {
  const actual = NODOS_NATURAE[Math.min(pos, NODOS_NATURAE.length - 1)];
  const boss = NODOS_NATURAE[19];

  return (
    <svg
      viewBox="0 0 1200 896"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      role="img"
      aria-label="Santuario 3D del Bosque Cósmico de Naturae"
    >
      <defs>
        <filter id="naturaeMaskBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <mask id="naturaeSeamlessMask">
          <path
            d="M 162 245 Q 230 35 510 42 Q 820 125 1030 365 Q 1045 725 720 865 Q 300 865 170 615 Q 152 420 162 245 Z"
            fill="white"
            filter="url(#naturaeMaskBlur)"
          />
        </mask>
      </defs>

      <image
        href="/images/naturae-island-render.jpg"
        x="0"
        y="0"
        width="1200"
        height="896"
        mask="url(#naturaeSeamlessMask)"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Flujo luminoso de savia energética por el sendero de piedra */}
      <path
        d={PATH_NATURAE}
        fill="none"
        stroke="#A7F3D0"
        strokeWidth="3.5"
        strokeDasharray="16 42"
        strokeLinecap="round"
        opacity="0.72"
      >
        <animate attributeName="stroke-dashoffset" from="580" to="0" dur="8.5s" repeatCount="indefinite" />
      </path>

      {/* Halo del Árbol de la Vida */}
      {(pos === 19 || santuarioListo) && (
        <ellipse
          cx={boss.x}
          cy={boss.y + 6}
          rx="42"
          ry="18"
          fill="none"
          stroke="#00FF88"
          strokeWidth="2.8"
          strokeOpacity="0.88"
        >
          <animate attributeName="rx" values="38;48;38" dur="1.8s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Etiqueta de la Cúpula del Árbol de la Vida */}
      <g transform={`translate(${boss.x} 64)`}>
        <rect
          x="-82"
          y="-13"
          width="164"
          height="26"
          rx="13"
          fill="#022C22"
          fillOpacity="0.9"
          stroke={pos === 19 || santuarioListo ? '#00FF88' : '#6EE7B7'}
          strokeWidth="1.4"
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="800"
          letterSpacing="1.6"
          fill="#ECFDF5"
        >
          ÁRBOL DE LA VIDA
        </text>
      </g>

      {/* 16 Nodos Bio-Cristalinos interactivos */}
      {NODOS_NATURAE.filter((n) => n.tipo !== 'boss').map((nodo) => {
        const activo = nodo.index === pos;
        const visitado = nodo.index < pos;
        const fill =
          nodo.tipo === 'biocore'
            ? '#059669'
            : nodo.tipo === 'reto'
              ? '#D97706'
              : visitado
                ? '#0D9488'
                : '#064E3B';
        const stroke =
          activo
            ? '#FFFFFF'
            : nodo.tipo === 'biocore'
              ? '#6EE7B7'
              : nodo.tipo === 'reto'
                ? '#FDE047'
                : '#5EEAD4';

        return (
          <g key={nodo.index}>
            {activo && (
              <ellipse
                cx={nodo.x}
                cy={nodo.y + 4}
                rx="30"
                ry="15"
                fill="none"
                stroke="#00FF88"
                strokeWidth="2.6"
              >
                <animate attributeName="stroke-opacity" values="0.95;0.35;0.95" dur="1.4s" repeatCount="indefinite" />
              </ellipse>
            )}
            <ellipse cx={nodo.x} cy={nodo.y + 4} rx="22" ry="11" fill="#011A14" opacity="0.6" />
            <ellipse
              cx={nodo.x}
              cy={nodo.y}
              rx="22"
              ry="11"
              fill={fill}
              fillOpacity="0.92"
              stroke={stroke}
              strokeWidth={activo ? 2.4 : 1.5}
            />
            <text
              x={nodo.x}
              y={nodo.y + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10.5"
              fontWeight="900"
              fill="#FFFFFF"
            >
              {nodo.numero}
            </text>
          </g>
        );
      })}

      {/* Explorador Bio-Espacial */}
      <g
        style={{
          transform: `translate3d(${actual.x}px, ${actual.y - 10}px, 0)`,
          transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        <BioExplorerBot caminando={caminando} />
      </g>
    </svg>
  );
});

export default function TableroNaturae({
  onPositionChange,
}: {
  onPositionChange?: (pos: number) => void;
}) {
  const params = useParams<{ levelId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const levelId = parseInt(params.levelId || '10', 10) || 10;

  const bank = useMemo(() => {
    const key = PREGUNTAS_CIENCIAS[levelId] ? levelId : 10;
    return PREGUNTAS_CIENCIAS[key];
  }, [levelId]);

  const [pos, setPos] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(1);
  const [caminando, setCaminando] = useState(false);
  const [bioCores, setBioCores] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [stars, setStars] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [aviso, setAviso] = useState('Lanza el dado cuántico para explorar el Bosque de Naturae.');

  const [preguntaActiva, setPreguntaActiva] = useState<PreguntaCiencias | null>(null);
  const [opcionElegida, setOpcionElegida] = useState<number | null>(null);
  const [estadoPregunta, setEstadoPregunta] = useState<'esperando' | 'correcta' | 'incorrecta'>('esperando');
  const [esJefeFinal, setEsJefeFinal] = useState(false);
  const [victoria, setVictoria] = useState(false);
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const qIndexRef = useRef(0);
  const colaNaturaeIARef = useRef<PreguntaCiencias[]>([]);
  const [nivelIA, setNivelIA] = useState<1 | 2 | 3>(1);
  const [rachaIA, setRachaIA] = useState(0);
  const bioCoresActivos = bioCores.filter(Boolean).length;
  const progresoPct = Math.round(((pos + 1) / TOTAL_NATURAE) * 100);
  const modalAbierto = Boolean(preguntaActiva) || victoria || mostrarGuia;

  useEffect(() => {
    const cargarOffline = async () => {
      const lista = await obtenerBancoOfflineNaturae(bank);
      lista.forEach((item) => {
        if (item?.pregunta) {
          colaNaturaeIARef.current.push({
            pregunta: item.pregunta,
            tema: item.tema,
            opciones: item.opciones,
            correcta: item.correcta,
            pista: item.pista,
          });
        }
      });
    };

    if (!hayConexionInternet()) {
      void cargarOffline();
      return;
    }

    void fetch('/api/tutor-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'preparar-tablero',
        planeta: 'Naturae',
        nivelActual: 1,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) {
          void cargarOffline();
          return;
        }
        void cachearPackIAOffline('Naturae', data);
        if (Array.isArray(data.preguntasNaturae)) {
          data.preguntasNaturae.forEach((p: any) => {
            if (p?.enunciado && Array.isArray(p?.opciones)) {
              colaNaturaeIARef.current.push({
                pregunta: p.enunciado,
                tema: p.etiquetaNivel || 'Tutor IA · Ciencias',
                opciones: p.opciones,
                correcta: Number(p.indiceRespuestaCorrecta) || 0,
                pista: p.pista || 'Analiza el fenómeno natural con calma.',
              });
            }
          });
        }
      })
      .catch(() => {
        void cargarOffline();
      });
  }, [bank]);

  const guardarProgreso = useCallback(
    async (okCount: number, totalCount: number) => {
      const userId = (user as { id?: string } | null)?.id;
      if (!userId || guardando) return;
      setGuardando(true);
      try {
        const pct = totalCount > 0 ? (okCount / totalCount) * 100 : 100;
        const estrellasReg = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
        const totalEstrellas = estrellasReg + 3;
        await guardarProgresoHibrido(String(userId), levelId, true, totalEstrellas);
      } catch (err) {
        console.error('Error guardando progreso Naturae:', err);
      } finally {
        setGuardando(false);
      }
    },
    [user, guardando, levelId],
  );

  const abrirReto = useCallback(
    (boss: boolean) => {
      const pregCola = colaNaturaeIARef.current.shift();
      const nextQ = pregCola || bank[qIndexRef.current % bank.length];
      if (!pregCola) qIndexRef.current += 1;
      setEsJefeFinal(boss);
      setOpcionElegida(null);
      setEstadoPregunta('esperando');
      setPreguntaActiva(nextQ);
    },
    [bank],
  );

  const handleIniciarSalto = useCallback(() => {
    if (rolling || caminando || modalAbierto) return;
    const roll = Math.floor(Math.random() * 4) + 1;
    setDiceResult(roll);
    setRolling(true);
    setAviso('Calculando salto bio-cósmico...');
    playDiceRoll();
  }, [rolling, caminando, modalAbierto]);

  const handleDadoCompletado = useCallback(() => {
    setRolling(false);
    playDiceLand();
    const destino = Math.min(TOTAL_NATURAE - 1, pos + diceResult);
    if (destino === pos) {
      abrirReto(true);
      return;
    }

    setCaminando(true);
    let step = pos;
    const timer = setInterval(() => {
      step += 1;
      setPos(step);
      onPositionChange?.(step);
      playStep();

      if (step >= destino) {
        clearInterval(timer);
        setCaminando(false);
        const nodo = NODOS_NATURAE[step];
        if (nodo.tipo === 'biocore') {
          const coreIdx = BIOCORES_IDX.indexOf(step);
          if (coreIdx >= 0) {
            setBioCores((prev) => {
              const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean];
              next[coreIdx] = true;
              return next;
            });
          }
          setStars((s) => s + 1);
          setAviso(`Bio-Núcleo encontrado (${nodo.codigo}). Responde para activarlo.`);
          abrirReto(false);
        } else if (nodo.tipo === 'boss') {
          setAviso('Has llegado al Árbol de la Vida. Supera el reto final.');
          abrirReto(true);
        } else {
          setAviso(`Casilla ${nodo.numero}: Desafío de ciencias.`);
          abrirReto(false);
        }
      }
    }, 260);
  }, [pos, diceResult, onPositionChange, abrirReto]);

  const handleConfirmarPregunta = useCallback(() => {
    if (!preguntaActiva || opcionElegida === null || estadoPregunta !== 'esperando') return;
    const ok = opcionElegida === preguntaActiva.correcta;
    const nextTotal = totalPreguntas + 1;
    const nextAciertos = ok ? aciertos + 1 : aciertos;
    setTotalPreguntas(nextTotal);
    if (ok) {
      setAciertos(nextAciertos);
      setStars((s) => s + 1);
      setEstadoPregunta('correcta');
      playCorrect();
    } else {
      setEstadoPregunta('incorrecta');
      playIncorrect();
    }

    const nuevaRacha = ok ? rachaIA + 1 : 0;
    setRachaIA(nuevaRacha);

    if (hayConexionInternet()) {
      void fetch('/api/tutor-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteNombre: user?.name || 'Explorador',
          planeta: 'Naturae',
          nivelActual: nivelIA,
          esCorrecta: ok,
          rachaAciertos: nuevaRacha,
          aciertos: nextAciertos,
          totalPreguntas: nextTotal,
          preguntaActual: preguntaActiva.pregunta,
          respuestaEstudiante: preguntaActiva.opciones[opcionElegida],
          respuestaCorrecta: preguntaActiva.opciones[preguntaActiva.correcta],
          modeloPreferido: 'gemini-4-hydrogen',
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.ok) {
            void cachearPackIAOffline('Naturae', data);
            if (data.nuevoNivel) setNivelIA(data.nuevoNivel);
            if (data.nuevaPregunta?.enunciado && Array.isArray(data.nuevaPregunta.opciones)) {
              colaNaturaeIARef.current.unshift({
                pregunta: data.nuevaPregunta.enunciado,
                tema: data.etiquetaNivel || 'Tutor IA · Ciencias',
                opciones: data.nuevaPregunta.opciones,
                correcta: Number(data.nuevaPregunta.indiceRespuestaCorrecta) || 0,
                pista: data.nuevaPregunta.pista || 'Analiza las pistas científicas.',
              });
            }
          }
        })
        .catch(() => {});
    }

    setTimeout(() => {
      setPreguntaActiva(null);
      if (esJefeFinal && ok) {
        playStarWin();
        setVictoria(true);
        guardarProgreso(nextAciertos, nextTotal);
      } else if (esJefeFinal && !ok) {
        setAviso('Casi lo logras. Lanza el dado o inténtalo de nuevo en la cúpula.');
      }
    }, 950);
  }, [preguntaActiva, opcionElegida, estadoPregunta, totalPreguntas, aciertos, esJefeFinal, guardarProgreso, rachaIA, user?.name, nivelIA]);

  const isEco = useSettingsStore((s) => s.designMode === 'eco');

  return (
    <div
      data-game-board="true"
      className="relative w-full h-full flex flex-col lg:flex-row overflow-hidden select-none"
      style={{
        background: isEco
          ? '#01120E'
          : 'radial-gradient(ellipse at 42% 46%, #032E24 0%, #011410 58%, #000707 100%)',
      }}
    >
      {/* Fondo de curvas 3D tornasol esmeralda de Naturae debajo del mapa */}
      <img
        src="/images/naturae-board-bg.jpg"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-center ${
          isEco ? 'opacity-80' : 'opacity-95 mix-blend-screen'
        }`}
      />

      {/* Destellos esmeralda sutiles en el espacio profundo (omitidos en Modo Ahorro) */}
      {!isEco && [
        { x: '8%', y: '18%', size: 6, color: 'rgba(110, 231, 183, 0.9)', dur: '5.8s', delay: '-1.0s' },
        { x: '70%', y: '14%', size: 6, color: 'rgba(253, 224, 171, 0.9)', dur: '6.6s', delay: '-2.9s' },
        { x: '10%', y: '80%', size: 6, color: 'rgba(45, 212, 191, 0.9)', dur: '6.1s', delay: '-3.8s' },
      ].map((g, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="tornasol-glint tornasol-glint-star"
          style={
            {
              left: g.x,
              top: g.y,
              width: `${g.size}px`,
              height: `${g.size}px`,
              '--glint-color': g.color,
              '--glint-peak': 0.55,
              '--glint-dur': g.dur,
              '--glint-delay': g.delay,
              background: `radial-gradient(circle, #FFFFFF 0%, ${g.color} 32%, transparent 74%)`,
            } as CSSProperties
          }
        />
      ))}

      {/* ── ESCENARIO PRINCIPAL DEL BOSQUE CÓSMICO 3D ── */}
      <div className="relative flex-1 h-[62vh] lg:h-full overflow-hidden flex items-center justify-center">
        <div className="absolute top-3.5 left-4 z-30 flex items-center">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="liquid-glass-pill flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm text-emerald-100 hover:text-white cursor-pointer"
          >
            <span className="text-[#00FF88]">←</span>
            <span>Mapa</span>
          </button>
        </div>

        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center pointer-events-none">
          <div
            className={`liquid-glass-pill px-6 sm:px-8 py-2 rounded-full flex items-center gap-3 ${isEco ? '' : 'backdrop-blur-md'}`}
            style={{
              background: isEco
                ? 'rgba(3, 38, 29, 0.92)'
                : 'linear-gradient(135deg, rgba(2, 44, 34, 0.58) 0%, rgba(6, 78, 59, 0.45) 100%)',
              borderColor: 'rgba(110, 231, 183, 0.48)',
              boxShadow: isEco
                ? '0 6px 16px rgba(0, 0, 0, 0.45)'
                : '0 12px 32px -12px rgba(0, 0, 0, 0.72), inset 0 0 16px rgba(0, 255, 136, 0.14)',
            }}
          >
            <span className="text-xs text-[#FDE047]">✦</span>
            <span
              className="text-xs sm:text-sm font-black tracking-[0.22em] text-white uppercase"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              BOSQUE CÓSMICO
            </span>
            <span className="text-xs text-[#00FF88]">✦</span>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center px-3 sm:px-5 pt-11 pb-11">
          <div className="w-full h-full max-w-[1140px] flex items-center justify-center mx-auto">
            <MapaNaturaeSVG
              pos={pos}
              caminando={caminando}
              santuarioListo={bioCoresActivos >= 3 || pos === 19}
            />
          </div>
        </div>

        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 max-w-[92%] sm:max-w-lg pointer-events-none">
          <div
            className={`px-6 py-2.5 rounded-full liquid-glass-pill flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-emerald-50 text-center ${isEco ? '' : 'backdrop-blur-md'}`}
            style={{
              background: isEco
                ? 'rgba(3, 32, 24, 0.94)'
                : 'linear-gradient(135deg, rgba(2, 34, 26, 0.68) 0%, rgba(4, 48, 36, 0.58) 100%)',
              borderColor: 'rgba(110, 231, 183, 0.36)',
            }}
          >
            <span className="text-[#00FF88]">✦</span>
            <span>{aviso}</span>
          </div>
        </div>
      </div>

      {/* ── HUD LATERAL DERECHO EN LIQUID GLASS ESMERALDA ── */}
      <aside className="relative z-30 w-full lg:w-[335px] xl:w-[355px] lg:h-full p-2.5 sm:p-3.5 flex flex-col justify-center shrink-0">
        <div
          className={`relative w-full h-full max-h-[820px] rounded-3xl liquid-glass liquid-glass-panel p-4 sm:p-5 flex flex-col justify-between overflow-x-clip overflow-y-auto ${isEco ? '' : 'backdrop-blur-lg'}`}
          style={{
            background: isEco
              ? 'rgba(2, 28, 22, 0.95)'
              : 'linear-gradient(165deg, rgba(2, 36, 28, 0.66) 0%, rgba(1, 22, 18, 0.78) 55%, rgba(1, 12, 10, 0.86) 100%)',
            borderColor: 'rgba(110, 231, 183, 0.38)',
            boxShadow: isEco
              ? '0 10px 24px rgba(0, 0, 0, 0.55)'
              : '0 24px 70px -24px rgba(0, 0, 0, 0.85), inset 0 0 24px rgba(0, 255, 136, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="relative text-center pt-0.5 pb-3 border-b border-emerald-300/15">
            <div className="absolute right-0 top-0">
              <SoundTogglePill />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-wider leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #6EE7B7 48%, #00FF88 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              NATURAE
            </h1>
            <p className="mt-1.5 text-[10px] font-bold tracking-[0.26em] text-[#6EE7B7] uppercase">
              SANTUARIO BIO-CÓSMICO
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#00FF88]/40 bg-[#022C22]/85 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#A7F3D0]">
              <span>Nivel {levelId} · Ciencias</span>
            </div>
          </div>

          <div
            className="relative my-2.5 py-4 rounded-2xl liquid-glass-pill flex flex-col items-center justify-center overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.24) 0%, rgba(2, 44, 34, 0.58) 70%, rgba(1, 20, 16, 0.78) 100%)',
              borderColor: 'rgba(110, 231, 183, 0.34)',
            }}
          >
            <div
              onClick={handleIniciarSalto}
              className={rolling || caminando || modalAbierto ? 'cursor-not-allowed' : 'cursor-pointer'}
            >
              <Dado3D
                size={88}
                rolling={rolling}
                result={diceResult}
                onRollComplete={handleDadoCompletado}
                faceColor="#065F46"
                borderColor="#6EE7B7"
                pipColor="#ECFDF5"
              />
            </div>
          </div>

          <div
            className="relative rounded-2xl liquid-glass p-3.5 sm:p-4 my-1"
            style={{
              background: 'linear-gradient(160deg, rgba(16, 185, 129, 0.1) 0%, rgba(2, 34, 26, 0.56) 100%)',
              borderColor: 'rgba(110, 231, 183, 0.28)',
            }}
          >
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold tracking-[0.18em] text-emerald-50 uppercase">PROGRESO</span>
                <span className="text-xs font-black text-[#6EE7B7]">
                  {progresoPct}% ({pos + 1}/{TOTAL_NATURAE})
                </span>
              </div>
              <div className="relative h-4 rounded-full bg-[#011812]/90 border border-emerald-300/20 p-0.5">
                <div
                  className="h-full rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.max(6, progresoPct)}%`,
                    background: 'linear-gradient(90deg, #059669 0%, #10B981 48%, #00FF88 100%)',
                  }}
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-[0.16em] text-emerald-50 uppercase">
                  BIO-NÚCLEOS
                </span>
                <span className="text-[10px] font-bold text-[#6EE7B7] liquid-glass-pill px-2.5 py-0.5 rounded-full">
                  {bioCoresActivos}/3 Esencias
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'CEL', label: 'Célula' },
                  { code: 'ECO', label: 'Ecosistema' },
                  { code: 'ORB', label: 'Cosmos' },
                ].map((item, idx) => {
                  const ok = bioCores[idx];
                  return (
                    <div
                      key={item.label}
                      className="rounded-xl p-2 flex flex-col items-center justify-center border transition-all"
                      style={{
                        borderColor: ok ? 'rgba(0, 255, 136, 0.65)' : 'rgba(110, 231, 183, 0.2)',
                        background: ok ? 'rgba(16, 185, 129, 0.24)' : 'rgba(1, 22, 16, 0.55)',
                      }}
                    >
                      <span
                        className="font-mono text-xs font-black tracking-wider"
                        style={{ color: ok ? '#00FF88' : '#64748B' }}
                      >
                        {item.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-100 mt-1">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 rounded-xl px-3.5 py-2 flex items-center justify-between bg-[#011812]/70 border border-emerald-400/20">
              <span className="text-xs font-bold text-emerald-100">★ Estrellas ganadas</span>
              <span className="text-sm font-black text-[#FDE047]">{stars}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <button
              type="button"
              onClick={handleIniciarSalto}
              disabled={rolling || caminando || modalAbierto}
              className="w-full py-3 rounded-2xl font-black text-sm tracking-[0.18em] uppercase transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 liquid-glass-btn text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.8) 0%, rgba(16, 185, 129, 0.72) 100%)',
                borderColor: 'rgba(167, 243, 208, 0.65)',
              }}
            >
              <span>{rolling ? 'CALCULANDO...' : caminando ? 'EXPLORANDO...' : 'INICIAR SALTO'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMostrarGuia(true)}
              className="w-full py-2.5 rounded-2xl font-bold text-xs tracking-[0.18em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 liquid-glass-pill text-emerald-100 hover:text-white"
            >
              <span>GUÍA DE CIENCIAS</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de Reto de Ciencias */}
      <AnimatePresence>
        {preguntaActiva && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg rounded-3xl p-6 bg-[#02231B]/95 border border-emerald-400/45 text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-200">
                  {esJefeFinal ? 'Reto Final: Árbol de la Vida' : preguntaActiva.tema}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-snug">{preguntaActiva.pregunta}</h3>
              <p className="text-xs text-emerald-200/80 bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-500/20">
                Pista: {preguntaActiva.pista}
              </p>
              <div className="space-y-2">
                {preguntaActiva.opciones.map((opt, idx) => {
                  const sel = opcionElegida === idx;
                  const isCorrect = estadoPregunta !== 'esperando' && idx === preguntaActiva.correcta;
                  const isWrong = estadoPregunta === 'incorrecta' && sel && idx !== preguntaActiva.correcta;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={estadoPregunta !== 'esperando'}
                      onClick={() => setOpcionElegida(idx)}
                      className="w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        borderColor: isCorrect
                          ? '#00FF88'
                          : isWrong
                            ? '#FB7185'
                            : sel
                              ? '#34D399'
                              : 'rgba(167, 243, 208, 0.22)',
                        background: isCorrect
                          ? 'rgba(16, 185, 129, 0.28)'
                          : isWrong
                            ? 'rgba(244, 63, 94, 0.24)'
                            : sel
                              ? 'rgba(52, 211, 153, 0.16)'
                              : 'rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={opcionElegida === null || estadoPregunta !== 'esperando'}
                onClick={handleConfirmarPregunta}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider disabled:opacity-45 cursor-pointer"
              >
                Confirmar respuesta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Guía */}
      <AnimatePresence>
        {mostrarGuia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMostrarGuia(false)}
            className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-6 bg-[#02231B]/95 border border-emerald-400/45 text-white space-y-3"
            >
              <h3 className="text-lg font-black text-emerald-200">Guía del Bosque Cósmico</h3>
              <p className="text-sm text-emerald-50/85">
                Lanza el dado cuántico para avanzar por el sendero luminoso hasta la cúpula del Árbol de la Vida (casilla 16).
              </p>
              <p className="text-sm text-emerald-50/85">
                Reúne las esencias de <strong>Célula (CEL)</strong>, <strong>Ecosistema (ECO)</strong> y <strong>Cosmos (ORB)</strong> respondiendo los retos de ciencias.
              </p>
              <button
                type="button"
                onClick={() => setMostrarGuia(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Victoria Final */}
      <AnimatePresence>
        {victoria && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-3xl p-7 bg-[#02231B]/95 border border-emerald-300/60 text-center text-white space-y-4">
              <div className="text-3xl font-black text-[#FDE047] tracking-widest">★ ★ ★</div>
              <h2 className="text-2xl font-black text-emerald-200">¡Santuario Naturae Restaurado!</h2>
              <p className="text-sm text-emerald-50/85">
                Respondiste correctamente {aciertos} de {totalPreguntas} retos científicos y llegaste al Árbol de la Vida.
              </p>
              <button
                type="button"
                onClick={() => {
                  router.refresh();
                  router.push('/dashboard');
                }}
                className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider cursor-pointer"
              >
                Volver al Mapa Estelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
