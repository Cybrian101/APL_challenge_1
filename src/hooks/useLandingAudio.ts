'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type HowlerModule = {
  Howler: {
    ctx?: AudioContext;
    volume: (value?: number) => number;
  };
};

type AudioGraph = {
  ctx: AudioContext;
  master: GainNode;
  crowdGain: GainNode;
  hum: OscillatorNode;
  humGain: GainNode;
  crowdSource: AudioBufferSourceNode;
};

const VOICE_LINES: Record<string, string> = {
  hero: 'iONArena online. Floodlights armed. The digital stadium is now live.',
  launch: 'Entering live match. Momentum engine, crowd pulse, and match intelligence are standing by.',
  gallery: 'Licensed match photography layer. Drop Getty downloads into the media folder to activate real IPL visuals.',
  pulse: 'Fan pulse system. Every tap lifts the stadium energy.',
  prediction: 'Micro prediction system. Countdown, choice, reveal, reward.',
  stadium: 'Stadium atmosphere system. Light, pressure, and crowd waves react to the match.',
  audio: 'Cinematic audio enabled. Crowd bed, pressure hum, interface ticks, and voice cues are active.',
};

export function useLandingAudio() {
  const [enabled, setEnabled] = useState(false);
  const graphRef = useRef<AudioGraph | null>(null);
  const lastSpokenRef = useRef('');

  const speak = useCallback((text: string) => {
    if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const key = `${text}-${Math.floor(Date.now() / 1200)}`;
    if (lastSpokenRef.current === key) return;
    lastSpokenRef.current = key;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 0.78;
    utterance.volume = 0.78;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => /english|india|male|neural|premium/i.test(`${voice.name} ${voice.lang}`));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  const playTone = useCallback((frequency: number, duration = 0.12, type: OscillatorType = 'triangle', gainValue = 0.05) => {
    const graph = graphRef.current;
    if (!graph) return;

    const osc = graph.ctx.createOscillator();
    const gain = graph.ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(graph.master);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(gainValue, graph.ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, graph.ctx.currentTime + duration);
    osc.stop(graph.ctx.currentTime + duration + 0.03);
  }, []);

  const enable = useCallback(async () => {
    if (enabled || graphRef.current) return;

    const { Howler } = (await import('howler')) as HowlerModule;
    const ctx = Howler.ctx ?? new AudioContext();
    await ctx.resume();
    Howler.volume(0.65);

    const master = ctx.createGain();
    master.gain.value = 0.62;
    master.connect(ctx.destination);

    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 64;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.026;
    hum.connect(humGain);
    humGain.connect(master);
    hum.start();

    const crowdBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const channel = crowdBuffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) {
      const wave = Math.sin(i * 0.013) * 0.04 + Math.sin(i * 0.071) * 0.02;
      channel[i] = wave + ((Math.sin(i * 78.233) * 43758.5453) % 1) * 0.06;
    }

    const crowdSource = ctx.createBufferSource();
    crowdSource.buffer = crowdBuffer;
    crowdSource.loop = true;

    const crowdFilter = ctx.createBiquadFilter();
    crowdFilter.type = 'lowpass';
    crowdFilter.frequency.value = 760;

    const crowdGain = ctx.createGain();
    crowdGain.gain.value = 0.035;
    crowdSource.connect(crowdFilter);
    crowdFilter.connect(crowdGain);
    crowdGain.connect(master);
    crowdSource.start();

    graphRef.current = { ctx, master, crowdGain, hum, humGain, crowdSource };
    setEnabled(true);
    setTimeout(() => {
      playTone(220, 0.18, 'triangle', 0.06);
      speak(VOICE_LINES.audio);
    }, 50);
  }, [enabled, playTone, speak]);

  const cue = useCallback((cueId: keyof typeof VOICE_LINES | 'tick' | 'confirm' | 'surge') => {
    if (!enabled) return;
    if (cueId === 'tick') {
      playTone(880, 0.055, 'sine', 0.025);
      return;
    }
    if (cueId === 'confirm') {
      playTone(330, 0.1, 'triangle', 0.045);
      setTimeout(() => playTone(660, 0.12, 'triangle', 0.05), 90);
      return;
    }
    if (cueId === 'surge') {
      playTone(144, 0.22, 'sawtooth', 0.045);
      return;
    }
    playTone(520, 0.08, 'triangle', 0.032);
    speak(VOICE_LINES[cueId]);
  }, [enabled, playTone, speak]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!enabled || !graph) return;
    const interval = setInterval(() => {
      const time = graph.ctx.currentTime;
      graph.hum.frequency.setTargetAtTime(58 + Math.sin(time * 0.25) * 8, time, 0.3);
      graph.crowdGain.gain.setTargetAtTime(0.03 + Math.abs(Math.sin(time * 0.18)) * 0.02, time, 0.45);
    }, 900);
    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (!graphRef.current) return;
      const { ctx, master, hum, crowdSource } = graphRef.current;
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
      hum.stop(ctx.currentTime + 0.12);
      crowdSource.stop(ctx.currentTime + 0.12);
      window.speechSynthesis?.cancel();
    };
  }, []);

  return { enabled, enable, cue };
}
