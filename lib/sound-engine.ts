'use client';

import { useSoundStore } from './sound-store';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (useSoundStore.getState().muted) return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  {
    freq,
    endFreq,
    startOffset = 0,
    duration = 0.14,
    gain = 0.08,
    type = 'sine',
  }: {
    freq: number;
    endFreq?: number;
    startOffset?: number;
    duration?: number;
    gain?: number;
    type?: OscillatorType;
  },
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
  }

  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + Math.min(0.018, duration * 0.25));
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(amp);
  amp.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Sonido suave de confirmación al activar el audio */
export function playSoundEnabledChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, { freq: 587.33, duration: 0.12, gain: 0.065, type: 'sine' });
  playTone(ctx, { freq: 880, startOffset: 0.07, duration: 0.18, gain: 0.07, type: 'triangle' });
}

/** Serie de golpecitos cristalinos suaves al lanzar el dado 3D */
export function playDiceRoll() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const taps = [
    { t: 0.0, f: 420 },
    { t: 0.065, f: 510 },
    { t: 0.14, f: 460 },
    { t: 0.23, f: 560 },
    { t: 0.34, f: 495 },
  ];
  taps.forEach(({ t, f }) => {
    playTone(ctx, {
      freq: f,
      endFreq: f * 0.72,
      startOffset: t,
      duration: 0.055,
      gain: 0.055,
      type: 'triangle',
    });
  });
}

/** Campanilla cálida cuando el dado cae en su número */
export function playDiceLand() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, { freq: 523.25, duration: 0.16, gain: 0.075, type: 'sine' });
  playTone(ctx, { freq: 783.99, startOffset: 0.05, duration: 0.22, gain: 0.06, type: 'triangle' });
}

/** Toque corto y amable al avanzar una casilla */
export function playStep() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, {
    freq: 440,
    endFreq: 540,
    duration: 0.07,
    gain: 0.045,
    type: 'sine',
  });
}

/** Acorde ascendente alegre al acertar una cápsula o reto */
export function playCorrect() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, { freq: 523.25, startOffset: 0.0, duration: 0.16, gain: 0.075, type: 'sine' });
  playTone(ctx, { freq: 659.25, startOffset: 0.08, duration: 0.18, gain: 0.08, type: 'sine' });
  playTone(ctx, { freq: 783.99, startOffset: 0.16, duration: 0.28, gain: 0.085, type: 'triangle' });
}

/** Tono suave y amable (sin bocina brusca) cuando toca reintentar */
export function playIncorrect() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, {
    freq: 330,
    endFreq: 293.66,
    startOffset: 0.0,
    duration: 0.16,
    gain: 0.06,
    type: 'sine',
  });
  playTone(ctx, {
    freq: 261.63,
    startOffset: 0.12,
    duration: 0.22,
    gain: 0.055,
    type: 'triangle',
  });
}

/** Arpegio celestial brillante al ganar estrellas o vencer al Guardián */
export function playStarWin() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
  notes.forEach((freq, idx) => {
    playTone(ctx, {
      freq,
      startOffset: idx * 0.085,
      duration: idx === notes.length - 1 ? 0.48 : 0.2,
      gain: idx === notes.length - 1 ? 0.095 : 0.075,
      type: idx % 2 === 0 ? 'sine' : 'triangle',
    });
  });
}
