export type Role = 'batsman' | 'bowler' | 'fielder' | 'wicket-keeper';

export type BallEvent = 'dot' | 'single' | 'two' | 'three' | 'four' | 'six' | 'wicket' | 'wide' | 'noball';

export type MatchPhase = 'live' | 'over_break' | 'drs_review' | 'strategic_timeout' | 'drinks_break';

export type MilestoneType = 'player_fifty' | 'player_hundred' | 'maiden_over' | 'hat_trick' | 'team_hundred' | 'team_hundred_fifty';

export interface MatchMoment {
  id: string;
  type: 'drs' | 'over_break' | 'strategic_timeout' | 'milestone';
  phase: MatchPhase;
  durationMs: number;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface PlayerStats {
  runs?: number;
  wickets?: number;
  average?: number;
  strikeRate?: number;
  economy?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  overs?: number;
  maidens?: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: Role;
  jerseyNumber: number;
  imageUrl: string;
  stats?: PlayerStats;
}

export interface BattingStats {
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOnStrike: boolean;
}

export interface BowlingStats {
  wickets: number;
  runs: number;
  overs: number;
  maidens: number;
  economy: number;
  isBowling: boolean;
}

export interface Ball {
  id: string;
  ballNumber: number;
  runs: number;
  isDot: boolean;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  isDRS?: boolean;
  event: BallEvent;
  milestone?: MilestoneType;
  bowlerName: string;
  batsmanName: string;
  description: string;
  timestamp: number;
}

export interface Over {
  overNumber: number;
  bowler: Player;
  balls: Ball[];
  runsInOver: number;
}

export interface Inning {
  inningNumber: 1 | 2;
  battingTeam: string;
  bowlingTeam: string;
  overs: Over[];
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  status: 'ongoing' | 'completed';
  batsmen: {
    striker: Player & { stats: BattingStats };
    nonStriker: Player & { stats: BattingStats };
  };
  bowler: Player & { stats: BowlingStats };
}

export interface Match {
  id: string;
  matchId: number;
  team1: string;
  team2: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  startTime: number;
  currentInning: 1 | 2;
  innings: Inning[];
  tossInfo: {
    winner: string;
    decision: 'bat' | 'bowl';
  };
  result?: {
    winner: string;
    winType: 'wickets' | 'runs';
    margin: number;
  };
}

export interface Momentum {
  value: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  lastTrigger?: string;
  timestamp: number;
}

export interface Prediction {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    probability: number;
  }[];
  status: 'pending' | 'revealed';
  revealedAnswer?: string;
  userPrediction?: string;
  isCorrect?: boolean;
  timestamp: number;
}

export interface FanReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: number;
  type: 'boundary' | 'wicket' | 'milestone' | 'general';
}

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  favoriteTeam?: string;
  streak: number;
  totalPoints: number;
  predictions: Prediction[];
  reactions: FanReaction[];
}
