import { supabase } from '@/lib/supabase';
import type { Match, Leg, Visit } from '@/types/database';

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

    // No leg exists, create one (but check again to avoid race condition)
    return this.createLeg(matchId, 1);
  },

  async createLeg(matchId: string, legNumber: number) {
    const { data: match } = await supabase
      .from('matches')
      .select('game_mode_id')
      .eq('id', matchId)
      .single();

    const startingScore = match?.game_mode_id === '301' ? 301 : 501;

    // Use RPC or handle conflict gracefully
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

    // If duplicate error, just fetch the existing leg
    if (error && error.code === '23505') {
      const { data: existingLeg } = await supabase
        .from('legs')
        .select('*')
        .eq('match_id', matchId)
        .eq('leg_number', legNumber)
        .single();
      return existingLeg;
    }

    if (error) throw error;
    
    // Update match current_leg
    await supabase
      .from('matches')
      .update({ current_leg: legNumber })
      .eq('id', matchId);

    return data;
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

  // Subscribe to match updates
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