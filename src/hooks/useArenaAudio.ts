'use client';

import { useEffect, useRef } from 'react';
import { Ball, MatchPhase } from '@/types/match';

interface ArenaAudioInput {
  momentumValue: number;
  crowdEnergy: number;
  lastTrigger?: string;
  lastBall?: Ball | null;
  phase?: MatchPhase;
}

type HowlerModule = {
  Howler: {
    ctx?: AudioContext;
    volume: (value?: number) => number;
  };
};

export function useArenaAudio({ momentumValue, crowdEnergy, lastTrigger, lastBall, phase }: ArenaAudioInput) {
  const audioRef = useRef<{
    ctx: AudioContext;
    master: GainNode;
    hum: OscillatorNode;
    humGain: GainNode;
    noiseGain: GainNode;
    noiseSource: AudioBufferSourceNode;
  } | null>(null);
  const unlockedRef = useRef(false);
  const lastBallIdRef = useRef<string | null>(null);
  const lastPhaseRef = useRef<MatchPhase | undefined>(undefined);

  useEffect(() => {
    let disposed = false;

    async function unlockAudio() {
      if (unlockedRef.current || disposed) return;

      const { Howler } = (await import('howler')) as HowlerModule;
      const ctx = Howler.ctx ?? new AudioContext();
      await ctx.resume();
      Howler.volume(0.55);

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);

      const hum = ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.value = 72;

      const humGain = ctx.createGain();
      humGain.gain.value = 0.0001;
      hum.connect(humGain);
      humGain.connect(master);
      hum.start();

      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const channel = noiseBuffer.getChannelData(0);
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1 * 0.16;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 900;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.0001;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noiseSource.start();

      audioRef.current = { ctx, master, hum, humGain, noiseGain, noiseSource };
      unlockedRef.current = true;
      speak('Arena audio online. Voice director standing by.');
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('pointerdown', unlockAudio);
      if (audioRef.current) {
        audioRef.current.master.gain.setTargetAtTime(0.0001, audioRef.current.ctx.currentTime, 0.08);
        audioRef.current.hum.stop(audioRef.current.ctx.currentTime + 0.12);
        audioRef.current.noiseSource.stop(audioRef.current.ctx.currentTime + 0.12);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = audio.ctx;
    const pressure = momentumValue / 100;
    audio.master.gain.setTargetAtTime(0.035 + crowdEnergy * 0.03, ctx.currentTime, 0.35);
    audio.hum.frequency.setTargetAtTime(54 + pressure * 46, ctx.currentTime, 0.45);
    audio.humGain.gain.setTargetAtTime(0.035 + pressure * 0.035, ctx.currentTime, 0.3);
    audio.noiseGain.gain.setTargetAtTime(0.012 + crowdEnergy * 0.04, ctx.currentTime, 0.45);
  }, [crowdEnergy, momentumValue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !lastBall || lastBallIdRef.current === lastBall.id) return;
    lastBallIdRef.current = lastBall.id;

    const isAudibleMoment =
      lastTrigger === 'six' ||
      lastTrigger === 'boundary' ||
      lastTrigger === 'wicket' ||
      lastTrigger === 'wide' ||
      lastTrigger === 'noball' ||
      lastBall.isDot ||
      lastBall.runs > 0;
    if (!isAudibleMoment) return;

    const ctx = audio.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = lastTrigger === 'wicket' ? 'sawtooth' : 'triangle';
    osc.frequency.value = lastTrigger === 'wicket' ? 96 : lastTrigger === 'six' ? 220 : 164;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(lastTrigger === 'wicket' ? 0.08 : 0.06, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
    osc.stop(ctx.currentTime + 0.5);

    speak(buildBallVoiceLine(lastBall, lastTrigger, momentumValue));
  }, [lastBall, lastTrigger, momentumValue]);

  useEffect(() => {
    if (!phase || lastPhaseRef.current === phase) return;
    lastPhaseRef.current = phase;
    if (phase === 'drs_review') speak('Decision review active. The stadium is waiting for the verdict.');
    if (phase === 'over_break') speak('Over break. Prediction window and crowd pulse are open.');
  }, [phase]);
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 0.82;
  utterance.volume = 0.72;
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => /english|india|male|neural|premium/i.test(`${voice.name} ${voice.lang}`));
  if (preferredVoice) utterance.voice = preferredVoice;
  window.speechSynthesis.speak(utterance);
}

function buildBallVoiceLine(ball: Ball, trigger: string | undefined, momentumValue: number) {
  if (trigger === 'six' || ball.runs === 6) return `Six. ${ball.batsmanName} detonates the arena. Momentum at ${Math.round(momentumValue)} percent.`;
  if (trigger === 'boundary' || ball.runs === 4) return `Boundary. ${ball.batsmanName} opens the field and the crowd lifts.`;
  if (trigger === 'wicket' || ball.isWicket) return `Wicket. ${ball.bowlerName} breaks through. Pressure flips instantly.`;
  if (trigger === 'wide') return 'Wide ball. Extra run. The rhythm stutters.';
  if (trigger === 'noball') return 'No ball. Free hit pressure is coming.';
  if (ball.isDot) return `Dot ball. ${ball.bowlerName} compresses the scoring lane.`;
  if (ball.runs === 1) return 'Single taken. Strike rotates.';
  return `${ball.runs} runs. The scoreboard keeps moving.`;
}
