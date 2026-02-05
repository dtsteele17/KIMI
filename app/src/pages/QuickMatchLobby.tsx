import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { quickMatchService } from '@/services/quickMatchService';
import type { Match, Profile } from '@/types/database';
import { Clock, User } from 'lucide-react';

export function QuickMatchLobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('id');
  
  const [match, setMatch] = useState<Match & { player1: Profile; player2?: Profile } | null>(null);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      navigate('/quick-match');
      return;
    }

    // Load match data
    loadMatch();

    // Subscribe to changes
    const subscription = quickMatchService.subscribeToLobby(matchId, (updatedMatch) => {
      setMatch(updatedMatch as any);
      
      // If player2 joined and status is in_progress, redirect to game
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

  const loadMatch = async () => {
    try {
      if (!matchId) return;
      const data = await quickMatchService.getMatch(matchId);
      setMatch(data);
      
      // If already has player2, go to game
      if (data.status === 'in_progress' && data.player2_id) {
        navigate(`/game/${matchId}`);
      }
    } catch (error) {
      console.error('Failed to load match:', error);
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
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!match) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Match not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-gray-700">
        <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
          <Clock className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Waiting for opponent...</h1>
        <p className="text-gray-400 mb-6">Time waiting: {formatTime(timeWaiting)}</p>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 mb-2">Game Mode</p>
          <p className="font-bold text-lg">{match.game_mode_id} • Best of {match.legs_to_win * 2 - 1}</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
              {match.player1.display_name?.[0] || 'P'}
            </div>
            <p className="font-bold">{match.player1.display_name || 'You'}</p>
            <p className="text-sm text-gray-400">{match.player1.elo} ELO</p>
          </div>
          
          <div className="text-2xl font-bold text-gray-500">VS</div>
          
          <div className="flex flex-col items-center opacity-50">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
              <User className="w-8 h-8" />
            </div>
            <p className="font-bold">Waiting...</p>
            <p className="text-sm text-gray-400">Any player</p>
          </div>
        </div>

        <button
          onClick={handleCancel}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold w-full transition"
        >
          Cancel Match
        </button>
      </div>
    </div>
  );
}
