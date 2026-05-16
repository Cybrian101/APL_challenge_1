"use client";

import { motion } from 'framer-motion';

export default function ScoreAnalysis({ runs = 148, wickets = 4, overs = 17.2 }: { runs?: number; wickets?: number; overs?: number }) {
  const rr = (runs / (overs || 1)).toFixed(2);
  const projected = Math.round((50 - Math.floor(overs)) * parseFloat(rr) + runs);

  const sparkPoints = Array.from({ length: 8 }).map((_, i) => `${i * 12},${120 - (Math.sin(i * 0.9) * 30 + runs % 40)}`);

  return (
    <div className="glass rounded-lg p-3 border border-white/8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black text-white/60">Score Analysis</div>
          <div className="mt-2 text-2xl font-extrabold">{runs}/{wickets}</div>
          <div className="text-sm text-white/60">Overs: {overs} · RR: {rr}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Projected 50</div>
          <motion.div className="text-xl font-black text-teal-200" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>{projected}</motion.div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <svg width="120" height="40" viewBox="0 0 96 40" className="block">
          <polyline fill="none" stroke="#22d3ee" strokeWidth="2" points={sparkPoints.join(' ')} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div className="text-xs text-white/60">Recent form: visualized</div>
      </div>
    </div>
  );
}
