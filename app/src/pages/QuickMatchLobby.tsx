import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quickMatchService } from '@/services/quickMatchService';
import { useGameStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import type { Match, Profile } from '@/types/database';
import { Clock, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LobbyMatch extends Match {
  player1: Profile;
  player2?: Profile;
}

export function QuickMatchLobby() {
  const navigate = useNavigate();
  const { quickPlaySettings } = useGameStore();
  const [match, setMatch] = useState<LobbyMatch | null>(null);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    createLobby();
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const subscription = quickMatchService.subscribeToLobby(matchId, (updatedMatch) => {
      setMatch(updatedMatch as LobbyMatch);

      if (updatedMatch.status === 'in_progress' && updatedMatch.player2_id) {
        navigate(`/game/${matchId}`);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const createLobby = async () => {
    try {
      const legsToWin = Math.ceil(quickPlaySettings.legs / 2);
      const newMatch = await quickMatchService.createLobby(quickPlaySettings.mode, legsToWin);
      setMatchId(newMatch.id);

      const matchData = await quickMatchService.getMatch(newMatch.id);
      setMatch(matchData as LobbyMatch);

      if (matchData.status === 'in_progress' && matchData.player2_id) {
        navigate(`/game/${matchId}`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create lobby');
      navigate('/quick-match');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!matchId) return;
    try {
      await quickMatchService.cancelLobby(matchId);
      navigate('/quick-match');
    } catch (error) {
      console.error('Failed to cancel:', error);
      navigate('/quick-match');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <Navigation currentPage="play" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-gray-400">Creating lobby...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <Navigation currentPage="play" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-gray-400">Match not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="play" />

      <div className="flex items-center justify-center p-8">
        <Card className="bg-[#111827] border-gray-800 p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Waiting for opponent...</h1>
            <p className="text-gray-400">Time waiting: {formatTime(timeWaiting)}</p>
          </div>

          <Card className="bg-gray-800 border-gray-700 p-4 mb-8">
            <p className="text-sm text-gray-400 mb-2 text-center">Game Mode</p>
            <p className="font-bold text-lg text-white text-center">
              {match.game_mode_id || quickPlaySettings.mode} • Best of {quickPlaySettings.legs}
              {quickPlaySettings.doubleOut === 'on' && ' • Double Out'}
            </p>
          </Card>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2">
                {match.player1?.username?.[0]?.toUpperCase() || 'Y'}
              </div>
              <p className="font-bold text-white">{match.player1?.username || 'You'}</p>
              <p className="text-sm text-gray-400">Ready</p>
            </div>

            <div className="text-2xl font-bold text-gray-500">VS</div>

            <div className="flex flex-col items-center opacity-50">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <p className="font-bold text-gray-400">Waiting...</p>
              <p className="text-sm text-gray-500">Any player</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/quick-match')}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-400 hover:text-white"
            >
              Back to Lobby
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Match
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Your lobby is visible to all players. The first player to join will start the match automatically.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
