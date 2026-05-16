import { Player } from '@/types/match';

// IPL Teams and Players with real player images from legitimate sources
// Only include players for whom a local media file exists in `public/media`.
export const IPL_TEAMS = ['CSK', 'MI', 'RCB', 'KKR', 'RR', 'SRH'];

export const IPL_PLAYERS: Record<string, Player[]> = {
  CSK: [
    { id: 'dhoni-ms', name: 'MS Dhoni', team: 'CSK', role: 'wicket-keeper', jerseyNumber: 7, imageUrl: '/media/dhoni.png', stats: { average: 38.5, strikeRate: 145.2 } },
    { id: 'ruturaj-gaikwad', name: 'Ruturaj Gaikwad', team: 'CSK', role: 'batsman', jerseyNumber: 31, imageUrl: '/media/ruturaj.png', stats: { average: 42.8, strikeRate: 138.5 } },
    { id: 'moeen-ali', name: 'Moeen Ali', team: 'CSK', role: 'batsman', jerseyNumber: 63, imageUrl: '/media/moeenali.png', stats: { average: 32.1, strikeRate: 142.3 } },
    { id: 'ravindra-jadeja', name: 'Ravindra Jadeja', team: 'CSK', role: 'bowler', jerseyNumber: 8, imageUrl: '/media/jadeja.png', stats: { wickets: 8, economy: 7.2 } },
    { id: 'lungi-ngidi', name: 'Lungi Ngidi', team: 'CSK', role: 'bowler', jerseyNumber: 24, imageUrl: '/media/lungi.png', stats: { wickets: 6, economy: 6.8 } },
  ],
  MI: [
    { id: 'rohit-sharma', name: 'Rohit Sharma', team: 'MI', role: 'batsman', jerseyNumber: 45, imageUrl: '/media/rohitsharma.png', stats: { average: 41.2, strikeRate: 139.8 } },
    { id: 'suryakumar-yadav', name: 'Suryakumar Yadav', team: 'MI', role: 'batsman', jerseyNumber: 63, imageUrl: '/media/suryakumar.png', stats: { average: 38.9, strikeRate: 146.7 } },
    { id: 'ishan-kishan', name: 'Ishan Kishan', team: 'MI', role: 'wicket-keeper', jerseyNumber: 4, imageUrl: '/media/ishankishan.png', stats: { average: 35.6, strikeRate: 143.2 } },
  ],
  RCB: [
    { id: 'virat-kohli', name: 'Virat Kohli', team: 'RCB', role: 'batsman', jerseyNumber: 18, imageUrl: '/media/viratkohli.png', stats: { average: 39.8, strikeRate: 137.5 } },
    { id: 'rajat-patidar', name: 'Rajat Patidar', team: 'RCB', role: 'batsman', jerseyNumber: 21, imageUrl: '/media/rajat.png', stats: { average: 36.2, strikeRate: 141.8 } },
    { id: 'dinesh-karthik', name: 'Dinesh Karthik', team: 'RCB', role: 'wicket-keeper', jerseyNumber: 23, imageUrl: '/media/dinesh.png', stats: { average: 32.5, strikeRate: 148.3 } },
    { id: 'harshal-patel', name: 'Harshal Patel', team: 'RCB', role: 'bowler', jerseyNumber: 33, imageUrl: '/media/harshalpatel.png', stats: { wickets: 8, economy: 6.9 } },
  ],
  KKR: [
    { id: 'sunil-narine', name: 'Sunil Narine', team: 'KKR', role: 'bowler', jerseyNumber: 75, imageUrl: '/media/sunilnarine.png', stats: { wickets: 8, economy: 6.3 } },
    { id: 'varun-chakravarthy', name: 'Varun Chakravarthy', team: 'KKR', role: 'bowler', jerseyNumber: 33, imageUrl: '/media/varun.png', stats: { wickets: 8, economy: 6.7 } },
    { id: 'phil-salt', name: 'Phil Salt', team: 'KKR', role: 'wicket-keeper', jerseyNumber: 1, imageUrl: '/media/philsalt.png', stats: { average: 38.1, strikeRate: 144.9 } },
  ],
  RR: [
    { id: 'sanju-samson', name: 'Sanju Samson', team: 'RR', role: 'wicket-keeper', jerseyNumber: 27, imageUrl: '/media/sanjusamson.png', stats: { average: 39.2, strikeRate: 140.6 } },
  ],
  SRH: [
    { id: 'travis-head', name: 'Travis Head', team: 'SRH', role: 'batsman', jerseyNumber: 25, imageUrl: '/media/travis.png', stats: { average: 40.1, strikeRate: 147.5 } },
  ],
};

export const getPlayersByTeam = (team: string): Player[] => {
  return IPL_PLAYERS[team] || [];
};

export const getPlayerById = (playerId: string): Player | undefined => {
  for (const team of Object.keys(IPL_PLAYERS)) {
    const player = IPL_PLAYERS[team].find(p => p.id === playerId);
    if (player) return player;
  }
  return undefined;
};
