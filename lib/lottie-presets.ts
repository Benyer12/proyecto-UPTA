/**
 * Presets de animaciones Lottie (formato Bodymovin v5.7) embebidos localmente
 * para funcionar al 100% tanto en modo CLOUD como en modo PLUS (Offline),
 * optimizados para 60fps sin lag en Modo Style.
 */

export type LottiePresetName =
  | 'orbit'
  | 'pdf'
  | 'transition'
  | 'sparkle'
  | 'planet'
  | 'check'
  | 'gear'
  | 'sound'
  | 'gamepad';

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
            { ty: 'tm', s: { a: 0, k: 0 }, e: { a: 0, k: 68 }, o: { a: 0, k: 0 }, m: 1, nm: 'TrimOuter' },
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
            { ty: 'tm', s: { a: 0, k: 15 }, e: { a: 0, k: 75 }, o: { a: 0, k: 0 }, m: 1, nm: 'TrimInner' },
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
 * 2. PDF Scanner Loader (hoja PDF con haz de escaneo vertical)
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
 * 3. Cosmic Portal Transition (pulso rápido de transición)
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

/**
 * 4. Sparkle Star (estrella de 4 puntas con respiración suave)
 */
export const LOTTIE_SPARKLE_STAR: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 120,
  h: 120,
  nm: 'SparkleStar',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'StarMain',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [75], e: [100] },
            { t: 60, s: [100], e: [75] },
            { t: 120, s: [75] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [90] },
            { t: 120, s: [90] },
          ],
        },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [82, 82, 100], e: [108, 108, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 60, s: [108, 108, 100], e: [82, 82, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 120, s: [82, 82, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sr',
              sy: 1,
              d: 1,
              pt: { a: 0, k: 4 },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 0 },
              ir: { a: 0, k: 12 },
              is: { a: 0, k: 0 },
              or: { a: 0, k: 42 },
              os: { a: 0, k: 0 },
              nm: 'SparkleShape',
            },
            { ty: 'fl', c: { a: 0, k: [0.404, 0.91, 0.976, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'SparkleFill' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'SparkleGroup',
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
 * 5. Planet Orbit (planeta simple con anillo en rotación suave)
 */
export const LOTTIE_PLANET_ORBIT: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 150,
  w: 120,
  h: 120,
  nm: 'PlanetOrbit',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'PlanetRing',
      sr: 1,
      ks: {
        o: { a: 0, k: 95 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-18], e: [-12] },
            { t: 75, s: [-12], e: [-18] },
            { t: 150, s: [-18] },
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
            { ty: 'el', d: 1, s: { a: 0, k: [94, 30] }, p: { a: 0, k: [0, 0] }, nm: 'RingEllipse' },
            {
              ty: 'st',
              c: { a: 0, k: [0.847, 0.706, 0.996, 1] },
              o: { a: 0, k: 95 },
              w: { a: 0, k: 4 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'RingStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'RingGroup',
        },
      ],
      ip: 0,
      op: 150,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'PlanetBody',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [60, 62, 0], e: [60, 57, 0] },
            { t: 75, s: [60, 57, 0], e: [60, 62, 0] },
            { t: 150, s: [60, 62, 0] },
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
            { ty: 'el', d: 1, s: { a: 0, k: [48, 48] }, p: { a: 0, k: [0, 0] }, nm: 'BodyEllipse' },
            { ty: 'fl', c: { a: 0, k: [0.404, 0.91, 0.976, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'BodyFill' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'BodyGroup',
        },
      ],
      ip: 0,
      op: 150,
      st: 0,
      bm: 0,
    },
  ],
};

/**
 * 6. Mechanical Gear (engranaje simple con rotación fluida)
 */
export const LOTTIE_MECHANICAL_GEAR: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 180,
  w: 120,
  h: 120,
  nm: 'MechanicalGear',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'GearWheel',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 180, s: [360] },
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
            {
              ty: 'sr',
              sy: 1,
              d: 1,
              pt: { a: 0, k: 8 },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 0 },
              ir: { a: 0, k: 30 },
              is: { a: 0, k: 0 },
              or: { a: 0, k: 42 },
              os: { a: 0, k: 0 },
              nm: 'GearTeeth',
            },
            {
              ty: 'st',
              c: { a: 0, k: [1, 1, 1, 1] },
              o: { a: 0, k: 92 },
              w: { a: 0, k: 5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'GearStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'GearGroup',
        },
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [20, 20] }, p: { a: 0, k: [0, 0] }, nm: 'CenterHole' },
            {
              ty: 'st',
              c: { a: 0, k: [0.404, 0.91, 0.976, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'HoleStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'HoleGroup',
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
      bm: 0,
    },
  ],
};

/**
 * 7. Sound Wave (3 barras de audio animadas suavemente)
 */
export const LOTTIE_SOUND_WAVE: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 60,
  w: 120,
  h: 120,
  nm: 'SoundWave',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'BarLeft',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [34, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 50, 100], e: [100, 110, 100] },
            { t: 30, s: [100, 110, 100], e: [100, 50, 100] },
            { t: 60, s: [100, 50, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', d: 1, s: { a: 0, k: [12, 46] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 }, nm: 'Rect1' },
            { ty: 'fl', c: { a: 0, k: [0.404, 0.91, 0.976, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'Fill1' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'Bar1',
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'BarMid',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 115, 100], e: [100, 55, 100] },
            { t: 30, s: [100, 55, 100], e: [100, 115, 100] },
            { t: 60, s: [100, 115, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', d: 1, s: { a: 0, k: [12, 54] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 }, nm: 'Rect2' },
            { ty: 'fl', c: { a: 0, k: [0.431, 0.906, 0.718, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'Fill2' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'Bar2',
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'BarRight',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [86, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 65, 100], e: [100, 105, 100] },
            { t: 30, s: [100, 105, 100], e: [100, 65, 100] },
            { t: 60, s: [100, 65, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', d: 1, s: { a: 0, k: [12, 46] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 }, nm: 'Rect3' },
            { ty: 'fl', c: { a: 0, k: [0.404, 0.91, 0.976, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'Fill3' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'Bar3',
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
};

/**
 * 8. Gamepad / Arcade Pulse (cruz arcade pulsante)
 */
export const LOTTIE_GAMEPAD_PULSE: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 90,
  w: 120,
  h: 120,
  nm: 'GamepadPulse',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'ArcadeFrame',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-4], e: [4] },
            { t: 45, s: [4], e: [-4] },
            { t: 90, s: [-4] },
          ],
        },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [94, 94, 100], e: [104, 104, 100] },
            { t: 45, s: [104, 104, 100], e: [94, 94, 100] },
            { t: 90, s: [94, 94, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', d: 1, s: { a: 0, k: [76, 52] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 18 }, nm: 'PadBody' },
            {
              ty: 'st',
              c: { a: 0, k: [0.404, 0.91, 0.976, 1] },
              o: { a: 0, k: 95 },
              w: { a: 0, k: 4.5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'PadStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'PadGroup',
        },
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [12, 12] }, p: { a: 0, k: [-16, 0] }, nm: 'BtnLeft' },
            { ty: 'fl', c: { a: 0, k: [0.431, 0.906, 0.718, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'BtnLFill' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'BtnLGroup',
        },
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [12, 12] }, p: { a: 0, k: [16, 0] }, nm: 'BtnRight' },
            { ty: 'fl', c: { a: 0, k: [0.847, 0.706, 0.996, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'BtnRFill' },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'BtnRGroup',
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
 * 9. Check Pulse (círculo verde esmeralda con check suave)
 */
export const LOTTIE_CHECK_PULSE: Record<string, unknown> = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 90,
  w: 120,
  h: 120,
  nm: 'CheckPulse',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'CheckRing',
      sr: 1,
      ks: {
        o: { a: 0, k: 95 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [92, 92, 100], e: [104, 104, 100] },
            { t: 45, s: [104, 104, 100], e: [92, 92, 100] },
            { t: 90, s: [92, 92, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', d: 1, s: { a: 0, k: [76, 76] }, p: { a: 0, k: [0, 0] }, nm: 'Circle' },
            {
              ty: 'st',
              c: { a: 0, k: [0.431, 0.906, 0.718, 1] },
              o: { a: 0, k: 95 },
              w: { a: 0, k: 5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'RingStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'RingGroup',
        },
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              d: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-18, 2], [-4, 16], [20, -14]],
                  c: false,
                },
              },
              nm: 'CheckPath',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.431, 0.906, 0.718, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 6 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'CheckStroke',
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: 'CheckGroup',
        },
      ],
      ip: 0,
      op: 90,
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
    case 'sparkle':
      return LOTTIE_SPARKLE_STAR;
    case 'planet':
      return LOTTIE_PLANET_ORBIT;
    case 'check':
      return LOTTIE_CHECK_PULSE;
    case 'gear':
      return LOTTIE_MECHANICAL_GEAR;
    case 'sound':
      return LOTTIE_SOUND_WAVE;
    case 'gamepad':
      return LOTTIE_GAMEPAD_PULSE;
    case 'orbit':
    default:
      return LOTTIE_COSMIC_ORBIT_LOADER;
  }
}
