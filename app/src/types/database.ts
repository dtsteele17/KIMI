export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  stats?: {
    wins: number;
    losses: number;
    total_matches: number;
    average_score: number;
  };
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  current_player: 1 | 2;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  winner_id?: string;
  game_type: '501' | '301' | '701';
  legs_to_win: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Visit {
  id: string;
  match_id: string;
  player_id: string;
  visit_number: number;
  dart1_score: number;
  dart2_score: number;
  dart3_score: number;
  total_score: number;
  remaining_score: number;
  is_bust: boolean;
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
        Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at'>>;
      };
      visits: {
        Row: Visit;
        Insert: Omit<Visit, 'id' | 'created_at'>;
        Update: Partial<Omit<Visit, 'id' | 'created_at'>>;
      };
    };
  };
}
