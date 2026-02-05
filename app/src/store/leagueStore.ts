import { create } from 'zustand';
import type { League, Fixture, Standing } from '@/types';

interface LeagueState {
  leagues: League[];
  userLeagues: string[];
  currentLeague: League | null;
  createLeague: (leagueData: Partial<League>) => League;
  joinLeague: (leagueId: string) => void;
  leaveLeague: (leagueId: string) => void;
  setCurrentLeague: (league: League | null) => void;
  updateFixture: (leagueId: string, fixture: Fixture) => void;
  updateStandings: (leagueId: string, standings: Standing[]) => void;
}

const mockLeagues: League[] = [
  {
    id: 'league-1',
    name: 'Elite Division Spring 2026',
    creatorId: 'admin',
    gameDays: ['Monday', 'Thursday'],
    startDate: '2026-01-15',
    mode: '501',
    legs: 5,
    doubleOut: 'on',
    isPrivate: false,
    participants: ['1', '2', '3', '4'],
    fixtures: [],
    standings: [],
  },
];

export const useLeagueStore = create<LeagueState>((set, get) => ({
  leagues: mockLeagues,
  userLeagues: [],
  currentLeague: null,

  createLeague: (leagueData) => {
    const newLeague: League = {
      id: 'league-' + Date.now(),
      name: leagueData.name || 'New League',
      creatorId: '1',
      gameDays: leagueData.gameDays || ['Monday'],
      startDate: leagueData.startDate || new Date().toISOString(),
      mode: leagueData.mode || '501',
      legs: leagueData.legs || 3,
      doubleOut: leagueData.doubleOut || 'on',
      isPrivate: leagueData.isPrivate || false,
      participants: ['1'],
      fixtures: [],
      standings: [],
    };
    
    set({
      leagues: [...get().leagues, newLeague],
      userLeagues: [...get().userLeagues, newLeague.id],
    });
    
    return newLeague;
  },

  joinLeague: (leagueId) => {
    if (!get().userLeagues.includes(leagueId)) {
      set({ userLeagues: [...get().userLeagues, leagueId] });
    }
  },

  leaveLeague: (leagueId) => {
    set({ userLeagues: get().userLeagues.filter(id => id !== leagueId) });
  },

  setCurrentLeague: (league) => {
    set({ currentLeague: league });
  },

  updateFixture: (leagueId, fixture) => {
    const leagues = get().leagues.map(league => {
      if (league.id === leagueId) {
        const fixtures = league.fixtures.map(f => f.id === fixture.id ? fixture : f);
        return { ...league, fixtures };
      }
      return league;
    });
    set({ leagues });
  },

  updateStandings: (leagueId, standings) => {
    const leagues = get().leagues.map(league => {
      if (league.id === leagueId) {
        return { ...league, standings };
      }
      return league;
    });
    set({ leagues });
  },
}));
