import { useEffect, useState } from 'react';
import { quickMatchService } from '@/services/quickMatchService';
import { useNavigationStore, useGameStore } from '@/store';
import type { Match, Profile } from '@/types/database';
import { Clock, Trophy, Plus, Filter } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GameMode, LegsOption, DoubleOut } from '@/types';

interface LobbyWithPlayer extends Match {
  player1: Profile;
}

export function QuickMatchBrowser() {
  const { navigateTo } = useNavigationStore();
  const { setQuickPlaySettings } = useGameStore();
  const [lobbies, setLobbies] = useState<LobbyWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lobby' | 'live'>('lobby');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('501');
  const [bestOf, setBestOf] = useState<LegsOption>(3);
  const [doubleOut, setDoubleOut] = useState<DoubleOut>('on');

  useEffect(() => {
    loadLobbies();

    const subscription = quickMatchService.subscribeToNewLobbies((newMatch) => {
      setLobbies(prev => [newMatch as LobbyWithPlayer, ...prev]);
    });

    const interval = setInterval(loadLobbies, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
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
    setShowSettingsModal(true);
  };

  const handleStartCreateLobby = () => {
    setShowSettingsModal(false);
    setQuickPlaySettings({
      mode: gameMode,
      legs: bestOf,
      doubleOut: doubleOut,
    });
    navigateTo('lobby-create');
  };

  const handleJoinLobby = async (matchId: string) => {
    try {
      await quickMatchService.joinLobby(matchId);
      navigateTo('game');
    } catch (error: any) {
      alert(error.message || 'Failed to join lobby');
    }
  };

  const formatGameMode = (match: Match) => {
    const legs = match.legs_to_win || 3;
    const gameMode = match.game_type || '501';
    return `BEST OF ${legs * 2 - 1} LEGS - ${gameMode}`;
  };

  const formatTimeWaiting = () => {
    return `${Math.floor(Math.random() * 5) + 1}m`;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="play" />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Quick Match</h1>
            <Button
              onClick={() => navigateTo('play')}
              variant="outline"
              className="border-gray-700 text-gray-400 hover:text-white"
            >
              Back
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 border-emerald-500/20 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">CREATE GAMEPLAY SETUP</h2>
                <p className="text-gray-400">Add your game to lobby or challenge friends!</p>
              </div>
              <Button
                onClick={handleCreateLobby}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Lobby
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#111827] border-gray-800 p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Friends Online</p>
              <p className="text-2xl font-bold text-white">0</p>
            </Card>
            <Card className="bg-[#111827] border-gray-800 p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Friends In-Game</p>
              <p className="text-2xl font-bold text-white">0</p>
            </Card>
            <Card className="bg-[#111827] border-gray-800 p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Worldwide Online</p>
              <p className="text-2xl font-bold text-emerald-400">{lobbies.length * 3 + 47}</p>
            </Card>
            <Card className="bg-[#111827] border-gray-800 p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Worldwide In-Game</p>
              <p className="text-2xl font-bold text-blue-400">{Math.floor(lobbies.length * 1.5) + 12}</p>
            </Card>
          </div>

          <Card className="bg-[#111827] border-gray-800 p-1 mb-6 flex">
            <button
              onClick={() => setActiveTab('lobby')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${
                activeTab === 'lobby'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Lobby
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${
                activeTab === 'live'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Live games
            </button>
          </Card>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-gray-800 px-3 py-1 rounded text-sm font-bold text-white">
                {lobbies.length}
              </span>
              <span className="text-gray-400 text-sm">Games in lobby</span>
            </div>
            <Filter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-300" />
          </div>

          {loading && lobbies.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Loading lobbies...</div>
          ) : lobbies.length === 0 ? (
            <Card className="bg-[#111827] border-gray-800 p-12 text-center">
              <p className="text-gray-400 mb-4">No open lobbies available</p>
              <Button
                onClick={handleCreateLobby}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create First Lobby
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24">
              {lobbies.map((lobby) => (
                <Card
                  key={lobby.id}
                  className="bg-[#111827] border-gray-800 hover:border-emerald-500 transition p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">{formatGameMode(lobby)}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      <Trophy className="w-3 h-3" />
                      <span>Casual</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                        {lobby.player1.username?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {lobby.player1.username || 'Player'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="text-yellow-500">★</span>
                          <span>1200</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-emerald-400">{lobby.player1.stats?.wins || 0}W</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleJoinLobby(lobby.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-full font-bold"
                    >
                      Join!
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Waiting {formatTimeWaiting()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="fixed bottom-6 left-0 right-0 px-4">
            <div className="max-w-7xl mx-auto">
              <Button
                onClick={handleCreateLobby}
                className="w-full bg-[#111827] hover:bg-gray-800 border-2 border-emerald-500 text-emerald-400 hover:text-emerald-300 py-6 font-bold flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                CREATE GAMEPLAY SETUP
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Game Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGameMode('301')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    gameMode === '301'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  301
                </button>
                <button
                  onClick={() => setGameMode('501')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    gameMode === '501'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  501
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Best Of</label>
              <select
                value={bestOf}
                onChange={(e) => setBestOf(parseInt(e.target.value) as LegsOption)}
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>Best of 1</option>
                <option value={3}>Best of 3</option>
                <option value={5}>Best of 5</option>
                <option value={7}>Best of 7</option>
                <option value={9}>Best of 9</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Double Out</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDoubleOut('on')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    doubleOut === 'on'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  ON
                </button>
                <button
                  onClick={() => setDoubleOut('off')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    doubleOut === 'off'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  OFF
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSettingsModal(false)}
                variant="outline"
                className="flex-1 border-gray-700 text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartCreateLobby}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create Lobby
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
