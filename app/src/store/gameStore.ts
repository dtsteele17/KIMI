import { create } from 'zustand';
import type { GameSettings, TrainingSettings, Match, Visit } from '@/types';

interface GameState {
  // Game Settings
  quickPlaySettings: GameSettings;
  privateGameSettings: GameSettings;
  trainingSettings: TrainingSettings;
  
  // Current Game
  currentMatch: Match | null;
  isSearching: boolean;
  isInGame: boolean;
  gameMode: 'quick' | 'ranked' | 'private' | 'training' | null;
  
  // Game State
  currentScore: number;
  visits: Visit[];
  currentVisit: Visit;
  player1Legs: number;
  player2Legs: number;
  isPlayerTurn: boolean;
  player1DartsThrown: number;
  player2DartsThrown: number;
  player1TotalScore: number;
  player2TotalScore: number;
  
  // Actions
  setQuickPlaySettings: (settings: Partial<GameSettings>) => void;
  setPrivateGameSettings: (settings: Partial<GameSettings>) => void;
  setTrainingSettings: (settings: Partial<TrainingSettings>) => void;
  startSearching: (mode: 'quick' | 'ranked') => void;
  stopSearching: () => void;
  startGame: (match: Match, mode: 'quick' | 'ranked' | 'private' | 'training') => void;
  endGame: () => void;
  submitScore: (score: number) => void;
  submitVisit: () => void;
  clearCurrentVisit: () => void;
  addDart: (score: number) => void;
  removeLastDart: () => void;
  switchTurn: () => void;
  winLeg: (playerId: string) => void;
  resetGame: () => void;
}

const defaultSettings: GameSettings = {
  mode: '501',
  legs: 3,
  doubleOut: 'on',
};

const defaultTrainingSettings: TrainingSettings = {
  ...defaultSettings,
  botLevel: 55,
};

const createEmptyVisit = (): Visit => ({
  dart1: null,
  dart2: null,
  dart3: null,
  total: 0,
  remaining: 0,
  isBust: false,
});

export const useGameStore = create<GameState>((set, get) => ({
  // Settings
  quickPlaySettings: { ...defaultSettings },
  privateGameSettings: { ...defaultSettings },
  trainingSettings: { ...defaultTrainingSettings },
  
  // Current Game
  currentMatch: null,
  isSearching: false,
  isInGame: false,
  gameMode: null,
  
  // Game State
  currentScore: 501,
  visits: [],
  currentVisit: createEmptyVisit(),
  player1Legs: 0,
  player2Legs: 0,
  isPlayerTurn: true,
  player1DartsThrown: 0,
  player2DartsThrown: 0,
  player1TotalScore: 0,
  player2TotalScore: 0,

  setQuickPlaySettings: (settings) => {
    set({ quickPlaySettings: { ...get().quickPlaySettings, ...settings } });
  },

  setPrivateGameSettings: (settings) => {
    set({ privateGameSettings: { ...get().privateGameSettings, ...settings } });
  },

  setTrainingSettings: (settings) => {
    set({ trainingSettings: { ...get().trainingSettings, ...settings } });
  },

  startSearching: (mode) => {
    set({ isSearching: true });
    // Simulate finding a match after 3 seconds
    setTimeout(() => {
      const mockMatch: Match = {
        id: 'match-' + Date.now(),
        player1: {
          id: '1',
          username: 'player1',
          displayName: 'You',
          elo: 1200,
          rank: { tier: 'Gold', division: 3, minElo: 1000, maxElo: 1199 },
          placementsCompleted: 10,
        },
        player2: {
          id: '2',
          username: 'opponent',
          displayName: 'Opponent',
          elo: 1180,
          rank: { tier: 'Gold', division: 3, minElo: 1000, maxElo: 1199 },
          placementsCompleted: 10,
        },
        settings: get().quickPlaySettings,
        legs: [],
        currentLeg: 1,
        currentTurn: '1',
        winner: null,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      };
      get().startGame(mockMatch, mode);
    }, 3000);
  },

  stopSearching: () => {
    set({ isSearching: false });
  },

  startGame: (match, mode) => {
    const startingScore = parseInt(match.settings.mode);
    set({
      currentMatch: match,
      isSearching: false,
      isInGame: true,
      gameMode: mode,
      currentScore: startingScore,
      visits: [],
      currentVisit: createEmptyVisit(),
      player1Legs: 0,
      player2Legs: 0,
      isPlayerTurn: true,
      player1DartsThrown: 0,
      player2DartsThrown: 0,
      player1TotalScore: 0,
      player2TotalScore: 0,
    });
  },

  endGame: () => {
    set({
      currentMatch: null,
      isInGame: false,
      gameMode: null,
    });
  },

  submitScore: (score) => {
    const state = get();
    const newRemaining = state.currentScore - score;
    
    if (newRemaining < 0 || newRemaining === 1 || (newRemaining === 0 && state.currentMatch?.settings.doubleOut === 'on')) {
      // Bust
      set({
        currentVisit: { ...state.currentVisit, isBust: true },
      });
    } else {
      const currentVisit = state.currentVisit;
      let newVisit = { ...currentVisit };
      
      if (currentVisit.dart1 === null) {
        newVisit.dart1 = score;
      } else if (currentVisit.dart2 === null) {
        newVisit.dart2 = score;
      } else if (currentVisit.dart3 === null) {
        newVisit.dart3 = score;
      }
      
      newVisit.total = (newVisit.dart1 || 0) + (newVisit.dart2 || 0) + (newVisit.dart3 || 0);
      newVisit.remaining = newRemaining;
      
      set({ currentVisit: newVisit, currentScore: newRemaining });
    }
  },

  submitVisit: () => {
    const state = get();
    const newVisits = [...state.visits, state.currentVisit];
    
    if (state.isPlayerTurn) {
      set({
        visits: newVisits,
        currentVisit: createEmptyVisit(),
        player1DartsThrown: state.player1DartsThrown + 3,
        player1TotalScore: state.player1TotalScore + state.currentVisit.total,
      });
    } else {
      set({
        visits: newVisits,
        currentVisit: createEmptyVisit(),
        player2DartsThrown: state.player2DartsThrown + 3,
        player2TotalScore: state.player2TotalScore + state.currentVisit.total,
      });
    }
  },

  clearCurrentVisit: () => {
    set({ currentVisit: createEmptyVisit() });
  },

  addDart: (score) => {
    const state = get();
    const currentVisit = state.currentVisit;
    let newVisit = { ...currentVisit };
    
    if (currentVisit.dart1 === null) {
      newVisit.dart1 = score;
    } else if (currentVisit.dart2 === null) {
      newVisit.dart2 = score;
    } else if (currentVisit.dart3 === null) {
      newVisit.dart3 = score;
    }
    
    newVisit.total = (newVisit.dart1 || 0) + (newVisit.dart2 || 0) + (newVisit.dart3 || 0);
    
    set({ currentVisit: newVisit });
  },

  removeLastDart: () => {
    const state = get();
    const currentVisit = state.currentVisit;
    let newVisit = { ...currentVisit };
    
    if (currentVisit.dart3 !== null) {
      newVisit.dart3 = null;
    } else if (currentVisit.dart2 !== null) {
      newVisit.dart2 = null;
    } else if (currentVisit.dart1 !== null) {
      newVisit.dart1 = null;
    }
    
    newVisit.total = (newVisit.dart1 || 0) + (newVisit.dart2 || 0) + (newVisit.dart3 || 0);
    
    set({ currentVisit: newVisit });
  },

  switchTurn: () => {
    const state = get();
    set({ isPlayerTurn: !state.isPlayerTurn });
  },

  winLeg: (playerId) => {
    const state = get();
    const match = state.currentMatch;
    if (!match) return;
    
    const isPlayer1 = playerId === match.player1.id;
    const newPlayer1Legs = isPlayer1 ? state.player1Legs + 1 : state.player1Legs;
    const newPlayer2Legs = !isPlayer1 ? state.player2Legs + 1 : state.player2Legs;
    
    const legsNeeded = Math.ceil(match.settings.legs / 2);
    
    if (newPlayer1Legs >= legsNeeded || newPlayer2Legs >= legsNeeded) {
      // Match won
      set({
        player1Legs: newPlayer1Legs,
        player2Legs: newPlayer2Legs,
      });
    } else {
      // Next leg
      const startingScore = parseInt(match.settings.mode);
      set({
        player1Legs: newPlayer1Legs,
        player2Legs: newPlayer2Legs,
        currentScore: startingScore,
        visits: [],
        currentVisit: createEmptyVisit(),
        isPlayerTurn: !state.isPlayerTurn, // Alternate who starts
      });
    }
  },

  resetGame: () => {
    set({
      currentMatch: null,
      isSearching: false,
      isInGame: false,
      gameMode: null,
      currentScore: 501,
      visits: [],
      currentVisit: createEmptyVisit(),
      player1Legs: 0,
      player2Legs: 0,
      isPlayerTurn: true,
      player1DartsThrown: 0,
      player2DartsThrown: 0,
      player1TotalScore: 0,
      player2TotalScore: 0,
    });
  },
}));
