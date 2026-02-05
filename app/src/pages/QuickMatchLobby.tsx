import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quickMatchService } from '@/services/quickMatchService';
import { useAuthStore } from '@/store';
import type { Match, Profile } from '@/types/database';

interface LobbyState {
  match: Match & { player1: Profile };
  isCreator: boolean;
  timeWaiting: number;
}

export function QuickMatchLobby() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [availableLobbies, setAvailableLobbies] = useState<(Match & { player1: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create lobby on mount
  useEffect(() => {
    createLobby();
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
          navigate(`/game/${updatedMatch.id}`);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [lobby, navigate]);

  const createLobby = async () => {
    try {
      setLoading(true);
      // Default to 501, best of 3
      const match = await quickMatchService.createLobby('501', 3);
      setLobby({
        match,
        isCreator: true,
        timeWaiting: 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelLobby = async () => {
    if (!lobby) return;
    try {
      await quickMatchService.cancelLobby(lobby.match.id);
      navigate('/play');
    } catch (err) {
      console.error('Failed to cancel lobby:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Creating lobby...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Quick Match Lobby</h1>
        
        {lobby && (
          <div className="bg-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <span className="text-3xl">⏳</span>
              </div>
              
              <h2 className="text-xl mb-2">Waiting for opponent...</h2>
              <p className="text-gray-400 mb-4">Time waiting: {formatTime(lobby.timeWaiting)}</p>
              
              <div className="bg-gray-700 rounded p-4 mb-4 inline-block">
                <p className="text-sm text-gray-400">Game Mode</p>
                <p className="font-bold">501 • Best of 3 • Double Out</p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    {lobby.match.player1.display_name?.[0] || 'You'}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{lobby.match.player1.display_name || 'You'}</p>
                    <p className="text-sm text-gray-400">ELO: {lobby.match.player1.elo}</p>
                  </div>
                </div>
                
                <span className="text-2xl text-gray-500">VS</span>
                
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    ?
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Waiting...</p>
                    <p className="text-sm text-gray-400">Any player</p>
                  </div>
                </div>
              </div>

              <button
                onClick={cancelLobby}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition"
              >
                Cancel Match
              </button>
            </div>
          </div>
        )}

        {/* Available Lobbies (browse other open matches) */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Or join an existing lobby:</h3>
          
          {availableLobbies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No open lobbies available</p>
          ) : (
            <div className="space-y-3">
              {availableLobbies.map((lobby) => (
                <div 
                  key={lobby.id} 
                  className="flex items-center justify-between bg-gray-700 p-4 rounded hover:bg-gray-600 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      {lobby.player1.display_name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-bold">{lobby.player1.display_name}</p>
                      <p className="text-sm text-gray-400">ELO: {lobby.player1.elo} • 501 • Best of 3</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleJoinLobby(lobby.id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
                  >
                    Join Match
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  async function handleJoinLobby(matchId: string) {
    try {
      setLoading(true);
      await quickMatchService.joinLobby(matchId);
      navigate(`/game/${matchId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }
}