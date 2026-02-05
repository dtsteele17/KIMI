import { create } from 'zustand';
import type { Player, UserStats } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: Player | null;
  stats: UserStats;
  login: (_email: string, _password: string) => Promise<boolean>;
  signup: (_username: string, _email: string, _password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<Player>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
}

const defaultStats: UserStats = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  avgScore: 0,
  checkoutPercentage: 0,
  dartsThrown: 0,
  highestCheckout: 0,
  bestStreak: 0,
  currentStreak: 0,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  stats: defaultStats,

  login: async () => {
    // Simulate login - in real app, this would call an API
    const mockUser: Player = {
      id: '1',
      username: 'dtsteele17',
      displayName: 'Anonymous Player',
      elo: 1200,
      rank: {
        tier: 'Gold',
        division: 3,
        minElo: 1000,
        maxElo: 1199,
      },
      placementsCompleted: 0,
      isOnline: true,
    };
    
    set({ isAuthenticated: true, user: mockUser });
    return true;
  },

  signup: async (username) => {
    const mockUser: Player = {
      id: '1',
      username: username.toLowerCase(),
      displayName: username,
      elo: 1200,
      rank: {
        tier: 'Gold',
        division: 3,
        minElo: 1000,
        maxElo: 1199,
      },
      placementsCompleted: 0,
      isOnline: true,
    };
    
    set({ isAuthenticated: true, user: mockUser });
    return true;
  },

  logout: () => {
    set({ isAuthenticated: false, user: null, stats: defaultStats });
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  updateStats: (statsData) => {
    set({ stats: { ...get().stats, ...statsData } });
  },
}));
