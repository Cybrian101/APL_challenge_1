'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Match, Ball } from '@/types/match';
import { useEffect, useState } from 'react';

interface LiveMatchHeaderProps {
  match: Match;
  stats: { runRate?: string; [key: string]: unknown } | undefined;
  momentum: { momentumValue: number; momentumTrend: string; glowIntensity: number };
  lastBall?: Ball | null;
}

// Color scheme per team
const TEAM_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  CSK: { primary: '#f5a623', secondary: '#1a237e', accent: '#ffeb3b' },
  MI: { primary: '#004ba0', secondary: '#ffffff', accent: '#1565c0' },
  RCB: { primary: '#cc0000', secondary: '#f5a623', accent: '#ff1744' },
  KKR: { primary: '#3d0066', secondary: '#f5a623', accent: '#7b1fa2' },
  RR: { primary: '#e91e8c', secondary: '#002b7f', accent: '#f06292' },
  SRH: { primary: '#ff6d00', secondary: '#212121', accent: '#ff8f00' },
  DC: { primary: '#004c93', secondary: '#ef0024', accent: '#1565c0' },
  PBKS: { primary: '#d71920', secondary: '#a7a9ac', accent: '#ef5350' },
  GT: { primary: '#1c4191', secondary: '#b5862f', accent: '#3949ab' },
  LSG: { primary: '#a72056', secondary: '#f5a623', accent: '#c62828' },
};

function getTeamColor(team: string) {
  return TEAM_COLORS[team] || { primary: '#22d3ee', secondary: '#8b5cf6', accent: '#06b6d4' };
}

function BallPip({ ball }: { ball: Ball | null | undefined }) {
  if (!ball)
    return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
      <div className="w-1 h-1 rounded-full bg-white/20" />
    </div>;
  if (ball.isWicket)
    return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-600 border-2 border-red-300 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-red-500/60">W</div>;
  if (ball.isWide)
    return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-500/30 border border-yellow-400 flex items-center justify-center text-xs font-bold text-yellow-300">Wd</div>;
  if (ball.isNoBall)
    return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-500/30 border border-orange-400 flex items-center justify-center text-xs font-bold text-orange-300">Nb</div>;
  if (ball.runs === 6)
    return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-yellow-500/60">6</div>;
  if (ball.runs === 4)
    return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-green-300 to-emerald-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-green-500/50">4</div>;
  if (ball.runs === 0)
    return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-gray-500">·</div>;
  return <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-cyan-300">{ball.runs}</div>;
}

export default function LiveMatchHeader({ match, stats, momentum, lastBall }: LiveMatchHeaderProps) {
  const inning = match.innings[match.currentInning - 1];
  const [wicketFlash, setWicketFlash] = useState(false);
  const [prevRuns, setPrevRuns] = useState(inning.totalRuns);
  const [scoreJump, setScoreJump] = useState(false);

  const battingColors = getTeamColor(inning.battingTeam);
  const bowlingColors = getTeamColor(inning.bowlingTeam);

  useEffect(() => {
    if (!lastBall?.isWicket) return;
    setWicketFlash(true);
    const t = setTimeout(() => setWicketFlash(false), 1200);
    return () => clearTimeout(t);
  }, [lastBall]);

  useEffect(() => {
    if (inning.totalRuns !== prevRuns && inning.totalRuns > 0) {
      setScoreJump(true);
      setPrevRuns(inning.totalRuns);
      const t = setTimeout(() => setScoreJump(false), 400);
      return () => clearTimeout(t);
    }
  }, [inning.totalRuns, prevRuns]);

  const currentOver = inning.overs[inning.overs.length - 1];
  const lastSixBalls: (Ball | null)[] = currentOver
    ? [...Array(6)].map((_, i) => {
        const legal = currentOver.balls.filter(() => true);
        return legal[i] ?? null;
      })
    : Array(6).fill(null);

  return (
    <div className="relative overflow-hidden">
      {/* Wicket flash */}
      <AnimatePresence>
        {wicketFlash && (
          <motion.div className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
            initial={{ opacity: 0.7 }} animate={{ opacity: [0.7, 0, 0.4, 0] }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.5) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Main scoreboard */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          background: 'rgba(5, 0, 30, 0.75)',
          backdropFilter: 'blur(20px)',
          borderColor: wicketFlash ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.1)',
          boxShadow: wicketFlash
            ? '0 0 40px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Top strip — LIVE badge + venue */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-red-400 text-xs font-black tracking-widest">LIVE</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs truncate max-w-40 md:max-w-none">{match.venue.split(',')[0]}</span>
          </div>
          <div className="text-white/40 text-xs">
            Innings {match.currentInning}
          </div>
        </div>

        {/* Big score section */}
        <div className="px-4 pt-4 pb-3">
          {/* Team names & scores */}
          <div className="flex items-stretch gap-3 mb-4">

            {/* Batting team */}
            <div className="flex-1 rounded-xl p-3 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${battingColors.primary}22, ${battingColors.primary}08)`, border: `1px solid ${battingColors.primary}40` }}>
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: battingColors.primary }} />
              <p className="text-white/60 text-xs font-bold tracking-wider mb-1 pl-2">{inning.battingTeam} 🏏</p>
              <div className="pl-2">
                <motion.div
                  animate={scoreJump ? { scale: [1, 1.12, 1], y: [0, -3, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  className="text-5xl md:text-6xl font-black leading-none"
                  style={{ color: battingColors.accent, textShadow: `0 0 30px ${battingColors.primary}80` }}
                >
                  {inning.totalRuns}
                  <span className="text-2xl md:text-3xl font-bold opacity-70 ml-1">/{inning.totalWickets}</span>
                </motion.div>
                <p className="text-white/50 text-sm mt-1">
                  {inning.totalOvers}.{currentOver?.balls.filter(b => !b.isWide && !b.isNoBall).length ?? 0} ov
                  <span className="ml-2 text-white/30">CRR: {stats?.runRate ?? '0.00'}</span>
                </p>
              </div>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-white/20 text-xs font-bold">vs</div>
              <div className="w-px h-8 bg-white/10" />
            </div>

            {/* Bowling team */}
            <div className="flex-1 rounded-xl p-3 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${bowlingColors.primary}15, ${bowlingColors.primary}05)`, border: `1px solid ${bowlingColors.primary}30` }}>
              <div className="absolute top-0 right-0 w-1 h-full rounded-r-xl" style={{ background: bowlingColors.primary }} />
              <p className="text-white/40 text-xs font-bold tracking-wider mb-1">🎳 {inning.bowlingTeam}</p>
              <div>
                <p className="text-3xl md:text-4xl font-black text-white/30 leading-none">—</p>
                <p className="text-white/30 text-xs mt-1">Yet to bat</p>
              </div>
            </div>
          </div>

          {/* This over — ball pips */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/30 text-xs font-semibold shrink-0">THIS OVER</span>
            <div className="flex gap-1.5">
              {lastSixBalls.map((ball, i) => (
                <motion.div key={i}
                  initial={ball ? { scale: 1.4, opacity: 0 } : {}}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}>
                  <BallPip ball={ball} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Batsmen & Bowler — mobile: 2-col grid, stacked */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-3 border-t border-white/5">
            {/* Striker */}
            <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <p className="text-white/40 text-xs font-bold tracking-wider">STRIKER</p>
              </div>
              <p className="text-white font-bold text-sm truncate leading-tight">{inning.batsmen.striker.name.split(' ').pop()}</p>
              <p className="font-black text-lg leading-tight" style={{ color: battingColors.accent }}>
                {inning.batsmen.striker.stats.runs}
                <span className="text-white/30 text-xs font-normal ml-1">({inning.batsmen.striker.stats.ballsFaced})</span>
              </p>
              <p className="text-white/30 text-xs">{inning.batsmen.striker.stats.fours}×4 · {inning.batsmen.striker.stats.sixes}×6</p>
            </div>

            {/* Non-striker */}
            <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
              <p className="text-white/40 text-xs font-bold tracking-wider mb-1">NON-STRIKER</p>
              <p className="text-white font-bold text-sm truncate leading-tight">{inning.batsmen.nonStriker.name.split(' ').pop()}</p>
              <p className="text-white/50 font-black text-lg leading-tight">
                {inning.batsmen.nonStriker.stats.runs}
                <span className="text-white/25 text-xs font-normal ml-1">({inning.batsmen.nonStriker.stats.ballsFaced})</span>
              </p>
            </div>

            {/* Bowler */}
            <div className="col-span-2 md:col-span-1 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
              <p className="text-white/40 text-xs font-bold tracking-wider mb-1">🎳 BOWLER</p>
              <p className="text-white font-bold text-sm truncate leading-tight">{inning.bowler.name.split(' ').pop()}</p>
              <p className="font-black text-lg leading-tight text-purple-400">
                {inning.bowler.stats.wickets}W–{inning.bowler.stats.runs}
                <span className="text-white/30 text-xs font-normal ml-1">({inning.bowler.stats.economy.toFixed(1)} eco)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Momentum strip */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs shrink-0">MOMENTUM</span>
            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-1.5 rounded-full"
                animate={{
                  width: `${momentum.momentumValue}%`,
                  background: momentum.momentumValue > 65
                    ? 'linear-gradient(90deg,#f97316,#ef4444)'
                    : 'linear-gradient(90deg,#22d3ee,#8b5cf6)',
                }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="text-white/30 text-xs shrink-0">{Math.round(momentum.momentumValue)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
