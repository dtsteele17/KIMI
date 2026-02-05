import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameService } from '@/services/gameService';
import { useAuthStore } from '@/store';
import type { Match, Leg, Visit, Profile } from '@/types/database';
import { ChevronLeft, Trophy, Wifi } from 'lucide-react';

interface MatchWithPlayers extends Match {
  player1: Profile;
  player2: Profile;
}

export function GamePage() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [match, setMatch] = useState<MatchWithPlayers | null>(null);
  const [currentLeg, setCurrentLeg] = useState<Leg | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraConnected, setCameraConnected] = useState(false);
  
  // Scoring state
  const [activeTab, setActiveTab] = useState<'singles' | 'doubles' | 'trebles' | 'bulls'>('singles');
  const [currentDart, setCurrentDart] = useState(1);
  const [dartScores, setDartScores] = useState([
    {score: 0, multiplier: 1},
    {score: 0, multiplier: 1},
    {score: 0, multiplier: 1}
  ]);
  const [editingVisit, setEditingVisit] = useState<string | null>(null);

  // Subscribe to game updates
  useEffect(() => {
    if (!matchId) return;
    loadGameData();
    
    const subscription = gameService.subscribeToMatch(matchId, () => {
      loadGameData();
    });

    return () => {
      subscription.unsubscribe();
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [matchId]);

  // Initialize camera when it's user's turn
  useEffect(() => {
    if (isMyTurn() && !cameraConnected) {
      initCamera();
    }
  }, [match, visits]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment"
        }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setCameraConnected(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraConnected(false);
    }
  };

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
      setError('Failed to load game');
      setLoading(false);
    }
  };

  const getCurrentPlayerId = () => {
    if (!match) return null;
    const visitCount = visits.filter(v => v.leg_id === currentLeg?.id).length;
    return visitCount % 2 === 0 ? match.player1_id : match.player2_id;
  };

  const isMyTurn = () => {
    return getCurrentPlayerId() === user?.id;
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
      40: 'D20', 36: 'D18', 32: 'D16', 30: 'D15', 24: 'D12', 20: 'D10', 
      16: 'D8', 12: 'D6', 10: 'D5', 8: 'D4', 6: 'D3', 4: 'D2', 2: 'D1'
    };
    return checkouts[score] || '';
  };

  const submitVisit = async () => {
    if (!match || !currentLeg || !user) return;
    
    if (!isMyTurn()) {
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
        alert(`${isPlayer1 ? match.player1.display_name : match.player2.display_name} wins!`);
        navigate('/dashboard');
      } else {
        await gameService.createNewLeg(match.id, match.current_leg + 1, match.game_mode_id);
      }
    } catch (err) {
      console.error('Error:', err);
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

  const getButtonValue = (num: number) => {
    switch (activeTab) {
      case 'doubles':
        return `D${num}`;
      case 'trebles':
        return `T${num}`;
      default:
        return num.toString();
    }
  };

  const handleNumberClick = (num: number) => {
    let multiplier = 1;
    let score = num;
    
    if (activeTab === 'doubles') multiplier = 2;
    if (activeTab === 'trebles') multiplier = 3;
    
    setDartValue(score, multiplier);
  };

  const renderScoringButtons = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    
    if (activeTab === 'bulls') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDartValue(25, 1)}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg font-bold text-lg transition"
          >
            Outer Bull (25)
          </button>
          <button
            onClick={() => setDartValue(50, 1)}
            className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg font-bold text-lg transition"
          >
            Inner Bull (50)
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-5 gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold text-lg transition"
          >
            {getButtonValue(num)}
          </button>
        ))}
        {activeTab === 'singles' && (
          <>
            <button
              onClick={() => setDartValue(25, 1)}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold text-lg transition"
            >
              25
            </button>
            <button
              onClick={() => setDartValue(50, 1)}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold text-lg transition"
            >
              50
            </button>
            <button
              onClick={() => setDartValue(0, 1)}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold text-lg transition col-span-3"
            >
              Miss
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-red-500">{error}</div>;
  if (!match || !currentLeg) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Game not found</div>;

  const player1Score = getPlayerScore(match.player1_id);
  const player2Score = getPlayerScore(match.player2_id);
  const currentPlayerId = getCurrentPlayerId();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <button onClick={() => navigate('/quick-match')} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="text-center">
          <h1 className="font-bold text-xl">BEST OF {match.legs_to_win * 2 - 1}</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-red-600 rounded text-sm">Forfeit</button>
          <div className="flex items-center gap-1 text-green-500">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">QUICK MATCH</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDE - Camera (BIG) */}
        <div className="lg:w-2/3 bg-black relative flex items-center justify-center border-r border-gray-700">
          <div className="absolute top-4 left-4 bg-gray-800 px-3 py-1 rounded text-sm">
            Camera
          </div>
          
          {isMyTurn() ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!cameraConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Camera disconnected</p>
                    <button 
                      onClick={initCamera}
                      className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700"
                    >
                      Connect Camera
                    </button>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4 bg-green-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                LIVE
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">
                  {currentPlayerId === match.player1_id 
                    ? match.player1.display_name?.[0] 
                    : match.player2.display_name?.[0]}
                </span>
              </div>
              <p className="text-xl font-bold mb-2">Waiting for {getCurrentPlayerName()}</p>
              <p className="text-gray-400">Their camera will appear here when they connect</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Scoring/Info */}
        <div className="lg:w-1/3 bg-gray-800 flex flex-col">
          {/* Player Scores */}
          <div className="p-4 border-b border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              {/* Player 1 */}
              <div className={`p-4 rounded-lg ${currentPlayerId === match.player1_id ? 'bg-cyan-900/30 border border-cyan-500' : 'bg-gray-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {match.player1.display_name?.[0]}
                  </div>
                  {currentPlayerId === match.player1_id && (
                    <span className="text-xs bg-green-500 text-black px-2 py-1 rounded font-bold">Your Turn</span>
                  )}
                </div>
                <div className="text-4xl font-bold text-center mb-1">{player1Score}</div>
                <div className="text-center text-sm text-gray-400">Legs: {match.player1_legs_won}</div>
                <div className="text-center text-xs text-cyan-400 mt-1">
                  Avg: {(visits.filter(v => v.player_id === match.player1_id).reduce((sum, v) => sum + v.total_scored, 0) / Math.max(visits.filter(v => v.player_id === match.player1_id).length * 3, 1)).toFixed(1)}
                </div>
              </div>

              {/* Player 2 */}
              <div className={`p-4 rounded-lg ${currentPlayerId === match.player2_id ? 'bg-cyan-900/30 border border-cyan-500' : 'bg-gray-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {match.player2.display_name?.[0]}
                  </div>
                  {currentPlayerId === match.player2_id && (
                    <span className="text-xs bg-green-500 text-black px-2 py-1 rounded font-bold">Your Turn</span>
                  )}
                </div>
                <div className="text-4xl font-bold text-center mb-1">{player2Score}</div>
                <div className="text-center text-sm text-gray-400">Legs: {match.player2_legs_won}</div>
                <div className="text-center text-xs text-cyan-400 mt-1">
                  Avg: {(visits.filter(v => v.player_id === match.player2_id).reduce((sum, v) => sum + v.total_scored, 0) / Math.max(visits.filter(v => v.player_id === match.player2_id).length * 3, 1)).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Content Based on Turn */}
          {isMyTurn() ? (
            <>
              {/* Checkout Suggestion */}
              <div className="p-4 border-b border-gray-700 bg-gray-800">
                <p className="text-sm text-gray-400 mb-1">CHECKOUT</p>
                <p className="text-lg font-bold text-cyan-400">
                  {getCheckoutSuggestion(getPlayerScore(user?.id || '')) || 'No checkout available'}
                </p>
              </div>

              {/* Current Visit Display */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-400">CURRENT VISIT</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-cyan-400">Total: {getTotalScore()}</span>
                    <span className={isBust() ? 'text-red-500' : 'text-green-400'}>
                      Remaining: {getRemainingAfter()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3].map((dartNum) => (
                    <div 
                      key={dartNum}
                      className={`flex-1 p-3 rounded text-center border-2 ${
                        currentDart === dartNum 
                          ? 'border-cyan-500 bg-cyan-900/20' 
                          : 'border-gray-600 bg-gray-700'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">Dart {dartNum}</div>
                      <div className="text-xl font-bold">
                        {dartScores[dartNum - 1].score > 0 ? (
                          <>
                            {dartScores[dartNum - 1].multiplier === 3 ? 'T' : 
                             dartScores[dartNum - 1].multiplier === 2 ? 'D' : ''}
                            {dartScores[dartNum - 1].score}
                          </>
                        ) : '-'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={undoDart} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                    Undo
                  </button>
                  <button onClick={clearDarts} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                    Clear
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                {(['singles', 'doubles', 'trebles', 'bulls'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-bold capitalize transition ${
                      activeTab === tab 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Scoring Buttons */}
              <div className="p-4 flex-1 overflow-y-auto">
                {renderScoringButtons()}
                
                <button
                  onClick={submitVisit}
                  disabled={dartScores.every(d => d.score === 0)}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-lg transition"
                >
                  Submit Visit
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Visit History (when not my turn) */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 mb-3">VISIT HISTORY</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {visits.slice().reverse().map((visit) => (
                    <div key={visit.id} className={`p-3 rounded flex justify-between items-center ${
                      visit.player_id === user?.id ? 'bg-cyan-900/20' : 'bg-gray-700'
                    }`}>
                      <div>
                        <div className="text-sm font-bold">
                          {visit.player_id === match.player1_id ? match.player1.display_name : match.player2.display_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {visit.dart1_score > 0 && `${visit.dart1_multiplier === 3 ? 'T' : visit.dart1_multiplier === 2 ? 'D' : ''}${visit.dart1_score} `}
                          {visit.dart2_score > 0 && `${visit.dart2_multiplier === 3 ? 'T' : visit.dart2_multiplier === 2 ? 'D' : ''}${visit.dart2_score} `}
                          {visit.dart3_score > 0 && `${visit.dart3_multiplier === 3 ? 'T' : visit.dart3_multiplier === 2 ? 'D' : ''}${visit.dart3_score}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-400">{visit.total_scored}</div>
                        {visit.is_checkout && <div className="text-xs text-green-500">CHECKOUT!</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waiting Message */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="animate-pulse text-2xl mb-2">⏳</div>
                  <p className="text-gray-400">Waiting for {getCurrentPlayerName()}...</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}