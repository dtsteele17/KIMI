import { supabase } from '@/lib/supabase';
import type { Visit } from '@/types/database';

export const gameService = {
  async getMatchWithDetails(matchId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('*, player1:profiles!player1_id(*), player2:profiles!player2_id(*)')
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data;
  },

  async getCurrentLeg(matchId: string) {
    // First, try to get existing open leg
    const { data: existingLegs, error: selectError } = await supabase
      .from('legs')
      .select('*')
      .eq('match_id', matchId)
      .is('winner_id', null)
      .order('leg_number', { ascending: false })
      .limit(1);

    if (selectError) throw selectError;
    
    // If leg exists, return it
    if (existingLegs && existingLegs.length > 0) {
      return existingLegs[0];
    }

    // No leg exists, get match info first
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('game_mode_id')
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;

    const startingScore = match?.game_mode_id === '301' ? 301 : 501;

    // Try to create leg, handle race condition
    try {
      const { data, error } = await supabase
        .from('legs')
        .insert({
          match_id: matchId,
          leg_number: 1,
          player1_starting_score: startingScore,
          player2_starting_score: startingScore,
          player1_remaining: startingScore,
          player2_remaining: startingScore,
        })
        .select()
        .single();

      if (error) {
        // If duplicate, fetch existing
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('legs')
            .select('*')
            .eq('match_id', matchId)
            .eq('leg_number', 1)
            .single();
          return existing;
        }
        throw error;
      }

      return data;
    } catch (err) {
      // Try one more time to fetch if creation failed
      const { data: existing } = await supabase
        .from('legs')
        .select('*')
        .eq('match_id', matchId)
        .eq('leg_number', 1)
        .single();
      
      if (existing) return existing;
      throw err;
    }
  },

  async getLegVisits(legId: string) {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('leg_id', legId)
      .order('visit_number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async recordVisit(visit: Partial<Visit>) {
    const { data, error } = await supabase
      .from('visits')
      .insert(visit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVisit(visitId: string, updates: Partial<Visit>) {
    const { data, error } = await supabase
      .from('visits')
      .update(updates)
      .eq('id', visitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLegWinner(legId: string, winnerId: string) {
    const { error } = await supabase
      .from('legs')
      .update({ 
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', legId);

    if (error) throw error;
  },

  async createNewLeg(matchId: string, legNumber: number, gameMode: string) {
    const startingScore = gameMode === '301' ? 301 : 501;

    try {
      const { data, error } = await supabase
        .from('legs')
        .insert({
          match_id: matchId,
          leg_number: legNumber,
          player1_starting_score: startingScore,
          player2_starting_score: startingScore,
          player1_remaining: startingScore,
          player2_remaining: startingScore,
        })
        .select()
        .single();

      if (error) throw error;

      // Update match current_leg
      await supabase
        .from('matches')
        .update({ current_leg: legNumber })
        .eq('id', matchId);

      return data;
    } catch (err) {
      // If duplicate, fetch existing
      const error = err as { code?: string };
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('legs')
          .select('*')
          .eq('match_id', matchId)
          .eq('leg_number', legNumber)
          .single();
        return existing;
      }
      throw err;
    }
  },

  async updateMatchLegsWon(matchId: string, player: 'player1' | 'player2', legsWon: number) {
    const updateData = player === 'player1' 
      ? { player1_legs_won: legsWon }
      : { player2_legs_won: legsWon };
    
    const { error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId);

    if (error) throw error;
  },

  async endMatch(matchId: string, winnerId: string) {
    const { error } = await supabase
      .from('matches')
      .update({
        winner_id: winnerId,
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    if (error) throw error;
  },
  async forfeitMatch(matchId: string, playerId: string) {
    // Get match first
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) throw new Error('Match not found');

    // Determine winner (the other player)
    const winnerId = match.player1_id === playerId ? match.player2_id : match.player1_id;

    // Update match
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'abandoned',
        winner_id: winnerId,
        ended_at: new Date().toISOString(),
        forfeited_by: playerId // You'll need to add this column
      })
      .eq('id', matchId);

    if (error) throw error;

    // Record forfeit event
    await supabase
      .from('match_events')
      .insert({
        match_id: matchId,
        event_type: 'forfeit',
        player_id: playerId,
        payload: { reason: 'Player forfeited' }
      });
  }
  
  subscribeToMatch(matchId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`match:${matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'legs',
        filter: `match_id=eq.${matchId}`,
      }, callback)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'visits',
        filter: `match_id=eq.${matchId}`,
      }, callback)
      .subscribe();
  }
};