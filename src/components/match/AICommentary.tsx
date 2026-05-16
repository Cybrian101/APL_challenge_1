'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ball, Match, MatchPhase } from '@/types/match';

interface AICommentaryProps {
  match: Match;
  lastBall?: Ball | null;
  momentum: {
    momentumValue: number;
    momentumTrend: string;
    crowdEnergy: number;
    lastTrigger?: string;
  };
  phase: MatchPhase;
}

interface IntelligenceBeat {
  id: string;
  title: string;
  body: string;
  mood: 'surge' | 'pressure' | 'control' | 'calm' | 'explosive' | 'strategic';
  source: 'Gemini' | 'Arena AI';
  insight?: string; // Additional strategic insight
}

const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';

export default function AICommentary({ match, lastBall, momentum, phase }: AICommentaryProps) {
  const [beats, setBeats] = useState<IntelligenceBeat[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const inning = match.innings[match.currentInning - 1];
  const baseBeat = useMemo(() => buildLocalBeat(match, lastBall, momentum, phase), [match, lastBall, momentum, phase]);

  useEffect(() => {
    let mounted = true;
    const ballId = lastBall?.id ?? `phase-${phase}-${match.id}`;

    async function generateBeat() {
      const localBeat = { ...baseBeat, id: `ai-${ballId}` };
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey || apiKey.includes('your_')) {
        setBeats((prev) => [localBeat, ...prev.filter((beat) => beat.id !== localBeat.id)].slice(0, 4));
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsThinking(true);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: [
                        'Write one premium cinematic second-screen cricket insight.',
                        'Avoid sounding like a chatbot. Maximum 22 words.',
                        `Match: ${inning.battingTeam} ${inning.totalRuns}/${inning.totalWickets} vs ${inning.bowlingTeam}.`,
                        `Momentum: ${Math.round(momentum.momentumValue)}%, trend ${momentum.momentumTrend}.`,
                        `Phase: ${phase}. Last ball: ${lastBall?.description ?? 'arena initializing'}.`,
                      ].join(' '),
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 50,
              },
            }),
          }
        );

        if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);

        const data = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!mounted) return;

        setBeats((prev) => [
          {
            ...localBeat,
            body: text || localBeat.body,
            source: text ? 'Gemini' as const : 'Arena AI' as const,
          },
          ...prev.filter((beat) => beat.id !== localBeat.id),
        ].slice(0, 4));
      } catch {
        if (!mounted || controller.signal.aborted) return;
        setBeats((prev) => [localBeat, ...prev.filter((beat) => beat.id !== localBeat.id)].slice(0, 4));
      } finally {
        if (mounted && !controller.signal.aborted) setIsThinking(false);
      }
    }

    generateBeat();

    return () => {
      mounted = false;
    };
  }, [baseBeat, inning.battingTeam, inning.bowlingTeam, inning.totalRuns, inning.totalWickets, lastBall?.description, lastBall?.id, match.id, momentum.momentumTrend, momentum.momentumValue, phase]);

  const activeBeat = beats[0] ?? baseBeat;
  const pressureLabel = getPressureLabel(momentum.momentumValue, phase);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden rounded-xl border border-cyan-300/20 bg-slate-950/70 p-4 shadow-2xl shadow-cyan-950/30"
      style={{ backdropFilter: 'blur(18px)' }}
    >
      <motion.div
        className="absolute inset-0 opacity-25"
        animate={{
          background: [
            'radial-gradient(circle at 12% 24%, rgba(34,211,238,0.42), transparent 34%)',
            'radial-gradient(circle at 84% 12%, rgba(244,114,182,0.35), transparent 36%)',
            'radial-gradient(circle at 12% 24%, rgba(34,211,238,0.42), transparent 34%)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/60">Match Intelligence</p>
            <h3 className="mt-1 text-lg font-black text-white">AI Arena Director</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60">
            {isThinking ? 'Reading' : activeBeat.source}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeBeat.id}
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
            transition={{ duration: 0.35 }}
            className="rounded-lg border border-white/10 bg-black/22 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className={`text-xs font-black uppercase tracking-[0.18em] ${getMoodClass(activeBeat.mood)}`}>
                {activeBeat.title}
              </span>
              <span className="text-[10px] font-bold text-white/35">{pressureLabel}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/82">{activeBeat.body}</p>
            {activeBeat.insight && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
                className="mt-2 pt-2 border-t border-white/10 text-xs text-cyan-300/70 italic"
              >
                💡 {activeBeat.insight}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Metric label="Pressure" value={`${Math.round(momentum.momentumValue)}%`} tone={momentum.momentumValue > 65 ? 'hot' : 'cool'} />
          <Metric label="Crowd" value={`${Math.round(momentum.crowdEnergy * 100)}%`} tone={momentum.crowdEnergy > 0.65 ? 'hot' : 'cool'} />
          <Metric label="Trigger" value={formatTrigger(momentum.lastTrigger)} tone={momentum.lastTrigger === 'wicket' ? 'danger' : 'cool'} />
        </div>
      </div>
    </motion.section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'cool' | 'hot' | 'danger' }) {
  const toneClass = tone === 'hot' ? 'text-orange-300' : tone === 'danger' ? 'text-red-300' : 'text-cyan-200';
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</p>
      <p className={`mt-1 text-sm font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function buildLocalBeat(match: Match, lastBall: Ball | null | undefined, momentum: AICommentaryProps['momentum'], phase: MatchPhase): IntelligenceBeat {
  const inning = match.innings[match.currentInning - 1];
  const batter = inning.batsmen.striker.name.split(' ').pop() ?? inning.batsmen.striker.name;
  const bowler = inning.bowler.name.split(' ').pop() ?? inning.bowler.name;
  const runRate = inning.totalOvers > 0 ? (inning.totalRuns / inning.totalOvers).toFixed(1) : '0';

  if (phase === 'drs_review') {
    return {
      id: `ai-drs-${match.id}`,
      title: 'Decision Chamber',
      body: `The arena has gone silent: ${bowler} forced the question, and every heartbeat in the stadium hangs on the verdict. This changes everything.`,
      mood: 'pressure',
      source: 'Arena AI',
      insight: 'DRS challenges often shift momentum—the losing decision can swing 10% pressure instantly.',
    };
  }

  if (lastBall?.isWicket) {
    const isHatTrick = lastBall.milestone === 'hat_trick';
    return {
      id: `ai-${lastBall.id}`,
      title: isHatTrick ? '⚡ HAT TRICK' : 'Pressure Spike',
      body: isHatTrick
        ? `${bowler} has entered LEGEND STATUS. Three in a row. The crowd is ELECTRIC and ${inning.battingTeam} are in FREEFALL.`
        : `${bowler} has ripped the rhythm to shreds. New batter at crease—${inning.battingTeam} need calm, focus, and ONE reset moment.`,
      mood: 'explosive',
      source: 'Arena AI',
      insight: `Partnership broken. Psychological edge: 7-8% momentum swing to bowler.`,
    };
  }

  if (lastBall?.runs === 6 || momentum.lastTrigger === 'six') {
    return {
      id: `ai-${lastBall?.id ?? match.id}`,
      title: 'BOUNDARY SURGE',
      body: `${batter} UNLEASHED THE BEAST. Six cleanly over the field. Boundary rider energy flooding the arena. Bowler under SIEGE.`,
      mood: 'surge',
      source: 'Arena AI',
      insight: `Critical strike. Next ball is HIGH RISK—bowler must respond with aggression or lose control.`,
    };
  }

  if (lastBall?.runs === 4 || momentum.lastTrigger === 'boundary') {
    return {
      id: `ai-${lastBall?.id ?? match.id}`,
      title: 'Tempo Lift',
      body: `Four crisp runs. ${inning.battingTeam} finding the gaps now. Field is being dissected—pressure zone is SHRINKING.`,
      mood: 'surge',
      source: 'Arena AI',
      insight: `Batter in rhythm. Watch for the yorker or slower ball trap—conventional bowling may fail here.`,
    };
  }

  if (momentum.momentumValue < 38 || lastBall?.isDot) {
    return {
      id: `ai-${lastBall?.id ?? match.id}`,
      title: 'Bowlers Kingdom',
      body: `${bowler} is SQUEEZING the scoring lanes tight. ${batter} faces NO options. One clean shot now could break the spell—or a dot could deepen the pressure.`,
      mood: 'control',
      source: 'Arena AI',
      insight: `This is where composure matters most. A boundary here swings 12% momentum; a dot solidifies control.`,
    };
  }

  if (momentum.momentumValue > 75) {
    return {
      id: `ai-${lastBall?.id ?? match.id}`,
      title: '🔥 PEAK MOMENTUM',
      body: `CHAOS IN THE ARENA. ${inning.battingTeam} are RELENTLESS. Every ball feels like a threat. Bowlers are under SIEGE and running out of ideas.`,
      mood: 'explosive',
      source: 'Arena AI',
      insight: `Historical data: Teams rarely recover from 75%+ momentum without a WICKET. Danger zone active.`,
    };
  }

  return {
    id: `ai-${lastBall?.id ?? match.id}`,
    title: 'Live Read',
    body: `${inning.battingTeam} cruise at ${runRate} RR. Balanced but not safe. One boundary tilts momentum toward euphoria; one dot tightens the noose.`,
    mood: 'calm',
    source: 'Arena AI',
    insight: `Run rate is sustainable. Next 3 balls will determine if this inning accelerates or plateaus.`,
  };
}

function getMoodClass(mood: IntelligenceBeat['mood']) {
  if (mood === 'surge') return 'text-orange-300';
  if (mood === 'pressure') return 'text-red-300';
  if (mood === 'control') return 'text-violet-300';
  if (mood === 'explosive') return 'text-yellow-300 animate-pulse';
  if (mood === 'strategic') return 'text-emerald-300';
  return 'text-cyan-200';
}

function getPressureLabel(momentumValue: number, phase: MatchPhase) {
  if (phase === 'drs_review') return 'review lock';
  if (momentumValue > 72) return 'redline';
  if (momentumValue > 58) return 'rising';
  if (momentumValue < 38) return 'bowler hold';
  return 'balanced';
}

function formatTrigger(trigger?: string) {
  if (!trigger) return 'Live';
  if (trigger === 'noball') return 'No ball';
  return trigger.charAt(0).toUpperCase() + trigger.slice(1);
}
