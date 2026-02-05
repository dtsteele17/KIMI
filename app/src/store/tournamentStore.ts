import { create } from 'zustand';
import type { Tournament, BracketMatch } from '@/types';

interface TournamentState {
  tournaments: Tournament[];
  userTournaments: string[];
  currentTournament: Tournament | null;
  createTournament: (tournamentData: Partial<Tournament>) => Tournament;
  joinTournament: (tournamentId: string) => void;
  leaveTournament: (tournamentId: string) => void;
  setCurrentTournament: (tournament: Tournament | null) => void;
  updateBracket: (tournamentId: string, bracket: BracketMatch[]) => void;
  startTournament: (tournamentId: string) => void;
}

const mockTournaments: Tournament[] = [
  {
    id: 'tournament-1',
    name: 'newone',
    creatorId: 'user1',
    startDate: '2026-02-05',
    startTime: '01:40',
    maxParticipants: 16,
    participants: ['1', '2'],
    mode: '501',
    legs: 3,
    doubleOut: 'on',
    isPrivate: false,
    status: 'open' as const,
    bracket: [],
  },
  {
    id: 'tournament-2',
    name: 'new',
    creatorId: 'user2',
    startDate: '2026-02-05',
    startTime: '01:10',
    maxParticipants: 16,
    participants: ['3', '4'],
    mode: '501',
    legs: 3,
    doubleOut: 'on',
    isPrivate: false,
    status: 'open' as const,
    bracket: [],
  },
  {
    id: 'tournament-3',
    name: 'game_1',
    creatorId: 'user3',
    startDate: '2026-02-04',
    startTime: '23:08',
    maxParticipants: 16,
    participants: ['5', '6'],
    mode: '501',
    legs: 3,
    doubleOut: 'on',
    isPrivate: false,
    status: 'open' as const,
    bracket: [],
  },
  {
    id: 'tournament-4',
    name: 'Testing 2',
    creatorId: 'admin',
    startDate: '2026-02-04',
    startTime: '22:05',
    maxParticipants: 8,
    participants: ['7', '8', '9', '10'],
    mode: '501',
    legs: 3,
    doubleOut: 'on',
    isPrivate: false,
    status: 'open' as const,
    bracket: [],
  },
  {
    id: 'tournament-5',
    name: 'Testinggg',
    creatorId: 'admin',
    startDate: '2026-02-04',
    startTime: '21:57',
    maxParticipants: 8,
    participants: ['11', '12', '13', '14'],
    mode: '501',
    legs: 3,
    doubleOut: 'on',
    isPrivate: false,
    status: 'open' as const,
    bracket: [],
  },
];

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: mockTournaments,
  userTournaments: [],
  currentTournament: null,

  createTournament: (tournamentData) => {
    const newTournament: Tournament = {
      id: 'tournament-' + Date.now(),
      name: tournamentData.name || 'New Tournament',
      creatorId: '1',
      startDate: tournamentData.startDate || new Date().toISOString().split('T')[0],
      startTime: tournamentData.startTime || '18:00',
      maxParticipants: tournamentData.maxParticipants || 16,
      participants: ['1'],
      mode: tournamentData.mode || '501',
      legs: tournamentData.legs || 3,
      doubleOut: tournamentData.doubleOut || 'on',
      isPrivate: tournamentData.isPrivate || false,
      status: 'open' as const,
      bracket: [],
    };
    
    set({
      tournaments: [...get().tournaments, newTournament],
      userTournaments: [...get().userTournaments, newTournament.id],
    });
    
    return newTournament;
  },

  joinTournament: (tournamentId) => {
    const tournaments = get().tournaments.map(t => {
      if (t.id === tournamentId && !t.participants.includes('1')) {
        return { ...t, participants: [...t.participants, '1'] };
      }
      return t;
    });
    
    if (!get().userTournaments.includes(tournamentId)) {
      set({
        tournaments,
        userTournaments: [...get().userTournaments, tournamentId],
      });
    }
  },

  leaveTournament: (tournamentId) => {
    const tournaments = get().tournaments.map(t => {
      if (t.id === tournamentId) {
        return { ...t, participants: t.participants.filter(p => p !== '1') };
      }
      return t;
    });
    
    set({
      tournaments,
      userTournaments: get().userTournaments.filter(id => id !== tournamentId),
    });
  },

  setCurrentTournament: (tournament) => {
    set({ currentTournament: tournament });
  },

  updateBracket: (tournamentId, bracket) => {
    const tournaments = get().tournaments.map(t => {
      if (t.id === tournamentId) {
        return { ...t, bracket };
      }
      return t;
    });
    set({ tournaments });
  },

  startTournament: (tournamentId) => {
    const tournaments = get().tournaments.map(t => {
      if (t.id === tournamentId) {
        return { ...t, status: 'in_progress' as const };
      }
      return t;
    });
    set({ tournaments });
  },
}));
