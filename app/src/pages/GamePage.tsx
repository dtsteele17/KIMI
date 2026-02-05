import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import { gameService } from '@/services/gameService';
import type { Match, Leg, Visit, Profile } from '@/types/database';
import { 
  RotateCcw, Edit2, Check, X, Camera, Mic, 
  ChevronLeft, Trophy, Target 
} from 'lucide-react';

export function GamePage() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [match, setMatch] = useState<Match & { 
    player1: Profile; 
    player2: Profile 
  } | null>(null);
  const [currentLeg, setCurrentLeg] = useState<Leg | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Current dart input
  const [currentDart, setCurrentDart] = useState(1);
  const [dartScores, setDartScores] = useState<{score: number, multiplier: number}[]>([
    {score: 0, multiplier: 1},
    {score: 0, multiplier: 1},
    {score: 0, multiplier: 1}
  ]);
  const [editingVisit, setEditingVisit] = useState<string | null>(null);

  // Load match data
  useEffect(() => {
    if (!matchId) return;
    loadGameData();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`game:${matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      }, () => loadGameData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'legs',
        filter: `match_id=eq.${matchId}`,
      }, () => loadGameData())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'visits',
        filter: `match_id=eq.${matchId}`,
      }, () => loadGameData())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

  const loadGameData = async () => {
    try {
      if (!matchId) return;
      const data = await gameService.getMatchWithDetails(matchId);
      setMatch(data);
      
      // Get current leg
      const leg = await gameService.getCurrentLeg(matchId);
      setCurrentLeg(leg);
      
      if (leg) {
        const legVisits = await gameService.getLegVisits(leg.id);
        setVisits(legVisits);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getCurrentPlayerId = () => {
    if (!match) return null;
    // Alternate turns based on visit count
    const visitCount = visits.length;
    const isPlayer1Turn = visitCount % 2 === 0;
    return isPlayer1Turn ? match.player1_id : match.player2_id;
  };

  const getCurrentPlayerName = () => {
    if (!match) return '';
    const currentId = getCurrentPlayerId();
    return currentId === match.player1_id 
      ? match.player1.display_name 
      : match.player2.display_name;
  };

  const getPlayerScore = (playerId: string) => {
    if (!currentLeg) return 501;
    
    // Calculate from visits
    const playerVisits = visits.filter(v => v.player_id === playerId && !v.is_bust);
    const totalScored = playerVisits.reduce((sum, v) => sum + v.total_scored, 0);
    
    const startingScore = playerId === match?.player1_id 
      ? currentLeg.player1_starting_score 
      : currentLeg.player2_starting_score;
    
    return (startingScore || 501) - totalScored;
  };

  const isMyTurn = () => {
    return getCurrentPlayerId() === user?.id;
  };

  const calculateDartValue = (index: number) => {
    return dartScores[index].score * dartScores[index].multiplier;
  };

  const getTotalScore = () => {
    return dartScores.reduce((sum, dart, idx) => sum + calculateDartValue(idx), 0);
  };

  const getRemainingAfter = () => {
    if (!match || !currentLeg) return 501;
    const currentId = getCurrentPlayerId();
    const currentScore = getPlayerScore(currentId || '');
    return currentScore - getTotalScore();
  };

  const isBust = () => {
    const remaining = getRemainingAfter();
    return remaining < 0 || remaining === 1;
  };

  const isCheckout = () => {
    const remaining = getRemainingAfter();
    return remaining === 0 && dartScores.some(d => d.score > 0);
  };

  const getCheckoutSuggestion = (score: number) => {
    // Simple checkout suggestions
    const checkouts: Record<number, string> = {
      170: 'T20 T20 DB',
      167: 'T20 T19 DB',
      164: 'T20 T18 DB',
      161: 'T20 T17 DB',
      160: 'T20 T20 D20',
      136: 'T20 T20 D8',
      120: 'T20 20 D20',
      100: 'T20 D20',
      80: 'T20 D20',
      60: '20 D20',
      40: 'D20',
      32: 'D16',
      24: 'D12',
      16: 'D8',
      8: 'D4',
      4: 'D2',
      2: 'D1',
    };
    return checkouts[score] || '';
  };

  const submitVisit = async () => {
    if (!match || !currentLeg || !user) return;
    
    const currentId = getCurrentPlayerId();
    if (currentId !== user.id) {
      alert("Not your turn!");
      return;
    }

    const remainingBefore = getPlayerScore(user.id);
    const totalScored = getTotalScore();
    const remainingAfter = remainingBefore - totalScored;
    const bust = isBust();
    const checkout = isCheckout();

    try {
      // Save visit
      await gameService.recordVisit({
        leg_id: currentLeg.id,
        match_id: match.id,
        player_id: user.id,
        visit_number: visits.filter(v => v.leg_id === currentLeg.id).length + 1,
        dart1_score: dartScores[0].score || null,
        dart1_multiplier: dartScores[0].multiplier,
        dart2_score: dartScores[1].score || null,
        dart2_multiplier: dartScores[1].multiplier,
        dart3_score: dartScores[2].score || null,
        dart3_multiplier: dartScores[2].multiplier,
        total_scored: bust ? 0 : totalScored,
        remaining_before: remainingBefore,
        remaining_after: bust ? remainingBefore : remainingAfter,
        is_bust: bust,
        is_checkout: checkout,
      });

      // If checkout, handle leg win
      if (checkout) {
        await handleLegWin(user.id);
      }

      // Reset dart input
      setDartScores([
        {score: 0, multiplier: 1},
        {score: 0, multiplier: 1},
        {score: 0, multiplier: 1}
      ]);
      setCurrentDart(1);

      // Refresh data
      await loadGameData();
    } catch (err: any) {
      alert('Error saving score: ' + err.message);
    }
  };

  const handleLegWin = async (winnerId: string) => {
    if (!match || !currentLeg) return;
    
    try {
      // Update leg winner
      await gameService.updateLegWinner(currentLeg.id, winnerId);
      
      // Check if match is won
      const isPlayer1 = winnerId === match.player1_id;
      const newLegsWon = isPlayer1 
        ? match.player1_legs_won + 1 
        : match.player2_legs_won + 1;
      
      if (newLegsWon >= match.legs_to_win) {
        // Match won
        await gameService.endMatch(match.id, winnerId);
        alert(`${isPlayer1 ? match.player1.display_name : match.player2.display_name} wins the match!`);
        navigate('/dashboard');
      } else {
        // Create new leg
        await gameService.createLeg(match.id, match.current_leg + 1);
      }
    } catch (err) {
      console.error('Error handling leg win:', err);
    }
  };

  const setDartValue = (score: number, multiplier: number) => {
    const newScores = [...dartScores];
    newScores[currentDart - 1] = { score, multiplier };
    setDartScores(newScores);
    
    if (currentDart < 3) {
      setCurrentDart(currentDart + 1);
    }
  };

  const undoDart = () => {
    if (currentDart > 1) {
      const newScores = [...dartScores];
      newScores[currentDart - 2] = { score: 0, multiplier: 1 };
      setDartScores(newScores);
      setCurrentDart(currentDart - 1);
    }
  };

  const clearDarts = () => {
    setDartScores([
      {score: 0, multiplier: 1},
      {score: 0, multiplier: 1},
      {score: 0, multiplier: 1}
    ]);
    setCurrentDart(1);
  };

  const editLastVisit = async () => {
    const myVisits = visits.filter(v => v.player_id === user?.id);
    if (myVisits.length === 0) return;
    
    const lastVisit = myVisits[myVisits.length - 1];
    setEditingVisit(lastVisit.id);
    
    // Load values into input
    setDartScores([
      { score: lastVisit.dart1_score || 0, multiplier: lastVisit.dart1_multiplier },
      { score: lastVisit.dart2_score || 0, multiplier: lastVisit.dart2_multiplier },
      { score: lastVisit.dart3_score || 0, multiplier: lastVisit.dart3_multiplier },
    ]);
  };

  const saveEditedVisit = async () => {
    if (!editingVisit) return;
    
    try {
      await gameService.updateVisit(editingVisit, {
        dart1_score: dartScores[0].score || null,
        dart1_multiplier: dartScores[0].multiplier,
        dart2_score: dartScores[1].score || null,
        dart2_multiplier: dartScores[1].multiplier,
        dart3_score: dartScores[2].score || null,
        dart2_multiplier: dartScores[2].multiplier,
        total_scored: getTotalScore(),
      });
      
      setEditingVisit(null);
      clearDarts();
      loadGameData();
    } catch (err: any) {
      alert('Error updating visit: ' + err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading game...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-red-500">{error}</div>;
  if (!match || !currentLeg) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Game not found</div>;

  const player1Score = getPlayerScore(match.player1_id);
  const player2Score = getPlayerScore(match.player2_id);
  const currentScore = user?.id === match.player1_id ? player1Score : player2Score;
  const opponentScore = user?.id === match.player1_id ? player2Score : player1Score;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <button onClick={() => navigate('/quick-match')} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="text-center">
          <h1 className="font-bold">501 • Best of {match.legs_to_win * 2 - 1} • Double Out</h1>
          <p className="text-sm text-gray-400">Leg {match.current_leg} of {match.legs_to_win * 2 - 1}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
            <Camera className="w-5 h-5" />
          </button>
          <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Player 1 */}
        <div className={`flex-1 p-6 flex flex-col items-center justify-center ${getCurrentPlayerId() === match.player1_id ? 'bg-cyan-900/20' : ''}`}>
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
            {match.player1.display_name?.[0] || 'P'}
          </div>
          <h2 className="text-xl font-bold mb-2">{match.player1.display_name}</h2>
          <div className="text-6xl font-bold text-cyan-400 mb-2">{player1Score}</div>
          <div className="text-sm text-gray-400">Legs: {match.player1_legs_won}</div>
          {getCurrentPlayerId() === match.player1_id && (
            <div className="mt-4 px-4 py-2 bg-cyan-600 rounded-full text-sm font-bold animate-pulse">
              THROWING
            </div>
          )}
        </div>

        {/* Center - Stats & Checkout */}
        <div className="lg:w-80 bg-gray-800 p-6 flex flex-col items-center justify-center border-x border-gray-700">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-1">Checkout</p>
            <p className="text-2xl font-bold text-cyan-400">
              {getCheckoutSuggestion(currentScore) || '-'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Average</p>
              <p className="text-xl font-bold">{(visits.filter(v => v.player_id === user?.id).reduce((sum, v) => sum + v.total_scored, 0) / Math.max(visits.filter(v => v.player_id === user?.id).length, 1) / 3).toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">Darts</p>
              <p className="text-xl font-bold">{visits.filter(v => v.player_id === user?.id).length * 3}</p>
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className={`flex-1 p-6 flex flex-col items-center justify-center ${getCurrentPlayerId() === match.player2_id ? 'bg-cyan-900/20' : ''}`}>
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
            {match.player2.display_name?.[0] || 'P'}
          </div>
          <h2 className="text-xl font-bold mb-2">{match.player2.display_name}</h2>
          <div className="text-6xl font-bold text-cyan-400 mb-2">{player2Score}</div>
          <div className="text-sm text-gray-400">Legs: {match.player2_legs_won}</div>
          {getCurrentPlayerId() === match.player2_id && (
            <div className="mt-4 px-4 py-2 bg-cyan-600 rounded-full text-sm font-bold animate-pulse">
              THROWING
            </div>
          )}
        </div>
      </div>

      {/* Visit History */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <h3 className="text-sm font-bold text-gray-400 mb-2">VISIT HISTORY</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {visits.slice(-10).map((visit, idx) => (
            <div key={visit.id} className={`flex-shrink-0 p-3 rounded ${visit.player_id === user?.id ? 'bg-cyan-900/30' : 'bg-gray-700'}`}>
              <div className="text-xs text-gray-400 mb-1">
                {visit.player_id === match.player1_id ? match.player1.display_name : match.player2.display_name}
              </div>
              <div className="font-bold text-lg">
                {visit.dart1_score > 0 && (
                  <span className={visit.dart1_multiplier === 3 ? 'text-red-400' : visit.dart1_multiplier === 2 ? 'text-green-400' : ''}>
                    {visit.dart1_multiplier === 3 ? 'T' : visit.dart1_multiplier === 2 ? 'D' : ''}{visit.dart1_score}
                  </span>
                )}
                {' '}
                {visit.dart2_score > 0 && (
                  <span className={visit.dart2_multiplier === 3 ? 'text-red-400' : visit.dart2_multiplier === 2 ? 'text-green-400' : ''}>
                    {visit.dart2_multiplier === 3 ? 'T' : visit.dart2_multiplier === 2 ? 'D' : ''}{visit.dart2_score}
                  </span>
                )}
                {' '}
                {visit.dart3_score > 0 && (
                  <span className={visit.dart3_multiplier === 3 ? 'text-red-400' : visit.dart3_multiplier === 2 ? 'text-green-400' : ''}>
                    {visit.dart3_multiplier === 3 ? 'T' : visit.dart3_multiplier === 2 ? 'D' : ''}{visit.dart3_score}
                  </span>
                )}
              </div>
              <div className="text-xs text-cyan-400 mt-1">{visit.total_scored} pts</div>
              {visit.is_checkout && <div className="text-xs text-green-500 font-bold">CHECKOUT!</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Score Input (only show if it's my turn) */}
      {isMyTurn() && (
        <div className="bg-gray-800 border-t border-gray-700 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingVisit ? 'EDIT VISIT' : 'ENTER SCORE'}
              </h3>
              <div className="flex gap-2">
                <span className="text-gray-400">Dart {currentDart} of 3</span>
                <span className="text-cyan-400 font-bold">Total: {getTotalScore()}</span>
                <span className={isBust() ? 'text-red-500 font-bold' : 'text-green-400 font-bold'}>
                  Remaining: {getRemainingAfter()}
                </span>
              </div>
            </div>

            {/* Current Darts Display */}
            <div className="flex gap-4 mb-6 justify-center">
              {[1, 2, 3].map((dartNum) => (
                <div 
                  key={dartNum}
                  className={`w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center ${
                    currentDart === dartNum 
                      ? 'border-cyan-500 bg-cyan-900/20' 
                      : 'border-gray-600 bg-gray-700'
                  }`}
                >
                  <span className="text-xs text-gray-400">Dart {dartNum}</span>
                  <span className="text-2xl font-bold">
                    {dartScores[dartNum - 1].score > 0 ? (
                      <>
                        {dartScores[dartNum - 1].multiplier === 3 ? 'T' : 
                         dartScores[dartNum - 1].multiplier === 2 ? 'D' : ''}
                        {dartScores[dartNum - 1].score}
                      </>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[20, 19, 18, 17, 16, 15, 14].map((num) => (
                <button
                  key={num}
                  onClick={() => setDartValue(num, 1)}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded font-bold transition"
                >
                  {num}
                </button>
              ))}
              {[13, 12, 11, 10, 9, 8, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => setDartValue(num, 1)}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded font-bold transition"
                >
                  {num}
                </button>
              ))}
              {[6, 5, 4, 3, 2, 1].map((num) => (
                <button
                  key={num}
                  onClick={() => setDartValue(num, 1)}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded font-bold transition"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setDartValue(25, 1)}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded font-bold transition"
              >
                25
              </button>
              <button
                onClick={() => setDartValue(50, 1)}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded font-bold transition"
              >
                50
              </button>
              <button
                onClick={() => setDartValue(0, 1)}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded font-bold transition"
              >
                Miss
              </button>
            </div>

            {/* Multipliers */}
            <div className="flex gap-2 mb-4 justify-center">
              <button
                onClick={() => {
                  const newScores = [...dartScores];
                  newScores[currentDart - 1].multiplier = 1;
                  setDartScores(newScores);
                }}
                className={`px-6 py-2 rounded font-bold ${dartScores[currentDart - 1].multiplier === 1 ? 'bg-cyan-600' : 'bg-gray-700'}`}
              >
                Single
              </button>
              <button
                onClick={() => {
                  const newScores = [...dartScores];
                  newScores[currentDart - 1].multiplier = 2;
                  setDartScores(newScores);
                }}
                className={`px-6 py-2 rounded font-bold ${dartScores[currentDart - 1].multiplier === 2 ? 'bg-cyan-600' : 'bg-gray-700'}`}
              >
                Double
              </button>
              <button
                onClick={() => {
                  const newScores = [...dartScores];
                  newScores[currentDart - 1].multiplier = 3;
                  setDartScores(newScores);
                }}
                className={`px-6 py-2 rounded font-bold ${dartScores[currentDart - 1].multiplier === 3 ? 'bg-cyan-600' : 'bg-gray-700'}`}
              >
                Triple
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={undoDart}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Undo
              </button>
              <button
                onClick={clearDarts}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
              
              {!editingVisit && (
                <button
                  onClick={editLastVisit}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-bold flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Last
                </button>
              )}
              
              {editingVisit ? (
                <button
                  onClick={saveEditedVisit}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Edit
                </button>
              ) : (
                <button
                  onClick={submitVisit}
                  disabled={dartScores.every(d => d.score === 0)}
                  className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Waiting for opponent message */}
      {!isMyTurn() && (
        <div className="bg-gray-800 border-t border-gray-700 p-6 text-center">
          <p className="text-gray-400">Waiting for {getCurrentPlayerName()} to throw...</p>
        </div>
      )}
    </div>
  );
}