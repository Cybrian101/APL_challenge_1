import { create } from 'zustand';
import { FanReaction } from '@/types/match';

interface FanState {
  reactions: FanReaction[];
  addReaction: (reaction: FanReaction) => void;
  simulateReactions: (count?: number, type?: FanReaction['type']) => void;
}

export const useFanStore = create<FanState>((set, get) => ({
  reactions: [],
  addReaction: (reaction) => set((s) => ({ reactions: [...s.reactions, reaction] })),
  simulateReactions: (count = 6, type = 'general') => {
    const EMOJIS = ['🎉', '🔥', '😍', '🚀', '👏', '💯', '🌟', '⚡'];
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const reaction: FanReaction = {
          id: `fan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          userId: `u-${Math.random().toString(36).slice(2, 6)}`,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          timestamp: Date.now(),
          type,
        };
        // add then remove after 2.5s to mimic ephemeral reactions
        get().addReaction(reaction);
        setTimeout(() => {
          set((s) => ({ reactions: s.reactions.filter((r) => r.id !== reaction.id) }));
        }, 2500 + Math.random() * 800);
      }, i * 80);
    }
  },
}));
