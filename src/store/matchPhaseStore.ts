import { create } from 'zustand';
import { MatchPhase, MatchMoment, MilestoneType, Ball } from '@/types/match';

interface DRSData {
  ballDescription: string;
  batsmanName: string;
  bowlerName: string;
  fanVotes: { out: number; notOut: number };
  result?: 'out' | 'not_out';
}

interface OverBreakData {
  overNumber: number;
  runsInOver: number;
  wicketsInOver: number;
  ballSummary: number[]; // runs per ball
  nextOverPredictionQuestion?: string;
}

interface MilestoneData {
  milestoneType: MilestoneType;
  playerName?: string;
  teamName?: string;
  value?: number;
}

interface MatchPhaseState {
  phase: MatchPhase;
  moment: MatchMoment | null;
  drsData: DRSData | null;
  overBreakData: OverBreakData | null;
  milestoneData: MilestoneData | null;
  lastBallEvent: Ball | null;
  phaseEndTime: number | null;
  // Actions
  enterDRS: (data: DRSData) => void;
  voteDRS: (vote: 'out' | 'notOut') => void;
  revealDRS: (result: 'out' | 'not_out') => void;
  enterOverBreak: (data: OverBreakData) => void;
  enterMilestone: (data: MilestoneData) => void;
  exitPhase: () => void;
  setLastBallEvent: (ball: Ball) => void;
  isInBreak: () => boolean;
}

export const useMatchPhaseStore = create<MatchPhaseState>((set, get) => ({
  phase: 'live',
  moment: null,
  drsData: null,
  overBreakData: null,
  milestoneData: null,
  lastBallEvent: null,
  phaseEndTime: null,

  enterDRS: (data) =>
    set({
      phase: 'drs_review',
      drsData: data,
      phaseEndTime: Date.now() + 16000,
      moment: {
        id: `drs-${Date.now()}`,
        type: 'drs',
        phase: 'drs_review',
        durationMs: 16000,
        data: data as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      },
    }),

  voteDRS: (vote) =>
    set((state) => {
      if (!state.drsData) return state;
      return {
        drsData: {
          ...state.drsData,
          fanVotes: {
            out: vote === 'out' ? state.drsData.fanVotes.out + 1 : state.drsData.fanVotes.out,
            notOut: vote === 'notOut' ? state.drsData.fanVotes.notOut + 1 : state.drsData.fanVotes.notOut,
          },
        },
      };
    }),

  revealDRS: (result) =>
    set((state) => ({
      drsData: state.drsData ? { ...state.drsData, result } : null,
    })),

  enterOverBreak: (data) =>
    set({
      phase: 'over_break',
      overBreakData: data,
      phaseEndTime: Date.now() + 12000,
      moment: {
        id: `over-break-${Date.now()}`,
        type: 'over_break',
        phase: 'over_break',
        durationMs: 12000,
        data: data as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      },
    }),

  enterMilestone: (data) =>
    set({
      milestoneData: data,
      moment: {
        id: `milestone-${Date.now()}`,
        type: 'milestone',
        phase: 'live',
        durationMs: 3500,
        data: data as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      },
    }),

  exitPhase: () =>
    set({
      phase: 'live',
      moment: null,
      drsData: null,
      overBreakData: null,
      milestoneData: null,
      phaseEndTime: null,
    }),

  setLastBallEvent: (ball) => set({ lastBallEvent: ball }),

  isInBreak: () => {
    const { phase } = get();
    return phase !== 'live';
  },
}));
