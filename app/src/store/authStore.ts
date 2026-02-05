import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Player, UserStats, RankTier, RankDivision } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: Player | null;
  stats: UserStats;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<Player>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  initAuth: () => Promise<void>;
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

const getRankFromElo = (_elo: number, tier: string, division: number) => {
  const tierRanges: Record<RankTier, { min: number; max: number }> = {
    'Bronze': { min: 0, max: 799 },
    'Silver': { min: 800, max: 999 },
    'Gold': { min: 1000, max: 1199 },
    'Diamond': { min: 1200, max: 1599 },
    'Champion': { min: 1600, max: 1999 },
    'Grand Champion': { min: 2000, max: 9999 },
  };

  const range = tierRanges[tier as RankTier] || tierRanges['Bronze'];

  return {
    tier: tier as RankTier,
    division: division as RankDivision,
    minElo: range.min,
    maxElo: range.max,
  };
};

const profileToPlayer = (profile: any): Player => {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name || profile.username,
    avatar: profile.avatar_url,
    elo: profile.elo || 1200,
    rank: getRankFromElo(profile.elo || 1200, profile.tier || 'Bronze', profile.division || 1),
    placementsCompleted: 0,
    isOnline: true,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  stats: defaultStats,

  initAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        set({
          isAuthenticated: true,
          user: profileToPlayer(profile),
        });
      }
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          set({
            isAuthenticated: true,
            user: profileToPlayer(profile),
          });
        }
      } else if (event === 'SIGNED_OUT') {
        set({ isAuthenticated: false, user: null, stats: defaultStats });
      }
    });
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile) {
          set({
            isAuthenticated: true,
            user: profileToPlayer(profile),
          });
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  },

  signup: async (username: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username.toLowerCase(),
            display_name: username,
            elo: 1200,
            tier: 'Bronze',
            division: 1,
          });

        if (profileError) {
          return { success: false, error: profileError.message };
        }

        const player: Player = {
          id: data.user.id,
          username: username.toLowerCase(),
          displayName: username,
          elo: 1200,
          rank: getRankFromElo(1200, 'Bronze', 1),
          placementsCompleted: 0,
          isOnline: true,
        };

        set({ isAuthenticated: true, user: player });
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
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
