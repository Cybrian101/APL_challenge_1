import { create } from 'zustand';
import { Momentum } from '@/types/match';

interface MomentumState {
  momentum: Momentum;
  setMomentum: (value: number) => void;
  increaseMomentum: (amount: number) => void;
  decreaseMomentum: (amount: number) => void;
  triggerMomentumShift: (trigger: string) => void;
  getMomentumPercentage: () => number;
  getGlowIntensity: () => number;
  getCrowdEnergy: () => number;
}

export const useMomentumStore = create<MomentumState>((set, get) => ({
  momentum: {
    value: 50,
    trend: 'stable',
    timestamp: Date.now(),
  },
  setMomentum: (value) =>
    set((state) => {
      const clamped = Math.max(0, Math.min(100, value));
      const trend =
        clamped > state.momentum.value
          ? 'increasing'
          : clamped < state.momentum.value
          ? 'decreasing'
          : state.momentum.trend;

      return {
        momentum: {
          value: clamped,
          trend,
          timestamp: Date.now(),
        },
      };
    }),
  increaseMomentum: (amount) => {
    const { momentum } = get();
    get().setMomentum(momentum.value + amount);
  },
  decreaseMomentum: (amount) => {
    const { momentum } = get();
    get().setMomentum(momentum.value - amount);
  },
  triggerMomentumShift: (trigger) =>
    set((state) => ({
      momentum: {
        ...state.momentum,
        lastTrigger: trigger,
        timestamp: Date.now(),
      },
    })),
  getMomentumPercentage: () => {
    const { momentum } = get();
    return momentum.value / 100;
  },
  getGlowIntensity: () => {
    const { momentum } = get();
    return 0.5 + (momentum.value / 100) * 1.5;
  },
  getCrowdEnergy: () => {
    const { momentum } = get();
    return momentum.value / 100;
  },
}));
