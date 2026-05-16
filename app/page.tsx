'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLandingAudio } from '@/hooks/useLandingAudio';

const MATCH_FEED = [
  { over: '07.2', signal: 'Powerplay echo', value: '+18 energy' },
  { over: '07.3', signal: 'Crowd lock', value: '24k synced' },
  { over: '07.4', signal: 'AI pressure read', value: 'Bowler hold' },
  { over: '07.5', signal: 'Prediction window', value: '21s left' },
];

const COMMANDS = [
  { id: 'stadium', label: 'Stadium', value: 'Reactive light grid' },
  { id: 'pulse', label: 'Pulse', value: 'Fan emotion stream' },
  { id: 'prediction', label: 'Predict', value: 'Micro-choice engine' },
  { id: 'gallery', label: 'Media', value: 'Licensed match wall' },
];

const PHOTO_STACK = [
  '/media/ipl-crowd-01.jpg',
  '/media/ipl-boundary-02.jpg',
  '/media/ipl-pressure-03.jpg',
];

export default function Home() {
  const { enabled, enable, cue } = useLandingAudio();

  const cueCommand = (id: string) => cue(id as 'stadium' | 'pulse' | 'prediction' | 'gallery');

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(112deg,#050505_0%,#061312_40%,#21090b_100%)]" />
        <div
          className="absolute inset-0 opacity-38 mix-blend-screen"
          style={{
            backgroundImage: "url('/stadium-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.18) saturate(1.35) grayscale(0.25)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(0,255,209,0.24),transparent_31%),radial-gradient(circle_at_78%_34%,rgba(255,70,64,0.22),transparent_32%),linear-gradient(180deg,transparent_0%,#050505_92%)]" />
        <div className="absolute inset-0 arena-scanlines opacity-45" />

        <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[88px_minmax(0,1fr)_360px]">
          <aside className="hidden border-r border-white/10 bg-black/24 backdrop-blur-2xl lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-6">
            <button
              type="button"
              onClick={() => {
                enable();
                cue('audio');
              }}
              className="vertical-chip"
            >
              {enabled ? 'SOUND ON' : 'ARM SOUND'}
            </button>
            <div className="flex flex-col gap-3">
              {['LIVE', 'AI', 'FAN', 'MEDIA'].map((item, index) => (
                <motion.span
                  key={item}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-[10px] font-black text-white/58"
                  animate={{ borderColor: ['rgba(255,255,255,0.12)', 'rgba(45,212,191,0.45)', 'rgba(255,255,255,0.12)'] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.22 }}
                >
                  {item}
                </motion.span>
              ))}
            </div>
            <span className="vertical-chip opacity-55">ION OS</span>
          </aside>

          <div className="flex min-h-screen flex-col px-4 py-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.36em] text-teal-200/65">Realtime sports universe</p>
                <p className="mt-1 text-sm font-bold text-white/52">Broadcast command layer for cricket chaos</p>
              </div>
              <Link
                href="/match/live"
                onPointerEnter={() => cue('launch')}
                onClick={() => cue('confirm')}
                className="rounded-none border border-teal-200/55 bg-teal-200 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[8px_8px_0_rgba(255,255,255,0.11)] transition hover:-translate-y-0.5 hover:shadow-[12px_12px_0_rgba(255,255,255,0.14)]"
              >
                Open arena
              </Link>
            </nav>

            <div className="grid flex-1 items-center gap-8 py-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.72fr)]">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75 }}
                className="relative"
                onPointerEnter={() => cue('hero')}
              >
                <div className="mb-5 inline-flex border border-white/12 bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/68 backdrop-blur-xl">
                  Stadium neural feed active
                </div>
                <h1 className="max-w-5xl text-[clamp(4rem,11vw,10rem)] font-black uppercase leading-[0.78] tracking-normal">
                  iON
                  <br />
                  Arena
                </h1>
                <p className="mt-7 max-w-2xl text-xl font-semibold leading-relaxed text-white/68">
                  Not a score app. A living second-screen arena where every ball pushes sound, light, fan emotion, predictions, and AI story forward.
                </p>

                <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
                  {COMMANDS.map((command) => (
                    <button
                      key={command.id}
                      type="button"
                      onPointerEnter={() => cueCommand(command.id)}
                      onClick={() => cueCommand(command.id)}
                      className="group border border-white/10 bg-black/30 p-4 text-left backdrop-blur-xl transition hover:border-teal-200/60 hover:bg-teal-200/8"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-white/46">{command.label}</p>
                        <span className="text-teal-200 transition group-hover:translate-x-1">↗</span>
                      </div>
                      <p className="mt-4 text-lg font-black text-white">{command.value}</p>
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, rotate: 2, x: 28 }}
                animate={{ opacity: 1, rotate: 0, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative min-h-[560px]"
              >
                <div className="absolute inset-0 border border-white/10 bg-black/46 backdrop-blur-xl" />
                <div className="absolute -left-3 top-8 h-[78%] w-3 bg-teal-200" />
                <div className="absolute inset-5 overflow-hidden border border-white/10">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.18),transparent_42%),radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.17),transparent_31%)]" />
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 border border-teal-200/35"
                    animate={{ rotate: 360, scale: [0.9, 1.03, 0.9] }}
                    transition={{ rotate: { duration: 22, repeat: Infinity, ease: 'linear' }, scale: { duration: 3.2, repeat: Infinity } }}
                  />
                  <div className="absolute left-6 top-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">Live simulation</p>
                    <p className="mt-2 text-6xl font-black">148/4</p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-white/45">RCB chase pressure</p>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    {MATCH_FEED.map((feed) => (
                      <div key={feed.over} className="grid grid-cols-[56px_1fr_auto] gap-3 border-t border-white/10 py-2 text-xs">
                        <span className="font-black text-teal-200">{feed.over}</span>
                        <span className="font-bold text-white/64">{feed.signal}</span>
                        <span className="font-black text-white">{feed.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <aside className="border-l border-white/10 bg-black/30 p-4 backdrop-blur-2xl lg:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/48">Media wall</p>
              <button
                type="button"
                onClick={() => {
                  enable();
                  cue('audio');
                }}
                className="border border-white/12 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/62 transition hover:border-teal-200/60"
              >
                {enabled ? 'Voices armed' : 'Voice layer'}
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {PHOTO_STACK.map((src, index) => (
                <button
                  type="button"
                  key={src}
                  onPointerEnter={() => cue(index === 0 ? 'gallery' : 'surge')}
                  className="group relative h-44 w-full overflow-hidden border border-white/10 bg-zinc-950 text-left"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(90deg,rgba(5,5,5,0.2),rgba(5,5,5,0.8)), url('${src}'), url('/stadium-bg.png')`,
                    }}
                  />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-teal-200/70">Licensed slot {index + 1}</p>
                    <p className="mt-2 text-xl font-black">IPL photo layer</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/44">
              Place licensed Getty/IPL downloads in <span className="font-bold text-white/70">public/media</span> using the file names shown in code, and this wall becomes real match photography.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
