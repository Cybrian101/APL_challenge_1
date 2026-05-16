'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type FanPulseSoundId = 'fire' | 'blast' | 'cheer' | 'shock' | 'cricket' | 'celebrate';

type HowlInstance = {
  play: () => number;
  stop: () => unknown;
  volume: (value?: number) => number | unknown;
  rate: (value?: number) => number | unknown;
};

const SOUND_SOURCES: Record<FanPulseSoundId, { src: string; volume: number; rate?: number; fallback: 'fire' | 'hit' | 'cheer' | 'shock' }> = {
  fire: { src: '/audio/fan-pulse/fire.mp3', volume: 0.54, fallback: 'fire' },
  blast: { src: '/audio/fan-pulse/blast-hit.mp3', volume: 0.7, rate: 0.95, fallback: 'hit' },
  cheer: { src: '/audio/fan-pulse/cheer.mp3', volume: 0.5, fallback: 'cheer' },
  shock: { src: '/audio/fan-pulse/shock.mp3', volume: 0.72, fallback: 'shock' },
  cricket: { src: '/audio/fan-pulse/blast-hit.mp3', volume: 0.62, rate: 1.18, fallback: 'hit' },
  celebrate: { src: '/audio/fan-pulse/celebrate.mp3', volume: 0.46, fallback: 'cheer' },
};

export function useFanPulseAudio() {
  const [enabled, setEnabled] = useState(false);
  const soundsRef = useRef<Partial<Record<FanPulseSoundId, HowlInstance>>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  const unlock = useCallback(async () => {
    if (enabled) return;
    const [{ Howl, Howler }] = await Promise.all([import('howler')]);
    audioCtxRef.current = Howler.ctx ?? new AudioContext();
    await audioCtxRef.current.resume();

    soundsRef.current = Object.fromEntries(
      Object.entries(SOUND_SOURCES).map(([id, config]) => [
        id,
        new Howl({
          src: [config.src],
          volume: config.volume,
          rate: config.rate ?? 1,
          preload: true,
          html5: false,
        }),
      ])
    ) as Partial<Record<FanPulseSoundId, HowlInstance>>;
    setEnabled(true);
  }, [enabled]);

  const play = useCallback(async (id: FanPulseSoundId) => {
    if (!enabled) {
      await unlock();
    }

    const sound = soundsRef.current[id];
    if (sound) {
      sound.stop();
      sound.play();
      return;
    }

    playFallback(audioCtxRef.current, SOUND_SOURCES[id].fallback);
  }, [enabled, unlock]);

  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach((sound) => sound?.stop());
    };
  }, []);

  return { enabled, unlock, play };
}

function playFallback(ctx: AudioContext | null, type: 'fire' | 'hit' | 'cheer' | 'shock') {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type === 'shock' ? 'sine' : type === 'hit' ? 'square' : 'triangle';
  osc.frequency.value = type === 'fire' ? 120 : type === 'hit' ? 180 : type === 'shock' ? 640 : 360;
  gain.gain.value = 0.0001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(type === 'shock' ? 0.06 : 0.045, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
  osc.stop(ctx.currentTime + 0.32);
}
