// Darts Game Types

export type GameMode = '301' | '501';
export type LegsOption = 1 | 3 | 5 | 7 | 9 | 11 | 13 | 15;
export type DoubleOut = 'on' | 'off';
export type BotLevel = 25 | 35 | 45 | 55 | 65 | 75 | 85;

export interface GameSettings {
  mode: GameMode;
  legs: LegsOption;
  doubleOut: DoubleOut;
}

export interface TrainingSettings extends GameSettings {
  botLevel: BotLevel;
}

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Champion' | 'Grand Champion';
export type RankDivision = 1 | 2 | 3 | 4;

export interface Rank {
  tier: RankTier;
  division: RankDivision;
  minElo: number;
  maxElo: number;
}

export interface Player {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  elo: number;
  rank: Rank;
  placementsCompleted: number;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  avgScore: number;
  checkoutPercentage: number;
  dartsThrown: number;
  highestCheckout: number;
  bestStreak: number;
  currentStreak: number;
}

export interface Leg {
  winner: string | null;
  scores: Record<string, number>;
}

export interface Match {
  id: string;
  player1: Player;
  player2: Player;
  settings: GameSettings;
  legs: Leg[];
  currentLeg: number;
  currentTurn: string;
  winner: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Visit {
  dart1: number | null;
  dart2: number | null;
  dart3: number | null;
  total: number;
  remaining: number;
  isBust: boolean;
}

export interface GameState {
  match: Match | null;
  currentScore: number;
  visits: Visit[];
  currentVisit: Visit;
  player1Legs: number;
  player2Legs: number;
  isPlayerTurn: boolean;
}

export interface League {
  id: string;
  name: string;
  creatorId: string;
  gameDays: string[];
  startDate: string;
  mode: GameMode;
  legs: LegsOption;
  doubleOut: DoubleOut;
  isPrivate: boolean;
  participants: string[];
  fixtures: Fixture[];
  standings: Standing[];
}

export interface Fixture {
  id: string;
  player1Id: string;
  player2Id: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  winner: string | null;
  player1Score: number;
  player2Score: number;
}

export interface Standing {
  playerId: string;
  played: number;
  won: number;
  lost: number;
  legsFor: number;
  legsAgainst: number;
  points: number;
}

export interface Tournament {
  id: string;
  name: string;
  creatorId: string;
  startDate: string;
  startTime: string;
  maxParticipants: number;
  participants: string[];
  mode: GameMode;
  legs: LegsOption;
  doubleOut: DoubleOut;
  isPrivate: boolean;
  status: 'open' | 'closed' | 'in_progress' | 'completed';
  bracket: BracketMatch[];
}

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1Id: string | null;
  player2Id: string | null;
  winner: string | null;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  isOnline: boolean;
  lastSeen?: string;
}

export type Page = 
  | 'home' 
  | 'login' 
  | 'signup' 
  | 'dashboard' 
  | 'play' 
  | 'ranked-divisions' 
  | 'leagues' 
  | 'league-detail'
  | 'tournaments' 
  | 'tournament-detail'
  | 'stats' 
  | 'profile' 
  | 'friends' 
  | 'game' 
  | 'training';
