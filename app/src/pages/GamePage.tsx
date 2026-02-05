import { useState } from 'react';
import { useNavigationStore, useGameStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, RotateCcw, Trash2, Target, Wifi, Video, Mic, Trophy } from 'lucide-react';

// Checkout suggestions for common scores
const checkoutSuggestions: Record<number, string> = {
  170: 'T20 T20 Bull', 167: 'T20 T19 Bull', 164: 'T20 T18 Bull', 161: 'T20 T17 Bull',
  160: 'T20 T20 D20', 158: 'T20 T20 D19', 157: 'T20 T19 D20', 156: 'T20 T20 D18',
  155: 'T20 T19 D19', 154: 'T20 T18 D20', 153: 'T20 T19 D18', 152: 'T20 T20 D16',
  151: 'T20 T17 D20', 150: 'T20 T18 D18', 149: 'T20 T19 D16', 148: 'T20 T20 D14',
  147: 'T20 T17 D18', 146: 'T20 T18 D16', 145: 'T20 T15 D20', 144: 'T20 T20 D12',
  143: 'T20 T17 D16', 142: 'T20 T14 D20', 141: 'T20 T19 D12', 140: 'T20 T20 D10',
  139: 'T20 T13 D20', 138: 'T20 T18 D12', 137: 'T20 T15 D16', 136: 'T20 T20 D8',
  135: 'T20 T17 D12', 134: 'T20 T14 D16', 133: 'T20 T19 D8', 132: 'T20 T16 D12',
  131: 'T20 T13 D16', 130: 'T20 T20 D5', 129: 'T19 T16 D12', 128: 'T20 T20 D4',
  127: 'T20 T17 D8', 126: 'T19 T19 D6', 125: 'T20 T19 D4', 124: 'T20 T16 D8',
  123: 'T20 T13 D12', 122: 'T18 T18 D7', 121: 'T20 T15 D8', 120: 'T20 20 D20',
  119: 'T19 T12 D13', 118: 'T20 18 D20', 117: 'T20 17 D20', 116: 'T20 16 D20',
  115: 'T20 15 D20', 114: 'T20 14 D20', 113: 'T20 13 D20', 112: 'T20 12 D20',
  111: 'T20 19 D16', 110: 'T20 18 D16', 109: 'T20 17 D16', 108: 'T20 16 D16',
  107: 'T20 15 D16', 106: 'T20 14 D16', 105: 'T20 13 D16', 104: 'T20 12 D16',
  103: 'T20 11 D16', 102: 'T20 10 D16', 101: 'T20 9 D16', 100: 'T20 20 D20',
  99: 'T19 10 D16', 98: 'T20 8 D15', 97: 'T19 10 D15', 96: 'T20 16 D20',
  95: 'T19 10 D14', 94: 'T18 16 D20', 93: 'T19 10 D13', 92: 'T20 12 D20',
  91: 'T17 14 D16', 90: 'T20 10 D20', 89: 'T19 10 D11', 88: 'T16 16 D20',
  87: 'T17 10 D16', 86: 'T18 10 D16', 85: 'T15 10 D20', 84: 'T16 16 D16',
  83: 'T17 6 D16', 82: 'T14 20 D15', 81: 'T15 6 D18', 80: 'T20 D20',
  79: 'T13 10 D16', 78: 'T18 D12', 77: 'T15 6 D16', 76: 'T20 D8',
  75: 'T15 D15', 74: 'T14 D16', 73: 'T19 D8', 72: 'T12 D18',
  71: 'T13 D16', 70: 'T20 D5', 69: 'T19 D6', 68: 'T20 D4',
  67: 'T17 D8', 66: 'T10 D18', 65: 'T19 D4', 64: 'T16 D8',
  63: 'T13 D12', 62: 'T10 D16', 61: 'T15 D8', 60: '20 D20',
  59: '19 D20', 58: '18 D20', 57: '17 D20', 56: '16 D20',
  55: '15 D20', 54: '14 D20', 53: '13 D20', 52: '12 D20',
  51: '11 D20', 50: '10 D20', 49: '9 D20', 48: '16 D16',
  47: '15 D16', 46: '14 D16', 45: '13 D16', 44: '12 D16',
  43: '11 D16', 42: '10 D16', 41: '9 D16', 40: 'D20',
  39: '7 D16', 38: 'D19', 37: '5 D16', 36: 'D18',
  35: '3 D16', 34: 'D17', 33: '1 D16', 32: 'D16',
  31: '7 D12', 30: 'D15', 29: '13 D8', 28: 'D14',
  27: '11 D8', 26: 'D13', 25: '9 D8', 24: 'D12',
  23: '7 D8', 22: 'D11', 21: '5 D8', 20: 'D10',
  19: '3 D8', 18: 'D9', 17: '1 D8', 16: 'D8',
  15: '7 D4', 14: 'D7', 13: '5 D4', 12: 'D6',
  11: '3 D4', 10: 'D5', 9: '1 D4', 8: 'D4',
  7: '3 D2', 6: 'D3', 5: '1 D2', 4: 'D2',
  3: '1 D1', 2: 'D1',
};

export function GamePage() {
  const { navigateTo } = useNavigationStore();
  const { 
    currentMatch, 
    gameMode,
    currentScore,
    currentVisit,
    player1Legs,
    player2Legs,
    isPlayerTurn,
    player1DartsThrown,
    player2DartsThrown,
    player1TotalScore,
    player2TotalScore,
    submitScore,
    submitVisit,
    clearCurrentVisit,
    removeLastDart,
    switchTurn,
    winLeg,
    endGame,
    resetGame
  } = useGameStore();

  const [scoreInput, setScoreInput] = useState('');
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [activeMultiplier, setActiveMultiplier] = useState<'single' | 'double' | 'treble'>('single');

  const opponent = currentMatch?.player2;
  const startingScore = parseInt(currentMatch?.settings.mode || '501');
  const legsNeeded = Math.ceil((currentMatch?.settings.legs || 3) / 2);

  // Calculate averages
  const playerAvg = player1DartsThrown > 0 ? (player1TotalScore / (player1DartsThrown / 3)).toFixed(1) : '0.0';
  const opponentAvg = player2DartsThrown > 0 ? (player2TotalScore / (player2DartsThrown / 3)).toFixed(1) : '0.0';

  const handleNumberClick = (num: number) => {
    let score = num;
    if (activeMultiplier === 'double') score *= 2;
    if (activeMultiplier === 'treble') score *= 3;
    
    const newRemaining = currentScore - score;
    
    // Check for bust
    if (newRemaining < 0 || newRemaining === 1 || (newRemaining === 0 && currentMatch?.settings.doubleOut === 'on' && activeMultiplier !== 'double')) {
      submitVisit();
      switchTurn();
      return;
    }
    
    submitScore(score);
    
    // Check for win
    if (newRemaining === 0) {
      if (currentMatch?.settings.doubleOut === 'off' || activeMultiplier === 'double') {
        winLeg(currentMatch?.player1.id || '1');
        if (player1Legs + 1 >= legsNeeded) {
          setShowResultDialog(true);
        }
      }
    }
    
    // Auto-submit visit after 3 darts
    const dartsThrown = (currentVisit.dart1 !== null ? 1 : 0) + (currentVisit.dart2 !== null ? 1 : 0) + (currentVisit.dart3 !== null ? 1 : 0);
    if (dartsThrown >= 2) {
      setTimeout(() => {
        submitVisit();
        switchTurn();
      }, 500);
    }
  };

  const handleSubmitScore = () => {
    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0 || score > 180) return;
    
    const newRemaining = currentScore - score;
    
    if (newRemaining < 0 || newRemaining === 1) {
      submitVisit();
      switchTurn();
      setScoreInput('');
      return;
    }
    
    submitScore(score);
    setScoreInput('');
    
    if (newRemaining === 0) {
      winLeg(currentMatch?.player1.id || '1');
      if (player1Legs + 1 >= legsNeeded) {
        setShowResultDialog(true);
      }
    }
  };

  const handleForfeit = () => {
    endGame();
    navigateTo('dashboard');
  };

  const handleReturnToDashboard = () => {
    resetGame();
    navigateTo('dashboard');
  };

  const checkoutSuggestion = checkoutSuggestions[currentScore] || null;

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No active game</p>
          <Button onClick={() => navigateTo('play')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Find a Match
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1117] border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleForfeit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Forfeit
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium uppercase">
            {gameMode === 'quick' ? 'Quick Match' : gameMode === 'ranked' ? 'Ranked Match' : 'Private Match'}
          </span>
          <div className="flex items-center gap-2 text-gray-400">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Connected</span>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-white font-bold uppercase tracking-wider">
            Best of {currentMatch.settings.legs}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left - Camera Feed - 50% width */}
        <div className="w-1/2 p-4">
          <Card className="h-full bg-[#111827] border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Camera</span>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <span>Disconnected</span>
                <Video className="w-4 h-4" />
                <Mic className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-center h-[calc(100%-50px)] bg-black">
              <div className="text-center">
                <Target className="w-24 h-24 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Camera feed will appear here</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right - Scoreboard & Controls - 50% width */}
        <div className="w-1/2 p-4 space-y-4">
          {/* Scoreboard */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 */}
            <Card className={`bg-[#111827] border-2 ${isPlayerTurn ? 'border-emerald-500' : 'border-gray-800'} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-base font-bold">
                    Y
                  </div>
                  <span className="text-white font-medium text-lg">You</span>
                </div>
                {isPlayerTurn && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                    Your Turn
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-7xl font-bold text-white">{currentScore}</p>
                <p className="text-gray-400 text-sm">Remaining</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-5 text-center">
                <div>
                  <p className="text-gray-400 text-xs">Avg</p>
                  <p className="text-emerald-400 font-semibold text-lg">{playerAvg}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Last</p>
                  <p className="text-emerald-400 font-semibold text-lg">{currentVisit.total || '-'}</p>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-3">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Darts</p>
                  <p className="text-emerald-400 font-semibold text-lg">{player1DartsThrown}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Legs</p>
                  <p className="text-emerald-400 font-semibold text-lg">{player1Legs}</p>
                </div>
              </div>
            </Card>

            {/* Player 2 */}
            <Card className={`bg-[#111827] border-2 ${!isPlayerTurn ? 'border-blue-500' : 'border-gray-800'} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-base font-bold">
                    {opponent?.displayName?.charAt(0) || 'O'}
                  </div>
                  <span className="text-white font-medium text-lg">{opponent?.displayName || 'Opponent'}</span>
                </div>
                {!isPlayerTurn && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                    Their Turn
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-7xl font-bold text-white">{startingScore}</p>
                <p className="text-gray-400 text-sm">Remaining</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-5 text-center">
                <div>
                  <p className="text-gray-400 text-xs">Avg</p>
                  <p className="text-blue-400 font-semibold text-lg">{opponentAvg}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Last</p>
                  <p className="text-blue-400 font-semibold text-lg">-</p>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-3">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Darts</p>
                  <p className="text-blue-400 font-semibold text-lg">{player2DartsThrown}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Legs</p>
                  <p className="text-blue-400 font-semibold text-lg">{player2Legs}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Score Input */}
          <Card className="bg-[#111827] border-gray-800 p-5">
            <p className="text-gray-400 text-sm mb-2">TYPE SCORE (0-180)</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                placeholder="0-180"
                className="flex-1 py-4 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500 text-lg"
              />
              <Button 
                onClick={handleSubmitScore}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
              >
                Submit
              </Button>
            </div>
          </Card>

          {/* Current Visit */}
          <Card className="bg-[#111827] border-gray-800 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">CURRENT VISIT</p>
              <p className="text-emerald-400 font-bold">{currentVisit.total}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 py-4 px-4 rounded-lg bg-gray-800 text-center">
                <span className="text-white text-lg">{currentVisit.dart1 || '-'}</span>
              </div>
              <div className="flex-1 py-4 px-4 rounded-lg bg-gray-800 text-center">
                <span className="text-white text-lg">{currentVisit.dart2 || '-'}</span>
              </div>
              <div className="flex-1 py-4 px-4 rounded-lg bg-gray-800 text-center">
                <span className="text-white text-lg">{currentVisit.dart3 || '-'}</span>
              </div>
              <button 
                onClick={removeLastDart}
                className="p-4 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={clearCurrentVisit}
                className="p-4 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </Card>

          {/* Checkout Suggestion */}
          {checkoutSuggestion && (
            <Card className="bg-blue-500/10 border-blue-500/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">CHECKOUT</span>
              </div>
              <p className="text-white font-semibold">{checkoutSuggestion}</p>
            </Card>
          )}

          {/* Number Pad */}
          <Card className="bg-[#111827] border-gray-800 p-5">
            {/* Multipliers */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => setActiveMultiplier('single')}
                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                  activeMultiplier === 'single'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Singles
              </button>
              <button
                onClick={() => setActiveMultiplier('double')}
                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                  activeMultiplier === 'double'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Doubles (x2)
              </button>
              <button
                onClick={() => setActiveMultiplier('treble')}
                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                  activeMultiplier === 'treble'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Trebles (x3)
              </button>
              <button
                onClick={() => handleNumberClick(50)}
                className="py-3 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all"
              >
                Bulls
              </button>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-5 gap-2">
              {[...Array(20)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleNumberClick(i + 1)}
                  className="py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors font-medium"
                >
                  {activeMultiplier === 'double' ? `D${i + 1}` : activeMultiplier === 'treble' ? `T${i + 1}` : i + 1}
                </button>
              ))}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={clearCurrentVisit}
                className="py-3 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  submitVisit();
                  switchTurn();
                }}
                className="py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              >
                Submit Visit
              </button>
              <button
                onClick={() => handleNumberClick(0)}
                className="py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Bust
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Match Complete!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-emerald-400" />
            </div>
            <p className="text-xl font-semibold text-white mb-2">You Won!</p>
            <p className="text-gray-400 mb-6">{player1Legs} - {player2Legs}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Your Average</p>
                <p className="text-emerald-400 font-bold text-xl">{playerAvg}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Darts Thrown</p>
                <p className="text-white font-bold text-xl">{player1DartsThrown}</p>
              </div>
            </div>

            <Button 
              onClick={handleReturnToDashboard}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
