import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ user: User | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username.toLowerCase(),
            display_name: username,
            elo: 1200,
            tier: 'Bronze',
            division: 1,
          });

        if (profileError) {
          return { user: null, error: profileError.message };
        }
      }

      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
  };
}
