import { useEffect, useState } from 'react';
import { quickMatchService } from '@/services/quickMatchService';
import { useNavigationStore, useGameStore } from '@/store';
import type { Match, Profile } from '@/types/database';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface LobbyState {
  match: Match & { player1: Profile };
  isCreator: boolean;
  timeWaiting: number;
}

export function QuickMatchLobby() {
  const { navigateTo } = useNavigationStore();
  const { quickPlaySettings } = useGameStore();
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    createLobby();
  }, []);

  useEffect(() => {
    if (!lobby) return;

    const interval = setInterval(() => {
      setLobby(prev =>
        prev
          ? {
              ...prev,
              timeWaiting: prev.timeWaiting + 1,
            }
          : null
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [lobby]);

  useEffect(() => {
    if (!lobby) return;

    const subscription = quickMatchService.subscribeToLobby(lobby.match.id, (updatedMatch) => {
      if (updatedMatch.status === 'in_progress' && updatedMatch.player2_id) {
        navigateTo('game');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [lobby, navigateTo]);

  const createLobby = async () => {
    try {
      setLoading(true);
      const gameMode = quickPlaySettings.mode || '501';
      const legs = Math.ceil((quickPlaySettings.legs || 3) / 2);
      const match = await quickMatchService.createLobby(gameMode, legs);
      setLobby({
        match,
        isCreator: true,
        timeWaiting: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const cancelLobby = async () => {
    if (!lobby) return;
    try {
      await quickMatchService.cancelLobby(lobby.match.id);
      navigateTo('quick-match');
    } catch (err) {
      console.error('Failed to cancel lobby:', err);
      navigateTo('quick-match');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Creating lobby...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <Card className="bg-[#111827] border-red-500/20 p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigateTo('quick-match')} className="bg-emerald-500 hover:bg-emerald-600">
            Back to Browser
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="play" />

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Quick Match Lobby</h1>
            <p className="text-gray-400">Waiting for an opponent to join...</p>
          </div>

          {lobby && (
            <Card className="bg-[#111827] border-emerald-500/20 p-8 mb-6">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                  <div className="relative w-20 h-20 bg-emerald-500/30 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Waiting for opponent...</h2>
                <p className="text-gray-400 mb-6">Time waiting: {formatTime(lobby.timeWaiting)}</p>

                <Card className="bg-gray-800/50 border-gray-700 p-4 mb-6 inline-block">
                  <p className="text-sm text-gray-400 mb-1">Game Settings</p>
                  <p className="font-bold text-white">
                    {quickPlaySettings.mode || '501'} • Best of {quickPlaySettings.legs || 3} •{' '}
                    {quickPlaySettings.doubleOut === 'on' ? 'Double Out' : 'Straight Out'}
                  </p>
                </Card>

                <div className="flex items-center justify-center gap-8 mb-8">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600">
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                        {lobby.match.player1.username?.[0]?.toUpperCase() || 'Y'}
                      </div>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-bold text-white">{lobby.match.player1.username || 'You'}</p>
                      <p className="text-sm text-gray-400">ELO: 1200</p>
                    </div>
                  </div>

                  <span className="text-3xl text-gray-500 font-bold">VS</span>

                  <div className="flex flex-col items-center gap-3 opacity-50">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-gray-500">?</span>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-400">Waiting...</p>
                      <p className="text-sm text-gray-500">Any player</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={cancelLobby}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Cancel Match
                </Button>
              </div>
            </Card>
          )}

          <div className="text-center">
            <Button
              onClick={() => navigateTo('quick-match')}
              variant="outline"
              className="border-gray-700 text-gray-400 hover:text-white"
            >
              Back to Browser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
