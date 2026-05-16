import { Match, Inning, Ball, Over, Player, BallEvent, MilestoneType } from '@/types/match';
import { IPL_PLAYERS } from '@/constants/ipl-players';

const TEAMS = Object.keys(IPL_PLAYERS);

export class MatchSimulator {
  private currentMatchData: Match;
  private ballsSinceLastWicket: number = 0;
  private recentWicketBalls: number[] = []; // track ball positions for hat-trick detection

  constructor(team1: string = 'CSK', team2: string = 'MI') {
    this.currentMatchData = this.initializeMatch(team1, team2);
  }

  private initializeMatch(team1: string, team2: string): Match {
    const players1 = IPL_PLAYERS[team1] || [];
    const players2 = IPL_PLAYERS[team2] || [];

    const match: Match = {
      id: `match-${Date.now()}`,
      matchId: Math.floor(Math.random() * 1000),
      team1,
      team2,
      venue: this.getRandomVenue(),
      status: 'live',
      startTime: Date.now(),
      currentInning: 1,
      tossInfo: {
        winner: Math.random() > 0.5 ? team1 : team2,
        decision: Math.random() > 0.5 ? 'bat' : 'bowl',
      },
      innings: [
        this.createInning(1, team1, team2, players1, players2),
        this.createInning(2, team2, team1, players2, players1),
      ],
    };

    return match;
  }

  private createInning(
    inningNum: 1 | 2,
    battingTeam: string,
    bowlingTeam: string,
    battingPlayers: Player[],
    bowlingPlayers: Player[]
  ): Inning {
    const batsmen = battingPlayers.filter((p) => p.role === 'batsman' || p.role === 'wicket-keeper');
    const bowlers = bowlingPlayers.filter((p) => p.role === 'bowler');

    return {
      inningNumber: inningNum,
      battingTeam,
      bowlingTeam,
      overs: [],
      totalRuns: 0,
      totalWickets: 0,
      totalOvers: 0,
      status: 'ongoing',
      batsmen: {
        striker: {
          ...batsmen[0],
          stats: {
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOnStrike: true,
          },
        },
        nonStriker: {
          ...batsmen[1],
          stats: {
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOnStrike: false,
          },
        },
      },
      bowler: {
        ...bowlers[0],
        stats: {
          wickets: 0,
          runs: 0,
          overs: 0,
          maidens: 0,
          economy: 0,
          isBowling: true,
        },
      },
    };
  }

  private getRandomVenue(): string {
    const venues = [
      'M. A. Chidambaram Stadium, Chennai',
      'Wankhede Stadium, Mumbai',
      'Arun Jaitley Stadium, Delhi',
      'Eden Gardens, Kolkata',
      'Narendra Modi Stadium, Ahmedabad',
      'Rajiv Gandhi International Cricket Stadium, Hyderabad',
      'Bharat Ratna Sardar Vallabhbhai Patel Stadium, Motera',
      'PCA Stadium, Mohali',
    ];
    return venues[Math.floor(Math.random() * venues.length)];
  }

  public simulateBall(): Ball {
    const inning = this.currentMatchData.innings[this.currentMatchData.currentInning - 1];

    // Stop if all out
    if (inning.totalWickets >= 10) {
      return this.makeDotBall(inning);
    }

    const overs = inning.overs;
    const lastOver = overs[overs.length - 1];

    // Wide / No-ball chance
    const isWide = Math.random() < 0.07;
    const isNoBall = !isWide && Math.random() < 0.04;

    const runs = this.generateRuns(isWide || isNoBall);
    const isDot = !isWide && !isNoBall && runs === 0;
    const isWicket = !isWide && !isDot && Math.random() < 0.08 && inning.totalWickets < 10;
    const isDRS = isWicket && Math.random() < 0.30; // 30% of wickets trigger DRS
    const ballNumber = lastOver ? lastOver.balls.length + 1 : 1;

    const event = this.getBallEvent(runs, isWicket, isWide, isNoBall);

    // Milestone detection
    const milestone = this.detectMilestone(inning, runs, isWicket, lastOver);

    const ball: Ball = {
      id: `ball-${Date.now()}-${Math.random()}`,
      ballNumber,
      runs: isWicket ? 0 : runs,
      isDot,
      isWicket,
      isWide,
      isNoBall,
      isDRS,
      event,
      milestone: milestone ?? undefined,
      bowlerName: inning.bowler.name,
      batsmanName: inning.batsmen.striker.name,
      description: this.generateBallDescription(runs, isDot, isWicket, isWide, isNoBall),
      timestamp: Date.now(),
    };

    if (isWicket) {
      this.ballsSinceLastWicket = 0;
    } else {
      this.ballsSinceLastWicket++;
    }

    return ball;
  }

  private makeDotBall(inning: Inning): Ball {
    return {
      id: `ball-${Date.now()}-${Math.random()}`,
      ballNumber: 7,
      runs: 0,
      isDot: true,
      isWicket: false,
      isWide: false,
      isNoBall: false,
      event: 'dot',
      bowlerName: inning.bowler.name,
      batsmanName: inning.batsmen.striker.name,
      description: 'Innings complete.',
      timestamp: Date.now(),
    };
  }

  private getBallEvent(
    runs: number,
    isWicket: boolean,
    isWide: boolean,
    isNoBall: boolean
  ): BallEvent {
    if (isWide) return 'wide';
    if (isNoBall) return 'noball';
    if (isWicket) return 'wicket';
    if (runs === 6) return 'six';
    if (runs === 4) return 'four';
    if (runs === 3) return 'three';
    if (runs === 2) return 'two';
    if (runs === 1) return 'single';
    return 'dot';
  }

  private detectMilestone(
    inning: Inning,
    runs: number,
    isWicket: boolean,
    currentOver: Over | undefined
  ): MilestoneType | null {
    const striker = inning.batsmen.striker;
    const strikerRuns = striker.stats.runs + (isWicket ? 0 : runs);

    if (!striker.stats.runs && strikerRuns >= 50 && striker.stats.runs < 50) return 'player_fifty';
    if (striker.stats.runs < 100 && strikerRuns >= 100) return 'player_hundred';
    if (inning.totalRuns < 100 && inning.totalRuns + runs >= 100) return 'team_hundred';
    if (inning.totalRuns < 150 && inning.totalRuns + runs >= 150) return 'team_hundred_fifty';

    // Maiden over detection (all dots in this over)
    if (currentOver && currentOver.balls.length === 5) {
      const allDots = currentOver.balls.every((b) => b.isDot && !b.isWide && !b.isNoBall);
      if (allDots && runs === 0 && !isWicket) return 'maiden_over';
    }

    return null;
  }

  private generateRuns(isExtra: boolean = false): number {
    if (isExtra) return Math.random() < 0.3 ? 4 : 1;
    const rand = Math.random();
    if (rand < 0.38) return 0; // Dot
    if (rand < 0.62) return 1; // Single
    if (rand < 0.78) return 2; // Two
    if (rand < 0.82) return 3; // Three
    if (rand < 0.91) return 4; // Four
    return 6; // Six
  }

  private generateBallDescription(
    runs: number,
    isDot: boolean,
    isWicket: boolean,
    isWide: boolean,
    isNoBall: boolean
  ): string {
    if (isWide) return `Wide ball! +1 extra.`;
    if (isNoBall) return `No ball! Free hit coming.`;
    if (isWicket) return 'WICKET! Batsman dismissed!';
    if (runs === 6) return '🚀 SIX! Massive shot over the boundary!';
    if (runs === 4) return '💥 FOUR! Racing to the boundary!';
    if (runs === 3) return 'Three runs! Good running between the wickets.';
    if (runs === 2) return 'Two runs taken — good placement.';
    if (runs === 1) return 'Single — rotates the strike.';
    return 'Dot ball — tight bowling!';
  }

  public getCurrentMatch(): Match {
    return this.currentMatchData;
  }

  public isOverComplete(): boolean {
    const inning = this.currentMatchData.innings[this.currentMatchData.currentInning - 1];
    const lastOver = inning.overs[inning.overs.length - 1];
    if (!lastOver) return false;
    const legalBalls = lastOver.balls.filter((b) => !b.isWide && !b.isNoBall);
    return legalBalls.length >= 6;
  }

  public getLastOverSummary(): {
    overNumber: number;
    runsInOver: number;
    wicketsInOver: number;
    ballSummary: number[];
  } {
    const inning = this.currentMatchData.innings[this.currentMatchData.currentInning - 1];
    const lastOver = inning.overs[inning.overs.length - 1];
    if (!lastOver) return { overNumber: 0, runsInOver: 0, wicketsInOver: 0, ballSummary: [] };
    return {
      overNumber: lastOver.overNumber,
      runsInOver: lastOver.runsInOver,
      wicketsInOver: lastOver.balls.filter((b) => b.isWicket).length,
      ballSummary: lastOver.balls.map((b) => (b.isWicket ? -1 : b.isWide ? -2 : b.runs)),
    };
  }

  public updateMatchWithBall(ball: Ball): void {
    const inning = this.currentMatchData.innings[this.currentMatchData.currentInning - 1];

    if (!inning.overs.length) {
      inning.overs.push({
        overNumber: 1,
        bowler: inning.bowler,
        balls: [],
        runsInOver: 0,
      });
    }

    const currentOver = inning.overs[inning.overs.length - 1];
    currentOver.balls.push(ball);
    currentOver.runsInOver += ball.runs;

    inning.totalRuns += ball.runs;
    if (ball.isWicket && inning.totalWickets < 10) {
      inning.totalWickets = Math.min(10, inning.totalWickets + 1);
    }

    // Update batter stats (not on wides)
    if (!ball.isWide) {
      inning.batsmen.striker.stats.ballsFaced += 1;
      inning.batsmen.striker.stats.runs += ball.runs;
      if (ball.runs === 4) inning.batsmen.striker.stats.fours += 1;
      else if (ball.runs === 6) inning.batsmen.striker.stats.sixes += 1;
      inning.batsmen.striker.stats.strikeRate =
        (inning.batsmen.striker.stats.runs / inning.batsmen.striker.stats.ballsFaced) * 100;
    }

    // Update bowler stats
    inning.bowler.stats.runs += ball.runs;
    if (ball.isWicket) inning.bowler.stats.wickets += 1;
    const legalBallsBowled = inning.overs
      .flatMap((o) => o.balls)
      .filter((b) => !b.isWide && !b.isNoBall).length;
    inning.bowler.stats.overs = Math.floor(legalBallsBowled / 6);
    inning.bowler.stats.economy = legalBallsBowled > 0
      ? (inning.bowler.stats.runs / (legalBallsBowled / 6))
      : 0;

    // Complete over after 6 legal balls
    const legalBallsInOver = currentOver.balls.filter((b) => !b.isWide && !b.isNoBall);
    if (legalBallsInOver.length >= 6) {
      inning.totalOvers += 1;
      inning.overs.push({
        overNumber: inning.totalOvers + 1,
        bowler: inning.bowler,
        balls: [],
        runsInOver: 0,
      });
    }
  }

  public getMatchStats() {
    const inning = this.currentMatchData.innings[this.currentMatchData.currentInning - 1];
    const legalBallsInOver =
      inning.overs[inning.overs.length - 1]?.balls.filter((b) => !b.isWide && !b.isNoBall).length || 0;
    return {
      team: inning.battingTeam,
      runs: inning.totalRuns,
      wickets: inning.totalWickets,
      overs: inning.totalOvers,
      balls: legalBallsInOver,
      runRate: inning.totalOvers
        ? (inning.totalRuns / (inning.totalOvers + legalBallsInOver / 6)).toFixed(2)
        : '0.00',
    };
  }

  public static getRandomMatch(): MatchSimulator {
    const team1 = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    let team2 = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    while (team2 === team1) {
      team2 = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    }
    return new MatchSimulator(team1, team2);
  }
}

export const createMockMatch = (): Match => {
  const simulator = MatchSimulator.getRandomMatch();
  return simulator.getCurrentMatch();
};
