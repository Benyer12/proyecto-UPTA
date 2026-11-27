/**
 * Presets de animaciones Lottie (formato Bodymovin v5.7) embebidos localmente
 * para funcionar al 100% tanto en modo CLOUD como en modo PLUS (Offline).
 */

export type LottiePresetName = 'orbit' | 'pdf' | 'transition';

/**
 * 1. Orbital Cosmic Loader (anillos concéntricos + núcleo pulsante + satélite en órbita)
 */
export const LOTTIE_COSMIC_ORBIT_LOADER: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 120,
  h: 120,
  nm: 'CosmicOrbitLoader',
  ddd: 0,
  assets: [],
  layers: [
    // Capa 1: Núcleo pulsante cian
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'CorePulse',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [65], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 60, s: [100], e: [65], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 120, s: [65] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [82, 82, 100], e: [118, 118, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 60, s: [118, 118, 100], e: [82, 82, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 120, s: [82, 82, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [22, 22] }, p: { a: 0, k: [0, 0] }, nm: 'CoreEllipse' },
            { ty: 'fl', c: { a: 0, k: [0.404, 0.91, 0.976, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'CoreFill' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'CoreGroup',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    // Capa 2: Anillo exterior rotando + satélite
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'OuterOrbit',
      sr: 1,
      ks: {
        o: { a: 0, k: 95 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 120, s: [360] },
          ],
        },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, -44] }, nm: 'SatelliteDot' },
            { ty: 'fl', c: { a: 0, k: [0.431, 0.906, 0.718, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'SatFill' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'SatelliteGroup',
        },
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [88, 88] }, p: { a: 0, k: [0, 0] }, nm: 'OuterRingPath' },
            {
              ty: 'tm',
              s: { a: 0, k: 0 },
              e: { a: 0, k: 68 },
              o: { a: 0, k: 0 },
              m: 1,
              nm: 'TrimOuter',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.404, 0.91, 0.976, 1] },
              o: { a: 0, k: 90 },
              w: { a: 0, k: 4.5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'OuterStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'OuterRingGroup',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    // Capa 3: Anillo interior contra-rotando (violeta)
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'InnerOrbit',
      sr: 1,
      ks: {
        o: { a: 0, k: 85 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [360], e: [0] },
            { t: 120, s: [0] },
          ],
        },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [58, 58] }, p: { a: 0, k: [0, 0] }, nm: 'InnerRingPath' },
            {
              ty: 'tm',
              s: { a: 0, k: 15 },
              e: { a: 0, k: 75 },
              o: { a: 0, k: 0 },
              m: 1,
              nm: 'TrimInner',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.847, 0.706, 0.996, 1] },
              o: { a: 0, k: 90 },
              w: { a: 0, k: 3.5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'InnerStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'InnerRingGroup',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
  ],
};

/**
 * 2. PDF Scanner Loader (hoja PDF con haz de escaneo vertical y pulso luminoso)
 */
export const LOTTIE_PDF_SCAN_LOADER: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 90,
  w: 120,
  h: 120,
  nm: 'PdfScanLoader',
  ddd: 0,
  assets: [],
  layers: [
    // Haz de escaneo vertical
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'ScanBeam',
      sr: 1,
      ks: {
        o: { a: 0, k: 95 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [60, 34, 0], e: [60, 86, 0] },
            { t: 45, s: [60, 86, 0], e: [60, 34, 0] },
            { t: 90, s: [60, 34, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', d: 1, s: { a: 0, k: [52, 4] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 }, nm: 'BeamRect' },
            { ty: 'fl', c: { a: 0, k: [0.404, 0.91, 0.976, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'BeamFill' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'BeamGroup',
        },
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0,
    },
    // Marco del documento PDF
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'DocFrame',
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', d: 1, s: { a: 0, k: [56, 72] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 8 }, nm: 'DocRect' },
            {
              ty: 'st',
              c: { a: 0, k: [0.847, 0.706, 0.996, 1] },
              o: { a: 0, k: 95 },
              w: { a: 0, k: 3.5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'DocStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'DocGroup',
        },
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0,
    },
  ],
};

/**
 * 3. Cosmic Portal Transition (pulso rápido de transición entre páginas/secciones/modales)
 */
export const LOTTIE_PORTAL_TRANSITION: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 36,
  w: 120,
  h: 120,
  nm: 'CosmicPortalTransition',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'PortalWave',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [95], e: [100] },
            { t: 14, s: [100], e: [0] },
            { t: 36, s: [0] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [180] },
            { t: 36, s: [180] },
          ],
        },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [35, 35, 100], e: [125, 125, 100] },
            { t: 36, s: [125, 125, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [76, 76] }, p: { a: 0, k: [0, 0] }, nm: 'WaveRing' },
            {
              ty: 'st',
              c: { a: 0, k: [0.404, 0.91, 0.976, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'WaveStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'WaveGroup',
        },
      ],
      ip: 0,
      op: 36,
      st: 0,
      bm: 0,
    },
  ],
};

export function getLottiePresetData(preset: LottiePresetName): Record<string, unknown> {
  switch (preset) {
    case 'pdf':
      return LOTTIE_PDF_SCAN_LOADER;
    case 'transition':
      return LOTTIE_PORTAL_TRANSITION;
    case 'orbit':
    default:
      return LOTTIE_COSMIC_ORBIT_LOADER;
  }
}
