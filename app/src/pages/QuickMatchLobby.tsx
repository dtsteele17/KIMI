import { useEffect, useState } from 'react';
import { quickMatchService } from '@/services/quickMatchService';
import { useAuthStore, useNavigationStore, useGameStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Zap, Target } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  elo: number;
}

interface Match {
  id: string;
  game_mode_id: string;
  legs_to_win: number;
  status: string;
  player1_id: string;
  player2_id: string | null;
  created_at: string;
}

interface LobbyState {
  match: Match & { player1: Profile };
  isCreator: boolean;
  timeWaiting: number;
}

export function QuickMatchLobby() {
  const { navigateTo } = useNavigationStore();
  const { user } = useAuthStore();
  const { quickPlaySettings } = useGameStore();
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [availableLobbies, setAvailableLobbies] = useState<(Match & { player1: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create lobby on mount and fetch available lobbies
  useEffect(() => {
    createLobby();
    fetchAvailableLobbies();

    const interval = setInterval(fetchAvailableLobbies, 5000);
    return () => clearInterval(interval);
  }, []);

  // Timer for waiting
  useEffect(() => {
    if (!lobby) return;
    
    const interval = setInterval(() => {
      setLobby(prev => prev ? {
        ...prev,
        timeWaiting: prev.timeWaiting + 1
      } : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [lobby]);

  // Subscribe to lobby updates
  useEffect(() => {
    if (!lobby) return;

    const subscription = quickMatchService.subscribeToLobby(
      lobby.match.id,
      (updatedMatch) => {
        // Someone joined! Navigate to game
        if (updatedMatch.status === 'in_progress' && updatedMatch.player2_id) {
          navigateTo('game');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [lobby, navigateTo]);

  const createLobby = async () => {
    try {
      setLoading(true);
      const gameModeId = quickPlaySettings.mode === '301' ? '301' : '501';
      const match = await quickMatchService.createLobby(gameModeId, quickPlaySettings.legs);
      setLobby({
        match: match as any,
        isCreator: true,
        timeWaiting: 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableLobbies = async () => {
    try {
      const lobbies = await quickMatchService.getAvailableLobbies();
      setAvailableLobbies(lobbies as any);
    } catch (err) {
      console.error('Failed to fetch lobbies:', err);
    }
  };

  const cancelLobby = async () => {
    if (!lobby) return;
    try {
      await quickMatchService.cancelLobby(lobby.match.id);
      navigateTo('play');
    } catch (err) {
      console.error('Failed to cancel lobby:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !lobby) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <Navigation currentPage="play" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Creating lobby...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <Navigation currentPage="play" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Card className="bg-[#111827] border-gray-800 p-8 max-w-md">
            <p className="text-red-400 text-center">{error}</p>
            <Button onClick={() => navigateTo('play')} className="w-full mt-4 bg-gray-700 hover:bg-gray-600">
              Back to Play
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const gameMode = lobby?.match?.game_mode_id || '501';
  const bestOf = lobby?.match?.legs_to_win || 3;
  const doubleOut = quickPlaySettings.doubleOut === 'on' ? 'Double Out' : 'Straight Out';

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="play" />

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Quick Match Lobby</h1>
            <p className="text-gray-400">Waiting for an opponent to join...</p>
          </div>

          {/* Main Lobby Card */}
          {lobby && (
            <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-500/20 p-8 mb-8">
              <div className="text-center">
                {/* Searching Animation */}
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                    <Zap className="w-10 h-10 text-emerald-400 relative z-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Waiting for opponent...</h2>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(lobby.timeWaiting)}</span>
                  </div>
                </div>

                {/* Game Settings */}
                <Card className="bg-[#111827] border-gray-800 p-4 mb-6 inline-block">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">{gameMode}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-700"></div>
                    <span className="text-gray-400">Best of {bestOf}</span>
                    <div className="w-px h-4 bg-gray-700"></div>
                    <span className="text-gray-400">{doubleOut}</span>
                  </div>
                </Card>

                {/* Players */}
                <div className="flex items-center justify-center gap-8 mb-6">
                  {/* Player 1 (You) */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3 text-2xl font-bold text-white">
                      {(lobby.match.player1.display_name || lobby.match.player1.username)?.[0]?.toUpperCase() || user?.username[0]?.toUpperCase() || 'Y'}
                    </div>
                    <p className="font-bold text-white text-lg">{lobby.match.player1.display_name || lobby.match.player1.username || user?.username || 'You'}</p>
                    <p className="text-emerald-400 text-sm">ELO: {lobby.match.player1.elo || user?.elo || 1200}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl text-gray-500 font-bold">VS</span>
                  </div>

                  {/* Player 2 (Waiting) */}
                  <div className="flex flex-col items-center opacity-50">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                      <Users className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="font-bold text-white text-lg">Searching...</p>
                    <p className="text-gray-500 text-sm">Any player</p>
                  </div>
                </div>

                {/* Cancel Button */}
                <Button
                  onClick={cancelLobby}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Cancel Match
                </Button>
              </div>
            </Card>
          )}

          {/* Available Lobbies */}
          <Card className="bg-[#111827] border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Available Lobbies</h3>
              <Button
                onClick={fetchAvailableLobbies}
                variant="ghost"
                size="sm"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Refresh
              </Button>
            </div>

            {availableLobbies.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No open lobbies available</p>
                <p className="text-gray-600 text-sm">Create your own or wait for others</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableLobbies.map((availableLobby) => (
                  <Card
                    key={availableLobby.id}
                    className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white">
                          {(availableLobby.player1.display_name || availableLobby.player1.username)?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{availableLobby.player1.display_name || availableLobby.player1.username}</p>
                          <p className="text-sm text-gray-400">
                            ELO: {availableLobby.player1.elo} • {availableLobby.game_mode_id} • Best of {availableLobby.legs_to_win}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleJoinLobby(availableLobby.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Join Match
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  async function handleJoinLobby(matchId: string) {
    try {
      await quickMatchService.joinLobby(matchId);
      navigateTo('game');
    } catch (err: any) {
      setError(err.message || 'Failed to join lobby');
    }
  }
}