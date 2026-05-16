'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchPhaseStore } from '@/store/matchPhaseStore';

const PARTICLES = Array.from({ length: 40 }, (_, i) => i);

function Particle({ delay, color }: { delay: number; color: string }) {
  const x = (Math.random() - 0.5) * 800;
  const y = -(Math.random() * 600 + 200);
  const rotate = Math.random() * 720;
  const size = Math.random() * 10 + 4;
  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{ width: size, height: size, backgroundColor: color, top: '50%', left: '50%' }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ x, y, opacity: 0, rotate, scale: 0.3 }}
      transition={{ duration: 1.8 + Math.random(), delay, ease: 'easeOut' }}
    />
  );
}

function RadarScanner() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-6">
      {/* Outer rings */}
      {[1, 0.75, 0.5, 0.25].map((scale, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-cyan-500/40"
          style={{ transform: `scale(${scale})`, top: `${(1 - scale) * 50}%`, left: `${(1 - scale) * 50}%`, width: `${scale * 100}%`, height: `${scale * 100}%` }}
        />
      ))}
      {/* Scanning beam */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,255,200,0.3) 360deg)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-4 h-4 rounded-full bg-cyan-400"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

export default function DRSReviewOverlay() {
  const { phase, drsData, voteDRS, revealDRS, exitPhase } = useMatchPhaseStore();
  const [countdown, setCountdown] = useState(15);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [burstColors, setBurstColors] = useState<string[]>([]);
  const [simulatedVoting, setSimulatedVoting] = useState(false);

  const handleReveal = useCallback(() => {
    if (!drsData) return;
    const result: 'out' | 'not_out' = Math.random() > 0.5 ? 'out' : 'not_out';
    revealDRS(result);
    setShowResult(true);
    setBurstColors(result === 'out'
      ? ['#ef4444', '#f97316', '#facc15']
      : ['#22d3ee', '#3b82f6', '#8b5cf6']);
    setTimeout(exitPhase, 3500);
  }, [drsData, revealDRS, exitPhase]);

  // Simulate other fans voting
  useEffect(() => {
    if (phase !== 'drs_review' || simulatedVoting) return;
    setSimulatedVoting(true);
    const interval = setInterval(() => {
      const vote = Math.random() > 0.5 ? 'out' : 'notOut';
      for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
        voteDRS(vote as 'out' | 'notOut');
      }
    }, 800);
    return () => clearInterval(interval);
  }, [phase, voteDRS, simulatedVoting]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'drs_review') {
      setCountdown(15);
      setHasVoted(false);
      setShowResult(false);
      setSimulatedVoting(false);
      return;
    }
    setCountdown(15);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReveal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, handleReveal]);

  const isVisible = phase === 'drs_review';
  if (!drsData) return null;

  const totalVotes = drsData.fanVotes.out + drsData.fanVotes.notOut;
  const outPct = totalVotes ? Math.round((drsData.fanVotes.out / totalVotes) * 100) : 50;
  const notOutPct = 100 - outPct;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Burst particles on reveal */}
          {showResult && burstColors.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {PARTICLES.map((i) => (
                <Particle key={i} delay={i * 0.02} color={burstColors[i % burstColors.length]} />
              ))}
            </div>
          )}

          <motion.div
            className="relative z-10 w-full max-w-md mx-4"
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div
              className="glass rounded-2xl p-8 border-2 text-center"
              style={{ borderColor: showResult ? (drsData.result === 'out' ? '#ef4444' : '#22d3ee') : 'rgba(0,255,200,0.4)' }}
            >
              {/* Header */}
              <div className="mb-4">
                <span className="text-xs font-bold tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                  🔍 DRS REVIEW
                </span>
              </div>

              {!showResult ? (
                <>
                  <RadarScanner />

                  {/* Countdown */}
                  <div className="mb-4">
                    <motion.div
                      key={countdown}
                      initial={{ scale: 1.3, color: '#f97316' }}
                      animate={{ scale: 1, color: countdown <= 5 ? '#ef4444' : '#22d3ee' }}
                      className="text-5xl font-black mb-2"
                    >
                      {countdown}
                    </motion.div>
                    <p className="text-gray-400 text-sm">seconds for decision</p>
                  </div>

                  {/* Ball info */}
                  <p className="text-white font-semibold mb-1">{drsData.batsmanName}</p>
                  <p className="text-gray-400 text-sm mb-6">
                    b. {drsData.bowlerName}
                  </p>

                  {/* Fan vote */}
                  {!hasVoted ? (
                    <div>
                      <p className="text-gray-300 text-sm mb-3 font-semibold">YOUR VERDICT?</p>
                      <div className="flex gap-3">
                        <button
                          id="drs-vote-out"
                          onClick={() => { voteDRS('out'); setHasVoted(true); }}
                          className="flex-1 py-3 rounded-xl font-black text-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 transition-all active:scale-95 shadow-lg shadow-red-500/30"
                        >
                          🚨 OUT
                        </button>
                        <button
                          id="drs-vote-not-out"
                          onClick={() => { voteDRS('notOut'); setHasVoted(true); }}
                          className="flex-1 py-3 rounded-xl font-black text-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 transition-all active:scale-95 shadow-lg shadow-cyan-500/30"
                        >
                          ✅ NOT OUT
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-cyan-300 text-sm font-semibold py-2">✓ Vote cast! Waiting for decision…</p>
                  )}

                  {/* Live vote bars */}
                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 w-14 text-right font-bold">{outPct}%</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500"
                          animate={{ width: `${outPct}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <span className="text-gray-400 w-14 text-xs">Out</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 w-14 text-right font-bold">{notOutPct}%</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-500"
                          animate={{ width: `${notOutPct}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <span className="text-gray-400 w-14 text-xs">Not Out</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{totalVotes.toLocaleString()} fan votes</p>
                  </div>
                </>
              ) : (
                /* RESULT */
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  {drsData.result === 'out' ? (
                    <>
                      <div className="text-8xl mb-4">🚨</div>
                      <h2 className="text-4xl font-black text-red-400 mb-2">OUT!</h2>
                      <p className="text-gray-300">Decision Upheld</p>
                    </>
                  ) : (
                    <>
                      <div className="text-8xl mb-4">✅</div>
                      <h2 className="text-4xl font-black text-cyan-400 mb-2">NOT OUT!</h2>
                      <p className="text-gray-300">Decision Overturned</p>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
