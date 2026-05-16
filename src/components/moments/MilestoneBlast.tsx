'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playBurst, playSuccess } from '@/utils/sfx';
import { useMatchPhaseStore } from '@/store/matchPhaseStore';
import { MilestoneType } from '@/types/match';

const MILESTONE_CONFIG: Record<MilestoneType, { emoji: string; title: string; subtitle: string; colors: string[] }> = {
  player_fifty: { emoji: '🏏', title: 'FIFTY!', subtitle: 'Brilliant half-century!', colors: ['#facc15', '#f97316', '#fbbf24'] },
  player_hundred: { emoji: '💯', title: 'CENTURY!', subtitle: 'A magnificent hundred!', colors: ['#ffd700', '#ff8c00', '#ff4500'] },
  maiden_over: { emoji: '🎯', title: 'MAIDEN!', subtitle: 'Flawless over — no runs!', colors: ['#22d3ee', '#3b82f6', '#8b5cf6'] },
  hat_trick: { emoji: '🎩', title: 'HAT-TRICK!', subtitle: 'Three in three!', colors: ['#a855f7', '#ec4899', '#f97316'] },
  team_hundred: { emoji: '💥', title: '100 UP!', subtitle: 'Team reaches the century!', colors: ['#4ade80', '#22d3ee', '#818cf8'] },
  team_hundred_fifty: { emoji: '🚀', title: '150 UP!', subtitle: 'Charging towards a big total!', colors: ['#f97316', '#facc15', '#4ade80'] },
};

const PARTICLE_COUNT = 60;

function Particles({ colors }: { colors: string[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const color = colors[i % colors.length];
        const size = Math.random() * 12 + 4;
        const x = (Math.random() - 0.5) * window.innerWidth * 1.4;
        const y = -(Math.random() * window.innerHeight + 100);
        const rotate = Math.random() * 720;
        const delay = Math.random() * 0.5;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{ width: size, height: size, backgroundColor: color, top: '50%', left: '50%' }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x, y, opacity: 0, rotate }}
            transition={{ duration: 2 + Math.random(), delay, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

export default function MilestoneBlast() {
  const { milestoneData, exitPhase } = useMatchPhaseStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!milestoneData) { setVisible(false); return; }
    setVisible(true);
    // Play an SFX for the milestone
    if (milestoneData.milestoneType === 'player_hundred' || milestoneData.milestoneType === 'team_hundred') {
      playSuccess();
    } else {
      playBurst();
    }
    const t = setTimeout(() => { setVisible(false); exitPhase(); }, 3500);
    return () => clearTimeout(t);
  }, [milestoneData, exitPhase]);

  if (!milestoneData) return null;

  const cfg = MILESTONE_CONFIG[milestoneData.milestoneType];
  if (!cfg) return null;

  const gradientStyle = `linear-gradient(135deg, ${cfg.colors[0]}22, ${cfg.colors[1]}11)`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-45 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at center, ${cfg.colors[0]}15 0%, transparent 70%)` }}
            animate={{ opacity: [0, 1, 0.6] }}
            transition={{ duration: 0.5 }}
          />

          <Particles colors={cfg.colors} />

          {/* Content */}
          <motion.div
            className="relative z-10 text-center px-8"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {cfg.emoji}
            </motion.div>

            {(milestoneData.playerName || milestoneData.teamName) && (
              <motion.p
                className="text-gray-300 text-lg font-semibold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {milestoneData.playerName || milestoneData.teamName}
              </motion.p>
            )}

            <motion.h2
              className="font-black text-6xl mb-2"
              style={{ background: `linear-gradient(135deg, ${cfg.colors[0]}, ${cfg.colors[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {cfg.title}
            </motion.h2>

            <motion.p
              className="text-gray-300 text-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {cfg.subtitle}
            </motion.p>

            {/* Ring burst */}
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: cfg.colors[i % cfg.colors.length] }}
                initial={{ scale: 0.3, opacity: 0.8 }}
                animate={{ scale: 3 + i * 0.5, opacity: 0 }}
                transition={{ duration: 1.2, delay, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
