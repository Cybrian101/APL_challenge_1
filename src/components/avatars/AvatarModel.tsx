'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Player } from '@/types/match';

interface PlayerAvatarProps {
  player: Player;
  isActive?: boolean;
  celebration?: 'none' | 'boundary' | 'wicket' | 'partnership';
  align?: 'left' | 'right' | 'center';
  label?: string;
}

const TEAM_AURAS: Record<string, { from: string; to: string; accent: string }> = {
  CSK: { from: '#facc15', to: '#2563eb', accent: '#fde047' },
  MI: { from: '#0ea5e9', to: '#1d4ed8', accent: '#38bdf8' },
  RCB: { from: '#ef4444', to: '#f59e0b', accent: '#f87171' },
  KKR: { from: '#7c3aed', to: '#f59e0b', accent: '#c084fc' },
  RR: { from: '#ec4899', to: '#2563eb', accent: '#f9a8d4' },
  SRH: { from: '#fb923c', to: '#111827', accent: '#fdba74' },
  DC: { from: '#38bdf8', to: '#ef4444', accent: '#67e8f9' },
  PBKS: { from: '#ef4444', to: '#94a3b8', accent: '#fca5a5' },
  GT: { from: '#1d4ed8', to: '#b45309', accent: '#93c5fd' },
  LSG: { from: '#06b6d4', to: '#db2777', accent: '#67e8f9' },
};

export default function PlayerAvatar({
  player,
  isActive = false,
  celebration = 'none',
  align = 'center',
  label,
}: PlayerAvatarProps) {
  const aura = TEAM_AURAS[player.team] ?? { from: '#22d3ee', to: '#8b5cf6', accent: '#67e8f9' };
  const statLine = buildStatLine(player);

  return (
    <motion.div
      className={`relative flex min-w-0 flex-col ${align === 'right' ? 'items-end text-right' : align === 'left' ? 'items-start text-left' : 'items-center text-center'}`}
      animate={getCelebrationAnimation(celebration, isActive)}
      transition={getCelebrationTransition(celebration)}
    >
      <div className="relative mb-2 h-28 w-28 sm:h-32 sm:w-32">
        <motion.div
          className="absolute inset-1 rounded-[2rem] opacity-70 blur-xl"
          animate={{
            background: `linear-gradient(135deg, ${aura.from}, ${aura.to})`,
            scale: isActive ? [0.94, 1.08, 0.94] : [0.9, 0.98, 0.9],
            opacity: isActive ? [0.52, 0.86, 0.52] : [0.28, 0.44, 0.28],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute inset-0 rounded-[2rem] border border-white/15"
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{ background: `conic-gradient(from 90deg, transparent, ${aura.accent}, transparent, ${aura.from}, transparent)` }}
        />

        <div className="absolute inset-[5px] overflow-hidden rounded-[1.65rem] border border-white/12 bg-slate-950">
          <Image src={player.imageUrl} alt={player.name} fill sizes="132px" className="object-cover saturate-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-white/10" />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-11"
            animate={{ background: `linear-gradient(0deg, ${aura.from}88, transparent)` }}
          />
        </div>

        <div
          className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 text-xs font-black text-slate-950"
          style={{ background: aura.accent, boxShadow: `0 0 18px ${aura.accent}88` }}
        >
          {player.jerseyNumber}
        </div>

        {isActive && (
          <motion.div
            className="absolute -bottom-1 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.12, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ background: aura.accent, filter: 'blur(3px)' }}
          />
        )}
      </div>

      <div className="max-w-36">
        {label && <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{label}</p>}
        <p className="truncate text-sm font-black text-white sm:text-base">{player?.name || 'Unknown'}</p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-white/35">{player?.role ? player.role.replace('-', ' ') : 'Player'}</p>
        {statLine && <p className="mt-1 text-xs font-bold text-cyan-200/90">{statLine}</p>}
      </div>
    </motion.div>
  );
}

function getCelebrationAnimation(celebration: PlayerAvatarProps['celebration'], isActive: boolean) {
  if (celebration === 'boundary') {
    return { y: [0, -12, 0], rotate: [0, -3, 3, 0], scale: [1, 1.08, 1] };
  }

  if (celebration === 'wicket') {
    return { y: [0, -16, 0], rotate: [0, 4, -4, 0], scale: [1, 1.1, 1] };
  }

  if (celebration === 'partnership') {
    return { y: [0, -6, 0], scale: [1, 1.04, 1] };
  }

  return { y: isActive ? [0, -4, 0] : 0, scale: 1 };
}

function getCelebrationTransition(celebration: PlayerAvatarProps['celebration']) {
  if (celebration === 'none') return { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const };
  return { duration: 0.8, repeat: celebration === 'partnership' ? Infinity : 0, ease: 'easeOut' as const };
}

function buildStatLine(player: Player) {
  if (!player.stats) return '';
  if ('runs' in player.stats && typeof player.stats.runs === 'number') {
    const balls = typeof player.stats.ballsFaced === 'number' ? `(${player.stats.ballsFaced})` : '';
    return `${player.stats.runs} ${balls}`;
  }
  if ('wickets' in player.stats && typeof player.stats.wickets === 'number') {
    const runs = typeof player.stats.runs === 'number' ? `-${player.stats.runs}` : '';
    return `${player.stats.wickets}W${runs}`;
  }
  return '';
}
