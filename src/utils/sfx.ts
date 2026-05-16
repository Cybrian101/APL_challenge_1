// Simple WebAudio-based SFX utilities (no external files required)
let audioCtx: AudioContext | null = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency: number, type = 'sine', duration = 0.12, gainVal = 0.08) {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type as OscillatorType;
  o.frequency.value = frequency;
  g.gain.value = gainVal;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  o.stop(ctx.currentTime + duration + 0.02);
}

export function playSuccess() {
  playTone(880, 'sine', 0.14, 0.09);
  setTimeout(() => playTone(1320, 'sine', 0.08, 0.06), 80);
}

export function playFail() {
  playTone(220, 'sawtooth', 0.14, 0.08);
}

export function playBurst() {
  for (let i = 0; i < 6; i++) {
    const freq = 500 + Math.random() * 900;
    setTimeout(() => playTone(freq, 'triangle', 0.12, 0.06), i * 25);
  }
}

export default { playSuccess, playFail, playBurst };
