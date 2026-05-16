'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRealtimeMatch } from '@/hooks/useRealtimeMatch';
import { useMomentumEngine } from '@/hooks/useMomentumEngine';
import { useFanReactions } from '@/hooks/useFanReactions';
import { useFanStore } from '@/store/fanStore';
import { usePredictions } from '@/hooks/usePredictions';
import { useArenaAudio } from '@/hooks/useArenaAudio';
import StadiumAtmosphere from '@/components/stadium/StadiumAtmosphere';
import LiveMatchHeader from '@/components/match/LiveMatchHeader';
import MomentumEngine from '@/components/match/MomentumEngine';
import SocialFanEcosystem from '@/components/match/SocialFanEcosystem';
import PredictionCards from '@/components/match/PredictionCards';
import BoundaryViewer from '@/components/match/BoundaryViewer';
import AICommentary from '@/components/match/AICommentary';
import PlayerAvatar from '@/components/avatars/AvatarModel';
import DRSReviewOverlay from '@/components/moments/DRSReviewOverlay';
import OverBreakPanel from '@/components/moments/OverBreakPanel';
import LiveBallTracer from '@/components/moments/LiveBallTracer';
import MilestoneBlast from '@/components/moments/MilestoneBlast';
import { useMatchPhaseStore } from '@/store/matchPhaseStore';
import type { Ball, FanReaction, Inning, Match, MatchPhase, Prediction } from '@/types/match';

type Dock = 'score' | 'predict' | 'fans' | 'intel';

const DOCKS: { id: Dock; label: string }[] = [
  { id: 'score', label: 'Score' },
  { id: 'predict', label: 'Predict' },
  { id: 'fans', label: 'Fans' },
  { id: 'intel', label: 'Intel' },
];

export default function LiveMatchPage() {
  const { match, stats, lastBall } = useRealtimeMatch();
  const momentum = useMomentumEngine();
  // use global fan store for shared reactions
  const reactions = useFanStore((s) => s.reactions);
  const simulateReactions = useFanStore((s) => s.simulateReactions);
  const { pendingPredictions } = usePredictions();
  const { phase } = useMatchPhaseStore();
  const [dock, setDock] = useState<Dock>('score');
  const [isHydrated, setIsHydrated] = useState(false);

  // Suppress hydration mismatch warnings by only rendering after hydration
  useLayoutEffect(() => {
    setIsHydrated(true);
  }, []);

  useArenaAudio({
    momentumValue: momentum.momentumValue,
    crowdEnergy: momentum.crowdEnergy,
    lastTrigger: momentum.lastTrigger,
    lastBall: lastBall ?? null,
    phase,
  });

  useEffect(() => {
    if (!lastBall) return;
    if (lastBall.runs === 6) simulateReactions(18, 'boundary');
    else if (lastBall.runs === 4) simulateReactions(10, 'boundary');
    else if (lastBall.isWicket) simulateReactions(12, 'wicket');
  }, [lastBall, simulateReactions]);

  if (!match) {
    return (
      <>
        <StadiumAtmosphere />
        <div className="relative z-10 grid min-h-screen place-items-center bg-black/20">
          <motion.div
            className="border border-teal-200/30 bg-black/45 px-8 py-7 text-center backdrop-blur-xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-teal-200/70">Booting Arena OS</p>
            <p className="mt-4 text-4xl font-black">Floodlights warming</p>
            <div className="mt-5 h-1 w-72 overflow-hidden bg-white/10">
              <motion.div className="h-full bg-teal-200" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.1, repeat: Infinity }} />
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  const inning = match.innings[match.currentInning - 1];

  return (
    <>
      <StadiumAtmosphere
        momentumValue={momentum.momentumValue}
        crowdEnergy={momentum.crowdEnergy}
        lastTrigger={momentum.lastTrigger}
        phase={phase}
        lastBall={lastBall ?? null}
      />

      <DRSReviewOverlay />
      <MilestoneBlast />
      <OverBreakPanel />
      <LiveBallTracer lastBall={lastBall ?? null} />

      <main className="relative z-10 min-h-screen overflow-hidden text-white">
        <PhaseRibbon phase={phase} />

        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[96px_minmax(0,1fr)_360px] 2xl:grid-cols-[104px_minmax(0,1fr)_390px]">
          <CommandRail momentumValue={momentum.momentumValue} activeDock={dock} onDockChange={setDock} />

          <section className="flex min-w-0 flex-col px-3 py-3 sm:px-5 lg:px-6">
            <TopBar match={match} inning={inning} lastBall={lastBall ?? null} />

            <div className="grid flex-1 gap-4 py-4 2xl:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.62fr)]">
              <div className="flex min-w-0 flex-col gap-4">
                <ArenaCanvas inning={inning} momentumValue={momentum.momentumValue} lastBall={lastBall ?? null} />
                <LiveMatchHeader match={match} stats={stats} momentum={momentum} lastBall={lastBall ?? null} />
              </div>

              <div className="hidden min-w-0 flex-col gap-4 2xl:flex">
                <AICommentary match={match} momentum={momentum} phase={phase} lastBall={lastBall ?? null} />
                <MomentumEngine momentum={momentum} battingTeam={inning.battingTeam} bowlingTeam={inning.bowlingTeam} />
              </div>
            </div>
          </section>

          <aside className="hidden border-l border-white/10 bg-black/42 p-4 backdrop-blur-2xl xl:flex xl:flex-col xl:gap-4">
            <AnimatePresence mode="wait">
              {dock === 'score' && (
                <motion.div key="score" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <SidePanel match={match} inning={inning} momentumValue={momentum.momentumValue} lastBall={lastBall ?? null} />
                </motion.div>
              )}
              {dock === 'predict' && (
                <motion.div key="predict" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <div className="space-y-3">
                    <PredictionCards predictions={pendingPredictions} />
                    <div className="glass rounded-lg border border-white/6 p-2">
                      <div className="text-xs font-black text-white/60 mb-2">Boundary Viewer</div>
                      <BoundaryViewer lastBall={lastBall} />
                    </div>
                  </div>
                </motion.div>
              )}
              {dock === 'fans' && (
                <motion.div key="fans" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <SocialFanEcosystem />
                </motion.div>
              )}
              {dock === 'intel' && (
                <motion.div key="intel" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                  <AICommentary match={match} momentum={momentum} phase={phase} lastBall={lastBall ?? null} />
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>

        <MobileDock
          dock={dock}
          onDockChange={setDock}
          match={match}
          inning={inning}
          momentum={momentum}
          phase={phase}
          lastBall={lastBall ?? null}
          predictions={pendingPredictions}
          reactions={reactions}
          simulateReactions={simulateReactions}
        />
      </main>
    </>
  );
}

function CommandRail({
  momentumValue,
  activeDock,
  onDockChange,
}: {
  momentumValue: number;
  activeDock: Dock;
  onDockChange: (dock: Dock) => void;
}) {
  return (
    <aside className="hidden border-r border-white/10 bg-black/48 backdrop-blur-2xl lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-5">
      <div className="vertical-chip">iON LIVE</div>
      <div className="flex flex-col gap-3">
        {DOCKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onDockChange(item.id)}
            className={`flex h-14 w-14 items-center justify-center border text-[10px] font-black uppercase tracking-widest transition ${
              activeDock === item.id
                ? 'border-teal-200 bg-teal-200 text-black shadow-[0_0_24px_rgba(45,212,191,0.28)]'
                : 'border-white/12 bg-white/6 text-white/48 hover:border-white/30'
            }`}
          >
            {item.label.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="h-40 w-2 overflow-hidden bg-white/10">
        <motion.div className="w-full bg-teal-200" animate={{ height: `${momentumValue}%` }} transition={{ duration: 0.7 }} />
      </div>
    </aside>
  );
}

function TopBar({ match, inning, lastBall }: { match: Match; inning: Inning; lastBall: Ball | null }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-teal-200/70">Arena OS match control</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-normal sm:text-4xl">
          {inning.battingTeam} vs {inning.bowlingTeam}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="border border-red-300/30 bg-red-500/12 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-red-200">Live</div>
        <div className="hidden max-w-64 truncate border border-white/10 bg-white/6 px-3 py-2 text-xs font-bold text-white/58 sm:block">
          {lastBall?.description ?? match.venue}
        </div>
      </div>
    </header>
  );
}

function ArenaCanvas({ inning, momentumValue, lastBall }: { inning: Inning; momentumValue: number; lastBall: Ball | null }) {
  const celebration = lastBall?.isWicket ? 'wicket' : lastBall?.runs === 4 || lastBall?.runs === 6 ? 'boundary' : 'none';

  return (
    <section className="relative min-h-[430px] overflow-hidden border border-white/10 bg-black/44 backdrop-blur-xl lg:min-h-[520px]">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,184,166,0.16),transparent_38%),radial-gradient(circle_at_50%_60%,rgba(255,255,255,0.12),transparent_30%)]" />
      <div className="absolute inset-x-10 top-10 h-px bg-teal-200/40" />
      <div className="absolute bottom-0 left-1/2 h-52 w-[88%] -translate-x-1/2 rounded-t-full border border-teal-200/22 bg-[radial-gradient(ellipse_at_50%_100%,rgba(34,197,94,0.24),transparent_67%)]" />

      <motion.div
        className="absolute left-1/2 top-[48%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 border border-teal-200/30"
        animate={{ rotate: 360, scale: [0.88, 1.08, 0.88] }}
        transition={{ rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, scale: { duration: 3.2, repeat: Infinity } }}
      />

      <div className="relative z-10 grid h-full min-h-[430px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-8 lg:min-h-[520px] lg:px-8">
        {/* BoundaryViewer removed from arena overlay to avoid overlap; shown in Predict dock instead */}
        <PlayerAvatar player={inning.batsmen.striker} isActive celebration={celebration === 'boundary' ? 'boundary' : 'none'} align="left" label="Batting" />

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-white/38">score core</p>
          <motion.p
            className="mt-3 text-7xl font-black leading-none sm:text-8xl"
            animate={lastBall ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.42 }}
          >
            {inning.totalRuns}
            <span className="text-4xl text-white/38">/{inning.totalWickets}</span>
          </motion.p>
          <p className="mt-3 text-sm font-black uppercase tracking-[0.22em] text-teal-200/78">
            Momentum {Math.round(momentumValue)}%
          </p>
          <div className="mt-5 flex justify-center gap-1.5">
            {inning.overs[inning.overs.length - 1]?.balls.slice(-6).map((ball) => (
              <span key={ball.id} className="grid h-9 w-9 place-items-center border border-white/12 bg-white/8 text-xs font-black">
                {ball.isWicket ? 'W' : ball.runs}
              </span>
            ))}
          </div>
        </div>

        <PlayerAvatar player={inning.bowler} isActive celebration={celebration === 'wicket' ? 'wicket' : 'none'} align="right" label="Bowling" />
      </div>
    </section>
  );
}

function SidePanel({
  match,
  inning,
  momentumValue,
  lastBall,
}: {
  match: Match;
  inning: Inning;
  momentumValue: number;
  lastBall: Ball | null;
}) {
  return (
    <section className="border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/42">Match telemetry</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Telemetry label="Overs" value={`${inning.totalOvers}.${inning.overs[inning.overs.length - 1]?.balls.length ?? 0}`} />
        <Telemetry label="Pressure" value={`${Math.round(momentumValue)}%`} />
        <Telemetry label="Inning" value={`${match.currentInning}`} />
      </div>
      <div className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/58">
        <p className="font-bold text-white/80">{match.venue}</p>
        <p className="mt-2">{lastBall?.description ?? `${match.tossInfo.winner} chose to ${match.tossInfo.decision}`}</p>
      </div>
    </section>
  );
}

function Telemetry({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black/22 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/34">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function PhaseRibbon({ phase }: { phase: string }) {
  return (
    <AnimatePresence>
      {phase !== 'live' && (
        <motion.div
          initial={{ y: -44, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -44, opacity: 0 }}
          className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/80 py-3 text-center text-xs font-black uppercase tracking-[0.28em] text-teal-100 backdrop-blur-xl"
        >
          {phase === 'drs_review' ? 'Decision review chamber active' : 'Over break command window'}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileDock({
  dock,
  onDockChange,
  match,
  inning,
  momentum,
  phase,
  lastBall,
  predictions,
}: {
  dock: Dock;
  onDockChange: (dock: Dock) => void;
  match: Match;
  inning: Inning;
  momentum: ReturnType<typeof useMomentumEngine>;
  phase: MatchPhase;
  lastBall: Ball | null;
  predictions: Prediction[];
}) {
  const reactions = useFanStore((s) => s.reactions);
  const simulateReactions = useFanStore((s) => s.simulateReactions);

  return (
    <div className="xl:hidden">
      <div className="px-3 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={dock}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-3"
          >
            {dock === 'score' && <SidePanel match={match} inning={inning} momentumValue={momentum.momentumValue} lastBall={lastBall} />}
            {dock === 'predict' && (
              <div className="space-y-3">
                <PredictionCards predictions={predictions} />
                <div className="glass rounded-lg border border-white/6 p-2">
                  <div className="text-xs font-black text-white/60 mb-2">Boundary Viewer</div>
                  <BoundaryViewer lastBall={lastBall} />
                </div>
              </div>
            )}
            {dock === 'fans' && <SocialFanEcosystem />}
            {dock === 'intel' && <AICommentary match={match} momentum={momentum} phase={phase} lastBall={lastBall} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-white/10 bg-black/88 backdrop-blur-2xl">
        {DOCKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onDockChange(item.id)}
            className={`py-4 text-xs font-black uppercase tracking-[0.18em] ${
              dock === item.id ? 'bg-teal-200 text-black' : 'text-white/44'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
