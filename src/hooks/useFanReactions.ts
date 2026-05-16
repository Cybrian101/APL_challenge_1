'use client';

import { useState, useCallback } from 'react';
import { FanReaction } from '@/types/match';

const EMOJIS = ['🎉', '🔥', '😍', '🚀', '👏', '💯', '🌟', '⚡'];

export const useFanReactions = () => {
  const [reactions, setReactions] = useState<FanReaction[]>([]);

  const addReaction = useCallback((type: FanReaction['type']) => {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const reaction: FanReaction = {
      id: `reaction-${Date.now()}`,
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      emoji,
      timestamp: Date.now(),
      type,
    };

    setReactions((prev) => [...prev, reaction]);

    // Remove old reactions after 2 seconds
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 2000);

    return reaction;
  }, []);

  const simulateReactions = useCallback((count: number = 5, type: FanReaction['type'] = 'general') => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        addReaction(type);
      }, i * 100);
    }
  }, [addReaction]);

  return {
    reactions,
    addReaction,
    simulateReactions,
  };
};
