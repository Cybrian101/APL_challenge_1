'use client';

import { motion } from 'framer-motion';
import { Prediction } from '@/types/match';
import { usePredictionStore, useUserStore } from '@/store/predictionStore';
import { playBurst, playSuccess, playFail } from '@/utils/sfx';
import { useFanStore } from '@/store/fanStore';
import { useState, useEffect } from 'react';

interface PredictionCardsProps {
  predictions: Prediction[];
}

const STAKE_OPTIONS = [5, 10, 25];

// Prediction difficulty tiers with multipliers
const DIFFICULTY_TIERS = {
  easy: { label: 'Easy', multiplier: 1, icon: '⭐', color: 'from-green-500 to-emerald-400' },
  medium: { label: 'Medium', multiplier: 2, icon: '⭐⭐', color: 'from-yellow-500 to-orange-400' },
  hard: { label: 'Hard', multiplier: 3, icon: '⭐⭐⭐', color: 'from-red-500 to-pink-400' },
  legendary: { label: 'Legendary', multiplier: 5, icon: '✨', color: 'from-purple-500 to-fuchsia-400' },
};

function CoinBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = 60 + (i % 4) * 12;
        return (
          <motion.div
            key={i}
            className="absolute text-base"
            style={{ top: '50%', left: '50%' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.03 }}
          >
            {i % 3 === 0 ? '🪙' : i % 3 === 1 ? '✨' : '⚡'}
          </motion.div>
        );
      })}
    </div>
  );
}

function ComboChain({ combo }: { combo: number }) {
  if (combo < 2) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute -top-8 left-1/2 -translate-x-1/2 text-center"
    >
      <motion.p
        className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      >
        {combo}x COMBO 🔥
      </motion.p>
    </motion.div>
  );
}

export default function PredictionCards({ predictions }: PredictionCardsProps) {
  const predictionStore = usePredictionStore();
  const userStore = useUserStore();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [stakes, setStakes] = useState<Record<string, number>>({});
  const [bursting, setBursting] = useState<Record<string, boolean>>({});
  const [comboChain, setComboChain] = useState(0);
  const [now, setNow] = useState(0);

  const profile = userStore.profile;
  const points = profile?.totalPoints ?? 0;
  const streak = profile?.streak ?? 0;

  // Initialize profile if not set
  useEffect(() => {
    if (!userStore.isLoggedIn) {
      userStore.setProfile({ id: 'local-user', streak: 0, totalPoints: 200, predictions: [], reactions: [] });
    }
  }, [userStore]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const getDifficultyTier = (prob: number) => {
    if (prob >= 0.75) return 'easy';
    if (prob >= 0.55) return 'medium';
    if (prob >= 0.4) return 'hard';
    return 'legendary';
  };

  const handleMakePrediction = (predictionId: string, answer: string, difficulty: keyof typeof DIFFICULTY_TIERS) => {
    const stake = stakes[predictionId] ?? 10;
    const multiplier = DIFFICULTY_TIERS[difficulty].multiplier;
    predictionStore.makePrediction(predictionId, answer);
    setSelectedAnswers((prev) => ({ ...prev, [predictionId]: answer }));
    setTimeout(() => {
      const correct = Math.random() > 0.5;
      const correctAnswer = correct ? answer : (predictions.find((p) => p.id === predictionId)?.options.find((o) => o.label !== answer)?.label ?? 'No');
      predictionStore.revealPrediction(predictionId, correctAnswer);
      if (correct) {
        const winAmount = stake * multiplier * (1 + comboChain * 0.2); // Combo bonus
        userStore.addPoints(Math.floor(winAmount));
        userStore.updateStreak((profile?.streak || 0) + 1);
        setComboChain((prev) => prev + 1);
        setBursting((prev) => ({ ...prev, [predictionId]: true }));
        playBurst();
        playSuccess();
        useFanStore.getState().simulateReactions(14 + comboChain * 2, 'boundary');
        setTimeout(() => setBursting((prev) => ({ ...prev, [predictionId]: false })), 1200);
      } else {
        userStore.updateStreak(0);
        setComboChain(0);
        playFail();
        useFanStore.getState().simulateReactions(5, 'general');
      }
    }, 3000);
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.6) return 'from-green-500 to-emerald-400';
    if (prob >= 0.45) return 'from-cyan-500 to-blue-400';
    return 'from-purple-500 to-pink-400';
  };

  const allPreds = predictionStore.predictions.slice(-5).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl border border-purple-500/30 overflow-hidden"
    >
      {/* Header with stats */}
      <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-lg">🎯 Predictions</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300/80">
              {predictions.length} live
            </span>
            {comboChain >= 2 && (
              <span className="text-xs font-bold text-yellow-400 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 px-2 py-0.5 rounded-full border border-yellow-500/30">
                {comboChain}x COMBO
              </span>
            )}
            {streak >= 2 && (
              <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                🔥 {streak} streak
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">🪙</span>
            <motion.span key={points} className="text-white font-bold" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.3 }}>
              {points}
            </motion.span>
            <span className="text-gray-500">pts</span>
          </div>
          {streak > 0 && (
            <div className="text-gray-400 text-xs">· {streak} correct in a row</div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {allPreds.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No active predictions yet</p>
        ) : (
          allPreds.map((pred) => {
            const isAnswered = !!selectedAnswers[pred.id] || !!pred.userPrediction;
            const stake = stakes[pred.id] ?? 10;
            const countdown = now ? Math.max(0, 30 - Math.floor((now - pred.timestamp) / 1000)) : 30;
            const countdownPct = (countdown / 30) * 100;
            const avgProb = pred.options.reduce((sum, opt) => sum + opt.probability, 0) / pred.options.length;
            const difficulty = getDifficultyTier(Math.max(...pred.options.map((o) => o.probability)));
            const tier = DIFFICULTY_TIERS[difficulty as keyof typeof DIFFICULTY_TIERS];
            return (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl p-3 border border-purple-500/30 hover:border-purple-500/50 transition-all overflow-hidden"
              >
                {bursting[pred.id] && <CoinBurst />}
                <ComboChain combo={comboChain} />

                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{pred.question}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-400/30">{tier.label}</span>
                      <span className="text-xs text-gray-500">{tier.icon}</span>
                    </div>
                  </div>
                  <div className="min-w-10 rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-center text-[10px] font-black text-cyan-200">
                    {countdown}s
                  </div>
                </div>

                <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-1 rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300"
                    animate={{ width: `${countdownPct}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>

                {/* Odds/probability bars */}
                <div className="space-y-1.5 mb-3">
                  {pred.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-16 truncate">{opt.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${getProbabilityColor(opt.probability)}`}
                          animate={{ width: `${opt.probability * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs w-8">{Math.round(opt.probability * 100)}%</span>
                    </div>
                  ))}
                </div>

                {pred.status === 'pending' && !isAnswered ? (
                  <>
                    {/* Stake selector */}
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-gray-500 text-xs">Stake:</span>
                      {STAKE_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStakes((prev) => ({ ...prev, [pred.id]: s }))}
                          className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${stake === s ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {s}🪙
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {pred.options.map((opt) => (
                        <button
                          key={opt.id}
                          id={`pred-${pred.id}-${opt.id}`}
                          onClick={() => handleMakePrediction(pred.id, opt.label, difficulty as keyof typeof DIFFICULTY_TIERS)}
                          className="flex-1 px-2 py-2 text-xs font-bold rounded-lg transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95 relative overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span className="relative">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : pred.status === 'revealed' ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      boxShadow: pred.isCorrect
                        ? ['0 0 0 rgba(34,197,94,0)', '0 0 28px rgba(34,197,94,0.28)', '0 0 0 rgba(34,197,94,0)']
                        : undefined,
                    }}
                    transition={{ duration: 0.7 }}
                    className={`p-2 rounded-lg text-center ${pred.isCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}
                  >
                    <p className={`font-bold text-sm ${pred.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {pred.isCorrect ? `✅ Correct! +${Math.floor(stake * tier.multiplier * (1 + comboChain * 0.2))}🪙` : '❌ Wrong'}
                    </p>
                    {pred.userPrediction && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        You: {pred.userPrediction} · Answer: {pred.revealedAnswer}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <p className="text-cyan-400 text-xs font-semibold py-1.5 text-center animate-pulse">
                    ⏳ Waiting for result…
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
