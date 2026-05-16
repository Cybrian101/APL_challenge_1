'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Ball, MatchPhase } from '@/types/match';

interface StadiumAtmosphereProps {
  momentumValue?: number;
  crowdEnergy?: number;
  lastTrigger?: string;
  phase?: MatchPhase;
  lastBall?: Ball | null;
}

const EVENT_TONES: Record<string, { glow: string; beam: string; label: string }> = {
  six: { glow: 'rgba(250, 204, 21, 0.55)', beam: 'rgba(249, 115, 22, 0.32)', label: 'SIX' },
  boundary: { glow: 'rgba(16, 185, 129, 0.48)', beam: 'rgba(34, 211, 238, 0.28)', label: 'BOUNDARY' },
  wicket: { glow: 'rgba(248, 113, 113, 0.55)', beam: 'rgba(220, 38, 38, 0.34)', label: 'WICKET' },
  wide: { glow: 'rgba(234, 179, 8, 0.36)', beam: 'rgba(250, 204, 21, 0.22)', label: 'EXTRA' },
  noball: { glow: 'rgba(251, 146, 60, 0.42)', beam: 'rgba(249, 115, 22, 0.24)', label: 'NO BALL' },
};

export default function StadiumAtmosphere({
  momentumValue = 50,
  crowdEnergy = 0.5,
  lastTrigger,
  phase = 'live',
  lastBall,
}: StadiumAtmosphereProps) {
  const pressure = momentumValue / 100;
  const isPressurePhase = phase === 'drs_review' || momentumValue > 68;
  const eventTone = lastTrigger ? EVENT_TONES[lastTrigger] : undefined;
  const primaryGlow = eventTone?.glow ?? (pressure > 0.62 ? 'rgba(251, 113, 133, 0.34)' : 'rgba(34, 211, 238, 0.3)');
  const secondaryGlow = eventTone?.beam ?? (pressure > 0.62 ? 'rgba(249, 115, 22, 0.24)' : 'rgba(139, 92, 246, 0.26)');

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/stadium-bg.png')" }}
        animate={{
          filter: isPressurePhase
            ? 'brightness(0.18) saturate(1.75) contrast(1.12)'
            : `brightness(${0.22 + pressure * 0.08}) saturate(${1.2 + pressure * 0.55}) contrast(1.04)`,
          scale: 1.02 + pressure * 0.025,
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{
          background: isPressurePhase
            ? 'linear-gradient(180deg, rgba(3,0,16,0.44) 0%, rgba(20,2,28,0.86) 48%, rgba(2,0,12,0.98) 100%)'
            : 'linear-gradient(180deg, rgba(2,0,15,0.42) 0%, rgba(5,0,30,0.78) 42%, rgba(2,0,15,0.96) 100%)',
        }}
        transition={{ duration: 0.8 }}
      />

      <motion.div
        className="absolute inset-x-[-18%] top-[-26%] h-[58vh]"
        animate={{
          background: [
            `radial-gradient(ellipse at 26% 20%, ${primaryGlow} 0%, transparent 54%), radial-gradient(ellipse at 74% 16%, ${secondaryGlow} 0%, transparent 58%)`,
            `radial-gradient(ellipse at 68% 20%, ${primaryGlow} 0%, transparent 54%), radial-gradient(ellipse at 30% 18%, ${secondaryGlow} 0%, transparent 58%)`,
            `radial-gradient(ellipse at 26% 20%, ${primaryGlow} 0%, transparent 54%), radial-gradient(ellipse at 74% 16%, ${secondaryGlow} 0%, transparent 58%)`,
          ],
          opacity: 0.48 + pressure * 0.28,
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(28px)' }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-45" viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="stadiumBeamLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="65%" stopColor={primaryGlow} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="stadiumBeamRight" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
            <stop offset="68%" stopColor={secondaryGlow} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M-80 -60 C120 80 260 290 390 720 L-160 720 Z"
          fill="url(#stadiumBeamLeft)"
          animate={{ opacity: [0.34, 0.62, 0.34], x: [-18, 10, -18] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M980 -60 C770 86 642 300 510 720 L1060 720 Z"
          fill="url(#stadiumBeamRight)"
          animate={{ opacity: [0.26, 0.56, 0.26], x: [18, -10, 18] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      <div className="absolute inset-0 opacity-[0.07] arena-scanlines" />

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-48"
        animate={{
          opacity: 0.32 + crowdEnergy * 0.36,
          background: `radial-gradient(ellipse at 50% 100%, ${primaryGlow} 0%, ${secondaryGlow} 42%, transparent 72%)`,
        }}
        transition={{ duration: 0.8 }}
      />

      <CrowdPulse energy={crowdEnergy} eventKey={lastBall?.id} eventTone={primaryGlow} />
      <PitchHalo pressure={pressure} eventTone={secondaryGlow} />

      <AnimatePresence>
        {lastBall && eventTone && (
          <motion.div
            key={lastBall.id}
            className="absolute left-1/2 top-[42%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
            initial={{ opacity: 0.8, scale: 0.2 }}
            animate={{ opacity: 0, scale: lastBall.isWicket ? 9 : 12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: lastBall.isWicket ? 1.35 : 1.05, ease: 'easeOut' }}
            style={{ boxShadow: `0 0 40px ${eventTone.glow}, inset 0 0 24px ${eventTone.glow}` }}
          />
        )}
      </AnimatePresence>

      {phase === 'drs_review' && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.18, 0.34, 0.18] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 50% 35%, rgba(239,68,68,0.24), transparent 54%)' }}
        />
      )}
    </div>
  );
}

function CrowdPulse({ energy, eventKey, eventTone }: { energy: number; eventKey?: string; eventTone: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20">
      <svg viewBox="0 0 1200 92" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
        <defs>
          <linearGradient id="crowdEnergyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={eventTone} />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 96 }).map((_, i) => {
          const x = i * 12.8;
          const height = 24 + Math.abs(Math.sin(i * 1.17)) * 30 + energy * 24;
          const width = 7 + Math.abs(Math.cos(i * 0.9)) * 4;
          return (
            <motion.ellipse
              key={`${eventKey ?? 'crowd'}-${i}`}
              cx={x}
              cy={88}
              rx={width}
              ry={height / 2}
              fill="url(#crowdEnergyGrad)"
              initial={{ scaleY: 0.75, opacity: 0.28 }}
              animate={{
                scaleY: [0.78, 1 + energy * 0.34, 0.82],
                opacity: [0.28, 0.44 + energy * 0.35, 0.3],
              }}
              transition={{ duration: 1.2 + (i % 7) * 0.05, repeat: Infinity, delay: (i % 12) * 0.03 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

function PitchHalo({ pressure, eventTone }: { pressure: number; eventTone: string }) {
  return (
    <motion.div
      className="absolute bottom-0 left-1/2 h-12 w-[52rem] max-w-[94vw] -translate-x-1/2 rounded-full"
      animate={{
        opacity: [0.18 + pressure * 0.14, 0.28 + pressure * 0.24, 0.18 + pressure * 0.14],
        scaleX: [0.94, 1.05, 0.94],
      }}
      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `radial-gradient(ellipse, ${eventTone} 0%, rgba(74,222,128,0.20) 32%, transparent 72%)`,
        filter: 'blur(10px)',
      }}
    />
  );
}
