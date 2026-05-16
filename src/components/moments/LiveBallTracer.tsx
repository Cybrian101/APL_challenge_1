'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ball } from '@/types/match';

interface LiveBallTracerProps {
  lastBall: Ball | null;
}

const EVENT_CONFIG = {
  six: { color: '#facc15', bg: 'from-yellow-500/30 to-orange-500/20', border: 'border-yellow-400/60', label: '6️⃣ SIX!', textColor: 'text-yellow-300', flash: 'rgba(250,204,21,0.25)' },
  four: { color: '#4ade80', bg: 'from-green-500/30 to-emerald-500/20', border: 'border-green-400/60', label: '4️⃣ FOUR!', textColor: 'text-green-300', flash: 'rgba(74,222,128,0.2)' },
  wicket: { color: '#ef4444', bg: 'from-red-500/30 to-rose-500/20', border: 'border-red-400/60', label: '🔴 WICKET!', textColor: 'text-red-400', flash: 'rgba(239,68,68,0.3)' },
  wide: { color: '#eab308', bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/40', label: '⚡ WIDE', textColor: 'text-yellow-400', flash: 'rgba(234,179,8,0.1)' },
  noball: { color: '#f97316', bg: 'from-orange-500/30 to-red-500/20', border: 'border-orange-400/60', label: '🚫 NO BALL', textColor: 'text-orange-400', flash: 'rgba(249,115,22,0.2)' },
  dot: { color: '#6b7280', bg: 'from-gray-700/20 to-gray-600/10', border: 'border-gray-600/30', label: '• DOT', textColor: 'text-gray-400', flash: 'transparent' },
  single: { color: '#22d3ee', bg: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30', label: '1 RUN', textColor: 'text-cyan-400', flash: 'transparent' },
  two: { color: '#38bdf8', bg: 'from-sky-500/20 to-cyan-500/10', border: 'border-sky-500/30', label: '2 RUNS', textColor: 'text-sky-400', flash: 'transparent' },
  three: { color: '#818cf8', bg: 'from-indigo-500/20 to-violet-500/10', border: 'border-indigo-500/30', label: '3 RUNS', textColor: 'text-indigo-400', flash: 'transparent' },
};

function BoundaryArc({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 300 100">
      <motion.path
        d="M 20 90 Q 150 -30 280 90"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="400"
        initial={{ strokeDashoffset: 400, opacity: 0 }}
        animate={{ strokeDashoffset: 0, opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.circle
        cx="280" cy="90" r="5"
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, delay: 1 }}
      />
    </svg>
  );
}

export default function LiveBallTracer({ lastBall }: LiveBallTracerProps) {
  const [visible, setVisible] = useState(false);
  const [displayBall, setDisplayBall] = useState<Ball | null>(null);

  useEffect(() => {
    if (!lastBall) return;
    setDisplayBall(lastBall);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, [lastBall]);

  if (!displayBall) return null;

  const event = displayBall.event;
  const cfg = EVENT_CONFIG[event] || EVENT_CONFIG.dot;
  const isBoundary = event === 'four' || event === 'six';
  const isWicket = event === 'wicket';

  return (
    <>
      {/* Screen edge flash */}
      <AnimatePresence>
        {visible && cfg.flash !== 'transparent' && (
          <motion.div
            className="fixed inset-0 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.2, 1] }}
            style={{ boxShadow: `inset 0 0 120px 40px ${cfg.flash}` }}
          />
        )}
      </AnimatePresence>

      {/* Ball event badge */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className={`fixed top-36 left-1/2 -translate-x-1/2 z-25 pointer-events-none`}
            initial={{ y: -40, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
          >
            <div className={`relative bg-gradient-to-r ${cfg.bg} border ${cfg.border} rounded-2xl px-6 py-3 backdrop-blur-md overflow-hidden`}>
              {isBoundary && <BoundaryArc color={cfg.color} />}

              <div className="relative z-10 text-center">
                <motion.p
                  className={`font-black text-2xl ${cfg.textColor}`}
                  animate={isWicket ? { scale: [1, 1.1, 1] } : isBoundary ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.4, repeat: isWicket ? 2 : 1 }}
                >
                  {cfg.label}
                </motion.p>
                <p className="text-gray-300 text-xs mt-0.5">
                  {displayBall.batsmanName} · {displayBall.bowlerName}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
