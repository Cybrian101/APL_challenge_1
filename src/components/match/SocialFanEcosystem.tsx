'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FanReaction } from '@/types/match';
import { FanPulseSoundId, useFanPulseAudio } from '@/hooks/useFanPulseAudio';

interface SocialFanEcosystemProps {
  reactions: FanReaction[];
  onBoundary: () => void;
}

const EMOJI_BUTTONS: {
  emoji: string;
  label: string;
  type: FanReaction['type'];
  sound: FanPulseSoundId;
}[] = [
  { emoji: '🔥', label: 'Fire', type: 'boundary', sound: 'fire' },
  { emoji: '💥', label: 'Blast', type: 'boundary', sound: 'celebrate' },
  { emoji: '🙌', label: 'Cheer', type: 'general', sound: 'cheer' },
  { emoji: '😱', label: 'Shock', type: 'wicket', sound: 'shock' },
  { emoji: '🏏', label: 'Cricket', type: 'general', sound: 'blast' },
];

const ENERGY_STREAMS = Array.from({ length: 10 }).map((_, index) => ({
  id: `stream-${index}`,
  left: 6 + index * 9,
  delay: (index % 5) * 0.16,
  height: 34 + (index % 4) * 16,
}));

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  driftX: number;
  duration: number;
}

export default function SocialFanEcosystem({ reactions, onBoundary }: SocialFanEcosystemProps) {
  const [floaters, setFloaters] = useState<FloatingEmoji[]>([]);
  const [chantPower, setChantPower] = useState(0);
  const [tapCounts, setTapCounts] = useState<Record<string, number>>({});
  const [reactionStats, setReactionStats] = useState({ fire: 0, blast: 0, cheer: 0, shock: 0, cricket: 0 });
  const decayRef = useRef<NodeJS.Timeout | null>(null);
  const fanAudio = useFanPulseAudio();

  useEffect(() => {
    decayRef.current = setInterval(() => {
      setChantPower((prev) => Math.max(0, prev - 1.5));
    }, 400);
    return () => {
      if (decayRef.current) clearInterval(decayRef.current);
    };
  }, []);

  const addFloater = useCallback((emoji: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    const floater: FloatingEmoji = {
      id,
      emoji,
      x: Math.random() * 85 + 5,
      driftX: (Math.random() - 0.5) * 40,
      duration: 2.0 + Math.random() * 1.0,
    };
    setFloaters((prev) => [...prev.slice(-30), floater]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== id)), 3500);
  }, []);

  useEffect(() => {
    if (reactions.length === 0) return;
    const last = reactions[reactions.length - 1];
    addFloater(last.emoji);
  }, [addFloater, reactions]);

  const handleEmojiTap = useCallback((emojiBtn: typeof EMOJI_BUTTONS[0]) => {
    fanAudio.play(emojiBtn.sound);

    for (let i = 0; i < 3; i += 1) {
      setTimeout(() => addFloater(emojiBtn.emoji), i * 80);
    }

    setChantPower((prev) => Math.min(100, prev + 12));
    setTapCounts((prev) => ({ ...prev, [emojiBtn.label]: (prev[emojiBtn.label] || 0) + 1 }));
    setReactionStats((prev) => {
      const key = emojiBtn.label.toLowerCase() as keyof typeof prev;
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
    onBoundary();
  }, [addFloater, fanAudio, onBoundary]);

  const topEmojis = Object.entries(reactionStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([, count]) => count > 0);

  const chantLabel =
    chantPower > 70
      ? 'STADIUM ERUPTS'
      : chantPower > 40
      ? 'CROWD ROARING'
      : chantPower > 15
      ? 'FANS ENGAGED'
      : 'QUIET STANDS';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-xl border border-purple-500/30 p-4 sm:p-5 lg:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Fan Pulse</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/32">
            {fanAudio.enabled ? 'Sample bank armed' : 'Tap to unlock sounds'}
          </p>
        </div>
        <span className="text-xs text-gray-400">{(reactions.length * 10 + 245).toLocaleString()} fans live</span>
      </div>

      <div className="mb-4 grid grid-cols-5 gap-1.5 sm:gap-2">
        {EMOJI_BUTTONS.map((btn) => (
          <motion.button
            key={btn.label}
            id={`fan-react-${btn.label.toLowerCase()}`}
            onClick={() => handleEmojiTap(btn)}
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 1.08 }}
            className="flex min-h-16 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-1 py-2 transition-all hover:border-purple-400/50 hover:bg-purple-500/10 active:scale-95"
          >
            <span className="text-2xl">{btn.emoji}</span>
            <span className="mt-0.5 text-[10px] font-bold text-gray-500 sm:text-xs">
              {(tapCounts[btn.label] || 0) + reactions.filter((r) => r.type === btn.type).length}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="relative mb-4 h-28 overflow-hidden rounded-xl border border-white/5 bg-black/20 sm:h-32 lg:h-36">
        <div className="absolute inset-0">
          {ENERGY_STREAMS.map((stream) => (
            <motion.div
              key={stream.id}
              className="absolute bottom-0 w-px rounded-full bg-cyan-300/35"
              style={{ left: `${stream.left}%`, height: stream.height }}
              animate={{
                opacity: chantPower > 10 ? [0.15, 0.75, 0.15] : [0.06, 0.2, 0.06],
                scaleY: chantPower > 45 ? [0.5, 1.25, 0.5] : [0.35, 0.8, 0.35],
              }}
              transition={{ duration: 1.4, repeat: Infinity, delay: stream.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          {floaters.length === 0 && <p className="text-xs text-gray-600">Pulse the stadium</p>}
        </div>
        <AnimatePresence>
          {floaters.map((floater) => (
            <motion.div
              key={floater.id}
              className="absolute select-none text-3xl"
              style={{ left: `${floater.x}%`, bottom: '0%' }}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -130, scale: 1.2, x: floater.driftX }}
              exit={{ opacity: 0 }}
              transition={{ duration: floater.duration, ease: 'easeOut' }}
            >
              {floater.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-gray-400">CHANT POWER</p>
          <motion.p
            key={chantLabel}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="truncate text-xs font-bold text-cyan-400"
          >
            {chantLabel}
          </motion.p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
          <motion.div
            className="h-3 rounded-full"
            animate={{
              width: `${chantPower}%`,
              background:
                chantPower > 70
                  ? 'linear-gradient(90deg, #f97316, #ef4444)'
                  : chantPower > 40
                  ? 'linear-gradient(90deg, #facc15, #f97316)'
                  : 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
            }}
            transition={{ duration: 0.3 }}
            style={{ boxShadow: chantPower > 50 ? '0 0 12px rgba(249,115,22,0.6)' : undefined }}
          />
        </div>
      </div>

      {topEmojis.length > 0 && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">Trending:</p>
          {EMOJI_BUTTONS.filter((b) => topEmojis.some(([k]) => k === b.label.toLowerCase())).slice(0, 3).map((b) => (
            <span key={b.label} className="text-lg">{b.emoji}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
