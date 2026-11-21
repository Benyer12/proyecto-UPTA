export type FrostGlassVariant = 'clear' | 'frosted' | 'subtle' | 'liquid' | 'liquid-refract';
export type FrostGlassVariantProp = { glassVariant?: FrostGlassVariant };

export const liquidRefractStyles = 'bg-transparent border-0 shadow-none';

/**
 * Variantes glasscn fieles a glasscn-components.vercel.app (modo oscuro cristalino):
 * alta transparencia real, bordes hairline finos y cero velo gris opaco.
 */
export const glassVariantStyles: Record<FrostGlassVariant, string> = {
  clear: [
    'backdrop-blur-[2px] backdrop-saturate-[1.8]',
    'bg-black/[0.22]',
    'border border-white/[0.11]',
    'shadow-[0_1px_12px_rgba(0,0,0,0.22)]',
  ].join(' '),
  frosted: [
    'backdrop-blur-[12px] backdrop-saturate-[1.55]',
    'bg-black/[0.32]',
    'border border-white/[0.10]',
    'shadow-[0_4px_24px_rgba(0,0,0,0.34)]',
  ].join(' '),
  subtle: [
    'backdrop-blur-[3px] backdrop-saturate-[1.4]',
    'bg-white/[0.04]',
    'border border-white/[0.08]',
  ].join(' '),
  liquid: [
    'backdrop-blur-[6px] backdrop-saturate-[1.55] backdrop-brightness-[0.98]',
    'bg-white/[0.035]',
    '[background-image:radial-gradient(120%_85%_at_15%_8%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.02)_40%,rgba(255,255,255,0)_70%),radial-gradient(110%_80%_at_85%_100%,rgba(120,170,255,0.08)_0%,rgba(0,0,0,0)_60%),linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0.22)_100%)]',
    '[background-size:200%_200%,180%_180%,100%_100%]',
    '[background-repeat:no-repeat]',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),inset_0_-10px_22px_-12px_rgba(180,210,255,0.12),0_24px_80px_-42px_rgba(0,0,0,0.68)]',
    'border border-white/[0.10]',
    'animate-[liquid-drift_18s_ease-in-out_infinite] motion-reduce:animate-none',
    '[will-change:background-position]',
  ].join(' '),
  'liquid-refract': '',
};

const SCRIM_SAMPLES = 16;
const SCRIM_HOLD_RATIO = 0.3;

export function scrimGradient(to: 'bottom' | 'top', opacity = 0.56, coverage = 1) {
  const hold = coverage * SCRIM_HOLD_RATIO;
  const stops = [`rgba(0,0,0,${opacity}) 0%`];
  for (let i = 0; i <= SCRIM_SAMPLES; i += 1) {
    const t = i / SCRIM_SAMPLES;
    const eased = t * t * t * (t * (t * 6 - 15) + 10);
    const position = hold + t * (coverage - hold);
    stops.push(
      `rgba(0,0,0,${(opacity * (1 - eased)).toFixed(3)}) ${(position * 100).toFixed(1)}%`,
    );
  }
  return `linear-gradient(to ${to}, ${stops.join(', ')})`;
}
