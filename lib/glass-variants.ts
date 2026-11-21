export type FrostGlassVariant = 'clear' | 'frosted' | 'subtle' | 'liquid' | 'liquid-refract';
export type FrostGlassVariantProp = { glassVariant?: FrostGlassVariant };

export const liquidRefractStyles = 'bg-transparent border-0 shadow-none';

/**
 * Variantes de superficie glasscn calibradas para el entorno cósmico oscuro del proyecto.
 * Incluyen el sistema completo: clear, frosted, subtle, liquid (puro CSS) y liquid-refract (SVG).
 */
export const glassVariantStyles: Record<FrostGlassVariant, string> = {
  clear: [
    'backdrop-blur-[4px] backdrop-saturate-[1.9]',
    'bg-black/[0.26]',
    'border border-white/[0.16]',
    'shadow-[0_4px_18px_rgba(0,0,0,0.34),inset_0_1px_0_0_rgba(255,255,255,0.22)]',
  ].join(' '),
  frosted: [
    'backdrop-blur-[16px] backdrop-saturate-[1.65]',
    'bg-[#080d1d]/[0.62]',
    'border border-white/[0.14]',
    'shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.22)]',
  ].join(' '),
  subtle: [
    'backdrop-blur-[6px] backdrop-saturate-[1.55]',
    'bg-[#070c1b]/[0.58]',
    'border border-white/[0.10]',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_-10px_20px_-10px_rgba(140,190,255,0.12)]',
  ].join(' '),
  liquid: [
    // 1) Lente refractiva glasscn: deja respirar las partículas con saturación elevada
    'backdrop-blur-[12px] backdrop-saturate-[1.75] backdrop-brightness-[1.02]',
    // 2) Tinte base translúcido para legibilidad WCAG AA sobre fondo espacial
    'bg-[#080d1e]/[0.54]',
    // 3) Brillo radial superior izquierdo + cáustica inferior derecha + lavado vertical
    '[background-image:radial-gradient(120%_85%_at_15%_8%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.06)_40%,rgba(255,255,255,0)_70%),radial-gradient(110%_80%_at_85%_100%,rgba(120,170,255,0.16)_0%,rgba(0,0,0,0)_60%),linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(5,9,22,0.34)_100%)]',
    '[background-size:200%_200%,180%_180%,100%_100%]',
    '[background-repeat:no-repeat]',
    // 4) Bisel flotante multicapa (hairline superior, brillo ojo de pez inferior, rieles laterales y halo externo)
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-14px_28px_-10px_rgba(180,210,255,0.22),inset_1px_0_0_0_rgba(255,255,255,0.12),inset_-1px_0_0_0_rgba(255,255,255,0.09),0_28px_70px_-18px_rgba(0,0,0,0.62),0_10px_28px_-10px_rgba(0,0,0,0.44)]',
    // 5) Borde exterior fino del chaflán
    'border border-white/[0.14]',
    // 6) Deriva ambiental líquida lenta (respeta prefers-reduced-motion)
    'animate-[liquid-drift_18s_ease-in-out_infinite] motion-reduce:animate-none',
    '[will-change:background-position]',
  ].join(' '),
  'liquid-refract': '',
};

const SCRIM_SAMPLES = 16;
const SCRIM_HOLD_RATIO = 0.3;

/**
 * Curva quíntica smootherstep de glasscn para velos oscuros sin bandas de Mach.
 */
export function scrimGradient(to: 'bottom' | 'top', opacity = 0.72, coverage = 1) {
  const hold = coverage * SCRIM_HOLD_RATIO;
  const stops = [`rgba(4,7,18,${opacity}) 0%`];
  for (let i = 0; i <= SCRIM_SAMPLES; i += 1) {
    const t = i / SCRIM_SAMPLES;
    const eased = t * t * t * (t * (t * 6 - 15) + 10);
    const position = hold + t * (coverage - hold);
    stops.push(
      `rgba(4,7,18,${(opacity * (1 - eased)).toFixed(3)}) ${(position * 100).toFixed(1)}%`,
    );
  }
  return `linear-gradient(to ${to}, ${stops.join(', ')})`;
}
