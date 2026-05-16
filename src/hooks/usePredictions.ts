'use client';

import { usePredictionStore, useUserStore } from '@/store/predictionStore';
import { Prediction } from '@/types/match';

const PREDICTION_QUESTIONS = [
  { question: 'Boundary next ball?', options: ['Yes', 'No'] },
  { question: 'Dot ball next?', options: ['Yes', 'No'] },
  { question: 'Wicket this over?', options: ['Yes', 'No'] },
  { question: 'Six this over?', options: ['Yes', 'No'] },
  { question: 'Run rate to increase?', options: ['Yes', 'No'] },
];

export const usePredictions = () => {
  const predictionStore = usePredictionStore();
  const userStore = useUserStore();

  const generatePrediction = (): Prediction => {
    const tpl = PREDICTION_QUESTIONS[Math.floor(Math.random() * PREDICTION_QUESTIONS.length)];
    const pred: Prediction = {
      id: `pred-${Date.now()}`,
      question: tpl.question,
      options: tpl.options.map((o) => ({
        id: o.toLowerCase(),
        label: o,
        probability: Math.random() * 0.4 + 0.3,
      })),
      status: 'pending',
      timestamp: Date.now(),
    };
    predictionStore.addPrediction(pred);
    return pred;
  };

  const makePrediction = (predictionId: string, answer: string) => {
    predictionStore.makePrediction(predictionId, answer);
  };

  const revealPrediction = (predictionId: string, correctAnswer: string) => {
    predictionStore.revealPrediction(predictionId, correctAnswer);
    const prediction = predictionStore.predictions.find((p) => p.id === predictionId);
    if (prediction?.isCorrect) {
      userStore.addPoints(10);
      userStore.updateStreak((userStore.profile?.streak || 0) + 1);
    } else {
      userStore.updateStreak(0);
    }
  };

  return {
    predictions: predictionStore.predictions,
    pendingPredictions: predictionStore.getPendingPredictions(),
    generatePrediction,
    makePrediction,
    revealPrediction,
  };
};
