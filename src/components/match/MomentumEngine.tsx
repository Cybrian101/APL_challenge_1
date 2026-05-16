'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

interface MomentumEngineProps {
  momentum: {
    momentumValue: number;
    momentumTrend: string;
    glowIntensity: number;
    crowdEnergy: number;
    lastTrigger?: string;
  };
  battingTeam?: string;
  bowlingTeam?: string;
}

// Waveform bar heights — update on each ball event
function WaveformBar({ active, delay, height }: { active: boolean; delay: number; height: number }) {
  return (
    <motion.div
      className="w-1 rounded-full"
      style={{ background: active ? 'linear-gradient(to top, #8b5cf6, #22d3ee)' : '#374151' }}
      animate={{ scaleY: active ? height : 0.2, opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.3, delay }}
    />
  );
}

function buildWaveHeights(seed = 'stable') {
  const seedValue = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 20 }).map((_, index) => {
    const wave = Math.sin((index + 1) * (seedValue + 17) * 0.13);
    return 0.35 + Math.abs(wave) * 0.65;
  });
}

const TRIGGER_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  six: { label: 'SIX SCORED!', color: 'text-yellow-400', emoji: '🚀' },
  boundary: { label: 'FOUR!', color: 'text-green-400', emoji: '💥' },
  wicket: { label: 'WICKET FALLS!', color: 'text-red-400', emoji: '🔴' },
  wide: { label: 'Wide Ball', color: 'text-yellow-300', emoji: '⚡' },
  noball: { label: 'No Ball!', color: 'text-orange-400', emoji: '🚫' },
};

export default function MomentumEngine({ momentum, battingTeam = 'BAT', bowlingTeam = 'BOWL' }: MomentumEngineProps) {
  const [visibleTrigger, setVisibleTrigger] = useState<string | undefined>();
  const waveHeights = useMemo(() => buildWaveHeights(momentum.lastTrigger), [momentum.lastTrigger]);

  useEffect(() => {
    if (!momentum.lastTrigger) return;
    const showTimer = setTimeout(() => setVisibleTrigger(momentum.lastTrigger), 0);
    const hideTimer = setTimeout(() => setVisibleTrigger(undefined), 2500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [momentum.lastTrigger]);

  const getBarColor = () => {
    if (momentum.momentumValue > 70) return 'from-red-500 to-orange-500';
    if (momentum.momentumValue > 40) return 'from-cyan-400 to-blue-500';
    return 'from-blue-500 to-purple-600';
  };

  const tugLeftPct = momentum.momentumValue; // batting team momentum
  const tugRightPct = 100 - momentum.momentumValue; // bowling team

  const triggerCfg = visibleTrigger ? TRIGGER_LABELS[visibleTrigger] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl p-6 border border-purple-500/30 relative overflow-hidden"
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 opacity-15 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse at 30% 50%, rgba(34,211,238,0.4) 0%, transparent 60%)',
            'radial-gradient(ellipse at 70% 50%, rgba(168,85,247,0.4) 0%, transparent 60%)',
            'radial-gradient(ellipse at 30% 50%, rgba(34,211,238,0.4) 0%, transparent 60%)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-black text-2xl">MOMENTUM</h3>
            <p className="text-gray-400 text-xs mt-1 tracking-wider">MATCH ENERGY</p>
          </div>
          <motion.div
            className="text-4xl"
            animate={{ rotate: momentum.momentumTrend === 'increasing' ? [0, 5, -5, 0] : [0, -5, 5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            {momentum.momentumTrend === 'increasing' ? '📈' : momentum.momentumTrend === 'decreasing' ? '📉' : '➡️'}
          </motion.div>
        </div>

        {/* Last trigger badge */}
        <AnimatePresence>
          {visibleTrigger && triggerCfg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className="mb-4 p-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2"
            >
              <span className="text-xl">{triggerCfg.emoji}</span>
              <span className={`font-bold text-sm ${triggerCfg.color}`}>{triggerCfg.label}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Energy bar */}
        <div className="mb-5">
          <div className="flex justify-between mb-1.5">
            <span className="text-gray-400 text-xs">Energy</span>
            <motion.span
              key={Math.floor(momentum.momentumValue / 5)}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-cyan-400 font-bold text-sm"
            >
              {Math.round(momentum.momentumValue)}%
            </motion.span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <motion.div
              className={`bg-gradient-to-r ${getBarColor()} h-4 rounded-full`}
              animate={{ width: `${momentum.momentumValue}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{ boxShadow: `0 0 ${momentum.glowIntensity * 30}px currentColor` }}
            />
          </div>
        </div>

        {/* Tug-of-War bar */}
        <div className="mb-5">
          <p className="text-gray-400 text-xs mb-2 font-semibold tracking-wider">TUG OF WAR</p>
          <div className="flex items-center gap-2 text-xs mb-1.5">
            <span className="text-cyan-400 font-bold flex-1 truncate">{battingTeam}</span>
            <span className="text-purple-400 font-bold flex-1 text-right truncate">{bowlingTeam}</span>
          </div>
          <div className="relative w-full bg-gray-800 rounded-full h-5 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-l-full"
              animate={{ width: `${tugLeftPct}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute right-0 top-0 h-5 bg-gradient-to-l from-purple-500 to-purple-400 rounded-r-full"
              animate={{ width: `${tugRightPct}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
            {/* Center flag */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-0.5 h-5 bg-white/60 rounded-full"
                animate={{ x: `${(tugLeftPct - 50) * 0.5}px` }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-cyan-400 font-bold">{Math.round(tugLeftPct)}%</span>
            <span className="text-purple-400 font-bold">{Math.round(tugRightPct)}%</span>
          </div>
        </div>

        {/* Waveform */}
        <div>
          <p className="text-gray-400 text-xs mb-2 font-semibold tracking-wider">CROWD ENERGY</p>
          <div className="flex gap-1 items-end h-10">
            {waveHeights.map((h, i) => (
              <WaveformBar
                key={i}
                active={i < Math.round((momentum.momentumValue / 100) * 20)}
                delay={i * 0.02}
                height={h * 1.8}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
