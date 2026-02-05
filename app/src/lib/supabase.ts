import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
