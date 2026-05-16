'use client';

import { useEffect } from 'react';
import { useMomentumStore } from '@/store/momentumStore';

export const useMomentumEngine = () => {
  const momentum = useMomentumStore();

  useEffect(() => {
    // Gradually stabilize momentum towards 50 (neutral)
    const interval = setInterval(() => {
      const current = momentum.momentum.value;
      if (current > 50) {
        momentum.decreaseMomentum(0.5);
      } else if (current < 50) {
        momentum.increaseMomentum(0.5);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [momentum]);

  return {
    momentumValue: momentum.momentum.value,
    momentumTrend: momentum.momentum.trend,
    glowIntensity: momentum.getGlowIntensity(),
    crowdEnergy: momentum.getCrowdEnergy(),
    lastTrigger: momentum.momentum.lastTrigger,
  };
};
