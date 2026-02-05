import { supabase } from '@/lib/supabase';
import type { Match, Profile } from '@/types/database';

export const quickMatchService = {
  // Create a new quick match lobby
  async createLobby(gameModeId: string, legsToWin: number = 3) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('matches')
      .insert({
        game_mode_id: gameModeId,
        player1_id: user.user.id,
        status: 'waiting',
        legs_to_win: legsToWin,
        is_ranked: true,
        is_private: false,
      })
      .select('*, player1:profiles!player1_id(*)')
      .single();

    if (error) throw error;
    return data as Match & { player1: Profile };
  },

  // Get all available lobbies (waiting for opponent)
  async getAvailableLobbies() {
    const { data, error } = await supabase
      .from('matches')
      .select('*, player1:profiles!player1_id(*)')
      .eq('status', 'waiting')
      .is('player2_id', null)
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Match & { player1: Profile })[];
  },

  // Join an existing lobby
  async joinLobby(matchId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('matches')
      .update({
        player2_id: user.user.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .eq('status', 'waiting') // Only join if still waiting
      .is('player2_id', null) // Only join if no opponent yet
      .select('*, player1:profiles!player1_id(*), player2:profiles!player2_id(*)')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Lobby no longer available');
    return data as Match & { player1: Profile; player2: Profile };
  },

  // Subscribe to lobby changes (real-time)
  subscribeToLobby(matchId: string, onUpdate: (match: Match) => void) {
    return supabase
      .channel(`lobby:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          onUpdate(payload.new as Match);
        }
      )
      .subscribe();
  },

  // Subscribe to new lobbies (for browsing)
  subscribeToNewLobbies(onNewLobby: (match: Match) => void) {
    return supabase
      .channel('new-lobbies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: 'status=eq.waiting',
        },
        (payload) => {
          onNewLobby(payload.new as Match);
        }
      )
      .subscribe();
  },

  // Cancel/delete lobby (if creator leaves)
  async cancelLobby(matchId: string) {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
      .eq('player1_id', user.user?.id)
      .eq('status', 'waiting');

    if (error) throw error;
  },
};