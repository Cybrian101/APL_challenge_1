'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { useMomentumStore } from '@/store/momentumStore';
import { useMatchPhaseStore } from '@/store/matchPhaseStore';
import { usePredictionStore } from '@/store/predictionStore';
import { MatchSimulator } from '@/services/matchService';
import { Ball, Match } from '@/types/match';

const PREDICTION_QUESTIONS = [
  { question: 'Boundary next ball?', options: ['Yes', 'No'] },
  { question: 'Dot ball next?', options: ['Yes', 'No'] },
  { question: 'Wicket this over?', options: ['Yes', 'No'] },
  { question: 'Six this over?', options: ['Yes', 'No'] },
  { question: 'Will run rate increase?', options: ['Yes', 'No'] },
];

export const useRealtimeMatch = () => {
  const matchStore = useMatchStore();
  const momentumStore = useMomentumStore();
  const phaseStore = useMatchPhaseStore();
  const predictionStore = usePredictionStore();

  const simulatorRef = useRef<MatchSimulator | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInBreakRef = useRef(false);

  const publishSimulatorMatch = useCallback(() => {
    if (!simulatorRef.current) return;
    matchStore.setCurrentMatch(structuredClone(simulatorRef.current.getCurrentMatch()));
  }, [matchStore]);

  // Kickoff a new prediction
  const spawnPrediction = useCallback(() => {
    const tpl = PREDICTION_QUESTIONS[Math.floor(Math.random() * PREDICTION_QUESTIONS.length)];
    predictionStore.addPrediction({
      id: `pred-${Date.now()}`,
      question: tpl.question,
      options: tpl.options.map((o) => ({ id: o.toLowerCase(), label: o, probability: 0.35 + Math.random() * 0.3 })),
      status: 'pending',
      timestamp: Date.now(),
    });
  }, [predictionStore]);

  const handleBall = useCallback((ball: Ball) => {
    if (!simulatorRef.current) return;

    // Update simulator state
    simulatorRef.current.updateMatchWithBall(ball);

    // Publish a fresh immutable snapshot for React/Zustand subscribers.
    publishSimulatorMatch();
    matchStore.setLastBallEvent(ball);
    phaseStore.setLastBallEvent(ball);

    // Update momentum based on ball event
    if (ball.runs === 6) {
      momentumStore.increaseMomentum(8);
      momentumStore.triggerMomentumShift('six');
    } else if (ball.runs === 4) {
      momentumStore.increaseMomentum(3);
      momentumStore.triggerMomentumShift('boundary');
    } else if (ball.isDot) {
      momentumStore.decreaseMomentum(1.5);
    } else if (ball.isWide) {
      momentumStore.triggerMomentumShift('wide');
    } else if (ball.isNoBall) {
      momentumStore.triggerMomentumShift('noball');
    }

    if (ball.isWicket) {
      momentumStore.decreaseMomentum(5);
      momentumStore.triggerMomentumShift('wicket');

      // DRS trigger
      if (ball.isDRS) {
        isInBreakRef.current = true;
        phaseStore.enterDRS({
          ballDescription: ball.description,
          batsmanName: ball.batsmanName,
          bowlerName: ball.bowlerName,
          fanVotes: { out: Math.floor(Math.random() * 50) + 10, notOut: Math.floor(Math.random() * 30) + 5 },
        });
        // Resume delivery after DRS window
        setTimeout(() => {
          isInBreakRef.current = false;
        }, 17000);
        return; // Skip over-break check when DRS fires
      }
    }

    // Milestone trigger
    if (ball.milestone) {
      const inning = simulatorRef.current.getCurrentMatch().innings[simulatorRef.current.getCurrentMatch().currentInning - 1];
      phaseStore.enterMilestone({
        milestoneType: ball.milestone,
        playerName: ball.batsmanName,
        teamName: inning.battingTeam,
        value: ball.milestone.startsWith('player') ? inning.batsmen.striker.stats.runs : inning.totalRuns,
      });
    }

    // Over break trigger
    if (simulatorRef.current.isOverComplete()) {
      const summary = simulatorRef.current.getLastOverSummary();
      isInBreakRef.current = true;
      phaseStore.enterOverBreak({
        overNumber: summary.overNumber,
        runsInOver: summary.runsInOver,
        wicketsInOver: summary.wicketsInOver,
        ballSummary: summary.ballSummary,
      });
      // Resume delivery after break window
      setTimeout(() => {
        isInBreakRef.current = false;
        spawnPrediction();
      }, 13000);
    }
  }, [matchStore, momentumStore, phaseStore, publishSimulatorMatch, spawnPrediction]);

  useEffect(() => {
    // Initialize match simulator
    if (!simulatorRef.current) {
      simulatorRef.current = MatchSimulator.getRandomMatch();
      publishSimulatorMatch();
      // Spawn first prediction
      setTimeout(spawnPrediction, 2000);
    }

    // Simulate ball delivery every 3.5-5.5 seconds
    const deliverBall = () => {
      if (isInBreakRef.current) return; // pause during breaks
      if (simulatorRef.current) {
        const ball = simulatorRef.current.simulateBall();
        handleBall(ball);

        // Periodically spawn predictions
        if (Math.random() < 0.25) spawnPrediction();
      }
    };

    intervalRef.current = setInterval(deliverBall, 3500 + Math.random() * 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [matchStore, handleBall, publishSimulatorMatch, spawnPrediction]);

  return {
    match: matchStore.currentMatch,
    stats: getMatchStats(matchStore.currentMatch),
    lastBall: matchStore.lastBallEvent,
  };
};

function getMatchStats(match: Match | null) {
  if (!match) return undefined;
  const inning = match.innings[match.currentInning - 1];
  const currentOver = inning.overs[inning.overs.length - 1];
  const legalBallsInOver = currentOver?.balls.filter((b) => !b.isWide && !b.isNoBall).length || 0;
  const oversDecimal = inning.totalOvers + legalBallsInOver / 6;

  return {
    team: inning.battingTeam,
    runs: inning.totalRuns,
    wickets: inning.totalWickets,
    overs: inning.totalOvers,
    balls: legalBallsInOver,
    runRate: oversDecimal > 0 ? (inning.totalRuns / oversDecimal).toFixed(2) : '0.00',
  };
}
