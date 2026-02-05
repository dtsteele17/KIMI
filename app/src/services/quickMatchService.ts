import { supabase } from '@/lib/supabase';
import type { Match, Profile } from '@/types/database';

export const quickMatchService = {
  // Create a new lobby
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
        is_ranked: false,
        is_private: false,
      })
      .select('*, player1:profiles!player1_id(*)')
      .single();

    if (error) throw error;
    return data as Match & { player1: Profile };
  },

  // Get all available lobbies
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

    // First check if lobby is still available
    const { data: checkData } = await supabase
      .from('matches')
      .select('status, player2_id')
      .eq('id', matchId)
      .single();

    if (!checkData || checkData.status !== 'waiting' || checkData.player2_id) {
      throw new Error('Lobby no longer available');
    }

    const { data, error } = await supabase
      .from('matches')
      .update({
        player2_id: user.user.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_player_id: user.user.id, // Player 2 starts
      })
      .eq('id', matchId)
      .eq('status', 'waiting')
      .is('player2_id', null)
      .select('*, player1:profiles!player1_id(*), player2:profiles!player2_id(*)')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Lobby no longer available');
    return data as Match & { player1: Profile; player2: Profile };
  },

  // Subscribe to lobby updates (for when someone joins your lobby)
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

  // Subscribe to new lobbies (for browser page)
  subscribeToNewLobbies(onUpdate: () => void) {
    return supabase
      .channel('new-lobbies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: 'status=eq.waiting',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();
  },

  // Cancel/delete lobby
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
  // Subscribe to ALL match changes (not just one lobby)
  subscribeToAllMatches(onUpdate: () => void) {
    return supabase
      .channel('all-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();
  },
  
  // Get a specific match
  async getMatch(matchId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('*, player1:profiles!player1_id(*), player2:profiles!player2_id(*)')
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data as Match & { player1: Profile; player2?: Profile };
  }
};