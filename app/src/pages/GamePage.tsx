import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameService } from '@/services/gameService';
import { useAuthStore } from '@/store';
import type { Match, Leg, Visit, Profile } from '@/types/database';
import { 
  RotateCcw, Edit2, Check, X, Camera, Mic, 
  ChevronLeft, Trophy 
} from 'lucide-react';

interface MatchWithPlayers extends Match {
  player1: Profile;
  player2: Profile;
}

export function GamePage() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [match, setMatch] = useState<MatchWithPlayers | null>(null);
  const [currentLeg, setCurrentLeg] = useState<Leg | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Current dart input
  const [currentDart, setCurrentDart] = useState(1);
  const [dartScores, setDartScores] = useState([
    {score: 0, multiplier: 1},
    {score: 0, multiplier: 1},
    {score: 0, multiplier: 1}
  ]);
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [timeWaiting, setTimeWaiting] = useState(0);

  // Subscribe to game updates
  useEffect(() => {
    if (!matchId) return;
    
    loadGameData();
    
    const subscription = gameService.subscribeToMatch(matchId, () => {
      loadGameData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

  // Timer for waiting
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadGameData = async () => {
    try {
      if (!matchId) return;
      
      const matchData = await gameService.getMatchWithDetails(matchId);
      setMatch(matchData);
      
      const leg = await gameService.getCurrentLeg(matchId);
      setCurrentLeg(leg);
      
      if (leg) {
        const legVisits = await gameService.getLegVisits(leg.id);
        setVisits(legVisits);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Load game error:', err);
      setError('Failed to load game data');
      setLoading(false);
    }
  };

  const getCurrentPlayerId = () => {
    if (!match) return null;
    const visitCount = visits.filter(v => v.leg_id === currentLeg?.id).length;
    return visitCount % 2 === 0 ? match.player1_id : match.player2_id;
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
    
    const playerVisits = visits.filter(v => 
      v.player_id === playerId && 
      v.leg_id === currentLeg.id && 
      !v.is_bust
    );
    const totalScored = playerVisits.reduce((sum, v) => sum + v.total_scored, 0);
    
    const startingScore = playerId === match?.player1_id 
      ? (currentLeg.player1_starting_score || 501)
      : (currentLeg.player2_starting_score || 501);
    
    return startingScore - totalScored;
  };

  const isMyTurn = () => {
    return getCurrentPlayerId() === user?.id;
  };

  const getTotalScore = () => {
    return dartScores.reduce((sum, dart) => sum + (dart.score * dart.multiplier), 0);
  };

  const getRemainingAfter = () => {
    if (!match || !currentLeg || !user) return 501;
    const currentScore = getPlayerScore(user.id);
    return currentScore - getTotalScore();
  };

  const isBust = () => {
    const remaining = getRemainingAfter();
    return remaining < 0 || remaining === 1;
  };

  const isCheckout = () => {
    const remaining = getRemainingAfter();
    return remaining === 0;
  };

  const getCheckoutSuggestion = (score: number) => {
    const checkouts: Record<number, string> = {
      170: 'T20 T20 DB', 167: 'T20 T19 DB', 164: 'T20 T18 DB', 161: 'T20 T17 DB',
      160: 'T20 T20 D20', 158: 'T20 T20 D19', 157: 'T20 T19 D20', 156: 'T20 T20 D18',
      155: 'T20 T19 D19', 154: 'T20 T18 D20', 153: 'T20 T19 D18', 152: 'T20 T20 D16',
      151: 'T20 T17 D20', 150: 'T20 T18 D18', 149: 'T20 T19 D16', 148: 'T20 T16 D20',
      147: 'T20 T17 D18', 146: 'T20 T18 D16', 145: 'T20 T15 D20', 144: 'T20 T20 D12',
      143: 'T20 T17 D16', 142: 'T20 T14 D20', 141: 'T20 T15 D18', 140: 'T20 T20 D10',
      139: 'T20 T13 D20', 138: 'T20 T18 D12', 137: 'T20 T19 D10', 136: 'T20 T20 D8',
      135: 'T20 T17 D12', 134: 'T20 T14 D16', 133: 'T20 T19 D8', 132: 'T20 T16 D12',
      131: 'T20 T13 D16', 130: 'T20 T20 D5', 129: 'T20 T19 D6', 128: 'T20 T18 D7',
      127: 'T20 T17 D8', 126: 'T20 T16 D9', 125: 'T20 T15 D10', 124: 'T20 T14 D11',
      123: 'T20 T13 D12', 122: 'T20 T12 D13', 121: 'T20 T11 D14', 120: 'T20 20 D20',
      119: 'T20 T13 D10', 118: 'T20 T10 D14', 117: 'T20 T17 D8', 116: 'T20 16 D20',
      115: 'T20 T15 D10', 114: 'T20 T14 D9', 113: 'T20 T15 D8', 112: 'T20 T16 D8',
      111: 'T20 T13 D10', 110: 'T20 T10 D10', 109: 'T20 T11 D8', 108: 'T20 T16 D6',
      107: 'T20 T15 D6', 106: 'T20 T10 D13', 105: 'T20 T15 D5', 104: 'T20 T12 D10',
      103: 'T20 T13 D8', 102: 'T20 T10 D11', 101: 'T20 T9 D12', 100: 'T20 D20',
      99: 'T19 T10 D16', 98: 'T20 T16 D4', 97: 'T19 T18 D8', 96: 'T20 T20 D8',
      95: 'T19 T18 D6', 94: 'T18 T16 D8', 93: 'T19 T14 D8', 92: 'T20 T20 D6',
      91: 'T17 T18 D5', 90: 'T20 T10 D10', 89: 'T19 T12 D8', 88: 'T20 T16 D4',
      87: 'T17 T14 D8', 86: 'T18 T18 D4', 85: 'T15 T18 D8', 84: 'T20 T14 D4',
      83: 'T17 T16 D8', 82: 'T14 T18 D8', 81: 'T19 T16 D4', 80: 'T20 D20',
      79: 'T13 T18 D8', 78: 'T18 T18 D3', 77: 'T19 T14 D8', 76: 'T20 T18 D1',
      75: 'T15 T16 D6', 74: 'T14 T16 D7', 73: 'T19 T16 D2', 72: 'T20 T16 D2',
      71: 'T13 T18 D5', 70: 'T20 D20', 69: 'T19 T16 D2', 68: 'T20 T16 D2',
      67: 'T17 T16 D2', 66: 'T10 T16 D8', 65: 'T19 T12 D5', 64: 'T16 T16 D4',
      63: 'T13 T14 D8', 62: 'T10 T14 D10', 61: 'T15 T14 D4', 60: '20 D20',
      59: '19 D20', 58: '18 D20', 57: '17 D20', 56: '16 D20', 55: '15 D20',
      54: '14 D20', 53: '13 D20', 52: '12 D20', 51: '11 D20', 50: '10 D20',
      49: '9 D20', 48: '8 D20', 47: '7 D20', 46: '6 D20', 45: '5 D20',
      44: '4 D20', 43: '3 D20', 42: '10 D16', 41: '9 D16', 40: 'D20',
      39: '7 D16', 38: 'D19', 37: '5 D16', 36: 'D18', 35: '3 D16',
      34: 'D17', 33: '1 D16', 32: 'D16', 31: '7 D12', 30: 'D15',
      29: '13 D8', 28: 'D14', 27: '11 D8', 26: 'D13', 25: '9 D8',
      24: 'D12', 23: '7 D8', 22: 'D11', 21: '5 D8', 20: 'D10',
      19: '3 D8', 18: 'D9', 17: '1 D8', 16: 'D8', 15: '7 D4',
      14: 'D7', 13: '5 D4', 12: 'D6', 11: '3 D4', 10: 'D5',
      9: '1 D4', 8: 'D4', 7: '3 D2', 6: 'D3', 5: '1 D2',
      4: 'D2', 3: '1 D1', 2: 'D1'
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

      if (checkout) {
        await handleLegWin(user.id);
      }

      setDartScores([{score: 0, multiplier: 1}, {score: 0, multiplier: 1}, {score: 0, multiplier: 1}]);
      setCurrentDart(1);
      await loadGameData();
    } catch (err) {
      alert('Error saving score');
      console.error(err);
    }
  };

  const handleLegWin = async (winnerId: string) => {
    if (!match || !currentLeg) return;
    
    try {
      await gameService.updateLegWinner(currentLeg.id, winnerId);
      
      const isPlayer1 = winnerId === match.player1_id;
      const currentLegsWon = isPlayer1 ? match.player1_legs_won : match.player2_legs_won;
      const newLegsWon = currentLegsWon + 1;
      
      await gameService.updateMatchLegsWon(match.id, isPlayer1 ? 'player1' : 'player2', newLegsWon);
      
      if (newLegsWon >= match.legs_to_win) {
        await gameService.endMatch(match.id, winnerId);
        alert(`${isPlayer1 ? match.player1.display_name : match.player2.display_name} wins the match!`);
        navigate('/dashboard');
      } else {
        // Create new leg
        await gameService.createNewLeg(match.id, match.current_leg + 1, match.game_mode_id);
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
    setDartScores([{score: 0, multiplier: 1}, {score: 0, multiplier: 1}, {score: 0, multiplier: 1}]);
    setCurrentDart(1);
  };

  const editLastVisit = () => {
    const myVisits = visits.filter(v => v.player_id === user?.id);
    if (myVisits.length === 0) return;
    
    const lastVisit = myVisits[myVisits.length - 1];
    setEditingVisit(lastVisit.id);
    
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
        dart3_multiplier: dartScores[2].multiplier,
        total_scored: getTotalScore(),
      });
      
      setEditingVisit(null);
      clearDarts();
      loadGameData();
    } catch (err) {
      alert('Error updating visit');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Loading game...
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-red-500">
      {error}
    </div>
  );
  
  if (!match || !currentLeg) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Game not found
    </div>
  );

  const player1Score = getPlayerScore(match.player1_id);
  const player2Score = getPlayerScore(match.player2_id);
  const myScore = user?.id === match.player1_id ? player1Score : player2Score;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <button onClick={() => navigate('/quick-match')} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="text-center">
          <h1 className="font-bold">{match.game_mode_id} • Best of {match.legs_to_win * 2 - 1} • Double Out</h1>
          <p className="text-sm text-gray-400">Leg {match.current_leg}</p>
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

        {/* Center - Checkout */}
        <div className="lg:w-80 bg-gray-800 p-6 flex flex-col items-center justify-center border-x border-gray-700">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-1">Checkout</p>
            <p className="text-2xl font-bold text-cyan-400">
              {getCheckoutSuggestion(myScore) || '-'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Average</p>
              <p className="text-xl font-bold">
                {(visits.filter(v => v.player_id === user?.id).reduce((sum, v) => sum + v.total_scored, 0) / Math.max(visits.filter(v => v.player_id === user?.id).length, 1) / 3).toFixed(1)}
              </p>
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
          {visits.slice(-10).map((visit) => (
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

      {/* Score Input */}
      {isMyTurn() ? (
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

            {/* Current Darts */}
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
                    ) : '-'}
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
              {['Single', 'Double', 'Triple'].map((mult, idx) => (
                <button
                  key={mult}
                  onClick={() => {
                    const newScores = [...dartScores];
                    newScores[currentDart - 1].multiplier = idx + 1;
                    setDartScores(newScores);
                  }}
                  className={`px-6 py-2 rounded font-bold transition ${
                    dartScores[currentDart - 1].multiplier === idx + 1 ? 'bg-cyan-600' : 'bg-gray-700'
                  }`}
                >
                  {mult}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <button onClick={undoDart} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Undo
              </button>
              <button onClick={clearDarts} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear
              </button>
              
              {!editingVisit && (
                <button onClick={editLastVisit} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-bold flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Last
                </button>
              )}
              
              {editingVisit ? (
                <button onClick={saveEditedVisit} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Save Edit
                </button>
              ) : (
                <button
                  onClick={submitVisit}
                  disabled={dartScores.every(d => d.score === 0)}
                  className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border-t border-gray-700 p-6 text-center">
          <p className="text-gray-400">Waiting for {getCurrentPlayerName()} to throw...</p>
          <p className="text-sm text-gray-500 mt-1">{formatTime(timeWaiting)}</p>
        </div>
      )}
    </div>
  );
}