"use client";

import ScoreAnalysis from './ScoreAnalysis';
import BoundaryPrediction from './BoundaryPrediction';
import { motion } from 'framer-motion';

export default function AnalyticsPanel() {
  const report = {
    timestamp: Date.now(),
    score: { runs: 148, wickets: 4, overs: 17.2 },
    boundaryProb: 0.38,
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-teal-200/70">Analytics</div>
          <div className="text-sm font-black text-white/70">Score, predictions & reports</div>
        </div>
        <div>
          <button onClick={downloadReport} className="px-3 py-1 text-xs font-black bg-teal-200 text-black rounded">Download</button>
        </div>
      </div>

      <div className="grid gap-3">
        <ScoreAnalysis />
        <BoundaryPrediction />
      </div>
    </motion.div>
  );
}
