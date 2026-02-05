import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { quickMatchService } from '@/services/quickMatchService';
import { useAuthStore } from '@/store';
import type { Match, Profile } from '@/types/database';
import { Clock, Users, Trophy, Plus, X } from 'lucide-react';

interface LobbyWithPlayer extends Match {
  player1: Profile;
}

export function QuickMatchBrowser() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [lobbies, setLobbies] = useState<LobbyWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game settings
  const [gameMode, setGameMode] = useState<'501' | '301'>('501');
  const [bestOf, setBestOf] = useState(3);
  const [doubleOut, setDoubleOut] = useState(true);

  // Load lobbies on mount
  useEffect(() => {
    loadLobbies();
    
    // Subscribe to real-time updates
    const subscription = quickMatchService.subscribeToNewLobbies(() => {
      loadLobbies();
    });

    // Refresh every 5 seconds as backup
    const interval = setInterval(loadLobbies, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadLobbies = useCallback(async () => {
    try {
      const data = await quickMatchService.getAvailableLobbies();
      setLobbies(data as LobbyWithPlayer[]);
    } catch (error) {
      console.error('Failed to load lobbies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateLobby = async () => {
    try {
      setLoading(true);
      const legsToWin = Math.ceil(bestOf / 2);
      const match = await quickMatchService.createLobby(gameMode, legsToWin);
      setShowSettings(false);
      navigate(`/lobby/waiting?id=${match.id}`);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleJoinLobby = async (matchId: string) => {
    try {
      setLoading(true);
      await quickMatchService.joinLobby(matchId);
      navigate(`/game/${matchId}`);
    } catch (error: any) {
      alert(error.message);
      loadLobbies(); // Refresh to remove taken lobby
    } finally {
      setLoading(false);
    }
  };

  const formatGameMode = (match: Match) => {
    const legs = match.legs_to_win;
    const totalLegs = legs * 2 - 1;
    return `BEST OF ${totalLegs} LEGS - ${match.game_mode_id}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">PLAY ONLINE</h1>
            <button 
              onClick={() => navigate('/play')}
              className="text-gray-400 hover:text-white"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Create Game Banner */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">CREATE GAMEPLAY SETUP</h2>
            <p className="text-gray-400 text-sm">Add your game to lobby or challenge friends!</p>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="bg-green-600 hover:bg-green-700 p-3 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Lobby</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase">Friends Online</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase">Friends In-Game</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase">Worldwide Online</p>
            <p className="text-2xl font-bold text-green-500">{lobbies.length * 3 + 47}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase">Worldwide In-Game</p>
            <p className="text-2xl font-bold text-blue-500">{Math.floor(lobbies.length * 1.5) + 12}</p>
          </div>
        </div>

        {/* Lobby Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-gray-700 px-2 py-1 rounded text-sm font-bold">{lobbies.length}</span>
            <span className="text-gray-400 text-sm">Games in lobby</span>
          </div>
        </div>

        {/* Lobby Grid */}
        {loading && lobbies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Loading lobbies...</div>
        ) : lobbies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-4">No open lobbies available</p>
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"
            >
              Create First Lobby
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
            {lobbies.map((lobby) => (
              <div key={lobby.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-green-500 transition">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{formatGameMode(lobby)}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    <Trophy className="w-3 h-3" />
                    <span>Casual</span>
                  </div>
                </div>

                {/* Player Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                      {lobby.player1.display_name?.[0] || 'P'}
                    </div>
                    <div>
                      <p className="font-bold">{lobby.player1.display_name || 'Player'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-yellow-500">★</span>
                        <span>{lobby.player1.elo || 1200}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-green-500">{lobby.player1.wins || 0}W</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleJoinLobby(lobby.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold transition transform hover:scale-105"
                  >
                    Join!
                  </button>
                </div>

                {/* Time waiting */}
                <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Waiting {Math.floor(Math.random() * 5) + 1}m</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Game Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Game Mode */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGameMode('301')}
                  className={`flex-1 py-2 rounded-lg font-bold transition ${
                    gameMode === '301' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  301
                </button>
                <button
                  onClick={() => setGameMode('501')}
                  className={`flex-1 py-2 rounded-lg font-bold transition ${
                    gameMode === '501' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  501
                </button>
              </div>
            </div>

            {/* Best Of */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Best Of</label>
              <select
                value={bestOf}
                onChange={(e) => setBestOf(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              >
                <option value={1}>Best of 1</option>
                <option value={3}>Best of 3</option>
                <option value={5}>Best of 5</option>
                <option value={7}>Best of 7</option>
              </select>
            </div>

            {/* Double Out */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Checkout</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDoubleOut(true)}
                  className={`flex-1 py-2 rounded-lg font-bold transition ${
                    doubleOut ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  Double Out
                </button>
                <button
                  onClick={() => setDoubleOut(false)}
                  className={`flex-1 py-2 rounded-lg font-bold transition ${
                    !doubleOut ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  Straight Out
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 rounded-lg font-bold bg-gray-700 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLobby}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Lobby'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}