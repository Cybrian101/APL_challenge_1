import { create } from 'zustand';
import { Match, Inning, Ball } from '@/types/match';

interface MatchState {
  currentMatch: Match | null;
  lastBallEvent: Ball | null;
  setCurrentMatch: (match: Match) => void;
  setLastBallEvent: (ball: Ball) => void;
  updateScore: (runs: number, isBoundary: boolean) => void;
  addBall: (ball: Ball) => void;
  updateWicket: () => void;
  completeInning: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  currentMatch: null,
  lastBallEvent: null,
  setCurrentMatch: (match) => set({ currentMatch: match }),
  setLastBallEvent: (ball) => set({ lastBallEvent: ball }),
  updateScore: (runs, isBoundary) =>
    set((state) => {
      if (!state.currentMatch) return state;
      const match = { ...state.currentMatch };
      const inning = match.innings[match.currentInning - 1];
      if (inning) {
        inning.totalRuns += runs;
      }
      return { currentMatch: match };
    }),
  addBall: (ball) =>
    set((state) => {
      if (!state.currentMatch) return state;
      const match = { ...state.currentMatch };
      const inning = match.innings[match.currentInning - 1];
      if (inning && inning.overs.length > 0) {
        const lastOver = inning.overs[inning.overs.length - 1];
        lastOver.balls.push(ball);
        lastOver.runsInOver += ball.runs;
      }
      return { currentMatch: match };
    }),
  updateWicket: () =>
    set((state) => {
      if (!state.currentMatch) return state;
      const match = { ...state.currentMatch };
      const inning = match.innings[match.currentInning - 1];
      if (inning) {
        inning.totalWickets += 1;
      }
      return { currentMatch: match };
    }),
  completeInning: () =>
    set((state) => {
      if (!state.currentMatch) return state;
      const match = { ...state.currentMatch };
      const inning = match.innings[match.currentInning - 1];
      if (inning) {
        inning.status = 'completed';
      }
      return { currentMatch: match };
    }),
}));
