import { useEffect, useState } from 'react';
import { useNavigationStore, useAuthStore } from '@/store';
import { gameService, checkoutSuggestions, type MatchWithPlayers, type Leg, type Visit } from '@/services/gameService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Target, Trophy, RotateCcw, Users, Clock } from 'lucide-react';

export function GamePage() {
  const { navigateTo, routeParams } = useNavigationStore();
  const { user } = useAuthStore();
  const matchId = routeParams.matchId;

  const [match, setMatch] = useState<MatchWithPlayers | null>(null);
  const [currentLeg, setCurrentLeg] = useState<Leg | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const [dart1, setDart1] = useState<{ score: number | null; multiplier: number }>({ score: null, multiplier: 1 });
  const [dart2, setDart2] = useState<{ score: number | null; multiplier: number }>({ score: null, multiplier: 1 });
  const [dart3, setDart3] = useState<{ score: number | null; multiplier: number }>({ score: null, multiplier: 1 });
  const [activeMultiplier, setActiveMultiplier] = useState<1 | 2 | 3>(1);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showConfirmForfeit, setShowConfirmForfeit] = useState(false);

  const isMyTurn = match?.current_player_id === user?.id;
  const isPlayer1 = match?.player1_id === user?.id;
  const myRemaining = isPlayer1 ? currentLeg?.player1_remaining : currentLeg?.player2_remaining;
  const opponentRemaining = isPlayer1 ? currentLeg?.player2_remaining : currentLeg?.player1_remaining;
  const myDartsThrown = isPlayer1 ? currentLeg?.player1_darts_thrown : currentLeg?.player2_darts_thrown;
  const opponentDartsThrown = isPlayer1 ? currentLeg?.player2_darts_thrown : currentLeg?.player1_darts_thrown;
  const myTotalScored = isPlayer1 ? currentLeg?.player1_total_scored : currentLeg?.player2_total_scored;
  const opponentTotalScored = isPlayer1 ? currentLeg?.player2_total_scored : currentLeg?.player1_total_scored;

  const myAverage = myDartsThrown && myDartsThrown > 0 ? ((myTotalScored || 0) / (myDartsThrown / 3)).toFixed(1) : '0.0';
  const opponentAverage = opponentDartsThrown && opponentDartsThrown > 0 ? ((opponentTotalScored || 0) / (opponentDartsThrown / 3)).toFixed(1) : '0.0';

  const myVisits = visits.filter(v => v.player_id === user?.id);
  const currentVisitTotal = (dart1.score || 0) * dart1.multiplier + (dart2.score || 0) * dart2.multiplier + (dart3.score || 0) * dart3.multiplier;
  const checkoutSuggestion = myRemaining ? checkoutSuggestions[myRemaining] : null;

  const startingScore = parseInt(match?.game_mode_id || '501');
  const legsToWin = match?.legs_to_win || 3;

  useEffect(() => {
    if (!matchId) {
      navigateTo('play');
      return;
    }
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      const matchData = await gameService.getMatch(matchId);
      setMatch(matchData);

      let leg = await gameService.getCurrentLeg(matchId);

      if (!leg) {
        leg = await gameService.createLeg(matchId, 1, parseInt(matchData.game_mode_id));
      }

      setCurrentLeg(leg);
      const legVisits = await gameService.getVisitsForLeg(leg.id);
      setVisits(legVisits);
    } catch (error) {
      console.error('Failed to load match:', error);
      alert('Failed to load match');
      navigateTo('play');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!matchId || !currentLeg) return;

    const matchSub = gameService.subscribeToMatch(matchId, () => {
      loadMatchData();
    });

    const legSub = gameService.subscribeToLeg(currentLeg.id, () => {
      loadMatchData();
    });

    const visitsSub = gameService.subscribeToVisits(currentLeg.id, (payload) => {
      setVisits(prev => [...prev, payload.new as Visit]);
    });

    return () => {
      matchSub.unsubscribe();
      legSub.unsubscribe();
      visitsSub.unsubscribe();
    };
  }, [matchId, currentLeg?.id]);

  const handleNumberClick = (num: number) => {
    if (!isMyTurn || !currentLeg || !user) return;

    if (!dart1.score) {
      setDart1({ score: num, multiplier: activeMultiplier });
    } else if (!dart2.score) {
      setDart2({ score: num, multiplier: activeMultiplier });
    } else if (!dart3.score) {
      setDart3({ score: num, multiplier: activeMultiplier });
    }
  };

  const handleSubmitVisit = async () => {
    if (!isMyTurn || !currentLeg || !user || !match) return;

    const totalScored = currentVisitTotal;
    const remainingBefore = myRemaining || startingScore;
    let remainingAfter = remainingBefore - totalScored;
    let isBust = false;
    let isCheckout = false;

    if (remainingAfter < 0 || remainingAfter === 1) {
      isBust = true;
      remainingAfter = remainingBefore;
    } else if (remainingAfter === 0) {
      const lastDart = dart3.score ? dart3 : dart2.score ? dart2 : dart1;
      if (lastDart.multiplier === 2) {
        isCheckout = true;

        const dartsUsed = (dart1.score ? 1 : 0) + (dart2.score ? 1 : 0) + (dart3.score ? 1 : 0);
        const route = [
          dart1.score ? `${dart1.multiplier === 1 ? '' : dart1.multiplier === 2 ? 'D' : 'T'}${dart1.score}` : '',
          dart2.score ? `${dart2.multiplier === 1 ? '' : dart2.multiplier === 2 ? 'D' : 'T'}${dart2.score}` : '',
          dart3.score ? `${dart3.multiplier === 1 ? '' : dart3.multiplier === 2 ? 'D' : 'T'}${dart3.score}` : '',
        ].filter(Boolean).join(' ');

        await gameService.recordCheckout(user.id, match.id, currentLeg.id, remainingBefore, dartsUsed, route);
      } else {
        isBust = true;
        remainingAfter = remainingBefore;
      }
    }

    try {
      const dartsThrown = (dart1.score ? 1 : 0) + (dart2.score ? 1 : 0) + (dart3.score ? 1 : 0);
      const visitNumber = visits.filter(v => v.player_id === user.id).length + 1;

      await gameService.submitVisit(
        currentLeg.id,
        match.id,
        user.id,
        visitNumber,
        dart1,
        dart2,
        dart3,
        isBust ? 0 : totalScored,
        remainingBefore,
        remainingAfter,
        isBust,
        isCheckout
      );

      const newDartsThrown = (myDartsThrown || 0) + dartsThrown;
      const newTotalScored = (myTotalScored || 0) + (isBust ? 0 : totalScored);

      await gameService.updateLegScores(currentLeg.id, user.id, remainingAfter, newDartsThrown, newTotalScored);

      if (isCheckout) {
        await gameService.completeLeg(currentLeg.id, user.id);

        const newMyLegs = (isPlayer1 ? match.player1_legs_won : match.player2_legs_won) + 1;

        if (newMyLegs >= legsToWin) {
          await gameService.completeMatch(match.id, user.id);
          setShowResultDialog(true);
        } else {
          const newLeg = await gameService.createLeg(match.id, currentLeg.leg_number + 1, startingScore);
          setCurrentLeg(newLeg);
          setVisits([]);
        }
      } else {
        const nextPlayerId = isPlayer1 ? match.player2_id : match.player1_id;
        await gameService.switchTurn(match.id, nextPlayerId);
      }

      setDart1({ score: null, multiplier: 1 });
      setDart2({ score: null, multiplier: 1 });
      setDart3({ score: null, multiplier: 1 });
      setActiveMultiplier(1);
    } catch (error) {
      console.error('Failed to submit visit:', error);
      alert('Failed to submit visit');
    }
  };

  const handleClear = () => {
    setDart1({ score: null, multiplier: 1 });
    setDart2({ score: null, multiplier: 1 });
    setDart3({ score: null, multiplier: 1 });
  };

  const handleUndo = () => {
    if (dart3.score) {
      setDart3({ score: null, multiplier: 1 });
    } else if (dart2.score) {
      setDart2({ score: null, multiplier: 1 });
    } else if (dart1.score) {
      setDart1({ score: null, multiplier: 1 });
    }
  };

  const handleForfeit = async () => {
    if (!match || !user) return;

    try {
      const winnerId = isPlayer1 ? match.player2_id : match.player1_id;
      await gameService.completeMatch(match.id, winnerId);
      navigateTo('play');
    } catch (error) {
      console.error('Failed to forfeit:', error);
      alert('Failed to forfeit match');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match || !currentLeg) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Match not found</p>
          <Button onClick={() => navigateTo('play')} className="bg-cyan-500 hover:bg-cyan-600">
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowConfirmForfeit(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Forfeit
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold">
                Best of {legsToWin * 2 - 1} Legs - {match.game_mode_id}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-cyan-400" />
                  {match.player1.username} {match.player1_legs_won}
                </span>
                <span>-</span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-blue-400" />
                  {match.player2_legs_won} {match.player2.username}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>Leg {currentLeg.leg_number}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Scores */}
          <div className="space-y-4">
            {/* Player Scores */}
            <div className="grid grid-cols-2 gap-4">
              {/* My Score */}
              <Card className={`p-6 ${isMyTurn ? 'bg-cyan-900/30 border-2 border-cyan-500' : 'bg-gray-800 border-gray-700'}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold">
                      {(isPlayer1 ? match.player1.username : match.player2.username)?.[0] || 'Y'}
                    </div>
                    <span className="font-bold">{isPlayer1 ? match.player1.username : match.player2.username}</span>
                  </div>
                  {isMyTurn && (
                    <div className="mb-2 text-xs text-cyan-400 font-bold">YOUR TURN</div>
                  )}
                  <div className="text-6xl font-bold text-white mb-2">{myRemaining || startingScore}</div>
                  <div className="text-sm text-gray-400">Remaining</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Avg</p>
                      <p className="text-cyan-400 font-bold">{myAverage}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Darts</p>
                      <p className="text-white font-bold">{myDartsThrown || 0}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Opponent Score */}
              <Card className={`p-6 ${!isMyTurn ? 'bg-blue-900/30 border-2 border-blue-500' : 'bg-gray-800 border-gray-700'}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                      {(isPlayer1 ? match.player2.username : match.player1.username)?.[0] || 'O'}
                    </div>
                    <span className="font-bold">{isPlayer1 ? match.player2.username : match.player1.username}</span>
                  </div>
                  {!isMyTurn && (
                    <div className="mb-2 text-xs text-blue-400 font-bold">THEIR TURN</div>
                  )}
                  <div className="text-6xl font-bold text-white mb-2">{opponentRemaining || startingScore}</div>
                  <div className="text-sm text-gray-400">Remaining</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Avg</p>
                      <p className="text-blue-400 font-bold">{opponentAverage}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Darts</p>
                      <p className="text-white font-bold">{opponentDartsThrown || 0}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Checkout Suggestion */}
            {checkoutSuggestion && isMyTurn && (
              <Card className="bg-cyan-500/10 border-cyan-500/30 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-bold">CHECKOUT</span>
                </div>
                <p className="text-white text-lg font-bold">{checkoutSuggestion}</p>
              </Card>
            )}

            {/* Current Visit */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">CURRENT VISIT</span>
                <span className="text-cyan-400 font-bold text-lg">{currentVisitTotal}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <span className="text-2xl font-bold">
                    {dart1.score ? `${dart1.multiplier === 2 ? 'D' : dart1.multiplier === 3 ? 'T' : ''}${dart1.score}` : '-'}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <span className="text-2xl font-bold">
                    {dart2.score ? `${dart2.multiplier === 2 ? 'D' : dart2.multiplier === 3 ? 'T' : ''}${dart2.score}` : '-'}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <span className="text-2xl font-bold">
                    {dart3.score ? `${dart3.multiplier === 2 ? 'D' : dart3.multiplier === 3 ? 'T' : ''}${dart3.score}` : '-'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={!isMyTurn}
                  className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Undo
                </button>
                <button
                  onClick={handleClear}
                  disabled={!isMyTurn}
                  className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmitVisit}
                  disabled={!isMyTurn || !dart1.score}
                  className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition disabled:opacity-50 font-bold"
                >
                  Submit
                </button>
              </div>
            </Card>

            {/* Visit History */}
            <Card className="bg-gray-800 border-gray-700 p-4 max-h-60 overflow-y-auto">
              <h3 className="text-sm text-gray-400 mb-3 font-bold">VISIT HISTORY</h3>
              {myVisits.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No visits yet</p>
              ) : (
                <div className="space-y-2">
                  {myVisits.map((visit, idx) => (
                    <div key={visit.id} className="flex items-center justify-between bg-gray-900 rounded p-2">
                      <span className="text-gray-400 text-sm">Visit {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">
                          {visit.dart1_score ? `${visit.dart1_multiplier === 2 ? 'D' : visit.dart1_multiplier === 3 ? 'T' : ''}${visit.dart1_score}` : '-'}
                          {visit.dart2_score ? ` ${visit.dart2_multiplier === 2 ? 'D' : visit.dart2_multiplier === 3 ? 'T' : ''}${visit.dart2_score}` : ''}
                          {visit.dart3_score ? ` ${visit.dart3_multiplier === 2 ? 'D' : visit.dart3_multiplier === 3 ? 'T' : ''}${visit.dart3_score}` : ''}
                        </span>
                        <span className={`font-bold ${visit.is_bust ? 'text-red-400' : visit.is_checkout ? 'text-green-400' : 'text-cyan-400'}`}>
                          {visit.is_bust ? 'BUST' : visit.is_checkout ? 'CHECKOUT!' : visit.total_scored}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Input */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4">SCORE INPUT</h3>

              {/* Multipliers */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setActiveMultiplier(1)}
                  disabled={!isMyTurn}
                  className={`py-3 rounded-lg font-bold transition ${
                    activeMultiplier === 1 ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'
                  } disabled:opacity-50`}
                >
                  Single
                </button>
                <button
                  onClick={() => setActiveMultiplier(2)}
                  disabled={!isMyTurn}
                  className={`py-3 rounded-lg font-bold transition ${
                    activeMultiplier === 2 ? 'bg-green-600 text-white' : 'bg-gray-900 text-gray-400'
                  } disabled:opacity-50`}
                >
                  Double
                </button>
                <button
                  onClick={() => setActiveMultiplier(3)}
                  disabled={!isMyTurn}
                  className={`py-3 rounded-lg font-bold transition ${
                    activeMultiplier === 3 ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400'
                  } disabled:opacity-50`}
                >
                  Treble
                </button>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-5 gap-2">
                {[...Array(20)].map((_, i) => {
                  const num = i + 1;
                  return (
                    <button
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      disabled={!isMyTurn || !!dart3.score}
                      className="aspect-square bg-gray-900 hover:bg-gray-700 rounded-lg font-bold text-lg transition disabled:opacity-30"
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  onClick={() => handleNumberClick(25)}
                  disabled={!isMyTurn || !!dart3.score}
                  className="py-3 bg-gray-900 hover:bg-gray-700 rounded-lg font-bold transition disabled:opacity-30"
                >
                  25
                </button>
                <button
                  onClick={() => handleNumberClick(0)}
                  disabled={!isMyTurn || !!dart3.score}
                  className="py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold transition disabled:opacity-30"
                >
                  Miss
                </button>
                <button
                  onClick={() => handleNumberClick(25)}
                  disabled={!isMyTurn || !!dart3.score || activeMultiplier !== 2}
                  className="py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg font-bold transition disabled:opacity-30"
                >
                  Bull
                </button>
              </div>
            </Card>

            {!isMyTurn && (
              <Card className="bg-blue-500/10 border-blue-500/30 p-4 text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-pulse" />
                <p className="text-blue-400 font-bold">Waiting for opponent...</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Forfeit Confirmation Dialog */}
      <Dialog open={showConfirmForfeit} onOpenChange={setShowConfirmForfeit}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Forfeit Match?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 mb-4">Are you sure you want to forfeit? Your opponent will be declared the winner.</p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowConfirmForfeit(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowConfirmForfeit(false);
                handleForfeit();
              }}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Forfeit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Match Complete!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-cyan-400" />
            </div>
            <p className="text-xl font-semibold text-white mb-2">You Won!</p>
            <p className="text-gray-400 mb-6">
              {match?.player1_legs_won} - {match?.player2_legs_won}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Your Average</p>
                <p className="text-cyan-400 font-bold text-xl">{myAverage}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Darts Thrown</p>
                <p className="text-white font-bold text-xl">{myDartsThrown}</p>
              </div>
            </div>

            <Button
              onClick={() => navigateTo('play')}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              Back to Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
