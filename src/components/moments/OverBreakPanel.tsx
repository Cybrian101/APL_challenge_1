'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchPhaseStore } from '@/store/matchPhaseStore';
import { usePredictionStore } from '@/store/predictionStore';

const NEXT_OVER_PREDICTIONS = [
  { q: 'Runs in next over:', options: ['Under 8', 'Over 8'] },
  { q: 'Wicket next over?', options: ['Yes', 'No'] },
  { q: 'Boundary first ball?', options: ['Yes', 'No'] },
];

function BallDot({ value }: { value: number }) {
  if (value === -1)
    return <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-xs font-bold text-red-400">W</div>;
  if (value === -2)
    return <div className="w-8 h-8 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-xs font-bold text-yellow-400">Wd</div>;
  if (value === 6)
    return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-yellow-500/50">6</div>;
  if (value === 4)
    return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-green-500/50">4</div>;
  if (value === 0)
    return <div className="w-8 h-8 rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center text-xs text-gray-500">·</div>;
  return <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-xs font-bold text-cyan-300">{value}</div>;
}

export default function OverBreakPanel() {
  const { phase, overBreakData, exitPhase } = useMatchPhaseStore();
  const { addPrediction } = usePredictionStore();
  const [timeLeft, setTimeLeft] = useState(12);
  const [chosenPred, setChosenPred] = useState<string | null>(null);
  const [activePred] = useState(() => NEXT_OVER_PREDICTIONS[Math.floor(Math.random() * NEXT_OVER_PREDICTIONS.length)]);
  const [energyTaps, setEnergyTaps] = useState(0);
  const [tapFlash, setTapFlash] = useState(false);

  const isVisible = phase === 'over_break';

  useEffect(() => {
    if (!isVisible) { setTimeLeft(12); setChosenPred(null); setEnergyTaps(0); return; }
    const t = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(t); exitPhase(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [isVisible, exitPhase]);

  const handlePredVote = (option: string) => {
    setChosenPred(option);
    addPrediction({
      id: `over-pred-${Date.now()}`,
      question: activePred.q,
      options: activePred.options.map((o) => ({ id: o.toLowerCase().replace(/\s/g, ''), label: o, probability: 0.5 })),
      status: 'pending',
      userPrediction: option,
      timestamp: Date.now(),
    });
  };

  const handleEnergyTap = () => {
    setEnergyTaps((p) => p + 1);
    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 150);
  };

  if (!overBreakData) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="max-w-4xl mx-auto px-4 pb-4">
            <div className="glass rounded-2xl border border-purple-500/40 overflow-hidden">
              <div className="h-1 bg-gray-800">
                <motion.div
                  className="h-1 bg-gradient-to-r from-cyan-400 to-purple-500"
                  animate={{ width: `${(timeLeft / 12) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold tracking-widest text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                        ⏸ OVER {overBreakData.overNumber} COMPLETE
                      </span>
                      <span className="text-xs text-gray-500">{timeLeft}s</span>
                    </div>
                    <h3 className="text-white font-black text-xl">
                      {overBreakData.runsInOver} runs
                      {overBreakData.wicketsInOver > 0 && <span className="text-red-400 ml-2">· {overBreakData.wicketsInOver}W</span>}
                    </h3>
                  </div>
                  <button onClick={exitPhase} className="text-gray-500 hover:text-white transition-colors text-xl">×</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-2 font-semibold tracking-wider">BALLS</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {overBreakData.ballSummary.map((v, i) => (
                        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.07 }}>
                          <BallDot value={v} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2 font-semibold tracking-wider">PREDICT NEXT OVER</p>
                    <p className="text-white text-sm mb-2 font-medium">{activePred.q}</p>
                    {!chosenPred ? (
                      <div className="flex gap-2">
                        {activePred.options.map((opt) => (
                          <button
                            key={opt}
                            id={`over-pred-${opt.toLowerCase().replace(/\s/g, '-')}`}
                            onClick={() => handlePredVote(opt)}
                            className="flex-1 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition-all active:scale-95"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="py-2 px-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
                        <p className="text-green-400 text-sm font-bold">✓ {chosenPred}</p>
                      </motion.div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-2 font-semibold tracking-wider">FAN ENERGY</p>
                    <motion.button
                      id="fan-energy-tap"
                      onClick={handleEnergyTap}
                      whileTap={{ scale: 0.85 }}
                      className={`w-16 h-16 mx-auto rounded-full text-3xl flex items-center justify-center transition-all shadow-lg ${tapFlash ? 'bg-yellow-500/60 shadow-yellow-400/60' : 'bg-yellow-500/20 border-2 border-yellow-500/60'}`}
                    >
                      ⚡
                    </motion.button>
                    <motion.p key={energyTaps} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-yellow-400 font-black text-lg mt-1">
                      {energyTaps + 847}
                    </motion.p>
                    <p className="text-gray-500 text-xs">fans tapping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
