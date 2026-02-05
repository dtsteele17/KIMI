export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  elo?: number;
  tier?: string;
  division?: number;
  total_matches?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  status: string;
  game_mode_id?: string;
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  legs_to_win: number;
  sets_to_win?: number;
  current_leg: number;
  current_set?: number;
  player1_legs_won: number;
  player2_legs_won: number;
  player1_sets_won?: number;
  player2_sets_won?: number;
  current_player_id?: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  is_ranked?: boolean;
  is_private?: boolean;
  invite_code?: string;
  is_vs_bot?: boolean;
  bot_level?: number;
}

export interface Leg {
  id: string;
  match_id?: string;
  leg_number: number;
  set_number?: number;
  winner_id?: string;
  player1_starting_score?: number;
  player2_starting_score?: number;
  player1_remaining?: number;
  player2_remaining?: number;
  player1_marks?: any;
  player2_marks?: any;
  player1_points?: number;
  player2_points?: number;
  player1_darts_thrown?: number;
  player2_darts_thrown?: number;
  player1_total_scored?: number;
  player2_total_scored?: number;
  created_at: string;
  completed_at?: string;
}

export interface Visit {
  id: string;
  leg_id?: string;
  match_id?: string;
  player_id?: string;
  visit_number: number;
  dart1_score?: number;
  dart1_multiplier?: number;
  dart2_score?: number;
  dart2_multiplier?: number;
  dart3_score?: number;
  dart3_multiplier?: number;
  total_scored: number;
  remaining_before: number;
  remaining_after: number;
  is_bust?: boolean;
  is_checkout?: boolean;
  checkout_attempt?: boolean;
  marks?: any;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at'>>;
      };
      legs: {
        Row: Leg;
        Insert: Omit<Leg, 'id' | 'created_at'>;
        Update: Partial<Omit<Leg, 'id' | 'created_at'>>;
      };
      visits: {
        Row: Visit;
        Insert: Omit<Visit, 'id' | 'created_at'>;
        Update: Partial<Omit<Visit, 'id' | 'created_at'>>;
      };
    };
  };
}
