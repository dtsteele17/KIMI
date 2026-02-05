import { supabase } from '@/lib/supabase';

export interface MatchWithPlayers {
  id: string;
  game_mode_id: string;
  player1_id: string;
  player2_id: string;
  status: string;
  legs_to_win: number;
  player1_legs_won: number;
  player2_legs_won: number;
  current_player_id: string;
  winner_id?: string;
  started_at?: string;
  ended_at?: string;
  player1: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  player2: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface Leg {
  id: string;
  match_id: string;
  leg_number: number;
  player1_starting_score: number;
  player2_starting_score: number;
  player1_remaining: number;
  player2_remaining: number;
  player1_darts_thrown: number;
  player2_darts_thrown: number;
  player1_total_scored: number;
  player2_total_scored: number;
  winner_id?: string;
  completed_at?: string;
}

export interface Visit {
  id: string;
  leg_id: string;
  match_id: string;
  player_id: string;
  visit_number: number;
  dart1_score: number | null;
  dart1_multiplier: number;
  dart2_score: number | null;
  dart2_multiplier: number;
  dart3_score: number | null;
  dart3_multiplier: number;
  total_scored: number;
  remaining_before: number;
  remaining_after: number;
  is_bust: boolean;
  is_checkout: boolean;
  created_at: string;
}

export const gameService = {
  async getMatch(matchId: string): Promise<MatchWithPlayers> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:profiles!player1_id(*),
        player2:profiles!player2_id(*)
      `)
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data as MatchWithPlayers;
  },

  async getCurrentLeg(matchId: string): Promise<Leg | null> {
    const { data, error } = await supabase
      .from('legs')
      .select('*')
      .eq('match_id', matchId)
      .is('winner_id', null)
      .order('leg_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as Leg | null;
  },

  async createLeg(matchId: string, legNumber: number, startingScore: number): Promise<Leg> {
    const { data, error } = await supabase
      .from('legs')
      .insert({
        match_id: matchId,
        leg_number: legNumber,
        player1_starting_score: startingScore,
        player2_starting_score: startingScore,
        player1_remaining: startingScore,
        player2_remaining: startingScore,
        player1_darts_thrown: 0,
        player2_darts_thrown: 0,
        player1_total_scored: 0,
        player2_total_scored: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Leg;
  },

  async getVisitsForLeg(legId: string): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('leg_id', legId)
      .order('visit_number', { ascending: true });

    if (error) throw error;
    return data as Visit[];
  },

  async submitVisit(
    legId: string,
    matchId: string,
    playerId: string,
    visitNumber: number,
    dart1: { score: number | null; multiplier: number },
    dart2: { score: number | null; multiplier: number },
    dart3: { score: number | null; multiplier: number },
    totalScored: number,
    remainingBefore: number,
    remainingAfter: number,
    isBust: boolean,
    isCheckout: boolean
  ): Promise<Visit> {
    const { data, error } = await supabase
      .from('visits')
      .insert({
        leg_id: legId,
        match_id: matchId,
        player_id: playerId,
        visit_number: visitNumber,
        dart1_score: dart1.score,
        dart1_multiplier: dart1.multiplier,
        dart2_score: dart2.score,
        dart2_multiplier: dart2.multiplier,
        dart3_score: dart3.score,
        dart3_multiplier: dart3.multiplier,
        total_scored: totalScored,
        remaining_before: remainingBefore,
        remaining_after: remainingAfter,
        is_bust: isBust,
        is_checkout: isCheckout,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Visit;
  },

  async updateLegScores(
    legId: string,
    playerId: string,
    remaining: number,
    dartsThrown: number,
    totalScored: number
  ): Promise<void> {
    const { data: leg } = await supabase
      .from('legs')
      .select('player1_id, player2_id')
      .eq('id', legId)
      .single();

    if (!leg) return;

    const { data: match } = await supabase
      .from('matches')
      .select('player1_id')
      .eq('id', (await supabase.from('legs').select('match_id').eq('id', legId).single()).data?.match_id)
      .single();

    const isPlayer1 = match?.player1_id === playerId;

    const updates = isPlayer1
      ? {
          player1_remaining: remaining,
          player1_darts_thrown: dartsThrown,
          player1_total_scored: totalScored,
        }
      : {
          player2_remaining: remaining,
          player2_darts_thrown: dartsThrown,
          player2_total_scored: totalScored,
        };

    const { error } = await supabase
      .from('legs')
      .update(updates)
      .eq('id', legId);

    if (error) throw error;
  },

  async completeLeg(legId: string, winnerId: string): Promise<void> {
    const { error } = await supabase
      .from('legs')
      .update({
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', legId);

    if (error) throw error;

    const { data: leg } = await supabase
      .from('legs')
      .select('match_id')
      .eq('id', legId)
      .single();

    if (!leg) return;

    const { data: match } = await supabase
      .from('matches')
      .select('player1_id, player2_id, player1_legs_won, player2_legs_won')
      .eq('id', leg.match_id)
      .single();

    if (!match) return;

    const isPlayer1Winner = match.player1_id === winnerId;
    const newPlayer1Legs = isPlayer1Winner ? match.player1_legs_won + 1 : match.player1_legs_won;
    const newPlayer2Legs = !isPlayer1Winner ? match.player2_legs_won + 1 : match.player2_legs_won;

    await supabase
      .from('matches')
      .update({
        player1_legs_won: newPlayer1Legs,
        player2_legs_won: newPlayer2Legs,
      })
      .eq('id', leg.match_id);
  },

  async completeMatch(matchId: string, winnerId: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        winner_id: winnerId,
        ended_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    if (error) throw error;
  },

  async switchTurn(matchId: string, newPlayerId: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({
        current_player_id: newPlayerId,
      })
      .eq('id', matchId);

    if (error) throw error;
  },

  subscribeToMatch(matchId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToLeg(legId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`leg:${legId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legs',
          filter: `id=eq.${legId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToVisits(legId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`visits:${legId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visits',
          filter: `leg_id=eq.${legId}`,
        },
        callback
      )
      .subscribe();
  },

  async recordCheckout(
    playerId: string,
    matchId: string,
    legId: string,
    checkoutScore: number,
    dartsUsed: number,
    route: string
  ): Promise<void> {
    await supabase.from('checkout_history').insert({
      player_id: playerId,
      match_id: matchId,
      leg_id: legId,
      checkout_score: checkoutScore,
      darts_used: dartsUsed,
      route: route,
    });
  },
};

export const checkoutSuggestions: Record<number, string> = {
  170: 'T20 T20 Bull', 167: 'T20 T19 Bull', 164: 'T20 T18 Bull', 161: 'T20 T17 Bull',
  160: 'T20 T20 D20', 158: 'T20 T20 D19', 157: 'T20 T19 D20', 156: 'T20 T20 D18',
  155: 'T20 T19 D19', 154: 'T20 T18 D20', 153: 'T20 T19 D18', 152: 'T20 T20 D16',
  151: 'T20 T17 D20', 150: 'T20 T18 D18', 149: 'T20 T19 D16', 148: 'T20 T20 D14',
  147: 'T20 T17 D18', 146: 'T20 T18 D16', 145: 'T20 T15 D20', 144: 'T20 T20 D12',
  143: 'T20 T17 D16', 142: 'T20 T14 D20', 141: 'T20 T19 D12', 140: 'T20 T20 D10',
  139: 'T20 T13 D20', 138: 'T20 T18 D12', 137: 'T20 T15 D16', 136: 'T20 T20 D8',
  135: 'T20 T17 D12', 134: 'T20 T14 D16', 133: 'T20 T19 D8', 132: 'T20 T16 D12',
  131: 'T20 T13 D16', 130: 'T20 T20 D5', 129: 'T19 T16 D12', 128: 'T20 T20 D4',
  127: 'T20 T17 D8', 126: 'T19 T19 D6', 125: 'T20 T19 D4', 124: 'T20 T16 D8',
  123: 'T20 T13 D12', 122: 'T18 T18 D7', 121: 'T20 T15 D8', 120: 'T20 20 D20',
  119: 'T19 T12 D13', 118: 'T20 18 D20', 117: 'T20 17 D20', 116: 'T20 16 D20',
  115: 'T20 15 D20', 114: 'T20 14 D20', 113: 'T20 13 D20', 112: 'T20 12 D20',
  111: 'T20 19 D16', 110: 'T20 18 D16', 109: 'T20 17 D16', 108: 'T20 16 D16',
  107: 'T20 15 D16', 106: 'T20 14 D16', 105: 'T20 13 D16', 104: 'T20 12 D16',
  103: 'T20 11 D16', 102: 'T20 10 D16', 101: 'T20 9 D16', 100: 'T20 20 D20',
  99: 'T19 10 D16', 98: 'T20 8 D15', 97: 'T19 10 D15', 96: 'T20 16 D20',
  95: 'T19 10 D14', 94: 'T18 16 D20', 93: 'T19 10 D13', 92: 'T20 12 D20',
  91: 'T17 14 D16', 90: 'T20 10 D20', 89: 'T19 10 D11', 88: 'T16 16 D20',
  87: 'T17 10 D16', 86: 'T18 10 D16', 85: 'T15 10 D20', 84: 'T16 16 D16',
  83: 'T17 6 D16', 82: 'T14 20 D15', 81: 'T15 6 D18', 80: 'T20 D20',
  79: 'T13 10 D16', 78: 'T18 D12', 77: 'T15 6 D16', 76: 'T20 D8',
  75: 'T15 D15', 74: 'T14 D16', 73: 'T19 D8', 72: 'T12 D18',
  71: 'T13 D16', 70: 'T20 D5', 69: 'T19 D6', 68: 'T20 D4',
  67: 'T17 D8', 66: 'T10 D18', 65: 'T19 D4', 64: 'T16 D8',
  63: 'T13 D12', 62: 'T10 D16', 61: 'T15 D8', 60: '20 D20',
  59: '19 D20', 58: '18 D20', 57: '17 D20', 56: '16 D20',
  55: '15 D20', 54: '14 D20', 53: '13 D20', 52: '12 D20',
  51: '11 D20', 50: '10 D20', 49: '9 D20', 48: '16 D16',
  47: '15 D16', 46: '14 D16', 45: '13 D16', 44: '12 D16',
  43: '11 D16', 42: '10 D16', 41: '9 D16', 40: 'D20',
  39: '7 D16', 38: 'D19', 37: '5 D16', 36: 'D18',
  35: '3 D16', 34: 'D17', 33: '1 D16', 32: 'D16',
  31: '7 D12', 30: 'D15', 29: '13 D8', 28: 'D14',
  27: '11 D8', 26: 'D13', 25: '9 D8', 24: 'D12',
  23: '7 D8', 22: 'D11', 21: '5 D8', 20: 'D10',
  19: '3 D8', 18: 'D9', 17: '1 D8', 16: 'D8',
  15: '7 D4', 14: 'D7', 13: '5 D4', 12: 'D6',
  11: '3 D4', 10: 'D5', 9: '1 D4', 8: 'D4',
  7: '3 D2', 6: 'D3', 5: '1 D2', 4: 'D2',
  3: '1 D1', 2: 'D1',
};
