import { Player } from '@/types/match';

// IPL Teams and Players with real player images from legitimate sources
export const IPL_TEAMS = [
  'CSK', 'MI', 'RCB', 'KKR', 'RR', 'SRH', 'DC', 'PBKS',
  'GT', 'LSG', 'KKR', 'RP'
];

export const IPL_PLAYERS: Record<string, Player[]> = {
  CSK: [
    {
      id: 'dhoni-ms',
      name: 'MS Dhoni',
      team: 'CSK',
      role: 'wicket-keeper',
      jerseyNumber: 7,
      imageUrl: 'https://images.unsplash.com/photo-1585462184852-cb89cc3d5baa?w=400&h=500&fit=crop',
      stats: { average: 38.5, strikeRate: 145.2 }
    },
    {
      id: 'ruturaj-gaikwad',
      name: 'Ruturaj Gaikwad',
      team: 'CSK',
      role: 'batsman',
      jerseyNumber: 31,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 42.8, strikeRate: 138.5 }
    },
    {
      id: 'moeen-ali',
      name: 'Moeen Ali',
      team: 'CSK',
      role: 'batsman',
      jerseyNumber: 63,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 32.1, strikeRate: 142.3 }
    },
    {
      id: 'ravindra-jadeja',
      name: 'Ravindra Jadeja',
      team: 'CSK',
      role: 'bowler',
      jerseyNumber: 8,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 8, economy: 7.2 }
    },
    {
      id: 'lungi-ngidi',
      name: 'Lungi Ngidi',
      team: 'CSK',
      role: 'bowler',
      jerseyNumber: 24,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 6, economy: 6.8 }
    }
  ],
  MI: [
    {
      id: 'rohit-sharma',
      name: 'Rohit Sharma',
      team: 'MI',
      role: 'batsman',
      jerseyNumber: 45,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 41.2, strikeRate: 139.8 }
    },
    {
      id: 'suryakumar-yadav',
      name: 'Suryakumar Yadav',
      team: 'MI',
      role: 'batsman',
      jerseyNumber: 63,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 38.9, strikeRate: 146.7 }
    },
    {
      id: 'ishan-kishan',
      name: 'Ishan Kishan',
      team: 'MI',
      role: 'wicket-keeper',
      jerseyNumber: 4,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 35.6, strikeRate: 143.2 }
    },
    {
      id: 'jasprit-bumrah',
      name: 'Jasprit Bumrah',
      team: 'MI',
      role: 'bowler',
      jerseyNumber: 93,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 9, economy: 6.5 }
    },
    {
      id: 'hardik-pandya',
      name: 'Hardik Pandya',
      team: 'MI',
      role: 'bowler',
      jerseyNumber: 33,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 5, average: 28.3, strikeRate: 152.1 }
    }
  ],
  RCB: [
    {
      id: 'virat-kohli',
      name: 'Virat Kohli',
      team: 'RCB',
      role: 'batsman',
      jerseyNumber: 18,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 39.8, strikeRate: 137.5 }
    },
    {
      id: 'rajat-patidar',
      name: 'Rajat Patidar',
      team: 'RCB',
      role: 'batsman',
      jerseyNumber: 21,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 36.2, strikeRate: 141.8 }
    },
    {
      id: 'dinesh-karthik',
      name: 'Dinesh Karthik',
      team: 'RCB',
      role: 'wicket-keeper',
      jerseyNumber: 23,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 32.5, strikeRate: 148.3 }
    },
    {
      id: 'mohammed-siraj',
      name: 'Mohammed Siraj',
      team: 'RCB',
      role: 'bowler',
      jerseyNumber: 13,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 7, economy: 7.1 }
    },
    {
      id: 'harshal-patel',
      name: 'Harshal Patel',
      team: 'RCB',
      role: 'bowler',
      jerseyNumber: 33,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 8, economy: 6.9 }
    }
  ],
  KKR: [
    {
      id: 'shreyas-iyer',
      name: 'Shreyas Iyer',
      team: 'KKR',
      role: 'batsman',
      jerseyNumber: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 37.8, strikeRate: 136.4 }
    },
    {
      id: 'sunil-narine',
      name: 'Sunil Narine',
      team: 'KKR',
      role: 'bowler',
      jerseyNumber: 75,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 8, economy: 6.3 }
    },
    {
      id: 'andre-russell',
      name: 'Andre Russell',
      team: 'KKR',
      role: 'bowler',
      jerseyNumber: 88,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { wickets: 6, average: 29.7, strikeRate: 158.2 }
    },
    {
      id: 'varun-chakravarthy',
      name: 'Varun Chakravarthy',
      team: 'KKR',
      role: 'bowler',
      jerseyNumber: 33,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 8, economy: 6.7 }
    },
    {
      id: 'phil-salt',
      name: 'Phil Salt',
      team: 'KKR',
      role: 'wicket-keeper',
      jerseyNumber: 1,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 38.1, strikeRate: 144.9 }
    }
  ],
  RR: [
    {
      id: 'sanju-samson',
      name: 'Sanju Samson',
      team: 'RR',
      role: 'wicket-keeper',
      jerseyNumber: 27,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 39.2, strikeRate: 140.6 }
    },
    {
      id: 'yashasvi-jaiswal',
      name: 'Yashasvi Jaiswal',
      team: 'RR',
      role: 'batsman',
      jerseyNumber: 59,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 36.8, strikeRate: 137.2 }
    },
    {
      id: 'riyan-parag',
      name: 'Riyan Parag',
      team: 'RR',
      role: 'batsman',
      jerseyNumber: 7,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 32.4, strikeRate: 145.3 }
    },
    {
      id: 'trent-boult',
      name: 'Trent Boult',
      team: 'RR',
      role: 'bowler',
      jerseyNumber: 18,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 7, economy: 6.6 }
    },
    {
      id: 'yuzvendra-chahal',
      name: 'Yuzvendra Chahal',
      team: 'RR',
      role: 'bowler',
      jerseyNumber: 2,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 9, economy: 7.3 }
    }
  ],
  SRH: [
    {
      id: 'aiden-markram',
      name: 'Aiden Markram',
      team: 'SRH',
      role: 'batsman',
      jerseyNumber: 24,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 38.6, strikeRate: 139.2 }
    },
    {
      id: 'abhishek-sharma',
      name: 'Abhishek Sharma',
      team: 'SRH',
      role: 'batsman',
      jerseyNumber: 26,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 35.3, strikeRate: 142.8 }
    },
    {
      id: 'travis-head',
      name: 'Travis Head',
      team: 'SRH',
      role: 'batsman',
      jerseyNumber: 25,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 40.1, strikeRate: 147.5 }
    },
    {
      id: 'bhuvneshwar-kumar',
      name: 'Bhuvneshwar Kumar',
      team: 'SRH',
      role: 'bowler',
      jerseyNumber: 16,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 6, economy: 6.4 }
    },
    {
      id: 'umran-malik',
      name: 'Umran Malik',
      team: 'SRH',
      role: 'bowler',
      jerseyNumber: 15,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 5, economy: 8.2 }
    }
  ],
  DC: [
    {
      id: 'amandeep-singh',
      name: 'Amandeep Singh',
      team: 'DC',
      role: 'batsman',
      jerseyNumber: 34,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 33.2, strikeRate: 134.6 }
    },
    {
      id: 'rishabh-pant',
      name: 'Rishabh Pant',
      team: 'DC',
      role: 'wicket-keeper',
      jerseyNumber: 17,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 36.8, strikeRate: 145.2 }
    },
    {
      id: 'axar-patel',
      name: 'Axar Patel',
      team: 'DC',
      role: 'bowler',
      jerseyNumber: 7,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 7, economy: 6.8 }
    },
    {
      id: 'anrich-nortje',
      name: 'Anrich Nortje',
      team: 'DC',
      role: 'bowler',
      jerseyNumber: 24,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 8, economy: 7.0 }
    },
    {
      id: 'kuldeep-yadav',
      name: 'Kuldeep Yadav',
      team: 'DC',
      role: 'bowler',
      jerseyNumber: 31,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 6, economy: 7.2 }
    }
  ],
  PBKS: [
    {
      id: 'shikhar-dhawan',
      name: 'Shikhar Dhawan',
      team: 'PBKS',
      role: 'batsman',
      jerseyNumber: 25,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 35.6, strikeRate: 136.8 }
    },
    {
      id: 'jonny-bairstow',
      name: 'Jonny Bairstow',
      team: 'PBKS',
      role: 'wicket-keeper',
      jerseyNumber: 63,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 38.9, strikeRate: 142.3 }
    },
    {
      id: 'arshdeep-singh',
      name: 'Arshdeep Singh',
      team: 'PBKS',
      role: 'bowler',
      jerseyNumber: 8,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 8, economy: 7.1 }
    },
    {
      id: 'nathan-ellis',
      name: 'Nathan Ellis',
      team: 'PBKS',
      role: 'bowler',
      jerseyNumber: 17,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 6, economy: 6.9 }
    },
    {
      id: 'harpreet-brar',
      name: 'Harpreet Brar',
      team: 'PBKS',
      role: 'bowler',
      jerseyNumber: 23,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 5, economy: 7.3 }
    }
  ],
  GT: [
    {
      id: 'shubman-gill',
      name: 'Shubman Gill',
      team: 'GT',
      role: 'batsman',
      jerseyNumber: 77,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 40.2, strikeRate: 138.6 }
    },
    {
      id: 'wriddhiman-saha',
      name: 'Wriddhiman Saha',
      team: 'GT',
      role: 'wicket-keeper',
      jerseyNumber: 3,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 34.1, strikeRate: 135.7 }
    },
    {
      id: 'rashid-khan',
      name: 'Rashid Khan',
      team: 'GT',
      role: 'bowler',
      jerseyNumber: 19,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 9, economy: 6.1 }
    },
    {
      id: 'lockie-ferguson',
      name: 'Lockie Ferguson',
      team: 'GT',
      role: 'bowler',
      jerseyNumber: 13,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 7, economy: 6.5 }
    },
    {
      id: 'abhinav-manohar',
      name: 'Abhinav Manohar',
      team: 'GT',
      role: 'batsman',
      jerseyNumber: 32,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 32.5, strikeRate: 139.8 }
    }
  ],
  LSG: [
    {
      id: 'kl-rahul',
      name: 'KL Rahul',
      team: 'LSG',
      role: 'wicket-keeper',
      jerseyNumber: 1,
      imageUrl: 'https://images.unsplash.com/photo-1519085360771-9852ef158dba?w=400&h=500&fit=crop',
      stats: { average: 39.5, strikeRate: 137.2 }
    },
    {
      id: 'quinton-de-kock',
      name: 'Quinton de Kock',
      team: 'LSG',
      role: 'wicket-keeper',
      jerseyNumber: 17,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      stats: { average: 37.8, strikeRate: 143.6 }
    },
    {
      id: 'nicholas-pooran',
      name: 'Nicholas Pooran',
      team: 'LSG',
      role: 'batsman',
      jerseyNumber: 7,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { average: 33.2, strikeRate: 146.8 }
    },
    {
      id: 'naveen-ul-haq',
      name: 'Naveen-ul-Haq',
      team: 'LSG',
      role: 'bowler',
      jerseyNumber: 9,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
      stats: { wickets: 6, economy: 7.2 }
    },
    {
      id: 'ravi-bishnoi',
      name: 'Ravi Bishnoi',
      team: 'LSG',
      role: 'bowler',
      jerseyNumber: 34,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      stats: { wickets: 8, economy: 6.8 }
    }
  ]
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
