import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quickMatchService } from '@/services/quickMatchService';
import { useAuthStore } from '@/store';
import type { Match, Profile } from '@/types/database';
import { Clock, Users, Trophy, Plus, Filter } from 'lucide-react';

interface LobbyWithPlayer extends Match {
  player1: Profile;
}

export function QuickMatchBrowser() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [lobbies, setLobbies] = useState<LobbyWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lobby' | 'live'>('lobby');

  useEffect(() => {
    loadLobbies();
    
    // Subscribe to new lobbies in real-time
    const subscription = quickMatchService.subscribeToNewLobbies((newMatch) => {
      setLobbies(prev => [newMatch as LobbyWithPlayer, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadLobbies = async () => {
    try {
      setLoading(true);
      const data = await quickMatchService.getAvailableLobbies();
      setLobbies(data as LobbyWithPlayer[]);
    } catch (error) {
      console.error('Failed to load lobbies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLobby = () => {
    navigate('/lobby/create');
  };

  const handleJoinLobby = async (matchId: string) => {
    try {
      await quickMatchService.joinLobby(matchId);
      navigate(`/game/${matchId}`);
    } catch (error: any) {
      alert(error.message || 'Failed to join lobby');
    }
  };

  const formatGameMode = (match: Match) => {
    const legs = match.legs_to_win;
    return `BEST OF ${legs * 2 - 1} LEGS - 501`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
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
            onClick={handleCreateLobby}
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

        {/* Global Lobby Section */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <h2 className="text-xl font-bold">GLOBAL LOBBY</h2>
            </div>
            <Filter className="w-5 h-5 cursor-pointer" />
          </div>
          
          <div className="flex gap-8 mb-4">
            <div>
              <p className="text-4xl font-bold">{lobbies.length}</p>
              <p className="text-sm opacity-80">Games in lobby</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{Math.floor(lobbies.length * 0.7) + 8}</p>
              <p className="text-sm opacity-80">Live games</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-bold">
              Go to lobby
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-orange-500 px-4 py-2 rounded-lg text-sm font-bold transition">
              Live games
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg p-1 mb-6 flex">
          <button 
            onClick={() => setActiveTab('lobby')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'lobby' ? 'bg-white text-gray-900' : 'text-gray-400'}`}
          >
            Lobby
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'live' ? 'bg-white text-gray-900' : 'text-gray-400'}`}
          >
            Live games
          </button>
        </div>

        {/* Lobby Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-gray-700 px-2 py-1 rounded text-sm font-bold">{lobbies.length}</span>
            <span className="text-gray-400 text-sm">Games in lobby</span>
          </div>
          <Filter className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>

        {/* Lobby Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading lobbies...</div>
        ) : lobbies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-4">No open lobbies available</p>
            <button 
              onClick={handleCreateLobby}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"
            >
              Create First Lobby
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Bottom Create Button */}
        <div className="fixed bottom-6 left-0 right-0 px-4">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={handleCreateLobby}
              className="w-full bg-gray-800 hover:bg-gray-700 border-2 border-green-500 text-green-500 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              CREATE GAMEPLAY SETUP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}