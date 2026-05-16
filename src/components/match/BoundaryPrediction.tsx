"use client";

import { motion } from 'framer-motion';

export default function BoundaryPrediction({ probability = 0.38 }: { probability?: number }) {
  const pct = Math.round(probability * 100);
  return (
    <div className="glass rounded-lg p-3 border border-white/8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black text-white/60">Boundary Prediction</div>
          <div className="mt-2 text-2xl font-extrabold">{pct}%</div>
          <div className="text-sm text-white/60">Next ball chance</div>
        </div>
        <div className="w-24 h-24 relative">
          <svg viewBox="0 0 36 36" className="w-24 h-24">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#111827" strokeWidth="3" />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${pct} ${100 - pct}`}
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.9 }}
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
