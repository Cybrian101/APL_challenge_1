import { create } from 'zustand';
import { Prediction, UserProfile } from '@/types/match';

interface PredictionState {
  predictions: Prediction[];
  addPrediction: (prediction: Prediction) => void;
  updatePrediction: (id: string, updates: Partial<Prediction>) => void;
  makePrediction: (predictionId: string, answer: string) => void;
  revealPrediction: (predictionId: string, answer: string) => void;
  getPendingPredictions: () => Prediction[];
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictions: [],
  addPrediction: (prediction) =>
    set((state) => ({
      predictions: [...state.predictions, prediction],
    })),
  updatePrediction: (id, updates) =>
    set((state) => ({
      predictions: state.predictions.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  makePrediction: (predictionId, answer) =>
    set((state) => ({
      predictions: state.predictions.map((p) =>
        p.id === predictionId ? { ...p, userPrediction: answer } : p
      ),
    })),
  revealPrediction: (predictionId, answer) =>
    set((state) => ({
      predictions: state.predictions.map((p) => {
        if (p.id === predictionId) {
          const isCorrect = p.userPrediction === answer;
          return {
            ...p,
            status: 'revealed',
            revealedAnswer: answer,
            isCorrect,
          };
        }
        return p;
      }),
    })),
  getPendingPredictions: () => {
    return get().predictions.filter((p) => p.status === 'pending');
  },
}));

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateStreak: (newStreak: number) => void;
  addPoints: (points: number) => void;
  isLoggedIn: boolean;
  setLoggedIn: (logged: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoggedIn: false,
  setProfile: (profile) => set({ profile, isLoggedIn: true }),
  updateStreak: (newStreak) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, streak: newStreak } : null,
    })),
  addPoints: (points) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, totalPoints: state.profile.totalPoints + points }
        : null,
    })),
  setLoggedIn: (logged) => set({ isLoggedIn: logged }),
}));
