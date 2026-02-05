import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpzdenlnqtxpleexgxyb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwemRlbmxucXR4cGxlZXhneHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTAyNTcsImV4cCI6MjA4NTg2NjI1N30.9lqOUFtuENc8bPESZxK_gSX4tp_4ijlpEL6YsWKm3v4';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const subscribeToMatch = (matchId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`match:${matchId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'visits',
      filter: `match_id=eq.${matchId}`,
    }, callback)
    .subscribe();
};
